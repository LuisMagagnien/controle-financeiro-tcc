const prisma = require('../prisma')

async function listar(req, res) {
  const transacoes = await prisma.transacao.findMany({
    where: { usuarioId: req.usuarioId },
    orderBy: { criadoEm: 'desc' }
  })
  res.json(transacoes)
}

async function criar(req, res) {
  const { desc, tipo, categoria, valor, data } = req.body
  if (!desc || !tipo || !categoria || !valor || !data)
    return res.status(400).json({ erro: 'Preencha todos os campos.' })

  const transacao = await prisma.transacao.create({
    data: { desc, tipo, categoria, valor: parseFloat(valor), data, usuarioId: req.usuarioId }
  })
  res.json(transacao)
}

async function remover(req, res) {
  const { id } = req.params
  await prisma.transacao.deleteMany({
    where: { id: parseInt(id), usuarioId: req.usuarioId }
  })
  res.json({ mensagem: 'Transação removida.' })
}

module.exports = { listar, criar, remover }