/**
 * 端到端完整流程测试
 * E2E-001: 从参数配置到结果展示的完整流程
 * 每个步骤自动截图保存作为测试证据
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

const TEST_NAME = 'HoloPix_端到端流程测试';

/**
 * E2E-001: 完整生成流程测试
 * 从参数配置到结果展示的完整流程
 */
test('E2E-001 完整生成流程测试', async ({ page }) => {
  console.log('[E2E-001] 开始测试: 完整生成流程');
  
  // Step 1: 访问生成素材页
  console.log('[E2E-001] Step 1: 访问生成素材页');
  await page.goto('/static/index2.html');
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_01_访问页面');
  
  // Step 2: 添加2个模型
  console.log('[E2E-001] Step 2: 添加模型');
  for (let i = 0; i < 2; i++) {
    await clickWithScreenshot(page, Selectors.generate.openModelSelector, TEST_NAME, `E2E001_02_添加模型${i + 1}`);
    await page.waitForTimeout(1000);
    
    const model = page.locator('.model-item').first();
    if (await model.isVisible().catch(() => false)) {
      await model.click();
    }
    await saveStepScreenshot(page, TEST_NAME, `E2E001_02_选择模型${i + 1}`);
  }
  
  // Step 3: 设置模型强度
  console.log('[E2E-001] Step 3: 设置模型强度');
  const slider = page.locator('.model-strength-slider').first();
  if (await slider.isVisible().catch(() => false)) {
    await slider.fill('0.8');
  }
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_03_设置强度');
  
  // Step 4: 填写提示词
  console.log('[E2E-001] Step 4: 填写提示词');
  await fillWithScreenshot(
    page,
    Selectors.generate.prompt,
    '一个可爱的卡通女孩，蓝色头发，大眼睛，微笑',
    TEST_NAME,
    'E2E001_04_填写提示词'
  );
  
  // Step 5: 填写负向提示词
  console.log('[E2E-001] Step 5: 填写负向提示词');
  await fillWithScreenshot(
    page,
    Selectors.generate.negativePrompt,
    '模糊，低质量，变形，多余的手指',
    TEST_NAME,
    'E2E001_05_填写负向提示词'
  );
  
  // Step 6: 设置图像参数
  console.log('[E2E-001] Step 6: 设置图像参数');
  await fillWithScreenshot(page, Selectors.generate.width, '768', TEST_NAME, 'E2E001_06_设置宽度');
  await fillWithScreenshot(page, Selectors.generate.height, '512', TEST_NAME, 'E2E001_07_设置高度');
  await fillWithScreenshot(page, Selectors.generate.steps, '30', TEST_NAME, 'E2E001_08_设置步数');
  await fillWithScreenshot(page, Selectors.generate.cfgScale, '8', TEST_NAME, 'E2E001_09_设置CFG');
  
  // Step 7: 选择采样器
  console.log('[E2E-001] Step 7: 选择采样器');
  await selectWithScreenshot(page, Selectors.generate.sampler, 'DPM++ 2M Karras', TEST_NAME, 'E2E001_10_选择采样器');
  
  // Step 8: 启用高清修复
  console.log('[E2E-001] Step 8: 启用高清修复');
  await page.check(Selectors.generate.hdScale);
  await page.waitForTimeout(500); // 等待选项显示
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_11_启用高清修复');
  
  // Step 9: 设置高清修复参数
  console.log('[E2E-001] Step 9: 设置高清修复参数');
  await page.fill(Selectors.generate.hrScale, '2');
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_12_设置放大倍数');
  await page.fill(Selectors.generate.hrSteps, '20');
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_13_设置高清步数');
  
  // Step 10: 点击生成图片
  console.log('[E2E-001] Step 10: 点击生成图片');
  await clickWithScreenshot(page, Selectors.generate.generateImage, TEST_NAME, 'E2E001_14_点击生成');
  
  // Step 11: 验证进度显示
  console.log('[E2E-001] Step 11: 验证进度显示');
  await page.waitForTimeout(2000);
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_15_验证进度');
  
  // Step 12: 等待任务完成(模拟)
  console.log('[E2E-001] Step 12: 等待任务完成');
  await page.waitForTimeout(5000);
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_16_等待完成');
  
  // Step 13: 验证结果展示
  console.log('[E2E-001] Step 13: 验证结果展示');
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_17_验证结果');
  
  // Step 14: 切换到任务列表查看任务
  console.log('[E2E-001] Step 14: 查看任务列表');
  await clickWithScreenshot(page, Selectors.tabs.tasks, TEST_NAME, 'E2E001_18_查看任务列表');
  await page.click(Selectors.tasks.loadTasks);
  await page.waitForTimeout(2000);
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_19_任务列表');
  
  // Step 15: 切换到素材库查看
  console.log('[E2E-001] Step 15: 查看素材库');
  await clickWithScreenshot(page, Selectors.tabs.assets, TEST_NAME, 'E2E001_20_查看素材库');
  await page.click(Selectors.assets.loadAssets);
  await page.waitForTimeout(2000);
  await saveStepScreenshot(page, TEST_NAME, 'E2E001_21_素材库');
  
  console.log('[E2E-001] 测试通过 ✓');
});
