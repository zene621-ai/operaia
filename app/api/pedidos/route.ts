import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const pedidos = await db.pedido.findMany({
    include: { cliente: true, items: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(pedidos)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { clienteId, items } = body
  const total = items.reduce((acc: number, item: any) => acc + item.precio * item.cantidad, 0)
  const pedido = await db.pedido.create({
    data: {
      clienteId,
      total,
      items: { create: items }
    },
    include: { items: true, cliente: true }
  })
  return NextResponse.json(pedido)
}