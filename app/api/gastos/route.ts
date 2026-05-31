import { db } from '@/lib/db'
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
