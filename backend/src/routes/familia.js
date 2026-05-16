const router = require('express').Router()
const auth = require('../middlewares/auth')
const {
  criarConta, entrarConta, sairConta, buscarConta,
  listarTransacoes, adicionarTransacao, removerTransacao,
  listarMetas, adicionarMeta, atualizarMeta, removerMeta,
  listarCarteiras, adicionarCarteira, removerCarteira,
} = require('../controllers/familiaController')

router.get('/',                    auth, buscarConta)
router.post('/criar',              auth, criarConta)
router.post('/entrar',             auth, entrarConta)
router.post('/sair',               auth, sairConta)

router.get('/transacoes',          auth, listarTransacoes)
router.post('/transacoes',         auth, adicionarTransacao)
router.delete('/transacoes/:id',   auth, removerTransacao)

router.get('/metas',               auth, listarMetas)
router.post('/metas',              auth, adicionarMeta)
router.put('/metas/:id',           auth, atualizarMeta)
router.delete('/metas/:id',        auth, removerMeta)

router.get('/carteiras',           auth, listarCarteiras)
router.post('/carteiras',          auth, adicionarCarteira)
router.delete('/carteiras/:id',    auth, removerCarteira)

module.exports = router