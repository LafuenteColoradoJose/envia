import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonLabel, IonChip, IonSegment, IonSegmentButton, IonIcon, IonButton, MenuController, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/angular/standalone';
import { AdifService } from '../../services/adif.service';
import { addIcons } from 'ionicons';
import { optionsOutline, trainOutline, filterOutline, colorPaletteOutline, sunnyOutline, moonOutline, checkmarkCircle, closeCircle, globeOutline, logoGithub, logoLinkedin, chevronBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-config-panel',
  templateUrl: './config-panel.component.html',
  styleUrls: ['./config-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonLabel, IonChip, IonSegment, IonSegmentButton, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons]
})
/**
 * Component responsible for displaying the configuration menu.
 * Allows users to change themes and filter train traffic types.
 */
export class ConfigPanelComponent implements OnInit {

  @Input() isDesktop: boolean = false;
  @Output() onCollapse = new EventEmitter<void>();

  public currentTheme: string = 'dark';

  public trafficTypes = [
    { label: 'Cercanías', active: true, keywords: ['CERCANÍAS', 'CERCAN', 'CERC'] },
    { label: 'Alta Velocidad', active: true, keywords: ['AVE', 'AVANT', 'ALVIA', 'OUIGO', 'IRYO'] },
    { label: 'Larga Distancia', active: true, keywords: ['INTERCITY', 'TRENHOTEL'] },
    { label: 'Regional / MD', active: true, keywords: ['REGIONAL', 'MD'] }
  ];

  constructor(public adif: AdifService, private menuCtrl: MenuController) { 
    addIcons({ optionsOutline, trainOutline, filterOutline, colorPaletteOutline, sunnyOutline, moonOutline, checkmarkCircle, closeCircle, globeOutline, logoGithub, logoLinkedin, chevronBackOutline });
  }

  ngOnInit() {
    let theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme');
    
    if (!theme) {
      theme = 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } else if (!document.documentElement.getAttribute('data-theme')) {
      // Ensure the attribute is in the HTML if it came from localStorage
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    this.currentTheme = theme;
  }

  async closeModal() {
    try {
      await this.menuCtrl.close('config-menu');
    } catch(e) {
    }
  }

  /**
   * Applies a specific theme to the application and saves it to local storage.
   * @param theme The theme name ('dark' or 'light')
   */
  toggleTheme(theme: string) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  themeChanged(event: any) {
    this.toggleTheme(event.detail.value);
  }

  /**
   * Toggles the active state of a traffic filter and updates the global service state.
   * @param t The traffic type object to toggle
   */
  toggleTraffic(t: any) {
    t.active = !t.active;
    this.updateTrafficFilters();
  }

  private updateTrafficFilters() {
    const activeKeywords = this.trafficTypes
      .filter((t: any) => t.active)
      .map((t: any) => t.keywords)
      .reduce((acc: string[], val: string[]) => acc.concat(val), []);
    this.adif.activeFilters.set(activeKeywords);
  }
}
