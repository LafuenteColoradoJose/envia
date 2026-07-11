import { TestBed } from '@angular/core/testing';
import { AdifService } from './adif.service';
import * as signalR from '@microsoft/signalr';

describe('AdifService', () => {
  let service: AdifService;
  let hubConnectionSpy: jasmine.SpyObj<signalR.HubConnection>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdifService);
    
    hubConnectionSpy = jasmine.createSpyObj('HubConnection', ['start', 'on', 'invoke']);
    hubConnectionSpy.start.and.returnValue(Promise.resolve());
    hubConnectionSpy.invoke.and.returnValue(Promise.resolve());
    
    spyOn(signalR.HubConnectionBuilder.prototype, 'build').and.returnValue(hubConnectionSpy);
    spyOn(signalR.HubConnectionBuilder.prototype, 'withUrl').and.callThrough();
    spyOn(signalR.HubConnectionBuilder.prototype, 'withAutomaticReconnect').and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to signalR successfully', async () => {
    await service.startConnection('12345');
    expect(hubConnectionSpy.start).toHaveBeenCalled();
    expect(service.connected()).toBeTrue();
    expect(hubConnectionSpy.invoke).toHaveBeenCalledWith('JoinInfo', 'PRO-ECM-12345');
    expect(hubConnectionSpy.invoke).toHaveBeenCalledWith('GetLastMessage', 'PRO-ECM-12345');
  });

  it('should handle signalR connection error', async () => {
    hubConnectionSpy.start.and.returnValue(Promise.reject('error'));
    await service.startConnection();
    expect(service.connected()).toBeFalse();
  });

  it('should register events and parse incoming JSON', async () => {
    await service.startConnection();
    expect(hubConnectionSpy.on).toHaveBeenCalledWith('ReceiveMessage', jasmine.any(Function));
    
    const callback = hubConnectionSpy.on.calls.argsFor(0)[1];
    
    // Parse valid json string
    const mockDataStr = JSON.stringify({ trains: [{ id: 1 }, { id: 2 }] });
    callback(mockDataStr);
    expect(service.trains().length).toBe(2);
    
    // Parse object directly
    const mockDataObj = { trains: [{ id: 3 }] };
    callback(mockDataObj);
    expect(service.trains().length).toBe(1);
    
    // Handle invalid json smoothly
    callback('invalid json');
    expect(service.trains().length).toBe(1); // remain unchanged
  });
});
