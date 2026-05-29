'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Cliente { id: number; nombre: string }
interface Item { producto: string; cantidad: number; precio: number }
interface Pedido { id: number; total: number; estado: string; createdAt: string; cliente: Cliente; items: Item[] }

const ESTADOS = ['pendiente', 'en camino', 'entregado', 'cancelado']
const COLORES: Record<string, string> = {
  'pendiente': '#f59e0b',
  'en camino': '#3b82f6',
  'entregado': '#1D9E75',
  'cancelado': '#ef4444'
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [items, setItems] = useState<Item[]>([{ producto: '', cantidad: 1, precio: 0 }])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchPedidos(); fetchClientes() }, [])

  async function fetchPedidos() {
    const res = await fetch('/api/pedidos')
    const data = await res.json()
    setPedidos(data)
  }

  async function fetchClientes() {
    const res = await fetch('/api/clientes')
    const data = await res.json()
    setClientes(data)
  }

  function actualizarItem(index: number, campo: string, valor: string | number) {
    const nuevos = [...items]
    nuevos[index] = { ...nuevos[index], [campo]: valor }
    setItems(nuevos)
  }

  async function crearPedido() {
    if (!clienteId || items.some(i => !i.producto)) return
    setLoading(true)
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId: parseInt(clienteId), items: items.map(i => ({ ...i, cantidad: Number(i.cantidad), precio: Number(i.precio) })) })
    })
    setClienteId('')
    setItems([{ producto: '', cantidad: 1, precio: 0 }])
    setLoading(false)
    fetchPedidos()
  }

  async function cambiarEstado(id: number, estado: string) {
    await fetch(`/api/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    })
    fetchPedidos()
  }

  async function eliminarPedido(id: number) {
    if (!confirm('¿Eliminar este pedido?')) return
    await fetch(`/api/pedidos/${id}`, { method: 'DELETE' })
    fetchPedidos()
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Pedidos</h1>
        <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>← Inicio</Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #eee' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Nuevo pedido</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}>
            <option value="">Seleccionar cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: '#888', paddingLeft: '4px' }}>Producto</p>
            <p style={{ fontSize: '12px', color: '#888', paddingLeft: '4px' }}>Cantidad</p>
            <p style={{ fontSize: '12px', color: '#888', paddingLeft: '4px' }}>Precio unit.</p>
          </div>

          {items.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <input placeholder="Ej: Caja de leche" value={item.producto} onChange={e => actualizarItem(index, 'producto', e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="number" min="1" value={item.cantidad} onChange={e => actualizarItem(index, 'cantidad', e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="number" min="0" value={item.precio} onChange={e => actualizarItem(index, 'precio', e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
            </div>
          ))}

          {items.length > 0 && (
            <p style={{ fontSize: '13px', color: '#666', textAlign: 'right' }}>
              Subtotal: <strong style={{ color: '#111' }}>${items.reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precio), 0).toFixed(2)}</strong>
            </p>
          )}

          <button onClick={() => setItems([...items, { producto: '', cantidad: 1, precio: 0 }])} style={{ padding: '8px', background: '#f4f4f0', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>+ Agregar producto</button>
          <button onClick={crearPedido} disabled={loading} style={{ padding: '10px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {loading ? 'Guardando...' : 'Registrar pedido'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pedidos.length === 0 && <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No hay pedidos aún</p>}
        {pedidos.map(pedido => (
          <div key={pedido.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontWeight: '600', fontSize: '15px' }}>{pedido.cliente.nombre}</p>
              <p style={{ fontWeight: '700', color: '#1D9E75', fontSize: '15px' }}>${pedido.total.toFixed(2)}</p>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
              {pedido.items.map((item, i) => (
                <span key={i}>{item.producto} x{item.cantidad} — ${(item.cantidad * item.precio).toFixed(2)} · </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ESTADOS.map(e => (
                  <button key={e} onClick={() => cambiarEstado(pedido.id, e)} style={{ padding: '4px 10px', borderRadius: '99px', border: 'none', fontSize: '12px', cursor: 'pointer', background: pedido.estado === e ? COLORES[e] : '#f0f0f0', color: pedido.estado === e ? '#fff' : '#666', fontWeight: pedido.estado === e ? '600' : '400' }}>
                    {e}
                  </button>
                ))}
              </div>
              <button onClick={() => eliminarPedido(pedido.id)} style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #ffcccc', background: '#fff0f0', color: '#cc0000', fontSize: '12px', cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
              {new Date(pedido.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}