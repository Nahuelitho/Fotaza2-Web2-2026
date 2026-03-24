# Fotaza 2

Base inicial del proyecto integrador de Programacion Web II.

## Stack

- Node.js
- Express
- Pug
- MySQL

## Scripts

- `npm run dev`: inicia el servidor en desarrollo con nodemon.
- `npm start`: inicia el servidor con Node.
- `npm run db:init`: crea la base de datos, las tablas y carga datos base.

## Instalacion local

1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Copiar `.env.example` a `.env`.
4. Completar credenciales de MySQL en `.env`.
5. Ejecutar `npm run db:init`.
6. Ejecutar `npm run dev` o `npm start`.

La aplicacion queda accesible en `http://localhost:3000`.

## Estructura base

```text
config/
controllers/
db/
middlewares/
models/
public/
routes/
services/
views/
```

## Usuarios de ejemplo

Los usuarios de ejemplo se cargan con `npm run db:init`:

- `admin`
- `validator`
- `demo`

Nota: las contrasenas de ejemplo quedaron como placeholder y deben redefinirse cuando implementemos autenticacion real.
