# Playwright 自动化测试方案

## 目标

为 `index2.html` 页面搭建 Playwright 自动化测试框架，绑定所有可操作按钮元素，实现端到端自动化测试。

---

## 1. 页面元素分析

### 1.1 标签页切换 (Tabs)
| 元素 | 选择器 | 操作 |
|------|--------|------|
| 生成素材标签 | `[data-action="switchTab"][data-tab="generate"]` | click |
| 模型列表标签 | `[data-action="switchTab"][data-tab="models"]` | click |
| 任务列表标签 | `[data-action="switchTab"][data-tab="tasks"]` | click |
| 素材库标签 | `[data-action="switchTab"][data-tab="assets"]` | click |
| 火柴人调试标签 | `[data-action="switchTab"][data-tab="stickman"]` | click |

### 1.2 生成素材页 (Generate Tab)

#### 快捷应用栏
| 元素 | 选择器 | 操作 |
|------|--------|------|
| 加载配置按钮 | `[data-action="openQuickPresetModal"]` | click |
| 保存配置按钮 | `[data-action="saveQuickPreset"]` | click |

#### 模型配置
| 元素 | 选择器 | 操作 |
|------|--------|------|
| 添加模型按钮 | `[data-action="openModelSelector"]` | click |
| 预设模型组合容器 | `#presetModelCombos` | - |

#### 提示词配置
| 元素 | 选择器 | 操作 |
|------|--------|------|
| 正向提示词 | `#prompt` | fill |
| 负向提示词 | `#negativePrompt` | fill |

#### 图像参数
| 元素 | 选择器 | 操作 |
|------|--------|------|
| 宽度 | `#width` | fill |
| 高度 | `#height` | fill |
| 采样步数 | `#steps` | fill |
| CFG Scale | `#cfgScale` | fill |
| 随机种子 | `#seed` | fill |
| 批次大小 | `#batchSize` | fill |
| 采样器 | `#sampler` | select |

#### 高级选项
| 元素 | 选择器 | 操作 |
|------|--------|------|
| 高清修复开关 | `#hdScale` | check/uncheck |
| 放大倍数 | `#hrScale` | fill |
| 高清修复步数 | `#hrSteps` | fill |
| 高清修复采样器 | `#hrSampler` | select |
| 画面增强开关 | `#perturb` | check/uncheck |

#### 生成操作
| 元素 | 选择器 | 操作 |
|------|--------|------|
| 生成图片按钮 | `[data-action="generateImage"]` | click |
| 生成进度容器 | `#generationProgress` | wait for |
| 生成结果容器 | `#generationResults` | verify |
| 生成历史容器 | `#generationHistory` | verify |

### 1.3 模型列表页 (Models Tab)

| 元素 | 选择器 | 操作 |
|------|--------|------|
| 同步模型按钮 | `[data-action="syncModels"]` | click |
| 刷新列表按钮 | `[data-action="loadModels"]` | click |
| 展开全部按钮 | `button:has-text("展开全部")` | click |
| 收起全部按钮 | `button:has-text("收起全部")` | click |
| 模型类型筛选 | `#filterModelType` | select |
| 风格类型筛选 | `#filterStyleType` | select |
| 基础模型筛选 | `#filterBaseModel` | select |
| 标签筛选 | `#filterModelTags` | select |
| 名称搜索 | `#searchModelName` | fill |
| ID筛选 | `#filterModelIds` | fill |
| 清除筛选按钮 | `[data-action="clearAllFilters"]` | click |
| 模型列表容器 | `#modelListContainer` | verify |
| 模型选择指示器 | `#modelSelectionIndicator` | verify |

### 1.4 任务列表页 (Tasks Tab)

| 元素 | 选择器 | 操作 |
|------|--------|------|
| 刷新按钮 | `[data-action="loadTasks"]` | click |
| 任务列表容器 | `#taskListContainer` | verify |

### 1.5 素材库页 (Assets Tab)

| 元素 | 选择器 | 操作 |
|------|--------|------|
| 刷新按钮 | `[data-action="loadAssets"]` | click |
| 素材列表容器 | `#assetListContainer` | verify |

### 1.6 火柴人调试页 (Stickman Tab)

| 元素 | 选择器 | 操作 |
|------|--------|------|
| Canvas画布 | `#stickmanCanvas` | mouse actions |
| 保存姿势按钮 | `button:has-text("保存姿势")` | click |
| 重置按钮 | `button:has-text("重置")` | click |
| 导出PNG按钮 | `button:has-text("导出PNG")` | click |
| 生成描述按钮 | `button:has-text("生成描述")` | click |
| 用于文生图按钮 | `button:has-text("用于文生图")` | click |
| 姿势搜索 | `input[placeholder="搜索姿势..."]` | fill |
| 姿势列表容器 | `#poseList` | verify |
| 站立预设 | `[data-preset="standing"]` | click |
| 行走预设 | `[data-preset="walking"]` | click |
| 奔跑预设 | `[data-preset="running"]` | click |
| 坐姿预设 | `[data-preset="sitting"]` | click |
| 选择姿势按钮 | `[data-action="openStickmanPoseModal"]` | click |
| 清除按钮 | `[data-action="clearStickmanPose"]` | click |

---

## 2. 项目结构

