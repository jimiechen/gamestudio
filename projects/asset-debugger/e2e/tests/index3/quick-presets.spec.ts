import { test, expect } from '@playwright/test';

test.describe('快捷应用功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
  });

  test('快捷应用区域元素存在', async ({ page }) => {
    // 验证快捷应用标题存在
    await expect(page.locator('[data-section="quickPresets"]')).toBeVisible();
    // 验证加载配置按钮存在
    await expect(page.locator('[data-action="openQuickPresetModal"]')).toBeVisible();
    // 验证保存配置按钮存在
    await expect(page.locator('[data-action="saveQuickPreset"]')).toBeVisible();
    // 验证预设列表容器存在
    await expect(page.locator('#quickPresetList')).toBeVisible();
  });

  test('能填写表单并保存配置', async ({ page }) => {
    // 填写表单
    await page.fill('#prompt', '测试保存配置的提示词');
    await page.fill('#seed', '12345');
    
    // 验证值已填写
    await expect(page.locator('#prompt')).toHaveValue('测试保存配置的提示词');
    await expect(page.locator('#seed')).toHaveValue('12345');
    
    // 点击保存配置按钮
    await page.click('[data-action="saveQuickPreset"]');
    
    // 验证预设列表区域仍然可见
    await expect(page.locator('#quickPresetList')).toBeVisible();
  });
});
