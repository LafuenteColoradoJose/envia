import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigPanelComponent } from './config-panel.component';

describe('ConfigPanelComponent', () => {
  let component: ConfigPanelComponent;
  let fixture: ComponentFixture<ConfigPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ConfigPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
