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
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [loading, setLoading] = useState(false)

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clientes.length === 0 && <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No hay clientes aún</p>}
        {clientes.map(cliente => (
          <div key={cliente.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
