# Fotaza 2

Aplicacion web SSR para compartir publicaciones fotograficas. Proyecto integrador de Programacion Web II.

## Acceso rapido

La aplicacion esta desplegada en Vercel:

```text
https://fotaza2-web2-2026.vercel.app/
```

Usuarios de prueba disponibles en la base de datos de produccion:

| Usuario | Correo | Contrasena |
| --- | --- | --- |
| Usuario1 | test1@gmail.com | 123456 |
| Usuario2 | test2@gmail.com | 123456 |
| Usuario3 | test3@gmail.com | 123456 |

Tambien se puede crear una cuenta nueva desde la pantalla de registro.

## Tecnologias utilizadas

- Node.js
- Express
- Pug
- PostgreSQL
- Sequelize
- Multer
- bcryptjs
- express-session
- connect-session-sequelize
- method-override
- Vercel
- Neon PostgreSQL

## Funcionalidades implementadas

- Registro de usuarios.
- Inicio y cierre de sesion.
- Autenticacion con sesiones persistidas en base de datos.
- Validacion de usuario, correo y contrasena.
- Creacion de publicaciones fotograficas.
- Carga de imagenes JPG, PNG y WEBP.
- Limite de peso de imagen de 2 MB.
- Guardado de imagenes en base64 dentro de PostgreSQL.
- Seleccion de licencia de imagen.
- Marca de agua obligatoria para imagenes con copyright.
- Visualizacion de marca de agua como overlay sobre la imagen.
- Seleccion de etiquetas existentes.
- Creacion de una etiqueta nueva al publicar.
- Validacion de minimo 1 y maximo 3 etiquetas por publicacion.
- Listado de publicaciones publicas y activas en el inicio.
- Paginacion de publicaciones cada 10 resultados.
- Buscador por titulo, descripcion o etiqueta.
- Filtro por etiqueta.
- Vista de detalle de publicacion.
- Comentarios en publicaciones.
- Eliminacion de comentarios por parte del autor de la publicacion.
- Valoracion de imagenes de 1 a 5.
- Promedio y cantidad de valoraciones por imagen.
- Una valoracion activa por usuario e imagen; si el usuario vuelve a valorar, se actualiza.
- Restriccion para que el autor no valore su propia publicacion.
- Perfil de usuario con publicaciones, seguidores y seguidos.
- Seguir y dejar de seguir usuarios.
- Borrado logico de publicaciones por parte del autor.
- En el inicio, los visitantes sin sesion solo ven publicaciones con licencia Creative Commons.

## Instalacion local

1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Crear un archivo `.env` en la raiz del proyecto.
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

En produccion se puede usar `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING` o variables equivalentes de PostgreSQL.

## Scripts disponibles

- `npm start`: inicia la aplicacion con Node.
- `npm run dev`: inicia la aplicacion con nodemon.
- `npm run db:init`: sincroniza las tablas y carga datos base.
- `npm test`: script placeholder, todavia sin tests automatizados.

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

## Orden cronologico del desarrollo

### 1. Login, registro y sesiones

El proyecto empezo por la autenticacion. Como ya habia cursado anteriormente, esta parte era la mas conocida y por eso fue la primera funcionalidad encarada.

Se implementaron el registro, el inicio de sesion, el cierre de sesion, el hash de contrasenas con `bcryptjs` y el manejo de sesiones con `express-session`.

### 2. Primera base de datos en MySQL

Al comienzo la base de datos se penso y se armo en MySQL porque era la tecnologia que resultaba mas familiar para arrancar rapido.

Con esa primera version se definieron las entidades principales del sistema: usuarios, roles, publicaciones, imagenes, etiquetas, comentarios, valoraciones y seguimientos.

### 3. Migracion de MySQL a PostgreSQL

Mas adelante fue necesario migrar a PostgreSQL para poder desplegar mejor el proyecto y conectarlo con servicios compatibles con Vercel, como Neon.

La solucion fue pasar la conexion a `pg` y `Sequelize`, ajustar las variables de entorno y adaptar las consultas a PostgreSQL. Un ejemplo concreto fue el buscador, donde se uso `iLike` para realizar busquedas sin distinguir mayusculas y minusculas.

### 4. Modelos y relaciones con Sequelize

Luego se organizaron los modelos Sequelize y sus relaciones.

Se definieron relaciones entre usuarios y publicaciones, publicaciones e imagenes, publicaciones y etiquetas, usuarios y comentarios, imagenes y valoraciones, y usuarios con otros usuarios mediante seguimientos.

### 5. Publicaciones con imagenes

Despues se implemento la creacion de publicaciones. Cada publicacion permite titulo, descripcion, imagen, licencia y etiquetas.

Para la carga de archivos se uso `Multer` con almacenamiento en memoria. La imagen se convierte a base64 y se guarda en la base de datos para simplificar el despliegue, evitando depender de un filesystem persistente en Vercel.

### 6. Licencias, copyright y marca de agua

Se agrego la diferencia entre imagenes Creative Commons e imagenes con copyright.

