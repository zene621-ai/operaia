import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('lib', { recursive: true })
mkdirSync('app/api/clientes', { recursive: true })
mkdirSync('app/api/pedidos', { recursive: true })
mkdirSync('app/api/gastos', { recursive: true })
mkdirSync('app/api/ia', { recursive: true })

writeFileSync('lib/db.ts', `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
`, 'utf8')

writeFileSync('app/api/clientes/route.ts', `import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const clientes = await db.cliente.findMany({ include: { pedidos: true } })
  return NextResponse.json(clientes)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { nombre, telefono, direccion } = body
  const cliente = await db.cliente.create({ data: { nombre, telefono, direccion } })
  return NextResponse.json(cliente)
}
`, 'utf8')

writeFileSync('app/api/pedidos/route.ts', `import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const pedidos = await db.pedido.findMany({ include: { cliente: true, items: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(pedidos)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { clienteId, items } = body
  const total = items.reduce((acc: number, item: any) => acc + item.precio * item.cantidad, 0)
  const pedido = await db.pedido.create({ data: { clienteId, total, items: { create: items } }, include: { items: true, cliente: true } })
  return NextResponse.json(pedido)
}
`, 'utf8')

writeFileSync('app/api/gastos/route.ts', `import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const gastos = await db.gasto.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(gastos)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { descripcion, monto, categoria } = body
  const gasto = await db.gasto.create({ data: { descripcion, monto: Number(monto), categoria } })
  return NextResponse.json(gasto)
}
`, 'utf8')

writeFileSync('app/api/ia/route.ts', `import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { db } from '@/lib/db'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET() {
  try {
    const [clientes, pedidos, gastos] = await Promise.all([
      db.cliente.findMany({ include: { pedidos: { include: { items: true } } } }),
      db.pedido.findMany({ include: { cliente: true, items: true }, orderBy: { createdAt: 'desc' } }),
      db.gasto.findMany(),
    ])
    const hoy = new Date().toDateString()
    const pedidosHoy = pedidos.filter(p => new Date(p.createdAt).toDateString() === hoy)
    const pendientes = pedidos.filter(p => p.estado === 'pendiente')
    const ingresos = pedidos.reduce((acc, p) => acc + p.total, 0)
    const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0)
    const ganancia = ingresos - totalGastos
    const resumen = {
      totalClientes: clientes.length,
      totalPedidos: pedidos.length,
      pedidosHoy: pedidosHoy.length,
      pendientes: pendientes.length,
      ingresos,
      totalGastos,
      ganancia,
      topClientes: clientes
        .map(c => ({ nombre: c.nombre, total: c.pedidos.reduce((acc, p) => acc + p.total, 0), pedidos: c.pedidos.length }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3)
    }
    const prompt = "Eres un asistente operativo para empresas latinoamericanas. Analiza estos datos: " + JSON.stringify(resumen) + ". Dame un analisis en espanol con: 1) Estado general del negocio 2) Clientes mas valiosos 3) Recomendaciones. Maximo 300 palabras."
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    })
    const analisis = completion.choices[0]?.message?.content ?? 'Sin analisis'
    return NextResponse.json({ analisis, datos: resumen })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
`, 'utf8')

console.log('Listo - archivos creados en UTF-8')