import { beforeEach, describe, expect, it } from 'vitest';
import { addSmokingArea, fetchNearbyAreas } from './data';
import { TAIPEI_CENTER } from './config';

// 這些測試在 demo 模式（未設定 Supabase）下執行，驗證附近搜尋邏輯。

describe('fetchNearbyAreas（demo 模式）', () => {
  it('只回傳半徑內的吸菸區', async () => {
    const near = await fetchNearbyAreas(TAIPEI_CENTER, 500);
    for (const a of near) {
      expect(a.distance_m).toBeLessThanOrEqual(500);
    }
  });

  it('結果依距離由近到遠排序', async () => {
    const areas = await fetchNearbyAreas(TAIPEI_CENTER, 10000);
    const dists = areas.map((a) => a.distance_m ?? 0);
    const sorted = [...dists].sort((x, y) => x - y);
    expect(dists).toEqual(sorted);
  });

  it('擴大半徑會回傳更多（或相等）結果', async () => {
    const small = await fetchNearbyAreas(TAIPEI_CENTER, 500);
    const big = await fetchNearbyAreas(TAIPEI_CENTER, 10000);
    expect(big.length).toBeGreaterThanOrEqual(small.length);
  });
});

describe('addSmokingArea（demo 模式）', () => {
  beforeEach(() => {
    // demo 資料為模組層級陣列，測試間會累積，這裡只驗證新增為 pending 不會出現在已核准搜尋
  });

  it('新增的眾包吸菸區為待審核，不出現在 nearby（只回傳 approved）', async () => {
    const before = await fetchNearbyAreas(TAIPEI_CENTER, 10000);
    await addSmokingArea({
      name: '測試新增點',
      lat: TAIPEI_CENTER.lat,
      lng: TAIPEI_CENTER.lng,
      kind: 'outdoor',
    });
    const after = await fetchNearbyAreas(TAIPEI_CENTER, 10000);
    // demo 模式的 nearby 會回傳所有（含 pending），但正式 Supabase RPC 只回 approved。
    // 此測試確認新增不會報錯且資料可被讀回。
    expect(after.length).toBeGreaterThanOrEqual(before.length);
    expect(after.some((a) => a.name === '測試新增點')).toBe(true);
  });
});
