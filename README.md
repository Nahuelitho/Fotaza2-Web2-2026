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

## Instalacion local

1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Crear un archivo `.env` en la raiz del proyecto o copiar `.env.example` si esta disponible.
4. Completar las variables de entorno de PostgreSQL.
5. Ejecutar `npm run db:init` para inicializar la base de datos.
6. Ejecutar `npm start`.

La aplicacion queda disponible en:

```text
http://localhost:3000
```

Para desarrollo tambien puede ejecutarse:

```bash
npm run dev
```

## Variables de entorno

Ejemplo para PostgreSQL local:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fotaza2
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=false
PORT=3000
SESSION_SECRET=un_secreto_para_desarrollo
```

En produccion tambien se puede usar `DATABASE_URL`, `POSTGRES_URL` o variables equivalentes de PostgreSQL.

## Scripts

- `npm start`: inicia la aplicacion con Node.
- `npm run dev`: inicia la aplicacion con nodemon.
- `npm run db:init`: crea/sincroniza las tablas y carga datos base.

## Usuario de prueba

Al inicializar la base se crea un usuario demo:

```text
Usuario: demo
Correo: demo@fotaza.test
Contrasena: 123456
```

## Funcionalidades implementadas

- Registro, inicio y cierre de sesion.
- Autenticacion con sesiones.
- Creacion de publicaciones con titulo, descripcion, imagen, licencia y etiquetas.
- Carga de imagenes con Multer.
- Guardado de imagenes en base64 para simplificar esta version del proyecto.
- Licencia por imagen: con copyright o sin copyright.
- Marca de agua obligatoria para imagenes con copyright.
- Visualizacion de marca de agua como overlay sobre la imagen.
- Selector de etiquetas existentes y creacion de una etiqueta nueva.
- Validacion de minimo 1 y maximo 3 etiquetas por publicacion.
- Listado de publicaciones publicas y activas en el inicio.
- Paginacion de publicaciones cada 10 resultados.
- Buscador global por texto y etiqueta.
- Busqueda por titulo, descripcion o etiqueta.
- Filtro por etiqueta combinable con texto.
- Vista de detalle de publicacion.
- Modulo basico de comentarios.
- Valoracion de imagenes de 1 a 5.
- Promedio y cantidad de valoraciones por imagen.
- Una valoracion activa por usuario e imagen; si el usuario vuelve a valorar, se actualiza su puntaje.
- Restriccion para que el autor no valore su propia publicacion.
- Vista simple de perfil de usuario.
- Borrado logico de publicaciones por parte del autor.



## Estructura principal

```text
config/          Configuracion de base de datos
controllers/     Logica de las rutas
db/              Inicializacion de base de datos
middlewares/     Middlewares de autenticacion
models/          Modelos Sequelize
public/          Archivos estaticos CSS, JS e imagenes
routes/          Definicion de rutas Express
views/           Vistas Pug y parciales reutilizables
```

## Decisiones tecnicas

- La aplicacion renderiza vistas del lado del servidor con Pug.
- No se utilizan frameworks frontend como React, Vue o Angular.
- Se usa Sequelize para trabajar con PostgreSQL.
- Las publicaciones eliminadas usan borrado logico mediante `estado = 'eliminada'`.
- La creacion de publicaciones usa una transaccion para guardar publicacion, imagen y etiquetas como una sola operacion.
- La marca de agua se guarda como texto asociado a la imagen y se muestra como overlay visual. No modifica el archivo original.
- El buscador del navbar usa datos globales mediante `res.locals`, para funcionar en todas las vistas.
- La tarjeta de publicacion se reutiliza con `views/partials/publicacion-card.pug` en el inicio y en el perfil de usuario.
- La vista de perfil muestra datos basicos, contadores y publicaciones publicas del usuario.

## Problemas encontrados y soluciones

### Conexion local y produccion

Problema: el proyecto debia funcionar tanto en PostgreSQL local como en servicios externos como Neon/Vercel.

Solucion: `config/db.js` acepta variables locales `DB_*`, variables `PG*` y URLs como `DATABASE_URL` o `POSTGRES_URL`. Tambien configura SSL cuando corresponde.

### Diferencia entre puerto de la app y puerto de PostgreSQL

Problema: durante la configuracion se confundio el puerto `3000` de Express con el puerto de PostgreSQL.

Solucion: se aclaro que la aplicacion corre en `http://localhost:3000`, mientras que PostgreSQL normalmente escucha en `5432`.

### Buscador en todas las vistas

Problema: el navbar se renderiza en todas las vistas, pero al principio las etiquetas del buscador solo se cargaban en el inicio.

Solucion: se movieron `etiquetasDisponibles` y `filtrosBusqueda` a `res.locals` en `app.js`, para que el buscador tenga datos en cualquier vista.

### Codigo duplicado en publicaciones

Problema: la tarjeta de publicacion del inicio tambien era necesaria en el perfil de usuario.

Solucion: se creo el parcial `views/partials/publicacion-card.pug` para reutilizar la misma estructura visual.

### Creacion de publicaciones en varias tablas

Problema: crear una publicacion implica guardar datos en publicaciones, imagenes, etiquetas y relaciones intermedias.

Solucion: se usa una transaccion para confirmar todo junto o revertir todo si alguna parte falla.

### Marca de agua

Problema: se necesitaba representar una marca de agua sin agregar procesamiento complejo de imagenes.

Solucion: se guarda el texto de marca de agua y se muestra sobre la imagen con CSS como overlay visual.

