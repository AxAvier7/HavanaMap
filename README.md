# HavanaMap

Mapa interactivo de **La Habana, Cuba** que funciona sin conexión a internet después de la primera carga.

## Características

- Mapa **recortado al rectángulo de La Habana** (provincia): no permite navegar fuera de esa zona
- Zoom mediante botones (+ / -) y rueda del mouse
- **El usuario elige el nivel de detalle a descargar** (zoom máximo 13–17) mediante un selector
- Usa Leaflet 1.9.4 (incluido localmente, sin dependencias externas)
- **Descarga completa de La Habana**: guarda en el navegador todos los tiles del rectángulo hasta el nivel elegido, para usarlos sin conexión

## Requisitos

- [Visual Studio Code](https://code.visualstudio.com/)
- Extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- Conexión a internet **solo en la primera carga** (para descargar los tiles del mapa)

## Cómo ejecutar

1. Clona el repositorio:

   ```
   git clone https://github.com/AxAvier7/HavanaMap.git
   ```

2. Abre la carpeta en VS Code:

   ```
   code HavanaMap
   ```

3. Instala la extensión **Live Server** si aún no la tienes (Marketplace: Ctrl+Shift+X y busca "Live Server").

4. Haz clic derecho sobre el archivo `index.html` y selecciona **"Open with Live Server"**.

5. Se abrirá el navegador con el mapa. En la esquina superior izquierda hay un selector **"Descargar mapa hasta el zoom"** donde eliges el nivel de detalle:

   - **13–15**: descarga más rápida (menos tiles).
   - **16** (por defecto): detalle completo de calles y manzanas.
   - **17**: máximo detalle, pero la descarga es pesada.

   La elección se guarda entre sesiones. En la esquina superior derecha verás el estado de la descarga:

   - **Punto naranja parpadeante + barra** → descargando (porcentaje y nº de tiles).
   - **Punto verde** → mapa descargado y listo para usar sin conexión.

   Cuando la descarga termina, el panel de descarga se **minimiza automáticamente** (solo queda el título "Descargar mapa"); haz clic sobre él o en el botón `+` para reexpandirlo y cambiar el nivel.

6. Cuando el indicador se ponga verde, puedes desconectarte. El zoom máximo del mapa coincide con el nivel descargado.

## Ajustes

En `index.html` puedes modificar las constantes:

| Constante            | Descripción                                          |
| -------------------- | ---------------------------------------------------- |
| `HAVANA_BOUNDS`      | Rectángulo que cubre La Habana (sur/oeste, norte/este) |
| `MIN_ZOOM`           | Nivel de zoom mínimo                                 |
| `MAX_DOWNLOAD_ZOOM`  | Nivel de zoom máximo descargable (17)                |

## Estructura del proyecto

```
HavanaMap/
├── index.html          # Página principal
├── offline.js          # Lógica de caché de tiles (IndexedDB)
├── lib/leaflet/       # Librería Leaflet local (JS, CSS, imágenes)
└── README.md           # Este archivo
```

## Notas

- La primera ejecución requiere internet para descargar los tiles de OpenStreetMap; la librería Leaflet viene incluida en el proyecto.
- Los datos del mapa provienen de [OpenStreetMap](https://www.openstreetmap.org/copyright).