import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.gasto.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}