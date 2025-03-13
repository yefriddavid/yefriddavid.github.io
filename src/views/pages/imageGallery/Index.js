import React, { Suspense, useEffect } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass } from '@coreui/icons'
import './Index.css'

// const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;


const ImageGallery = () => {

  useEffect(() => {

  }, [])

  return (
    <>
<div class="image-slider">
    <section class="slider__content">
        <button type="button" class="slider-control--button prev-button">
            <svg width="16" height="16" fill="currentColor" class="icon arrow-left-circle" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
            </svg>
        </button>
        <main class="image-display"></main>
        <button type="button" class="slider-control--button next-button">
            <svg width="16" height="16" fill="currentColor" class="icon arrow-right-circle" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
            </svg>
        </button>
    </section>
    <nav className="slider-navigation">
        <button className="nav-button" aria-selected="true">
            <img className="thumbnail" src="https://drive.google.com/uc?export=view&id=1IPI4GoC2WtfNarCoUt5iRgb6oOIm18vJ" alt="Thumbnail 1" />
        </button>
        <button className="nav-button" aria-selected="false">
            <img className="thumbnail" src="https://drive.usercontent.google.com/download?id=1IPI4GoC2WtfNarCoUt5iRgb6oOIm18vJ&export=view" alt="Thumbnail 2" />
        </button>
        <button className="nav-button" aria-selected="false">
            <img className="thumbnail" src="https://drive.google.com/uc?export=view&id=1IPI4GoC2WtfNarCoUt5iRgb6oOIm18vJ" alt="Thumbnail 3" />
        </button>
        <button class="nav-button" aria-selected="false">
            <img class="thumbnail" src="https://picsum.photos/800/400?random=4" alt="Thumbnail 4" />
        </button>
        <button class="nav-button" aria-selected="false">
            <img class="thumbnail" src="https://picsum.photos/800/400?random=5" alt="Thumbnail 5" />
        </button>
        <button class="nav-button" aria-selected="false">
            <img class="thumbnail" src="https://picsum.photos/800/400?random=6" alt="Thumbnail 6" />
        </button>
    </nav>
</div>
    <img src="https://drive.google.com/uc?export=view&id=1P3AqwD1yj0kWZ-1ZTZ_j2S1l8kkLqbPr" alt="david" />

    </>
  )
}

export default ImageGallery


