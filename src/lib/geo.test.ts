import { describe, expect, it } from 'vitest';
import { distanceMeters, formatDistance, formatWalk } from './geo';

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

describe('formatWalk', () => {
  it('很近顯示 1 分鐘內', () => {
    expect(formatWalk(50)).toBe('步行 1 分鐘內');
  });

  it('一般距離顯示步行分鐘數（80 公尺/分鐘）', () => {
    expect(formatWalk(400)).toBe('步行約 5 分鐘');
    expect(formatWalk(800)).toBe('步行約 10 分鐘');
  });

  it('太遠改顯示公里', () => {
    expect(formatWalk(5000)).toBe('5.0 公里');
  });
});
