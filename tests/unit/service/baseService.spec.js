import { describe, it, expect, vi, beforeEach } from 'vitest';
import BaseService from '@/service/baseService';
import apiClient from '@/service/apiClient';

vi.mock('@/service/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    defaults: {
      headers: {
        common: {
          Authorization: 'Bearer token'
        }
      }
    }
  }
}));

describe('BaseService', () => {
  let service;

  beforeEach(() => {
    service = new BaseService('/test');
    vi.clearAllMocks();
  });

  it('calls GET with correct URL and options', async () => {
    apiClient.get.mockResolvedValue({ data: 'ok' });

    const result = await service.get('123');

    expect(apiClient.get).toHaveBeenCalledWith('/test/123', expect.any(Object));
    expect(result).toBe('ok');
  });

  it('calls POST with correct data and options', async () => {
    apiClient.post.mockResolvedValue({ data: 'created' });

    const result = await service.post('add', { name: 'test' });

    expect(apiClient.post).toHaveBeenCalledWith('/test/add', { name: 'test' }, expect.any(Object));
    expect(result).toBe('created');
  });

  it('calls PUT with correct data and options', async () => {
    apiClient.put.mockResolvedValue({ data: 'updated' });

    const result = await service.put('update/1', { name: 'new' });

    expect(apiClient.put).toHaveBeenCalledWith('/test/update/1', { name: 'new' }, expect.any(Object));
    expect(result).toBe('updated');
  });

  it('calls DELETE with correct URL', async () => {
    apiClient.delete.mockResolvedValue({ data: 'deleted' });

    const result = await service.deleteItem('remove/2');

    expect(apiClient.delete).toHaveBeenCalledWith('/test/remove/2', expect.any(Object));
    expect(result).toBe('deleted');
  });

  it('calls PATCH with correct data and options', async () => {
    apiClient.patch.mockResolvedValue({ data: 'patched' });

    const result = await service.patch('edit/3', { status: 'done' });

    expect(apiClient.patch).toHaveBeenCalledWith('/test/edit/3', { status: 'done' }, expect.any(Object));
    expect(result).toBe('patched');
  });

  it('handles API errors with response', async () => {
    apiClient.get.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'Bad Request' }
      }
    });

    await expect(service.get('error')).rejects.toEqual({
      status: 400,
      message: 'Bad Request'
    });
  });

  it('handles API errors with no response', async () => {
    apiClient.get.mockRejectedValue({
      request: {}
    });

    await expect(service.get('no-response')).rejects.toEqual({
      status: 0,
      message: 'No response from server'
    });
  });

  it('handles API errors with unknown error', async () => {
    apiClient.get.mockRejectedValue(new Error('Network crashed'));

    await expect(service.get('network-down')).rejects.toEqual({
      status: 0,
      message: 'Network crashed'
    });
  });
});
