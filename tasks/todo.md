- [ ] Task 1: Modificar el modelo de datos.
  - Acceptance: `radardetrenes.com` response mapping is defined.
  - Verify: Reviso el JSON de radar y adapto la interfaz actual.
  - Files: `src/app/models/train.model.ts` o similares.

- [ ] Task 2: Refactorizar `adif.service.ts`.
  - Acceptance: El servicio ya no usa `SignalR` sino `HttpClient`. Hace peticiones a la API de Radar y mapea la respuesta.
  - Verify: El código de `startConnection` es eliminado y reemplazado por `fetchBoard`.
  - Files: `src/app/services/adif.service.ts`

- [ ] Task 3: Refactorizar la lógica de UI / Polling.
  - Acceptance: El componente `board` llama al servicio de Radar, actualizando la vista cada 30 segundos.
  - Verify: Comprobar visualmente que el spinner desaparece tras la primera carga y los datos se ven.
  - Files: `src/app/components/board/board.component.ts` / `html` y `src/app/home/home.page.ts`.

- [ ] Task 4: Limpieza de dependencias.
  - Acceptance: `@microsoft/signalr` es desinstalado y el package.json queda limpio.
  - Verify: Correr `npm uninstall @microsoft/signalr` y comprobar que la app compila sin errores.
  - Files: `package.json`, `package-lock.json`
