import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, X } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import './Transacoes.css'

const categorias = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde',
  'Educação', 'Lazer', 'Salário', 'Freelance', 'Outros'
]

const vazio = { desc: '', tipo: 'despesa', categoria: 'Alimentação', valor: '', data: '' }

export default function Transacoes() {
  const { transacoes, adicionarTransacao, removerTransacao,
          totalReceitas, totalDespesas, saldo } = useFinance()
  const [filtro, setFiltro]         = useState('todas')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm]             = useState(vazio)
  const [erro, setErro]             = useState('')
  const [salvando, setSalvando]     = useState(false)

  const transacoesFiltradas = transacoes.filter(t =>
    filtro === 'todas' ? true : t.tipo === filtro
  )

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.desc || !form.valor || !form.data) {
      setErro('Preencha todos os campos.')
      return
    }
    try {
      setSalvando(true)
      await adicionarTransacao({
        desc: form.desc,
        tipo: form.tipo,
        categoria: form.categoria,
        valor: parseFloat(form.valor),
        data: form.data,
      })
      setForm(vazio)
      setModalAberto(false)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarData(data) {
    return data.split('-').reverse().join('/')
  }

  return (
    <div className="transacoes-page">
      <div className="resumo-grid">
        <div className="resumo-card green">
          <TrendingUp size={20} />
          <div>
            <span>Receitas</span>
            <strong>{formatarValor(totalReceitas)}</strong>
          </div>
        </div>
        <div className="resumo-card red">
          <TrendingDown size={20} />
          <div>
            <span>Despesas</span>
            <strong>{formatarValor(totalDespesas)}</strong>
          </div>
        </div>
        <div className={`resumo-card ${saldo >= 0 ? 'blue' : 'red'}`}>
          <div>
            <span>Saldo</span>
            <strong>{formatarValor(saldo)}</strong>
          </div>
        </div>
      </div>

      <div className="acoes-bar">
        <div className="filtros">
          {['todas', 'receita', 'despesa'].map(f => (
            <button
              key={f}
              className={`filtro-btn ${filtro === f ? 'ativo' : ''}`}
              onClick={() => setFiltro(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-nova" onClick={() => setModalAberto(true)}>
          <Plus size={18} />
          Nova transação
        </button>
      </div>

      <div className="tabela-card">
        <div className="tabela-header">
          <span>Descrição</span>
          <span>Categoria</span>
          <span>Data</span>
          <span>Valor</span>
          <span></span>
        </div>
        {transacoesFiltradas.length === 0 ? (
          <div className="tabela-vazia">Nenhuma transação encontrada.</div>
        ) : (
          transacoesFiltradas.map(t => (
            <div key={t.id} className="tabela-row">
              <span className="t-desc">
                <div className={`tipo-dot ${t.tipo}`} />
                {t.desc}
              </span>
              <span className="t-cat">{t.categoria}</span>
              <span className="t-data">{formatarData(t.data)}</span>
              <span className={`t-valor ${t.tipo}`}>
                {t.tipo === 'receita' ? '+' : '-'}{formatarValor(t.valor)}
              </span>
              <button className="btn-remover" onClick={() => removerTransacao(t.id)}>
                <X size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova transação</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="tipo-toggle">
                <button
                  type="button"
                  className={`tipo-btn ${form.tipo === 'despesa' ? 'ativo-red' : ''}`}
                  onClick={() => setForm({ ...form, tipo: 'despesa' })}
                >
                  <TrendingDown size={16} /> Despesa
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${form.tipo === 'receita' ? 'ativo-green' : ''}`}
                  onClick={() => setForm({ ...form, tipo: 'receita' })}
                >
                  <TrendingUp size={16} /> Receita
                </button>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input name="desc" placeholder="Ex: Supermercado" value={form.desc} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input name="valor" type="number" placeholder="0,00" min="0" step="0.01" value={form.valor} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Data</label>
                  <input name="data" type="date" value={form.data} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select name="categoria" value={form.categoria} onChange={handleChange}>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {erro && <div className="form-erro">{erro}</div>}
              <button type="submit" className="btn-salvar" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar transação'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}