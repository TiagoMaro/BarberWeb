const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//Rotas POST
router.post('/registro', userController.criarUsuario);
router.post('/login', userController.login)

module.exports = router;