import './SkeletonBlock.scss'

export default function SkeletonBlock({ width, height = 14, circle = false, className = '' }) {
  return (
    <div
      className={`skeleton-block${circle ? ' skeleton-block--circle' : ''}${className ? ` ${className}` : ''}`}
      style={{ width, height: circle ? width : height }}
    />
  )
}
