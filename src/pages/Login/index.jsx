import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { api } from '../../services/api'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Preencha todos os campos.')
      return
    }
    try {
      setLoading(true)
      const data = await api.post('/auth/login', {
        email: form.email,
        senha: form.password,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <Wallet size={32} />
          <span>FinanControl</span>
        </div>
        <h1>Controle seu dinheiro com inteligência</h1>
        <p>Acompanhe receitas, despesas, metas e muito mais em um só lugar.</p>

        <div className="login-features">
          <div className="feature-item">
            <div className="feature-dot green" />
            <span>Dashboard completo com gráficos</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot blue" />
            <span>Controle de receitas e despesas</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot purple" />
            <span>Metas financeiras personalizadas</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot orange" />
            <span>Múltiplas carteiras e contas</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Bem-vindo de volta!</h2>
            <p>Entre com sua conta para continuar</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="input-password">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Lembrar de mim</span>
              </label>
              <a href="#" className="forgot-link" onClick={() => navigate('/recuperar-senha')}>Esqueci minha senha</a>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="signup-text">
              Não tem uma conta?{' '}
              <a href="#" onClick={() => navigate('/cadastro')}>
                Cadastre-se gratuitamente
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}