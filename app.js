const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const { checkDbConnection } = require('./config/db');

dotenv.config({ quiet: true });

const indexRouter = require('./routes');
const authRouter = require('./routes/auth.routes');

const app = express();
const port = Number(process.env.PORT || 3000);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fotaza-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.appName = 'Fotaza 2';
  res.locals.currentUser = req.session.user || null;
  res.locals.quickLinks = ['Explorar', 'Tendencias', 'Colecciones', 'Fotografos', 'Favoritos'];
  res.locals.featuredTags = ['Paisajes', 'Retratos', 'Ciudad', 'Viajes', 'Naturaleza'];
  next();
});

app.use('/', indexRouter);
app.use('/', authRouter);

app.use((req, res) => {
  res.status(404).render('pages/home', {
    title: 'Pagina no encontrada',
    posts: [],
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);

  checkDbConnection()
    .then(() => {
      console.log('Base de datos conectada correctamente.');
    })
    .catch((error) => {
      console.error(`No se pudo conectar a la base de datos: ${error.code || error.message}`);
    });
});
