const request = require('supertest');

const app = require('../../src/app');

describe('backend foundation routes', () => {
  test('GET /api/v1/health returns the API health status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Hostel Management System API is running'
    );
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data.timestamp).toBeDefined();
  });

  test('unknown API routes return a standard 404 response', async () => {
    const response = await request(app).get('/api/v1/unknown-route');
    const responseText = JSON.stringify(response.body);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Route not found');
    expect(response.body.requestId).toBeDefined();
    expect(responseText).not.toMatch(
      /password|token|secret|DATABASE_URL|JWT_SECRET/i
    );
  });
});
