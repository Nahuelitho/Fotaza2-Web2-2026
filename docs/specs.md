# Fotaza 2 - Especificaciones Base

## 1. Contexto del proyecto
- Materia: Programacion Web II
- Proyecto: Fotaza 2
- Objetivo: construir una aplicacion web para almacenar, ordenar, buscar, vender y compartir fotografias en linea, con enfoque de comunidad.

## 2. Stack y restricciones tecnicas
- Backend principal: Node.js + Express
- Renderizado: Pug del lado del servidor
- Base de datos: MySQL
- Frontend: HTML, CSS, JS, Pug
- Se pueden usar librerias auxiliares del lado del servidor
- Se pueden usar frameworks CSS o plantillas visuales
- No usar:
  - React
  - Vue
  - Angular
  - Next.js
  - Nuxt.js
  - Gatsby
  - otros frameworks front o meta-frameworks no permitidos por la consigna

## 3. Enfoque de arquitectura
- Aplicacion monolitica SSR
- Un solo proyecto Node
- Un solo `package.json`
- Vistas renderizadas con Pug
- Archivos estaticos en `public/`
- Configuracion por variables de entorno
- Inicializacion de base con `npm run db:init`

## 4. Estructura base del proyecto
- `app.js`
- `package.json`
- `.env.example`
- `README.md`
- `config/`
- `controllers/`
- `db/`
- `middlewares/`
- `models/`
- `public/`
- `routes/`
- `services/`
- `views/`

## 5. Requerimientos funcionales generales

### 5.1 Autenticacion
- Solo usuarios registrados pueden interactuar con la app
- Usuarios anonimos solo pueden ver contenido publico
- Debe existir:
  - registro
  - login
  - logout

### 5.2 Publicaciones e imagenes
- Un usuario puede crear publicaciones
- Cada publicacion debe tener:
  - titulo
  - descripcion opcional
  - 1 o mas imagenes
  - 1 o mas etiquetas
- Cada imagen debe tener licencia
- Si tiene copyright, puede incluir marca de agua personalizada

### 5.3 Comentarios
- Los usuarios pueden comentar publicaciones
- El autor puede cerrar comentarios
- Deben seguir visibles los comentarios previos al cierre

### 5.4 Denuncias
- Las publicaciones pueden ser denunciadas
- Cada denuncia debe incluir:
  - motivo
  - descripcion
- Si una publicacion recibe una denuncia:
  - ya no puede ser modificada por su autor
- Si una publicacion recibe mas de 3 denuncias de distintos usuarios:
  - pasa a revision del validador
- El validador puede:
  - dar de baja la publicacion
  - desestimar denuncias
- Si un usuario acumula 3 publicaciones dadas de baja:
  - su cuenta se inactiva
- Los comentarios tambien pueden ser denunciados
- El autor puede revisar denuncias del comentario y borrarlo si corresponde

### 5.5 Valoracion de imagenes
- Cada usuario puede valorar una imagen una sola vez
- El autor no puede valorar su propia imagen
- Debe mostrarse:
  - promedio de valoracion
  - cantidad de valoraciones

### 5.6 Home con destacadas
- Imagenes bien valoradas y con cantidad de votos considerable deben tener prioridad en home
- Debe existir criterio de balance para que tambien aparezcan otras imagenes
- El criterio final queda definido por el equipo

### 5.7 Me interesa y mensajeria
- Un usuario puede marcar "me interesa" en una imagen
- El autor recibe el perfil del interesado
- Debe existir mensajeria privada entre ambos

### 5.8 Buscador
- Debe existir motor de busqueda de publicaciones/imagenes
- Debe soportar filtros multiples combinables

### 5.9 Seguimiento de usuarios
- Un usuario puede seguir y dejar de seguir a otro
- No puede seguirse a si mismo
- No puede seguir dos veces al mismo usuario
- Cada perfil debe mostrar:
  - cantidad de seguidores
  - cantidad de seguidos
- Debe existir seccion de publicaciones de usuarios seguidos

