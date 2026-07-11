import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class AdifService {
  private hubConnection: signalR.HubConnection | undefined;
  
  // Signals para un estado reactivo moderno (Angular 16+)
  public connected = signal<boolean>(false);
  public trains = signal<any[]>([]);

  constructor() {}

  public async startConnection(stationCode: string = '60000') { // 60000 = Atocha aprox. o un nombre.
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://info.adif.es/InfoStation', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      }) // Saltamos la negociación HTTP para evitar CORS y forzamos WebSockets puros
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('✅ Conectado a ADIF SignalR exitosamente.');
      this.connected.set(true);
      
      this.registerEvents();
      
      // ADIF requiere unirse al 'Topic' (el código de la estación con prefijo PRO-ECM-, p. ej. 'PRO-ECM-60000' para Atocha)
      // y solicitar explícitamente el último mensaje para pintar la pantalla inicial.
      const topic = `PRO-ECM-${stationCode}`;
      await this.hubConnection.invoke('JoinInfo', topic);
      await this.hubConnection.invoke('GetLastMessage', topic);
      console.log(`📡 Suscrito a la estación (Topic): ${topic}`);
      
    } catch (err) {
      console.error('❌ Error al conectar a ADIF SignalR:', err);
      this.connected.set(false);
    }
  }

  private registerEvents() {
    if (!this.hubConnection) return;

    // 'ReceiveMessage' es el evento principal que usa ADIF para enviar las actualizaciones JSON
    this.hubConnection!.on('ReceiveMessage', (data: any) => {
      try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
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
