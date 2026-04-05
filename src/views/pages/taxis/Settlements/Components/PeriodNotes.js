import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CCardHeader, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import * as taxiPeriodNoteActions from 'src/actions/CashFlow/taxiPeriodNoteActions'

const PeriodNotes = ({ period }) => {
  const dispatch = useDispatch()
  const { notes: periodNotes, saving: periodNoteSaving } = useSelector((s) => s.taxiPeriodNote)

  const [newNoteText, setNewNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingNoteText, setEditingNoteText] = useState('')

  return (
    <CCard className="mt-3">
      <CCardHeader>
        <strong style={{ fontSize: 13 }}>Notas del período</strong>
        <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
          {period.month}/{period.year}
        </span>
      </CCardHeader>
      <CCardBody>
        {periodNotes.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--cui-secondary-color)', marginBottom: 12 }}>
            Sin notas para este período.
          </div>
        )}

        {periodNotes.map((note) => (
          <div
            key={note.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 0',
              borderBottom: '1px solid var(--cui-border-color)',
            }}
          >
            {editingNoteId === note.id ? (
              <>
                <textarea
                  style={{
                    flex: 1,
                    fontSize: 13,
                    borderRadius: 4,
                    border: '1px solid var(--cui-border-color)',
                    padding: '6px 8px',
                    resize: 'vertical',
                    minHeight: 60,
                  }}
                  value={editingNoteText}
                  onChange={(e) => setEditingNoteText(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <CButton
                    size="sm"
                    color="primary"
                    disabled={periodNoteSaving || !editingNoteText.trim()}
                    onClick={() => {
                      dispatch(
                        taxiPeriodNoteActions.updateRequest({
                          id: note.id,
                          text: editingNoteText.trim(),
                        }),
                      )
                      setEditingNoteId(null)
                    }}
                  >
                    Guardar
                  </CButton>
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="outline"
                    onClick={() => setEditingNoteId(null)}
                  >
                    Cancelar
                  </CButton>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{note.text}</div>
                  <div
                    style={{ fontSize: 11, color: 'var(--cui-secondary-color)', marginTop: 4 }}
                  >
                    {note.updatedAt && note.updatedAt !== note.createdAt
                      ? `Editado ${new Date(note.updatedAt).toLocaleString('es-CO')}`
                      : note.createdAt
                        ? new Date(note.createdAt).toLocaleString('es-CO')
                        : ''}
                  </div>
                </div>
                <CButton
                  size="sm"
                  color="secondary"
                  variant="ghost"
                  onClick={() => {
                    setEditingNoteId(note.id)
                    setEditingNoteText(note.text)
                  }}
                >
                  <CIcon icon={cilPencil} size="sm" />
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  onClick={() =>
                    dispatch(taxiPeriodNoteActions.deleteRequest({ id: note.id }))
                  }
                >
                  <CIcon icon={cilTrash} size="sm" />
                </CButton>
              </>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <textarea
            style={{
              flex: 1,
              fontSize: 13,
              borderRadius: 4,
              border: '1px solid var(--cui-border-color)',
              padding: '6px 8px',
              resize: 'vertical',
              minHeight: 60,
            }}
            placeholder="Agregar una nota para este período…"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
          />
          <CButton
            color="primary"
            disabled={periodNoteSaving || !newNoteText.trim()}
            onClick={() => {
              dispatch(
                taxiPeriodNoteActions.createRequest({
                  period: `${period.year}-${String(period.month).padStart(2, '0')}`,
                  text: newNoteText.trim(),
                }),
              )
              setNewNoteText('')
            }}
          >
            <CIcon icon={cilPlus} size="sm" />
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default PeriodNotes
