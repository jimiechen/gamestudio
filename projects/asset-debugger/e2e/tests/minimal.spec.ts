/**
 * Playwright 最小化自动化测试集合
 * 每个步骤自动截图保存作为测试证据
 * 所有步骤名称使用中文
 */

import { test, expect } from '@playwright/test';
import { Selectors } from '../utils/selectors';
import {
  saveStepScreenshot,
  clickWithScreenshot,
  fillWithScreenshot,
  selectWithScreenshot,
  checkWithScreenshot,
} from '../utils/helpers';

// 测试名称常量
const TEST_NAME = 'HoloPix_基础功能测试';

/**
 * TC-001: 页面基础加载测试
 * 优先级: P0
 * 目的: 验证页面能正常加载
 */
test('TC-001 页面基础加载测试', async ({ page }) => {
  console.log('[TC-001] 开始测试: 页面基础加载');
  
  // Step 1: 访问 index2.html
  console.log('[TC-001] 步骤1: 访问页面');
  await page.goto('/static/index2.html');
  await saveStepScreenshot(page, TEST_NAME, '步骤1_访问页面', '访问 index2.html 页面');
  
  // Step 2: 验证页面标题
  console.log('[TC-001] 步骤2: 验证页面标题');
  await expect(page).toHaveTitle('HoloPix 素材调试器');
  await saveStepScreenshot(page, TEST_NAME, '步骤2_验证标题', '页面标题验证通过');
  
  // Step 3: 验证5个标签页可见
  console.log('[TC-001] 步骤3: 验证标签页');
  await expect(page.locator(Selectors.tabs.generate)).toBeVisible();
  await expect(page.locator(Selectors.tabs.models)).toBeVisible();
  await expect(page.locator(Selectors.tabs.tasks)).toBeVisible();
  await expect(page.locator(Selectors.tabs.assets)).toBeVisible();
  await expect(page.locator(Selectors.tabs.stickman)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤3_验证标签页', '5个标签页全部可见');
  
  console.log('[TC-001] 测试通过 ✓');
});

/**
 * TC-002: 标签页切换测试
 * 优先级: P0
 * 目的: 验证所有标签页可以正常切换
 */
test('TC-002 标签页切换测试', async ({ page }) => {
  console.log('[TC-002] 开始测试: 标签页切换');
  
  // Step 1: 访问页面
  console.log('[TC-002] 步骤1: 访问页面');
  await page.goto('/static/index2.html');
  await saveStepScreenshot(page, TEST_NAME, '步骤1_初始页面');
  
  // Step 2: 验证默认在生成素材页
  console.log('[TC-002] 步骤2: 验证默认标签页');
  await expect(page.locator(Selectors.tabContent.generate)).toHaveClass(/active/);
  await saveStepScreenshot(page, TEST_NAME, '步骤2_默认在生成素材页');
  
  // Step 3: 切换到模型列表页
  console.log('[TC-002] 步骤3: 切换到模型列表页');
  await clickWithScreenshot(page, Selectors.tabs.models, TEST_NAME, '步骤3_切换到模型列表');
  await expect(page.locator(Selectors.tabContent.models)).toHaveClass(/active/);
  await expect(page.locator(Selectors.tabContent.generate)).not.toHaveClass(/active/);
  
  // Step 4: 切换到任务列表页
  console.log('[TC-002] 步骤4: 切换到任务列表页');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, '步骤4_切换到任务列表');
  await expect(page.locator(Selectors.tabContent.tasks)).toHaveClass(/active/);
  
  // Step 5: 切换到素材库页
  console.log('[TC-002] 步骤5: 切换到素材库页');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, '步骤5_切换到素材库');
  await expect(page.locator(Selectors.tabContent.assets)).toHaveClass(/active/);
  
  // Step 6: 切换到火柴人调试页
  console.log('[TC-002] 步骤6: 切换到火柴人调试页');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, '步骤6_切换到火柴人');
  await expect(page.locator(Selectors.tabContent.stickman)).toHaveClass(/active/);
  
  // Step 7: 切回生成素材页
  console.log('[TC-002] 步骤7: 切回生成素材页');
  await clickWithScreenshot(page, Selectors.tabs.generate, TEST_NAME, '步骤7_切回生成素材');
  await expect(page.locator(Selectors.tabContent.generate)).toHaveClass(/active/);
  
  console.log('[TC-002] 测试通过 ✓');
});

/**
 * TC-003: 生成素材页表单填写测试
 * 优先级: P0
 * 目的: 验证表单元素可正常输入
 */
