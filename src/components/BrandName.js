import React from 'react'

export const APP_NAME = 'TaxiAdmin'

const BrandName = ({ className, style }) => (
  <div className={className} style={style}>
    Taxi<span>Admin</span>
  </div>
)

//const BrandName = ({ className, style }) => (
//  <span className={className} style={style}>
//    <em>Taxi</em>Admin
//  </span>
//)

export default BrandName
