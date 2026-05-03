import React from 'react'

export default function GridInfoModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#fff',
          borderRadius: 20,
          padding: '28px 26px 24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0d1117', marginBottom: 20 }}>
          ¿Qué es el Grid Trading?
        </div>

        {/* Grid Long */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 8 }}>
            📈 Grid Long
          </div>
          <div style={{ fontSize: 13, color: '#15803d', lineHeight: 1.7 }}>
            El bot coloca <strong>órdenes de compra (BUY)</strong> por debajo del precio actual y{' '}
            <strong>órdenes de venta (SELL)</strong> por encima. Cada vez que el precio baja toca un
            nivel y compra; cuando vuelve a subir, vende con ganancia. Ideal cuando esperás que el
            activo se mantenga en rango o suba.
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              fontWeight: 700,
              color: '#166534',
              background: '#dcfce7',
              borderRadius: 8,
              padding: '7px 12px',
            }}
          >
            ✅ Solo necesitás <strong>dólares (USDT)</strong> para empezar. El bot compra el activo
            con tus USDT y lo va rotando.
          </div>
        </div>

        {/* Grid Short */}
        <div
          style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>
            📉 Grid Short
          </div>
          <div style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.7 }}>
            El bot coloca <strong>órdenes de venta (SELL)</strong> por encima del precio actual y{' '}
            <strong>órdenes de recompra (BUY)</strong> por debajo. Vende caro y recompra barato.
            Ideal cuando esperás que el activo baje o se mantenga en rango a la baja.
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              fontWeight: 700,
              color: '#991b1b',
              background: '#fee2e2',
              borderRadius: 8,
              padding: '7px 12px',
            }}
          >
            ⚠️ Necesitás tener el <strong>activo</strong> (ej. BTC) para empezar, no USDT. Sin el
            activo no podés abrir un Grid Short.
          </div>
        </div>

        {/* Conclusion */}
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: '#92400e',
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          💡 <strong>Si solo tenés dólares</strong>, operá siempre con <strong>Grid Long</strong>.
          El Grid Short requiere que ya tengas el activo en tu cartera.
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            minHeight: 46,
            borderRadius: 12,
            border: 'none',
            background: '#0d1117',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
