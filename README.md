# HavanaMap

Mapa interactivo de **La Habana, Cuba** que funciona sin conexión a internet después de la primera carga.

## Características

- Mapa **recortado al rectángulo de La Habana** (provincia): no permite navegar fuera de esa zona
- Zoom mediante botones (+ / -) y rueda del mouse
- **El usuario elige el nivel de detalle a descargar** (zoom máximo 13–17) mediante un selector
- Usa Leaflet 1.9.4 (incluido localmente, sin dependencias externas)
- **Descarga completa de La Habana**: guarda en el navegador todos los tiles del rectángulo hasta el nivel elegido, para usarlos sin conexión

## Formas de abrir la web

El proyecto no necesita instalación. Elige la que prefieras:

### 1. Abrir directo el archivo (la más simple)

Haz **doble clic** en `index.html` o arrástralo a la ventana del navegador. Como la librería Leaflet ya está incluida en el proyecto, el mapa se ve sin ningún servidor.

> Nota: algunos navegadores pueden restringir el modo `file://`. Si algo no funciona, usa una de las opciones siguientes.

### 2. VS Code + Live Server

1. Instala la extensión **Live Server** (Marketplace: Ctrl+Shift+X y busca "Live Server").
2. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

### 3. Servidor local (sin VS Code)

Desde la carpeta del proyecto, en una terminal:

- Con **Python**:
  ```
  python -m http.server
  ```
  Luego abre `http://localhost:8000`.

- Con **Node.js / npx**:
  ```
  npx serve
  ```
  Luego abre la URL que indique (normalmente `http://localhost:3000`).

- Con **PHP**:
  ```
  php -S localhost:8000
  ```

### 4. Desplegar en GitHub Pages (para compartir el enlace)

Publica el proyecto en internet de forma gratuita. Como `index.html` está en la raíz del repo:

1. Ve a GitHub → repositorio **HavanaMap** → **Settings** → **Pages**.
2. En **Build and deployment** → **Source** elige *Deploy from a branch* → rama `main` → carpeta `/ (root)`.
3. Guarda. El mapa quedará disponible en `https://AxAvier7.github.io/HavanaMap/`.

También puedes simplemente clonar el repo en cualquier máquina y usar cualquiera de los métodos 1–3.

## Cómo usar la página

1. Al abrir la página (en cualquiera de las formas anteriores), en la esquina superior izquierda hay un selector **"Descargar mapa hasta el zoom"** donde eliges el nivel de detalle:

   - **13–15**: descarga más rápida (menos tiles).
   - **16** (por defecto): detalle completo de calles y manzanas.
   - **17**: máximo detalle, pero la descarga es pesada.

   La elección se guarda entre sesiones. En la esquina superior derecha verás el estado de la descarga:

   - **Punto naranja parpadeante + barra** → descargando (porcentaje y nº de tiles).
   - **Punto verde** → mapa descargado y listo para usar sin conexión.

   Cuando la descarga termina, el panel de descarga se **minimiza automáticamente** (solo queda el título "Descargar mapa"); haz clic sobre él o en el botón `+` para reexpandirlo y cambiar el nivel.

2. Cuando el indicador se ponga verde, puedes desconectarte. El zoom máximo del mapa coincide con el nivel descargado.

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