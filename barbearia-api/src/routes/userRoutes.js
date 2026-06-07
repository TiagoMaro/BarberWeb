const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

//Rotas POST
router.post('/registro', userController.criarUsuario);
router.post('/login', userController.login)

//Rotas PUT
router.put('/perfil', authMiddleware, userController.atualizarPerfil);

//Rotas GET
router.get('/perfil', authMiddleware, userController.obterPerfil);
router.get('/', authMiddleware, userController.listarUsuarios);

//Rotas PATCH
router.patch('/:id/cargo', authMiddleware, userController.alterarCargo);


module.exports = router;