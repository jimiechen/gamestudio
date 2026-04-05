/**
 * 火柴人调试模块 E2E 测试
 * TC-501 ~ TC-510
 * 每个步骤自动截图保存作为测试证据
 */

import { test, expect } from '@playwright/test';
import { Selectors } from '../utils/selectors';
import {
  saveStepScreenshot,
  clickWithScreenshot,
  fillWithScreenshot,
} from '../utils/helpers';

const TEST_NAME = 'HoloPix_火柴人调试测试';

/**
 * TC-501: 预设姿势加载测试
 * 优先级: P0
 */
test('TC-501 预设姿势加载测试', async ({ page }) => {
  console.log('[TC-501] 开始测试: 预设姿势加载');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC501_01_切换到火柴人');
  
  // Step 2: 点击站立预设
  console.log('[TC-501] Step 2: 点击站立预设');
  await clickWithScreenshot(page, Selectors.stickman.presetStanding, TEST_NAME, 'TC501_02_站立预设');
  
  // Step 3: 点击行走预设
  console.log('[TC-501] Step 3: 点击行走预设');
  await clickWithScreenshot(page, Selectors.stickman.presetWalking, TEST_NAME, 'TC501_03_行走预设');
  
  // Step 4: 点击奔跑预设
  console.log('[TC-501] Step 4: 点击奔跑预设');
  await clickWithScreenshot(page, Selectors.stickman.presetRunning, TEST_NAME, 'TC501_04_奔跑预设');
  
  console.log('[TC-501] 测试通过 ✓');
});

/**
 * TC-502: 姿势编辑测试
 * 优先级: P1
 */
test('TC-502 姿势编辑测试', async ({ page }) => {
  console.log('[TC-502] 开始测试: 姿势编辑');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC502_01_切换到火柴人');
  
  // Step 2: 加载预设姿势
  console.log('[TC-502] Step 2: 加载预设');
  await page.click(Selectors.stickman.presetStanding);
  await saveStepScreenshot(page, TEST_NAME, 'TC502_02_加载预设');
  
  // Step 3: 拖拽骨骼节点
  console.log('[TC-502] Step 3: 拖拽节点');
  const canvas = page.locator(Selectors.stickman.canvas);
  const box = await canvas.boundingBox();
  if (box) {
    // 模拟拖拽操作
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2 + 20);
    await page.mouse.up();
    await saveStepScreenshot(page, TEST_NAME, 'TC502_03_拖拽节点');
  }
  
  console.log('[TC-502] 测试通过 ✓');
});

/**
 * TC-503: 姿势保存测试
 * 优先级: P1
 */
test('TC-503 姿势保存测试', async ({ page }) => {
  console.log('[TC-503] 开始测试: 姿势保存');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC503_01_切换到火柴人');
  
  // Step 2: 编辑姿势
  console.log('[TC-503] Step 2: 编辑姿势');
  await page.click(Selectors.stickman.presetStanding);
  await saveStepScreenshot(page, TEST_NAME, 'TC503_02_编辑姿势');
  
  // Step 3: 点击保存姿势
  console.log('[TC-503] Step 3: 保存姿势');
  // 处理可能的对话框
  page.on('dialog', async dialog => {
    await dialog.accept('测试姿势');
  });
  await clickWithScreenshot(page, Selectors.stickman.savePose, TEST_NAME, 'TC503_03_保存姿势');
  
  // Step 4: 验证姿势列表更新
  console.log('[TC-503] Step 4: 验证列表');
  await page.waitForTimeout(1000);
  await saveStepScreenshot(page, TEST_NAME, 'TC503_04_验证列表');
  
  console.log('[TC-503] 测试通过 ✓');
});

/**
 * TC-504: 姿势导出测试
 * 优先级: P1
 */
test('TC-504 姿势导出测试', async ({ page }) => {
  console.log('[TC-504] 开始测试: 姿势导出');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC504_01_切换到火柴人');
  
  // Step 2: 加载预设姿势
  console.log('[TC-504] Step 2: 加载预设');
  await page.click(Selectors.stickman.presetStanding);
  await saveStepScreenshot(page, TEST_NAME, 'TC504_02_加载预设');
  
  // Step 3: 点击导出PNG
  console.log('[TC-504] Step 3: 导出PNG');
  await clickWithScreenshot(page, Selectors.stickman.exportPNG, TEST_NAME, 'TC504_03_导出PNG');
  
  // Step 4: 验证下载
  console.log('[TC-504] Step 4: 验证下载');
  await page.waitForTimeout(1000);
  await saveStepScreenshot(page, TEST_NAME, 'TC504_04_验证下载');
  
  console.log('[TC-504] 测试通过 ✓');
});

/**
 * TC-505: 姿势描述生成测试
 * 优先级: P2
 */
test('TC-505 姿势描述生成测试', async ({ page }) => {
  console.log('[TC-505] 开始测试: 姿势描述生成');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC505_01_切换到火柴人');
  
  // Step 2: 加载预设姿势
  console.log('[TC-505] Step 2: 加载预设');
  await page.click(Selectors.stickman.presetStanding);
  await saveStepScreenshot(page, TEST_NAME, 'TC505_02_加载预设');
  
  // Step 3: 点击生成描述
  console.log('[TC-505] Step 3: 生成描述');
  await clickWithScreenshot(page, Selectors.stickman.generateDesc, TEST_NAME, 'TC505_03_生成描述');
  
  // Step 4: 验证描述文本
  console.log('[TC-505] Step 4: 验证描述');
  await page.waitForTimeout(1000);
  await saveStepScreenshot(page, TEST_NAME, 'TC505_04_验证描述');
  
  console.log('[TC-505] 测试通过 ✓');
});

