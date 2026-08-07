import React from 'react'
import SkeletonBlock from 'src/components/shared/SkeletonBlock'

export default function AccountCardSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 10,
        borderLeft: '4px solid #e9ecef',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SkeletonBlock circle width={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <SkeletonBlock width="55%" height={14} />
          <div style={{ marginTop: 8 }}>
            <SkeletonBlock width="75%" height={10} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <SkeletonBlock width={64} height={20} className="skeleton-block--pill" />
          <SkeletonBlock width={70} height={26} className="skeleton-block--pill" />
        </div>
      </div>
    </div>
  )
}
