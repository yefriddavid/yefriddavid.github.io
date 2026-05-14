import React from 'react'
import { CButton } from '@coreui/react'

class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    const label = this.props.module ? `[ErrorBoundary:${this.props.module}]` : '[ErrorBoundary]'
    console.error(label, error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      const module = this.props.module ? ` en ${this.props.module}` : ''

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '0.75rem',
            minHeight: 120,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32 }}>⚠️</div>
          <p style={{ margin: 0, fontWeight: 600 }}>Ocurrió un error inesperado{module}.</p>
          <p style={{ margin: 0, fontSize: 13, color: '#6c757d' }}>{this.state.error.message}</p>
          <CButton color="primary" variant="outline" size="sm" onClick={this.handleReset}>
            Reintentar
          </CButton>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
