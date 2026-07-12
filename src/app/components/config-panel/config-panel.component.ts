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
export class ConfigPanelComponent implements OnInit {

  @Input() isDesktop: boolean = false;
  @Output() onCollapse = new EventEmitter<void>();

  public currentTheme: string = 'dark'; // Dark theme is better suited for this board default

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
    // Detectar el tema actual guardado o aplicar el oscuro por defecto
    let theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme');
    
    if (!theme) {
      theme = 'dark'; // Por defecto la app se verá en oscuro (diseño ADIF)
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } else if (!document.documentElement.getAttribute('data-theme')) {
      // Asegurar que el atributo esté en el HTML si venía de localStorage
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    this.currentTheme = theme;
  }

  async closeModal() {
    try {
      await this.menuCtrl.close('config-menu');
    } catch(e) {
      // Ignorar
    }
  }

  toggleTheme(theme: string) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  themeChanged(event: any) {
    this.toggleTheme(event.detail.value);
  }

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
