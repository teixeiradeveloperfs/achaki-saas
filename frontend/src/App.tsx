import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ForgotPassword } from './pages/ForgotPassword'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { RequireAuth } from './auth/RequireAuth'
import { Integrations } from './pages/Integrations'
import { Offers } from './pages/Offers'
import { Profile } from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ofertas" element={<Offers />} />
          <Route path="/integracoes" element={<Integrations />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
