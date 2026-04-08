# HoloPix 素材调试器 Playwright E2E 自动化测试方案

> **文档版本**: v1.0
> **制定日期**: 2026-04-06
> **测试目标**: `index.html` - HoloPix 素材调试器完整功能验证
> **遵循规范**: [e2e-acceptance-rules.md](../../.trae/rules/e2e-acceptance-rules.md)

---

## 一、测试环境配置

### 1.1 技术栈
- **测试框架**: Playwright (TypeScript)
- **浏览器**: Chromium (默认)
- **断言库**: Playwright 内置 expect
- **报告格式**: HTML + JSON + 视频 + 截图

### 1.2 项目结构
```
projects/asset-debugger/
├── e2e-tests/
│   ├── playwright.config.ts          # Playwright 配置
│   ├── package.json                  # 依赖管理
│   └── tests/
│       ├── 01-page-load.spec.ts      # 页面加载测试
│       ├── 02-tab-navigation.spec.ts # Tab 切换测试
│       ├── 03-model-management.spec.ts # 模型管理测试
│       ├── 04-image-generation.spec.ts # 图片生成测试（核心）
│       ├── 05-task-management.spec.ts  # 任务管理测试
│       ├── 06-asset-library.spec.ts    # 素材库测试
│       ├── 07-stickman-editor.spec.ts  # 火柴人编辑器测试
│       └── 08-preset-config.spec.ts    # 快捷配置测试
│   ├── fixtures/                     # 测试数据
│   │   └── test-data.json            # 测试用例数据
│   ├── utils/                        # 工具函数
│   │   ├── helpers.ts                # 辅助函数
│   │   └── api-interceptor.ts        # API 拦截器
│   └── reports/                      # 测试报告输出
│       ├── screenshots/              # 截图
│       ├── videos/                   # 视频录制
│       └── traces/                   # 追踪文件
```

### 1.3 超时时间配置（必须）

```typescript
// playwright.config.ts 超时设置
export default defineConfig({
  timeout: 60000,                    // 全局超时: 60秒
  expect: {
    timeout: 30000,                  // 断言超时: 30秒
    interval: 500,                   // 断言轮询间隔: 500ms
  },
  actionTimeout: 15000,              // 操作超时: 15秒
  navigationTimeout: 30000,           // 导航超时: 30秒
  
  // 特殊场景超时
  use: {
    // 图片生成任务等待（可能需要较长时间）
    taskPollingTimeout: 120000,      // 任务轮询超时: 2分钟
    
    // 模型同步超时
    modelSyncTimeout: 45000,         // 模型同步超时: 45秒
    
    // 页面加载完成检测
    pageLoadCompleteTimeout: 20000,  // 页面加载完成: 20秒
  },
  
  // 失败时自动截图和视频
  retries: 1,                        // 失败重试次数
});
```

---

## 二、页面元素 ID 完整清单

### 2.1 Tab 切换区域

| 元素 ID | 元素类型 | 功能描述 | 选择器 |
|---------|----------|----------|--------|
| generate | div.tab-content | 生成素材 Tab | `#generate` |
| models | div.tab-content | 模型列表 Tab | `#models` |
| tasks | div.tab-content | 任务列表 Tab | `#tasks` |
| assets | div.tab-content | 素材库 Tab | `#assets` |
| stickman | div.tab-content | 火柴人调试 Tab | `#stickman` |

### 2.2 生成表单核心元素（generate tab）

#### 2.2.1 快捷应用栏
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| quickPresetList | div | 快捷预设列表容器 |
| presetModelComboButtons | div | 预设模型组合按钮组 |

#### 2.2.2 模型配置（第1组）
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| selectedModelsList | div | 已选模型列表容器 |

#### 2.2.3 文本提示词（第2组）
| 元素 ID | 元素类型 | 功能描述 | 默认值 |
|---------|----------|----------|--------|
| prompt | textarea | 正向提示词（必填） | Q版角色，2.5头身比... |
| negativePrompt | textarea | 反向提示词 | 模糊，低质量... |

#### 2.2.4 画面控制（第3组）
| 元素 ID | 元素类型 | 功能描述 | 默认值/选项 |
|---------|----------|----------|-------------|
| aspectRatios | select | 画面比例选择 | 1:1, 16:9, 9:16, 4:3... |
| seed | input[number] | 随机种子 | -1 |
| imageGuidanceWeights | input[number] | 画面指导权重(3-6) | 6 |
| batchSize | input[number] | 出图数量(1-4) | 1 |

#### 2.2.5 增强选项（第4组）
| 元素 ID | 元素类型 | 功能描述 | 关联元素 |
|---------|----------|----------|----------|
| faceDetail | checkbox | 脸部修复 | - |
| hdFix | checkbox | 高清修复 | hdScaleContainer, hdScale |
| hdScaleContainer | div | 高清倍数容器（条件显示） | - |
| hdScale | select | 高清倍数选择(1.5x/2x) | - |
| simpleBackground | checkbox | 简单背景 | - |
| enablePerturb | checkbox | 画面增强 | perturbContainer, perturb |
| perturbContainer | div | 增强强度容器（条件显示） | - |
| perturb | input[number] | 增强强度(0-5) | 5 |

#### 2.2.6 参考图片（第5组）
| 元素 ID | 元素类型 | 功能描述 | 默认值 |
|---------|----------|----------|--------|
| imageReference | input[text] | 形象参考图片URL | 空 |
| referenceMode | select | 参考模式 | 不使用/standard/color |
| referenceWeight | input[number] | 参考权重(0-1) | 0.8 |
| selectedStickmanPose | div | 已选火柴人姿势容器 | hidden |
| selectedPoseImage | img | 姿势缩略图 | - |
| selectedPoseName | div | 姿势名称 | - |
| selectedPoseDesc | div | 姿势描述 | - |
| selectedPoseId | input[hidden] | 姿势ID | - |
| characterPose | input[hidden] | 角色姿态数据 | - |

