const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, Rol, Etiqueta, Usuario } = require('./models/sequelize');

dotenv.config({ quiet: true });

const indexRouter = require('./routes');
const authRouter = require('./routes/autenticacion.routes');
const postRouter = require('./routes/publicacion.routes');

const app = express();
const port = Number(process.env.PORT || 3000);

async function inicializarBaseDatos() {
  await sequelize.authenticate();
  await sequelize.sync();

  const roles = ['admin', 'validador', 'usuario'];
  for (const nombreRol of roles) {
    await Rol.findOrCreate({ where: { name: nombreRol }, defaults: { name: nombreRol } });
  }

  const rolUsuario = await Rol.findOne({ where: { name: 'usuario' } });

  if (rolUsuario) {
    const usuarioDemo = await Usuario.findOne({
      where: {
        [Op.or]: [{ correo: 'demo@fotaza.test' }, { nombreUsuario: 'demo' }],
      },
    });

    if (!usuarioDemo) {
      const hashContrasena = await bcrypt.hash('123456', 10);

      await Usuario.create({
        idRol: rolUsuario.id,
        nombreUsuario: 'demo',
        correo: 'demo@fotaza.test',
        hashContrasena,
        nombreVisible: 'Usuario Demo',
      });
    }
  }

  const etiquetas = ['paisaje', 'retrato', 'urbano', 'naturaleza', 'viajes'];
  for (const nombreEtiqueta of etiquetas) {
    await Etiqueta.findOrCreate({ where: { name: nombreEtiqueta }, defaults: { name: nombreEtiqueta } });
  }
}

const baseDatosLista = inicializarBaseDatos();

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

app.use(async (req, res, next) => {
  try {
    await baseDatosLista;
    next();
  } catch (error) {
    next(error);
  }
});

app.use(async (req, res, next) => {
  try {
    res.locals.appName = 'Fotaza 2';
    res.locals.usuarioActual = req.session.usuario || null;
    res.locals.filtrosBusqueda = {
      buscar: req.query.buscar?.trim() || '',
      etiqueta: req.query.etiqueta?.trim() || '',
    };
    res.locals.etiquetasDisponibles = await Etiqueta.findAll({
      order: [['name', 'ASC']],
    });
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', postRouter);

app.use((req, res) => {
  res.status(404).render('pages/inicio', {
    title: 'Pagina no encontrada',
    publicaciones: [],
  });
});

function verificarConexionDb() {
  baseDatosLista
    .then(() => {
      console.log('Base de datos inicializada correctamente.');
    })
    .catch((error) => {
      console.error(`No se pudo conectar a la base de datos: ${error.code || error.message}`);
    });
}

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    verificarConexionDb();
  });
} else {
  verificarConexionDb();
}

module.exports = app;
