import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import './Orcamento.css'

const categorias = [
  'Alimentação','Moradia','Transporte','Saúde',
  'Educação','Lazer','Freelance','Outros'
]

const vazio = { categoria: 'Alimentação', limite: '' }

export default function Orcamento() {
  const { transacoes, orcamentos, adicionarOrcamento, removerOrcamento } = useFinance()
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm]               = useState(vazio)
  const [erro, setErro]               = useState('')

  function formatarValor(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function gastoCategoria(categoria) {
    return transacoes
      .filter(t => t.tipo === 'despesa' && t.categoria === categoria)
      .reduce((acc, t) => acc + t.valor, 0)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.limite || parseFloat(form.limite) <= 0) {
      setErro('Informe um limite válido.')
      return
    }
    if (orcamentos.find(o => o.categoria === form.categoria)) {
      setErro('Já existe um orçamento para essa categoria.')
      return
    }
    adicionarOrcamento({ categoria: form.categoria, limite: parseFloat(form.limite) })
    setForm(vazio)
    setModalAberto(false)
    setErro('')
  }

  return (
    <div className="orcamento-page">
      <div className="orcamento-header">
        <h2>Orçamento por categoria</h2>
        <p>Defina limites de gastos e receba alertas quando estiver próximo do limite.</p>
      </div>

      <div className="orcamento-acoes">
        <button className="btn-novo-orc" onClick={() => setModalAberto(true)}>
          <Plus size={18} />
          Novo orçamento
        </button>
      </div>

      {orcamentos.length === 0 ? (
        <div className="orcamento-vazio">
          <p>Nenhum orçamento definido ainda.</p>
          <span>Crie um orçamento para começar a receber alertas de gastos.</span>
          <button onClick={() => setModalAberto(true)}>Criar primeiro orçamento</button>
        </div>
      ) : (
        <div className="orcamento-grid">
          {orcamentos.map((orc, i) => {
            const gasto = gastoCategoria(orc.categoria)
            const pct   = Math.min(Math.round((gasto / orc.limite) * 100), 100)
            const status = pct >= 100 ? 'critico' : pct >= 80 ? 'aviso' : 'ok'

            return (
              <div key={i} className={`orc-card ${status}`}>
                <div className="orc-card-header">
                  <div className="orc-info">
                    <h3>{orc.categoria}</h3>
                    <span className={`orc-badge ${status}`}>
                      {status === 'critico' ? 'Limite ultrapassado' : status === 'aviso' ? 'Atenção' : 'No limite'}
                    </span>
                  </div>
                  <button className="btn-remover-orc" onClick={() => removerOrcamento(i)}>
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="orc-valores">
                  <span className="orc-gasto">{formatarValor(gasto)}</span>
                  <span className="orc-limite">de {formatarValor(orc.limite)}</span>
                </div>

                <div className="orc-barra-bg">
                  <div className={`orc-barra ${status}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="orc-footer">
                  <span className={`orc-pct ${status}`}>{pct}% utilizado</span>
                  <span className="orc-restante">
                    {gasto > orc.limite
                      ? `${formatarValor(gasto - orc.limite)} acima`
                      : `${formatarValor(orc.limite - gasto)} restante`
                    }
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo orçamento</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={form.categoria}
                  onChange={e => { setForm({ ...form, categoria: e.target.value }); setErro('') }}
                >
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Limite mensal (R$)</label>
                <input
                  type="number" min="0" step="0.01" placeholder="0,00"
                  value={form.limite}
                  onChange={e => { setForm({ ...form, limite: e.target.value }); setErro('') }}
                />
              </div>
              {erro && <div className="form-erro">{erro}</div>}
              <button type="submit" className="btn-salvar">Criar orçamento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}