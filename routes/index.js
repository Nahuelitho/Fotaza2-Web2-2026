const express = require('express');
const { renderHome } = require('../controllers/home.controller');

const router = express.Router();

router.get('/', renderHome);

module.exports = router;
