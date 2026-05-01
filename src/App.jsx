import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Transacoes from './pages/Transacoes'
import Metas from './pages/Metas'
import Carteiras from './pages/Carteiras'
import Importar from './pages/Importar'
import RecuperarSenha from './pages/RecuperarSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import RotaProtegida from './components/RotaProtegida'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/cadastro"        element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/" element={
          <RotaProtegida>
            <MainLayout />
          </RotaProtegida>
        }>
          <Route index element={<Dashboard />} />
          <Route path="transacoes" element={<Transacoes />} />
          <Route path="metas"      element={<Metas />} />
          <Route path="carteiras"  element={<Carteiras />} />
          <Route path="importar"   element={<Importar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}