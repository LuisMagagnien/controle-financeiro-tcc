import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { api } from '../../services/api'
import './Cadastro.css'

export default function Cadastro() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: '', password: '', confirm: ''
  })
  const [erros, setErros] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErros({ ...erros, [e.target.name]: '' })
  }

  function validar() {
    const novosErros = {}
    if (!form.nome.trim())
      novosErros.nome = 'Informe seu nome completo.'
    if (!form.email.trim())
      novosErros.email = 'Informe um e-mail válido.'
    if (form.password.length < 6)
      novosErros.password = 'A senha deve ter pelo menos 6 caracteres.'
    if (form.password !== form.confirm)
      novosErros.confirm = 'As senhas não coincidem.'
    return novosErros
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const novosErros = validar()
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }
    try {
      setLoading(true)
      const data = await api.post('/auth/cadastrar', {
        nome: form.nome,
        email: form.email,
        senha: form.password,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      navigate('/')
    } catch (err) {
      setErros({ email: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-left">
        <div className="cadastro-brand">
          <Wallet size={32} />
          <span>FinanControl</span>
        </div>
        <h1>Comece a controlar suas finanças hoje</h1>
        <p>Crie sua conta gratuitamente e tenha controle total do seu dinheiro.</p>

        <div className="cadastro-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div>
              <strong>Crie sua conta</strong>
              <p>Preencha seus dados básicos</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div>
              <strong>Configure suas carteiras</strong>
              <p>Adicione banco, cartão e dinheiro</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div>
              <strong>Lance suas transações</strong>
              <p>Acompanhe receitas e despesas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cadastro-right">
        <div className="cadastro-card">
          <div className="cadastro-card-header">
            <h2>Criar conta</h2>
            <p>Preencha os dados abaixo para começar</p>
          </div>

          <form className="cadastro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="João Silva"
                value={form.nome}
                onChange={handleChange}
                className={erros.nome ? 'input-erro' : ''}
              />
              {erros.nome && <span className="erro-msg">{erros.nome}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                className={erros.email ? 'input-erro' : ''}
              />
              {erros.email && <span className="erro-msg">{erros.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="input-password">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  className={erros.password ? 'input-erro' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {erros.password && <span className="erro-msg">{erros.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirmar senha</label>
              <div className="input-password">
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={form.confirm}
                  onChange={handleChange}
                  className={erros.confirm ? 'input-erro' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {erros.confirm && <span className="erro-msg">{erros.confirm}</span>}
            </div>

            <div className="form-termos">
              <input type="checkbox" id="termos" required />
              <label htmlFor="termos">
                Concordo com os <a href="#">termos de uso</a> e{' '}
                <a href="#">política de privacidade</a>
              </label>
            </div>

            <button type="submit" className="btn-cadastrar" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar minha conta'}
            </button>

            <p className="login-text">
              Já tem uma conta?{' '}
              <a href="#" onClick={() => navigate('/login')}>Entrar</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}