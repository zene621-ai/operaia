'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [stats, setStats] = useState({ clientes: 0, pedidos: 0, ingresos: 0 })

  useEffect(() => {
    async function cargar() {
      const [c, p] = await Promise.all([
        fetch('/api/clientes').then(r => r.json()),
        fetch('/api/pedidos').then(r => r.json()),
      ])
      setStats({
        clientes: c.length,
        pedidos: p.length,
        ingresos: p.reduce((acc: number, p: any) => acc + p.total, 0)
      })
    }
    cargar()
  }, [])

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>OperaIA</h1>
        <p style={{ color: '#666', fontSize: '15px' }}>Sistema Operativo Empresarial</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total clientes</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#111' }}>{stats.clientes}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total pedidos</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#111' }}>{stats.pedidos}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Ingresos totales</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1D9E75' }}>${stats.ingresos.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Link href="/clientes" style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #eee', textDecoration: 'none', display: 'block' }}>
          <p style={{ fontSize: '20px', marginBottom: '8px' }}>👥</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>Clientes</p>
          <p style={{ fontSize: '13px', color: '#666' }}>Registrar y gestionar clientes</p>
        </Link>
        <Link href="/pedidos" style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #eee', textDecoration: 'none', display: 'block' }}>
          <p style={{ fontSize: '20px', marginBottom: '8px' }}>📦</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>Pedidos</p>
          <p style={{ fontSize: '13px', color: '#666' }}>Registrar y ver historial</p>
        </Link>
      </div>
    </main>
  )
}