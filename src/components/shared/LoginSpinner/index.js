import React from 'react'
import './LoginSpinner.scss'

const LoginSpinner = ({ step = 0 }) => (
  <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
    {/* ── Inner pie (r=13) ── */}
    <path d="M 20,20 L 20,7 A 13,13 0 0,1 33,20 Z" fill="rgba(255,255,255,0.12)" />
    <path d="M 20,20 L 33,20 A 13,13 0 0,1 20,33 Z" fill="rgba(255,255,255,0.12)" />
    <path d="M 20,20 L 20,33 A 13,13 0 0,1 7,20 Z"  fill="rgba(255,255,255,0.12)" />
    <path d="M 20,20 L 7,20 A 13,13 0 0,1 20,7 Z"   fill="rgba(255,255,255,0.12)" />
    {step >= 1 && <path d="M 20,20 L 20,7 A 13,13 0 0,1 33,20 Z" fill="white" opacity="0.9" />}
    {step >= 2 && <path d="M 20,20 L 33,20 A 13,13 0 0,1 20,33 Z" fill="white" opacity="0.9" />}
    {step >= 3 && <path d="M 20,20 L 20,33 A 13,13 0 0,1 7,20 Z"  fill="white" opacity="0.9" />}
    {step >= 4 && <path d="M 20,20 L 7,20 A 13,13 0 0,1 20,7 Z"   fill="white" opacity="0.9" />}
    <line x1="20" y1="20" x2="20" y2="7"  stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    <line x1="20" y1="20" x2="33" y2="20" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    <line x1="20" y1="20" x2="20" y2="33" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    <line x1="20" y1="20" x2="7"  y2="20" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />

    {/* ── Outer ring (r=18) — spins immediately, fills in 4 arcs by step ── */}
    <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
    <g className="login-spinner__ring">
      {/* Dashed ring always visible from step 0 */}
      <circle cx="20" cy="20" r="18" stroke="rgba(0,0,0,0.45)" strokeWidth="2" strokeDasharray="5 3" />
      {/* Solid arcs fill in per step */}
      {step >= 1 && <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="3" strokeDasharray="28.27 84.82" strokeDashoffset="0"      strokeLinecap="butt" />}
      {step >= 2 && <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="3" strokeDasharray="28.27 84.82" strokeDashoffset="-28.27"  strokeLinecap="butt" />}
      {step >= 3 && <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="3" strokeDasharray="28.27 84.82" strokeDashoffset="-56.55"  strokeLinecap="butt" />}
      {step >= 4 && <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="3" strokeDasharray="28.27 84.82" strokeDashoffset="-84.82"  strokeLinecap="butt" />}
    </g>
  </svg>
)

export default LoginSpinner
