const express = require('express');
const {
  renderLogin,
  renderRegister,
  renderForgotPassword,
} = require('../controllers/authController');

const router = express.Router();

router.get('/login', renderLogin);
router.get('/register', renderRegister);
router.get('/forgot-password', renderForgotPassword);

module.exports = router;
