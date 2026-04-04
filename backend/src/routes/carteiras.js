const router = require('express').Router()
const auth = require('../middlewares/auth')
const { listar, criar, remover } = require('../controllers/carteirasController')

router.get('/',       auth, listar)
router.post('/',      auth, criar)
router.delete('/:id', auth, remover)

module.exports = router