### 5.10 Notificaciones
- Deben generarse notificaciones cuando:
  - comentan una publicacion
  - valoran una imagen
  - marcan "me interesa"
  - comienzan a seguir al usuario
- Cada notificacion debe indicar:
  - tipo de evento
  - usuario que hizo la accion
  - fecha
- Debe poder marcarse como leida

### 5.11 Colecciones y favoritos
- Un usuario puede guardar publicaciones como favoritas
- Los favoritos son privados
- Un usuario puede crear colecciones
- Una coleccion puede contener varias publicaciones
- No se puede guardar la misma publicacion dos veces en la misma coleccion

## 6. Modelo de datos base ya definido
Tablas base del proyecto:
- `roles`
- `users`
- `posts`
- `post_images`
- `tags`
- `post_tags`
- `comments`
- `image_ratings`
- `follows`
- `notifications`
- `collections`
- `collection_posts`
- `post_reports`
- `comment_reports`
- `interests`
- `private_conversations`
- `private_messages`

## 7. Decisiones tecnicas actuales del proyecto
- Autenticacion con sesiones y base de datos
- Passwords hasheadas con bcrypt
- No usar JWT en esta etapa
- No usar Passport en esta etapa
- Imagenes guardadas en servidor/localmente y rutas en BD
- No guardar blobs en MySQL como estrategia principal

## 8. Requisitos de regularizacion
La version regularizable debe cumplir como minimo:
- creacion de publicacion
- buscador de publicaciones/imagenes
- modulo de comentarios
- valoracion de imagenes
- seguimiento de usuarios

Ademas:
- repositorio GitHub disponible
- captura/listado de commits
- deploy en internet
- video de hasta 3 minutos
- documentacion en README
- usuarios de prueba en README
- uso de variables de entorno
- `.env.example`
- `npm install`
- `npm run db:init`
- `npm start`
- acceso en `http://localhost:3000`

## 9. Flujo obligatorio de ejecucion del proyecto
El proyecto debe poder levantarse siguiendo estos pasos:
1. Clonar repositorio
2. Ejecutar `npm install`
3. Ejecutar `npm run db:init`
4. Configurar `.env`
5. Ejecutar `npm start`

## 10. Requisitos de base de datos
- Diseno relacional claro
- Normalizacion minima 3FN
- claves primarias y foraneas correctas
- integridad referencial
- tipos de datos adecuados
- restricciones bien definidas
- copia SQL de la base en la raiz del proyecto
- datos de prueba suficientes para evaluar el sistema
- usuarios de prueba para cada rol

## 11. Requisitos de documentacion
El README debe incluir:
- instalacion local
- variables de entorno necesarias
- pasos para inicializar BD
- pasos para ejecutar proyecto
- usuarios de prueba
- informacion de despliegue
- breve informe de problemas encontrados y soluciones

## 12. Criterios internos de desarrollo
- commits pequenos y significativos
- evitar commits gigantes
- mantener separacion clara entre:
  - rutas
  - controladores
  - modelos
  - middlewares
  - vistas
- priorizar primero regularizacion
- dejar funcionalidades avanzadas para una segunda etapa

## 13. Alcance del primer mes
Objetivo:
- lograr version regularizable

Incluye:
- autenticacion
- publicaciones
- comentarios
- valoraciones
- follows
- buscador
- README
- `.env.example`
- `db:init`
- `start`

No incluye todavia:
- denuncias completas
- moderacion avanzada
- notificaciones completas
- colecciones completas
- me interesa y mensajeria
- ranking avanzado del home

## 14. Estado actual del proyecto
Ya definido:
- estructura base
- home inicial
- identidad visual base
- base de datos V1
- vistas de autenticacion
- autenticacion con sesiones en desarrollo
- sprint mensual de regularizacion definido

## 15. Regla de trabajo para el proyecto
- primero regularizar
- despues completar funciones de aprobacion final
- no mezclar funcionalidades avanzadas antes de cerrar lo minimo exigido
