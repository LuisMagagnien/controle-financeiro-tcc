import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { api } from '../../services/api'
import './RedefinirSenha.css'

export default function RedefinirSenha() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm]         = useState({ novaSenha: '', confirmar: '' })
  const [loading, setLoading]   = useState(false)
  const [sucesso, setSucesso]   = useState(false)
  const [erro, setErro]         = useState('')
  const [showNova, setShowNova] = useState(false)
  const [showConf, setShowConf] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.novaSenha || !form.confirmar) {
      setErro('Preencha todos os campos.')
      return
    }
    if (form.novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (form.novaSenha !== form.confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    try {
      setLoading(true)
      await api.post('/recuperacao/redefinir', {
        token,
        novaSenha: form.novaSenha,
      })
      setSucesso(true)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="redefinir-page">
      <div className="redefinir-card">
        <div className="redefinir-logo">
          <Wallet size={28} />
          <span>FinanControl</span>
        </div>

        {!sucesso ? (
          <>
            <div className="redefinir-header">
              <h2>Redefinir senha</h2>
              <p>Digite sua nova senha abaixo.</p>
            </div>

            <form className="redefinir-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nova senha</label>
                <div className="input-password">
                  <input
                    type={showNova ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={form.novaSenha}
                    onChange={e => { setForm({ ...form, novaSenha: e.target.value }); setErro('') }}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowNova(!showNova)}>
                    {showNova ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar nova senha</label>
                <div className="input-password">
                  <input
                    type={showConf ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={form.confirmar}
                    onChange={e => { setForm({ ...form, confirmar: e.target.value }); setErro('') }}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowConf(!showConf)}>
                    {showConf ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {erro && <div className="redefinir-erro">{erro}</div>}

              <button type="submit" className="btn-redefinir" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </>
        ) : (
          <div className="redefinir-sucesso">
            <div className="sucesso-icone">✓</div>
            <h2>Senha redefinida!</h2>
            <p>Sua senha foi alterada com sucesso.</p>
            <button className="btn-redefinir" onClick={() => navigate('/login')}>
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}