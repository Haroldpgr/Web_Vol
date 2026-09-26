import { useState } from 'react'
import { postContacto } from '../lib/api.js'
import Button from './Button.jsx'
import { Input, TextArea } from './Input.jsx'

// Formulario de cotización escrita, canal secundario tras WhatsApp (Zona 5).
// Envía a POST /contacto. Incluye honeypot anti-spam (`empresa`, oculto).
export default function QuoteForm({ volquetaId = null, tituloVolqueta = '', whatsappUrl = '' }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState(
    tituloVolqueta ? `Hola, me interesa la ${tituloVolqueta}. ` : '',
  )
  const [empresa, setEmpresa] = useState('')
  const [estado, setEstado] = useState('idle') // idle | sending | success | error
  const [errores, setErrores] = useState({})
  const [errorRed, setErrorRed] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    if (estado === 'sending') return

    const locales = {}
    if (!nombre.trim()) locales.nombre = 'Cuéntanos tu nombre.'
    if (telefono.replace(/\D/g, '').length < 7) locales.telefono = 'Un teléfono válido (mín. 7 dígitos).'
    if (!mensaje.trim()) locales.mensaje = 'Describe qué necesitas transportar.'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      locales.email = 'Ese correo no parece válido.'
    }
    setErrores(locales)
    if (Object.keys(locales).length > 0) return

    setEstado('sending')
    setErrorRed(false)
    try {
      await postContacto({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim() || undefined,
        mensaje: mensaje.trim(),
        volqueta_id: volquetaId,
        empresa: empresa || undefined,
      })
      setEstado('success')
    } catch (err) {
      if (err.status === 400 && err.errores) {
        const trad = {}
        if (err.errores.nombre) trad.nombre = err.errores.nombre
        if (err.errores.telefono) trad.telefono = err.errores.telefono
        if (err.errores.email) trad.email = err.errores.email
        if (err.errores.mensaje) trad.mensaje = err.errores.mensaje
        setErrores(trad)
        setEstado('idle')
      } else {
        setErrorRed(true)
        setEstado('error')
      }
    }
  }

  if (estado === 'success') {
    return (
      <div className="animate-fade-up rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
          <svg
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-green-900">¡Solicitud recibida!</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-green-800">
          Gracias, {nombre.split(' ')[0] || 'gracias'}. Te contactaremos pronto al{' '}
          {telefono}. Si es urgente, escríbenos ya por WhatsApp.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1DA851]"
          >
            Hablar por WhatsApp
          </a>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="relative space-y-4" noValidate>
      {/* Honeypot anti-spam: invisible para humanos */}
      <input
        type="text"
        name="empresa"
        value={empresa}
        onChange={(e) => setEmpresa(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre *"
          id="cot-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          autoComplete="name"
          error={errores.nombre}
        />
        <Input
          label="Teléfono / WhatsApp *"
          id="cot-tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="310 123 4567"
          inputMode="tel"
          autoComplete="tel"
          error={errores.telefono}
        />
      </div>
      <Input
        label="Correo (opcional)"
        id="cot-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tucorreo@ejemplo.com"
        autoComplete="email"
        error={errores.email}
      />
      <TextArea
        label="¿Qué necesitas transportar? *"
        id="cot-msg"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Material, cantidad en m³ y destino del viaje…"
        error={errores.mensaje}
      />
      {errorRed && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.
        </p>
      )}
      <Button
        type="submit"
        variant="secondary"
        disabled={estado === 'sending'}
        className="w-full sm:w-auto"
      >
        {estado === 'sending' ? 'Enviando…' : 'Enviar solicitud escrita'}
      </Button>
    </form>
  )
}
