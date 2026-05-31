import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '8px' }}>OperaIA</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>Sistema Operativo Empresarial con IA</p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href="/clientes" style={{ padding: '12px 24px', background: '#1D9E75', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>Clientes</Link>
        <Link href="/pedidos" style={{ padding: '12px 24px', background: '#fff', color: '#333', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', border: '1px solid #ddd' }}>Pedidos</Link>
      </div>
    </main>
  )
}
