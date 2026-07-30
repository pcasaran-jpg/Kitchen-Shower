# Kitchen Shower · Pablo & Camila

Página estática (`index.html`) donde los invitados marcan qué artículo van a
llevar. No usa build ni frameworks — es un solo archivo HTML pensado para
GitHub Pages. El estado (quién lleva qué) se guarda en una Google Sheet a
través de un pequeño backend en Google Apps Script.

## Cómo funciona

- `index.html` — la página. Al cargar, hace `fetch` a la URL del Apps Script
  para leer quién ha tomado cada artículo, y hace `POST` cuando alguien toma
  o libera un artículo.
- `google-apps-script/Code.gs` — el backend. Se despliega como Web App y
  lee/escribe en una hoja llamada `Claims` dentro de tu Google Sheet.

## Configuración (una sola vez)

### 1. Crear la Google Sheet + Apps Script

1. Crea una Google Sheet nueva (sheets.new).
2. Menú **Extensiones → Apps Script**.
3. Borra el contenido del editor y pega el contenido de
   `google-apps-script/Code.gs`.
4. En el desplegable de funciones (arriba, junto a "Depurar"), selecciona
   `initSheet` y presiona **Ejecutar**. La primera vez te pedirá autorizar
   permisos — acepta (es tu propia hoja). Esto crea la pestaña `Claims` con
   los 20 artículos precargados.
5. **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo (tu cuenta)**.
   - Quién tiene acceso: **Cualquier usuario**.
6. Copia la **URL de la aplicación web** que te da (termina en `/exec`).

### 2. Conectar la página con esa URL

En `index.html`, busca esta línea:

```js
const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```

Reemplaza el placeholder por la URL copiada, guarda, commitea y sube el
cambio (`git push`).

### 3. Publicar en GitHub Pages

1. En GitHub: **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: `main`, carpeta `/ (root)`.
4. Guarda. GitHub te da la URL pública (tarda 1-2 min en activarse).

## Notas

- Si editas la lista de artículos, actualiza `ITEMS` en **ambos** lugares:
  `index.html` y `google-apps-script/Code.gs` (y vuelve a correr
  `initSheet` si agregas artículos nuevos — no borra los ya tomados de los
  artículos existentes, pero si cambias IDs se pierde la relación).
- El owner también puede ver/editar la hoja `Claims` directamente en Google
  Sheets en cualquier momento.
- Si vuelves a implementar el Apps Script (nueva versión) desde
  **Implementar → Gestionar implementaciones**, la URL `/exec` se mantiene
  igual; no hace falta tocar `index.html` de nuevo.
