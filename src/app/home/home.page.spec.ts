import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { AdifService } from '../services/adif.service';
import { signal } from '@angular/core';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    const adifSpy = { 
      trains: signal([]), 
      stationName: signal('Madrid'),
      activeFilters: signal(['CERCANÍAS', 'AVE', 'AVANT', 'ALVIA', 'OUIGO', 'IRYO', 'INTERCITY', 'TRENHOTEL', 'REGIONAL', 'MD'])
    };

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [{ provide: AdifService, useValue: adifSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
