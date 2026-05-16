const crypto = require('crypto')
const prisma = require('../prisma')

async function criarConta(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: { conta: true }
    })

    if (usuario.conta) {
      return res.status(400).json({ erro: 'Você já faz parte de uma conta compartilhada.' })
    }

    const codigo = crypto.randomBytes(4).toString('hex').toUpperCase()

    const conta = await prisma.contaCompartilhada.create({
      data: {
        codigo,
        usuarios: { connect: { id: req.usuarioId } }
      },
      include: { usuarios: { select: { id: true, nome: true, email: true } } }
    })

    res.json(conta)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar conta compartilhada.' })
  }
}

async function entrarConta(req, res) {
  try {
    const { codigo } = req.body
    if (!codigo) return res.status(400).json({ erro: 'Informe o código.' })

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: { conta: true }
    })

    if (usuario.conta) {
      return res.status(400).json({ erro: 'Você já faz parte de uma conta compartilhada.' })
    }

    const conta = await prisma.contaCompartilhada.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: { usuarios: true }
    })

    if (!conta) return res.status(404).json({ erro: 'Código inválido.' })
    if (conta.usuarios.length >= 5) return res.status(400).json({ erro: 'Conta cheia (máximo 5 pessoas).' })

    const contaAtualizada = await prisma.contaCompartilhada.update({
      where: { id: conta.id },
      data: { usuarios: { connect: { id: req.usuarioId } } },
      include: { usuarios: { select: { id: true, nome: true, email: true } } }
    })

    res.json(contaAtualizada)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao entrar na conta.' })
  }
}

async function sairConta(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: { conta: { include: { usuarios: true } } }
    })

    if (!usuario.conta) return res.status(400).json({ erro: 'Você não faz parte de uma conta compartilhada.' })

    await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: { contaId: null }
    })

    if (usuario.conta.usuarios.length === 1) {
      await prisma.contaCompartilhada.delete({ where: { id: usuario.conta.id } })
    }

    res.json({ mensagem: 'Saiu da conta compartilhada.' })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao sair da conta.' })
  }
}

async function buscarConta(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: {
        conta: {
          include: {
            usuarios: { select: { id: true, nome: true, email: true } }
          }
        }
      }
    })

    if (!usuario.conta) return res.json(null)
    res.json(usuario.conta)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar conta.' })
  }
}

async function listarTransacoes(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } })
    if (!usuario.contaId) return res.json([])

    const transacoes = await prisma.transacaoCompartilhada.findMany({
      where: { contaId: usuario.contaId },
      orderBy: { criadoEm: 'desc' }
    })
    res.json(transacoes)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar transações.' })
  }
}

async function adicionarTransacao(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } })
    if (!usuario.contaId) return res.status(400).json({ erro: 'Você não faz parte de uma conta compartilhada.' })

    const { desc, tipo, categoria, valor, data } = req.body
    const transacao = await prisma.transacaoCompartilhada.create({
      data: {
        desc, tipo, categoria,
        valor: parseFloat(valor),
        data,
        autorNome: usuario.nome,
        contaId: usuario.contaId
      }
    })
    res.json(transacao)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao adicionar transação.' })
  }
}

async function removerTransacao(req, res) {
  try {
    const { id } = req.params
    await prisma.transacaoCompartilhada.delete({ where: { id: parseInt(id) } })
    res.json({ mensagem: 'Transação removida.' })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover transação.' })
  }
}

async function listarMetas(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } })
    if (!usuario.contaId) return res.json([])
    const metas = await prisma.metaCompartilhada.findMany({ where: { contaId: usuario.contaId } })
    res.json(metas)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar metas.' })
  }
}

async function adicionarMeta(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } })
    if (!usuario.contaId) return res.status(400).json({ erro: 'Você não faz parte de uma conta compartilhada.' })

    const { nome, objetivo, atual, icone, cor } = req.body
    const meta = await prisma.metaCompartilhada.create({
      data: {
        nome,
        objetivo: parseFloat(objetivo),
        atual: parseFloat(atual) || 0,
        icone: icone || '🎯',
        cor: cor || '#4ade80',
        contaId: usuario.contaId
      }
    })
    res.json(meta)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao adicionar meta.' })
  }
}

async function atualizarMeta(req, res) {
  try {
    const { id } = req.params
    const { atual } = req.body
    const meta = await prisma.metaCompartilhada.update({
      where: { id: parseInt(id) },
      data: { atual: parseFloat(atual) }
    })
    res.json(meta)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar meta.' })
  }
}

async function removerMeta(req, res) {
  try {
    const { id } = req.params
    await prisma.metaCompartilhada.delete({ where: { id: parseInt(id) } })
    res.json({ mensagem: 'Meta removida.' })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover meta.' })
  }
}

async function listarCarteiras(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } })
    if (!usuario.contaId) return res.json([])
    const carteiras = await prisma.carteiraCompartilhada.findMany({ where: { contaId: usuario.contaId } })
    res.json(carteiras)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar carteiras.' })
  }
}

async function adicionarCarteira(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } })
    if (!usuario.contaId) return res.status(400).json({ erro: 'Você não faz parte de uma conta compartilhada.' })

    const { nome, tipo, saldo, cor } = req.body
    const carteira = await prisma.carteiraCompartilhada.create({
      data: {
        nome,
        tipo,
        saldo: parseFloat(saldo) || 0,
        cor: cor || '#60a5fa',
        contaId: usuario.contaId
      }
    })
    res.json(carteira)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao adicionar carteira.' })
  }
}

async function removerCarteira(req, res) {
  try {
    const { id } = req.params
    await prisma.carteiraCompartilhada.delete({ where: { id: parseInt(id) } })
    res.json({ mensagem: 'Carteira removida.' })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover carteira.' })
  }
}

module.exports = {
  criarConta, entrarConta, sairConta, buscarConta,
  listarTransacoes, adicionarTransacao, removerTransacao,
  listarMetas, adicionarMeta, atualizarMeta, removerMeta,
  listarCarteiras, adicionarCarteira, removerCarteira,
}