const request = require('supertest');
const travelServer = require('../server/index');

jest.mock('node-fetch', () => jest.fn());

const fetch = require('node-fetch');

describe('Trip API Endpoints', () => {
  afterAll(() => {
    travelServer.close(); // Close the server after tests
  });

  beforeEach(() => {
    fetch.mockClear(); // Clear fetch mock between tests
  });

  it('should fetch all trips', async () => {
    const response = await request(travelServer).get('/all');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(0);
  });

  it('should add a new trip', async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          geonames: [
            { lat: 48.8566, lng: 2.3522, countryName: 'France' },
          ],
        }),
    });

    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          data: [{ temp: 25 }],
        }),
    });

    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          hits: [{ webformatURL: 'https://example.com/paris.jpg' }],
        }),
    });

    const newTrip = {
      date: '2024-10-10',
      city: 'Paris',
      daysLeft: 30,
      travel: '2024-10-10',
    };

    const response = await request(travelServer)
      .post('/add')
      .send(newTrip);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: 'Paris',
          temperature: 25,
        }),
      ])
    );
  });

  it('should delete a trip', async () => {
    const deleteResponse = await request(travelServer)
      .delete('/remove')
      .send({ city: 'Paris' });

    expect(deleteResponse.statusCode).toBe(200);

    const response = await request(travelServer).get('/all');
    expect(response.body.length).toBe(0);
  });
});
