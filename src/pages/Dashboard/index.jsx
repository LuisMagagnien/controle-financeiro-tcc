import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target
} from 'lucide-react'
import './Dashboard.css'

const cards = [
  {
    title: 'Saldo Total',
    value: 'R$ 4.250,00',
    icon: <Wallet size={22} />,
    color: 'card-blue',
    trend: '+R$ 320,00 este mês',
    up: true,
  },
  {
    title: 'Receitas',
    value: 'R$ 6.800,00',
    icon: <TrendingUp size={22} />,
    color: 'card-green',
    trend: '+12% vs mês anterior',
    up: true,
  },
  {
    title: 'Despesas',
    value: 'R$ 2.550,00',
    icon: <TrendingDown size={22} />,
    color: 'card-red',
    trend: '-5% vs mês anterior',
    up: false,
  },
  {
    title: 'Meta do Mês',
    value: '68%',
    icon: <Target size={22} />,
    color: 'card-purple',
    trend: 'Meta: economizar R$ 1.000',
    up: true,
  },
]

const transacoes = [
  { desc: 'Salário',        cat: 'Receita',      valor: '+R$ 5.000,00', tipo: 'receita', data: '01/07' },
  { desc: 'Aluguel',        cat: 'Moradia',      valor: '-R$ 1.200,00', tipo: 'despesa', data: '05/07' },
  { desc: 'Supermercado',   cat: 'Alimentação',  valor: '-R$ 380,00',   tipo: 'despesa', data: '08/07' },
  { desc: 'Freelance',      cat: 'Receita',      valor: '+R$ 1.800,00', tipo: 'receita', data: '10/07' },
  { desc: 'Conta de luz',   cat: 'Moradia',      valor: '-R$ 210,00',   tipo: 'despesa', data: '12/07' },
]

export default function Dashboard() {
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

      <div className="section-title">Últimas transações</div>

      <div className="transacoes-table">
        <div className="table-header">
          <span>Descrição</span>
          <span>Categoria</span>
          <span>Data</span>
          <span>Valor</span>
        </div>
        {transacoes.map((t, i) => (
          <div key={i} className="table-row">
            <span className="t-desc">{t.desc}</span>
            <span className="t-cat">{t.cat}</span>
            <span className="t-data">{t.data}</span>
            <span className={`t-valor ${t.tipo}`}>{t.valor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}