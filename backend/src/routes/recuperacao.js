const router = require('express').Router()
const { solicitarRecuperacao, redefinirSenha } = require('../controllers/recuperacaoController')

router.post('/solicitar', solicitarRecuperacao)
router.post('/redefinir', redefinirSenha)

module.exports = router