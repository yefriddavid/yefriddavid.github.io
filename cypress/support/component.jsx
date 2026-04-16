import { mount } from 'cypress/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { I18nextProvider } from 'react-i18next'
import React from 'react'
import i18n from 'src/i18n'

// ── Minimal store ─────────────────────────────────────────────────────────────
// Includes every slice read by the tested components.
import taxiSettlementReducer from 'src/reducers/taxi/taxiSettlementReducer'
import taxiPeriodNoteReducer from 'src/reducers/taxi/taxiPeriodNoteReducer'

function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      taxiSettlement: taxiSettlementReducer,
      taxiPeriodNote: taxiPeriodNoteReducer,
    },
    preloadedState,
  })
}

// ── cy.mount wrapper ──────────────────────────────────────────────────────────
Cypress.Commands.add('mount', (component, { reduxState = {}, ...options } = {}) => {
  const store = makeStore(reduxState)

  const wrapped = (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
    </Provider>
  )

  return mount(wrapped, options)
})
