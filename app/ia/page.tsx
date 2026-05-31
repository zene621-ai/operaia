'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function IAPage() {
  const [analisis, setAnalisis] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function obtenerAnalisis() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ia')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setAnalisis(data.analisis)
        setDatos(data.datos)
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: 0 }}>Análisis IA</h1>
            <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>Resumen inteligente de tus operaciones</p>
          </div>
          <Link href="/" style={{ fontSize: '13px', color: '#666', textDecoration: 'none', padding: '8px 14px', background: '#fff', borderRadius: '8px', border: '0.5px solid #e8e8e8' }}>← Inicio</Link>
        </div>

        <button onClick={obtenerAnalisis} disabled={loading} style={{ width: '100%', padding: '16px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '24px', opacity: loading ? 0.8 : 1 }}>
          {loading ? '✨ Analizando operaciones...' : '✨ Analizar mi negocio con IA'}
        </button>

        {error && (
          <div style={{ background: '#fff0f0', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '0.5px solid #ffcccc' }}>
            <p style={{ color: '#cc0000', fontSize: '13px', margin: 0 }}>{error}</p>
          </div>
        )}

        {datos && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Clientes', value: datos.totalClientes, color: '#111' },
              { label: 'Pedidos', value: datos.totalPedidos, color: '#111' },
              { label: 'Ingresos', value: `$${datos.ingresos.toLocaleString('es', { minimumFractionDigits: 2 })}`, color: '#1D9E75' },
              { label: 'Ganancia neta', value: `$${datos.ganancia.toLocaleString('es', { minimumFractionDigits: 2 })}`, color: datos.ganancia >= 0 ? '#1D9E75' : '#ef4444' },
            ].map((m, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '0.5px solid #e8e8e8' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>{m.label}</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: m.color, margin: 0 }}>{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {analisis && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', border: '0.5px solid #e8e8e8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', background: '#1D9E75', borderRadius: '50%' }}></div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: 0 }}>Análisis operativo</p>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#444', whiteSpace: 'pre-wrap', margin: 0 }}>{analisis}</p>
          </div>
        )}

        {datos?.topClientes?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '0.5px solid #e8e8e8' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Top clientes</p>
            {datos.topClientes.map((c: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < datos.topClientes.length - 1 ? '0.5px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f7f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#0f6e56' }}>
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#111', margin: 0 }}>{c.nombre}</p>
                    <p style={{ fontSize: '11px', color: '#bbb', margin: 0 }}>{c.pedidos} pedidos</p>
                  </div>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1D9E75', margin: 0 }}>${c.total.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}