Cuando una imagen se publica con copyright, el sistema exige una marca de agua. Para no sumar procesamiento complejo de imagenes, la marca se guarda como texto y se muestra visualmente encima de la imagen con CSS.

### 7. Etiquetas y busqueda

Se incorporaron etiquetas para clasificar publicaciones.

El formulario permite elegir etiquetas existentes y crear una nueva. Tambien se agregaron validaciones para obligar al menos una etiqueta y permitir como maximo tres.

Mas adelante se sumo el buscador del inicio, con busqueda por titulo, descripcion o etiqueta, mas filtro directo por etiqueta.

### 8. Inicio, detalle y paginacion

Con las publicaciones funcionando, se trabajo en la pantalla principal.

El inicio muestra publicaciones activas, ordenadas por fecha y paginadas cada 10 resultados. Tambien se agrego la vista de detalle para ver imagen, autor, comentarios, valoraciones y datos relacionados.

### 9. Comentarios y valoraciones

Se agrego la posibilidad de comentar publicaciones y valorar imagenes de 1 a 5.

Para las valoraciones se resolvio que cada usuario pueda tener una sola valoracion por imagen. Si vuelve a votar, no se duplica: se actualiza el puntaje anterior.

Tambien se bloqueo que el autor pueda valorar su propia publicacion.

### 10. Perfil y seguimientos

Se implemento el perfil de usuario con sus publicaciones publicas, cantidad de seguidores y cantidad de usuarios seguidos.

Tambien se agrego la accion de seguir y dejar de seguir otros usuarios, evitando que un usuario pueda seguirse a si mismo.

### 11. Despliegue en Vercel y Neon

La ultima etapa fue preparar el proyecto para produccion.

Se configuro la app para funcionar en Vercel, conectada a PostgreSQL en Neon. Tambien se ajustaron cookies seguras, sesiones guardadas en base de datos y conexion SSL para el entorno productivo.

## Dificultades encontradas y soluciones

### Migracion de MySQL a PostgreSQL

Problema: el proyecto empezo con MySQL, pero para el despliegue final convenia usar PostgreSQL.

Solucion: se migro la configuracion a `pg` y `Sequelize`, se adaptaron variables de entorno y se ajustaron detalles propios de PostgreSQL como busquedas con `iLike`.

### Conexion local y produccion

Problema: la aplicacion tenia que funcionar tanto en local como en produccion con Vercel y Neon.

Solucion: `config/db.js` acepta variables locales `DB_*`, variables `PG*` y URLs como `DATABASE_URL`, `POSTGRES_URL` o `POSTGRES_URL_NON_POOLING`. Tambien activa SSL cuando corresponde.

### Puerto de Express y puerto de PostgreSQL

Problema: durante la configuracion se podia confundir el puerto `3000` de la aplicacion con el puerto `5432` de PostgreSQL.

Solucion: se separo claramente la configuracion. Express corre en `http://localhost:3000` y PostgreSQL usa normalmente `5432`.

### Persistencia de imagenes en Vercel

Problema: Vercel no es ideal para guardar imagenes subidas en carpetas locales porque el filesystem no debe tomarse como persistente.

Solucion: se uso `Multer` en memoria y se guardo la imagen convertida a base64 en PostgreSQL.

### Creacion de publicaciones en varias tablas

Problema: crear una publicacion implica guardar datos en publicaciones, imagenes, etiquetas y la tabla intermedia de publicacion-etiqueta.

Solucion: se uso una transaccion de Sequelize para confirmar todo junto o revertir todo si alguna parte falla.

### Marca de agua

Problema: se necesitaba representar la marca de agua sin implementar procesamiento real de imagenes.

Solucion: se guarda el texto de la marca de agua y se muestra sobre la imagen como overlay visual.

### Buscador disponible en todas las vistas

Problema: el navbar aparece en varias pantallas, pero las etiquetas del buscador inicialmente solo estaban disponibles en el inicio.

Solucion: se movieron `etiquetasDisponibles` y `filtrosBusqueda` a `res.locals` en `app.js`, para que esten disponibles en todas las vistas.

### Sesiones en produccion

Problema: las sesiones en memoria no son recomendables para produccion y pueden fallar en entornos serverless.

Solucion: se uso `connect-session-sequelize` para guardar sesiones en PostgreSQL.

## Decisiones tecnicas

- La aplicacion renderiza vistas del lado del servidor con Pug.
- No se usaron frameworks frontend como React, Vue o Angular.
- Se usa Sequelize para modelar y consultar PostgreSQL.
- Las publicaciones eliminadas usan borrado logico mediante `estado = 'eliminada'`.
- La creacion de publicaciones usa una transaccion para guardar publicacion, imagen y etiquetas como una sola operacion.
- La marca de agua se guarda como texto y se muestra visualmente; no modifica el archivo original.
- Las imagenes se guardan en base64 para simplificar el despliegue en Vercel.
- El buscador del navbar usa datos globales mediante `res.locals`.
- La tarjeta de publicacion se reutiliza con un parcial Pug en el inicio y en perfiles.
