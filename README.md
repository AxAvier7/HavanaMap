# HavanaMap

Mapa interactivo de **La Habana, Cuba** que puedes usar **sin conexión a internet**.

## ¿Qué es?

Una página web con el mapa de La Habana sobre la que puedes hacer zoom (con los botones **+ / −** o la rueda del mouse) y moverte libremente. En la primera visita, la página descarga el mapa para que luego funcione aunque no tengas conexión.

## Cómo usarla

1. Abre `index.html` en tu navegador (doble clic, o ábrela desde el navegador). También puede estar disponible en línea como un enlace web.
2. **Elige el detalle del mapa** que quieres descargar con el selector *"Descargar mapa hasta el zoom"*:

   - **13–15**: descarga rápida (menos espacio).
   - **16** (opción normal): calles y manzanas con detalle.
   - **17**: máximo detalle, pero la descarga es pesada.

3. **Primera visita (con internet):** verás una barra de progreso en la esquina superior derecha mientras se descarga el mapa. Cuando el punto se ponga **verde**, el mapa ya está listo para usarse sin conexión.
4. **Visitas siguientes (incluso sin internet):** el mapa se carga solo, sin descargar de nuevo.

## Controles principales

| Control | Qué hace |
| ------- | -------- |
| Botones **+ / −** | Acercar / alejar el mapa |
| Rueda del mouse | Acercar / alejar el mapa |
| Arrastrar el mapa | Moverse por La Habana |
| Selector "Descargar mapa hasta el zoom" | Elegir el nivel de detalle descargado |

## Preguntas frecuentes

**¿Cuándo necesito internet?**
Solo la primera vez, para descargar el mapa. Después puede funcionar completamente sin conexión.

**¿Cuánto espacio ocupa?**
Depende del nivel elegido: desde unos pocos MB (zoom 13) hasta alrededor de 1 GB (zoom 17).

**¿Puedo cambiar el detalle después?**
Sí. Expande el panel *"Descargar mapa"* (clic sobre el título), elige otro nivel y espera a que la barra termine. La elección se recuerda para las próximas veces.

**¿Se guarda en mi dispositivo?**
Sí. Los datos del mapa se guardan en el almacenamiento local de tu navegador, así que no se vuelven a descargar en cada visita.

## Notas legales

- Los datos del mapa provienen de [OpenStreetMap](https://www.openstreetmap.org/copyright) y sus colaboradores.

---

¿Encontraste algún problema? Abre un issue en el repositorio del proyecto.