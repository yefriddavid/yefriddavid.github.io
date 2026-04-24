import React from 'react'

export const APP_NAME = 'CashFlow'

const BrandName = ({ className, style }) => (
  <div className={className} style={style}>
    Cash<span>Flow</span>
  </div>
)

//const BrandName = ({ className, style }) => (
//  <span className={className} style={style}>
//    <em>Taxi</em>Admin
//  </span>
//)

export default BrandName
