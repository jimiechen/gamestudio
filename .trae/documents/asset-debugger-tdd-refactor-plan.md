# HoloPix 素材调试器 - TDD 重构计划 (v2)

## 一、文件策略调整

### 1.1 文件处理方案

| 文件 | 操作 | 说明 |
|------|------|------|
| `index.html` | 保持不变 | 保留现有功能完整版本 |
| `index2.html` | 备份后废弃 | 备份为 `index2.html.bak`，不再维护 |
| `index3.html` | 新建重构 | 基于 TDD 模式重新开发 |

### 1.2 备份命令

```bash
# 备份 index2.html
copy projects\asset-debugger\server\static\index2.html projects\asset-debugger\server\static\index2.html.bak
```

---

## 二、TDD 开发模式概述

### 2.1 TDD 循环

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. 编写测试  │ -> │  2. 运行测试  │ -> │  3. 编写代码  │
│  (测试失败)   │    │  (验证失败)   │    │  (使测试通过) │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             v
┌─────────────┐    ┌─────────────┐
│  5. 下一轮   │ <- │  4. 重构     │
│  新功能     │    │  (优化代码)   │
└─────────────┘    └─────────────┘
```

### 2.2 测试分层

```
┌─────────────────────────────────────────┐
│           E2E 验收测试层 (Playwright)      │
│    - 验证完整业务流程                     │
│    - 每个功能必须有对应 E2E 测试           │
└─────────────────────────────────────────┘
                    │
                    v
┌─────────────────────────────────────────┐
│           集成测试层 (API 测试)            │
│    - 验证 API 接口正常工作                │
│    - 验证前后端数据交互                   │
└─────────────────────────────────────────┘
                    │
                    v
┌─────────────────────────────────────────┐
│           单元测试层 (Jest/Vitest)         │
│    - 验证工具函数正确性                   │
│    - 验证状态管理逻辑                     │
└─────────────────────────────────────────┘
```

---

## 三、重构策略

### 3.1 参考基准

- **功能基准**: `index.html` (功能完整版)
- **架构参考**: `index2.html` (模块化思想，但废弃 ES6 模块)
- **新文件**: `index3.html` (TDD 重构目标)

### 3.2 新文件结构

```
server/static/
├── index.html                 # 保持不变 (功能完整版)
├── index2.html.bak           # 备份 (废弃)
├── index3.html               # 新建 (TDD 重构目标)
├── css/
│   ├── base.css              # 基础样式 (复用)
│   ├── components.css        # 组件样式 (复用)
│   ├── modal.css             # 弹框样式 (复用)
│   └── layout.css            # 布局样式 (新增)
├── js/
│   ├── app.js                # 应用入口 (重构)
│   ├── modules/
│   │   ├── state.js          # 状态管理
│   │   ├── api.js            # API 封装
│   │   ├── tabs.js           # 标签页模块
│   │   ├── generate.js       # 文生图模块
│   │   ├── models.js         # 模型列表模块
│   │   ├── tasks.js          # 任务列表模块
│   │   ├── assets.js         # 素材库模块
│   │   ├── stickman.js       # 火柴人模块
│   │   └── quick-presets.js  # 快捷应用模块
│   └── utils/
│       ├── helpers.js        # 工具函数
│       └── constants.js      # 常量定义
└── tests/                     # 测试文件
    ├── e2e/                   # E2E 测试
    │   ├── index3/
    │   │   ├── smoke.spec.ts
    │   │   ├── tabs.spec.ts
    │   │   ├── generation.spec.ts
    │   │   ├── models.spec.ts
    │   │   └── ...
    │   └── index2/            # 保留原有测试
    └── unit/                  # 单元测试
        ├── state.test.js
        ├── api.test.js
        └── ...
