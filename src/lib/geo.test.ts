import { describe, expect, it } from 'vitest';
import { distanceMeters, formatDistance } from './geo';

describe('distanceMeters', () => {
  it('同一點距離為 0', () => {
    const p = { lat: 25.0375, lng: 121.5637 };
    expect(distanceMeters(p, p)).toBe(0);
  });

  it('台北車站到市政府約 4–5 公里', () => {
    const taipeiStation = { lat: 25.0478, lng: 121.5173 };
    const cityHall = { lat: 25.0375, lng: 121.5637 };
    const d = distanceMeters(taipeiStation, cityHall);
    expect(d).toBeGreaterThan(4000);
    expect(d).toBeLessThan(5500);
  });

  it('對稱：A→B 與 B→A 相同', () => {
    const a = { lat: 25.03, lng: 121.5 };
    const b = { lat: 25.05, lng: 121.56 };
    expect(distanceMeters(a, b)).toBeCloseTo(distanceMeters(b, a), 5);
  });
});

describe('formatDistance', () => {
  it('小於 1 公里顯示公尺', () => {
    expect(formatDistance(120)).toBe('120 公尺');
    expect(formatDistance(999)).toBe('999 公尺');
  });

  it('大於等於 1 公里顯示公里（1 位小數）', () => {
    expect(formatDistance(1000)).toBe('1.0 公里');
    expect(formatDistance(2500)).toBe('2.5 公里');
  });
});
