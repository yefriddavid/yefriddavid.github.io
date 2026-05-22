import React from 'react'
import { CSpinner } from '@coreui/react'
import './Spinner.scss'

/**
 * mode="page"    → fixed overlay covering the full screen (auth resolving, initial load)
 * mode="section" → centered in a content area with padding (Suspense fallbacks, data loading)
 * mode="inline"  → bare spinner, no wrapper (default — button states, small indicators)
 */
const Spinner = ({ mode = 'inline', color = 'primary', variant, size, style, className }) => {
  const spinner = (
    <CSpinner color={color} variant={variant} size={size} style={style} className={className} />
  )

  if (mode === 'page') return <div className="app-spinner app-spinner--page">{spinner}</div>
  if (mode === 'section') return <div className="app-spinner app-spinner--section">{spinner}</div>
  return spinner
}

export default Spinner
