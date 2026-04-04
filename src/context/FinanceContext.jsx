import { createContext, useContext, useState } from 'react'

const FinanceContext = createContext()

const transacoesIniciais = [
  { id: 1, desc: 'Salário',      tipo: 'receita', categoria: 'Salário',     valor: 5000, data: '2024-07-01' },
  { id: 2, desc: 'Aluguel',      tipo: 'despesa', categoria: 'Moradia',     valor: 1200, data: '2024-07-05' },
  { id: 3, desc: 'Supermercado', tipo: 'despesa', categoria: 'Alimentação', valor: 380,  data: '2024-07-08' },
  { id: 4, desc: 'Freelance',    tipo: 'receita', categoria: 'Freelance',   valor: 1800, data: '2024-07-10' },
  { id: 5, desc: 'Conta de luz', tipo: 'despesa', categoria: 'Moradia',     valor: 210,  data: '2024-07-12' },
]

export function FinanceProvider({ children }) {
  const [transacoes, setTransacoes] = useState(transacoesIniciais)

  function adicionarTransacao(transacao) {
    setTransacoes(prev => [{ ...transacao, id: Date.now() }, ...prev])
  }

  function removerTransacao(id) {
    setTransacoes(prev => prev.filter(t => t.id !== id))
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
      transacoes,
      adicionarTransacao,
      removerTransacao,
      totalReceitas,
      totalDespesas,
      saldo,
      gastosPorCategoria,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  return useContext(FinanceContext)
}