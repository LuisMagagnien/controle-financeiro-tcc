import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowDownUp,
  Target,
  Wallet,
  Upload,
  LogOut
} from 'lucide-react'
import './MainLayout.css'

const navItems = [
  { to: '/',           icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/transacoes', icon: <ArrowDownUp size={20} />,     label: 'Transações' },
  { to: '/metas',      icon: <Target size={20} />,          label: 'Metas' },
  { to: '/carteiras',  icon: <Wallet size={20} />,          label: 'Carteiras' },
  { to: '/importar',   icon: <Upload size={20} />,          label: 'Importar' },
]
export default function MainLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const iniciais = usuario.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Wallet size={24} />
          <span>FinanControl</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1 className="page-title">Dashboard</h1>
          <div className="topbar-user">
            <div className="avatar">{iniciais}</div>
            <span>{usuario.nome || 'Usuário'}</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}