'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Gasto {
  id: number
  descripcion: string
  monto: number
  categoria: string
  createdAt: string
}

const CATEGORIAS = ['general', 'nomina', 'transporte', 'inventario', 'servicios', 'otro']

export default function ContabilidadPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [ingresos, setIngresos] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('general')
  const [loading, setLoading] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroCat, setFiltroCat] = useState('todos')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [g, p] = await Promise.all([
      fetch('/api/gastos').then(r => r.json()),
      fetch('/api/pedidos').then(r => r.json()),
    ])
    setGastos(g)
    setIngresos(p.reduce((acc: number, p: any) => acc + p.total, 0))
  }

  async function crearGasto() {
    if (!descripcion || !monto) return
    setLoading(true)
    await fetch('/api/gastos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion, monto: Number(monto), categoria })
    })
    setDescripcion('')
    setMonto('')
    setCategoria('general')
    setLoading(false)
    setMostrarForm(false)
    fetchData()
  }

  async function eliminarGasto(id: number) {
    if (!confirm('¿Eliminar este gasto?')) return
    await fetch(`/api/gastos/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0)
  const gananciaNeta = ingresos - totalGastos
  const margen = ingresos > 0 ? (gananciaNeta / ingresos) * 100 : 0

  const gastosFiltrados = filtroCat === 'todos' ? gastos : gastos.filter(g => g.categoria === filtroCat)

  const porCategoria = CATEGORIAS.map(cat => ({
    cat,
    total: gastos.filter(g => g.categoria === cat).reduce((acc, g) => acc + g.monto, 0)
  })).filter(c => c.total > 0)

  return (
    <main style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: 0 }}>Contabilidad</h1>
            <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>Ingresos, gastos y ganancias</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" style={{ fontSize: '13px', color: '#666', textDecoration: 'none', padding: '8px 14px', background: '#fff', borderRadius: '8px', border: '0.5px solid #e8e8e8' }}>← Inicio</Link>
            <button onClick={() => setMostrarForm(!mostrarForm)} style={{ fontSize: '13px', color: '#fff', background: '#1D9E75', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600' }}>
              + Nuevo gasto
            </button>
          </div>
        </div>

        {/* Métricas principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '500' }}>Ingresos totales</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1D9E75', margin: 0 }}>${ingresos.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>De pedidos</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '500' }}>Total gastos</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: 0 }}>${totalGastos.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>{gastos.length} registros</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: `0.5px solid ${gananciaNeta >= 0 ? '#e8e8e8' : '#ffcccc'}` }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '500' }}>Ganancia neta</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: gananciaNeta >= 0 ? '#1D9E75' : '#ef4444', margin: 0 }}>${gananciaNeta.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>Ingresos - Gastos</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e8e8e8' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '500' }}>Margen</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: margen >= 0 ? '#1D9E75' : '#ef4444', margin: 0 }}>{margen.toFixed(1)}%</p>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>De rentabilidad</p>
          </div>
        </div>

        {/* Barra visual de ingresos vs gastos */}
        {ingresos > 0 && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '0.5px solid #e8e8e8' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>Ingresos vs Gastos</p>
            <div style={{ background: '#f0f0f0', borderRadius: '99px', height: '12px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', width: `${Math.min((totalGastos / ingresos) * 100, 100)}%`, background: totalGastos > ingresos ? '#ef4444' : '#1D9E75', borderRadius: '99px', transition: 'width 0.5s' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
              <span>Gastos: {ingresos > 0 ? ((totalGastos / ingresos) * 100).toFixed(1) : 0}% de ingresos</span>
              <span>Ganancia: {margen.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Gastos por categoría */}
        {porCategoria.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '0.5px solid #e8e8e8' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>Por categoría</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {porCategoria.map(c => (
                <div key={c.cat} style={{ background: '#f7f8fa', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px', textTransform: 'capitalize' }}>{c.cat}</p>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>${c.total.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        {mostrarForm && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '20px', border: '0.5px solid #e8e8e8' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Registrar gasto</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Descripción del gasto" value={descripcion} onChange={e => setDescripcion(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px' }} />
              <input type="number" placeholder="Monto" value={monto} onChange={e => setMonto(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px' }} />
              <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px' }}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={crearGasto} disabled={loading} style={{ padding: '10px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Guardando...' : 'Registrar'}
              </button>
              <button onClick={() => setMostrarForm(false)} style={{ padding: '10px 20px', background: '#f0f0f0', color: '#666', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['todos', ...CATEGORIAS].map(f => (
            <button key={f} onClick={() => setFiltroCat(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: filtroCat === f ? 'none' : '0.5px solid #e8e8e8', fontSize: '13px', cursor: 'pointer', fontWeight: filtroCat === f ? '600' : '400', background: filtroCat === f ? '#1D9E75' : '#fff', color: filtroCat === f ? '#fff' : '#666' } as any}>
              {f === 'todos' ? 'Todos' : f}
            </button>
          ))}
        </div>

        {/* Lista de gastos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {gastosFiltrados.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '14px' }}>No hay gastos registrados</p>
          )}
          {gastosFiltrados.map(gasto => (
            <div key={gasto.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '0.5px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💸</div>
                <div>
                  <p style={{ fontWeight: '500', fontSize: '14px', color: '#111', margin: 0 }}>{gasto.descripcion}</p>
                  <p style={{ fontSize: '12px', color: '#bbb', margin: 0 }}>{gasto.categoria} · {new Date(gasto.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444', margin: 0 }}>-${gasto.monto.toLocaleString('es', { minimumFractionDigits: 2 })}</p>
                <button onClick={() => eliminarGasto(gasto.id)} style={{ padding: '5px 10px', borderRadius: '8px', border: '0.5px solid #ffcccc', background: '#fff0f0', color: '#cc0000', fontSize: '12px', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}