const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendarController');
const authMiddleware = require('../middlewares/authMiddleware');

//Rotas POST
router.post('/agendar', authMiddleware, agendamentoController.criarAgendamento);

//Rotas GET
router.get('/', authMiddleware, agendamentoController.listarTodos);
router.get('/disponibilidade', agendamentoController.listarPorBarbeiroEDia);

//Rotas PATCH
router.patch('/:id/cancelar', authMiddleware, agendamentoController.cancelarAgendamento)

module.exports = router;