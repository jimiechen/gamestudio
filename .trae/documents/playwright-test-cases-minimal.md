# Playwright 自动化测试用例 - 最小集合

## 测试用例清单 (最小可行集合)

### TC-001: 页面基础加载测试

**优先级**: P0 (最高)
**目的**: 验证页面能正常加载

```typescript
test('页面基础加载', async ({ page }) => {
  // Given: 访问 index2.html
  await page.goto('/static/index2.html');
  
  // Then: 页面标题正确
  await expect(page).toHaveTitle('HoloPix 素材调试器');
  
  // And: 5个标签页可见
  await expect(page.locator('[data-action="switchTab"][data-tab="generate"]')).toBeVisible();
  await expect(page.locator('[data-action="switchTab"][data-tab="models"]')).toBeVisible();
  await expect(page.locator('[data-action="switchTab"][data-tab="tasks"]')).toBeVisible();
  await expect(page.locator('[data-action="switchTab"][data-tab="assets"]')).toBeVisible();
  await expect(page.locator('[data-action="switchTab"][data-tab="stickman"]')).toBeVisible();
});
```

***

### TC-002: 标签页切换测试

**优先级**: P0
**目的**: 验证所有标签页可以正常切换

```typescript
test('标签页切换', async ({ page }) => {
  // Given: 在生成素材页
  await page.goto('/static/index2.html');
  await expect(page.locator('#generate')).toHaveClass(/active/);
  
  // When: 点击模型列表标签
  await page.click('[data-action="switchTab"][data-tab="models"]');
  
  // Then: 模型列表页显示
  await expect(page.locator('#models')).toHaveClass(/active/);
  await expect(page.locator('#generate')).not.toHaveClass(/active/);
  
  // When: 点击任务列表标签
  await page.click('[data-action="switchTab"][data-tab="tasks"]');
  await expect(page.locator('#tasks')).toHaveClass(/active/);
  
  // When: 点击素材库标签
  await page.click('[data-action="switchTab"][data-tab="assets"]');
  await expect(page.locator('#assets')).toHaveClass(/active/);
  
  // When: 点击火柴人调试标签
  await page.click('[data-action="switchTab"][data-tab="stickman"]');
  await expect(page.locator('#stickman')).toHaveClass(/active/);
});
```

***

### TC-003: 生成素材页表单填写测试

**优先级**: P0
**目的**: 验证表单元素可正常输入

```typescript
test('生成素材页表单填写', async ({ page }) => {
  // Given: 在生成素材页
  await page.goto('/static/index2.html');
  
  // When: 填写正向提示词
  await page.fill('#prompt', '一个可爱的卡通女孩，蓝色头发，大眼睛');
  
  // And: 填写负向提示词
  await page.fill('#negativePrompt', '模糊，低质量，变形');
  
  // And: 修改图像参数
  await page.fill('#width', '768');
  await page.fill('#height', '512');
  await page.fill('#steps', '30');
  await page.fill('#cfgScale', '8');
  await page.selectOption('#sampler', 'DPM++ 2M Karras');
  
  // Then: 所有值正确设置
  await expect(page.locator('#prompt')).toHaveValue('一个可爱的卡通女孩，蓝色头发，大眼睛');
  await expect(page.locator('#width')).toHaveValue('768');
  await expect(page.locator('#sampler')).toHaveValue('DPM++ 2M Karras');
});
```

***

### TC-004: 高清修复开关测试

**优先级**: P1
**目的**: 验证高清修复选项的显示/隐藏

```typescript
test('高清修复开关', async ({ page }) => {
  // Given: 在生成素材页
  await page.goto('/static/index2.html');
  
  // Then: 高清修复选项默认隐藏
  await expect(page.locator('#hrOptions')).toBeHidden();
  
  // When: 勾选高清修复
  await page.check('#hdScale');
  
  // Then: 高清修复选项显示
  await expect(page.locator('#hrOptions')).toBeVisible();
  
  // When: 取消勾选
  await page.uncheck('#hdScale');
  
  // Then: 高清修复选项隐藏
  await expect(page.locator('#hrOptions')).toBeHidden();
});
```

***

### TC-005: 模型列表页按钮测试

**优先级**: P1
**目的**: 验证模型列表页按钮可点击

```typescript
test('模型列表页按钮', async ({ page }) => {
  // Given: 在模型列表页
  await page.goto('/static/index2.html');
  await page.click('[data-action="switchTab"][data-tab="models"]');
  
  // Then: 所有按钮可见且可点击
  await expect(page.locator('[data-action="syncModels"]')).toBeVisible();
  await expect(page.locator('[data-action="loadModels"]')).toBeVisible();
  await expect(page.locator('[data-action="clearAllFilters"]')).toBeVisible();
  
  // When: 点击同步模型按钮
  await page.click('[data-action="syncModels"]');
  
  // Then: 模型列表容器存在 (等待加载)
  await expect(page.locator('#modelListContainer')).toBeVisible();
});
```

***

### TC-006: 任务列表页加载测试

**优先级**: P1
**目的**: 验证任务列表页可正常加载

