import React, { useState } from 'react'
import { GALLERIES } from 'src/utils/galleries'
import './Gallery.scss'

const GalleryList = () => {
  const [copied, setCopied] = useState(null)

  const shareUrl = (folder) => `${window.location.origin}/gallery/${folder}`

  const handleCopy = (folder) => {
    navigator.clipboard.writeText(shareUrl(folder))
    setCopied(folder)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="gl-list">
      <div className="gl-list__header">
        <h4 className="gl-list__title">Galerías</h4>
        <p className="gl-list__hint">Comparte el link para que los interesados vean las fotos sin necesidad de cuenta.</p>
      </div>

      <div className="gl-list__grid">
        {GALLERIES.map((g) => (
          <div key={g.folder} className="gl-card">
            <div className="gl-card__cover" style={{ borderTopColor: g.color ?? '#4a9eff' }}>
              <img src={g.thumbs[0]} alt={g.title} loading="lazy" className="gl-card__cover-img" />
              <span className="gl-card__badge">{g.images.length} fotos</span>
            </div>
            <div className="gl-card__body">
              <div className="gl-card__info">
                <span className="gl-card__name">{g.title}</span>
                {g.subtitle && <span className="gl-card__sub">{g.subtitle}</span>}
              </div>
              <div className="gl-card__actions">
                <a
                  className="gl-card__btn gl-card__btn--view"
                  href={shareUrl(g.folder)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver galería
                </a>
                <button
                  className={`gl-card__btn gl-card__btn--copy${copied === g.folder ? ' gl-card__btn--copied' : ''}`}
                  onClick={() => handleCopy(g.folder)}
                >
                  {copied === g.folder ? '✓ Copiado' : 'Copiar link'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GalleryList
