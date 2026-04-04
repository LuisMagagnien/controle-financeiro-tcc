const router = require('express').Router()
const auth = require('../middlewares/auth')
const { listar, criar, atualizar, remover } = require('../controllers/metasController')

router.get('/',        auth, listar)
router.post('/',       auth, criar)
router.put('/:id',     auth, atualizar)
router.delete('/:id',  auth, remover)

module.exports = router