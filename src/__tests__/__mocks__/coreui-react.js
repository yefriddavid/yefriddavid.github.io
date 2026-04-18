import React from 'react'

const div = (displayName) => {
  const C = ({ children, ...props }) => React.createElement('div', props, children)
  C.displayName = displayName
  return C
}

export const CContainer = div('CContainer')
export const CSpinner = () => React.createElement('span', { className: 'spinner-grow' })
export const CRow = div('CRow')
export const CCol = div('CCol')
export const CCard = div('CCard')
export const CCardBody = div('CCardBody')
export const CButton = div('CButton')
