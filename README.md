# Fotaza 2

Aplicacion web SSR para compartir publicaciones fotograficas. Proyecto integrador de Programacion Web II.

## Tecnologias

- Node.js
- Express
- Pug
- PostgreSQL
- Sequelize
- Multer
- bcryptjs
- express-session

## Funcionalidades implementadas

- Registro, inicio y cierre de sesion.
- Usuario demo creado automaticamente.
- Creacion de publicaciones con imagen, descripcion, licencia y etiquetas.
- Marca de agua obligatoria para imagenes con copyright.
- Selector de etiquetas existentes y creacion de una etiqueta nueva.
- Limite de 1 a 3 etiquetas por publicacion.
- Listado de publicaciones publicas y activas en el inicio.
- Vista de detalle de publicacion.
- Comentarios basicos en publicaciones.
- Eliminacion logica de publicaciones por parte del autor.
- Estilos responsivos basicos y modales para crear publicaciones.

## Pendientes principales

- Buscador funcional.
- Valoracion de imagenes.
- Seguimiento de usuarios.
- Pruebas automatizadas.

## Scripts

- `npm run dev`: inicia el servidor en desarrollo con nodemon.
- `npm start`: inicia el servidor con Node.
- `npm run db:init`: sincroniza la base de datos y carga datos base.

## Instalacion local

1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Crear un archivo `.env` en la raiz del proyecto.
4. Completar las credenciales de PostgreSQL.
5. Ejecutar `npm run db:init` para crear tablas y datos iniciales.
6. Ejecutar `npm run dev` para desarrollo o `npm start` para produccion local.

La aplicacion queda accesible en `http://localhost:3000`.

## Variables de entorno

Ejemplo para PostgreSQL local:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fotaza2
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=false
SESSION_SECRET=un_secreto_para_desarrollo
```

En Vercel/Neon tambien se puede usar `DATABASE_URL`, `POSTGRES_URL` o las variables equivalentes de PostgreSQL.

## Usuario demo

Al inicializar la base se crea un usuario de prueba:

```text
Usuario: demo
Correo: demo@fotaza.test
Contrasena: 123456
```

## Estructura principal

```text
config/
controllers/
db/
middlewares/
models/
public/
routes/
views/
```

## Notas

- Las publicaciones eliminadas usan borrado logico con `estado = 'eliminada'`.
- Las imagenes se guardan en base64 en la base de datos para esta version del proyecto.
- El proyecto usa Pug para renderizar vistas desde el servidor.
