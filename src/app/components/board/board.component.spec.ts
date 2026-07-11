import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { AdifService } from '../../services/adif.service';
import { signal } from '@angular/core';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    const mockTrains = [
      { class_stop: 'origin', company: 'Renfe' },
      { class_stop: 'destination', company: 'Ouigo' },
      { class_stop: 'intermediate', company: 'Iryo' }
    ];
    const adifSpy = {  
      trains: signal(mockTrains), 
      stationName: signal('Madrid'),
      activeFilters: signal(['CERCANÍAS', 'AVE', 'AVANT', 'ALVIA', 'OUIGO', 'IRYO', 'INTERCITY', 'TRENHOTEL', 'REGIONAL', 'MD']),
      stationDictionary: { '60000': 'Madrid Atocha' }
    };

    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [{ provide: AdifService, useValue: adifSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle type', () => {
    component.toggleType();
    expect(component.filterType()).toBe('llegadas');
    component.toggleType();
    expect(component.filterType()).toBe('salidas');
  });

  it('should filter trains for salidas', () => {
    component.filterType.set('salidas');
    const trains = component.visibleTrains();
    expect(trains.length).toBe(2);
    expect(trains[0].company).toBe('Renfe');
  });

  it('should filter trains for llegadas', () => {
    component.filterType.set('llegadas');
    const trains = component.visibleTrains();
    expect(trains.length).toBe(2);
    expect(trains[0].company).toBe('Ouigo');
  });
});