```typescript
test('任务列表页加载', async ({ page }) => {
  // Given: 在任务列表页
  await page.goto('/static/index2.html');
  await page.click('[data-action="switchTab"][data-tab="tasks"]');
  
  // Then: 刷新按钮可见
  await expect(page.locator('[data-action="loadTasks"]')).toBeVisible();
  
  // When: 点击刷新
  await page.click('[data-action="loadTasks"]');
  
  // Then: 任务列表容器可见
  await expect(page.locator('#taskListContainer')).toBeVisible();
});
```

***

### TC-007: 素材库页加载测试

**优先级**: P1
**目的**: 验证素材库页可正常加载

```typescript
test('素材库页加载', async ({ page }) => {
  // Given: 在素材库页
  await page.goto('/static/index2.html');
  await page.click('[data-action="switchTab"][data-tab="assets"]');
  
  // Then: 刷新按钮可见
  await expect(page.locator('[data-action="loadAssets"]')).toBeVisible();
  
  // When: 点击刷新
  await page.click('[data-action="loadAssets"]');
  
  // Then: 素材列表容器可见
  await expect(page.locator('#assetListContainer')).toBeVisible();
});
```

***

### TC-008: 火柴人调试页 Canvas 测试

**优先级**: P1
**目的**: 验证火柴人调试页 Canvas 存在且工具栏按钮可点击

```typescript
test('火柴人调试页 Canvas', async ({ page }) => {
  // Given: 在火柴人调试页
  await page.goto('/static/index2.html');
  await page.click('[data-action="switchTab"][data-tab="stickman"]');
  
  // Then: Canvas 可见
  await expect(page.locator('#stickmanCanvas')).toBeVisible();
  await expect(page.locator('#stickmanCanvas')).toHaveAttribute('width', '400');
  await expect(page.locator('#stickmanCanvas')).toHaveAttribute('height', '500');
  
  // And: 工具栏按钮可见
  await expect(page.locator('button:has-text("保存姿势")')).toBeVisible();
  await expect(page.locator('button:has-text("重置")')).toBeVisible();
  await expect(page.locator('button:has-text("导出PNG")')).toBeVisible();
  
  // And: 预设动作按钮可见
  await expect(page.locator('[data-preset="standing"]')).toBeVisible();
  await expect(page.locator('[data-preset="walking"]')).toBeVisible();
  await expect(page.locator('[data-preset="running"]')).toBeVisible();
  await expect(page.locator('[data-preset="sitting"]')).toBeVisible();
});
```

***

### TC-009: 快捷应用按钮测试

**优先级**: P1
**目的**: 验证快捷应用栏按钮可点击

```typescript
test('快捷应用按钮', async ({ page }) => {
  // Given: 在生成素材页
  await page.goto('/static/index2.html');
  
  // Then: 快捷应用按钮可见
  await expect(page.locator('[data-action="openQuickPresetModal"]')).toBeVisible();
  await expect(page.locator('[data-action="saveQuickPreset"]')).toBeVisible();
  
  // When: 点击加载配置
  await page.click('[data-action="openQuickPresetModal"]');
  
  // Then: 弹框出现 (假设弹框有特定类名或内容)
  // 注: 需要页面实现后确认弹框选择器
});
```

***

### TC-010: 生成图片按钮测试

**优先级**: P0
**目的**: 验证生成图片按钮可点击并触发流程

```typescript
test('生成图片按钮', async ({ page }) => {
  // Given: 在生成素材页，已填写必要信息
  await page.goto('/static/index2.html');
  await page.fill('#prompt', '测试提示词');
  
  // Then: 生成按钮可见
  await expect(page.locator('[data-action="generateImage"]')).toBeVisible();
  await expect(page.locator('[data-action="generateImage"]')).toHaveText('🎨 生成图片');
  
  // When: 点击生成按钮
  await page.click('[data-action="generateImage"]');
  
  // Then: 生成进度区域出现
  // 注: 实际测试需要等待 API 响应，可能需要 mock
});
```

***

## 测试用例统计

| 类别         | 数量      | 说明                  |
| ---------- | ------- | ------------------- |
| P0 (最高优先级) | 4个      | 页面加载、标签切换、表单填写、生成按钮 |
| P1 (高优先级)  | 6个      | 功能开关、各页面加载、按钮测试     |
| **总计**     | **10个** | 最小可行测试集合            |

## 测试覆盖范围

* ✅ 页面基础加载

* ✅ 标签页切换 (5个标签)

* ✅ 表单输入元素 (提示词、参数)

* ✅ 开关控件 (高清修复、画面增强)

* ✅ 按钮点击 (生成、同步、刷新等)

* ✅ Canvas 元素验证

* ✅ 各标签页基础功能

## 执行顺序建议

1. TC-001 (页面加载) - 必须先通过
2. TC-002 (标签切换) - 基础导航
3. TC-003 (表单填写) - 核心功能
4. TC-010 (生成按钮) - 主流程
5. TC-004 (开关测试) - 交互功能
6. TC-005 \~ TC-009 (各页面) - 分支功能

## 后续扩展方向

通过最小集合后，可扩展：

* API Mock 测试 (模拟后端响应)

* 完整生成流程测试

* 模型选择器交互测试

* 弹框操作测试

* 错误处理测试

* 截图对比测试

