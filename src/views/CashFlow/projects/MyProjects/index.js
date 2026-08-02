import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/cashflow/myProjectActions'
import { fmt, uid, now, totalOf } from './helpers'
import ProjectSheet from './ProjectSheet'
import ProjectCard from './ProjectCard'
import Spinner from 'src/components/shared/Spinner'
import useActiveTenantId from 'src/hooks/useActiveTenantId'

export default function MyProjects() {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { projects, loading, saving } = useSelector((s) => s.myProject)

  const [sheet, setSheet] = useState(null)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const handleSave = (project) => {
    const withOrder =
      project.sortOrder != null ? project : { ...project, sortOrder: projects.length }
    dispatch(actions.saveRequest(withOrder))
    setSheet(null)
  }

  const handleCardSave = (project) => {
    const withOrder =
      project.sortOrder != null ? project : { ...project, sortOrder: projects.length }
    dispatch(actions.saveRequest(withOrder))
  }

  const handleDelete = (project) => {
    if (window.confirm(`¿Eliminar "${project.description}"?`)) {
      dispatch(actions.deleteRequest({ id: project.id }))
    }
  }

  const handleClone = (project, name) => {
    const clone = {
      ...project,
      id: uid(),
      description: name,
      createdAt: now(),
      updatedAt: now(),
      sortOrder: projects.length,
    }
    dispatch(actions.saveRequest(clone))
  }

  const handleMove = (project, dir) => {
    const sorted = projects
      .slice()
      .sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity))
    const idx = sorted.findIndex((p) => p.id === project.id)
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= sorted.length) return
    const aOrder = idx
    const bOrder = targetIdx
    dispatch(actions.saveRequest({ ...sorted[idx], sortOrder: bOrder, updatedAt: now() }))
    dispatch(actions.saveRequest({ ...sorted[targetIdx], sortOrder: aOrder, updatedAt: now() }))
  }

  const sortedProjects = projects
    .slice()
    .sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity))

  const grandTotal = projects.reduce((s, p) => s + totalOf(p.items), 0)

  return (
    <div
      style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: '0 12px 40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 16px',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>My Projects</div>
          <div style={{ fontSize: 13, color: '#6c757d', marginTop: 2 }}>
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setSheet('new')}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Grand total */}
      {grandTotal > 0 && (
        <div
          style={{
            background: '#eef4ff',
            border: '1px solid #c5d8ff',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>Total acumulado</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>{fmt(grandTotal)}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner color="primary" />
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#adb5bd',
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin proyectos aún</div>
          <div>Presiona + para crear tu primer proyecto</div>
        </div>
      ) : (
        sortedProjects.map((p, idx) => (
          <ProjectCard
            key={p.id}
            project={p}
            isFirst={idx === 0}
            isLast={idx === sortedProjects.length - 1}
            onEdit={setSheet}
            onDelete={handleDelete}
            onSave={handleCardSave}
            onClone={handleClone}
            onMove={handleMove}
          />
        ))
      )}

      {/* Sheet */}
      {sheet && (
        <ProjectSheet
          initial={sheet === 'new' ? null : sheet}
          saving={saving}
          onSave={handleSave}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
