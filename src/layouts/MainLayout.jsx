import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowDownUp,
  Target,
  Wallet,
  LogOut
} from 'lucide-react'
import './MainLayout.css'

const navItems = [
  { to: '/',           icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/transacoes', icon: <ArrowDownUp size={20} />,     label: 'Transações' },
  { to: '/metas',      icon: <Target size={20} />,          label: 'Metas' },
  { to: '/carteiras',  icon: <Wallet size={20} />,          label: 'Carteiras' },
]

export default function MainLayout() {
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

        <button className="sidebar-logout">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1 className="page-title">Dashboard</h1>
          <div className="topbar-user">
            <div className="avatar">JS</div>
            <span>João Silva</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}