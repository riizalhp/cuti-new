import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackerApi } from '@/lib/api';

describe('trackerApi client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('getAll returns array when server responds with 200', async () => {
    const mockData = [
      { id: 'app-1', company: 'PT Teknologi Hebat', position: 'Frontend Developer', status: 'APPLIED' },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockData }),
    } as Response);

    const result = await trackerApi.getAll(true);
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/applications', expect.objectContaining({
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    }));
  });

  it('getAll throws an error when server responds with 500', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(trackerApi.getAll(true)).rejects.toMatchObject({
      status: 500,
      message: 'API Error: Internal Server Error',
    });
  });

  it('getById returns item on 200 and null on 404/error', async () => {
    const mockItem = { id: 'app-123', company: 'PT Maju Bersama', position: 'Backend Engineer' };
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockItem }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

    const found = await trackerApi.getById('app-123');
    expect(found).toEqual(mockItem);

    const notFound = await trackerApi.getById('invalid-id');
    expect(notFound).toBeNull();
  });

  it('create sends POST request and returns created record', async () => {
    const payload = { company: 'PT Solusi Cerdas', position: 'UI Designer' };
    const created = { id: 'app-created', ...payload };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: created }),
    } as Response);

    const result = await trackerApi.create(payload);
    expect(result).toEqual(created);
    expect(global.fetch).toHaveBeenCalledWith('/api/applications', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  });

  it('delete sends DELETE request and returns true on success, false on error', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      } as Response);

    const ok = await trackerApi.delete('app-1');
    expect(ok).toBe(true);

    const fail = await trackerApi.delete('app-2');
    expect(fail).toBe(false);
  });
});
