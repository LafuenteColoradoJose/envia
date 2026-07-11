import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { AdifService } from './services/adif.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private adif: AdifService) {
    const savedStation = localStorage.getItem('selectedStation') || '60000';
    this.adif.startConnection(savedStation);
  }
}
