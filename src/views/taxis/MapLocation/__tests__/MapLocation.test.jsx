import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MapLocation from '../MapLocation';
import * as taxiVehicleActions from '../../../../actions/taxi/taxiVehicleActions';
import * as taxiDriverActions from '../../../../actions/taxi/taxiDriverActions';

// Mocking the WebSocket API
const mockWebSocket = {
  onopen: null,
  onmessage: null,
  onerror: null,
  close: jest.fn(),
  readyState: 0, // WebSocket.CONNECTING
};

// Mock global WebSocket
global.WebSocket = jest.fn(() => mockWebSocket);

// Mock window focus/blur
window.addEventListener = jest.fn();
window.removeEventListener = jest.fn();

describe('MapLocation Component', () => {
  const mockStore = configureStore([]);
  let store;

  beforeEach(() => {
    store = mockStore({
      taxiVehicle: { data: [{ id: 'v1', plate: 'TSK086' }], fetching: false },
      taxiDriver: { data: [{ defaultVehicle: 'TSK086', active: true }], fetching: false },
      vehicleLocationHistory: { data: [], fetching: false },
    });

    // Mock actions
    jest.spyOn(taxiVehicleActions, 'fetchRequest').mockReturnValue({ type: 'MOCK_FETCH_VEHICLE' });
    jest.spyOn(taxiDriverActions, 'fetchRequest').mockReturnValue({ type: 'MOCK_FETCH_DRIVER' });

    // Reset mockWebSocket handlers
    mockWebSocket.onopen = null;
    mockWebSocket.onmessage = null;
    mockWebSocket.onerror = null;
    mockWebSocket.close.mockClear();
    
    // Clear mocks
    jest.clearAllMocks();
  });

  it('should render and fetch data on mount', () => {
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );
    expect(taxiVehicleActions.fetchRequest).toHaveBeenCalled();
    expect(taxiDriverActions.fetchRequest).toHaveBeenCalled();
  });

  it('should close WebSocket connection on unmount', () => {
    const { unmount } = render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );
    unmount();
    expect(mockWebSocket.close).toHaveBeenCalled();
  });
});
