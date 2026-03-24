const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const indexRouter = require('./routes');

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
  next();
});

app.use('/', indexRouter);

app.use((req, res) => {
  res.status(404).render('pages/home', {
    title: 'Pagina no encontrada',
    pageTitle: '404',
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