```

---

## 四、TDD 实施步骤

### 阶段 0: 准备工作

#### Step 0.1: 备份 index2.html

```bash
copy projects\asset-debugger\server\static\index2.html projects\asset-debugger\server\static\index2.html.bak
```

#### Step 0.2: 创建 index3.html 骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HoloPix 素材调试器</title>
    <!-- CSS -->
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/modal.css">
    <link rel="stylesheet" href="css/layout.css">
</head>
<body>
    <div class="container">
        <h1>🏞️ HoloPix 素材调试器</h1>
        <!-- 内容由 TDD 逐步填充 -->
    </div>
    <!-- JavaScript -->
    <script src="js/modules/state.js"></script>
    <script src="js/modules/api.js"></script>
    <script src="js/modules/tabs.js"></script>
    <script src="js/modules/generate.js"></script>
    <script src="js/modules/models.js"></script>
    <script src="js/modules/tasks.js"></script>
    <script src="js/modules/assets.js"></script>
    <script src="js/modules/stickman.js"></script>
    <script src="js/modules/quick-presets.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

---

### 阶段 1: 基础设施 + 标签页 (Red-Green-Refactor)

#### Step 1.1: 编写冒烟测试 (Red)

**文件**: `tests/e2e/index3/smoke.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('冒烟测试', () => {
  test('页面能正常加载', async ({ page }) => {
    await page.goto('/static/index3.html');
    await expect(page).toHaveTitle('HoloPix 素材调试器');
    await expect(page.locator('h1')).toContainText('HoloPix 素材调试器');
  });
});
```

**预期**: 测试失败 (404 或标题不匹配)

#### Step 1.2: 实现基础 HTML (Green)

**文件**: `index3.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HoloPix 素材调试器</title>
    <link rel="stylesheet" href="css/base.css">
</head>
<body>
    <div class="container">
        <h1>🏞️ HoloPix 素材调试器</h1>
    </div>
    <script src="js/app.js"></script>
</body>
</html>
```

**验证**: 冒烟测试通过

#### Step 1.3: 编写标签页测试 (Red)

**文件**: `tests/e2e/index3/tabs.spec.ts`

```typescript
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
```

**预期**: 测试失败 (标签页不存在)

#### Step 1.4: 实现标签页功能 (Green)

**文件**: `js/modules/tabs.js`

```javascript
const Tabs = {
    init() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switch(tab.dataset.tab));
        });
    },
    
    switch(tabName) {
        // 移除所有 active
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        
        // 添加 active 到当前
        document.getElementById(tabName)?.classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    }
};
```

**文件**: `index3.html` (更新)

```html
<!-- 标签页 -->
<div class="tabs">
    <div class="tab active" data-tab="generate">🎨 生成素材</div>
    <div class="tab" data-tab="models">📋 模型列表</div>
    <div class="tab" data-tab="tasks">📋 任务列表</div>
    <div class="tab" data-tab="assets">🖼️ 素材库</div>
    <div class="tab" data-tab="stickman">🎭 火柴人调试</div>
</div>

<!-- 标签页内容 -->
<div id="generate" class="tab-content active">
    <p>生成素材内容</p>
</div>
<div id="models" class="tab-content">
    <p>模型列表内容</p>
</div>
<div id="tasks" class="tab-content">
    <p>任务列表内容</p>
</div>
<div id="assets" class="tab-content">
    <p>素材库内容</p>
</div>
<div id="stickman" class="tab-content">
    <p>火柴人调试内容</p>
