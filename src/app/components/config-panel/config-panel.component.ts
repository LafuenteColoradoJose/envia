import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonListHeader, IonLabel, IonChip } from '@ionic/angular/standalone';

@Component({
  selector: 'app-config-panel',
  templateUrl: './config-panel.component.html',
  styleUrls: ['./config-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, IonListHeader, IonLabel, IonChip]
})
export class ConfigPanelComponent implements OnInit {

  public companies = ['Renfe', 'Iryo', 'Ouigo', 'Avlo'];

  constructor() { }

  ngOnInit() {}

  toggleTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
