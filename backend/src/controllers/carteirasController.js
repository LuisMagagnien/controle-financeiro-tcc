const prisma = require('../prisma')

async function listar(req, res) {
  const carteiras = await prisma.carteira.findMany({ where: { usuarioId: req.usuarioId } })
  res.json(carteiras)
}

async function criar(req, res) {
  const { nome, tipo, saldo, cor } = req.body
  if (!nome || !tipo)
    return res.status(400).json({ erro: 'Preencha nome e tipo.' })

  const carteira = await prisma.carteira.create({
    data: { nome, tipo, saldo: parseFloat(saldo) || 0, cor: cor || '#60a5fa', usuarioId: req.usuarioId }
  })
  res.json(carteira)
}

async function remover(req, res) {
  const { id } = req.params
  await prisma.carteira.deleteMany({
    where: { id: parseInt(id), usuarioId: req.usuarioId }
  })
  res.json({ mensagem: 'Carteira removida.' })
}

module.exports = { listar, criar, remover }