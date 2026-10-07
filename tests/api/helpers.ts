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

export function expectBookingRecord(value: unknown, expected?: Record<string, unknown>) {
  expect(value).toEqual(
    expect.objectContaining({
      firstname: expect.any(String),
      lastname: expect.any(String),
      totalprice: expect.any(Number),
      depositpaid: expect.any(Boolean),
      bookingdates: expect.objectContaining({
        checkin: expect.any(String),
        checkout: expect.any(String),
      }),
      additionalneeds: expect.any(String),
    })
  );

  if (expected) {
    expect(value).toMatchObject(expected);
  }
}

export function expectBookingListItem(value: unknown) {
  expect(value).toEqual(
    expect.objectContaining({
      bookingid: expect.any(Number),
    })
  );
}

export function expectCreateBookingResponse(value: unknown, expectedBooking?: Record<string, unknown>) {
  expect(value).toEqual(
    expect.objectContaining({
      bookingid: expect.any(Number),
      booking: expect.objectContaining({
        firstname: expect.any(String),
        lastname: expect.any(String),
        totalprice: expect.any(Number),
        depositpaid: expect.any(Boolean),
        bookingdates: expect.objectContaining({
          checkin: expect.any(String),
          checkout: expect.any(String),
        }),
        additionalneeds: expect.any(String),
      }),
    })
  );

  if (expectedBooking) {
    expect((value as { booking: unknown }).booking).toMatchObject(expectedBooking);
  }
}

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
  expectCreateBookingResponse(body, bookingPayload(overrides));
  return { id: body.bookingid as number, booking: body.booking };
}

export async function deleteBooking(request: APIRequestContext, id: number) {
  const token = await getToken(request);
  return request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
}
