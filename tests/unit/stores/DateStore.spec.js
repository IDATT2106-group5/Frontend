import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDateStore } from '@/stores/DateStore';

describe('useDateStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDateStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes currentDateTime to now', () => {
    const now = new Date();
    const diff = Math.abs(store.currentDateTime.getTime() - now.getTime());
    expect(diff).toBeLessThan(100);
  });

  it('formats date and time correctly', () => {
    store.currentDateTime = new Date('2025-05-05T14:30:00');
    expect(store.formattedDateTime).toBe('05.05.2025 14:30');
  });

  describe('startClock', () => {
        it('creates an interval that updates currentDateTime every minute', () => {
      const initial = new Date('2025-05-05T12:00:00');
      vi.setSystemTime(initial);
      store = useDateStore();
      store.startClock();

      vi.advanceTimersByTime(60000);
      expect(store.currentDateTime.getTime()).toBe(initial.getTime() + 60000);
    });

    it('does not create multiple intervals when called twice', () => {
      store.startClock();
      const intervalId = store.interval;
      store.startClock();
      expect(store.interval).toBe(intervalId);
    });
  });

  describe('stopClock', () => {
        it('clears the interval and stops updates', () => {
      const initial = new Date('2025-05-05T12:00:00');
      vi.setSystemTime(initial);
      store = useDateStore();
      store.startClock();

      store.stopClock();
      expect(store.interval).toBeNull();

      const stopped = store.currentDateTime.getTime();
      vi.advanceTimersByTime(60000);
      expect(store.currentDateTime.getTime()).toBe(stopped);
    });
  });
});
