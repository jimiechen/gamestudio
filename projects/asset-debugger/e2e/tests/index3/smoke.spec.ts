import { test, expect } from '@playwright/test';

test.describe('冒烟测试', () => {
  test('页面能正常加载', async ({ page }) => {
    await page.goto('/static/index3.html');
    await expect(page).toHaveTitle('HoloPix 素材调试器');
    await expect(page.locator('h1')).toContainText('HoloPix 素材调试器');
  });

  test('所有核心模块已加载', async ({ page }) => {
    await page.goto('/static/index3.html');
    
    // 验证核心模块存在
    const modules = await page.evaluate(() => ({
      state: typeof State !== 'undefined',
      api: typeof API !== 'undefined',
      tabs: typeof Tabs !== 'undefined',
      generate: typeof Generate !== 'undefined',
      poller: typeof Poller !== 'undefined',
      results: typeof Results !== 'undefined'
    }));

    expect(modules.state).toBe(true);
    expect(modules.api).toBe(true);
    expect(modules.tabs).toBe(true);
    expect(modules.generate).toBe(true);
    expect(modules.poller).toBe(true);
    expect(modules.results).toBe(true);
  });

  test('页面结构完整', async ({ page }) => {
    await page.goto('/static/index3.html');
    
    // 验证标签页存在
    await expect(page.locator('.tab')).toHaveCount(5);
    
    // 验证表单元素存在
    await expect(page.locator('#prompt')).toBeVisible();
    await expect(page.locator('#generate')).toBeVisible();
    
    // 验证按钮存在
    await expect(page.locator('[data-action="generateImage"]')).toBeVisible();
  });
});
