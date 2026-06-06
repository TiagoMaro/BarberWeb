const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

//Rotas POST
router.post('/registro', userController.criarUsuario);
router.post('/login', userController.login)
router.put('/perfil', authMiddleware, userController.atualizarPerfil);
router.get('/perfil', authMiddleware, userController.obterPerfil);

module.exports = router;