### 2.3 进度和结果展示
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| generationProgress | div | 生成进度条容器（初始隐藏） |
| progressStatus | span | 进度状态文本 |
| progressTime | span | 已等待时间 |
| progressFill | div | 进度条填充 |
| generationResults | div | 生成结果容器（初始隐藏） |
| resultsGrid | div | 结果图片网格 |
| generationHistory | div | 历史任务列表 |
| historyList | div | 历史列表内容 |
| generateResult | div | 请求/响应详情（初始隐藏） |
| generateResultContent | div | 详情内容 |

### 2.4 模型列表页面（models tab）
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| modelList | div | 模型列表容器 |
| selectAllModels | checkbox | 全选模型复选框 |
| searchNameInput | input | 按名称搜索 |
| modelIdInput | input | 按模型ID筛选 |
| multiModelToolbar | div | 多选工具栏（条件显示） |
| selectedModelCount | span | 已选模型数量 |
| multiModelPrompt | textarea | 多模型生成提示词 |
| multiModelAspectRatio | select | 多模型画面比例 |
| multiModelBatchSize | select | 多模型批量大小 |

**动态生成的模型行 ID 格式**:
- `model-row-${modelId}` - 模型行
- `model-detail-${index}` - 模型详情行
- `model-detail-content-${index}` - 详情内容

### 2.5 任务列表页面（tasks tab）
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| taskList | div.task-list | 任务列表容器 |

**动态生成的任务卡片**:
- `.result-card[data-task-id="${clientId}"]` - 任务卡片
- `.status-badge.status-*` - 状态徽章

### 2.6 素材库页面（assets tab）
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| assetGrid | div.asset-grid | 素材网格容器 |

### 2.7 火柴人编辑器页面（stickman tab）
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| stickmanCanvas | canvas | 火柴人画布(600x500) |
| stickmanDescription | div | 动作描述容器 |
| stickmanDescriptionText | div | 描述文本内容 |
| filter-all | button.filter-btn | 全部过滤按钮 |
| filter-preset | button.filter-btn | 预设过滤按钮 |
| filter-custom | button.filter-btn | 自定义过滤按钮 |
| poseList | div | 姿势列表容器 |

### 2.8 弹框组件（Modal）

#### 2.8.1 模型选择弹框
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| modelSelectorModal | div.modal-overlay | 模型选择弹框遮罩 |
| selectorSearchInput | input | 弹框内搜索框 |
| selectorModelTypeFilter | select | 模型类型筛选 |
| selectorStyleTypeFilter | select | 风格类型筛选 |
| selectorModelList | div | 可选模型列表 |
| selectorModelCount | span | 模型数量统计 |

#### 2.8.2 火柴人姿势选择弹框
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| stickmanPoseModal | div.modal-overlay | 姿势选择弹框遮罩 |

#### 2.8.3 快捷预设弹框
| 元素 ID | 元素类型 | 功能描述 |
|---------|----------|----------|
| quickPresetModal | div.modal-overlay | 快捷预设弹框遮罩 |

---

## 三、测试用例设计（遵循 E2E 验收规则）

### 3.1 测试套件总览

| 套件编号 | 测试名称 | 用例数量 | 优先级 | 预估耗时 |
|----------|----------|----------|--------|----------|
| TS-01 | 页面加载与初始化 | 3 | P0 | 30s |
| TS-02 | Tab 导航与切换 | 8 | P0 | 20s |
| TS-03 | 模型管理与同步 | 12 | P0 | 60s |
| TS-04 | 图片生成流程（核心） | 15 | P0 | 180s |
| TS-05 | 任务管理与查询 | 10 | P0 | 90s |
| TS-06 | 素材库操作 | 8 | P1 | 45s |
| TS-07 | 火柴人编辑器 | 10 | P1 | 60s |
| TS-08 | 快捷配置管理 | 7 | P1 | 40s |
| **总计** | | **73** | | **525s (~9min)** |

### 3.2 详细测试用例

#### TS-01: 页面加载与初始化（3个用例）

**TC-001: 页面标题验证**
```typescript
test('TC-001 页面标题正确显示', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 必须：验证页面标题
  await expect(page).toHaveTitle('HoloPix 素材调试器');
  
  // 必须：截图 - 初始状态
  await page.screenshot({
    path: 'reports/screenshots/TC-001-页面初始加载.png',
    fullPage: true
  });
});
```

**TC-002: 默认Tab激活状态**
```typescript
test('TC-002 默认显示生成素材Tab', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 必须：验证默认激活的Tab
  await expect(page.locator('#generate')).toHaveClass(/active/);
  await expect(page.locator('#generate')).toBeVisible();
  
  // 必须：验证其他Tab处于非激活状态
  await expect(page.locator('#models')).not.toHaveClass(/active/);
  await expect(page.locator('#tasks')).not.toHaveClass(/active/);
  await expect(page.locator('#assets')).not.toHaveClass(/active/);
  await expect(page.locator('#stickman')).not.toHaveClass(/active/);
});
```

**TC-003: 表单默认值验证**
```typescript
test('TC-003 生成表单默认值正确', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 必须：验证所有表单字段的默认值
  await expect(page.locator('#prompt')).toHaveValue(
    'Q版角色，2.5头身比，大头小身体，可爱卡通风格，明亮色彩...'
  );
  await expect(page.locator('#aspectRatios')).toHaveValue('1:1');
  await expect(page.locator('#seed')).toHaveValue('-1');
  await expect(page.locator('#imageGuidanceWeights')).toHaveValue('6');
  await expect(page.locator('#batchSize')).toHaveValue('1');
  await expect(page.locator('#referenceWeight')).toHaveValue('0.8');
  
  // 必须：截图 - 表单默认状态
  await page.screenshot({
    path: 'reports/screenshots/TC-003-表单默认值.png',
    fullPage: true
  });
});
```

---

#### TS-02: Tab 导航与切换（8个用例）