</div>
```

**验证**: 标签页测试通过

#### Step 1.5: 重构优化 (Refactor)

- 添加 CSS 过渡动画
- 使用事件委托优化性能
- 添加 URL hash 同步

---

### 阶段 2: 文生图核心功能 (Red-Green-Refactor)

#### Step 2.1: 分析 index.html 文生图功能

**参考**: `index.html` 中的文生图表单结构

**功能清单**:
1. 模型选择 (多选)
2. 预设模型组合
3. 正向/反向提示词
4. 画面比例、随机种子、出图数量
5. 增强选项 (脸部修复、高清修复、简单背景、画面增强)
6. 参考图片 (形象样式、火柴人姿势)
7. 生成按钮 + 进度展示
8. 生成结果展示
9. 生成历史

#### Step 2.2: 编写文生图测试 (Red)

**文件**: `tests/e2e/index3/generation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('文生图功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
  });

  test('表单元素存在且可填写', async ({ page }) => {
    // 验证表单元素存在
    await expect(page.locator('#prompt')).toBeVisible();
    await expect(page.locator('#negativePrompt')).toBeVisible();
    await expect(page.locator('#seed')).toBeVisible();
    await expect(page.locator('#batchSize')).toBeVisible();
    
    // 填写表单
    await page.fill('#prompt', '测试提示词');
    await page.fill('#negativePrompt', '测试反向提示词');
    await page.fill('#seed', '12345');
    await page.fill('#batchSize', '2');
    
    // 验证值
    await expect(page.locator('#prompt')).toHaveValue('测试提示词');
    await expect(page.locator('#seed')).toHaveValue('12345');
  });

  test('能选择模型并提交生成', async ({ page }) => {
    // 点击添加模型
    await page.click('[data-action="openModelSelector"]');
    
    // 等待模型选择器弹窗
    await expect(page.locator('.model-selector-modal')).toBeVisible();
    
    // 选择第一个模型
    await page.click('.model-item:first-child');
    
    // 验证模型已添加
    await expect(page.locator('.selected-model')).toHaveCount(1);
    
    // 填写提示词
    await page.fill('#prompt', '测试生成');
    
    // 提交生成并验证 API 调用
    const [response] = await Promise.all([
      page.waitForResponse('**/api/generate'),
      page.click('[data-action="generateImage"]')
    ]);
    
    expect(response.status()).toBe(200);
    
    // 验证进度显示
    await expect(page.locator('#generationProgress')).toBeVisible();
  });

  test('高清修复开关工作正常', async ({ page }) => {
    // 默认隐藏
    await expect(page.locator('#hdOptions')).toBeHidden();
    
    // 勾选高清修复
    await page.check('#hdFix');
    await expect(page.locator('#hdOptions')).toBeVisible();
    
    // 取消勾选
    await page.uncheck('#hdFix');
    await expect(page.locator('#hdOptions')).toBeHidden();
  });
});
```

#### Step 2.3: 实现文生图功能 (Green)

**子任务**:
1. 实现 HTML 表单结构 (参考 index.html)
2. 实现模型选择器弹窗
3. 实现 API 调用封装
4. 实现进度展示

**文件**: `js/modules/api.js`

```javascript
const API = {
    async request(url, options = {}) {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        return response.json();
    },
    
    // 生成相关
    generate: (data) => this.request('/api/generate', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    // 模型相关
    syncModels: () => this.request('/api/models/sync', { method: 'POST' }),
    getModels: () => this.request('/api/models'),
    
    // 任务相关
    getTasks: () => this.request('/api/tasks'),
    
    // 素材相关
    getAssets: () => this.request('/api/assets')
};
```

#### Step 2.4: 重构优化 (Refactor)

- 提取表单验证逻辑
- 优化错误处理
- 添加加载状态管理

---

### 阶段 3: 模型列表功能 (Red-Green-Refactor)

#### Step 3.1: 编写模型列表测试 (Red)

**文件**: `tests/e2e/index3/models.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('模型列表功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/index3.html');
    await page.click('[data-tab="models"]');
  });

  test('能同步并显示模型列表', async ({ page }) => {
    // 点击同步
    const [response] = await Promise.all([
      page.waitForResponse('**/api/models/sync'),
      page.click('[data-action="syncModels"]')
    ]);
    
    expect(response.status()).toBe(200);
    
    // 验证模型显示
    await expect(page.locator('.model-item')).toHaveCountGreaterThan(0);
  });

  test('能按名称搜索模型', async ({ page }) => {
    // 先同步模型
    await page.click('[data-action="syncModels"]');
    await page.waitForTimeout(2000);
    
    // 搜索模型
    await page.fill('#searchModelName', 'test');
    await page.keyboard.press('Enter');
    
    // 验证搜索结果
    await expect(page.locator('.model-item')).toHaveCountGreaterThanOrEqual(0);
  });

  test('能展开模型详情', async ({ page }) => {
    // 先同步模型
    await page.click('[data-action="syncModels"]');
    await page.waitForTimeout(2000);
    
    // 点击第一个模型行
    await page.click('.model-row:first-child');
    
    // 验证详情展开
    await expect(page.locator('.model-detail-row.active')).toBeVisible();
  });
});
```

#### Step 3.2: 实现模型列表功能 (Green)

**子任务**:
1. 实现模型表格渲染
2. 实现同步功能
3. 实现筛选功能
4. 实现详情展开

---

### 阶段 4-7: 其他功能模块

按照相同 TDD 模式依次实现:
- 任务列表
- 素材库
- 火柴人编辑器
- 快捷应用

每个模块遵循:
1. 编写测试 (Red)
2. 实现功能 (Green)
3. 重构优化 (Refactor)

---

## 五、测试规范 (基于 e2e-acceptance-rules.md)

### 5.1 E2E 测试必须遵守

1. **必须验证业务功能**，而非仅 UI 元素
2. **必须验证 API 调用** 是否成功
3. **必须验证数据** 是否正确渲染
4. **必须包含数据断言**

### 5.2 测试用例模板

```typescript
test('TC-XXX 功能描述', async ({ page }) => {
  // 前置条件
  await page.goto('/static/index3.html');
  
  // 操作步骤 + API 验证
  const [response] = await Promise.all([
    page.waitForResponse('**/api/xxx'),
    page.click('selector')
  ]);
  expect(response.status()).toBe(200);
  
  // 数据验证
  await expect(page.locator('.data-item')).toContainText('expected data');
});
```

### 5.3 禁止事项

- ❌ 不准仅验证按钮可点击
- ❌ 不准仅验证提示消息显示
- ❌ 不准使用固定等待时间 (用 waitForResponse)
- ❌ 不准返回假数据

---

## 六、实施时间表

| 阶段 | 功能模块 | 预计时间 | 依赖 |
|------|----------|----------|------|
| 0 | 准备工作 (备份 + 骨架) | 0.5h | 无 |
| 1 | 基础设施 + 标签页 | 2h | 阶段0 |
| 2 | 文生图核心功能 | 4h | 阶段1 |
| 3 | 模型列表 | 3h | 阶段1 |
| 4 | 任务列表 | 2h | 阶段1 |
| 5 | 素材库 | 2h | 阶段1 |
| 6 | 火柴人编辑器 | 3h | 阶段1 |
| 7 | 快捷应用 | 2h | 阶段2 |
| 8 | 集成测试 + 优化 | 2h | 全部 |

**总计**: 约 20.5 小时

---

## 七、验收标准

### 7.1 功能验收

- [ ] 所有 E2E 测试通过
- [ ] 所有 API 调用正常工作
- [ ] 所有数据正确渲染
- [ ] 无 console.error 报错
- [ ] 功能与 index.html 完全一致

### 7.2 代码质量

- [ ] 代码覆盖率 > 80%
- [ ] 无重复代码
- [ ] 适当的注释和文档
- [ ] 统一的代码风格

### 7.3 兼容性

- [ ] Flask 静态文件服务正常
- [ ] Chrome/Firefox/Edge 最新版正常
- [ ] 无 ES6 模块相关报错

---

## 八、风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 测试编写耗时 | 中 | 优先编写核心功能测试 |
| API 不稳定 | 高 | 添加 API mock 支持 |
| 功能遗漏 | 高 | 逐项对照 index.html 验证 |
| 浏览器兼容 | 中 | 使用 Playwright 多浏览器测试 |

---

## 九、开始实施

### 立即执行:

1. ✅ 备份 index2.html -> index2.html.bak
2. ✅ 创建 index3.html 骨架
3. ⏳ 开始阶段 1: 基础设施 + 标签页

### 检查点:

- 每完成一个阶段，运行全部测试
- 确保测试通过后再进入下一阶段
- 定期对照 index.html 验证功能完整性
