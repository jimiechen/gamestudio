import { test, expect } from '@playwright/test';

test.describe('模型列表功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
    await page.click('[data-tab="models"]');
  });

  test('模型列表页面元素存在', async ({ page }) => {
    // 验证同步按钮存在
    await expect(page.locator('[data-action="syncModels"]')).toBeVisible();
    // 验证搜索框存在
    await expect(page.locator('#searchModelName')).toBeVisible();
    // 验证模型表格容器存在
    await expect(page.locator('#modelsTableContainer')).toBeVisible();
  });

  test('能搜索模型', async ({ page }) => {
    // 填写搜索关键词
    await page.fill('#searchModelName', 'test');
    await page.keyboard.press('Enter');
    
    // 验证搜索功能正常工作（不报错即可）
    await expect(page.locator('#modelsTableContainer')).toBeVisible();
  });
});
