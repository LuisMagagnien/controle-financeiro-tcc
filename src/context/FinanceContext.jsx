import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const FinanceContext = createContext()

function registrar(setHistorico, tipo, descricao) {
  setHistorico(prev => [{
    id: Date.now(),
    tipo,
    descricao,
    data: new Date().toISOString(),
  }, ...prev].slice(0, 100))
}

export function FinanceProvider({ children }) {
  const [transacoes, setTransacoes] = useState([])
  const [metas, setMetas]           = useState([])
  const [carteiras, setCarteiras]   = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [historico, setHistorico]   = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    Promise.all([
      api.get('/transacoes'),
      api.get('/metas'),
      api.get('/carteiras'),
    ]).then(([t, m, c]) => {
      setTransacoes(t)
      setMetas(m)
      setCarteiras(c)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function adicionarTransacao(transacao) {
    const nova = await api.post('/transacoes', transacao)
    setTransacoes(prev => [nova, ...prev])
    registrar(setHistorico,
      `transacao_adicionada_${nova.tipo}`,
      `${nova.tipo === 'receita' ? 'Receita' : 'Despesa'} adicionada: ${nova.desc} — ${nova.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    )
  }

  async function removerTransacao(id) {
    const t = transacoes.find(t => t.id === id)
    await api.delete(`/transacoes/${id}`)
    setTransacoes(prev => prev.filter(t => t.id !== id))
    if (t) registrar(setHistorico, 'transacao_removida', `Transação removida: ${t.desc}`)
  }

  async function adicionarMeta(meta) {
    const nova = await api.post('/metas', meta)
    setMetas(prev => [...prev, nova])
    registrar(setHistorico, 'meta_adicionada', `Meta criada: ${nova.nome} — objetivo: ${nova.objetivo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
  }

  async function atualizarMeta(id, atual) {
    await api.put(`/metas/${id}`, { atual })
    const m = metas.find(m => m.id === id)
    setMetas(prev => prev.map(m => m.id === id ? { ...m, atual } : m))
    if (m) registrar(setHistorico, 'meta_deposito', `Depósito na meta "${m.nome}": ${atual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
  }

  async function removerMeta(id) {
    const m = metas.find(m => m.id === id)
    await api.delete(`/metas/${id}`)
    setMetas(prev => prev.filter(m => m.id !== id))
    if (m) registrar(setHistorico, 'meta_removida', `Meta removida: ${m.nome}`)
  }

  async function adicionarCarteira(carteira) {
    const nova = await api.post('/carteiras', carteira)
    setCarteiras(prev => [...prev, nova])
    registrar(setHistorico, 'carteira_adicionada', `Carteira adicionada: ${nova.nome} — saldo: ${nova.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
  }

  async function removerCarteira(id) {
    const c = carteiras.find(c => c.id === id)
    await api.delete(`/carteiras/${id}`)
    setCarteiras(prev => prev.filter(c => c.id !== id))
    if (c) registrar(setHistorico, 'carteira_removida', `Carteira removida: ${c.nome}`)
  }

  function adicionarOrcamento(orc) {
    setOrcamentos(prev => [...prev, orc])
    registrar(setHistorico, 'orcamento_adicionado', `Orçamento criado: ${orc.categoria} — limite: ${orc.limite.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
  }

  function removerOrcamento(index) {
    const orc = orcamentos[index]
    setOrcamentos(prev => prev.filter((_, i) => i !== index))
    if (orc) registrar(setHistorico, 'orcamento_removido', `Orçamento removido: ${orc.categoria}`)
  }

  function registrarImportacao(qtd) {
    registrar(setHistorico, 'importacao', `Importação realizada: ${qtd} registros importados`)
  }

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0)

  const saldo = totalReceitas - totalDespesas

  const gastosPorCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      const existing = acc.find(i => i.name === t.categoria)
      if (existing) existing.value += t.valor
      else acc.push({ name: t.categoria, value: t.valor })
      return acc
    }, [])

  return (
    <FinanceContext.Provider value={{
      transacoes, metas, carteiras, orcamentos, historico, loading,
      adicionarTransacao, removerTransacao,
      adicionarMeta, atualizarMeta, removerMeta,
      adicionarCarteira, removerCarteira,
      adicionarOrcamento, removerOrcamento,
      registrarImportacao,
      totalReceitas, totalDespesas, saldo,
      gastosPorCategoria,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  return useContext(FinanceContext)
}