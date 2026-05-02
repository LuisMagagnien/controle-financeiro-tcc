import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const FinanceContext = createContext()

export function FinanceProvider({ children }) {
  const [transacoes, setTransacoes] = useState([])
  const [metas, setMetas]           = useState([])
  const [carteiras, setCarteiras]   = useState([])
  const [orcamentos, setOrcamentos] = useState([])
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
  }

  async function removerTransacao(id) {
    await api.delete(`/transacoes/${id}`)
    setTransacoes(prev => prev.filter(t => t.id !== id))
  }

  async function adicionarMeta(meta) {
    const nova = await api.post('/metas', meta)
    setMetas(prev => [...prev, nova])
  }

  async function atualizarMeta(id, atual) {
    await api.put(`/metas/${id}`, { atual })
    setMetas(prev => prev.map(m => m.id === id ? { ...m, atual } : m))
  }

  async function removerMeta(id) {
    await api.delete(`/metas/${id}`)
    setMetas(prev => prev.filter(m => m.id !== id))
  }

  async function adicionarCarteira(carteira) {
    const nova = await api.post('/carteiras', carteira)
    setCarteiras(prev => [...prev, nova])
  }

  async function removerCarteira(id) {
    await api.delete(`/carteiras/${id}`)
    setCarteiras(prev => prev.filter(c => c.id !== id))
  }

  function adicionarOrcamento(orc) {
    setOrcamentos(prev => [...prev, orc])
  }

  function removerOrcamento(index) {
    setOrcamentos(prev => prev.filter((_, i) => i !== index))
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
      transacoes, metas, carteiras, orcamentos, loading,
      adicionarTransacao, removerTransacao,
      adicionarMeta, atualizarMeta, removerMeta,
      adicionarCarteira, removerCarteira,
      adicionarOrcamento, removerOrcamento,
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