import { test, expect } from '@playwright/test';

test.describe('素材库功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
    await page.click('[data-tab="assets"]');
  });

  test('素材库页面元素存在', async ({ page }) => {
    // 验证刷新按钮存在
    await expect(page.locator('[data-action="refreshAssets"]')).toBeVisible();
    // 验证素材网格容器存在
    await expect(page.locator('#assetsGridContainer')).toBeVisible();
  });
});
