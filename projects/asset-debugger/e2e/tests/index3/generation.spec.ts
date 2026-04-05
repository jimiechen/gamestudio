import { test, expect } from '@playwright/test';

test.describe('文生图功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
  });

  test('表单元素存在且可填写', async ({ page }) => {
    // 验证表单元素存在
    await expect(page.locator('#prompt')).toBeVisible();
    await expect(page.locator('#negativePrompt')).toBeVisible();
    await expect(page.locator('#seed')).toBeVisible();
    await expect(page.locator('#batchSize')).toBeVisible();
    
    // 填写表单
    await page.fill('#prompt', '测试提示词');
    await page.fill('#negativePrompt', '测试反向提示词');
    await page.fill('#seed', '12345');
    await page.fill('#batchSize', '2');
    
    // 验证值
    await expect(page.locator('#prompt')).toHaveValue('测试提示词');
    await expect(page.locator('#seed')).toHaveValue('12345');
  });

  test('高清修复开关工作正常', async ({ page }) => {
    // 默认隐藏
    await expect(page.locator('#hdScaleContainer')).toBeHidden();
    
    // 勾选高清修复
    await page.check('#hdFix');
    await expect(page.locator('#hdScaleContainer')).toBeVisible();
    
    // 取消勾选
    await page.uncheck('#hdFix');
    await expect(page.locator('#hdScaleContainer')).toBeHidden();
  });

  test('画面增强开关工作正常', async ({ page }) => {
    // 默认隐藏
    await expect(page.locator('#perturbContainer')).toBeHidden();
    
    // 勾选画面增强
    await page.check('#enablePerturb');
    await expect(page.locator('#perturbContainer')).toBeVisible();
    
    // 取消勾选
    await page.uncheck('#enablePerturb');
    await expect(page.locator('#perturbContainer')).toBeHidden();
  });
});
