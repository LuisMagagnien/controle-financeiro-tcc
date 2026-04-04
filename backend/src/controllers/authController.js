const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

async function cadastrar(req, res) {
  const { nome, email, senha } = req.body
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: 'Preencha todos os campos.' })

  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe)
    return res.status(400).json({ erro: 'E-mail já cadastrado.' })

  const hash = await bcrypt.hash(senha, 10)
  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: hash }
  })

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } })
}

async function login(req, res) {
  const { email, senha } = req.body
  if (!email || !senha)
    return res.status(400).json({ erro: 'Preencha todos os campos.' })

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario)
    return res.status(400).json({ erro: 'E-mail ou senha incorretos.' })

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
  if (!senhaCorreta)
    return res.status(400).json({ erro: 'E-mail ou senha incorretos.' })

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } })
}

module.exports = { cadastrar, login }