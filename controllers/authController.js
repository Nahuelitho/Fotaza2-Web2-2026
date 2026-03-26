const bcrypt = require('bcryptjs');
const {
  findByEmail,
  findByUsername,
  findByEmailOrUsername,
  createUser,
} = require('../models/userModel');

function renderLoginView(res, options = {}) {
  return res.render('pages/login', {
    title: 'Iniciar sesion | Fotaza 2',
    authTitle: 'Volve a tu espacio visual.',
    authEyebrow: 'Iniciar sesion',
    authText: 'Accede a tus publicaciones, favoritos y conexiones dentro de la comunidad.',
    authMode: 'login',
    errorMessage: '',
    formData: {},
    ...options,
  });
}

function renderRegisterView(res, options = {}) {
  return res.render('pages/register', {
    title: 'Crear cuenta | Fotaza 2',
    authTitle: 'Crea tu perfil en Fotaza 2.',
    authEyebrow: 'Crear cuenta',
    authText: 'Empieza a compartir imagenes, seguir autores y construir tu coleccion personal.',
    authMode: 'register',
    errorMessage: '',
    formData: {},
    ...options,
  });
}

function renderForgotPassword(req, res) {
  res.render('pages/forgot-password', {
    title: 'Recuperar contrasena | Fotaza 2',
    authTitle: 'Recupera el acceso a tu cuenta.',
    authEyebrow: 'Olvide mi contrasena',
    authText: 'Esta vista queda preparada para el flujo de recuperacion que conectaremos mas adelante.',
    authMode: 'forgot-password',
  });
}

function renderLogin(req, res) {
  return renderLoginView(res);
}

function renderRegister(req, res) {
  return renderRegisterView(res);
}

async function registerUser(req, res) {
  const { displayName, username, email, password, confirmPassword } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedUsername = username?.trim();
  const normalizedDisplayName = displayName?.trim();

  if (!normalizedDisplayName || !normalizedUsername || !normalizedEmail || !password || !confirmPassword) {
    return renderRegisterView(res, {
      errorMessage: 'Completa todos los campos para crear la cuenta.',
      formData: { displayName: normalizedDisplayName, username: normalizedUsername, email: normalizedEmail },
    });
  }

  if (password.length < 6) {
    return renderRegisterView(res, {
      errorMessage: 'La contrasena debe tener al menos 6 caracteres.',
      formData: { displayName: normalizedDisplayName, username: normalizedUsername, email: normalizedEmail },
    });
  }

  if (password !== confirmPassword) {
    return renderRegisterView(res, {
      errorMessage: 'La confirmacion de la contrasena no coincide.',
      formData: { displayName: normalizedDisplayName, username: normalizedUsername, email: normalizedEmail },
    });
  }

  try {
    const existingEmail = await findByEmail(normalizedEmail);
    if (existingEmail) {
      return renderRegisterView(res, {
        errorMessage: 'Ese correo ya esta registrado.',
        formData: { displayName: normalizedDisplayName, username: normalizedUsername, email: normalizedEmail },
      });
    }

    const existingUsername = await findByUsername(normalizedUsername);
    if (existingUsername) {
      return renderRegisterView(res, {
        errorMessage: 'Ese nombre de usuario ya esta en uso.',
        formData: { displayName: normalizedDisplayName, username: normalizedUsername, email: normalizedEmail },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      displayName: normalizedDisplayName,
    });

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
    };

    return res.redirect('/');
  } catch (error) {
    return renderRegisterView(res, {
      errorMessage: error.message || 'No se pudo crear la cuenta en este momento.',
      formData: { displayName: normalizedDisplayName, username: normalizedUsername, email: normalizedEmail },
    });
  }
}

async function loginUser(req, res) {
  const { identifier, password } = req.body;
  const normalizedIdentifier = identifier?.trim();

  if (!normalizedIdentifier || !password) {
    return renderLoginView(res, {
      errorMessage: 'Ingresa tu usuario o correo y la contrasena.',
      formData: { identifier: normalizedIdentifier },
    });
  }

  try {
    const user = await findByEmailOrUsername(normalizedIdentifier);

    if (!user) {
      return renderLoginView(res, {
        errorMessage: 'No encontramos un usuario con esas credenciales.',
        formData: { identifier: normalizedIdentifier },
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return renderLoginView(res, {
        errorMessage: 'La contrasena es incorrecta.',
        formData: { identifier: normalizedIdentifier },
      });
    }

    if (!user.is_active) {
      return renderLoginView(res, {
        errorMessage: 'Tu cuenta esta inactiva. Contacta al administrador.',
        formData: { identifier: normalizedIdentifier },
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
    };

    return res.redirect('/');
  } catch (error) {
    return renderLoginView(res, {
      errorMessage: error.message || 'No se pudo iniciar sesion en este momento.',
      formData: { identifier: normalizedIdentifier },
    });
  }
}

function logoutUser(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = {
  renderLogin,
  renderRegister,
  renderForgotPassword,
  registerUser,
  loginUser,
  logoutUser,
};
