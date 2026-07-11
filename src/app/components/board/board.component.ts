import { Component, OnInit, OnDestroy, computed, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSearchbar, IonList, IonItem, IonLabel, IonContent
} from '@ionic/angular/standalone';
import { AdifService } from '../../services/adif.service';
import { addIcons } from 'ionicons';
import { swapVerticalOutline, createOutline } from 'ionicons/icons';
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
      // Lógica estricta de ADIF para separar Salidas de Llegadas
      let matchesDirection = false;
      
      if (isSalidas) {
        // Un tren NUNCA es una salida si esta estación es su destino final o si solo admite bajada de viajeros
        if (t.class_stop === 'destination' || t.class_stop === 'alighting_only') {
          matchesDirection = false;
        } else {
          // Es salida si tiene hora de salida, o si es origen/intermedio explícitamente
          matchesDirection = !!t.departure_time || t.class_stop === 'origin' || t.class_stop === 'intermediate';
        }
      } else {
        // Un tren NUNCA es una llegada si esta estación es su origen
        if (t.class_stop === 'origin') {
          matchesDirection = false;
        } else {
          // Es llegada si tiene hora de llegada, o si es destino/intermedio/solo bajada explícitamente
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
      
      // Ocultar trenes que ya han salido (más de 1 minuto en el pasado)
      const timeStr = isSalidas ? (t.departure_time || t.arrival_time) : (t.arrival_time || t.departure_time);
      if (timeStr) {
        const time = new Date(timeStr).getTime();
        const now = this.currentTime().getTime();
        const diff = (time - now) / 60000;
        if (diff < -1) return false;
      }
      
      return true;
    });

    // Sort by the relevant time
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
    addIcons({ swapVerticalOutline, createOutline });
  }

  ngOnInit() {
    this.timer = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  toggleType() {
    this.filterType.set(this.filterType() === 'salidas' ? 'llegadas' : 'salidas');
  }

  getTrainBadgeColor(company: string, product: string): string {
    const lowerCo = company?.toLowerCase() || '';
    const lowerPr = product?.toLowerCase() || '';
    if (lowerPr.includes('ave') || lowerCo.includes('ave')) return '#7e2d68'; 
    if (lowerPr.includes('alvia') || lowerCo.includes('alvia')) return '#7e2d68'; 
    if (lowerPr.includes('cercanías') || lowerCo.includes('cercanías') || lowerPr.includes('cer') || lowerPr.includes('rod')) return '#e4002b'; 
    if (lowerPr.includes('avant')) return '#f37021'; 
    if (lowerCo.includes('iryo')) return '#da251d'; 
    if (lowerCo.includes('ouigo')) return '#00d2ff'; 
    return '#888'; 
  }

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

  getMinutesLeft(timeStr: string): number {
    if (!timeStr) return 999;
    const time = new Date(timeStr).getTime();
    const now = this.currentTime().getTime();
    const diff = (time - now) / 60000;
    return Math.max(0, Math.round(diff));
  }

  getStationName(t: any): string {
    const list = this.filterType() === 'salidas' ? t.destinations : t.origins;
    if (!list || list.length === 0) return 'N/A';
    
    const name = list[0].name;
    const code = list[0].code;

    let finalName = name || code || 'N/A';

    // Si ADIF manda nombre vacío, o manda el propio código numérico como nombre
    if (!name || name.trim() === '' || /^\d+$/.test(name.trim())) {
      const targetCode = code || name;
      if (targetCode) {
        const paddedCode = String(targetCode).trim().padStart(5, '0');
        finalName = this.adif.stationDictionary[paddedCode] || targetCode;
      }
    }
    
    finalName = finalName.trim();
    
    // Limpiar prefijos redundantes como hace la web de ADIF para que quepa mejor en pantalla
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
    // ID único basado en su número de tren y destino para evitar que Angular reconstruya el DOM
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
