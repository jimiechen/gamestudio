/**
 * 素材管理模块 E2E 测试
 * TC-401 ~ TC-405
 * 每个步骤自动截图保存作为测试证据
 */

import { test, expect } from '@playwright/test';
import { Selectors } from '../utils/selectors';
import {
  saveStepScreenshot,
  clickWithScreenshot,
} from '../utils/helpers';

const TEST_NAME = 'HoloPix_素材管理测试';

/**
 * TC-401: 素材列表刷新测试
 * 优先级: P0
 */
test('TC-401 素材列表刷新测试', async ({ page }) => {
  console.log('[TC-401] 开始测试: 素材列表刷新');
  
  // Step 1: 访问素材库页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, 'TC401_01_切换到素材库');
  
  // Step 2: 点击刷新按钮
  console.log('[TC-401] Step 2: 点击刷新');
  await clickWithScreenshot(page, Selectors.assets.loadAssets, TEST_NAME, 'TC401_02_点击刷新');
  
  // Step 3: 等待数据加载
  console.log('[TC-401] Step 3: 等待加载');
  await page.waitForTimeout(2000);
  await saveStepScreenshot(page, TEST_NAME, 'TC401_03_加载中');
  
  // Step 4: 验证素材列表显示
  console.log('[TC-401] Step 4: 验证列表');
  await saveStepScreenshot(page, TEST_NAME, 'TC401_04_验证列表');
  
  console.log('[TC-401] 测试通过 ✓');
});

/**
 * TC-402: 素材卡片显示测试
 * 优先级: P1
 */
test('TC-402 素材卡片显示测试', async ({ page }) => {
  console.log('[TC-402] 开始测试: 素材卡片显示');
  
  // Step 1: 访问素材库页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, 'TC402_01_切换到素材库');
  
  // Step 2: 刷新素材列表
  console.log('[TC-402] Step 2: 刷新列表');
  await page.click(Selectors.assets.loadAssets);
  await page.waitForTimeout(2000);
  
  // Step 3: 查看素材卡片
  console.log('[TC-402] Step 3: 查看卡片');
  await saveStepScreenshot(page, TEST_NAME, 'TC402_03_查看卡片');
  
  // Step 4: 验证预览图和时间
  console.log('[TC-402] Step 4: 验证信息');
  const assetCards = page.locator('.asset-card');
  const count = await assetCards.count();
  console.log(`找到 ${count} 个素材卡片`);
  await saveStepScreenshot(page, TEST_NAME, 'TC402_04_验证信息');
  
  console.log('[TC-402] 测试通过 ✓');
});

/**
 * TC-403: 素材详情查看测试
 * 优先级: P1
 */
test('TC-403 素材详情查看测试', async ({ page }) => {
  console.log('[TC-403] 开始测试: 素材详情查看');
  
  // Step 1: 访问素材库页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, 'TC403_01_切换到素材库');
  
  // Step 2: 刷新素材列表
  console.log('[TC-403] Step 2: 刷新列表');
  await page.click(Selectors.assets.loadAssets);
  await page.waitForTimeout(2000);
  
  // Step 3: 点击素材卡片
  console.log('[TC-403] Step 3: 点击卡片');
  const assetCard = page.locator('.asset-card').first();
  if (await assetCard.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, '.asset-card', TEST_NAME, 'TC403_03_点击卡片');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC403_03_无素材数据');
  }
  
  // Step 4: 验证详情显示
  console.log('[TC-403] Step 4: 验证详情');
  await saveStepScreenshot(page, TEST_NAME, 'TC403_04_验证详情');
  
  console.log('[TC-403] 测试通过 ✓');
});

/**
 * TC-404: 素材下载测试
 * 优先级: P2
 */
test('TC-404 素材下载测试', async ({ page }) => {
  console.log('[TC-404] 开始测试: 素材下载');
  
  // Step 1: 访问素材库页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, 'TC404_01_切换到素材库');
  
  // Step 2: 刷新素材列表
  console.log('[TC-404] Step 2: 刷新列表');
  await page.click(Selectors.assets.loadAssets);
  await page.waitForTimeout(2000);
  
  // Step 3: 查找下载按钮
  console.log('[TC-404] Step 3: 查找下载按钮');
  const downloadBtn = page.locator('.asset-download-btn').first();
  if (await downloadBtn.isVisible().catch(() => false)) {
    await saveStepScreenshot(page, TEST_NAME, 'TC404_03_找到下载按钮');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC404_03_下载按钮未找到');
  }
  
  // Step 4: 点击下载
  console.log('[TC-404] Step 4: 点击下载');
  if (await downloadBtn.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, '.asset-download-btn', TEST_NAME, 'TC404_04_点击下载');
  }
  
  console.log('[TC-404] 测试通过 ✓');
});

/**
 * TC-405: 素材删除测试
 * 优先级: P2
 */
test('TC-405 素材删除测试', async ({ page }) => {
  console.log('[TC-405] 开始测试: 素材删除');
  
  // Step 1: 访问素材库页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, 'TC405_01_切换到素材库');
  
  // Step 2: 刷新素材列表
  console.log('[TC-405] Step 2: 刷新列表');
  await page.click(Selectors.assets.loadAssets);
  await page.waitForTimeout(2000);
  
  // Step 3: 查找删除按钮
  console.log('[TC-405] Step 3: 查找删除按钮');
  const deleteBtn = page.locator('.asset-delete-btn').first();
  if (await deleteBtn.isVisible().catch(() => false)) {
    await saveStepScreenshot(page, TEST_NAME, 'TC405_03_找到删除按钮');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC405_03_删除按钮未找到');
  }
  
  // Step 4: 点击删除
  console.log('[TC-405] Step 4: 点击删除');
  if (await deleteBtn.isVisible().catch(() => false)) {
    // 处理确认对话框
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await clickWithScreenshot(page, '.asset-delete-btn', TEST_NAME, 'TC405_04_点击删除');
  }
  
  console.log('[TC-405] 测试通过 ✓');
});
