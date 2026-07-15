import { Component, OnInit, OnDestroy, computed, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSearchbar, IonList, IonItem, IonLabel, IonContent
} from '@ionic/angular/standalone';
import { AdifService } from '../../services/adif.service';
import { addIcons } from 'ionicons';
import { swapVerticalOutline, createOutline, train } from 'ionicons/icons';
import { PopularStations, Stations } from '../../constants/stations';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSearchbar, IonList, IonItem, IonLabel, IonContent
  ]
})
/**
 * Component responsible for displaying the main departure and arrival board.
 * Subscribes to the AdifService to reactively render train updates.
 */
export class BoardComponent implements OnInit, OnDestroy {
  @ViewChild('stationModal') stationModal: any;
  public allStations = Stations;
  public filteredStations = PopularStations;
  public filterType = signal<'salidas' | 'llegadas'>('salidas');
  public currentTime = signal<Date>(new Date());
  private timer: any;
  
  public visibleTrains = computed(() => {
    const isSalidas = this.filterType() === 'salidas';
    const activeKeywords = this.adif.activeFilters();
    
    let filtered = this.adif.trains().filter((t: any) => {
      // Strict ADIF logic to separate Departures from Arrivals
      let matchesDirection = false;
      
      if (isSalidas) {
        // A train is NEVER a departure if this station is its final destination or if it only allows alighting
        if (t.class_stop === 'destination' || t.class_stop === 'alighting_only') {
          matchesDirection = false;
        } else {
          // It is a departure if it has a departure time, or if it is explicitly origin/intermediate
          matchesDirection = !!t.departure_time || t.class_stop === 'origin' || t.class_stop === 'intermediate';
        }
      } else {
        // A train is NEVER an arrival if this station is its origin
        if (t.class_stop === 'origin') {
          matchesDirection = false;
        } else {
          // It is an arrival if it has an arrival time, or if it is explicitly destination/intermediate/alighting_only
          matchesDirection = !!t.arrival_time || t.class_stop === 'destination' || t.class_stop === 'intermediate' || t.class_stop === 'alighting_only';
        }
      }
        
      if (!matchesDirection) return false;
      
      const product = t.commercial_id?.[0]?.product?.toUpperCase() || '';
      if (!product || product === 'TREN') return true;
      
      let matchesProduct = activeKeywords.some((keyword: string) => {
        if (keyword === 'CERCANÍAS') {
          return product.includes('CERCANÍAS') || product.includes('CERMAD') || product.includes('CER') || product.includes('ROD');
        }
        return product.includes(keyword);
      });
      
      if (!matchesProduct) return false;
      
      // Hide trains that have already departed (more than 1 minute in the past)
      const timeStr = isSalidas ? (t.departure_time || t.arrival_time) : (t.arrival_time || t.departure_time);
      if (timeStr) {
        const time = new Date(timeStr).getTime();
        const now = this.currentTime().getTime();
        const diff = (time - now) / 60000;
        if (diff < -1) return false;
      }
      
      return true;
    });

    filtered.sort((a: any, b: any) => {
      const timeAStr = isSalidas ? (a.departure_time || a.arrival_time) : (a.arrival_time || a.departure_time);
      const timeBStr = isSalidas ? (b.departure_time || b.arrival_time) : (b.arrival_time || b.departure_time);
      const timeA = new Date(timeAStr || 0).getTime();
      const timeB = new Date(timeBStr || 0).getTime();
      return timeA - timeB;
    });

    return filtered;
  });

  constructor(public adif: AdifService) { 
    addIcons({ swapVerticalOutline, createOutline, train });
  }

