import { test, expect } from '@playwright/test';

test.describe('火柴人调试功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
    await page.click('[data-tab="stickman"]');
  });

  test('火柴人页面元素存在', async ({ page }) => {
    // 验证Canvas画布存在
    await expect(page.locator('#stickmanCanvas')).toBeVisible();
    // 验证工具栏存在
    await expect(page.locator('#stickmanToolbar')).toBeVisible();
  });
});
