'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Cliente {
  id: number
  nombre: string
  telefono: string
  direccion: string
  pedidos: any[]
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [loading, setLoading] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)

  useEffect(() => { fetchClientes() }, [])

  async function fetchClientes() {
    const res = await fetch('/api/clientes')
    const data = await res.json()
    setClientes(data)
  }

  async function crearCliente() {
    if (!nombre || !telefono || !direccion) return
    setLoading(true)
    await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, direccion })
    })
    setNombre('')
    setTelefono('')
    setDireccion('')
    setLoading(false)
    fetchClientes()
  }

  async function eliminarCliente(id: number) {
    if (!confirm('¿Eliminar este cliente y todos sus pedidos?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    setClienteSeleccionado(null)
    fetchClientes()
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda) ||
    c.direccion.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Clientes</h1>
        <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>← Inicio</Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #eee' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Nuevo cliente</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
          <input placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
          <input placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
          <button onClick={crearCliente} disabled={loading} style={{ padding: '10px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {loading ? 'Guardando...' : 'Registrar cliente'}
          </button>
        </div>
      </div>

      <input
        placeholder="🔍 Buscar por nombre, teléfono o dirección..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '16px', background: '#fff' }}
      />

      {clienteSeleccionado && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '2px solid #1D9E75' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{clienteSeleccionado.nombre}</h2>
              <p style={{ fontSize: '13px', color: '#666' }}>{clienteSeleccionado.telefono} · {clienteSeleccionado.direccion}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => eliminarCliente(clienteSeleccionado.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ffcccc', background: '#fff0f0', color: '#cc0000', fontSize: '12px', cursor: 'pointer' }}>Eliminar</button>
              <button onClick={() => setClienteSeleccionado(null)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f4f4f0', color: '#666', fontSize: '12px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
          <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '10px', color: '#333' }}>Historial de pedidos ({clienteSeleccionado.pedidos.length})</p>
          {clienteSeleccionado.pedidos.length === 0 && <p style={{ fontSize: '13px', color: '#999' }}>Sin pedidos aún</p>}
          {clienteSeleccionado.pedidos.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
              <span style={{ color: '#444' }}>{new Date(p.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span style={{ color: '#666' }}>{p.estado}</span>
              <span style={{ fontWeight: '600', color: '#1D9E75' }}>${p.total.toFixed(2)}</span>
            </div>
          ))}
          {clienteSeleccionado.pedidos.length > 0 && (
            <p style={{ fontSize: '13px', fontWeight: '600', textAlign: 'right', marginTop: '10px', color: '#111' }}>
              Total: ${clienteSeleccionado.pedidos.reduce((acc: number, p: any) => acc + p.total, 0).toFixed(2)}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clientesFiltrados.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>
            {busqueda ? 'No se encontraron clientes' : 'No hay clientes aún'}
          </p>
        )}
        {clientesFiltrados.map(cliente => (
          <div key={cliente.id} onClick={() => setClienteSeleccionado(cliente)} style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: clienteSeleccionado?.id === cliente.id ? '2px solid #1D9E75' : '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <p style={{ fontWeight: '500', marginBottom: '4px' }}>{cliente.nombre}</p>
              <p style={{ fontSize: '13px', color: '#666' }}>{cliente.telefono} · {cliente.direccion}</p>
            </div>
            <p style={{ fontSize: '13px', color: '#1D9E75', fontWeight: '500' }}>{cliente.pedidos.length} pedidos</p>
          </div>
        ))}
      </div>
    </main>
  )
}