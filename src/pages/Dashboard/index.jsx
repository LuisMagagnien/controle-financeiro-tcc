import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useFinance } from '../../context/FinanceContext'
import './Dashboard.css'

const dadosMensais = [
  { mes: 'Jan', receitas: 5200, despesas: 3100 },
  { mes: 'Fev', receitas: 4800, despesas: 2900 },
  { mes: 'Mar', receitas: 6100, despesas: 3400 },
  { mes: 'Abr', receitas: 5500, despesas: 2800 },
  { mes: 'Mai', receitas: 7200, despesas: 3900 },
  { mes: 'Jun', receitas: 6800, despesas: 2550 },
]

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

  const cards = [
    { title: 'Saldo Total',  value: saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <Wallet size={22} />,      color: 'card-blue',   trend: 'Saldo atual',          up: saldo >= 0 },
    { title: 'Receitas',     value: totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <TrendingUp size={22} />,   color: 'card-green',  trend: 'Total de entradas',    up: true },
    { title: 'Despesas',     value: totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <TrendingDown size={22} />, color: 'card-red',    trend: 'Total de saídas',      up: false },
    { title: 'Transações',   value: transacoes.length,                                                              icon: <Target size={22} />,       color: 'card-purple', trend: 'Lançamentos no período', up: true },
  ]

  return (
    <div className="dashboard">
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

      <div className="graficos-grid">
        <div className="grafico-card">
          <div className="grafico-header">
            <h3>Receitas vs Despesas</h3>
            <span>Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dadosMensais} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
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
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: '#555' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-title">Últimas transações</div>
      <div className="transacoes-table">
        <div className="table-header">
          <span>Descrição</span>
          <span>Categoria</span>
          <span>Data</span>
          <span>Valor</span>
        </div>
        {transacoes.slice(0, 5).map((t, i) => (
          <div key={i} className="table-row">
            <span className="t-desc">{t.desc}</span>
            <span className="t-cat">{t.categoria}</span>
            <span className="t-data">{t.data}</span>
            <span className={`t-valor ${t.tipo}`}>
              {t.tipo === 'receita' ? '+' : '-'}
              {t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}