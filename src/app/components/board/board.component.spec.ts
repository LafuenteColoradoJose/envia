import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { AdifService } from '../../services/adif.service';
import { signal } from '@angular/core';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(waitForAsync(() => {
    const mockTrains = [
      { traffic_type: 'L', company: 'Renfe' },
      { traffic_type: 'R', company: 'Ouigo' },
      { traffic_type: 'L', company: 'Iryo' }
    ];
    const adifSpy = { trains: signal(mockTrains) };

    TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [{ provide: AdifService, useValue: adifSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change segment', () => {
    component.segmentChanged({ detail: { value: 'llegadas' } });
    expect(component.filterType()).toBe('llegadas');
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
    expect(trains.length).toBe(1);
    expect(trains[0].company).toBe('Ouigo');
  });
});
