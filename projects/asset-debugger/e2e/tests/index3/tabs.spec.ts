import { test, expect } from '@playwright/test';

test.describe('标签页功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
  });

  test('显示5个标签页', async ({ page }) => {
    await expect(page.locator('.tab')).toHaveCount(5);
    await expect(page.locator('[data-tab="generate"]')).toBeVisible();
    await expect(page.locator('[data-tab="models"]')).toBeVisible();
    await expect(page.locator('[data-tab="tasks"]')).toBeVisible();
    await expect(page.locator('[data-tab="assets"]')).toBeVisible();
    await expect(page.locator('[data-tab="stickman"]')).toBeVisible();
  });

  test('能切换到所有标签页', async ({ page }) => {
    // 默认在生成素材页
    await expect(page.locator('#generate')).toHaveClass(/active/);
    
    // 切换到模型列表
    await page.click('[data-tab="models"]');
    await expect(page.locator('#models')).toHaveClass(/active/);
    await expect(page.locator('#generate')).not.toHaveClass(/active/);
    
    // 切换到任务列表
    await page.click('[data-tab="tasks"]');
    await expect(page.locator('#tasks')).toHaveClass(/active/);
    
    // 切换到素材库
    await page.click('[data-tab="assets"]');
    await expect(page.locator('#assets')).toHaveClass(/active/);
    
    // 切换到火柴人
    await page.click('[data-tab="stickman"]');
    await expect(page.locator('#stickman')).toHaveClass(/active/);
    
    // 切回生成素材
    await page.click('[data-tab="generate"]');
    await expect(page.locator('#generate')).toHaveClass(/active/);
  });
});
