# Fotos Por Ahí — portfolio de Irupé Perea

Sitio estático bilingüe (EN / ES-AR) publicado en GitHub Pages.
Sin build ni dependencias: HTML + CSS + JS vanilla.

## Estructura

```
index.html          → versión en inglés (raíz)
es/index.html       → versión en español (Argentina)
css/style.css       → estilos compartidos (tema oscuro editorial)
js/photos.js        → datos de las fotos (slug, categoría, b&n, medidas, captions)
js/main.js          → galería, filtros, lightbox, animaciones
assets/photos/      → fotos optimizadas (~1600px, jpg q80)
assets/thumbs/      → miniaturas para la grilla (~800px)
assets/manifest.json→ inventario generado
```

## Agregar fotos nuevas

1. Copiá la foto original a una carpeta fuera del repo (no se publican los originales).
2. Generá dos versiones JPG: una de máx. 1600px de lado mayor (calidad ~80) para
   `assets/photos/`, y una de máx. 800px (calidad ~75) para `assets/thumbs/`.
   Usá el mismo nombre para ambas, por ejemplo `mi-foto-01.jpg`.
3. Agregá una línea a `js/photos.js`:

   ```js
   { slug: "mi-foto-01", cat: "live", bw: false, w: 1600, h: 1067,
     cap: { en: "Caption in English", es: "Pie de foto en español" } },
   ```

   Categorías: `live` (en vivo), `portrait` (retratos), `still` (bodegones).
4. Commiteá y pusheá: GitHub Pages se actualiza solo en un par de minutos.

## Editar textos

- Bio, contacto y encabezados: están en `index.html` y `es/index.html`.
- Pie de foto de cada imagen: en `js/photos.js`.
- Email y redes: buscá `TODO` en ambos HTML.

## Publicación

Repo: `fotos-por-ahi` · GitHub Pages sirve la rama `main` desde la raíz.
URL: `https://<usuario>.github.io/fotos-por-ahi/`

---

© 2026 Irupé Perea — todas las fotografías son propiedad de su autora.
