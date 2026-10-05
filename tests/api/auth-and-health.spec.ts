import { test, expect } from '@playwright/test';

test.describe('Health check', () => {
  test('GET /ping returns 201 Created', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });
});

test.describe('Authentication', () => {
  test('POST /auth with valid credentials returns a token', async ({ request }) => {
    const res = await request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(5);
  });

  test('POST /auth with wrong password returns a "Bad credentials" reason', async ({ request }) => {
    const res = await request.post('/auth', {
      data: { username: 'admin', password: 'wrong' },
    });
    // This API reports failed logins in the body (status is 200, not 401)
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ reason: 'Bad credentials' });
  });
});
