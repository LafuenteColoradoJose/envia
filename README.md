<div align="center">
  <h1>🚆 EnVía</h1>
  <p><strong>Paneles de Salidas y Llegadas de ADIF en Tiempo Real</strong></p>
  
  [![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
  [![Ionic](https://img.shields.io/badge/Ionic-%233880FF.svg?style=for-the-badge&logo=Ionic&logoColor=white)](https://ionicframework.com/)
  [![SignalR](https://img.shields.io/badge/SignalR-5C2D91?style=for-the-badge&logo=microsoft&logoColor=white)](#)
  [![Test Coverage](https://img.shields.io/badge/Coverage-93%25-brightgreen.svg?style=for-the-badge)](#)
</div>

---

## 📖 Sobre el Proyecto

**EnVía** es una Progressive Web App (PWA) moderna y de alto rendimiento diseñada para consultar en **tiempo real** los paneles de información de trenes de la red de ADIF (España).

A diferencia de otras aplicaciones que consumen APIs REST tradicionales con retraso o utilizan *iframes* incrustados, EnVía se conecta de forma directa a los servidores oficiales mediante **WebSockets (SignalR)**. Esto permite procesar el JSON crudo en un servicio Angular y renderizar la información de manera nativa, consiguiendo una latencia mínima y una experiencia de usuario fluida y premium.

## ✨ Características Principales

*   **⚡ Datos en Vivo:** Conexión directa al flujo de WebSockets de ADIF. Las vías y los retrasos se actualizan al instante sin necesidad de recargar la página.
*   **📱 Diseño Mobile-First & Responsivo:** 
    *   En dispositivos móviles, la interfaz maximiza el espacio para la lista de trenes, ocultando los filtros en un *Bottom Sheet* nativo interactivo.
    *   En escritorio, la interfaz se expande en un *Grid Layout* cómodo con un panel lateral fijo.
*   **🎨 UI/UX Premium:** Interfaz de alto contraste meticulosamente diseñada. Soporta cambio dinámico entre **Modo Claro** y **Modo Oscuro**.
*   **⚛️ Reactividad Moderna:** Arquitectura basada completamente en los nuevos **Signals de Angular**, sustituyendo el boilerplate tradicional de RxJS por un flujo de estado limpio y predecible.
*   **🧪 Alta Calidad de Código:** Testeado exhaustivamente. La suite de pruebas unitarias (Karma/Jasmine) cubre más del **90%** del código fuente.

## 🛠️ Stack Tecnológico

Este proyecto ha sido desarrollado aplicando los estándares de la industria y las últimas novedades del ecosistema Frontend:

*   **Framework:** Angular 17+ (Uso de *Standalone Components* y *Signals*).
*   **UI/Componentes:** Ionic Framework v8.
*   **Comunicaciones:** `@microsoft/signalr` (WebSockets puros saltando la negociación HTTP para evitar CORS).
*   **Testing:** Karma & Jasmine.
*   **Estilos:** SCSS (Variables CSS dinámicas para theming).



## 🚀 Instalación y Ejecución Local

Para correr el proyecto en tu entorno local:

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo de Ionic/Angular:
   ```bash
   ionic serve
   ```
4. Abre `http://localhost:8100` en tu navegador.

## 🧪 Tests Unitarios

Para comprobar la cobertura de código y ejecutar la suite de tests:

```bash
npm run test -- --code-coverage
```

---