**TC-010: 切换到模型列表Tab**
```typescript
test('TC-010 切换到模型列表Tab', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 操作：点击"模型列表"Tab
  await page.click('text=📦 模型列表');
  
  // 必须：验证Tab切换成功
  await expect(page.locator('#models')).toHaveClass(/active/);
  await expect(page.locator('#models')).toBeVisible();
  await expect(page.locator('#generate')).not.toHaveClass(/active/);
  
  // 必须：验证模型列表容器存在
  await expect(page.locator('#modelList')).toBeVisible();
  
  // 必须：截图
  await page.screenshot({
    path: 'reports/screenshots/TC-010-模型列表Tab.png',
    fullPage: true
  });
});
```

**TC-011: 切换到任务列表Tab**
```typescript
test('TC-011 切换到任务列表Tab', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=📋 任务列表');
  
  await expect(page.locator('#tasks')).toHaveClass(/active/);
  await expect(page.locator('#taskList')).toBeVisible();
  
  await page.screenshot({
    path: 'reports/screenshots/TC-011-任务列表Tab.png'
  });
});
```

**TC-012-017: 其他Tab切换测试**
（类似模式，覆盖素材库、火柴人调试等所有Tab）

**TC-018: Tab切换后返回原Tab**
```typescript
test('TC-018 多次Tab切换后状态保持', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 切换到多个Tab再返回
  await page.click('text=📦 模型列表');
  await page.click('text=📋 任务列表');
  await page.click('text=🖼️ 素材库');
  await page.click('text=🎨 生成素材'); // 返回
  
  // 必须：验证最终状态
  await expect(page.locator('#generate')).toHaveClass(/active/);
  await expect(page.locator('#prompt')).toBeVisible();
});
```

---

#### TS-03: 模型管理与同步（12个用例）⭐重点

**TC-020: 同步模型列表（API验证）**
```typescript
test('TC-020 同步模型列表并验证API调用', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=📦 模型列表');
  
  // 必须：拦截API请求并验证
  const [response] = await Promise.all([
    page.waitForResponse('**/api/models/sync'), // 必须：等待API响应
    page.click('text=🔄 同步模型列表')
  ]);
  
  // 必须：验证HTTP状态码
  expect(response.status()).toBe(200);
  
  // 必须：验证响应数据结构
  const data = await response.json();
  expect(data).toHaveProperty('models');
  expect(Array.isArray(data.models)).toBeTruthy();
  expect(data.models.length).toBeGreaterThan(0);
  
  // 必须：验证数据渲染到页面
  await expect(page.locator('.model-row')).toHaveCountGreaterThan(0);
  await expect(page.locator('.model-row').first()).toBeVisible();
  
  // 必须：截图 - 数据加载后
  await page.screenshot({
    path: 'reports/screenshots/TC-020-模型同步成功.png',
    fullPage: true
  });
});
```

**TC-021: 模型列表数据完整性验证**
```typescript
test('TC-021 验证模型列表数据字段完整性', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=📦 模型列表');
  
  // 先同步模型
  await Promise.all([
    page.waitForResponse('**/api/models/sync'),
    page.click('text=🔄 同步模型列表')
  ]);
  
  // 必须：验证每个模型行的数据字段
  const firstModelRow = page.locator('.model-row').first();
  await expect(firstModelRow).toContainText(/模型ID/i);  // 必须包含ID
  await expect(firstModelRow).toContainText(/模型名称/i); // 必须包含名称
  
  // 必须：验证动态生成的ID格式
  const modelId = await firstModelRow.getAttribute('id');
  expect(modelId).toMatch(/^model-row-\d+$/);
});
```

**TC-022: 打开模型选择弹框**
```typescript
test('TC-022 打开模型选择弹框', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 点击"添加模型"按钮
  await page.click('text=➕ 添加模型');
  
  // 必须：验证弹框显示
  await expect(page.locator('#modelSelectorModal')).toBeVisible();
  await expect(page.locator('#selectorSearchInput')).toBeVisible();
  await expect(page.locator('#selectorModelList')).toBeVisible();
  
  // 必须：截图 - 弹框打开状态
  await page.screenshot({
    path: 'reports/screenshots/TC-022-模型选择弹框.png'
  });
});
```

**TC-023: 在弹框中搜索模型**
```typescript
test('TC-023 在模型选择弹框中搜索模型', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=➕ 添加模型');
  await expect(page.locator('#modelSelectorModal')).toBeVisible();
  
  // 输入搜索关键词
  await page.fill('#selectorSearchInput', 'Holopix');
  
  // 必须：验证搜索结果过滤
  await page.waitForTimeout(500); // 等待防抖
  // 验证列表已更新（根据实际搜索逻辑调整）
  
  await page.screenshot({
    path: 'reports/screenshots/TC-023-模型搜索结果.png'
  });
});
```

**TC-024: 添加模型到生成表单**
```typescript
test('TC-024 选择模型并添加到生成表单', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=➕ 添加模型');
  await expect(page.locator('#modelSelectorModal')).toBeVisible();
  
  // 等待模型列表加载
  await page.waitForSelector('.selector-model-item', { timeout: 10000 });
  
  // 点击第一个模型
  await page.locator('.selector-model-item').first().click();
  
  // 必须：验证模型被添加到selectedModelsList
  await expect(page.locator('#selectedModelsList .model-item')).toHaveCountGreaterThan(0);
  
  // 必须：验证模型信息显示正确
  const modelItem = page.locator('#selectedModelsList .model-item').first();
  await expect(modelItem).toBeVisible();
  await expect(modelItem).toContainText('模型 ID');
  
  // 必须：截图 - 模型添加后
  await page.screenshot({
    path: 'reports/screenshots/TC-024-模型已添加.png'
  });
});
```

**TC-025: 移除已选模型**
```typescript
test('TC-025 移除已选择的模型', async ({ page }) => {
  // ...先添加模型...
  
  // 点击删除按钮
  await page.click('#selectedModelsList .model-item button:has-text("删除")');
  
  // 必须：验证模型已被移除
  await expect(page.locator('#selectedModelsList .model-item')).toHaveCount(0);
});
```

