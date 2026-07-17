# UTHUB: despliegue con Netlify + Render

Este proyecto ya quedo preparado para esta estructura:

- `Netlify` publica el frontend.
- `Render` corre el backend en Node.js.
- `Alwaysdata` guarda la base de datos MySQL.

## Dónde debe ir cada cosa

- El repositorio principal debe ser `UTHUB`.
- El frontend debe quedar en la raiz del repo.
- El backend vive en la carpeta `backend/`.
- `netlify.toml` debe quedarse en la raiz del repo.
- `render.yaml` debe quedarse en la raiz del repo.

## Netlify

En Netlify configura el sitio asi:

- `Base directory`: vacio
- `Build command`: vacio
- `Publish directory`: `.`

Si Netlify te enseña campos que no te deja borrar, lo importante es que el repo apunte a la raiz correcta. Si el proyecto ya tiene `netlify.toml`, ese archivo manda.

El archivo `netlify.toml` ya deja esto listo:

```toml
[build]
  publish = "."

[build.environment]
  NODE_VERSION = "22"
```

## Render

En Render crea un Web Service y usa estas opciones:

- `Root Directory`: `backend`
- `Build Command`: `npm install`
- `Start Command`: `npm start`

Variables de entorno necesarias en Render:

- `PORT=3000`
- `PUBLIC_URL=https://TU-BACKEND.onrender.com`
- `ALLOWED_ORIGINS=https://TU-SITIO.netlify.app`
- `DATABASE_URL=mysql://USUARIO:CLAVE@HOST:3306/BASE_DE_DATOS`
- `DB_SSL=false`
- `JWT_SECRET=una_clave_larga_y_segura`

## Alwaysdata

En Alwaysdata ya debes tener importada la base de datos MySQL.

Debes usar estos datos dentro de `DATABASE_URL`:

- `USUARIO`: tu usuario de MySQL
- `CLAVE`: tu contrasena
- `HOST`: el host que te da Alwaysdata
- `BASE_DE_DATOS`: el nombre real de tu base

## Frontend

El frontend toma la URL del backend desde:

- `js/config.js`

Cuando Render te de la URL final, cambia:

```js
window.UTHUB_CONFIG = {
  API_BASE_URL: 'https://TU-BACKEND.onrender.com/api'
};
```

por tu URL real.

## Orden recomendado

1. Subir el repo a GitHub.
2. Crear la base MySQL en Alwaysdata e importar el `.sql`.
3. Crear el backend en Render.
4. Copiar la URL de Render.
5. Pegar esa URL en `js/config.js`.
6. Crear el sitio en Netlify desde el mismo repo.
7. Poner la URL de Netlify en `ALLOWED_ORIGINS` de Render.

## Importante

- Si Render duerme en la cuenta gratis, la primera visita puede tardar unos segundos.
- Netlify si puede quedar siempre visible.
- Si una ruta del sitio no existe en el backend, el frontend no debe intentar usarla hasta que se programe.
