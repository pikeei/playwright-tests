import { test, expect } from '@playwright/test';
import {
  bookingPayload,
  createBooking,
  deleteBooking,
  expectBookingListItem,
  expectBookingRecord,
  expectCreateBookingResponse,
  getToken,
} from './helpers';

test.describe('GET /booking', () => {
  test('returns a list of booking ids', async ({ request }) => {
    const res = await request.get('/booking');
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expectBookingListItem(list[0]);
  });

  test('can filter by firstname', async ({ request }) => {
    const unique = `PK${Date.now()}`;
    const { id } = await createBooking(request, { firstname: unique });
    try {
      const res = await request.get('/booking', { params: { firstname: unique } });
      expect(res.status()).toBe(200);
      const list = await res.json();
      const ids = list.map((b: { bookingid: number }) => b.bookingid);
      expect(ids).toContain(id);
      list.forEach((item: unknown) => expectBookingListItem(item));
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
    expectCreateBookingResponse(body, payload);
    await deleteBooking(request, body.bookingid);
  });

  test('created booking can be fetched by id', async ({ request }) => {
    const { id, booking } = await createBooking(request);
    try {
      const res = await request.get(`/booking/${id}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expectBookingRecord(body, booking);
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
      const body = await res.json();
      expectBookingRecord(body, updated);
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
      expectBookingRecord(body, {
        firstname: 'Patched',
        lastname: 'Keeper',
      });
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
