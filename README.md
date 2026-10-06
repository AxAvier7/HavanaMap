# HavanaMap

Mapa interactivo de **La Habana, Cuba** que puedes usar **sin conexión a internet**.

## ¿Qué es?

Una página web con el mapa de La Habana sobre la que puedes hacer zoom (con la **rueda del mouse** o gestos táctiles) y moverte libremente. En la primera visita, la página descarga el mapa para que luego funcione aunque no tengas conexión. También puedes **guardar tus lugares favoritos** con pines de colores.

## Cómo usarla

1. Abre `index.html` en tu navegador (doble clic, o ábrela desde el navegador). También puede estar disponible en línea como un enlace web.
2. **Elige el detalle del mapa** que quieres descargar con el selector *"Descargar mapa hasta el zoom"*:

   - **13–15**: descarga rápida (menos espacio).
   - **16** (opción normal): calles y manzanas con detalle.
   - **17**: máximo detalle, pero la descarga es pesada.

3. **Primera visita (con internet):** verás una barra de progreso en la esquina superior derecha mientras se descarga el mapa. Cuando el punto se ponga **verde**, el mapa ya está listo para usarse sin conexión.
4. **Visitas siguientes (incluso sin internet):** el mapa se carga solo, sin descargar de nuevo.

### Guardar lugares con pines

En el panel **"Mis ubicaciones"**, debajo de *"Descargar mapa"*:

1. Escribe un **nombre** (opcional) y elige un **color**.
2. Pulsa **"+ Añadir pin en el mapa"** y haz clic en el punto que quieras.
3. El pin queda guardado en tu dispositivo y aparece en la lista.
4. Desde la lista puedes **Ir** al lugar, **Editar** su nombre o color y **eliminarlo** (✕).

### Trazar la ruta más corta

En el panel **"Trazar ruta"** (debajo de *"Mis ubicaciones"*):

1. Pulsa **"Seleccionar"** junto a *Origen* y haz clic en el punto de partida (si el clic cae sobre un **pin guardado**, la ruta parte de ese pin).
2. Pulsa **"Trazar ruta"**. Se dibuja la ruta más corta por carretera y se muestra: *"Ruta de \<Origen\> a \<Destino\>. Distancia: ..."*.
3. Puedes quitar origen/destino con **✕** o borrar todo con **"Limpiar ruta"**.

> Nota: el cálculo de rutas necesita **internet** (usa el servicio público de rutas de OpenStreetMap). El ver el mapa sigue funcionando sin conexión.

## Controles principales

| Control | Qué hace |
| ------- | -------- |
| Rueda del mouse | Acercar / alejar el mapa |
| Arrastrar el mapa | Moverse por La Habana |
| Selector "Descargar mapa hasta el zoom" | Elegir el nivel de detalle descargado |
| Panel "Mis ubicaciones" | Añadir pines de colores y guardar lugares |
| Panel "Trazar ruta" | Ruta más corta entre dos puntos + distancia y tiempo |

## Preguntas frecuentes

**¿Cuándo necesito internet?**
Solo la primera vez, para descargar el mapa. Después puede funcionar completamente sin conexión.

**¿Cuánto espacio ocupa?**
Depende del nivel elegido: desde unos pocos MB (zoom 13) hasta alrededor de 1 GB (zoom 17).

**¿Puedo cambiar el detalle después?**
Sí. Expande el panel *"Descargar mapa"* (clic sobre el título), elige otro nivel y espera a que la barra termine. La elección se recuerda para las próximas veces.

**¿Se guarda en mi dispositivo?**
Sí. Los datos del mapa se guardan en el almacenamiento local de tu navegador, así que no se vuelven a descargar en cada visita.

**¿Mis ubicaciones se sincronizan con otros dispositivos?**
No. Los pines se guardan solo en el navegador y dispositivo donde los creaste.

## Notas legales

- Los datos del mapa provienen de [OpenStreetMap](https://www.openstreetmap.org/copyright) y sus colaboradores.

---

¿Encontraste algún problema? Abre un issue en el repositorio del proyecto.