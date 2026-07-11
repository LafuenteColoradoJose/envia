import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon, IonMenu, IonMenuToggle
} from '@ionic/angular/standalone';
import { BoardComponent } from '../components/board/board.component';
import { ConfigPanelComponent } from '../components/config-panel/config-panel.component';
import { addIcons } from 'ionicons';
import { optionsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon, IonMenu, IonMenuToggle,
    BoardComponent, ConfigPanelComponent
  ],
})
export class HomePage {
  constructor() {
    addIcons({ optionsOutline });
  }
}
