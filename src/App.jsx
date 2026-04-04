import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Transacoes from './pages/Transacoes'
import Metas from './pages/Metas'

function Placeholder({ nome }) {
  return (
    <div style={{ padding: '40px', color: '#888', fontSize: '18px' }}>
      Página <strong>{nome}</strong> — em construção
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transacoes" element={<Transacoes />} />
          <Route path="metas"      element={<Metas />} />
          <Route path="carteiras"  element={<Placeholder nome="Carteiras" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}