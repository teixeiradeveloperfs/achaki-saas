import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Integrations } from './pages/Integrations'
import { Offers } from './pages/Offers'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/offers" element={<Offers />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