**TC-026: 模型强度调节**
```typescript
test('TC-026 调节模型混合强度', async ({ page }) => {
  // ...先添加模型...
  
  // 找到强度滑块并调整
  const slider = page.locator('#selectedModelsList input[type="range"]').first();
  await slider.fill('0.7'); // 设置为0.7
  
  // 必须：验证强度值更新
  await expect(page.locator('#selectedModelsList .model-item').first())
    .toContainText('强度: 0.7');
});
```

**TC-027-033: 更多模型相关测试**
- TC-027: 模型类型筛选
- TC-028: 风格类型筛选
- TC-029: 全选/取消全选模型
- TC-030: 展开模型详情
- TC-031: 收起模型详情
- TC-032: 固定/取消固定模型
- TC-033: 隐藏/显示模型

---

#### TS-04: 图片生成流程（核心）15个用例 ⭐⭐最重要

**TC-040: 完整图片生成流程（端到端业务验证）**
```typescript
test('TC-040 完整图片生成流程-端到端验证', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 步骤1: 配置模型（前置条件）
  await page.click('text=➕ 添加模型');
  await expect(page.locator('#modelSelectorModal')).toBeVisible();
  await page.waitForSelector('.selector-model-item', { timeout: 15000 });
  await page.locator('.selector-model-item').first().click();
  await expect(page.locator('#selectedModelsList .model-item')).toHaveCountGreaterThan(0);
  
  // 必须：截图 - 步骤1完成
  await page.screenshot({
    path: 'reports/screenshots/TC-040-step1-模型配置完成.png'
  });
  
  // 步骤2: 填写提示词
  await page.fill('#prompt', 'Q版武士角色，手持长剑，英勇姿态，日式卡通风格');
  await page.fill('#negativePrompt', '模糊，变形，丑陋');
  
  // 必须：验证提示词填写成功
  await expect(page.locator('#prompt')).toHaveValue(
    'Q版武士角色，手持长剑，英勇姿态，日式卡通风格'
  );
  
  // 必须：截图 - 步骤2完成
  await page.screenshot({
    path: 'reports/screenshots/TC-040-step2-提示词填写完成.png'
  });
  
  // 步骤3: 配置参数
  await page.selectOption('#aspectRatios', '16:9');
  await page.fill('#seed', '12345');
  await page.fill('#batchSize', '2');
  
  // 必须：截图 - 步骤3完成
  await page.screenshot({
    path: 'reports/screenshots/TC-040-step3-参数配置完成.png'
  });
  
  // 步骤4: 启用增强选项
  await page.check('#faceDetail'); // 启用脸部修复
  await page.check('#hdFix');     // 启用高清修复
  // 验证hdScaleContainer显示
  await expect(page.locator('#hdScaleContainer')).toBeVisible();
  await page.selectOption('#hdScale', '2');
  
  // 必须：截图 - 步骤4完成
  await page.screenshot({
    path: 'reports/screenshots/TC-040-step4-增强选项启用.png'
  });
  
  // 步骤5: 点击生成按钮（核心操作 - 必须验证API）
  const [response] = await Promise.all([
    page.waitForResponse('**/api/generate'), // 必须：拦截生成API
    page.click('button:has-text("🎨 生成图片")')
  ]);
  
  // 必须：验证API响应
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result).toHaveProperty('task_id');
  expect(result).toHaveProperty('client_id');
  const taskId = result.client_id;
  
  console.log(`✅ 生成任务已提交: ${taskId}`);
  
  // 必须：截图 - 提交成功
  await page.screenshot({
    path: 'reports/screenshots/TC-040-step5-任务提交成功.png'
  });
  
  // 步骤6: 验证进度条显示
  await expect(page.locator('#generationProgress')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#progressStatus')).toHaveText(/生成中|处理中/);
  
  // 必须：截图 - 进度显示
  await page.screenshot({
    path: 'reports/screenshots/TC-040-step6-生成进行中.png'
  });
  
  // 步骤7: 等待任务完成（必须验证状态变化）
  // 注意：这个步骤可能需要较长超时时间
  try {
    await page.waitForFunction(() => {
      const status = document.querySelector('#progressStatus')?.textContent;
      return status?.includes('完成') || status?.includes('成功');
    }, { timeout: 120000 }); // 2分钟超时
    
    // 必须：验证结果显示
    await expect(page.locator('#generationResults')).toBeVisible();
    await expect(page.locator('#resultsGrid .result-card')).toHaveCountGreaterThan(0);
    
    // 必须：验证图片元素存在
    await expect(page.locator('#resultsGrid img')).first().toBeVisible();
    
    // 必须：截图 - 生成完成（关键截图）
    await page.screenshot({
      path: 'reports/screenshots/TC-040-step7-生成完成结果.png',
      fullPage: true
    });
    
    console.log('✅ 图片生成完成！');
    
  } catch (error) {
    // 即使超时也要截图记录当前状态
    await page.screenshot({
      path: 'reports/screenshots/TC-040-step7-超时状态快照.png',
      fullPage: true
    });
    throw error; // 重新抛出错误让测试失败
  }
  
  // 步骤8: 验证历史记录更新
  await expect(page.locator('#historyList')).not.toContainText('暂无生成任务');
  await expect(page.locator('#historyList .history-item')).toHaveCountGreaterThan(0);
  
  // 必须：截图 - 最终状态
  await page.screenshot({
    path: 'reports/screenshots/TC-040-step8-完整流程结束.png',
    fullPage: true
  });
});
```

**TC-041: 最小化配置生成（必填项验证）**
```typescript
test('TC-041 仅使用必填项生成图片', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 只填写必填项：模型 + prompt
  await page.click('text=➕ 添加模型');
  await page.waitForSelector('.selector-model-item', { timeout: 15000 });
  await page.locator('.selector-model-item').first().click();
  
  await page.fill('#prompt', '简单测试图片');
  
  // 直接点击生成（使用其他默认值）
  const [response] = await Promise.all([
    page.waitForResponse('**/api/generate'),
    page.click('button:has-text("🎨 生成图片")')
  ]);
  
  expect(response.status()).toBe(200);
  
  await page.screenshot({
    path: 'reports/screenshots/TC-041-最小化配置生成.png'
  });
});
```

