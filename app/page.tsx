'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [stats, setStats] = useState({
    clientesTotal: 0,
    pedidosHoy: 0,
    pedidosPendientes: 0,
    ingresosHoy: 0,
    ingresosTotal: 0,
    pedidosEntregados: 0,
  })
  const [ultimosPedidos, setUltimosPedidos] = useState<any[]>([])

  useEffect(() => {
    async function cargar() {
      const [c, p] = await Promise.all([
        fetch('/api/clientes').then(r => r.json()),
        fetch('/api/pedidos').then(r => r.json()),
      ])
      const hoy = new Date().toDateString()
      const pedidosHoy = p.filter((p: any) => new Date(p.createdAt).toDateString() === hoy)
      const pedidosPendientes = p.filter((p: any) => p.estado === 'pendiente')
      const pedidosEntregados = p.filter((p: any) => p.estado === 'entregado')
      setStats({
        clientesTotal: c.length,
        pedidosHoy: pedidosHoy.length,
        pedidosPendientes: pedidosPendientes.length,
        ingresosHoy: pedidosHoy.reduce((acc: number, p: any) => acc + p.total, 0),
        ingresosTotal: p.reduce((acc: number, p: any) => acc + p.total, 0),
        pedidosEntregados: pedidosEntregados.length,
      })
      setUltimosPedidos(p.slice(0, 5))
    }
    cargar()
  }, [])

  const fecha = new Date().toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const BADGE: Record<string, { bg: string, color: string }> = {
    'pendiente': { bg: '#fff8e8', color: '#b87c00' },
    'en camino': { bg: '#e8f0fb', color: '#185FA5' },
    'entregado': { bg: '#e8f7f1', color: '#0f6e56' },
    'cancelado': { bg: '#fef0f0', color: '#cc0000' },
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', padding: '20px 24px', background: '#fff', borderRadius: '14px', border: '0.5px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#1D9E75', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>O</div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: 0 }}>OperaIA</h1>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Sistema Operativo Empresarial</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#999', textTransform: 'capitalize' }}>{fecha}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1D9E75', background: '#e8f7f1', padding: '6px 12px', borderRadius: '20px' }}>
              <div style={{ width: '6px', height: '6px', background: '#1D9E75', borderRadius: '50%' }}></div>
              Sistema activo
            </div>
          </div>
        </div>

        <p style={{ fontSize: '11px', fontWeight: '600', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Resumen del día</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Pedidos hoy', value: stats.pedidosHoy, sub: 'registrados hoy', color: '#111' },
            { label: 'Ingresos hoy', value: `$${stats.ingresosHoy.toLocaleString('es', { minimumFractionDigits: 2 })}`, sub: 'facturado hoy', color: '#1D9E75' },
            { label: 'Pendientes', value: stats.pedidosPendientes, sub: 'requieren atención', color: stats.pedidosPendientes > 0 ? '#f59e0b' : '#111' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8' }}>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '500' }}>{m.label}</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: m.color, lineHeight: '1', margin: 0 }}>{m.value}</p>
              <p style={{ fontSize: '11px', color: '#bbb', marginTop: '6px' }}>{m.sub}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', fontWeight: '600', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>General</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Clientes activos', value: stats.clientesTotal, sub: 'registrados', color: '#111' },
            { label: 'Entregados', value: stats.pedidosEntregados, sub: 'total histórico', color: '#1D9E75' },
            { label: 'Ingresos totales', value: `$${stats.ingresosTotal.toLocaleString('es', { minimumFractionDigits: 2 })}`, sub: 'acumulado', color: '#111' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8' }}>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '500' }}>{m.label}</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: m.color, lineHeight: '1', margin: 0 }}>{m.value}</p>
              <p style={{ fontSize: '11px', color: '#bbb', marginTop: '6px' }}>{m.sub}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', fontWeight: '600', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Módulos</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <Link href="/clientes" style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: '#e8f7f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>👥</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 2px' }}>Clientes</p>
              <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Registrar y gestionar</p>
            </div>
            <span style={{ color: '#ccc', fontSize: '20px' }}>›</span>
          </Link>
          <Link href="/pedidos" style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: '#e8f0fb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📦</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 2px' }}>Pedidos</p>
              <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Registrar y ver historial</p>
            </div>
            <span style={{ color: '#ccc', fontSize: '20px' }}>›</span>
          </Link>
          <Link href="/contabilidad" style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: '#fef0f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💰</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 2px' }}>Contabilidad</p>
              <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Gastos, ganancias y margen</p>
            </div>
            <span style={{ color: '#ccc', fontSize: '20px' }}>›</span>
          </Link>
        </div>

        {ultimosPedidos.length > 0 && (
          <>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Últimos pedidos</p>
            <div style={{ background: '#fff', borderRadius: '14px', border: '0.5px solid #e8e8e8', overflow: 'hidden' }}>
              {ultimosPedidos.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < ultimosPedidos.length - 1 ? '0.5px solid #f0f0f0' : 'none' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#111', margin: '0 0 2px' }}>{p.cliente?.nombre}</p>
                    <p style={{ fontSize: '11px', color: '#bbb', margin: 0 }}>{new Date(p.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', background: BADGE[p.estado]?.bg ?? '#f0f0f0', color: BADGE[p.estado]?.color ?? '#666' }}>{p.estado}</span>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', margin: 0 }}>${p.total.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  )
}