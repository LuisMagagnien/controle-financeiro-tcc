const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const prisma = require('../prisma')
const { enviarEmailRecuperacao } = require('../services/email')

async function solicitarRecuperacao(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ erro: 'Informe o e-mail.' })

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario)
    return res.json({ mensagem: 'Se o e-mail existir, você receberá as instruções.' })

  const token = crypto.randomBytes(32).toString('hex')
  const expiracao = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.tokenRecuperacao.create({
    data: { token, usuarioId: usuario.id, expiracao }
  })

  await enviarEmailRecuperacao(usuario.email, usuario.nome, token)

  res.json({ mensagem: 'Se o e-mail existir, você receberá as instruções.' })
}

async function redefinirSenha(req, res) {
  const { token, novaSenha } = req.body
  if (!token || !novaSenha)
    return res.status(400).json({ erro: 'Token e nova senha são obrigatórios.' })

  const tokenRecord = await prisma.tokenRecuperacao.findUnique({ where: { token } })

  if (!tokenRecord || tokenRecord.usado || tokenRecord.expiracao < new Date())
    return res.status(400).json({ erro: 'Token inválido ou expirado.' })

  const hash = await bcrypt.hash(novaSenha, 10)

  await prisma.usuario.update({
    where: { id: tokenRecord.usuarioId },
    data: { senha: hash }
  })

  await prisma.tokenRecuperacao.update({
    where: { token },
    data: { usado: true }
  })

  res.json({ mensagem: 'Senha redefinida com sucesso!' })
}

module.exports = { solicitarRecuperacao, redefinirSenha }