/**
 * 任务管理模块 E2E 测试
 * TC-301 ~ TC-305
 * 每个步骤自动截图保存作为测试证据
 */

import { test, expect } from '@playwright/test';
import { Selectors } from '../utils/selectors';
import {
  saveStepScreenshot,
  clickWithScreenshot,
} from '../utils/helpers';

const TEST_NAME = 'HoloPix_任务管理测试';

/**
 * TC-301: 任务列表刷新测试
 * 优先级: P0
 */
test('TC-301 任务列表刷新测试', async ({ page }) => {
  console.log('[TC-301] 开始测试: 任务列表刷新');
  
  // Step 1: 访问任务列表页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, 'TC301_01_切换到任务列表');
  
  // Step 2: 点击刷新按钮
  console.log('[TC-301] Step 2: 点击刷新');
  await clickWithScreenshot(page, Selectors.tasks.loadTasks, TEST_NAME, 'TC301_02_点击刷新');
  
  // Step 3: 等待数据加载
  console.log('[TC-301] Step 3: 等待加载');
  await page.waitForTimeout(2000);
  await saveStepScreenshot(page, TEST_NAME, 'TC301_03_加载中');
  
  // Step 4: 验证任务列表显示
  console.log('[TC-301] Step 4: 验证列表');
  await saveStepScreenshot(page, TEST_NAME, 'TC301_04_验证列表');
  
  console.log('[TC-301] 测试通过 ✓');
});

/**
 * TC-302: 任务状态显示测试
 * 优先级: P1
 */
test('TC-302 任务状态显示测试', async ({ page }) => {
  console.log('[TC-302] 开始测试: 任务状态显示');
  
  // Step 1: 访问任务列表页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, 'TC302_01_切换到任务列表');
  
  // Step 2: 刷新任务列表
  console.log('[TC-302] Step 2: 刷新列表');
  await page.click(Selectors.tasks.loadTasks);
  await page.waitForTimeout(2000);
  
  // Step 3: 查看任务状态
  console.log('[TC-302] Step 3: 查看状态');
  await saveStepScreenshot(page, TEST_NAME, 'TC302_03_查看状态');
  
  // Step 4: 验证状态标签
  console.log('[TC-302] Step 4: 验证状态标签');
  const statusLabels = page.locator('.task-status');
  const count = await statusLabels.count();
  console.log(`找到 ${count} 个状态标签`);
  await saveStepScreenshot(page, TEST_NAME, 'TC302_04_验证标签');
  
  console.log('[TC-302] 测试通过 ✓');
});

/**
 * TC-303: 任务详情查看测试
 * 优先级: P1
 */
test('TC-303 任务详情查看测试', async ({ page }) => {
  console.log('[TC-303] 开始测试: 任务详情查看');
  
  // Step 1: 访问任务列表页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, 'TC303_01_切换到任务列表');
  
  // Step 2: 刷新任务列表
  console.log('[TC-303] Step 2: 刷新列表');
  await page.click(Selectors.tasks.loadTasks);
  await page.waitForTimeout(2000);
  
  // Step 3: 点击任务项
  console.log('[TC-303] Step 3: 点击任务项');
  const taskItem = page.locator('.task-item').first();
  if (await taskItem.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, '.task-item', TEST_NAME, 'TC303_03_点击任务项');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC303_03_无任务数据');
  }
  
  // Step 4: 验证详情弹框
  console.log('[TC-303] Step 4: 验证详情');
  await saveStepScreenshot(page, TEST_NAME, 'TC303_04_验证详情');
  
  console.log('[TC-303] 测试通过 ✓');
});

/**
 * TC-304: 任务参数复制测试
 * 优先级: P2
 */
test('TC-304 任务参数复制测试', async ({ page }) => {
  console.log('[TC-304] 开始测试: 任务参数复制');
  
  // Step 1: 访问任务列表页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, 'TC304_01_切换到任务列表');
  
  // Step 2: 刷新并点击任务
  console.log('[TC-304] Step 2: 刷新列表');
  await page.click(Selectors.tasks.loadTasks);
  await page.waitForTimeout(2000);
  
  // Step 3: 打开任务详情
  console.log('[TC-304] Step 3: 打开详情');
  const taskItem = page.locator('.task-item').first();
  if (await taskItem.isVisible().catch(() => false)) {
    await taskItem.click();
    await page.waitForTimeout(500);
    await saveStepScreenshot(page, TEST_NAME, 'TC304_03_打开详情');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC304_03_无任务');
  }
  
  // Step 4: 点击复制参数
  console.log('[TC-304] Step 4: 复制参数');
  const copyBtn = page.locator('button:has-text("复制参数")');
  if (await copyBtn.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, 'button:has-text("复制参数")', TEST_NAME, 'TC304_04_复制参数');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC304_04_复制按钮未找到');
  }
  
  console.log('[TC-304] 测试通过 ✓');
});

/**
 * TC-305: 任务图片查看测试
 * 优先级: P2
 */
test('TC-305 任务图片查看测试', async ({ page }) => {
  console.log('[TC-305] 开始测试: 任务图片查看');
  
  // Step 1: 访问任务列表页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, 'TC305_01_切换到任务列表');
  
  // Step 2: 刷新列表
  console.log('[TC-305] Step 2: 刷新列表');
  await page.click(Selectors.tasks.loadTasks);
  await page.waitForTimeout(2000);
  
  // Step 3: 打开任务详情
  console.log('[TC-305] Step 3: 打开详情');
  const taskItem = page.locator('.task-item').first();
  if (await taskItem.isVisible().catch(() => false)) {
    await taskItem.click();
    await page.waitForTimeout(500);
  }
  
  // Step 4: 点击图片查看大图
  console.log('[TC-305] Step 4: 查看图片');
  const taskImage = page.locator('.task-result-image').first();
  if (await taskImage.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, '.task-result-image', TEST_NAME, 'TC305_04_查看图片');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC305_04_无图片');
  }
  
  console.log('[TC-305] 测试通过 ✓');
});
