// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import MapLocation from '../MapLocation'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'

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
  taxiWebSocket: { subscribe: vi.fn(() => vi.fn()), onStatus: vi.fn(() => vi.fn()) },
}))

vi.mock('@coreui/icons-react', () => ({ default: () => <span /> }))
vi.mock('@coreui/icons', () => ({
  cilFullscreen: 'fs',
  cilFullscreenExit: 'fse',
  cilHistory: 'hist',
  cilGlobeAlt: 'globe',
  cilLocationPin: 'pin',
  cilTrash: 'trash',
  cilReload: 'reload',
  cilChevronRight: 'chevron-right',
  cilChevronLeft: 'chevron-left',
}))
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
  CAccordion: ({ children }) => <div>{children}</div>,
  CAccordionItem: ({ children }) => <div>{children}</div>,
  CAccordionHeader: ({ children }) => <div>{children}</div>,
  CAccordionBody: ({ children }) => <div>{children}</div>,
}))

const baseState = {
  taxiVehicle: { data: [], fetching: false, isError: false, error: {} },
  taxiDriver: { data: [], fetching: false, isError: false, error: {} },
  vehicleLocationHistory: {
    data: [],
    fetching: false,
    liveLocations: {},
    recentHistories: {},
    loadingHistories: {},
    isError: false,
    error: {},
  },
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

  it('dispatches fetchRequest for vehicles on mount when data is null', () => {
    const store = configureStore({
      reducer: combinedReducers,
      preloadedState: {
        ...baseState,
        taxiVehicle: { data: null, fetching: false, isError: false, error: {} },
        taxiDriver: { data: null, fetching: false, isError: false, error: {} },
      },
    })
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>,
    )
    const types = dispatchSpy.mock.calls.map((c) => c[0]?.type)
    expect(types).toContain(taxiVehicleActions.fetchRequest.type)
  })

  it('dispatches fetchLastKnownPositions on mount when vehicles are loaded', () => {
    const storeWithVehicles = configureStore({
      reducer: combinedReducers,
      preloadedState: {
        ...baseState,
        taxiVehicle: {
          data: [{ id: 'v1', plate: 'TSK086' }],
          fetching: false,
          isError: false,
          error: {},
        },
      },
    })
    const dispatchSpy = vi.spyOn(storeWithVehicles, 'dispatch')
    render(
      <Provider store={storeWithVehicles}>
        <MapLocation />
      </Provider>,
    )
    const types = dispatchSpy.mock.calls.map((c) => c[0]?.type)
    expect(types).toContain('currentPositions/fetchLastKnownPositions')
  })

  it('renders a marker for each vehicle with a known position', () => {
    renderWithStore({
      taxiVehicle: {
        data: [{ id: 'v1', plate: 'TSK086', brand: 'Chevrolet', model: 'Beat' }],
        fetching: false,
        isError: false,
        error: {},
      },
      taxiDriver: { data: [], fetching: false, isError: false, error: {} },
      currentPositions: {
        v1: { lat: 4.7, lng: -74.0, speed: 0, lastUpdate: new Date().toISOString(), source: 'app' },
      },
    })
    expect(screen.getAllByTestId('marker').length).toBe(1)
  })

  it('shows fleet count with active vehicles', () => {
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
      currentPositions: {
        v1: { lat: 4.7, lng: -74.0, speed: 0, lastUpdate: new Date().toISOString(), source: 'wss' },
        v2: { lat: 4.8, lng: -74.1, speed: 0, lastUpdate: new Date().toISOString(), source: 'app' },
      },
    })
    expect(screen.getByText('Flota (2/2)')).toBeTruthy()
  })
})
