import { useState } from 'react'
import { Plus, Trash2, X, Wallet, CreditCard, Banknote, TrendingUp } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import './Carteiras.css'

const cores  = ['#60a5fa','#4ade80','#c084fc','#fb923c','#f472b6','#f87171','#34d399','#facc15']
const vazio  = { nome: '', tipo: 'banco', saldo: '', cor: '#60a5fa' }

function Icone({ tipo, size = 22 }) {
  if (tipo === 'cartao')   return <CreditCard size={size} />
  if (tipo === 'dinheiro') return <Banknote size={size} />
  if (tipo === 'invest')   return <TrendingUp size={size} />
  return <Wallet size={size} />
}

export default function Carteiras() {
  const { carteiras, adicionarCarteira, removerCarteira } = useFinance()
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm]               = useState(vazio)
  const [erro, setErro]               = useState('')
  const [salvando, setSalvando]       = useState(false)

  const totalSaldo    = carteiras.reduce((acc, c) => acc + c.saldo, 0)
  const totalPositivo = carteiras.filter(c => c.saldo > 0).reduce((acc, c) => acc + c.saldo, 0)
  const totalNegativo = carteiras.filter(c => c.saldo < 0).reduce((acc, c) => acc + c.saldo, 0)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || form.saldo === '') {
      setErro('Preencha nome e saldo inicial.')
      return
    }
    try {
      setSalvando(true)
      await adicionarCarteira({
        nome: form.nome,
        tipo: form.tipo,
        saldo: parseFloat(form.saldo),
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

  function formatarValor(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="carteiras-page">
      <div className="carteiras-resumo">
        <div className="resumo-total">
          <span>Patrimônio líquido</span>
          <strong className={totalSaldo >= 0 ? 'positivo' : 'negativo'}>
            {formatarValor(totalSaldo)}
          </strong>
        </div>
        <div className="resumo-divider" />
        <div className="resumo-item">
          <span>Total positivo</span>
          <strong className="positivo">{formatarValor(totalPositivo)}</strong>
        </div>
        <div className="resumo-divider" />
        <div className="resumo-item">
          <span>Total negativo</span>
          <strong className="negativo">{formatarValor(totalNegativo)}</strong>
        </div>
        <div className="resumo-divider" />
        <div className="resumo-item">
          <span>Carteiras</span>
          <strong>{carteiras.length}</strong>
        </div>
        <button className="btn-nova-carteira" onClick={() => setModalAberto(true)}>
          <Plus size={18} />
          Nova carteira
        </button>
      </div>

      {carteiras.length === 0 ? (
        <div className="carteiras-vazio">
          <Wallet size={48} />
          <p>Nenhuma carteira cadastrada.</p>
          <button onClick={() => setModalAberto(true)}>Adicionar carteira</button>
        </div>
      ) : (
        <div className="carteiras-grid">
          {carteiras.map(c => (
            <div key={c.id} className="carteira-card" style={{ borderTopColor: c.cor }}>
              <div className="carteira-header">
                <div className="carteira-icone" style={{ background: c.cor + '22', color: c.cor }}>
                  <Icone tipo={c.tipo} />
                </div>
                <div className="carteira-info">
                  <h3>{c.nome}</h3>
                  <span className="carteira-tipo">{c.tipo}</span>
                </div>
                <button className="btn-remover" onClick={() => removerCarteira(c.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="carteira-saldo-label">Saldo atual</div>
              <div className={`carteira-saldo ${c.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                {formatarValor(c.saldo)}
              </div>
              <div className="carteira-barra-bg">
                <div
                  className="carteira-barra"
                  style={{
                    width: totalPositivo > 0
                      ? `${Math.min((Math.abs(c.saldo) / totalPositivo) * 100, 100)}%`
                      : '0%',
                    background: c.cor
                  }}
                />
              </div>
              <div className="carteira-pct" style={{ color: c.cor }}>
                {totalPositivo > 0
                  ? `${Math.round((Math.abs(c.saldo) / totalPositivo) * 100)}% do total`
                  : '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova carteira</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome da carteira</label>
                <input name="nome" placeholder="Ex: Nubank" value={form.nome} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <div className="tipo-grid">
                  {[
                    { value: 'banco',    label: 'Banco',        icon: <Wallet size={18} /> },
                    { value: 'cartao',   label: 'Cartão',       icon: <CreditCard size={18} /> },
                    { value: 'dinheiro', label: 'Dinheiro',     icon: <Banknote size={18} /> },
                    { value: 'invest',   label: 'Investimento', icon: <TrendingUp size={18} /> },
                  ].map(t => (
                    <button key={t.value} type="button"
                      className={`tipo-btn ${form.tipo === t.value ? 'ativo' : ''}`}
                      onClick={() => setForm({ ...form, tipo: t.value })}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Saldo inicial (R$)</label>
                <input name="saldo" type="number" step="0.01" placeholder="0,00" value={form.saldo} onChange={handleChange} />
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
                {salvando ? 'Salvando...' : 'Adicionar carteira'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}