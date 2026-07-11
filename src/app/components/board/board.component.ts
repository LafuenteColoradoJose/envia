import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonSegment, IonSegmentButton, IonLabel, 
  IonList, IonItem, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle
} from '@ionic/angular/standalone';
import { AdifService } from '../../services/adif.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonSegment, IonSegmentButton, IonLabel, 
    IonList, IonItem, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle
  ]
})
export class BoardComponent implements OnInit {
  public filterType = signal<'salidas' | 'llegadas'>('salidas');
  
  // Computamos los trenes filtrados dinámicamente: L = Salidas, R = Llegadas
  public visibleTrains = computed(() => {
    const filterKey = this.filterType() === 'salidas' ? 'L' : 'R';
    return this.adif.trains().filter(t => t.traffic_type === filterKey);
  });

  constructor(public adif: AdifService) { }

  ngOnInit() {}

  segmentChanged(event: any) {
    this.filterType.set(event.detail.value);
  }
}
