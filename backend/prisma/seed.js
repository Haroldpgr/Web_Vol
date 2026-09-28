require('dotenv').config()
const bcrypt = require('bcryptjs')
const { prisma } = require('../src/lib/prisma')

async function main() {
  console.log('Seed Zona 2: iniciando...')

  const passwordHash = await bcrypt.hash('Admin123*', 10)

  const admin = await prisma.usuario_admin.upsert({
    where: { email: 'admin@volquetas.co' },
    update: {},
    create: {
      nombre: 'Administrador Flota',
      email: 'admin@volquetas.co',
      password_hash: passwordHash,
      rol: 'administrador',
    },
  })
  console.log(`Admin: ${admin.email} (id=${admin.id})`)

  // Limpieza de demos anteriores (Zona 2/3): la flota real opera en Aguazul.
  const slugsLegado = [
    'volqueta-doble-troque-medellin',
    'volqueta-sencilla-bogota',
    'volqueta-10m3-cali',
    'volqueta-12m3-barranquilla',
  ]
  await prisma.volqueta.deleteMany({ where: { slug: { in: slugsLegado } } })

  // Flota real: solo Aguazul, Casanare (patios con GPS del municipio).
  const volquetasData = [
    {
      titulo: 'Volqueta Doble Troque 14 m³ — Aguazul',
      slug: 'volqueta-doble-troque-aguazul',
      descripcion:
        'Volqueta doble troque con tolva reforzada de 14 m³. Cubre Aguazul y rutas hacia Yopal, Maní y Tauramena. Ideal para arena de río, gravilla y triturado.',
      capacidad_m3: 14,
      capacidad_toneladas: 22,
      precio_estimado_viaje: 450000,
      moneda: 'COP',
      placa: 'SXT-482',
      modelo_vehiculo: 'International WorkStar 2019',
      ciudad_base: 'Aguazul',
      departamento_base: 'Casanare',
      latitud: 5.1745,
      longitud: -72.5523,
      estado: 'disponible',
      destacado: true,
      usuario_admin_id: admin.id,
      fotos: [
        'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      ],
      caracteristicas: [
        { nombre: 'Tipo', valor: 'Doble troque' },
        { nombre: 'Materiales aptos', valor: 'Arena, gravilla, triturado, escombros' },
        { nombre: 'Modelo', valor: '2019' },
      ],
    },
    {
      titulo: 'Volqueta Sencilla 7 m³ — Aguazul',
      slug: 'volqueta-sencilla-aguazul',
      descripcion:
        'Volqueta sencilla de 7 m³ para obras urbanas y rurales en Aguazul. Entra a calles estrechas y veredas. Perfecta para recebo, arena y escombros.',
      capacidad_m3: 7,
      capacidad_toneladas: 12,
      precio_estimado_viaje: 320000,
      moneda: 'COP',
      placa: 'WGC-317',
      modelo_vehiculo: 'Chevrolet FVR 2017',
      ciudad_base: 'Aguazul',
      departamento_base: 'Casanare',
      latitud: 5.168,
      longitud: -72.56,
      estado: 'disponible',
      destacado: true,
      usuario_admin_id: admin.id,
      fotos: [
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      ],
      caracteristicas: [
        { nombre: 'Tipo', valor: 'Sencilla' },
        { nombre: 'Materiales aptos', valor: 'Arena, recebo, escombros' },
        { nombre: 'Modelo', valor: '2017' },
      ],
    },
    {
      titulo: 'Volqueta 10 m³ — Aguazul',
      slug: 'volqueta-10m3-aguazul',
      descripcion:
        'Volqueta de 10 m³ con base en Aguazul. Especial para triturado y balastro en vías veredales y proyectos de la zona.',
      capacidad_m3: 10,
      capacidad_toneladas: 17,
      precio_estimado_viaje: 380000,
      moneda: 'COP',
      placa: 'TJN-905',
      modelo_vehiculo: 'Freightliner M2 2018',
      ciudad_base: 'Aguazul',
      departamento_base: 'Casanare',
      latitud: 5.181,
      longitud: -72.549,
      estado: 'ocupada',
      destacado: false,
      usuario_admin_id: admin.id,
      fotos: [
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      ],
      caracteristicas: [
        { nombre: 'Tipo', valor: 'Doble troque corto' },
        { nombre: 'Materiales aptos', valor: 'Triturado, balastro, arena' },
        { nombre: 'Modelo', valor: '2018' },
      ],
    },
    {
      titulo: 'Volqueta 12 m³ — Aguazul (taller)',
      slug: 'volqueta-12m3-aguazul-taller',
      descripcion:
        'Volqueta de 12 m³ en mantenimiento preventivo en el taller de Aguazul. Sin ubicación GPS asignada todavía.',
      capacidad_m3: 12,
      capacidad_toneladas: 19,
      precio_estimado_viaje: 400000,
      moneda: 'COP',
      placa: 'UKL-204',
      modelo_vehiculo: 'Mack Granite 2016',
      ciudad_base: 'Aguazul',
      departamento_base: 'Casanare',
      latitud: null,
      longitud: null,
      estado: 'mantenimiento',
      destacado: false,
      usuario_admin_id: admin.id,
      fotos: [
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      ],
      caracteristicas: [
        { nombre: 'Tipo', valor: 'Doble troque' },
        { nombre: 'Materiales aptos', valor: 'Arena, gravilla' },
        { nombre: 'Modelo', valor: '2016' },
      ],
    },
  ]

  for (const v of volquetasData) {
    const { fotos, caracteristicas, ...datos } = v
    const volqueta = await prisma.volqueta.upsert({
      where: { slug: datos.slug },
      update: { ...datos },
      create: { ...datos },
    })

    await prisma.foto_volqueta.deleteMany({ where: { volqueta_id: volqueta.id } })
    for (let i = 0; i < fotos.length; i++) {
      await prisma.foto_volqueta.create({
        data: {
          volqueta_id: volqueta.id,
          url_imagen: fotos[i],
          orden: i,
          es_portada: i === 0,
        },
      })
    }

    await prisma.caracteristica_volqueta.deleteMany({
      where: { volqueta_id: volqueta.id },
    })
    for (const c of caracteristicas) {
      await prisma.caracteristica_volqueta.create({
        data: { volqueta_id: volqueta.id, nombre: c.nombre, valor: c.valor },
      })
    }

    await prisma.contador_visitas.upsert({
      where: { volqueta_id: volqueta.id },
      update: {},
      create: { volqueta_id: volqueta.id, total_visitas: 0 },
    })

    console.log(`Volqueta: ${volqueta.titulo} (id=${volqueta.id})`)
  }

  // Contador global (volqueta_id = null no usa upsert por unique nullable; se crea si no existe)
  const global = await prisma.contador_visitas.findFirst({ where: { volqueta_id: null } })
  if (!global) {
    await prisma.contador_visitas.create({ data: { total_visitas: 0 } })
  }

  await prisma.configuracion_sitio.updateMany({
    data: {
      nombre_empresa: 'Volquetas Aguazul',
      telefono_contacto: '3001234567',
      whatsapp: '573001234567',
      correo_contacto: 'contacto@volquetasaguazul.co',
      meta_descripcion_default:
        'Alquiler y contratación de volquetas en Aguazul, Casanare. Arena, gravilla, triturado y escombros.',
    },
  })

  const configCount = await prisma.configuracion_sitio.count()
  if (configCount === 0) {
    await prisma.configuracion_sitio.create({
      data: {
        nombre_empresa: 'Volquetas Aguazul',
        telefono_contacto: '3001234567',
        whatsapp: '573001234567',
        correo_contacto: 'contacto@volquetasaguazul.co',
        redes_sociales: { facebook: '', instagram: '' },
        meta_descripcion_default:
          'Alquiler y contratación de volquetas en Aguazul, Casanare. Arena, gravilla, triturado y escombros.',
      },
    })
    console.log('Configuración inicial creada')
  }

  // Contenidos editables del inicio (hero, cintas en movimiento).
  const contenidosDefecto = {
    hero_titulo: 'Volquetas para tu obra,',
    hero_resaltado: 'a tiempo',
    hero_subtitulo:
      'Arena, gravilla, triturado y escombros con flota local y patio base en Aguazul. Cotiza al instante por WhatsApp.',
    hero_imagen:
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80',
    marquesina:
      'Arena de río|Gravilla|Triturado|Recebo|Balastro|Escombros|Aguazul|Yopal|Maní',
    cinta2:
      'Despacho el mismo día|Cubicaje garantizado|Sin intermediarios|Patio en Aguazul|Nequi y transferencia',
  }
  for (const [clave, valor] of Object.entries(contenidosDefecto)) {
    await prisma.contenido_sitio.upsert({
      where: { clave },
      update: {},
      create: { clave, valor },
    })
  }
  console.log('Contenidos iniciales creados')

  console.log('Seed Zona 2: OK')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
