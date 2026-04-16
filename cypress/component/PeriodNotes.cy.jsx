import React from 'react'
import PeriodNotes from 'src/views/taxis/Settlements/Components/PeriodNotes'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PERIOD = { month: 3, year: 2024 }

const makeNote = (overrides = {}) => ({
  id: 'note1',
  text: 'Nota de prueba',
  createdAt: '2024-03-10T10:00:00Z',
  updatedAt: '2024-03-10T10:00:00Z',
  ...overrides,
})

const emptyState = { taxiPeriodNote: { notes: [], saving: false, fetching: false, isError: false } }

const withNotes = (notes, extra = {}) => ({
  taxiPeriodNote: { notes, saving: false, fetching: false, isError: false, ...extra },
})

// Shorthand — the add-note textarea (not the edit one)
const addTextarea = () => cy.get('textarea[placeholder*="Agregar"]')

// The primary (add/save) button — last .btn-primary on page
const primaryBtn = () => cy.get('button.btn.btn-primary').last()

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PeriodNotes', () => {
  // ── Empty state ────────────────────────────────────────────────────────────

  describe('empty state', () => {
    beforeEach(() => cy.mount(<PeriodNotes period={PERIOD} />, { reduxState: emptyState }))

    it('shows the "Notas del período" header', () => {
      cy.contains('Notas del período').should('be.visible')
    })

    it('shows period month/year in header', () => {
      cy.contains('3/2024').should('be.visible')
    })

    it('shows empty-state message when no notes', () => {
      cy.contains('Sin notas para este período.').should('be.visible')
    })

    it('add button is disabled when textarea is empty', () => {
      primaryBtn().should('be.disabled')
    })

    it('add button enables after typing text', () => {
      addTextarea().type('Nueva nota')
      primaryBtn().should('not.be.disabled')
    })

    it('clearing the textarea disables the add button again', () => {
      addTextarea().type('algo').clear()
      primaryBtn().should('be.disabled')
    })
  })

  // ── Add note (dispatch side-effect) ───────────────────────────────────────

  describe('add note dispatch', () => {
    it('clicking add dispatches createRequest — reducer sets saving=true → button disables', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, { reduxState: emptyState })
      addTextarea().type('Nueva nota')
      primaryBtn().click()
      // createRequest sets saving=true synchronously in the reducer
      primaryBtn().should('be.disabled')
    })

    it('clears the add textarea after dispatching', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, { reduxState: emptyState })
      addTextarea().type('Nueva nota')
      primaryBtn().click()
      addTextarea().should('have.value', '')
    })
  })

  // ── Notes list ─────────────────────────────────────────────────────────────

  describe('notes list', () => {
    it('renders note text from Redux state', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote()]),
      })
      cy.contains('Nota de prueba').should('be.visible')
    })

    it('renders multiple notes', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([
          makeNote({ id: 'n1', text: 'Primera nota' }),
          makeNote({ id: 'n2', text: 'Segunda nota' }),
        ]),
      })
      cy.contains('Primera nota').should('be.visible')
      cy.contains('Segunda nota').should('be.visible')
    })

    it('shows "Editado" prefix when updatedAt differs from createdAt', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote({ updatedAt: '2024-03-12T15:00:00Z' })]),
      })
      cy.contains(/Editado/).should('be.visible')
    })

    it('does not show "Editado" when createdAt equals updatedAt', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote()]),
      })
      cy.contains(/Editado/).should('not.exist')
    })

    it('hides empty-state message when notes exist', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote()]),
      })
      cy.contains('Sin notas para este período.').should('not.exist')
    })

    it('renders an edit button and a delete button per note', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote()]),
      })
      // CoreUI CButton with variant="ghost" renders as btn-ghost-<color>
      cy.get('button.btn-ghost-secondary').should('exist')
      cy.get('button.btn-ghost-danger').should('exist')
    })
  })

  // ── Edit note ──────────────────────────────────────────────────────────────

  describe('edit note', () => {
    beforeEach(() => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote({ id: 'n1', text: 'Texto original' })]),
      })
      cy.get('button.btn-ghost-secondary').first().click() // click edit
    })

    it('shows a textarea with the existing note text', () => {
      cy.get('textarea').filter(':not([placeholder*="Agregar"])').should('have.value', 'Texto original')
    })

    it('shows "Guardar" and "Cancelar" buttons', () => {
      cy.contains('Guardar').should('be.visible')
      cy.contains('Cancelar').should('be.visible')
    })

    it('Guardar is disabled when the edit textarea is cleared', () => {
      cy.get('textarea').filter(':not([placeholder*="Agregar"])').clear()
      cy.contains('Guardar').should('be.disabled')
    })

    it('clicking Cancelar exits edit mode and shows the original text', () => {
      cy.contains('Cancelar').click()
      cy.contains('Cancelar').should('not.exist')
      cy.contains('Texto original').should('be.visible')
    })

    it('clicking Guardar after editing dispatches update and exits edit mode', () => {
      cy.get('textarea').filter(':not([placeholder*="Agregar"])').clear().type('Texto editado')
      cy.contains('Guardar').click()
      cy.contains('Cancelar').should('not.exist')
      cy.contains('Guardar').should('not.exist')
    })
  })

  // ── Delete note (dispatch side-effect) ────────────────────────────────────

  describe('delete note dispatch', () => {
    it('clicking delete dispatches deleteRequest — reducer sets saving=true → add button disables', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote()]),
      })
      cy.get('button.btn-ghost-danger').first().click()
      // deleteRequest sets saving=true in reducer → primary add button becomes disabled
      primaryBtn().should('be.disabled')
    })
  })

  // ── Saving state ──────────────────────────────────────────────────────────

  describe('saving state', () => {
    it('add button disabled when saving=true in Redux', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([], { saving: true }),
      })
      addTextarea().type('algo')
      primaryBtn().should('be.disabled')
    })

    it('Guardar button disabled when saving=true in edit mode', () => {
      cy.mount(<PeriodNotes period={PERIOD} />, {
        reduxState: withNotes([makeNote()], { saving: true }),
      })
      cy.get('button.btn-ghost-secondary').first().click()
      cy.contains('Guardar').should('be.disabled')
    })
  })
})
