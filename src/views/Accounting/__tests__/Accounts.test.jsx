// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import Accounts from '../Accounts'
import { makeAccountState } from 'src/__tests__/factories'
import * as accountActions from 'src/actions/cashflow/accountActions'

vi.mock('src/components/shared/StandardGrid/Index', () => ({
  __esModule: true,
  default: React.forwardRef(({ dataSource, noDataText }, ref) => (
    <div data-testid="standard-grid">
      {dataSource?.length > 0 ? (
        dataSource.map((item, i) => (
          <div key={item.accountId ?? i} data-testid="grid-row">
            {item.name}
          </div>
        ))
      ) : (
        <div>{noDataText}</div>
      )}
    </div>
  )),
}))

const renderWithRedux = (preloadedState = {}) => {
  const store = configureStore({ reducer: combinedReducers, preloadedState })
  const utils = render(
    <Provider store={store}>
      <Accounts />
    </Provider>,
  )
  return { ...utils, store }
}

describe('Accounts', () => {
  describe('rendering', () => {
    it('renders the title', () => {
      renderWithRedux()
      expect(screen.getByText('Listado de Cuentas')).toBeTruthy()
    })

    it('renders the refresh button', () => {
      renderWithRedux()
      expect(screen.getByText('Refrescar')).toBeTruthy()
    })

    it('renders StandardGrid', () => {
      renderWithRedux()
      expect(screen.getByTestId('standard-grid')).toBeTruthy()
    })
  })

  describe('loading state', () => {
    it('disables refresh button while fetching', () => {
      renderWithRedux({
        account: { ...makeAccountState(), fetching: true },
      })
      expect(screen.getByRole('button').disabled).toBe(true)
    })

    it('enables refresh button when not fetching', () => {
      renderWithRedux({
        account: { ...makeAccountState(), fetching: false },
      })
      expect(screen.getByRole('button').disabled).toBe(false)
    })
  })

  describe('data display', () => {
    it('passes items from nested response to StandardGrid after data loads', () => {
      // fetchData is dispatched on mount and clears data; simulate a successful API response
      const { store } = renderWithRedux()
      act(() => {
        store.dispatch(
          accountActions.successRequest({
            data: {
              items: [
                { accountId: '1', name: 'Cuenta Ahorro' },
                { accountId: '2', name: 'Cuenta Corriente' },
              ],
            },
          }),
        )
      })
      expect(screen.getByText('Cuenta Ahorro')).toBeTruthy()
      expect(screen.getByText('Cuenta Corriente')).toBeTruthy()
    })

    it('shows empty grid when no items are loaded', () => {
      // fetchData clears data on mount, so items defaults to []
      renderWithRedux()
      expect(screen.queryAllByTestId('grid-row')).toHaveLength(0)
    })
  })

  describe('dispatch on mount', () => {
    it('dispatches fetchData action on mount', () => {
      const store = configureStore({ reducer: combinedReducers })
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      render(
        <Provider store={store}>
          <Accounts />
        </Provider>,
      )
      expect(dispatchSpy).toHaveBeenCalledTimes(1)
    })

    it('dispatches fetchData again when refresh button is clicked', () => {
      const store = configureStore({ reducer: combinedReducers })
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      render(
        <Provider store={store}>
          <Accounts />
        </Provider>,
      )
      fireEvent.click(screen.getByText('Refrescar'))
      expect(dispatchSpy).toHaveBeenCalledTimes(2)
    })
  })
})
