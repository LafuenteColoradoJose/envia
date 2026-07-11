import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonListHeader, IonLabel, IonChip, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonItem, IonSearchbar, IonList, IonIcon, IonButton, MenuController } from '@ionic/angular/standalone';
import { AdifService } from '../../services/adif.service';
import { PopularStations, Stations } from '../../constants/stations';
import { addIcons } from 'ionicons';
import { optionsOutline, trainOutline, filterOutline, colorPaletteOutline, sunnyOutline, moonOutline, checkmarkCircle, closeCircle } from 'ionicons/icons';

@Component({
  selector: 'app-config-panel',
  templateUrl: './config-panel.component.html',
  styleUrls: ['./config-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonListHeader, IonLabel, IonChip, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonItem, IonSearchbar, IonList, IonIcon, IonButton]
})
export class ConfigPanelComponent implements OnInit {

  public companies = ['Renfe', 'Iryo', 'Ouigo', 'Avlo'];
  public currentTheme: string = 'dark'; // Dark theme is better suited for this board default
  public selectedStation: string = localStorage.getItem('selectedStation') || '60000'; // Default Atocha o guardada
  
  public allStations = Stations;
  public filteredStations: any[] = [];

  public trafficTypes = [
    { label: 'Cercanías', active: true, keywords: ['CERCANÍAS', 'CERCAN', 'CERC'] },
    { label: 'Alta Velocidad', active: true, keywords: ['AVE', 'AVANT', 'ALVIA', 'OUIGO', 'IRYO'] },
    { label: 'Larga Distancia', active: true, keywords: ['INTERCITY', 'TRENHOTEL'] },
    { label: 'Regional / MD', active: true, keywords: ['REGIONAL', 'MD'] }
  ];

  constructor(public adif: AdifService, private menuCtrl: MenuController) { 
    addIcons({ optionsOutline, trainOutline, filterOutline, colorPaletteOutline, sunnyOutline, moonOutline, checkmarkCircle, closeCircle });
    this.filteredStations = [...PopularStations];
    
    // Asegurar que la estación seleccionada exista en la vista inicial para que <ion-select> no la borre
    const savedCode = localStorage.getItem('selectedStation');
    if (savedCode && !this.filteredStations.find(s => s.code === savedCode)) {
      const savedStationObj = this.allStations.find(s => s.code === savedCode);
      if (savedStationObj) {
        this.filteredStations.unshift(savedStationObj);
      }
    }
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

  filterStations(event: any) {
    const term = (event.target.value || '').toLowerCase();
    if (!term) {
      this.filteredStations = PopularStations;
      return;
    }
    this.filteredStations = this.allStations
      .filter(s => s.name.toLowerCase().includes(term) || s.code.includes(term))
      .slice(0, 50); // Límite para no saturar el DOM
  }

  changeStation(code: string) {
    this.selectedStation = code;
    localStorage.setItem('selectedStation', code);
    this.adif.startConnection(this.selectedStation);
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
