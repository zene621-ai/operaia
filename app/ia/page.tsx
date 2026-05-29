'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function IAPage() {
  const [analisis, setAnalisis] = useState('')
  const [datos, setDatos] = useState<any[]>([])
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
        setDatos(data.datos ?? [])
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Análisis IA</h1>
        <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>← Inicio</Link>
      </div>

      <button
        onClick={obtenerAnalisis}
        disabled={loading}
        style={{ width: '100%', padding: '14px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', marginBottom: '24px' }}
      >
        {loading ? 'Analizando operaciones...' : '✨ Analizar mi negocio con IA'}
      </button>

      {error && (
        <div style={{ background: '#fff0f0', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #ffcccc' }}>
          <p style={{ color: '#cc0000', fontSize: '13px' }}>{error}</p>
        </div>
      )}

      {analisis && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #eee' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1D9E75' }}>Análisis operativo</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{analisis}</p>
        </div>
      )}

      {datos.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #eee' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Datos por cliente</h2>
          {datos.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <p style={{ fontWeight: '500', fontSize: '14px' }}>{d.nombre}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{d.totalPedidos} pedidos</p>
              </div>
              <p style={{ fontWeight: '600', color: '#1D9E75', fontSize: '14px' }}>${d.totalGastado.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}