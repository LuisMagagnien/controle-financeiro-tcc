import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, ArrowLeft } from 'lucide-react'
import { api } from '../../services/api'
import './RecuperarSenha.css'

export default function RecuperarSenha() {
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) {
      setErro('Informe seu e-mail.')
      return
    }
    try {
      setLoading(true)
      await api.post('/recuperacao/solicitar', { email })
      setEnviado(true)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recuperar-page">
      <div className="recuperar-card">
        <div className="recuperar-logo">
          <Wallet size={28} />
          <span>FinanControl</span>
        </div>

        {!enviado ? (
          <>
            <div className="recuperar-header">
              <h2>Esqueceu sua senha?</h2>
              <p>Digite seu e-mail e enviaremos as instruções para redefinir sua senha.</p>
            </div>

            <form className="recuperar-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErro('') }}
                />
              </div>

              {erro && <div className="recuperar-erro">{erro}</div>}

              <button type="submit" className="btn-recuperar" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </form>
          </>
        ) : (
          <div className="recuperar-sucesso">
            <div className="sucesso-icone">✉</div>
            <h2>E-mail enviado!</h2>
            <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
            <p className="sucesso-obs">Não recebeu? Verifique a pasta de spam.</p>
          </div>
        )}

        <button className="btn-voltar" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} />
          Voltar para o login
        </button>
      </div>
    </div>
  )
}