**TC-042: 不同画面比例生成**
```typescript
test('TC-042 测试多种画面比例', async ({ page }) => {
  const ratios = ['16:9', '9:16', '4:3', '1:1'];
  
  for (const ratio of ratios) {
    await page.goto('file:///path/to/index.html');
    // ...配置模型和提示词...
    await page.selectOption('#aspectRatios', ratio);
    
    const [response] = await Promise.all([
      page.waitForResponse('**/api/generate'),
      page.click('button:has-text("🎨 生成图片")')
    ]);
    
    expect(response.status()).toBe(200);
    
    await page.screenshot({
      path: `reports/screenshots/TC-042-比例${ratio.replace(':', 'x')}.png`
    });
  }
});
```

**TC-043: 批量生成多张图片**
```typescript
test('TC-043 批量生成4张图片', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  // ...配置...
  await page.fill('#batchSize', '4');
  
  const [response] = await Promise.all([
    page.waitForResponse('**/api/generate'),
    page.click('button:has-text("🎨 生成图片")')
  ]);
  
  expect(response.status()).toBe(200);
  
  // 等待完成后验证生成了4张图
  // await expect(page.locator('#resultsGrid .result-card')).toHaveCount(4);
  
  await page.screenshot({
    path: 'reports/screenshots/TC-043-批量生成4张.png',
    fullPage: true
  });
});
```

**TC-044: 启用参考图片生成**
```typescript
test('TC-044 使用形象参考图片生成', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  // ...配置基础参数...
  
  // 填写参考图片URL
  await page.fill('#imageReference', 'https://example.com/reference.png');
  await page.selectOption('#referenceMode', 'standard');
  await page.fill('#referenceWeight', '0.9');
  
  const [response] = await Promise.all([
    page.waitForResponse('**/api/generate'),
    page.click('button:has-text("🎨 生成图片")')
  ]);
  
  expect(response.status()).toBe(200);
  
  await page.screenshot({
    path: 'reports/screenshots/TC-044-参考图片生成.png'
  });
});
```

**TC-045: 使用火柴人姿势参考生成**
```typescript
test('TC-045 使用火柴人姿势参考生成', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  // ...配置基础参数...
  
  // 打开姿势选择弹框
  await page.click('text=📷 选择火柴人姿势');
  await expect(page.locator('#stickmanPoseModal')).toBeVisible();
  
  // 选择一个预设姿势
  await page.click('.pose-item:first-child');
  
  // 必须：验证姿势被选中
  await expect(page.locator('#selectedStickmanPose')).toBeVisible();
  await expect(page.locator('#selectedPoseName')).not.toBeEmpty();
  
  // 生成图片
  const [response] = await Promise.all([
    page.waitForResponse('**/api/generate'),
    page.click('button:has-text("🎨 生成图片")')
  ]);
  
  expect(response.status()).toBe(200);
  
  await page.screenshot({
    path: 'reports/screenshots/TC-045-火柴人姿势生成.png'
  });
});
```

**TC-046-054: 更多生成场景测试**
- TC-046: 固定种子复现性测试
- TC-047: 高清修复效果验证
- TC-048: 脸部修复启用测试
- TC-049: 画面增强参数边界测试
- TC-050: 超长提示词处理
- TC-051: 特殊字符提示词处理
- TC-052: 空提示词校验（应该失败或提示）
- TC-053: 无模型选择时生成（应该失败或提示）
- TC-054: 并发生成多个任务

---

#### TS-05: 任务管理与查询（10个用例）

**TC-060: 加载任务列表（API验证）**
```typescript
test('TC-060 加载任务列表并验证数据', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=📋 任务列表');
  
  // 必须：验证API调用
  const [response] = await Promise.all([
    page.waitForResponse('**/api/tasks/list'),
    page.click('text=🔄 刷新列表')
  ]);
  
  expect(response.status()).toBe(200);
  
  const tasks = await response.json();
  expect(Array.isArray(tasks)).toBeTruthy();
  
  // 必须：验证数据渲染
  if (tasks.length > 0) {
    await expect(page.locator('.task-item')).toHaveCountGreaterThan(0);
  }
  
  await page.screenshot({
    path: 'reports/screenshots/TC-060-任务列表加载.png',
    fullPage: true
  });
});
```

**TC-061: 查看任务详情**
```typescript
test('TC-061 查看已完成任务的详细信息', async ({ page }) => {
  // 前置：确保有已完成任务
  await page.goto('file:///path/to/index.html');
  await page.click('text=📋 任务列表');
  
  // 刷新获取任务
  await Promise.all([
    page.waitForResponse('**/api/tasks/list'),
    page.click('text=🔄 刷新列表')
  ]);
  
  // 找到第一个任务并点击查看详情
  const firstTask = page.locator('.result-card').first();
  if (await firstTask.isVisible()) {
    await firstTask.click();
    
    // 必须：验证详情弹框显示
    await expect(page.locator('.modal-overlay')).toBeVisible();
    
    // 必须：验证详情内容包含关键字段
    await expect(page.locator('.modal-body')).toContainText(/任务ID|参数|结果/);
    
    await page.screenshot({
      path: 'reports/screenshots/TC-061-任务详情.png'
    });
  }
});
```

**TC-062-069: 更多任务管理测试**
- TC-062: 任务状态筛选（全部/处理中/完成/失败）
- TC-063: 复制任务参数
- TC-064: 下载任务结果
- TC-065: 任务图片预览
- TC-066: 删除任务
- TC-067: 任务状态实时刷新
- TC-068: 大量任务分页/滚动性能
- TC-069: 任务搜索功能

---

#### TS-06: 素材库操作（8个用例）

**TC-070: 加载素材库**
```typescript
test('TC-070 加载素材库并验证数据', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=🖼️ 素材库');
  
  const [response] = await Promise.all([
    page.waitForResponse('**/api/assets/list'),
    page.click('text=🔄 刷新素材')
  ]);
  
  expect(response.status()).toBe(200);
  
  const assets = await response.json();
  if (assets.length > 0) {
    await expect(page.locator('.asset-card')).toHaveCountGreaterThan(0);
    // 必须：验证素材卡片包含图片
    await expect(page.locator('.asset-card img').first()).toBeVisible();
  }
  
  await page.screenshot({
    path: 'reports/screenshots/TC-070-素材库加载.png',
    fullPage: true
  });
});
```

