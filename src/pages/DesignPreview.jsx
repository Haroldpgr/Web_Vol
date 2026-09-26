import { useState } from 'react'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Gallery from '../components/Gallery.jsx'
import { Input, Select, TextArea } from '../components/Input.jsx'
import Modal from '../components/Modal.jsx'

const FOTO_EJEMPLO =
  'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80'

const GALERIA_EJEMPLO = [
  {
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
    alt: 'Volqueta en carretera — vista frontal',
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    alt: 'Volqueta en obra de construcción',
  },
  {
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
    alt: 'Volqueta cargando material en obra',
  },
]

const VOLQUETAS_EJEMPLO = [
  {
    titulo: 'Volqueta Doble Troque 14 m³ — Aguazul',
    foto: FOTO_EJEMPLO,
    capacidadM3: 14,
    capacidadToneladas: 22,
    ciudadBase: 'Aguazul, Casanare',
    estado: 'disponible',
    precio: '$450.000 / viaje estimado',
    slug: 'volqueta-doble-troque-aguazul',
  },
  {
    titulo: 'Volqueta Sencilla 7 m³ — Aguazul',
    foto: GALERIA_EJEMPLO[1].url,
    capacidadM3: 7,
    capacidadToneladas: 12,
    ciudadBase: 'Aguazul, Casanare',
    estado: 'ocupada',
    precio: '$320.000 / viaje estimado',
    slug: 'volqueta-sencilla-aguazul',
  },
  {
    titulo: 'Volqueta 10 m³ — Aguazul',
    foto: GALERIA_EJEMPLO[2].url,
    capacidadM3: 10,
    capacidadToneladas: 17,
    ciudadBase: 'Aguazul, Casanare',
    estado: 'mantenimiento',
    precio: '$380.000 / viaje estimado',
    slug: 'volqueta-10m3-aguazul',
  },
]

function Section({ title, desc, children }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-industrial">{title}</h2>
      {desc && <p className="mt-1 text-sm text-neutral-600">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function DesignPreview() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <header className="rounded-xl bg-industrial p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
          Zona 1 — Sistema de diseño
        </p>
        <h1 className="mt-1 text-3xl font-bold">Volquetas Colombia</h1>
        <p className="mt-2 text-sm text-neutral-300">
          Paleta industrial: naranja #F57C00 / #E65100 para CTAs, gris #212121 para
          estructuras, neutros limpios para fondos. Tipografía Inter / system-ui.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-brand px-3 py-1 text-xs font-bold">#F57C00 primary</span>
          <span className="rounded-lg bg-brand-dark px-3 py-1 text-xs font-bold">
            #E65100 hover
          </span>
          <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-industrial">
            #212121 industrial
          </span>
          <span className="rounded-lg bg-neutral-200 px-3 py-1 text-xs font-bold text-industrial">
            neutro fondo
          </span>
        </div>
      </header>

      <Section title="Botones" desc="Variantes primary, secondary y whatsapp.">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Cotizar servicio</Button>
          <Button variant="secondary">Ver detalles</Button>
          <Button variant="whatsapp">WhatsApp</Button>
          <Button variant="primary" size="lg">
            WhatsApp grande
          </Button>
          <Button variant="primary" disabled>
            Deshabilitado
          </Button>
        </div>
      </Section>

      <Section
        title="Badges de estado"
        desc="Disponible = verde, Ocupada = ámbar, Mantenimiento = gris."
      >
        <div className="flex flex-wrap gap-3">
          <Badge estado="disponible" />
          <Badge estado="ocupada" />
          <Badge estado="mantenimiento" />
        </div>
      </Section>

      <Section
        title="Cards de volqueta"
        desc="Foto, título, capacidad en m³, toneladas y ciudad base."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {VOLQUETAS_EJEMPLO.map((v) => (
            <Card key={v.slug} volqueta={v} />
          ))}
        </div>
      </Section>

      <Section title="Formularios" desc="Input, TextArea y Select con etiqueta y error.">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre" id="preview-nombre" placeholder="Ej. Carlos Pérez" />
          <Input
            label="Teléfono con error"
            id="preview-tel"
            placeholder="300 123 4567"
            error="Ingresa un teléfono válido de 10 dígitos."
          />
          <Select label="Ciudad base" id="preview-ciudad" defaultValue="medellin">
            <option value="medellin">Medellín</option>
            <option value="bogota">Bogotá</option>
            <option value="cali">Cali</option>
          </Select>
          <TextArea
            label="Mensaje"
            id="preview-msg"
            placeholder="Necesito transportar 14 m³ de arena…"
          />
        </div>
      </Section>

      <Section title="Modal / Dialog" desc="Ejemplo controlado con estado local.">
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          Abrir modal
        </Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Cotización de ejemplo"
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cerrar
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </>
          }
        >
          <p>
            Este es un diálogo de ejemplo del sistema de diseño. Pulsa Escape, clic fuera o
            el botón × para cerrarlo.
          </p>
        </Modal>
      </Section>

      <Section title="Galería" desc="Foto principal + miniaturas para la ficha técnica.">
        <Gallery images={GALERIA_EJEMPLO} />
      </Section>
    </div>
  )
}
