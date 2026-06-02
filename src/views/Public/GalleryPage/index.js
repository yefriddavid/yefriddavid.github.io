import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGallery } from 'src/utils/galleries'
import './GalleryPage.scss'

// ── Lightbox ──────────────────────────────────────────────────────────────────

const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  return (
    <div className="gp-lightbox">
      <div className="gp-lightbox__bg" onClick={onClose} />
      <button className="gp-lightbox__close" onClick={onClose}>✕</button>
      <button className="gp-lightbox__nav gp-lightbox__nav--prev" onClick={onPrev}>‹</button>
      <div className="gp-lightbox__stage">
        <img key={index} className="gp-lightbox__img" src={images[index]} alt="" />
      </div>
      <button className="gp-lightbox__nav gp-lightbox__nav--next" onClick={onNext}>›</button>
      <div className="gp-lightbox__counter">{index + 1} / {images.length}</div>
    </div>
  )
}

// ── GalleryPage ───────────────────────────────────────────────────────────────

const GalleryPage = () => {
  const { folder } = useParams()
  const gallery = getGallery(folder)
  const [lightbox, setLightbox] = useState(null)

  const handleOpen = useCallback((i) => setLightbox({ index: i }), [])
  const handleClose = useCallback(() => setLightbox(null), [])

  const handlePrev = useCallback(() =>
    setLightbox((lb) => lb && { index: (lb.index - 1 + gallery.images.length) % gallery.images.length }),
  [gallery])

  const handleNext = useCallback(() =>
    setLightbox((lb) => lb && { index: (lb.index + 1) % gallery.images.length }),
  [gallery])

  if (!gallery) {
    return (
      <div className="gp-notfound">
        <span>Galería no encontrada</span>
      </div>
    )
  }

  return (
    <div className="gp">
      <div className="gp__hero" style={{ borderBottomColor: gallery.color ?? '#4a9eff' }}>
        <div className="gp__accent" style={{ background: gallery.color ?? '#4a9eff' }} />
        <div className="gp__hero-text">
          <h1 className="gp__title">{gallery.title}</h1>
          {gallery.subtitle && <p className="gp__subtitle">{gallery.subtitle}</p>}
        </div>
        <span className="gp__count">{gallery.images.length} fotos</span>
      </div>

      <div className="gp__grid">
        {gallery.images.map((src, i) => (
          <div key={i} className="gp__item" onClick={() => handleOpen(i)}>
            <img src={src} alt="" loading="lazy" className="gp__img" />
          </div>
        ))}
      </div>

      {lightbox && (
        <Lightbox
          images={gallery.images}
          index={lightbox.index}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  )
}

export default GalleryPage
