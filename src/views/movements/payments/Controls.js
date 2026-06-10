import React, { Component } from 'react'
import { CFormSelect } from '@coreui/react'

class SelectControl extends Component {
  onChangeValueHandler = (e) => {
    const { onChange, name } = this.props
    onChange(e.target.value, name)
  }

  render() {
    const { value, title, options } = this.props

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 140 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#6c757d',
            marginBottom: 4,
          }}
        >
          {title}
        </label>
        <CFormSelect value={value} onChange={this.onChangeValueHandler} style={{ fontSize: 13 }}>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </CFormSelect>
      </div>
    )
  }
}

export { SelectControl }
