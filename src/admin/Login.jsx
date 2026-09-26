import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { getAdminToken, loginAdmin, setAdminSession } from '../lib/api.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (getAdminToken()) {
    return <Navigate to="/admin" replace />
  }

  const entrar = async (e) => {
    e.preventDefault()
    if (enviando) return
    if (!email.trim() || !password) {
      setError('Escribe tu email y contraseña.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const data = await loginAdmin(email.trim(), password)
      setAdminSession(data)
      navigate(location.state?.from ?? '/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-industrial px-4">
      <div className="w-full max-w-sm animate-fade-up rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-dark">
          Panel privado
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-industrial">Volquetas Aguazul</h1>
        <p className="mt-1 text-sm text-neutral-500">Acceso del operador de la flota.</p>
        <form onSubmit={entrar} className="mt-6 space-y-4">
          <Input
            label="Correo"
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@volquetas.co"
            autoComplete="username"
          />
          <Input
            label="Contraseña"
            id="admin-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" disabled={enviando} className="w-full" size="lg">
            {enviando ? 'Verificando…' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-neutral-400">
          <Link to="/" className="underline hover:text-neutral-600">
            Volver al sitio público
          </Link>
        </p>
      </div>
    </div>
  )
}
