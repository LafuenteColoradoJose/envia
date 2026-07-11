import { Injectable, signal, WritableSignal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Stations, PopularStations } from '../constants/stations';

@Injectable({
  providedIn: 'root',
})
export class AdifService {
  private hubConnection: signalR.HubConnection | undefined;
  private currentTopic: string | null = null;
  
  // Signals para un estado reactivo moderno (Angular 16+)
  public connected = signal<boolean>(false);
  public trains: WritableSignal<any[]> = signal([]);
  public stationName: WritableSignal<string> = signal('');
  public activeFilters: WritableSignal<string[]> = signal(['CERCANÍAS', 'AVE', 'AVANT', 'ALVIA', 'OUIGO', 'IRYO', 'INTERCITY', 'TRENHOTEL', 'REGIONAL', 'MD']);
  
  public stationDictionary: Record<string, string> = {};

  constructor() {
    // Inicializar el diccionario desde el array gigante y los populares
    [...PopularStations, ...Stations].forEach(s => {
      this.stationDictionary[s.code] = s.name;
    });
  }

  private isConnecting: boolean = false;

  public async startConnection(stationCode: string = '60000') { // 60000 = Atocha
    // Prevenir condiciones de carrera si se llama varias veces rápido
    while (this.isConnecting) {
      await new Promise(r => setTimeout(r, 100));
    }
    this.isConnecting = true;

    try {
      // Inicializar conexión solo la primera vez
      if (!this.hubConnection) {
        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl('https://info.adif.es/InfoStation', {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
          }) // Saltamos la negociación HTTP para evitar CORS y forzamos WebSockets puros
          .withAutomaticReconnect()
          .build();

        this.registerEvents();

        this.hubConnection.onreconnected(async () => {
          console.log('🔄 Reconectado automáticamente a SignalR.');
          if (this.currentTopic) {
            try {
              await this.hubConnection?.invoke('JoinInfo', this.currentTopic);
              await this.hubConnection?.invoke('GetLastMessage', this.currentTopic);
            } catch (e) {
              console.error('Error al re-unirse tras reconexión', e);
            }
          }
        });

        try {
          await this.hubConnection.start();
          console.log('✅ Conectado a ADIF SignalR exitosamente.');
          this.connected.set(true);
        } catch (err) {
          console.error('❌ Error al conectar a ADIF SignalR:', err);
          this.connected.set(false);
          return;
        }
      }

      const newTopic = `PRO-ECM-${stationCode}`;

      // Si ya estamos suscritos al mismo topic, no hacer nada extra
      if (this.currentTopic === newTopic) {
        return;
      }

      // Si había un topic anterior, abandonarlo
      if (this.currentTopic) {
        try {
          await this.hubConnection.invoke('LeaveInfo', this.currentTopic);
          console.log(`👋 Saliendo de la estación (Topic): ${this.currentTopic}`);
        } catch (e) {
          console.error('Error al salir del topic', e);
        }
      }

      this.currentTopic = newTopic;
      this.trains.set([]); // Limpiar trenes antes de recibir los nuevos
      this.stationName.set('Cargando...');

      // ADIF requiere unirse al 'Topic' (el código de la estación con prefijo PRO-ECM-)
      // y solicitar explícitamente el último mensaje para pintar la pantalla inicial.
      try {
        await this.hubConnection.invoke('JoinInfo', newTopic);
        await this.hubConnection.invoke('GetLastMessage', newTopic);
        console.log(`📡 Suscrito a la estación (Topic): ${newTopic}`);
      } catch (e) {
        console.error('Error uniéndose al nuevo topic', e);
      }
    } finally {
      this.isConnecting = false;
    }
  }

  private registerEvents() {
    if (!this.hubConnection) return;

    // 'ReceiveMessage' es el evento principal que usa ADIF para enviar las actualizaciones JSON
    this.hubConnection.on('ReceiveMessage', (data: any) => {
      try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Bloqueo total de mensajes fantasma: si el mensaje no es para la estación actual, lo destruimos
        if (payload?.station_settings?.code) {
          const expectedCode = this.currentTopic?.replace('PRO-ECM-', '');
          if (payload.station_settings.code !== expectedCode) {
            console.warn(`[FANTASMA] Ignorando datos de ${payload.station_settings.name} (${payload.station_settings.code}) porque esperamos ${expectedCode}`);
            return;
          }
        }

        if (payload && payload.station_settings && payload.station_settings.name) {
          this.stationName.set(payload.station_settings.name);
        }

        if (payload && payload.trains) {
          this.trains.set(payload.trains);
        }
      } catch (e) {
        console.error('Error parseando JSON de ADIF', e);
      }
    });
  }
  
  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.connected.set(false);
    }
  }
}
