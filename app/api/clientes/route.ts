import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const clientes = await db.cliente.findMany({
    include: { pedidos: true }
  })
  return NextResponse.json(clientes)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { nombre, telefono, direccion } = body
  const cliente = await db.cliente.create({
    data: { nombre, telefono, direccion }
  })
  return NextResponse.json(cliente)
}
