import { test, expect } from '@playwright/test';

test.describe('API模块功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
  });

  test('API模块已加载', async ({ page }) => {
    // 验证API模块存在
    const apiExists = await page.evaluate(() => typeof API !== 'undefined');
    expect(apiExists).toBe(true);
  });

  test('状态管理模块已加载', async ({ page }) => {
    // 验证状态管理模块存在
    const stateExists = await page.evaluate(() => typeof State !== 'undefined');
    expect(stateExists).toBe(true);
  });

  test('能获取模型列表', async ({ page }) => {
    // 切换到模型列表标签页
    await page.click('[data-tab="models"]');
    
    // 验证同步按钮存在并可点击
    await expect(page.locator('[data-action="syncModels"]')).toBeVisible();
    
    // 点击同步按钮
    await page.click('[data-action="syncModels"]');
    
    // 验证表格容器仍然可见
    await expect(page.locator('#modelsTableContainer')).toBeVisible();
  });
});
