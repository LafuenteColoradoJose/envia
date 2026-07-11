import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AdifService } from './services/adif.service';

describe('AppComponent', () => {
  it('should create the app', async () => {
    const adifServiceSpy = jasmine.createSpyObj('AdifService', ['startConnection']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AdifService, useValue: adifServiceSpy }
      ]
    }).compileComponents();
    
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(adifServiceSpy.startConnection).toHaveBeenCalled();
  });
});