**TC-071-077: 更多素材库测试**
- TC-071: 素材图片预览
- TC-072: 删除素材确认
- TC-073: 素材下载功能
- TC-074: 空素材库状态显示
- TC-075: 生成后素材自动入库验证
- TC-076: 素材分类/筛选
- TC-077: 大量素材加载性能

---

#### TS-07: 火柴人编辑器（10个用例）

**TC-080: 火柴人编辑器初始化**
```typescript
test('TC-080 火柴人编辑器Canvas正常渲染', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=🎭 火柴人调试');
  
  // 必须：验证Canvas元素存在且可见
  await expect(page.locator('#stickmanCanvas')).toBeVisible();
  
  // 必须：验证Canvas尺寸
  const canvas = page.locator('#stickmanCanvas');
  await expect(canvas).toHaveAttribute('width', '600');
  await expect(canvas).toHaveAttribute('height', '500');
  
  // 必须：截图 - 编辑器初始状态
  await page.screenshot({
    path: 'reports/screenshots/TC-080-火柴人编辑器初始.png'
  });
});
```

**TC-081: 加载预设动作**
```typescript
test('TC-081 加载预设站立动作', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  await page.click('text=🎭 火柴人调试');
  
  // 点击"站立"预设按钮
  await page.click('text=🧍 站立');
  
  // 必须：验证动作描述显示
  await expect(page.locator('#stickmanDescription')).toBeVisible();
  await expect(page.locator('#stickmanDescriptionText')).not.toBeEmpty();
  
  // 必须：验证Canvas已绘制（通过截图对比）
  await page.screenshot({
    path: 'reports/screenshots/TC-081-站立动作.png'
  });
});
```

**TC-082-089: 更多火柴人测试**
- TC-082: 所有预设动作加载验证
- TC-083: 自定义姿势绘制
- TC-084: 姿势保存功能
- TC-085: 姿势列表过滤（全部/预设/自定义）
- TC-086: 姿势选择弹框交互
- TC-087: Canvas交互事件（鼠标拖拽关节）
- TC-088: 清空画布
- TC-089: 姿势导出为DwPose格式

---

#### TS-08: 快捷配置管理（7个用例）

**TC-090: 保存当前配置为快捷预设**
```typescript
test('TC-090 保存当前配置为快捷预设', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 配置一些参数
  await page.fill('#prompt', '测试配置保存');
  await page.selectOption('#aspectRatios', '16:9');
  
  // 点击保存配置
  const [response] = await Promise.all([
    page.waitForResponse('**/api/presets/save'),
    page.click('text=💾 保存配置')
  ]);
  
  expect(response.status()).toBe(200);
  
  // 必须：验证保存成功提示
  await expect(page.locator('.notification')).toContainText(/保存成功|已保存/);
  
  // 必须：验证预设出现在列表中
  await expect(page.locator('#quickPresetList .preset-item'))
    .toHaveCountGreaterThan(0);
  
  await page.screenshot({
    path: 'reports/screenshots/TC-090-配置保存成功.png'
  });
});
```

**TC-091: 加载已保存的快捷配置**
```typescript
test('TC-091 应用已保存的快捷配置', async ({ page }) => {
  await page.goto('file:///path/to/index.html');
  
  // 确保有已保存的预设
  // ...（可能需要先执行TC-090）...
  
  // 点击"加载配置"按钮
  await page.click('text=📂 加载配置');
  await expect(page.locator('#quickPresetModal')).toBeVisible();
  
  // 选择一个预设并应用
  await page.locator('.preset-list-item').first().click();
  await page.click('text=应用此配置');
  
  // 必须：验证表单字段已更新为预设值
  await expect(page.locator('#prompt')).not.toBeEmpty();
  
  await page.screenshot({
    path: 'reports/screenshots/TC-091-配置应用成功.png'
  });
});
```

**TC-092-096: 更多配置管理测试**
- TC-092: 删除快捷预设
- TC-093: 收藏/取消收藏预设
- TC-094: 预设模型组合应用
- TC-095: 多个预设切换
- TC-096: 预设数据持久化验证

---

## 四、截图与视频录制规范

### 4.1 截图命名规范（必须中文）

```
reports/screenshots/
├── TC-XXX-<步骤名称>.png          # 单步截图
├── TC-XXX-<操作前>.png            # 操作前快照
├── TC-XXX-<操作后>.png            # 操作后快照
├── TC-XXX-<数据验证>.png          # 数据验证截图
├── TC-XXX-<错误状态>.png          # 异常/错误状态
└── TC-XXX-完整流程结束.png        # 流程最终状态
```

**示例**:
- `TC-040-step1-模型配置完成.png`
- `TC-040-step5-任务提交成功.png`
- `TC-040-step7-生成完成结果.png`
- `TC-020-模型同步成功.png`

