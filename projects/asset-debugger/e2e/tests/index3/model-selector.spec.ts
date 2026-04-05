import { test, expect } from '@playwright/test';

test.describe('模型选择器弹窗功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
  });

  test('能打开模型选择器弹窗', async ({ page }) => {
    // 点击添加模型按钮
    await page.click('[data-action="openModelSelector"]');
    
    // 验证弹窗显示
    await expect(page.locator('#modelSelectorModal')).toBeVisible();
    await expect(page.locator('#modelSelectorModal')).toContainText('选择模型');
  });

  test('能关闭模型选择器弹窗', async ({ page }) => {
    // 打开弹窗
    await page.click('[data-action="openModelSelector"]');
    await expect(page.locator('#modelSelectorModal')).toBeVisible();
    
    // 点击关闭按钮
    await page.click('[data-action="closeModelSelector"]');
    
    // 验证弹窗隐藏
    await expect(page.locator('#modelSelectorModal')).toBeHidden();
  });
});
