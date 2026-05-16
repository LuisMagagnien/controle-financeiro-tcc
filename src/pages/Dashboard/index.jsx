import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useFinance } from '../../context/FinanceContext'
import './Dashboard.css'

const CORES = ['#4ade80', '#60a5fa', '#c084fc', '#fb923c', '#f472b6', '#94a3b8']

function TooltipCustom({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip-custom">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name === 'receitas' ? 'Receitas' : 'Despesas'}: R$ {p.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { transacoes, totalReceitas, totalDespesas, saldo, gastosPorCategoria } = useFinance()

  function calcularDadosMensais() {
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const hoje = new Date()
    const resultado = []

    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mes = meses[data.getMonth()]
      const ano = data.getFullYear()
      const mesNum = String(data.getMonth() + 1).padStart(2, '0')

      const receitas = transacoes
        .filter(t => t.tipo === 'receita' && t.data?.startsWith(`${ano}-${mesNum}`))
        .reduce((acc, t) => acc + t.valor, 0)

      const despesas = transacoes
        .filter(t => t.tipo === 'despesa' && t.data?.startsWith(`${ano}-${mesNum}`))
        .reduce((acc, t) => acc + t.valor, 0)

      resultado.push({ mes, receitas, despesas })
    }

    return resultado
  }

  const dadosMensais = calcularDadosMensais()

  const cards = [
    {
      title: 'Saldo Total',
      value: saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: <Wallet size={22} />,
      color: 'card-blue',
      trend: 'Saldo atual',
      up: saldo >= 0,
    },
    {
      title: 'Receitas',
      value: totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: <TrendingUp size={22} />,
      color: 'card-green',
      trend: 'Total de entradas',
      up: true,
    },
    {
      title: 'Despesas',
      value: totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: <TrendingDown size={22} />,
      color: 'card-red',
      trend: 'Total de saídas',
      up: false,
    },
    {
      title: 'Transações',
      value: transacoes.length,
      icon: <Target size={22} />,
      color: 'card-purple',
      trend: 'Lançamentos no período',
      up: true,
    },
  ]

  return (
    <div className="dashboard">

      {/* Cards */}
      <div className="cards-grid">
        {cards.map(card => (
          <div key={card.title} className={`card ${card.color}`}>
            <div className="card-header">
              <span className="card-title">{card.title}</span>
              <div className="card-icon">{card.icon}</div>
            </div>
            <div className="card-value">{card.value}</div>
            <div className={`card-trend ${card.up ? 'up' : 'down'}`}>
              {card.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="graficos-grid">

        <div className="grafico-card">
          <div className="grafico-header">
            <h3>Receitas vs Despesas</h3>
            <span>Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dadosMensais} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="receitas" fill="#4ade80" radius={[6, 6, 0, 0]} />
              <Bar dataKey="despesas" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grafico-legenda">
            <span><span className="dot green" />Receitas</span>
            <span><span className="dot red" />Despesas</span>
          </div>
        </div>

        <div className="grafico-card">
          <div className="grafico-header">
            <h3>Gastos por categoria</h3>
            <span>Período atual</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={gastosPorCategoria.length > 0 ? gastosPorCategoria : [{ name: 'Sem dados', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {(gastosPorCategoria.length > 0 ? gastosPorCategoria : [{}]).map((_, i) => (
                  <Cell key={i} fill={CORES[i % CORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => `R$ ${v.toLocaleString('pt-BR')}`} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={v => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimas transações */}
      <div className="section-title">Últimas transações</div>
      <div className="transacoes-table">
        <div className="table-header">
          <span>Descrição</span>
          <span>Categoria</span>
          <span>Data</span>
          <span>Valor</span>
        </div>
        {transacoes.length === 0 ? (
          <div className="table-row" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            Nenhuma transação cadastrada ainda.
          </div>
        ) : (
          transacoes.slice(0, 5).map((t, i) => (
            <div key={i} className="table-row">
              <span className="t-desc">{t.desc}</span>
              <span className="t-cat">{t.categoria}</span>
              <span className="t-data">{t.data?.split('-').reverse().join('/')}</span>
              <span className={`t-valor ${t.tipo}`}>
                {t.tipo === 'receita' ? '+' : '-'}
                {t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}