import { test, expect } from '@playwright/test';

test.describe('文生图完整功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
  });

  test('表单元素存在且可填写', async ({ page }) => {
    // 验证所有表单元素存在
    await expect(page.locator('#prompt')).toBeVisible();
    await expect(page.locator('#negativePrompt')).toBeVisible();
    await expect(page.locator('#seed')).toBeVisible();
    await expect(page.locator('#batchSize')).toBeVisible();
    await expect(page.locator('#aspectRatios')).toBeVisible();
    await expect(page.locator('#imageGuidanceWeights')).toBeVisible();
    
    // 填写表单
    await page.fill('#prompt', '测试提示词');
    await page.fill('#negativePrompt', '测试反向提示词');
    await page.fill('#seed', '12345');
    await page.fill('#batchSize', '2');
    await page.selectOption('#aspectRatios', '16:9');
    await page.fill('#imageGuidanceWeights', '8');
    
    // 验证值
    await expect(page.locator('#prompt')).toHaveValue('测试提示词');
    await expect(page.locator('#seed')).toHaveValue('12345');
    await expect(page.locator('#aspectRatios')).toHaveValue('16:9');
    await expect(page.locator('#imageGuidanceWeights')).toHaveValue('8');
  });

  test('高清修复开关工作正常', async ({ page }) => {
    // 默认隐藏
    await expect(page.locator('#hdScaleContainer')).toBeHidden();
    
    // 勾选高清修复
    await page.check('#hdFix');
    await expect(page.locator('#hdScaleContainer')).toBeVisible();
    
    // 验证高清倍数选项
    await page.selectOption('#hdScale', '2');
    await expect(page.locator('#hdScale')).toHaveValue('2');
    
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
    
    // 设置增强强度
    await page.fill('#perturb', '3.5');
    await expect(page.locator('#perturb')).toHaveValue('3.5');
    
    // 取消勾选
    await page.uncheck('#enablePerturb');
    await expect(page.locator('#perturbContainer')).toBeHidden();
  });

  test('参考图片功能元素存在', async ({ page }) => {
    // 验证形象样式参考元素
    await expect(page.locator('#imageReference')).toBeVisible();
    await expect(page.locator('#referenceMode')).toBeVisible();
    await expect(page.locator('#referenceWeight')).toBeVisible();
    
    // 验证火柴人姿势参考元素
    await expect(page.locator('#characterPose')).toBeVisible();
    await expect(page.locator('[data-action="openPoseSelector"]')).toBeVisible();
  });

  test('预设模型组合按钮存在', async ({ page }) => {
    await expect(page.locator('#presetModelComboButtons')).toBeVisible();
    
    // 验证至少有一个预设按钮
    const buttons = page.locator('#presetModelComboButtons button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('生成历史区域存在', async ({ page }) => {
    await expect(page.locator('#historyList')).toBeVisible();
  });

  test('结果展示区域初始隐藏', async ({ page }) => {
    await expect(page.locator('#generationResults')).toBeHidden();
  });
});
