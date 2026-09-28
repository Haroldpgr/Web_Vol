import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import QuoteForm from '../components/QuoteForm.jsx'
import { fetchConfiguracion } from '../lib/api.js'
import { setSeo, siteUrl } from '../lib/seo.js'

export default function Contacto() {
  const config = useQuery({
    queryKey: ['configuracion'],
    queryFn: fetchConfiguracion,
    staleTime: 5 * 60 * 1000,
  })
  const c = config.data?.data ?? {}
  const waNumero = (c.whatsapp ?? '').replace(/\D/g, '')
  const waUrl = waNumero
    ? `https://wa.me/${waNumero}?text=${encodeURIComponent('Hola, necesito cotizar un servicio de volqueta en Aguazul.')}`
    : ''

  useEffect(() => {
    setSeo({
      title: 'Contacto y cotizaciones | Volquetas Aguazul',
      description:
        'Cotiza tu servicio de volqueta en Aguazul, Casanare por WhatsApp o con el formulario escrito.',
      url: `${siteUrl()}/contacto`,
    })
  }, [])

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="relative overflow-hidden bg-carbon-900 text-white">
        <div aria-hidden="true" className="dots-grid pointer-events-none absolute inset-0 opacity-50" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-light">
            Contacto
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Cotiza tu servicio en Aguazul
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-300">
            El canal más rápido es WhatsApp. Si prefieres una cotización escrita,
            déjanos el formulario y te llamamos.
          </p>
        </div>
        <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-brand via-brand-light to-brand" />
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:py-8 lg:grid-cols-[360px_1fr]">
        <aside className="animate-fade-up space-y-4">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-green-600/25 transition-all hover:-translate-y-0.5 hover:bg-[#1DA851]"
            >
              WhatsApp directo
            </a>
          )}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-industrial">Contacto de los dueños</h2>
            <p className="mb-3 mt-1 text-xs text-neutral-500">
              Escríbele directo al encargado que prefieras.
            </p>
            <div className="space-y-2">
              {[
                { nombre: c.nombre_contacto || 'Dueño 1', wa: c.whatsapp },
                { nombre: c.nombre_contacto_2, wa: c.whatsapp_2 },
              ]
                .filter((d) => d.wa)
                .map((d) => {
                  const num = String(d.wa).replace(/\D/g, '')
                  return (
                    <a
                      key={d.nombre + num}
                      href={`https://wa.me/${num}?text=${encodeURIComponent(`Hola ${d.nombre}, necesito cotizar un servicio de volqueta en Aguazul.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 rounded-xl bg-neutral-50 px-4 py-3 transition-all hover:-translate-y-0.5 hover:bg-green-50 hover:shadow"
                    >
                      <span>
                        <span className="block text-sm font-extrabold text-industrial">{d.nombre}</span>
                        <span className="block text-xs text-neutral-500">Responde por WhatsApp</span>
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] font-extrabold text-white">
                        →
                      </span>
                    </a>
                  )
                })}
            </div>
            <h2 className="mt-5 text-base font-extrabold text-industrial">Datos de contacto</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Empresa</dt>
                <dd className="font-semibold text-industrial">{c.nombre_empresa || 'Volquetas Aguazul'}</dd>
              </div>
              {c.telefono_contacto && (
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">Teléfono</dt>
                  <dd className="font-semibold text-industrial">{c.telefono_contacto}</dd>
                </div>
              )}
              {c.correo_contacto && (
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">Correo</dt>
                  <dd className="break-all font-semibold text-industrial">{c.correo_contacto}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Base</dt>
                <dd className="font-semibold text-industrial">Aguazul, Casanare</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section
          className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-8"
          style={{ animationDelay: '100ms' }}
        >
          <h2 className="text-lg font-extrabold text-industrial">Solicitud escrita</h2>
          <p className="mb-5 mt-1 text-sm text-neutral-600">
            Te respondemos al teléfono que nos dejes.
          </p>
          <QuoteForm whatsappUrl={waUrl} />
        </section>
      </div>
    </div>
  )
}
