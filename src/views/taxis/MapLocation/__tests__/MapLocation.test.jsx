// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import MapLocation from '../MapLocation'
import * as vehicleLocationHistoryActions from 'src/actions/taxi/vehicleLocationHistoryActions'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}))

vi.mock('../MapIcons', () => ({
  createTaxiIconFlat: vi.fn(() => null),
  createTaxiIconV2: vi.fn(() => null),
}))

vi.mock('../MapControls', () => ({
  FullscreenControl: () => null,
  MapController: () => null,
}))

vi.mock('src/services/websocketService', () => ({
  taxiWebSocket: { subscribe: vi.fn(() => vi.fn()) },
}))

vi.mock('@coreui/icons-react', () => ({ default: () => <span /> }))
vi.mock('@coreui/icons', () => ({ cilFullscreen: 'fs', cilFullscreenExit: 'fse' }))
vi.mock('@coreui/react', () => ({
  CCard: ({ children, className }) => <div className={className}>{children}</div>,
  CCardHeader: ({ children }) => <div>{children}</div>,
  CCardBody: ({ children }) => <div>{children}</div>,
  CBadge: ({ children }) => <span>{children}</span>,
  CSpinner: () => <span data-testid="spinner" />,
  CRow: ({ children }) => <div>{children}</div>,
  CCol: ({ children }) => <div>{children}</div>,
  CListGroup: ({ children }) => <ul>{children}</ul>,
  CListGroupItem: ({ children }) => <li>{children}</li>,
  CButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  CButtonGroup: ({ children }) => <div>{children}</div>,
}))

const baseState = {
  taxiVehicle: { data: [], fetching: false, isError: false, error: {} },
  taxiDriver: { data: [], fetching: false, isError: false, error: {} },
  vehicleLocationHistory: { data: [], fetching: false, liveLocations: {}, isError: false, error: {} },
}

const renderWithStore = (overrides = {}) => {
  const store = configureStore({
    reducer: combinedReducers,
    preloadedState: { ...baseState, ...overrides },
  })
  const utils = render(
    <Provider store={store}>
      <MapLocation />
    </Provider>,
  )
  return { ...utils, store }
}

describe('MapLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the map container', () => {
    renderWithStore()
    expect(screen.getByTestId('map-container')).toBeTruthy()
  })

  it('shows spinner while vehicles are loading', () => {
    renderWithStore({
      taxiVehicle: { data: null, fetching: true, isError: false, error: {} },
      taxiDriver: { data: null, fetching: false, isError: false, error: {} },
    })
    expect(screen.getByTestId('spinner')).toBeTruthy()
  })

  it('dispatches startLiveListener on mount', () => {
    const store = configureStore({ reducer: combinedReducers, preloadedState: baseState })
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>,
    )
    const types = dispatchSpy.mock.calls.map((c) => c[0]?.type)
    expect(types).toContain(vehicleLocationHistoryActions.startLiveListener.type)
  })

  it('dispatches stopLiveListener on unmount', () => {
    const store = configureStore({ reducer: combinedReducers, preloadedState: baseState })
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    const { unmount } = render(
      <Provider store={store}>
        <MapLocation />
      </Provider>,
    )
    unmount()
    const types = dispatchSpy.mock.calls.map((c) => c[0]?.type)
    expect(types).toContain(vehicleLocationHistoryActions.stopLiveListener.type)
  })

  it('renders a marker for each live location', () => {
    renderWithStore({
      taxiVehicle: {
        data: [{ id: 'v1', plate: 'TSK086', brand: 'Chevrolet', model: 'Beat' }],
        fetching: false,
        isError: false,
        error: {},
      },
      taxiDriver: { data: [], fetching: false, isError: false, error: {} },
      vehicleLocationHistory: {
        data: [],
        fetching: false,
        isError: false,
        error: {},
        liveLocations: {
          v1: { lat: 4.7, lng: -74.0, lastUpdate: new Date().toISOString(), source: 'firebase' },
        },
      },
    })
    expect(screen.getAllByTestId('marker').length).toBe(1)
  })

  it('shows active fleet count', () => {
    renderWithStore({
      taxiVehicle: {
        data: [
          { id: 'v1', plate: 'TSK086' },
          { id: 'v2', plate: 'TSK087' },
        ],
        fetching: false,
        isError: false,
        error: {},
      },
      taxiDriver: { data: [], fetching: false, isError: false, error: {} },
      vehicleLocationHistory: {
        data: [],
        fetching: false,
        isError: false,
        error: {},
        liveLocations: {
          v1: { lat: 4.7, lng: -74.0, lastUpdate: new Date().toISOString(), source: 'wss' },
          v2: { lat: 4.8, lng: -74.1, lastUpdate: new Date().toISOString(), source: 'firebase' },
        },
      },
    })
    expect(screen.getByText('Flota Activa (2)')).toBeTruthy()
  })
})
