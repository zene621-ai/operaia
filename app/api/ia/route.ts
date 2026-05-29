import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      include: {
        pedidos: {
          include: { items: true }
        }
      }
    })

    const resumen = clientes.map(c => ({
      nombre: c.nombre,
      totalPedidos: c.pedidos.length,
      totalGastado: c.pedidos.reduce((acc, p) => acc + p.total, 0),
    }))

    const prompt = `Eres un asistente operativo para empresas latinoamericanas. 
Analiza estos datos de clientes y pedidos:

${JSON.stringify(resumen, null, 2)}

Dame un análisis breve con:
1. Resumen general del negocio
2. Clientes más frecuentes o valiosos
3. Recomendaciones concretas de seguimiento

Responde en español, de forma clara y directa. Máximo 200 palabras.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 })
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sin respuesta'

    return NextResponse.json({ analisis: texto, datos: resumen })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}