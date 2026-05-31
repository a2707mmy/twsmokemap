import { expect, test } from '@playwright/test';

test.describe('台灣吸菸區地圖', () => {
  test('首頁載入並顯示找吸菸區', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '台灣吸菸區地圖' })).toBeVisible();
    // demo 模式地圖上應有吸菸區標記（桌機/手機皆可見）
    await expect(page.getByRole('button', { name: '市民廣場旁吸菸區', exact: true })).toBeVisible();
  });

  test('可切換到回報煙味並看到表單', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '回報煙味' }).click();
    await expect(page.getByRole('heading', { name: '回報你聞到的煙味' })).toBeVisible();
    await expect(page.getByText('我看到有人在抽菸')).toBeVisible();
    await expect(page.getByText('我聞到濃烈煙味')).toBeVisible();
    await expect(page.getByText('我聞到些微煙味')).toBeVisible();
  });

  test('完成一次煙味回報流程', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '回報煙味' }).click();
    await page.getByText('我看到有人在抽菸').click();
    await page.getByRole('button', { name: '送出回報' }).click();
    await expect(page.getByRole('heading', { name: '感謝你的回報！' })).toBeVisible();
  });

  test('可切換到吸菸規則並看到法規重點', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '吸菸規則' }).click();
    await expect(page.getByRole('heading', { name: '吸菸規則小百科' })).toBeVisible();
    await expect(page.getByText('哪裡禁菸？')).toBeVisible();
  });

  test('點選吸菸區顯示詳情與導航連結', async ({ page }) => {
    await page.goto('/');
    // 點地圖上的標記（桌機/手機清單顯示方式不同，標記在兩者皆可點）
    await page.getByRole('button', { name: '市民廣場旁吸菸區', exact: true }).click();
    const nav = page.getByRole('link', { name: '以 Google Maps 導航' });
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('href', /google\.com\/maps\/dir/);
  });
});
