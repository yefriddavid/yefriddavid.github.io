import { useState } from 'react'
import RecordsPage from '../pages/RecordsPage'
import './layout.css'

const MENU = [{ key: 'records', label: 'Registros' }]

export default function Layout() {
  const [page, setPage] = useState('records')

  return (
    <div className="sandbox-layout">
      <header className="sandbox-layout__header">
        <h1>Blockchain Sandbox</h1>
      </header>
      <div className="sandbox-layout__body">
        <nav className="sandbox-layout__menu">
          {MENU.map((item) => (
            <button
              key={item.key}
              className={item.key === page ? 'active' : ''}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <main className="sandbox-layout__content">
          {page === 'records' && <RecordsPage />}
        </main>
      </div>
    </div>
  )
}
