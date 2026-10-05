import { APIRequestContext, expect } from '@playwright/test';

export const bookingPayload = (overrides: Record<string, unknown> = {}) => ({
  firstname: 'PK',
  lastname: 'Tester',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2026-11-01', checkout: '2026-11-05' },
  additionalneeds: 'Breakfast',
  ...overrides,
});

export async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth', {
    data: { username: 'admin', password: 'password123' },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).token;
}

export async function createBooking(
  request: APIRequestContext,
  overrides: Record<string, unknown> = {}
) {
  const res = await request.post('/booking', { data: bookingPayload(overrides) });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return { id: body.bookingid as number, booking: body.booking };
}

export async function deleteBooking(request: APIRequestContext, id: number) {
  const token = await getToken(request);
  return request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
}
