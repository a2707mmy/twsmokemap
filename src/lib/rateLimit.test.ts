import { beforeEach, describe, expect, it } from 'vitest';
import { canReport, RATE_LIMIT_INFO, recordReport } from './rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初始狀態可以回報', () => {
    expect(canReport()).toBe(true);
  });

  it('達到上限後不可再回報', () => {
    for (let i = 0; i < RATE_LIMIT_INFO.max; i++) {
      expect(canReport()).toBe(true);
      recordReport();
    }
    expect(canReport()).toBe(false);
  });
});
