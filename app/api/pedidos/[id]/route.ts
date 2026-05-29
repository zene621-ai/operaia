import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const pedido = await db.pedido.update({
    where: { id: parseInt(id) },
    data: { estado: body.estado }
  })
  return NextResponse.json(pedido)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.itemPedido.deleteMany({ where: { pedidoId: parseInt(id) } })
  await db.pedido.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}