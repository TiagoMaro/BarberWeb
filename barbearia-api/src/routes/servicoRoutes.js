const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', servicoController.listarServicos);
router.post('/', authMiddleware, servicoController.criarServico);

// Novas rotas:
// PUT é usado quando vamos atualizar os dados do objeto
router.put('/:id', authMiddleware, servicoController.atualizarServico);

// PATCH é usado quando vamos alterar apenas uma pequena flag (o status)
router.patch('/:id/inativar', authMiddleware, servicoController.inativarServico);

module.exports = router;