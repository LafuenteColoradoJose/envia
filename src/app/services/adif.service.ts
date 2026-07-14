import { Injectable, signal, WritableSignal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Stations, PopularStations } from '../constants/stations';

@Injectable({
  providedIn: 'root',
})
/**
 * Service responsible for managing the SignalR connection to the ADIF WebSocket API.
 * Provides real-time train data for a specific station.
 */
export class AdifService {
  private hubConnection: signalR.HubConnection | undefined;
  private currentTopic: string | null = null;
  
  public connected = signal<boolean>(false);
  public trains: WritableSignal<any[]> = signal([]);
  public stationName: WritableSignal<string> = signal('');
  public activeFilters: WritableSignal<string[]> = signal(['CERCANÍAS', 'AVE', 'AVANT', 'ALVIA', 'OUIGO', 'IRYO', 'INTERCITY', 'TRENHOTEL', 'REGIONAL', 'MD']);
  
  public stationDictionary: Record<string, string> = {};

  constructor() {
    [...PopularStations, ...Stations].forEach(s => {
      this.stationDictionary[s.code] = s.name;
    });
  }

  private isConnecting: boolean = false;

  /**
   * Initializes and starts the SignalR connection for a given station.
   * @param stationCode The ADIF station code (e.g., '60000' for Madrid Atocha)
   */
  public async startConnection(stationCode: string = '60000') { // 60000 = Atocha
    // Prevent race conditions if called multiple times in quick succession
    while (this.isConnecting) {
      await new Promise(r => setTimeout(r, 100));
    }
    this.isConnecting = true;

    try {
      if (!this.hubConnection) {
        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl('https://info.adif.es/InfoStation', {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
          }) // Skip HTTP negotiation to avoid CORS and force pure WebSockets
          .withAutomaticReconnect()
          .build();

        this.registerEvents();

        this.hubConnection.onreconnected(async () => {

          if (this.currentTopic) {
            try {
              await this.hubConnection?.invoke('JoinInfo', this.currentTopic);
              await this.hubConnection?.invoke('GetLastMessage', this.currentTopic);
            } catch (e) {
              console.error('Error re-joining after reconnection', e);
            }
          }
        });

        try {
          await this.hubConnection.start();

          this.connected.set(true);
        } catch (err) {
          console.error('❌ Error connecting to ADIF SignalR:', err);
          this.connected.set(false);
          return;
        }
      }

      const newTopic = `PRO-ECM-${stationCode}`;

      if (this.currentTopic === newTopic) {
        return;
      }

      if (this.currentTopic) {
        try {
          await this.hubConnection.invoke('LeaveInfo', this.currentTopic);

        } catch (e) {
          console.error('Error leaving topic', e);
        }
      }

      this.currentTopic = newTopic;
      this.trains.set([]);
      this.stationName.set('Cargando...');

      // ADIF requires joining the 'Topic' (station code with PRO-ECM- prefix)
      // and explicitly request the last message to paint the initial screen.
      try {
        await this.hubConnection.invoke('JoinInfo', newTopic);
        await this.hubConnection.invoke('GetLastMessage', newTopic);

      } catch (e) {
        console.error('Error joining the new topic', e);
      }
    } finally {
      this.isConnecting = false;
    }
  }

  private registerEvents() {
    if (!this.hubConnection) return;

    // 'ReceiveMessage' is the main event used by ADIF to send JSON updates
    this.hubConnection.on('ReceiveMessage', (data: any) => {
      try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Total block of ghost messages: if the message is not for the current station, destroy it
        if (payload?.station_settings?.code) {
          const expectedCode = this.currentTopic?.replace('PRO-ECM-', '');
          if (payload.station_settings.code !== expectedCode) {

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
        console.error('Error parsing ADIF JSON', e);
      }
    });
  }
  
  /**
   * Stops the active SignalR connection and resets the connected state.
   */
  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.connected.set(false);
    }
  }
}
