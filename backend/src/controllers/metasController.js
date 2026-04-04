const prisma = require('../prisma')

async function listar(req, res) {
  const metas = await prisma.meta.findMany({ where: { usuarioId: req.usuarioId } })
  res.json(metas)
}

async function criar(req, res) {
  const { nome, objetivo, atual, icone, cor } = req.body
  if (!nome || !objetivo)
    return res.status(400).json({ erro: 'Preencha nome e objetivo.' })

  const meta = await prisma.meta.create({
    data: { nome, objetivo: parseFloat(objetivo), atual: parseFloat(atual) || 0, icone: icone || '🎯', cor: cor || '#4ade80', usuarioId: req.usuarioId }
  })
  res.json(meta)
}

async function atualizar(req, res) {
  const { id } = req.params
  const { atual } = req.body
  const meta = await prisma.meta.updateMany({
    where: { id: parseInt(id), usuarioId: req.usuarioId },
    data: { atual: parseFloat(atual) }
  })
  res.json(meta)
}

async function remover(req, res) {
  const { id } = req.params
  await prisma.meta.deleteMany({
    where: { id: parseInt(id), usuarioId: req.usuarioId }
  })
  res.json({ mensagem: 'Meta removida.' })
}

module.exports = { listar, criar, atualizar, remover }