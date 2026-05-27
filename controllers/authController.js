const bcrypt = require('bcryptjs');
const {
  buscarPorCorreo,
  buscarPorUsuario,
  buscarPorCorreoOUsuario,
  crearUsuario,
} = require('../models/userModel');

function renderizarVistaInicioSesion(res, opciones = {}) {
  return res.render('pages/login', {
    title: 'Iniciar sesion | Fotaza 2',
    tituloAuth: 'Iniciar sesion',
    cejaAuth: '',
    textoAuth: '',
    modoAuth: 'inicio-sesion',
    mensajeError: '',
    datosFormulario: {},
    ...opciones,
  });
}

function renderizarVistaRegistro(res, opciones = {}) {
  return res.render('pages/register', {
    title: 'Crear cuenta | Fotaza 2',
    tituloAuth: 'Crear cuenta',
    cejaAuth: '',
    textoAuth: '',
    modoAuth: 'registro',
    mensajeError: '',
    datosFormulario: {},
    ...opciones,
  });
}

function mostrarRecuperarContrasena(req, res) {
  res.render('pages/recuperar-contrasena', {
    title: 'Recuperar contrasena | Fotaza 2',
    tituloAuth: 'Recuperar contrasena',
    cejaAuth: '',
    textoAuth: '',
    modoAuth: 'recuperar-contrasena',
  });
}

function mostrarInicioSesion(req, res) {
  return renderizarVistaInicioSesion(res);
}

function mostrarRegistro(req, res) {
  return renderizarVistaRegistro(res);
}

async function registrarUsuario(req, res) {
  const { nombreVisible, usuario, correo, contrasena, confirmarContrasena } = req.body;
  const correoNormalizado = correo?.trim().toLowerCase();
  const usuarioNormalizado = usuario?.trim();
  const nombreVisibleNormalizado = nombreVisible?.trim();

  if (!nombreVisibleNormalizado || !usuarioNormalizado || !correoNormalizado || !contrasena || !confirmarContrasena) {
    return renderizarVistaRegistro(res, {
      mensajeError: 'Completa todos los campos para crear la cuenta.',
      datosFormulario: { nombreVisible: nombreVisibleNormalizado, usuario: usuarioNormalizado, correo: correoNormalizado },
    });
  }

  if (contrasena.length < 6) {
    return renderizarVistaRegistro(res, {
      mensajeError: 'La contrasena debe tener al menos 6 caracteres.',
      datosFormulario: { nombreVisible: nombreVisibleNormalizado, usuario: usuarioNormalizado, correo: correoNormalizado },
    });
  }

  if (contrasena !== confirmarContrasena) {
    return renderizarVistaRegistro(res, {
      mensajeError: 'La confirmacion de la contrasena no coincide.',
      datosFormulario: { nombreVisible: nombreVisibleNormalizado, usuario: usuarioNormalizado, correo: correoNormalizado },
    });
  }

  try {
    const correoExistente = await buscarPorCorreo(correoNormalizado);
    if (correoExistente) {
      return renderizarVistaRegistro(res, {
        mensajeError: 'Ese correo ya esta registrado.',
        datosFormulario: { nombreVisible: nombreVisibleNormalizado, usuario: usuarioNormalizado, correo: correoNormalizado },
      });
    }

    const usuarioExistente = await buscarPorUsuario(usuarioNormalizado);
    if (usuarioExistente) {
      return renderizarVistaRegistro(res, {
        mensajeError: 'Ese nombre de usuario ya esta en uso.',
        datosFormulario: { nombreVisible: nombreVisibleNormalizado, usuario: usuarioNormalizado, correo: correoNormalizado },
      });
    }

    const hashContrasena = await bcrypt.hash(contrasena, 10);
    const usuarioCreado = await crearUsuario({
      usuario: usuarioNormalizado,
      correo: correoNormalizado,
      hashContrasena,
      nombreVisible: nombreVisibleNormalizado,
    });

    req.session.user = {
      id: usuarioCreado.id,
      usuario: usuarioCreado.usuario,
      correo: usuarioCreado.correo,
      nombreVisible: usuarioCreado.nombre_visible,
    };

    return res.redirect('/');
  } catch (errorDeRegistro) {
    return renderizarVistaRegistro(res, {
      mensajeError: errorDeRegistro.message || 'No se pudo crear la cuenta en este momento.',
      datosFormulario: { nombreVisible: nombreVisibleNormalizado, usuario: usuarioNormalizado, correo: correoNormalizado },
    });
  }
}

async function iniciarSesionUsuario(req, res) {
  const { identificador, contrasena } = req.body;
  const identificadorNormalizado = identificador?.trim();

  if (!identificadorNormalizado || !contrasena) {
    return renderizarVistaInicioSesion(res, {
      mensajeError: 'Ingresa tu usuario o correo y la contrasena.',
      datosFormulario: { identificador: identificadorNormalizado },
    });
  }

  try {
    const usuario = await buscarPorCorreoOUsuario(identificadorNormalizado);

    if (!usuario) {
      return renderizarVistaInicioSesion(res, {
        mensajeError: 'No encontramos un usuario con esas credenciales.',
        datosFormulario: { identificador: identificadorNormalizado },
      });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.password_hash);

    if (!contrasenaValida) {
      return renderizarVistaInicioSesion(res, {
        mensajeError: 'La contrasena es incorrecta.',
        datosFormulario: { identificador: identificadorNormalizado },
      });
    }

    if (!usuario.is_active) {
      return renderizarVistaInicioSesion(res, {
        mensajeError: 'Tu cuenta esta inactiva. Contacta al administrador.',
        datosFormulario: { identificador: identificadorNormalizado },
      });
    }

    req.session.user = {
      id: usuario.id,
      usuario: usuario.username,
      correo: usuario.email,
      nombreVisible: usuario.display_name,
    };

    return res.redirect('/');
  } catch (errorDeInicioSesion) {
    return renderizarVistaInicioSesion(res, {
      mensajeError: errorDeInicioSesion.message || 'No se pudo iniciar sesion en este momento.',
      datosFormulario: { identificador: identificadorNormalizado },
    });
  }
}

function cerrarSesionUsuario(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = {
  mostrarInicioSesion,
  mostrarRegistro,
  mostrarRecuperarContrasena,
  registrarUsuario,
  iniciarSesionUsuario,
  cerrarSesionUsuario,
};
