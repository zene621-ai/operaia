'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Cliente { id: number; nombre: string }
interface Item { producto: string; cantidad: number; precio: number }
interface Pedido { id: number; total: number; estado: string; createdAt: string; cliente: Cliente; items: Item[] }

const ESTADOS = ['pendiente', 'en camino', 'entregado', 'cancelado']
const BADGE: Record<string, { bg: string, color: string }> = {
  'pendiente': { bg: '#fff8e8', color: '#b87c00' },
  'en camino': { bg: '#e8f0fb', color: '#185FA5' },
  'entregado': { bg: '#e8f7f1', color: '#0f6e56' },
  'cancelado': { bg: '#fef0f0', color: '#cc0000' },
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [items, setItems] = useState<Item[]>([{ producto: '', cantidad: 1, precio: 0 }])
  const [loading, setLoading] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [mostrarForm, setMostrarForm] = useState(false)

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
    setMostrarForm(false)
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

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro)

  return (
    <main style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: 0 }}>Pedidos</h1>
            <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>{pedidos.length} pedidos registrados</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: '13px', color: '#666', textDecoration: 'none', padding: '8px 14px', background: '#fff', borderRadius: '8px', border: '0.5px solid #e8e8e8' }}>← Inicio</Link>
            <button onClick={() => setMostrarForm(!mostrarForm)} style={{ fontSize: '13px', color: '#fff', background: '#1D9E75', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600' }}>
              + Nuevo pedido
            </button>
          </div>
        </div>

        {/* Formulario */}
        {mostrarForm && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '20px', border: '0.5px solid #e8e8e8' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Nuevo pedido</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px' }}>
                <option value="">Seleccionar cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                <p style={{ fontSize: '12px', color: '#999', paddingLeft: '4px' }}>Producto</p>
                <p style={{ fontSize: '12px', color: '#999', paddingLeft: '4px' }}>Cantidad</p>
                <p style={{ fontSize: '12px', color: '#999', paddingLeft: '4px' }}>Precio unit.</p>
              </div>

              {items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                  <input placeholder="Ej: Caja de leche" value={item.producto} onChange={e => actualizarItem(index, 'producto', e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px' }} />
                  <input type="number" min="1" value={item.cantidad} onChange={e => actualizarItem(index, 'cantidad', e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px' }} />
                  <input type="number" min="0" value={item.precio} onChange={e => actualizarItem(index, 'precio', e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px' }} />
                </div>
              ))}

              <p style={{ fontSize: '13px', color: '#666', textAlign: 'right' }}>
                Subtotal: <strong style={{ color: '#111' }}>${items.reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precio), 0).toLocaleString('es', { minimumFractionDigits: 2 })}</strong>
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setItems([...items, { producto: '', cantidad: 1, precio: 0 }])} style={{ padding: '10px 16px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>+ Producto</button>
                <button onClick={crearPedido} disabled={loading} style={{ flex: 1, padding: '10px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? 'Guardando...' : 'Registrar pedido'}
                </button>
                <button onClick={() => setMostrarForm(false)} style={{ padding: '10px 16px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['todos', ...ESTADOS].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: filtro === f ? '600' : '400', background: filtro === f ? '#1D9E75' : '#fff', color: filtro === f ? '#fff' : '#666', border: filtro === f ? 'none' : '0.5px solid #e8e8e8' } as any}>
              {f === 'todos' ? 'Todos' : f} {f !== 'todos' && `(${pedidos.filter(p => p.estado === f).length})`}
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pedidosFiltrados.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '14px' }}>No hay pedidos {filtro !== 'todos' ? `con estado "${filtro}"` : 'aún'}</p>
          )}
          {pedidosFiltrados.map(pedido => (
            <div key={pedido.id} style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px', border: '0.5px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f0fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#185FA5', flexShrink: 0 }}>
                    {pedido.cliente?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#111', margin: 0 }}>{pedido.cliente?.nombre}</p>
                    <p style={{ fontSize: '12px', color: '#bbb', margin: 0 }}>{new Date(pedido.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#1D9E75', margin: 0 }}>${pedido.total.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
                {pedido.items.map((item, i) => <span key={i}>{item.producto} x{item.cantidad} — ${(item.cantidad * item.precio).toLocaleString('es', { minimumFractionDigits: 2 })} · </span>)}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ESTADOS.map(e => (
                    <button key={e} onClick={() => cambiarEstado(pedido.id, e)} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: pedido.estado === e ? '600' : '400', background: pedido.estado === e ? BADGE[e].bg : '#f7f8fa', color: pedido.estado === e ? BADGE[e].color : '#999' }}>
                      {e}
                    </button>
                  ))}
                </div>
                <button onClick={() => eliminarPedido(pedido.id)} style={{ padding: '5px 12px', borderRadius: '8px', border: '0.5px solid #ffcccc', background: '#fff0f0', color: '#cc0000', fontSize: '12px', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}