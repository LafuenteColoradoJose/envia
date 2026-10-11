# Plan de Implementación: Migración a API Radar de Trenes

## 1. Análisis y Mapeo
* Inspeccionar los modelos de datos actuales (`src/app/models/`).
* Comparar la estructura devuelta por `radardetrenes.com/api/v1` con nuestra interfaz de datos.
* Decidir qué propiedades del JSON de Radar se asignan a nuestro modelo actual para minimizar cambios en el HTML (`board.component.html`).

## 2. Refactorización del Servicio
* Modificar `src/app/services/adif.service.ts`.
* Eliminar todo el código relacionado con WebSockets y SignalR (`HubConnectionBuilder`, `on("ReceiveMessage")`, etc.).
* Inyectar `HttpClient` de Angular y crear un método HTTP `getStationBoard(stationCode)` para consultar el endpoint `https://radardetrenes.com/api/v1/stations/{stationCode}/board-renfe`.

## 3. Lógica de Refresco (Polling)
* Implementar un bucle de refresco (usando `RxJS timer/interval` o un `setInterval`) que llame al nuevo endpoint cada 30 segundos.
* Asegurar que el estado "Cargando..." solo se muestre en la primera petición y no en cada refresco (para no molestar visualmente).

## 4. Limpieza del Proyecto
* Eliminar dependencias innecesarias de `package.json` (`@microsoft/signalr`).

## Riesgos y Mitigación
* **Retraso de caché:** La API de Radar puede tener cierto retraso. Mitigación: Informado y aceptado por el usuario.
* **Fallos de conexión:** Manejar errores HTTP 5xx o 429 para no romper la app, mostrando mensajes amigables.
