import { useState, useEffect } from 'react'
import { Users, Plus, LogOut, Copy, Check, TrendingUp, TrendingDown, Target, Wallet, X, UserMinus } from 'lucide-react'
import { api } from '../../services/api'
import './Familia.css'

const categorias = ['Alimentação','Moradia','Transporte','Saúde','Educação','Lazer','Salário','Freelance','Outros']
const vazio = { desc: '', tipo: 'despesa', categoria: 'Alimentação', valor: '', data: '' }

export default function Familia() {
  const [conta, setConta]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const [copiado, setCopiado]         = useState(false)
  const [codigo, setCodigo]           = useState('')
  const [erro, setErro]               = useState('')
  const [transacoes, setTransacoes]   = useState([])
  const [metas, setMetas]             = useState([])
  const [carteiras, setCarteiras]     = useState([])
  const [aba, setAba]                 = useState('transacoes')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm]               = useState(vazio)
  const [salvando, setSalvando]       = useState(false)

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => { carregarConta() }, [])

  async function carregarConta() {
    try {
      setLoading(true)
      const data = await api.get('/familia')
      setConta(data)
      if (data) {
        const [t, m, c] = await Promise.all([
          api.get('/familia/transacoes'),
          api.get('/familia/metas'),
          api.get('/familia/carteiras'),
        ])
        setTransacoes(t)
        setMetas(m)
        setCarteiras(c)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCriar() {
    try {
      setErro('')
      const data = await api.post('/familia/criar', {})
      setConta(data)
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleEntrar(e) {
    e.preventDefault()
    if (!codigo) { setErro('Informe o código.'); return }
    try {
      setErro('')
      const data = await api.post('/familia/entrar', { codigo })
      setConta(data)
      carregarConta()
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleSair() {
    if (!confirm('Tem certeza que deseja sair da conta compartilhada?')) return
    try {
      await api.post('/familia/sair', {})
      setConta(null)
      setTransacoes([])
      setMetas([])
      setCarteiras([])
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleRemoverMembro(membroId, membroNome) {
    if (!confirm(`Tem certeza que deseja remover ${membroNome} da conta?`)) return
    try {
      await api.delete(`/familia/membros/${membroId}`)
      setConta(prev => ({
        ...prev,
        usuarios: prev.usuarios.filter(u => u.id !== membroId)
      }))
    } catch (err) {
      setErro(err.message)
    }
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(conta.codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function handleAdicionarTransacao(e) {
    e.preventDefault()
    if (!form.desc || !form.valor || !form.data) return
    try {
      setSalvando(true)
      const nova = await api.post('/familia/transacoes', {
        desc: form.desc,
        tipo: form.tipo,
        categoria: form.categoria,
        valor: parseFloat(form.valor),
        data: form.data,
      })
      setTransacoes(prev => [nova, ...prev])
      setForm(vazio)
      setModalAberto(false)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemoverTransacao(id) {
    await api.delete(`/familia/transacoes/${id}`)
    setTransacoes(prev => prev.filter(t => t.id !== id))
  }

  function formatarValor(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarData(data) {
    if (!data) return ''
    return data.split('-').reverse().join('/')
  }

  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0)
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0)
  const saldo = totalReceitas - totalDespesas

  if (loading) return <div className="familia-loading">Carregando...</div>

  if (!conta) {
    return (
      <div className="familia-page">
        <div className="familia-header">
          <h2>Conta Família</h2>
          <p>Compartilhe suas finanças com parceiro, cônjuge ou família.</p>
        </div>

        <div className="familia-opcoes">
          <div className="opcao-card">
            <div className="opcao-icone criar">
              <Users size={28} />
            </div>
            <h3>Criar conta compartilhada</h3>
            <p>Crie uma nova conta e convide outras pessoas com um código único.</p>
            <button className="btn-criar-conta" onClick={handleCriar}>
              <Plus size={16} />
              Criar conta
            </button>
          </div>

          <div className="opcao-divider">ou</div>

          <div className="opcao-card">
            <div className="opcao-icone entrar">
              <LogOut size={28} style={{ transform: 'rotate(180deg)' }} />
            </div>
            <h3>Entrar em uma conta</h3>
            <p>Recebeu um código de convite? Digite abaixo para entrar.</p>
            <form className="form-codigo" onSubmit={handleEntrar}>
              <input
                placeholder="Digite o código (ex: AB12CD)"
                value={codigo}
                onChange={e => { setCodigo(e.target.value.toUpperCase()); setErro('') }}
                maxLength={8}
              />
              <button type="submit">Entrar</button>
            </form>
            {erro && <p className="familia-erro">{erro}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="familia-page">
      <div className="familia-header">
        <h2>Conta Família</h2>
        <p>Finanças compartilhadas em tempo real.</p>
      </div>

      {/* Info da conta */}
      <div className="conta-info-card">
        <div className="conta-codigo-area">
          <div>
            <span className="codigo-label">Código de convite</span>
            <div className="codigo-valor">{conta.codigo}</div>
            <span className="codigo-hint">Compartilhe este código para convidar pessoas</span>
          </div>
          <button className="btn-copiar" onClick={copiarCodigo}>
            {copiado ? <Check size={16} /> : <Copy size={16} />}
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        <div className="conta-membros">
          <span className="membros-label">Membros ({conta.usuarios?.length || 0})</span>
          <div className="membros-lista">
            {conta.usuarios?.map((u, i) => (
              <div key={i} className="membro-item">
                <div className="membro-avatar">
                  {u.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="membro-dados">
                  <strong>{u.nome}</strong>
                  {u.id === usuario.id && <span className="membro-voce">você</span>}
                </div>
                {u.id !== usuario.id && (
                  <button
                    className="btn-remover-membro"
                    onClick={() => handleRemoverMembro(u.id, u.nome)}
                    title={`Remover ${u.nome}`}
                  >
                    <UserMinus size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className="btn-sair-conta" onClick={handleSair}>
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>

      {/* Resumo */}
      <div className="familia-resumo">
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
          <Wallet size={20} />
          <div>
            <span>Saldo</span>
            <strong>{formatarValor(saldo)}</strong>
          </div>
        </div>
        <div className="resumo-card purple">
          <Target size={20} />
          <div>
            <span>Transações</span>
            <strong>{transacoes.length}</strong>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="familia-abas">
        {['transacoes', 'metas', 'carteiras'].map(a => (
          <button
            key={a}
            className={`aba-btn ${aba === a ? 'ativa' : ''}`}
            onClick={() => setAba(a)}
          >
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
        <button className="btn-nova-familia" onClick={() => setModalAberto(true)}>
          <Plus size={16} />
          Nova transação
        </button>
      </div>

      {/* Conteúdo das abas */}
      {aba === 'transacoes' && (
        <div className="familia-tabela-card">
          <div className="familia-tabela-header">
            <span>Descrição</span>
            <span>Categoria</span>
            <span>Por</span>
            <span>Data</span>
            <span>Valor</span>
            <span></span>
          </div>
          {transacoes.length === 0 ? (
            <div className="familia-vazio">Nenhuma transação ainda.</div>
          ) : (
            transacoes.map(t => (
              <div key={t.id} className="familia-tabela-row">
                <span className="t-desc">
                  <div className={`tipo-dot ${t.tipo}`} />
                  {t.desc}
                </span>
                <span className="t-cat">{t.categoria}</span>
                <span className="t-autor">{t.autorNome}</span>
                <span className="t-data">{formatarData(t.data)}</span>
                <span className={`t-valor ${t.tipo}`}>
                  {t.tipo === 'receita' ? '+' : '-'}{formatarValor(t.valor)}
                </span>
                <button className="btn-remover-t" onClick={() => handleRemoverTransacao(t.id)}>
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {aba === 'metas' && (
        <div className="familia-metas-grid">
          {metas.length === 0 ? (
            <div className="familia-vazio">Nenhuma meta ainda.</div>
          ) : (
            metas.map(m => {
              const pct = Math.min(Math.round((m.atual / m.objetivo) * 100), 100)
              return (
                <div key={m.id} className="familia-meta-card">
                  <div className="meta-icone" style={{ background: m.cor + '22', color: m.cor }}>
                    {m.icone}
                  </div>
                  <div className="meta-info-familia">
                    <h3>{m.nome}</h3>
                    <p>{formatarValor(m.atual)} de {formatarValor(m.objetivo)}</p>
                  </div>
                  <div className="meta-barra-bg">
                    <div className="meta-barra" style={{ width: `${pct}%`, background: m.cor }} />
                  </div>
                  <span className="meta-pct" style={{ color: m.cor }}>{pct}%</span>
                </div>
              )
            })
          )}
        </div>
      )}

      {aba === 'carteiras' && (
        <div className="familia-carteiras-grid">
          {carteiras.length === 0 ? (
            <div className="familia-vazio">Nenhuma carteira ainda.</div>
          ) : (
            carteiras.map(c => (
              <div key={c.id} className="familia-carteira-card" style={{ borderTopColor: c.cor }}>
                <h3>{c.nome}</h3>
                <span className="carteira-tipo">{c.tipo}</span>
                <div className={`carteira-saldo ${c.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                  {formatarValor(c.saldo)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal nova transação */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova transação compartilhada</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleAdicionarTransacao}>
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
                <input
                  name="desc" placeholder="Ex: Supermercado"
                  value={form.desc}
                  onChange={e => setForm({ ...form, desc: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input
                    name="valor" type="number" placeholder="0,00" min="0" step="0.01"
                    value={form.valor}
                    onChange={e => setForm({ ...form, valor: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Data</label>
                  <input
                    name="data" type="date"
                    value={form.data}
                    onChange={e => setForm({ ...form, data: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                >
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
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