```
projects/asset-debugger/
├── server/
│   └── static/
│       ├── index2.html          # 被测试页面
│       └── ...
└── e2e/                         # Playwright 测试目录
    ├── tests/
    │   ├── generate.spec.ts     # 生成素材页测试
    │   ├── models.spec.ts       # 模型列表页测试
    │   ├── tasks.spec.ts        # 任务列表页测试
    │   ├── assets.spec.ts       # 素材库页测试
    │   ├── stickman.spec.ts     # 火柴人调试页测试
    │   └── smoke.spec.ts        # 冒烟测试
    ├── pages/
    │   ├── base.page.ts         # 基础页面对象
    │   ├── generate.page.ts     # 生成素材页对象
    │   ├── models.page.ts       # 模型列表页对象
    │   ├── tasks.page.ts        # 任务列表页对象
    │   ├── assets.page.ts       # 素材库页对象
    │   └── stickman.page.ts     # 火柴人调试页对象
    ├── fixtures/
    │   └── test-data.ts         # 测试数据
    ├── utils/
    │   ├── selectors.ts         # 选择器定义
    │   └── helpers.ts           # 辅助函数
    ├── playwright.config.ts     # Playwright 配置
    └── package.json             # 项目依赖
```

---

## 3. 实施步骤

### 步骤 1: 初始化 Playwright 项目

```bash
# 进入项目目录
cd projects/asset-debugger

# 创建 e2e 目录
mkdir -p e2e && cd e2e

# 初始化 npm 项目
npm init -y

# 安装 Playwright
npm init playwright@latest

# 安装额外依赖
npm install -D @playwright/test dotenv
```

### 步骤 2: 配置 Playwright

创建 `playwright.config.ts`:
- 配置测试目录: `./tests`
- 配置基础 URL: `http://localhost:5000` (Flask 默认端口)
- 配置浏览器: Chromium, Firefox, WebKit
- 配置视口: 1280x720
- 配置截图和视频: 仅在失败时录制
- 配置并行: workers = 4

### 步骤 3: 创建选择器定义

创建 `utils/selectors.ts`:
- 定义所有页面元素的选择器
- 使用 data-testid 或 data-action 属性
- 集中管理选择器，便于维护

### 步骤 4: 创建页面对象

为每个标签页创建页面对象类:
- `BasePage`: 基础方法 (goto, waitFor, screenshot)
- `GeneratePage`: 生成素材页方法
- `ModelsPage`: 模型列表页方法
- `TasksPage`: 任务列表页方法
- `AssetsPage`: 素材库页方法
- `StickmanPage`: 火柴人调试页方法

### 步骤 5: 编写测试用例

#### 冒烟测试 (smoke.spec.ts)
- 测试页面加载
- 测试标签页切换
- 测试所有按钮可点击

#### 生成素材页测试 (generate.spec.ts)
- 测试表单填写
- 测试模型选择
- 测试生成流程

#### 模型列表页测试 (models.spec.ts)
- 测试模型同步
- 测试筛选功能
- 测试模型选择

#### 任务列表页测试 (tasks.spec.ts)
- 测试任务加载
- 测试任务详情

#### 素材库页测试 (assets.spec.ts)
- 测试素材加载
- 测试素材删除

#### 火柴人调试页测试 (stickman.spec.ts)
- 测试 Canvas 绘制
- 测试姿势保存
- 测试预设加载

### 步骤 6: 运行测试

```bash
# 运行所有测试
npx playwright test

# 运行特定测试
npx playwright test generate.spec.ts

# 调试模式
npx playwright test --debug

# 生成报告
npx playwright show-report
```

---

## 4. 关键技术点

### 4.1 选择器策略

使用以下优先级:
1. `data-testid` - 最稳定 (需要页面添加)
2. `data-action` - 业务语义明确
3. `id` - 唯一标识
4. `role` + `name` - 可访问性
5. `text` - 最后选择

### 4.2 等待策略

- 优先使用 `expect(locator).toBeVisible()`
- 网络请求使用 `page.waitForResponse()`
- 动态内容使用 `page.waitForSelector()`

### 4.3 测试数据

- 使用 fixtures 管理测试数据
- 敏感信息使用环境变量
- 动态数据使用 faker 生成

### 4.4 浏览器支持

- Chromium (默认)
- Firefox
- WebKit
- 移动端模拟 (可选)

---

## 5. 预期结果

### 文件统计
| 文件类型 | 数量 | 说明 |
|----------|------|------|
| 测试文件 | 6个 | .spec.ts |
| 页面对象 | 6个 | .page.ts |
| 工具文件 | 2个 | selectors.ts, helpers.ts |
| 配置文件 | 1个 | playwright.config.ts |

### 测试覆盖率
- 所有可操作按钮元素绑定
- 所有表单输入验证
- 所有标签页切换验证
- 关键业务流程覆盖

### 运行环境
- Node.js 18+
- Playwright 1.40+
- 浏览器自动安装

---

## 6. 注意事项

1. **页面需要添加 data-testid**: 为关键元素添加 `data-testid` 属性，提高测试稳定性
2. **API Mock**: 考虑使用 `page.route()` 模拟 API 响应
3. **并行执行**: 测试用例需要独立，避免数据污染
4. **CI/CD 集成**: 配置 GitHub Actions 或 Jenkins 自动运行测试
