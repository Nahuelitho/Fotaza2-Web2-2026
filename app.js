const path = require("path");
const express = require("express");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const {
  sequelize,
  Rol,
  Etiqueta,
  Usuario,
  Notificacion,
} = require("./models/sequelize");

dotenv.config({ quiet: true });

const indexRouter = require("./routes");
const authRouter = require("./routes/autenticacion.routes");
const postRouter = require("./routes/publicacion.routes");
const usuarioRouter = require("./routes/usuario.routes");
const validadorRouter = require("./routes/validador.routes");
const favoritoRouter = require("./routes/favorito.routes");
const coleccionRouter = require("./routes/coleccion.routes");
const adminRouter = require("./routes/admin.routes");
const notificacionRoutes = require("./routes/notificacion.routes");

const app = express();

const port = Number(process.env.PORT || 3000);
const duracionSesion = 5 * 60 * 1000;

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sesiones",
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: duracionSesion,
});

async function inicializarBaseDatos() {
  await sequelize.authenticate();

  await sequelize.sync();

  await sessionStore.sync();

  const roles = ["admin", "validador", "usuario"];

  for (const nombreRol of roles) {
    await Rol.findOrCreate({
      where: { name: nombreRol },
      defaults: { name: nombreRol },
    });
  }

  const rolUsuario = await Rol.findOne({
    where: { name: "usuario" },
  });

  if (rolUsuario) {
    const usuarioDemo = await Usuario.findOne({
      where: {
        [Op.or]: [
          { correo: "demo@fotaza.test" },
          { nombreUsuario: "demo" },
        ],
      },
    });

    if (!usuarioDemo) {
      const hashContrasena = await bcrypt.hash("123456", 10);

      await Usuario.create({
        idRol: rolUsuario.id,
        nombreUsuario: "demo",
        correo: "demo@fotaza.test",
        hashContrasena,
        nombreVisible: "Usuario Demo",
      });
    }
  }
}

const baseDatosLista = inicializarBaseDatos();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    name: "fotaza.sid",
    secret: process.env.SESSION_SECRET || "fotaza-dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.VERCEL === "1",
      maxAge: duracionSesion,
    },
  }),
);

app.use(express.static(path.join(__dirname, "public")));

/* Esperar conexión con la base */
app.use(async (req, res, next) => {
  try {
    await baseDatosLista;
    next();
  } catch (error) {
    next(error);
  }
});

/* Variables disponibles en todas las vistas */
app.use(async (req, res, next) => {
  try {
    res.locals.appName = "Fotaza 2";
    res.locals.usuarioActual = req.session.usuario || null;
    res.locals.rutaActual = req.path;

    res.locals.filtrosBusqueda = {
      buscar: req.query.buscar?.trim() || "",
      etiqueta: req.query.etiqueta?.trim() || "",
      licencia: req.query.licencia || "",
      autor: req.query.autor?.trim() || "",
      fechaDesde: req.query.fechaDesde || "",
      fechaHasta: req.query.fechaHasta || "",
      valoracionMinima: req.query.valoracionMinima || "",
      orden: req.query.orden || "recientes",
    };

    res.locals.etiquetasDisponibles = await Etiqueta.findAll({
      order: [["name", "ASC"]],
    });

    /*
     * Notificaciones:
     * si no hay usuario logueado, el contador queda en 0.
     */
    res.locals.notificacionesNoLeidas = 0;

    if (req.session.usuario) {
      res.locals.notificacionesNoLeidas = await Notificacion.count({
        where: {
          idUsuario: Number(req.session.usuario.id),
          leida: false,
        },
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

/* Rutas */
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", postRouter);
app.use("/", usuarioRouter);
app.use("/", validadorRouter);
app.use("/", favoritoRouter);
app.use("/", coleccionRouter);
app.use("/", adminRouter);

app.use("/notificaciones", notificacionRoutes);

/* 404 */
app.use((req, res) => {
  res.status(404).render("pages/inicio", {
    title: "Pagina no encontrada",
    publicaciones: [],
  });
});

/* Error general */
app.use((error, req, res, next) => {
  console.error("Error general de la app:", {
    message: error.message,
    name: error.name,
    stack: error.stack,
    original: error.original,
    parent: error.parent,
  });

  res.status(500).render("pages/inicio", {
    title: "Error interno",
    publicaciones: [],
    mensajeError: "Ocurrio un error interno. Intentalo nuevamente.",
    filtrosBusqueda: {},
    etiquetasDisponibles: [],
    usuarioActual: null,
    notificacionesNoLeidas: 0,
  });
});

function verificarConexionDb() {
  baseDatosLista
    .then(() => {
      console.log("Base de datos inicializada correctamente.");
    })
    .catch((error) => {
      console.error(
        `No se pudo conectar a la base de datos: ${
          error.code || error.message
        }`,
      );
    });
}

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    verificarConexionDb();
  });
} else {
  verificarConexionDb();
}

module.exports = app;