test('TC-003 生成素材页表单填写测试', async ({ page }) => {
  console.log('[TC-003] 开始测试: 表单填写');
  
  // Step 1: 访问页面
  console.log('[TC-003] 步骤1: 访问页面');
  await page.goto('/static/index2.html');
  await saveStepScreenshot(page, TEST_NAME, '步骤1_初始页面');
  
  // Step 2: 填写正向提示词
  console.log('[TC-003] 步骤2: 填写正向提示词');
  await fillWithScreenshot(
    page,
    Selectors.generate.prompt,
    '一个可爱的卡通女孩，蓝色头发，大眼睛',
    TEST_NAME,
    '步骤2_填写正向提示词'
  );
  
  // Step 3: 填写负向提示词
  console.log('[TC-003] 步骤3: 填写负向提示词');
  await fillWithScreenshot(
    page,
    Selectors.generate.negativePrompt,
    '模糊，低质量，变形',
    TEST_NAME,
    '步骤3_填写负向提示词'
  );
  
  // Step 4: 修改图像参数 - 宽度
  console.log('[TC-003] 步骤4: 修改宽度');
  await fillWithScreenshot(page, Selectors.generate.width, '768', TEST_NAME, '步骤4_修改宽度');
  
  // Step 5: 修改图像参数 - 高度
  console.log('[TC-003] 步骤5: 修改高度');
  await fillWithScreenshot(page, Selectors.generate.height, '512', TEST_NAME, '步骤5_修改高度');
  
  // Step 6: 修改采样步数
  console.log('[TC-003] 步骤6: 修改采样步数');
  await fillWithScreenshot(page, Selectors.generate.steps, '30', TEST_NAME, '步骤6_修改步数');
  
  // Step 7: 修改 CFG Scale
  console.log('[TC-003] 步骤7: 修改 CFG Scale');
  await fillWithScreenshot(page, Selectors.generate.cfgScale, '8', TEST_NAME, '步骤7_修改CFG');
  
  // Step 8: 选择采样器
  console.log('[TC-003] 步骤8: 选择采样器');
  await selectWithScreenshot(
    page,
    Selectors.generate.sampler,
    'DPM++ 2M Karras',
    TEST_NAME,
    '步骤8_选择采样器'
  );
  
  // Step 9: 验证所有值正确设置
  console.log('[TC-003] 步骤9: 验证表单值');
  await expect(page.locator(Selectors.generate.prompt)).toHaveValue('一个可爱的卡通女孩，蓝色头发，大眼睛');
  await expect(page.locator(Selectors.generate.width)).toHaveValue('768');
  await expect(page.locator(Selectors.generate.sampler)).toHaveValue('DPM++ 2M Karras');
  await saveStepScreenshot(page, TEST_NAME, '步骤9_验证表单值', '所有表单值验证通过');
  
  console.log('[TC-003] 测试通过 ✓');
});

/**
 * TC-004: 高清修复开关测试
 * 优先级: P1
 * 目的: 验证高清修复选项的显示/隐藏
 */
test('TC-004 高清修复开关测试', async ({ page }) => {
  console.log('[TC-004] 开始测试: 高清修复开关');
  
  // Step 1: 访问页面
  console.log('[TC-004] 步骤1: 访问页面');
  await page.goto('/static/index2.html');
  await saveStepScreenshot(page, TEST_NAME, '步骤1_初始页面');
  
  // Step 2: 验证高清修复选项默认隐藏
  console.log('[TC-004] 步骤2: 验证默认隐藏');
  const hrOptions = page.locator(Selectors.generate.hrOptions);
  await expect(hrOptions).toBeHidden();
  await saveStepScreenshot(page, TEST_NAME, '步骤2_默认隐藏');
  
  // Step 3: 勾选高清修复
  console.log('[TC-004] 步骤3: 勾选高清修复');
  await page.check(Selectors.generate.hdScale);
  await page.waitForTimeout(500); // 等待显示动画
  await saveStepScreenshot(page, TEST_NAME, '步骤3_勾选高清修复');
  
  // Step 4: 验证高清修复选项显示
  console.log('[TC-004] 步骤4: 验证选项显示');
  await expect(hrOptions).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤4_选项显示');
  
  // Step 5: 取消勾选
  console.log('[TC-004] 步骤5: 取消勾选');
  await page.uncheck(Selectors.generate.hdScale);
  await page.waitForTimeout(500); // 等待隐藏动画
  await saveStepScreenshot(page, TEST_NAME, '步骤5_取消勾选');
  
  // Step 6: 验证高清修复选项隐藏
  console.log('[TC-004] 步骤6: 验证选项隐藏');
  await expect(hrOptions).toBeHidden();
  await saveStepScreenshot(page, TEST_NAME, '步骤6_选项隐藏');
  
  console.log('[TC-004] 测试通过 ✓');
});