  ngOnInit() {
    this.timer = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * Toggles the board filter between departures ('salidas') and arrivals ('llegadas').
   */
  toggleType() {
    this.filterType.set(this.filterType() === 'salidas' ? 'llegadas' : 'salidas');
  }

  /**
   * Determines the accessible text color (black or white) based on the badge background.
   * @param bgColor The hex background color
   * @returns '#000000' for light backgrounds, '#ffffff' for dark ones
   */
  getTrainBadgeTextColor(bgColor: string): string {
    const lightColors = ['#f37021', '#00d2ff', '#888'];
    return lightColors.includes(bgColor) ? '#000000' : '#ffffff';
  }

  /**
   * Determines the brand color for a given train company and product type.
   * @param company The train operating company
   * @param product The commercial product type of the train
   * @returns A hex color string
   */
  getTrainBadgeColor(company: string, product: string): string {
    const lowerCo = company?.toLowerCase() || '';
    const lowerPr = product?.toLowerCase() || '';
    if (lowerPr.includes('ave') || lowerCo.includes('ave')) return '#7e2d68'; 
    if (lowerPr.includes('alvia') || lowerCo.includes('alvia')) return '#7e2d68'; 
    // Utilizamos #cc0026 en lugar del #e4002b original de Cercanías para asegurar un contraste WCAG AA > 4.5:1 con texto blanco
    if (lowerPr.includes('cercanías') || lowerCo.includes('cercanías') || lowerPr.includes('cer') || lowerPr.includes('rod')) return '#cc0026'; 
    if (lowerPr.includes('avant')) return '#f37021'; 
    if (lowerCo.includes('iryo')) return '#da251d'; 
    if (lowerCo.includes('ouigo')) return '#00d2ff'; 
    return '#888'; 
  }

  /**
   * Normalizes the product name for display purposes.
   * @param product The raw product name from the API
   * @returns The normalized product name
   */
  getCleanProduct(product: string): string {
    if (!product) return '';
    const upper = product.toUpperCase();
    if (upper.includes('CER') || upper.includes('ROD')) {
      return 'CERCANÍAS';
    }
    return upper;
  }

  getCercaniasLine(product: string): string | null {
    if (!product) return null;
    const upper = product.toUpperCase();
    if (upper.includes('CER') || upper.includes('ROD')) {
      const match = upper.match(/^(C0?\d+[A-Z]?)(CER|ROD)/);
      if (match) {
        return match[1].replace('C0', 'C');
      }
      return 'C';
    }
    return null;
  }

  /**
   * Calculates the remaining minutes until a train's departure or arrival.
   * @param timeStr ISO 8601 time string
   * @returns Remaining minutes
   */
  getMinutesLeft(timeStr: string): number {
    if (!timeStr) return 999;
    const time = new Date(timeStr).getTime();
    const now = this.currentTime().getTime();
    const diff = (time - now) / 60000;
    return Math.max(0, Math.round(diff));
  }

  /**
   * Extracts and normalizes the destination or origin station name for a train.
   * @param t The train object from the API
   * @returns The normalized station name
   */
  getStationName(t: any): string {
    const list = this.filterType() === 'salidas' ? t.destinations : t.origins;
    if (!list || list.length === 0) return 'N/A';
    
    const name = list[0].name;
    const code = list[0].code;

    let finalName = name || code || 'N/A';

    // If ADIF sends an empty name, or sends the numeric code itself as the name
    if (!name || name.trim() === '' || /^\d+$/.test(name.trim())) {
      const targetCode = code || name;
      if (targetCode) {
        const paddedCode = String(targetCode).trim().padStart(5, '0');
        finalName = this.adif.stationDictionary[paddedCode] || targetCode;
      }
    }
    
    finalName = finalName.trim();
    
    // Clean up redundant prefixes like the ADIF website does to fit better on screen
    if (finalName.startsWith('Madrid - ')) {
      finalName = finalName.replace('Madrid - ', '');
    }
    if (finalName.startsWith('Madrid-')) {
      finalName = finalName.replace('Madrid-', '');
    }
    if (finalName.startsWith('Madrid ')) {
      finalName = finalName.replace('Madrid ', '');
    }
    if (finalName === 'Príncipe Pío') finalName = 'Príncipe Pío'; // just in case
    if (finalName === 'Alcob.Sseb') finalName = 'Alcobendas-S.S. Reyes';
    if (finalName === 'San Fernando De Henares') finalName = 'San Fernando Henares';
    
    return finalName;
  }

  trackByTrain(index: number, t: any): string {
    // Unique ID based on its train number and destination to prevent Angular from rebuilding the DOM
    const trainNum = t.commercial_id?.[0]?.numbers?.[0] || '';
    const dest = t.destinations?.[0]?.code || '';
    return `${trainNum}-${dest}`;
  }

  openStationModal() {
    this.filteredStations = [...PopularStations];
    this.stationModal?.present();
  }

  closeStationModal() {
    this.stationModal?.dismiss();
  }

  filterStations(event: any) {
    const term = (event.target.value || '').toLowerCase();
    if (!term) {
      this.filteredStations = PopularStations;
      return;
    }
    this.filteredStations = this.allStations
      .filter(s => s.name.toLowerCase().includes(term) || s.code.includes(term))
      .slice(0, 50);
  }

  changeStation(code: string) {
    localStorage.setItem('selectedStation', code);
    this.adif.startConnection(code);
    this.closeStationModal();
  }
}