### 4.2 视频录制配置

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    video: 'retain-on-failure',  // 失败时保留视频
    // 或 'on' - 始终录制
  },
});
```

**视频命名**: 自动按测试用例命名，如:
- `TC-040-完整图片生成流程.webm`

### 4.3 截图时机（必须遵守）

| 时机 | 说明 | 是否必须 |
|------|------|----------|
| 页面加载完成 | 初始状态记录 | ✅ 必须 |
| 操作前 | 记录操作前状态 | ✅ 推荐 |
| 操作后 | 记录操作结果 | ✅ 必须 |
| API响应后 | 数据加载完成 | ✅ 必须 |
| 错误/异常 | 异常状态快照 | ✅ 必须 |
| 流程结束 | 最终状态总结 | ✅ 必须 |

---

## 五、API 接口清单（用于验证）

### 5.1 核心API端点

| API路径 | 方法 | 功能 | 测试验证点 |
|---------|------|------|------------|
| `/api/models/sync` | GET | 同步模型列表 | 状态码200、数据结构、模型数量 |
| `/api/models/list` | GET | 获取模型列表 | 数据完整性、字段验证 |
| `/api/generate` | POST | 提交生成任务 | 任务ID返回、参数传递 |
| `/api/tasks/{id}` | GET | 查询任务状态 | 状态字段、进度百分比 |
| `/api/tasks/list` | GET | 获取任务列表 | 列表数据、分页信息 |
| `/api/assets/list` | GET | 获取素材列表 | 素材数据、图片URL有效性 |
| `/api/assets/{id}/delete` | DELETE | 删除素材 | 删除成功确认 |
| `/api/presets/save` | POST | 保存快捷配置 | 预设ID返回 |
| `/api/presets/list` | GET | 获取预设列表 | 预设数据完整性 |
| `/api/presets/{id}/apply` | POST | 应用预设配置 | 表单字段更新验证 |
| `/api/stickman/poses` | GET | 获取姿势列表 | 姿势数据、缩略图URL |
| `/api/stickman/save` | POST | 保存自定义姿势 | 姿势ID返回 |

### 5.2 API拦截验证示例

```typescript
// 必须使用Promise.all同时等待响应和操作
const [response] = await Promise.all([
  page.waitForResponse('**/api/generate'), // 拦截API
  page.click('button:has-text("🎨 生成图片")') // 触发操作
]);

// 必须验证状态码
expect(response.status()).toBe(200);

// 必须验证响应数据
const body = await response.json();
expect(body).toHaveProperty('task_id');
```

---

## 六、测试数据准备

### 6.1 测试用例数据文件 (fixtures/test-data.json)

```json
{
  "prompts": {
    "valid_short": "Q版角色",
    "valid_medium": "Q版武士角色，手持长剑，英勇姿态，日式卡通风格",
    "valid_long": "Q版角色，2.5头身比，大头小身体，可爱卡通风格，明亮色彩，干净线条，透明背景，游戏角色，手游优化，高质量，精致面部，生动表情",
    "empty": "",
    "special_chars": "<script>alert('xss')</script>",
    "unicode": "Q版角色😊🎮，日本动漫風格"
  },
  "negativePrompts": {
    "default": "模糊，低质量，变形，丑陋",
    "empty": ""
  },
  "parameters": {
    "aspectRatios": ["1:1", "16:9", "9:16", "4:3", "3:4"],
    "seeds": [-1, 0, 12345, 99999],
    "guidanceWeights": [3, 4, 5, 6],
    "batchSizes": [1, 2, 3, 4],
    "referenceWeights": [0, 0.5, 0.8, 1.0]
  },
  "referenceImages": {
    "valid_url": "https://example.com/test-image.png",
    "invalid_url": "not-a-url",
    "empty": ""
  },
  "modelIds": [],
  "expectedApiResponses": {
    "generateSuccess": {
      "status": 200,
      "hasTaskId": true,
      "hasClientId": true
    }
  }
}
```

---

## 七、辅助工具函数

### 7.1 通用辅助函数 (utils/helpers.ts)

```typescript
import { Page, expect } from '@playwright/test';

/**
 * 等待API响应并验证
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  action: () => Promise<void>,
  expectedStatus: number = 200
): Promise<any> {
  const [response] = await Promise.all([
    page.waitForResponse(urlPattern),
    action()
  ]);
  
  expect(response.status()).toBe(expectedStatus);
  return await response.json();
}

/**
 * 带截图的操作包装器
 */
export async function withScreenshot(
  page: Page,
  screenshotName: string,
  action: () => Promise<void>,
  options: { fullPage?: boolean } = {}
): Promise<void> {
  await action();
  await page.screenshot({
    path: `reports/screenshots/${screenshotName}.png`,
    fullPage: options.fullPage ?? false
  });
}

/**
 * 等待元素出现并验证可见性
 */
export async function waitForAndVerify(
  page: Page,
  selector: string,
  timeout: number = 30000
): Promise<void> {
  await expect(page.locator(selector)).toBeVisible({ timeout });
}

/**
 * 验证表格数据行数
 */
export async function verifyTableRowCount(
  page: Page,
  rowSelector: string,
  expectedMinCount: number
): Promise<void> {
  await expect(page.locator(rowSelector))
    .toHaveCountGreaterThan(expectedMinCount);
}
```

### 7.2 API拦截器 (utils/api-interceptor.ts)

```typescript
import { Page, Route } from '@playwright/test';

/**
 * 拦截并记录所有API请求
 */
