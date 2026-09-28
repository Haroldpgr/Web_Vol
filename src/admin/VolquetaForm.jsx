import { useState } from 'react'
import Button from '../components/Button.jsx'
import { Input, Select, TextArea } from '../components/Input.jsx'
import LocationPicker from '../components/LocationPicker.jsx'

const FILAS_DEFECTO = [
  { nombre: 'Tipo', valor: '' },
  { nombre: 'Materiales aptos', valor: '' },
  { nombre: 'Modelo', valor: '' },
]

// Presets estándar: al elegir m³ se rellenan las toneladas (editables después).
const PRESETS_M3 = [
  { m3: 7, t: 12 },
  { m3: 10, t: 17 },
  { m3: 12, t: 19 },
  { m3: 14, t: 22 },
  { m3: 15, t: 25 },
]

const TIPOS = ['Sencilla', 'Doble troque', 'Doble troque corto']

const MODELOS = [
  'Chevrolet FVR',
  'International WorkStar',
  'Freightliner M2',
  'Mack Granite',
  'Hino 500',
  'Kenworth T800',
]

// Formulario compartido crear/editar con etiquetas claras (Zona 8).
export default function VolquetaForm({ inicial = null, onGuardar, guardando = false, errorServidor = '' }) {
  const [form, setForm] = useState({
    titulo: inicial?.titulo ?? '',
    descripcion: inicial?.descripcion ?? '',
    capacidad_m3: inicial?.capacidad_m3 ?? '',
    capacidad_toneladas: inicial?.capacidad_toneladas ?? '',
    precio_estimado_viaje: inicial?.precio_estimado_viaje ?? '',
    placa: inicial?.placa ?? '',
    modelo_vehiculo: inicial?.modelo_vehiculo ?? '',
    ciudad_base: inicial?.ciudad_base ?? 'Aguazul',
    departamento_base: inicial?.departamento_base ?? 'Casanare',
    latitud: inicial?.latitud ?? null,
    longitud: inicial?.longitud ?? null,
    estado: inicial?.estado ?? 'disponible',
    destacado: inicial?.destacado ?? false,
  })
  const [caracts, setCaracts] = useState(
    inicial?.caracteristicas?.length > 0
      ? inicial.caracteristicas.map((c) => ({ nombre: c.nombre, valor: c.valor }))
      : FILAS_DEFECTO,
  )
  const [errorLocal, setErrorLocal] = useState('')
  const [tipoOtro, setTipoOtro] = useState({})

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (guardando) return
    if (!form.titulo.trim()) {
      setErrorLocal('Ponle un nombre a la volqueta para continuar.')
      return
    }
    for (const k of ['capacidad_m3', 'capacidad_toneladas', 'precio_estimado_viaje']) {
      if (form[k] !== '' && form[k] !== null && !Number.isFinite(Number(form[k]))) {
        setErrorLocal('Revisa los números: capacidad, toneladas y precio deben ser válidos.')
        return
      }
    }
    setErrorLocal('')
    await onGuardar?.({
      ...form,
      titulo: form.titulo.trim(),
      caracteristicas: caracts.filter((c) => c.nombre.trim() || c.valor.trim()),
    })
  }

  const cambiarCaract = (i, k, v) => {
    setCaracts((cs) => cs.map((c, j) => (j === i ? { ...c, [k]: v } : c)))
  }

  const aplicarPreset = (m3, t) => {
    setForm((f) => ({ ...f, capacidad_m3: m3, capacidad_toneladas: t }))
  }

  const modeloBase = MODELOS.find((m) => (form.modelo_vehiculo || '').startsWith(m)) ?? ''
  const modeloEsOtro = form.modelo_vehiculo !== '' && modeloBase === ''
  const elegirModelo = (e) => {
    const v = e.target.value
    if (v === '__otro__') setForm((f) => ({ ...f, modelo_vehiculo: '' }))
    else setForm((f) => ({ ...f, modelo_vehiculo: v }))
  }

  const selectClase =
    'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30'

  return (
    <form onSubmit={guardar} className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-base font-extrabold text-industrial">Datos del vehículo</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Nombre de la volqueta *"
              id="vq-titulo"
              value={form.titulo}
              onChange={set('titulo')}
              placeholder="Volqueta Doble Troque 14 m³ — Aguazul"
            />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Descripción para el cliente"
              id="vq-desc"
              value={form.descripcion ?? ''}
              onChange={set('descripcion')}
              placeholder="Tolva reforzada, rutas que cubre, disponibilidad…"
            />
          </div>
          <div>
            <Input
              label="¿Cuántos metros cúbicos mide la tolva?"
              id="vq-m3"
              type="number"
              min="0"
              step="0.5"
              value={form.capacidad_m3 ?? ''}
              onChange={set('capacidad_m3')}
              placeholder="14"
            />
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Valores estándar">
              {PRESETS_M3.map((p) => (
                <button
                  key={p.m3}
                  type="button"
                  onClick={() => aplicarPreset(p.m3, p.t)}
                  aria-pressed={Number(form.capacidad_m3) === p.m3}
                  title={`${p.m3} m³ ≈ ${p.t} t`}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    Number(form.capacidad_m3) === p.m3
                      ? 'bg-industrial text-white shadow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {p.m3} m³
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-500">Al elegir, se rellenan las toneladas.</p>
          </div>
          <Input
            label="¿Cuántas toneladas carga?"
            id="vq-ton"
            type="number"
            min="0"
            step="0.5"
            value={form.capacidad_toneladas ?? ''}
            onChange={set('capacidad_toneladas')}
            placeholder="22"
          />
          <Input
            label="Precio estimado por viaje (COP)"
            id="vq-precio"
            type="number"
            min="0"
            step="1000"
            value={form.precio_estimado_viaje ?? ''}
            onChange={set('precio_estimado_viaje')}
            placeholder="450000"
          />
          <Input
            label="Placa del vehículo"
            id="vq-placa"
            value={form.placa ?? ''}
            onChange={set('placa')}
            placeholder="SXT-482"
          />
          <div>
            <label htmlFor="vq-modelo" className="mb-1 block text-sm font-semibold text-industrial">
              Modelo del vehículo
            </label>
            <select id="vq-modelo" value={modeloEsOtro ? '__otro__' : modeloBase} onChange={elegirModelo} className={selectClase}>
              <option value="">Elegir…</option>
              {MODELOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="__otro__">Otro (escribir)…</option>
            </select>
            {modeloEsOtro && (
              <input
                value={form.modelo_vehiculo}
                onChange={set('modelo_vehiculo')}
                placeholder="Ej. International WorkStar 2019"
                aria-label="Modelo personalizado"
                className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ciudad base"
              id="vq-ciudad"
              value={form.ciudad_base ?? ''}
              onChange={set('ciudad_base')}
            />
            <Input
              label="Departamento"
              id="vq-depto"
              value={form.departamento_base ?? ''}
              onChange={set('departamento_base')}
            />
          </div>
          <Select label="Estado" id="vq-estado" value={form.estado} onChange={set('estado')}>
            <option value="disponible">Disponible (se muestra)</option>
            <option value="ocupada">Ocupada (se muestra)</option>
            <option value="mantenimiento">Mantenimiento (se oculta)</option>
          </Select>
          <label className="flex items-center gap-2 text-sm font-semibold text-industrial">
            <input
              type="checkbox"
              checked={form.destacado}
              onChange={set('destacado')}
              className="h-4 w-4 accent-[#F57C00]"
            />
            Destacar en el catálogo
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-base font-extrabold text-industrial">Ficha técnica</h2>
        <div className="mt-4 space-y-3">
          {caracts.map((c, i) => {
            const esTipo = c.nombre.trim().toLowerCase() === 'tipo'
            const tipoEsOtro = esTipo && (c.valor !== '' && !TIPOS.includes(c.valor) || tipoOtro[i])
            return (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  value={c.nombre}
                  onChange={(e) => cambiarCaract(i, 'nombre', e.target.value)}
                  placeholder="Tipo"
                  aria-label={`Característica ${i + 1} nombre`}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
                {esTipo ? (
                  <div>
                    <select
                      value={TIPOS.includes(c.valor) ? c.valor : tipoOtro[i] || c.valor !== '' ? '__otro__' : ''}
                      onChange={(e) => {
                        const otro = e.target.value === '__otro__'
                        setTipoOtro((m) => ({ ...m, [i]: otro }))
                        cambiarCaract(i, 'valor', otro ? '' : e.target.value)
                      }}
                      aria-label={`Característica ${i + 1} valor`}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                    >
                      <option value="">Elegir…</option>
                      {TIPOS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__otro__">Otro (escribir)…</option>
                    </select>
                    {tipoEsOtro && (
                      <input
                        value={c.valor}
                        onChange={(e) => cambiarCaract(i, 'valor', e.target.value)}
                        placeholder="Escribe el tipo"
                        aria-label={`Tipo personalizado ${i + 1}`}
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    value={c.valor}
                    onChange={(e) => cambiarCaract(i, 'valor', e.target.value)}
                    placeholder="Doble troque"
                    aria-label={`Característica ${i + 1} valor`}
                    className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setCaracts((cs) => cs.filter((_, j) => j !== i))}
                  aria-label={`Quitar característica ${i + 1}`}
                  className="rounded-xl px-2 font-bold text-red-500 hover:bg-red-50"
                >
                  ×
                </button>
              </div>
            )
          })}
          <button
            type="button"
            onClick={() => setCaracts((cs) => [...cs, { nombre: '', valor: '' }])}
            className="text-sm font-bold text-brand-dark hover:underline"
          >
            + Agregar característica
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-base font-extrabold text-industrial">Ubicación base</h2>
        <div className="mt-4">
          <LocationPicker
            latitud={form.latitud}
            longitud={form.longitud}
            onChange={({ latitud, longitud }) => setForm((f) => ({ ...f, latitud, longitud }))}
          />
        </div>
      </section>

      {(errorLocal || errorServidor) && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorLocal || errorServidor}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={guardando} className="w-full sm:w-auto">
        {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear volqueta'}
      </Button>
    </form>
  )
}
