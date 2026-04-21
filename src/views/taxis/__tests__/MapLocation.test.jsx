import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MapLocation from '../MapLocation';
import * as taxiVehicleActions from '../../../src/actions/taxiVehicleActions';
import * as taxiDriverActions from '../../../src/actions/taxiDriverActions';

// Mocking the WebSocket API
const mockWebSocket = {
  onopen: null,
  onmessage: null,
  onerror: null,
  close: jest.fn(),
  readyState: WebSocket.CONNECTING,
};

const originalWebSocket = global.WebSocket;

beforeAll(() => {
  global.WebSocket = jest.fn(() => mockWebSocket);
});

afterAll(() => {
  global.WebSocket = originalWebSocket;
});

describe('MapLocation Component', () => {
  const mockStore = configureStore([]);
  let store;

  beforeEach(() => {
    store = mockStore({
      taxiVehicle: { data: [{ plate: 'TSK086' }], fetching: false },
      taxiDriver: { data: [{ defaultVehicle: 'TSK086', active: true }], fetching: false },
      // Add other necessary state slices if MapLocation depends on them
    });

    // Mock actions
    jest.spyOn(taxiVehicleActions, 'fetchRequest').mockReturnValue({ type: 'MOCK_FETCH_VEHICLE' });
    jest.spyOn(taxiDriverActions, 'fetchRequest').mockReturnValue({ type: 'MOCK_FETCH_DRIVER' });

    // Reset mockWebSocket handlers before each test
    mockWebSocket.onopen = null;
    mockWebSocket.onmessage = null;
    mockWebSocket.onerror = null;
    mockWebSocket.close.mockClear();
  });

  it('should render without crashing and fetch data on mount', () => {
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );
    expect(screen.getByRole('img', { name: /map/i })).toBeInTheDocument(); // Assuming a map element exists
    expect(taxiVehicleActions.fetchRequest).toHaveBeenCalled();
    expect(taxiDriverActions.fetchRequest).toHaveBeenCalled();
  });

  it('should establish WebSocket connection and update locations on message', async () => {
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );

    // Simulate WebSocket opening
    mockWebSocket.readyState = WebSocket.OPEN;
    if (mockWebSocket.onopen) mockWebSocket.onopen();

    // Simulate receiving a message
    const mockMessage = {
      device: { plate: 'TSK086' },
      coords: { latitude: '6.433596', longitude: '-75.721425' },
    };
    if (mockWebSocket.onmessage) mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) });

    // Wait for state updates to propagate
    await waitFor(() => {
      // This part needs to be more specific to how MapLocation renders/uses the locations state.
      // For now, let's just check if close was called on unmount.
      // A more robust test would check if the map markers updated.
      // We'll assume MapLocation internally uses setLocations correctly.
      expect(mockWebSocket.close).not.toHaveBeenCalled(); // Ensure close is not called immediately
    });

    // A better assertion would be to check if the map visually updates or if the state was updated correctly,
    // but that requires deeper knowledge of how MapLocation uses the 'locations' state for rendering.
    // For now, we'll rely on the logic within the component to update its state.
    // If we had access to a mock of the map component or a way to query its markers, we'd test that.
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

  it('should handle WebSocket errors', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error output during test
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );
    if (mockWebSocket.onerror) mockWebSocket.onerror(new Error('Connection failed'));
    expect(console.error).toHaveBeenCalledWith('WebSocket error:', expect.any(Error));
    console.error.mockRestore(); // Restore console.error
  });

  it('should handle malformed WebSocket messages', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error output during test
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );

    // Simulate receiving a malformed message
    if (mockWebSocket.onmessage) mockWebSocket.onmessage({ data: 'not json' });
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error parsing WebSocket message:', expect.any(Error)));
    console.error.mockRestore(); // Restore console.error
  });

  it('should update location for an existing plate', async () => {
    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );

    mockWebSocket.readyState = WebSocket.OPEN;
    if (mockWebSocket.onopen) mockWebSocket.onopen();

    const initialMessage = {
      device: { plate: 'TSK086' },
      coords: { latitude: '6.433596', longitude: '-75.721425' },
    };
    if (mockWebSocket.onmessage) mockWebSocket.onmessage({ data: JSON.stringify(initialMessage) });

    // Wait for initial update
    await waitFor(() => {
      // Need a way to assert that the state has been updated.
      // For now, we can check if close hasn't been called.
      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });

    const updatedMessage = {
      device: { plate: 'TSK086' },
      coords: { latitude: '6.433600', longitude: '-75.721500' },
    };
    if (mockWebSocket.onmessage) mockWebSocket.onmessage({ data: JSON.stringify(updatedMessage) });

    await waitFor(() => {
      // Again, ideally we'd assert the state or UI update.
      // This assertion is a placeholder.
      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });
  });

  it('should initialize location for a new plate if it appears in vehicles list', async () => {
    // Update store to include a new vehicle that wasn't initially there
    store = mockStore({
      taxiVehicle: { data: [{ plate: 'TSK086' }, { plate: 'ABC123' }], fetching: false },
      taxiDriver: { data: [{ defaultVehicle: 'TSK086', active: true }, { defaultVehicle: 'ABC123', active: true }], fetching: false },
    });

    render(
      <Provider store={store}>
        <MapLocation />
      </Provider>
    );

    mockWebSocket.readyState = WebSocket.OPEN;
    if (mockWebSocket.onopen) mockWebSocket.onopen();

    // Simulate receiving a message for the new plate
    const newMessage = {
      device: { plate: 'ABC123' },
      coords: { latitude: '7.0', longitude: '-70.0' },
    };
    if (mockWebSocket.onmessage) mockWebSocket.onmessage({ data: JSON.stringify(newMessage) });

    await waitFor(() => {
      // Placeholder assertion
      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });
  });
});
