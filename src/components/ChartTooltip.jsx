import React from 'react'

export default function ChartTooltip({ active, payload, label, prefix = '', suffix = '', color = '#00e5ff' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #21262d',
      padding: '8px 12px', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: '0.6875rem',
    }}>
      <p style={{ color: '#7d8590', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || color }}>
          {p.name}: <strong>{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}</strong>
        </p>
      ))}
    </div>
  )
}
