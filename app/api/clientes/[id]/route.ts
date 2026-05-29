import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const clienteId = parseInt(id)
  await db.itemPedido.deleteMany({ where: { pedido: { clienteId } } })
  await db.pedido.deleteMany({ where: { clienteId } })
  await db.cliente.delete({ where: { id: clienteId } })
  return NextResponse.json({ ok: true })
}