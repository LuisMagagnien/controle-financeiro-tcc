import { useState } from 'react'
import { Plus, Target, Trash2, X } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import './Metas.css'

const icones  = ['🎯','✈','🛡','💻','📚','🏠','🚗','💍','🎓','🏋','🎮','🌎']
const cores   = ['#4ade80','#60a5fa','#c084fc','#fb923c','#f472b6','#facc15','#f87171','#34d399']
const vazio   = { nome: '', objetivo: '', atual: '', icone: '🎯', cor: '#4ade80' }

export default function Metas() {
  const { metas, adicionarMeta, atualizarMeta, removerMeta } = useFinance()
  const [modalAberto, setModalAberto]     = useState(false)
  const [modalDeposito, setModalDeposito] = useState(null)
  const [form, setForm]                   = useState(vazio)
  const [deposito, setDeposito]           = useState('')
  const [erro, setErro]                   = useState('')
  const [salvando, setSalvando]           = useState(false)

  const totalObjetivo   = metas.reduce((acc, m) => acc + m.objetivo, 0)
  const totalAtual      = metas.reduce((acc, m) => acc + m.atual, 0)
  const metasConcluidas = metas.filter(m => m.atual >= m.objetivo).length

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.objetivo) {
      setErro('Preencha nome e valor objetivo.')
      return
    }
    try {
      setSalvando(true)
      await adicionarMeta({
        nome: form.nome,
        objetivo: parseFloat(form.objetivo),
        atual: parseFloat(form.atual) || 0,
        icone: form.icone,
        cor: form.cor,
      })
      setForm(vazio)
      setModalAberto(false)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  async function handleDeposito(e) {
    e.preventDefault()
    if (!deposito || parseFloat(deposito) <= 0) return
    const novoAtual = Math.min(
      modalDeposito.atual + parseFloat(deposito),
      modalDeposito.objetivo
    )
    await atualizarMeta(modalDeposito.id, novoAtual)
    setDeposito('')
    setModalDeposito(null)
  }

  function formatarValor(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function calcularPorcentagem(atual, objetivo) {
    return Math.min(Math.round((atual / objetivo) * 100), 100)
  }

  return (
    <div className="metas-page">
      <div className="metas-resumo">
        <div className="resumo-item">
          <span>Total de metas</span>
          <strong>{metas.length}</strong>
        </div>
        <div className="resumo-divider" />
        <div className="resumo-item">
          <span>Metas concluídas</span>
          <strong className="verde">{metasConcluidas}</strong>
        </div>
        <div className="resumo-divider" />
        <div className="resumo-item">
          <span>Total acumulado</span>
          <strong>{formatarValor(totalAtual)}</strong>
        </div>
        <div className="resumo-divider" />
        <div className="resumo-item">
          <span>Total objetivado</span>
          <strong>{formatarValor(totalObjetivo)}</strong>
        </div>
        <button className="btn-nova-meta" onClick={() => setModalAberto(true)}>
          <Plus size={18} />
          Nova meta
        </button>
      </div>

      {metas.length === 0 ? (
        <div className="metas-vazio">
          <Target size={48} />
          <p>Nenhuma meta cadastrada ainda.</p>
          <button onClick={() => setModalAberto(true)}>Criar primeira meta</button>
        </div>
      ) : (
        <div className="metas-grid">
          {metas.map(meta => {
            const pct = calcularPorcentagem(meta.atual, meta.objetivo)
            const concluida = meta.atual >= meta.objetivo
            return (
              <div key={meta.id} className={`meta-card ${concluida ? 'concluida' : ''}`}>
                <div className="meta-card-header">
                  <div className="meta-icone" style={{ background: meta.cor + '22', color: meta.cor }}>
                    {meta.icone}
                  </div>
                  <div className="meta-info">
                    <h3>{meta.nome}</h3>
                    {concluida && <span className="badge-concluida">Concluída</span>}
                  </div>
                  <button className="btn-remover-meta" onClick={() => removerMeta(meta.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="meta-valores">
                  <span>{formatarValor(meta.atual)}</span>
                  <span className="meta-objetivo">de {formatarValor(meta.objetivo)}</span>
                </div>
                <div className="meta-barra-bg">
                  <div className="meta-barra" style={{ width: `${pct}%`, background: meta.cor }} />
                </div>
                <div className="meta-footer">
                  <span className="meta-pct" style={{ color: meta.cor }}>{pct}%</span>
                  {!concluida && (
                    <button
                      className="btn-depositar"
                      style={{ borderColor: meta.cor, color: meta.cor }}
                      onClick={() => { setModalDeposito(meta); setDeposito('') }}
                    >
                      + Depositar
                    </button>
                  )}
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
              <h3>Nova meta</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome da meta</label>
                <input name="nome" placeholder="Ex: Viagem para Europa" value={form.nome} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valor objetivo (R$)</label>
                  <input name="objetivo" type="number" min="0" step="0.01" placeholder="0,00" value={form.objetivo} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Já tenho (R$)</label>
                  <input name="atual" type="number" min="0" step="0.01" placeholder="0,00" value={form.atual} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Ícone</label>
                <div className="icones-grid">
                  {icones.map(ic => (
                    <button key={ic} type="button"
                      className={`icone-btn ${form.icone === ic ? 'ativo' : ''}`}
                      onClick={() => setForm({ ...form, icone: ic })}
                    >{ic}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Cor</label>
                <div className="cores-grid">
                  {cores.map(cor => (
                    <button key={cor} type="button"
                      className={`cor-btn ${form.cor === cor ? 'ativo' : ''}`}
                      style={{ background: cor }}
                      onClick={() => setForm({ ...form, cor })}
                    />
                  ))}
                </div>
              </div>
              {erro && <div className="form-erro">{erro}</div>}
              <button type="submit" className="btn-salvar" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Criar meta'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalDeposito && (
        <div className="modal-overlay" onClick={() => setModalDeposito(null)}>
          <div className="modal modal-pequeno" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Depositar na meta</h3>
              <button className="modal-fechar" onClick={() => setModalDeposito(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="deposito-info">
              <span>{modalDeposito.icone}</span>
              <strong>{modalDeposito.nome}</strong>
            </div>
            <p className="deposito-saldo">
              {formatarValor(modalDeposito.atual)} de {formatarValor(modalDeposito.objetivo)}
              — faltam {formatarValor(modalDeposito.objetivo - modalDeposito.atual)}
            </p>
            <form className="modal-form" onSubmit={handleDeposito}>
              <div className="form-group">
                <label>Valor a depositar (R$)</label>
                <input type="number" min="0" step="0.01" placeholder="0,00"
                  value={deposito} onChange={e => setDeposito(e.target.value)} />
              </div>
              <button type="submit" className="btn-salvar" style={{ background: modalDeposito.cor }}>
                Confirmar depósito
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}