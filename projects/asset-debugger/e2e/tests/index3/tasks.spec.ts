import { test, expect } from '@playwright/test';

test.describe('任务列表功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
    await page.click('[data-tab="tasks"]');
  });

  test('任务列表页面元素存在', async ({ page }) => {
    // 验证刷新按钮存在
    await expect(page.locator('[data-action="refreshTasks"]')).toBeVisible();
    // 验证任务列表容器存在
    await expect(page.locator('#tasksListContainer')).toBeVisible();
  });
});
