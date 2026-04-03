import React from 'react'
import { DataGrid } from 'devextreme-react/data-grid'
import './StandardGrid.scss'

// Standard DataGrid wrapper with shared styles and default props.
// Use this for all data tables in the app.
// Children: Column, MasterDetail, Summary, etc. from devextreme-react/data-grid
const StandardGrid = React.forwardRef(({
  children,
  style,
  noDataText = 'Sin registros.',
  scrolling,
  ...props
}, ref) => (
  <DataGrid
    ref={ref}
    className="standard-grid"
    style={{ margin: 16, ...style }}
    scrolling={{ useNative: true, showScrollbar: 'always', ...scrolling }}
    showBorders={true}
    columnAutoWidth={true}
    columnHidingEnabled={true}
    allowColumnResizing={true}
    rowAlternationEnabled={true}
    hoverStateEnabled={true}
    noDataText={noDataText}
    {...props}
  >
    {children}
  </DataGrid>
))

StandardGrid.displayName = 'StandardGrid'

export default StandardGrid
