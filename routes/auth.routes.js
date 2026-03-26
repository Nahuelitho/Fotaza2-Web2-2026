const express = require('express');
const {
  renderLogin,
  renderRegister,
  renderForgotPassword,
  registerUser,
  loginUser,
  logoutUser,
} = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/login', requireGuest, renderLogin);
router.get('/register', requireGuest, renderRegister);
router.get('/forgot-password', renderForgotPassword);
router.post('/login', requireGuest, loginUser);
router.post('/register', requireGuest, registerUser);
router.post('/logout', requireAuth, logoutUser);

module.exports = router;