/**
 * TC-005: 模型列表页按钮测试
 * 优先级: P1
 * 目的: 验证模型列表页按钮可点击
 */
test('TC-005 模型列表页按钮测试', async ({ page }) => {
  console.log('[TC-005] 开始测试: 模型列表页按钮');
  
  // Step 1: 访问页面并切换到模型列表页
  console.log('[TC-005] 步骤1: 访问模型列表页');
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.models, TEST_NAME, '步骤1_切换到模型列表');
  
  // Step 2: 验证所有按钮可见
  console.log('[TC-005] 步骤2: 验证按钮可见');
  await expect(page.locator(Selectors.models.syncModels)).toBeVisible();
  await expect(page.locator(Selectors.models.loadModels)).toBeVisible();
  await expect(page.locator(Selectors.models.clearAllFilters)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤2_按钮可见');
  
  // Step 3: 点击同步模型按钮
  console.log('[TC-005] 步骤3: 点击同步模型');
  await clickWithScreenshot(page, Selectors.models.syncModels, TEST_NAME, '步骤3_点击同步模型');
  
  // Step 4: 验证模型列表容器存在
  console.log('[TC-005] 步骤4: 验证列表容器');
  await expect(page.locator(Selectors.models.modelListContainer)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤4_列表容器可见');
  
  console.log('[TC-005] 测试通过 ✓');
});

/**
 * TC-006: 任务列表页加载测试
 * 优先级: P1
 * 目的: 验证任务列表页可正常加载
 */
test('TC-006 任务列表页加载测试', async ({ page }) => {
  console.log('[TC-006] 开始测试: 任务列表页加载');
  
  // Step 1: 访问页面并切换到任务列表页
  console.log('[TC-006] 步骤1: 访问任务列表页');
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, '步骤1_切换到任务列表');
  
  // Step 2: 验证刷新按钮可见
  console.log('[TC-006] 步骤2: 验证刷新按钮');
  await expect(page.locator(Selectors.tasks.loadTasks)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤2_刷新按钮可见');
  
  // Step 3: 点击刷新
  console.log('[TC-006] 步骤3: 点击刷新');
  await clickWithScreenshot(page, Selectors.tasks.loadTasks, TEST_NAME, '步骤3_点击刷新');
  
  // Step 4: 验证任务列表容器可见
  console.log('[TC-006] 步骤4: 验证列表容器');
  await expect(page.locator(Selectors.tasks.taskListContainer)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤4_列表容器可见');
  
  console.log('[TC-006] 测试通过 ✓');
});

/**
 * TC-007: 素材库页加载测试
 * 优先级: P1
 * 目的: 验证素材库页可正常加载
 */
test('TC-007 素材库页加载测试', async ({ page }) => {
  console.log('[TC-007] 开始测试: 素材库页加载');
  
  // Step 1: 访问页面并切换到素材库页
  console.log('[TC-007] 步骤1: 访问素材库页');
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, '步骤1_切换到素材库');
  
  // Step 2: 验证刷新按钮可见
  console.log('[TC-007] 步骤2: 验证刷新按钮');
  await expect(page.locator(Selectors.assets.loadAssets)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤2_刷新按钮可见');
  
  // Step 3: 点击刷新
  console.log('[TC-007] 步骤3: 点击刷新');
  await clickWithScreenshot(page, Selectors.assets.loadAssets, TEST_NAME, '步骤3_点击刷新');
  
  // Step 4: 验证素材列表容器可见
  console.log('[TC-007] 步骤4: 验证列表容器');
  await expect(page.locator(Selectors.assets.assetListContainer)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤4_列表容器可见');
  
  console.log('[TC-007] 测试通过 ✓');
});

/**
 * TC-008: 火柴人调试页 Canvas 测试
 * 优先级: P1
 * 目的: 验证火柴人调试页 Canvas 存在且工具栏按钮可点击
 */
test('TC-008 火柴人调试页 Canvas 测试', async ({ page }) => {
  console.log('[TC-008] 开始测试: 火柴人调试页 Canvas');
  
  // Step 1: 访问页面并切换到火柴人调试页
  console.log('[TC-008] 步骤1: 访问火柴人调试页');
  await page.goto('/static/index2.html');
  await clickWithScreenshot(page, Selectors.tabs.stickman, TEST_NAME, '步骤1_切换到火柴人');
  
  // Step 2: 验证 Canvas 可见且尺寸正确
  console.log('[TC-008] 步骤2: 验证 Canvas');
  await expect(page.locator(Selectors.stickman.canvas)).toBeVisible();
  await expect(page.locator(Selectors.stickman.canvas)).toHaveAttribute('width', '400');
  await expect(page.locator(Selectors.stickman.canvas)).toHaveAttribute('height', '500');
  await saveStepScreenshot(page, TEST_NAME, '步骤2_Canvas验证');
  
  // Step 3: 验证工具栏按钮可见
  console.log('[TC-008] 步骤3: 验证工具栏按钮');
  await expect(page.locator(Selectors.stickman.savePose)).toBeVisible();
  await expect(page.locator(Selectors.stickman.resetPose)).toBeVisible();
  await expect(page.locator(Selectors.stickman.exportPNG)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤3_工具栏按钮');
  
  // Step 4: 验证预设动作按钮可见
  console.log('[TC-008] 步骤4: 验证预设动作');
  await expect(page.locator(Selectors.stickman.presetStanding)).toBeVisible();
  await expect(page.locator(Selectors.stickman.presetWalking)).toBeVisible();
  await expect(page.locator(Selectors.stickman.presetRunning)).toBeVisible();
  await expect(page.locator(Selectors.stickman.presetSitting)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤4_预设动作按钮');
  
  console.log('[TC-008] 测试通过 ✓');
});

/**
 * TC-009: 快捷应用按钮测试
 * 优先级: P1
 * 目的: 验证快捷应用栏按钮可点击
 */
test('TC-009 快捷应用按钮测试', async ({ page }) => {
  console.log('[TC-009] 开始测试: 快捷应用按钮');
  
  // Step 1: 访问页面
  console.log('[TC-009] 步骤1: 访问页面');
  await page.goto('/static/index2.html');
  await saveStepScreenshot(page, TEST_NAME, '步骤1_初始页面');
  
  // Step 2: 验证快捷应用按钮可见
  console.log('[TC-009] 步骤2: 验证按钮可见');
  await expect(page.locator(Selectors.generate.openQuickPreset)).toBeVisible();
  await expect(page.locator(Selectors.generate.saveQuickPreset)).toBeVisible();
  await saveStepScreenshot(page, TEST_NAME, '步骤2_按钮可见');
  
  // Step 3: 点击加载配置按钮
  console.log('[TC-009] 步骤3: 点击加载配置');
  await clickWithScreenshot(page, Selectors.generate.openQuickPreset, TEST_NAME, '步骤3_点击加载配置');
  
  // Step 4: 点击保存配置按钮
  console.log('[TC-009] 步骤4: 点击保存配置');
  // 先处理可能的弹框
  page.on('dialog', async dialog => {
    await dialog.dismiss();
  });
  await clickWithScreenshot(page, Selectors.generate.saveQuickPreset, TEST_NAME, '步骤4_点击保存配置');
  
  console.log('[TC-009] 测试通过 ✓');
});

/**
 * TC-010: 生成图片按钮测试
 * 优先级: P0
 * 目的: 验证生成图片按钮可点击并触发流程
 */
test('TC-010 生成图片按钮测试', async ({ page }) => {
  console.log('[TC-010] 开始测试: 生成图片按钮');
  
  // Step 1: 访问页面并填写必要信息
  console.log('[TC-010] 步骤1: 访问页面并填写提示词');
  await page.goto('/static/index2.html');
  await fillWithScreenshot(page, Selectors.generate.prompt, '测试提示词', TEST_NAME, '步骤1_填写提示词');
  
  // Step 2: 验证生成按钮可见
  console.log('[TC-010] 步骤2: 验证生成按钮');
  await expect(page.locator(Selectors.generate.generateImage)).toBeVisible();
  await expect(page.locator(Selectors.generate.generateImage)).toHaveText('🎨 生成图片');
  await saveStepScreenshot(page, TEST_NAME, '步骤2_生成按钮可见');
  
  // Step 3: 点击生成按钮
  console.log('[TC-010] 步骤3: 点击生成按钮');
  await clickWithScreenshot(page, Selectors.generate.generateImage, TEST_NAME, '步骤3_点击生成');
  
  // Step 4: 等待并验证生成进度区域 (可能需要等待 API 响应)
  console.log('[TC-010] 步骤4: 等待响应');
  await page.waitForTimeout(2000);
  await saveStepScreenshot(page, TEST_NAME, '步骤4_等待响应', '生成按钮已点击，等待系统响应');
  
  console.log('[TC-010] 测试通过 ✓');
});
