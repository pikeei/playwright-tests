import { test, expect } from '@playwright/test';
import { bookingPayload, createBooking, deleteBooking, getToken } from './helpers';

test.describe('GET /booking', () => {
  test('returns a list of booking ids', async ({ request }) => {
    const res = await request.get('/booking');
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('bookingid');
  });

  test('can filter by firstname', async ({ request }) => {
    const unique = `PK${Date.now()}`;
    const { id } = await createBooking(request, { firstname: unique });
    try {
      const res = await request.get('/booking', { params: { firstname: unique } });
      expect(res.status()).toBe(200);
      const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
      expect(ids).toContain(id);
    } finally {
      await deleteBooking(request, id);
    }
  });

  test('returns 404 for an unknown booking id', async ({ request }) => {
    const res = await request.get('/booking/999999999');
    expect(res.status()).toBe(404);
  });
});

test.describe('POST /booking', () => {
  test('creates a booking and returns it with an id', async ({ request }) => {
    const payload = bookingPayload();
    const res = await request.post('/booking', { data: payload });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.bookingid).toBe('number');
    expect(body.booking).toMatchObject(payload);
    await deleteBooking(request, body.bookingid);
  });

  test('created booking can be fetched by id', async ({ request }) => {
    const { id, booking } = await createBooking(request);
    try {
      const res = await request.get(`/booking/${id}`);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(booking);
    } finally {
      await deleteBooking(request, id);
    }
  });
});

test.describe('PUT / PATCH /booking/:id', () => {
  test('PUT without auth is forbidden', async ({ request }) => {
    const { id } = await createBooking(request);
    try {
      const res = await request.put(`/booking/${id}`, { data: bookingPayload() });
      expect(res.status()).toBe(403);
    } finally {
      await deleteBooking(request, id);
    }
  });

  test('PUT with a token replaces the booking', async ({ request }) => {
    const { id } = await createBooking(request);
    try {
      const token = await getToken(request);
      const updated = bookingPayload({ firstname: 'Updated', lastname: 'Name', totalprice: 999 });
      const res = await request.put(`/booking/${id}`, {
        data: updated,
        headers: { Cookie: `token=${token}` },
      });
      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject(updated);
    } finally {
      await deleteBooking(request, id);
    }
  });

  test('PATCH with Basic auth changes only the sent fields', async ({ request }) => {
    const { id } = await createBooking(request, { lastname: 'Keeper' });
    try {
      const res = await request.patch(`/booking/${id}`, {
        data: { firstname: 'Patched' },
        headers: { Authorization: 'Basic ' + Buffer.from('admin:password123').toString('base64') },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.firstname).toBe('Patched');
      expect(body.lastname).toBe('Keeper');
    } finally {
      await deleteBooking(request, id);
    }
  });
});

test.describe('DELETE /booking/:id', () => {
  test('DELETE without auth is forbidden', async ({ request }) => {
    const { id } = await createBooking(request);
    try {
      const res = await request.delete(`/booking/${id}`);
      expect(res.status()).toBe(403);
    } finally {
      await deleteBooking(request, id);
    }
  });

  test('full lifecycle: create, delete, then 404', async ({ request }) => {
    const { id } = await createBooking(request);
    const del = await deleteBooking(request, id);
    expect(del.status()).toBe(201); // this API returns 201 Created on delete
    const get = await request.get(`/booking/${id}`);
    expect(get.status()).toBe(404);
  });
});