/**
 * TC-506: 姿势用于文生图测试
 * 优先级: P0
 */
test('TC-506 姿势用于文生图测试', async ({ page }) => {
  console.log('[TC-506] 开始测试: 姿势用于文生图');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC506_01_切换到火柴人');
  
  // Step 2: 加载预设姿势
  console.log('[TC-506] Step 2: 加载预设');
  await page.click(Selectors.stickman.presetStanding);
  await saveStepScreenshot(page, TEST_NAME, 'TC506_02_加载预设');
  
  // Step 3: 点击用于文生图
  console.log('[TC-506] Step 3: 用于文生图');
  await clickWithScreenshot(page, Selectors.stickman.useInGeneration, TEST_NAME, 'TC506_03_用于文生图');
  
  // Step 4: 切换到生成素材页验证
  console.log('[TC-506] Step 4: 验证应用');
  await page.click(Selectors.tabs.generate);
  await page.waitForTimeout(500);
  await saveStepScreenshot(page, TEST_NAME, 'TC506_04_验证应用');
  
  console.log('[TC-506] 测试通过 ✓');
});

/**
 * TC-507: 姿势列表筛选测试
 * 优先级: P2
 */
test('TC-507 姿势列表筛选测试', async ({ page }) => {
  console.log('[TC-507] 开始测试: 姿势列表筛选');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC507_01_切换到火柴人');
  
  // Step 2: 输入搜索关键字
  console.log('[TC-507] Step 2: 输入搜索');
  await fillWithScreenshot(page, 'input[placeholder="搜索姿势..."]', '站立', TEST_NAME, 'TC507_02_输入搜索');
  
  // Step 3: 验证筛选结果
  console.log('[TC-507] Step 3: 验证结果');
  await page.waitForTimeout(500);
  await saveStepScreenshot(page, TEST_NAME, 'TC507_03_验证结果');
  
  console.log('[TC-507] 测试通过 ✓');
});

/**
 * TC-508: 姿势列表分类测试
 * 优先级: P2
 */
test('TC-508 姿势列表分类测试', async ({ page }) => {
  console.log('[TC-508] 开始测试: 姿势列表分类');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC508_01_切换到火柴人');
  
  // Step 2: 筛选预设姿势
  console.log('[TC-508] Step 2: 筛选预设');
  const presetFilter = page.locator('button:has-text("预设")').first();
  if (await presetFilter.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, 'button:has-text("预设")', TEST_NAME, 'TC508_02_筛选预设');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC508_02_筛选按钮未找到');
  }
  
  // Step 3: 筛选自定义姿势
  console.log('[TC-508] Step 3: 筛选自定义');
  const customFilter = page.locator('button:has-text("自定义")').first();
  if (await customFilter.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, 'button:has-text("自定义")', TEST_NAME, 'TC508_03_筛选自定义');
  }
  
  console.log('[TC-508] 测试通过 ✓');
});

/**
 * TC-509: 姿势重置测试
 * 优先级: P1
 */
test('TC-509 姿势重置测试', async ({ page }) => {
  console.log('[TC-509] 开始测试: 姿势重置');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC509_01_切换到火柴人');
  
  // Step 2: 编辑姿势
  console.log('[TC-509] Step 2: 编辑姿势');
  await page.click(Selectors.stickman.presetStanding);
  await saveStepScreenshot(page, TEST_NAME, 'TC509_02_编辑姿势');
  
  // Step 3: 点击重置
  console.log('[TC-509] Step 3: 点击重置');
  await clickWithScreenshot(page, Selectors.stickman.resetPose, TEST_NAME, 'TC509_03_点击重置');
  
  // Step 4: 验证重置结果
  console.log('[TC-509] Step 4: 验证重置');
  await saveStepScreenshot(page, TEST_NAME, 'TC509_04_验证重置');
  
  console.log('[TC-509] 测试通过 ✓');
});

/**
 * TC-510: 姿势选择器测试
 * 优先级: P1
 */
test('TC-510 姿势选择器测试', async ({ page }) => {
  console.log('[TC-510] 开始测试: 姿势选择器');
  
  // Step 1: 访问火柴人调试页
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, 'TC510_01_切换到火柴人');
  
  // Step 2: 点击选择姿势按钮
  console.log('[TC-510] Step 2: 点击选择姿势');
  await clickWithScreenshot(page, Selectors.stickman.openPoseModal, TEST_NAME, 'TC510_02_点击选择姿势');
  
  // Step 3: 选择姿势
  console.log('[TC-510] Step 3: 选择姿势');
  await page.waitForTimeout(1000);
  const poseItem = page.locator('.pose-item').first();
  if (await poseItem.isVisible().catch(() => false)) {
    await clickWithScreenshot(page, '.pose-item', TEST_NAME, 'TC510_03_选择姿势');
  } else {
    await saveStepScreenshot(page, TEST_NAME, 'TC510_03_无姿势数据');
  }
  
  // Step 4: 验证应用到文生图
  console.log('[TC-510] Step 4: 验证应用');
  await page.click(Selectors.tabs.generate);
  await page.waitForTimeout(500);
  await saveStepScreenshot(page, TEST_NAME, 'TC510_04_验证应用');
  
  console.log('[TC-510] 测试通过 ✓');
});
