interface FinanceLogoProps {
  size?: number
  /** 'mark' = icon only, 'full' = icon + wordmark */
  variant?: 'mark' | 'full'
  className?: string
}

export default function FinanceLogo({ size = 32, variant = 'full', className }: FinanceLogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28 }} className={className}>
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" fill="#1a1a2e" />

        {/* Rising bar chart — 3 bars */}
        <rect x="7" y="24" width="5" height="9" rx="1.5" fill="#4F6EF7" opacity="0.5" />
        <rect x="14" y="18" width="5" height="15" rx="1.5" fill="#4F6EF7" opacity="0.75" />
        <rect x="21" y="12" width="5" height="21" rx="1.5" fill="#4F6EF7" />

        {/* Upward trend line over bars */}
        <polyline
          points="9.5,26 16.5,20 23.5,14 31,8"
          stroke="#a5b4fc"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Arrow head on the trend line */}
        <polyline
          points="27,7 31,8 30,12"
          stroke="#a5b4fc"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Dollar sign accent — top-left */}
        <text x="29" y="33" fontSize="9" fontWeight="900" fill="#4F6EF7" fontFamily="system-ui,sans-serif">$</text>
      </svg>

      {/* Wordmark */}
      {variant === 'full' && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontSize: size * 0.38,
            fontWeight: 900,
            color: '#1a1a2e',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>
            Finance
          </div>
          <div style={{
            fontSize: size * 0.22,
            fontWeight: 600,
            color: '#9ca3af',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginTop: 1,
          }}>
            by DataPrimeTech
          </div>
        </div>
      )}
    </div>
  )
}