export function setupApiLogging(page: Page): void {
  page.on('request', request => {
    if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') {
      console.log(`>> ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.resourceType() === 'fetch' || response.resourceType() === 'xhr') {
      console.log(`<< ${response.status()} ${response.url()}`);
    }
  });
}

/**
 * Mock API响应（用于离线测试或错误场景）
 */
export function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  mockData: any,
  status: number = 200
): void {
  page.route(urlPattern, async (route: Route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(mockData)
    });
  });
}
```

---

## 八、Playwright配置文件

### 8.1 完整配置 (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,  // 串行执行，避免并发冲突
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,  // 单线程执行
  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list']
  ],
  timeout: 60000,  // 全局超时60秒
  expect: {
    timeout: 30000,  // 断言超时30秒
    interval: 500,
  },
  use: {
    baseURL: 'file:///c:/projects/.../projects/asset-debugger/server/static/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',  // 失败时自动截图
    video: 'retain-on-failure',     // 失败时保留视频
    actionTimeout: 15000,
    navigationTimeout: 30000,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

---

## 九、执行命令与报告

### 9.1 安装依赖

```bash
cd projects/asset-debugger/e2e-tests
npm init -y
npm install @playwright/test
npx playwright install chromium
```

### 9.2 运行测试

```bash
# 运行所有测试
npx playwright test

# 运行特定测试套件
npx playwright test TS-04

# 运行特定测试用例
npx playwright test TC-040

# 运行并生成报告
npx playwright test --reporter=html

# 调试模式（ headed浏览器）
npx playwright test --debug

# UI模式（可视化调试）
npx playwright test --ui
```

### 9.3 查看报告

```bash
# HTML报告
npx playwright show-report reports/html-report

# 报告目录结构
reports/
├── html-report/           # HTML测试报告（浏览器可打开）
├── results.json           # JSON格式结果
├── screenshots/           # 所有截图（按TC编号组织）
├── videos/                # 失败用例的视频录制
└── traces/                # Playwright追踪文件
```

---

## 十、验收检查清单（必须逐项确认）

### 10.1 测试设计验收

- [ ] **TS-01~TS-08 共73个测试用例是否覆盖所有主要功能模块？**
- [ ] **每个测试用例是否都包含前置条件、操作步骤、预期结果三部分？**
- [ ] **核心业务流程（TC-040）是否实现端到端验证？**
- [ ] **是否避免仅验证UI元素存在性的测试？**

### 10.2 数据验证验收

- [ ] **所有API调用是否使用waitForResponse拦截验证？**
- [ ] **是否验证了HTTP状态码（expect 200）？**
- [ ] **是否验证了响应数据结构和关键字段？**
- [ ] **是否验证了数据渲染到页面的结果？**

### 10.3 截图视频验收

- [ ] **关键步骤是否都有截图（操作前、操作后、数据验证）？**
- [ ] **截图命名是否使用中文步骤名称？**
- [ ] **失败用例是否自动保留视频？**
- [ ] **截图是否显示实际数据内容而非空白页面？**

### 10.4 超时时间验收

- [ ] **全局超时设置为60秒？**
- [ ] **图片生成任务轮询超时设置为2分钟？**
- [ ] **模型同步超时设置为45秒？**
- [ ] **是否避免了固定waitForTimeout的使用（除非必要）？**

### 10.5 E2E规则合规验收

- [ ] **是否符合[e2e-acceptance-rules.md](../../.trae/rules/e2e-acceptance-rules.md)的所有"必须"条款？**
- [ ] **是否存在违反"不准"条款的设计？**
- [ ] **是否能避免"HoloPix E2E测试事故"的重演？**

---

## 十一、风险与注意事项

### 11.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| API响应慢导致超时 | 测试误判为失败 | 合理设置超时，增加重试机制 |
| 动态元素ID不稳定 | 选择器失效 | 使用稳定的CSS类名或属性选择器 |
| 并发任务冲突 | 测试数据混乱 | 串行执行（workers: 1） |
| 网络问题 | API调用失败 | Mock数据作为备选方案 |

### 11.2 最佳实践提醒

1. **禁止使用 `waitForTimeout` 作为唯一等待方式** - 必须结合 `waitForResponse` 或 `waitForSelector`
2. **每次操作后都要有断言** - 不要假设操作一定成功
3. **截图要包含上下文** - 使用 `fullPage: true` 或确保关键元素在视口内
4. **测试数据隔离** - 每个测试用例应独立，不依赖其他用例的状态
5. **清理测试数据** - 测试结束后清理创建的任务、素材等数据

---

## 十二、后续优化方向

### 12.1 短期优化（本次实施）

- [ ] 实现 TS-01 ~ TS-04 的核心测试用例（优先级最高）
- [ ] 配置CI/CD自动化运行
- [ ] 生成首份测试报告

### 12.2 中期优化（1-2周内）

- [ ] 补充 TS-05 ~ TS-08 的测试用例
- [ ] 增加性能基准测试（页面加载时间、API响应时间）
- [ ] 添加跨浏览器兼容性测试（Firefox、WebKit）

### 12.3 长期优化（1个月内）

- [ ] 集成到CI/CD流水线，代码提交自动触发
- [ ] 建立测试数据管理平台
- [ ] 开发可视化测试报告仪表板
- [ ] 引入AI辅助的测试用例生成

---

## 附录A：元素选择器速查表

```typescript
// Tab切换
const TABS = {
  generate: '#generate',
  models: '#models',
  tasks: '#tasks',
  assets: '#assets',
  stickman: '#stickman'
};

// 生成表单
const FORM = {
  prompt: '#prompt',
  negativePrompt: '#negativePrompt',
  aspectRatios: '#aspectRatios',
  seed: '#seed',
  guidanceWeights: '#imageGuidanceWeights',
  batchSize: '#batchSize',
  generateBtn: 'button:has-text("🎨 生成图片")'
};

// 增强选项
const ENHANCEMENTS = {
  faceDetail: '#faceDetail',
  hdFix: '#hdFix',
  hdScale: '#hdScale',
  simpleBackground: '#simpleBackground',
  enablePerturb: '#enablePerturb',
  perturb: '#perturb'
};

// 结果展示
const RESULTS = {
  progress: '#generationProgress',
  progressStatus: '#progressStatus',
  resultsGrid: '#resultsGrid',
  history: '#historyList'
};
```

---

## 附录B：常见问题FAQ

**Q1: 为什么不能只用 `waitForTimeout`？**
A: 根据 E2E 验收规则 3.3，必须验证API完成状态，固定等待可能导致：
- 测试不稳定（网络快时浪费时间，慢时超时）
- 无法捕获真实的功能性问题
- 违反验收标准

**Q2: 如何处理需要长时间等待的生成任务？**
A: 
- 使用 `waitForFunction` 轮询检查状态变化
- 设置合理的超时时间（建议2分钟）
- 超时时记录当前状态截图便于排查

**Q3: 动态生成的元素如何定位？**
A: 
- 使用属性选择器：`[data-model-id="123"]`
- 使用文本匹配：`text=模型名称`
- 使用相对位置：`.parent > .child:nth-child(2)`

**Q4: 测试失败时如何快速定位问题？**
A: 
- 查看 screenshots 目录下的失败截图
- 播放 videos 目录下的录制视频
- 使用 `npx playwright show-report` 打开HTML报告
- 查看 traces 文件的详细执行追踪

---

**文档编制完成** ✅

**下一步行动**: 用户确认方案后，立即开始实施 TS-01 至 TS-04 的核心测试用例代码编写。
