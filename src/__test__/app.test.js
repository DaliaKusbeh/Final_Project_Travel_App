import { refreshUI } from '../client/js/app';

describe('refreshUI functionality', () => {
  beforeEach(() => {
    // Set up the DOM with the tripList element
    document.body.innerHTML = `
      <div id="tripList"></div>
    `;

    // Clear any mocks before each test
    jest.clearAllMocks();

    // Mock console.error
    global.console = {
      error: jest.fn(),
    };
  });

  test('should update the UI with trip data', async () => {
    // Mock fetch response for trip data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              city: 'Paris',
              country: 'France',
              travel: '2024-10-10',
              daysLeft: 30,
              temperature: 20,
              capital: 'Paris',
              population: 2148327,
              currency: 'Euro',
              region: 'Europe',
              image: 'https://example.com/paris.jpg',
            },
          ]),
      })
    );

    // Call refreshUI to update the UI
    await refreshUI();

    // Wait for the DOM to update after the async operation
    setTimeout(() => {
      const tripList = document.getElementById('tripList');
      expect(tripList.innerHTML).toContain('You are going to Paris, France');
      expect(tripList.innerHTML).toContain('Your travel date is 2023-10-10');
      expect(tripList.innerHTML).toContain('There are 30 days left until your trip');
      expect(tripList.innerHTML).toContain('The expected weather for then is 20°C');
      expect(tripList.innerHTML).toContain('Capital: Paris');
      expect(tripList.innerHTML).toContain('Population: 2148327');
      expect(tripList.innerHTML).toContain('Currency: Euro');
      expect(tripList.innerHTML).toContain('Region: Europe');
      expect(tripList.innerHTML).toContain('<img src="https://example.com/paris.jpg" alt="Trip Image">');
    }, 0); // Using 0ms for next event loop tick
  });

  test('should display "No trips planned" when there is no trip data', async () => {
    // Mock fetch response for no trip data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]), // No trips
      })
    );

    // Call refreshUI to update the UI
    await refreshUI();

    // Wait for the DOM to update after the async operation
    setTimeout(() => {
      const tripList = document.getElementById('tripList');
      expect(tripList.innerHTML).toContain('No trips planned');
    }, 0);
  });

  test('should handle fetch errors gracefully', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn(() => Promise.reject('API is down'));

    // Call refreshUI and expect it to handle the error
    await refreshUI();

    // Verify the console error log
    expect(console.error).toHaveBeenCalledWith('Error refreshing UI:', 'API is down');
  });
});
