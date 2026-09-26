import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Button from '../components/Button.jsx'
import { Input, TextArea } from '../components/Input.jsx'
import { adminConfig, getAdminToken } from '../lib/api.js'

function FormularioConfig({ datos }) {
  const queryClient = useQueryClient()
  const aLineas = (v) => String(v ?? '').split('|').join('\n')
  const deLineas = (v) =>
    v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .join('|')
  const [form, setForm] = useState({
    nombre_empresa: datos.nombre_empresa ?? '',
    telefono_contacto: datos.telefono_contacto ?? '',
    whatsapp: datos.whatsapp ?? '',
    correo_contacto: datos.correo_contacto ?? '',
    facebook: datos.redes_sociales?.facebook ?? '',
    instagram: datos.redes_sociales?.instagram ?? '',
    meta_descripcion_default: datos.meta_descripcion_default ?? '',
    hero_titulo: datos.contenidos?.hero_titulo ?? '',
    hero_resaltado: datos.contenidos?.hero_resaltado ?? '',
    hero_subtitulo: datos.contenidos?.hero_subtitulo ?? '',
    hero_imagen: datos.contenidos?.hero_imagen ?? '',
    marquesina: aLineas(datos.contenidos?.marquesina),
    cinta2: aLineas(datos.contenidos?.cinta2),
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setOk(false)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (guardando) return
    setGuardando(true)
    setError('')
    setOk(false)
    try {
      await adminConfig.guardar({
        nombre_empresa: form.nombre_empresa.trim(),
        telefono_contacto: form.telefono_contacto.trim(),
        whatsapp: form.whatsapp.trim(),
        correo_contacto: form.correo_contacto.trim(),
        redes_sociales: { facebook: form.facebook.trim(), instagram: form.instagram.trim() },
        meta_descripcion_default: form.meta_descripcion_default.trim(),
        contenidos: {
          hero_titulo: form.hero_titulo.trim(),
          hero_resaltado: form.hero_resaltado.trim(),
          hero_subtitulo: form.hero_subtitulo.trim(),
          hero_imagen: form.hero_imagen.trim(),
          marquesina: deLineas(form.marquesina),
          cinta2: deLineas(form.cinta2),
        },
      })
      setOk(true)
      // El sitio público usa la misma clave: los botones de WhatsApp se actualizan solos.
      queryClient.invalidateQueries({ queryKey: ['configuracion'] })
      queryClient.invalidateQueries({ queryKey: ['admin-config'] })
    } catch (err) {
      setError(err.errores?.whatsapp || err.errores?.correo_contacto || err.message || 'No se pudo guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form
      onSubmit={guardar}
      className="animate-fade-up space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6"
    >
      <Input label="Nombre de la empresa" id="cfg-nombre" value={form.nombre_empresa} onChange={set('nombre_empresa')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Teléfono de contacto" id="cfg-tel" value={form.telefono_contacto} onChange={set('telefono_contacto')} placeholder="3001234567" />
        <Input label="WhatsApp (con indicativo)" id="cfg-wa" value={form.whatsapp} onChange={set('whatsapp')} placeholder="573001234567" inputMode="tel" />
      </div>
      <Input label="Correo de contacto" id="cfg-email" type="email" value={form.correo_contacto} onChange={set('correo_contacto')} placeholder="contacto@volquetasaguazul.co" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Facebook (URL)" id="cfg-fb" value={form.facebook} onChange={set('facebook')} placeholder="https://facebook.com/..." />
        <Input label="Instagram (URL)" id="cfg-ig" value={form.instagram} onChange={set('instagram')} placeholder="https://instagram.com/..." />
      </div>
      <TextArea label="Descripción para buscadores" id="cfg-meta" rows={2} value={form.meta_descripcion_default} onChange={set('meta_descripcion_default')} />

      <div className="border-t border-neutral-100 pt-4">
        <h2 className="text-base font-extrabold text-industrial">Contenido del inicio</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Hero, imagen en movimiento y cintas de mensajes. Se ven al instante en la portada.
        </p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Título del hero" id="cfg-hero-t" value={form.hero_titulo} onChange={set('hero_titulo')} />
            <Input label="Palabra resaltada" id="cfg-hero-r" value={form.hero_resaltado} onChange={set('hero_resaltado')} />
          </div>
          <TextArea label="Subtítulo del hero" id="cfg-hero-s" rows={2} value={form.hero_subtitulo} onChange={set('hero_subtitulo')} />
          <div>
            <Input label="Foto del hero (URL)" id="cfg-hero-img" value={form.hero_imagen} onChange={set('hero_imagen')} placeholder="https://…" />
            {form.hero_imagen && (
              <img
                src={form.hero_imagen}
                alt="Vista previa del hero"
                className="mt-2 h-32 w-full rounded-xl border object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextArea label="Cinta 1 (un mensaje por línea)" id="cfg-cinta1" rows={4} value={form.marquesina} onChange={set('marquesina')} />
            <TextArea label="Cinta 2 (un mensaje por línea)" id="cfg-cinta2" rows={4} value={form.cinta2} onChange={set('cinta2')} />
          </div>
        </div>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      )}
      {ok && (
        <p className="animate-fade-up rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          Guardado. Los botones de WhatsApp del sitio ya usan el nuevo número.
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={guardando} className="w-full sm:w-auto">
        {guardando ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}

export default function Configuracion() {
  const config = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => adminConfig.obtener(),
    enabled: Boolean(getAdminToken()),
    retry: false,
  })

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-industrial">Configuración</h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        Cambia los datos de contacto sin tocar código. El WhatsApp se refleja en
        todas las fichas al instante.
      </p>

      {config.isLoading ? (
        <div className="space-y-4">
          <div className="skeleton h-16 rounded-2xl" />
          <div className="skeleton h-16 rounded-2xl" />
          <div className="skeleton h-16 rounded-2xl" />
        </div>
      ) : config.isError ? (
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="font-bold text-red-700">No pudimos cargar la configuración.</p>
          <button
            type="button"
            onClick={() => config.refetch()}
            className="mt-3 font-semibold text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <FormularioConfig key={config.data.data.id} datos={config.data.data} />
      )}
    </div>
  )
}
