import { useFinance } from '../../context/FinanceContext'
import { useState } from 'react'
import {
  TrendingUp, TrendingDown, Target, Wallet,
  PieChart, Upload, Trash2, Plus
} from 'lucide-react'
import './Historico.css'

const iconesPorTipo = {
  'transacao_adicionada_receita': <TrendingUp size={16} />,
  'transacao_adicionada_despesa': <TrendingDown size={16} />,
  'transacao_removida':           <Trash2 size={16} />,
  'meta_adicionada':              <Target size={16} />,
  'meta_removida':                <Trash2 size={16} />,
  'meta_deposito':                <Plus size={16} />,
  'carteira_adicionada':          <Wallet size={16} />,
  'carteira_removida':            <Trash2 size={16} />,
  'orcamento_adicionado':         <PieChart size={16} />,
  'orcamento_removido':           <Trash2 size={16} />,
  'importacao':                   <Upload size={16} />,
}

const coresPorTipo = {
  'transacao_adicionada_receita': 'verde',
  'transacao_adicionada_despesa': 'vermelho',
  'transacao_removida':           'cinza',
  'meta_adicionada':              'roxo',
  'meta_removida':                'cinza',
  'meta_deposito':                'verde',
  'carteira_adicionada':          'azul',
  'carteira_removida':            'cinza',
  'orcamento_adicionado':         'laranja',
  'orcamento_removido':           'cinza',
  'importacao':                   'azul',
}

const filtros = [
  { label: 'Todos',      value: 'todos' },
  { label: 'Transações', value: 'transacao' },
  { label: 'Metas',      value: 'meta' },
  { label: 'Carteiras',  value: 'carteira' },
  { label: 'Orçamento',  value: 'orcamento' },
]

export default function Historico() {
  const { historico } = useFinance()
  const [filtro, setFiltro] = useState('todos')

  const historicoFiltrado = historico.filter(h =>
    filtro === 'todos' ? true : h.tipo.startsWith(filtro)
  )

  function formatarDataHora(dataISO) {
    const d = new Date(dataISO)
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="historico-page">
      <div className="historico-header">
        <h2>Histórico de atividades</h2>
        <p>Acompanhe tudo que aconteceu na sua conta.</p>
      </div>

      <div className="historico-filtros">
        {filtros.map(f => (
          <button
            key={f.value}
            className={`filtro-btn ${filtro === f.value ? 'ativo' : ''}`}
            onClick={() => setFiltro(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {historicoFiltrado.length === 0 ? (
        <div className="historico-vazio">
          <p>Nenhuma atividade registrada ainda.</p>
          <span>As ações que você realizar aparecerão aqui.</span>
        </div>
      ) : (
        <div className="historico-timeline">
          {historicoFiltrado.map((h, i) => (
            <div key={h.id} className="timeline-item">
              <div className={`timeline-icone ${coresPorTipo[h.tipo] || 'cinza'}`}>
                {iconesPorTipo[h.tipo] || <Plus size={16} />}
              </div>
              <div className="timeline-linha" />
              <div className="timeline-conteudo">
                <p className="timeline-descricao">{h.descricao}</p>
                <span className="timeline-data">{formatarDataHora(h.data)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}