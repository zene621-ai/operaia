import { NextResponse } from 'next/server'
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
