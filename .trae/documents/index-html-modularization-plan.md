# index.html 模块化优化方案

## 当前文件分析

**文件路径**: `projects/asset-debugger/server/static/index.html`
**当前行数**: 约 3895 行
**文件大小**: 约 179KB

### 文件结构分析

当前文件包含以下主要模块：

1. **CSS 样式部分** (第 7-630 行, ~624 行)
   - 基础样式、布局、组件样式
   - 弹框样式、表格样式
   - 动画效果

2. **HTML 结构部分** (第 632-983 行, ~352 行)
   - 5 个主要标签页：生成素材、模型列表、任务列表、素材库、火柴人调试
   - 各个标签页的表单和展示区域

3. **JavaScript 代码部分** (第 984-3893 行, ~2910 行)
   - 标签页切换、图片生成
   - 模型管理（列表、筛选、置顶、隐藏）
   - 任务管理（列表、详情、轮询）
   - 素材库管理
   - 火柴人编辑器（Canvas 绘制、姿势管理）
   - 快捷应用管理
   - 生成任务轮询器

---

## 优化方案

### 目标
- 每个文件不超过 500 行
- 按功能模块分离
- 保持原有功能不变
- 使用 ES6 模块系统

### 文件结构规划

```
projects/asset-debugger/server/static/
├── index.html                    # 入口文件 (~150 行)
├── css/
│   ├── base.css                  # 基础样式 (~200 行)
│   ├── components.css            # 组件样式 (~250 行)
│   ├── modal.css                 # 弹框样式 (~150 行)
│   └── stickman.css              # 火柴人编辑器样式 (~100 行)
├── js/
│   ├── main.js                   # 入口初始化 (~100 行)
│   ├── utils.js                  # 工具函数 (~150 行)
│   ├── api.js                    # API 接口封装 (~200 行)
│   ├── tabs.js                   # 标签页管理 (~100 行)
│   ├── models/
│   │   ├── index.js              # 模型管理主模块 (~150 行)
│   │   ├── display.js            # 模型列表渲染 (~200 行)
│   │   ├── filter.js             # 筛选功能 (~150 行)
│   │   ├── selection.js          # 多模型选择 (~150 行)
│   │   └── detail.js             # 模型详情 (~150 行)
│   ├── generate/
│   │   ├── index.js              # 生成素材主模块 (~150 行)
│   │   ├── form.js               # 表单处理 (~200 行)
│   │   ├── model-selector.js     # 模型选择器 (~150 行)
│   │   ├── presets.js            # 预设组合 (~150 行)
│   │   └── poller.js             # 任务轮询器 (~200 行)
│   ├── tasks/
│   │   ├── index.js              # 任务列表 (~150 行)
│   │   └── detail.js             # 任务详情弹框 (~200 行)
│   ├── assets/
│   │   └── index.js              # 素材库管理 (~150 行)
│   ├── stickman/
│   │   ├── index.js              # 火柴人编辑器主模块 (~150 行)
│   │   ├── canvas.js             # Canvas 绘制 (~200 行)
│   │   ├── poses.js              # 姿势管理 (~150 行)
│   │   └── editor.js             # 编辑器交互 (~200 行)
│   └── quick-presets/
│       └── index.js              # 快捷应用管理 (~200 行)
└── components/
    ├── modal.js                  # 弹框组件 (~150 行)
    └── notification.js           # 通知组件 (~100 行)
```

---

## 详细拆分计划

### 第一阶段：CSS 分离

#### 1.1 base.css (基础样式)
```css
/* 第 7-130 行提取 */
- * reset 样式
- body 基础样式
- container 布局
- 标题样式
- tabs 基础样式
- card 组件基础样式
- form 基础样式
- btn 按钮基础样式
```

#### 1.2 components.css (组件样式)
```css
/* 第 130-400 行提取 */
- params-grid 参数网格
- param-row 参数行
- model-table 模型表格
- asset-grid 素材网格
- asset-card 素材卡片
- result-box 结果展示
- status-badge 状态标签
- task-list 任务列表
- loading 加载动画
- filter-bar 筛选栏
```

#### 1.3 modal.css (弹框样式)
```css
/* 第 411-630 行提取 */
- modal-overlay 弹框遮罩
- modal-container 弹框容器
- modal-header/body/footer 弹框结构
- param-table 参数对比表格
- image-preview-modal 图片预览
- badge 标签样式
```

#### 1.4 stickman.css (火柴人样式)
```css
/* 火柴人相关样式 */
- stickmanCanvas 画布样式
- 姿势列表样式
- 编辑器工具栏样式
```

---

### 第二阶段：JavaScript 核心模块分离

#### 2.1 utils.js (工具函数)
```javascript
/* 提取通用工具函数 */
- showNotification() 通知显示
- escapeHtml() HTML 转义
- closeModal() 关闭弹框
- showImagePreview() 图片预览
```

#### 2.2 api.js (API 接口)
```javascript
/* 封装所有 API 调用 */
- fetch API 封装
- 错误处理
- 请求/响应拦截
```

#### 2.3 tabs.js (标签页管理)
```javascript
/* 第 985-997 行提取 */
- switchTab() 切换标签页
- 标签页状态管理
```

---

### 第三阶段：模型管理模块分离

#### 3.1 models/index.js
```javascript
/* 模型管理主入口 */
- syncModels() 同步模型
- loadModels() 加载模型
- useModel() 使用模型
- updateGenerateForm() 更新表单
```

#### 3.2 models/display.js
```javascript
/* 第 1116-1335 行提取 */
- displayModels() 显示模型列表
- getFilterOptions() 获取筛选选项
- 表格渲染逻辑
```

#### 3.3 models/filter.js
```javascript
/* 第 1337-1382 行提取 */
- updateFilter() 更新筛选
- applyNameSearch() 名称搜索
- applyModelIdFilter() ID筛选
- clearAllFilters() 清除筛选
```

#### 3.4 models/selection.js
```javascript
/* 第 1355-1504 行提取 */
- toggleSelectAllModels() 全选
- updateModelSelection() 更新选择
- openMultiModelGenerateModal() 多模型生成弹框
- submitMultiModelGenerate() 提交生成
```

#### 3.5 models/detail.js
```javascript
/* 第 1891-1971 行提取 */
- toggleModelDetail() 切换详情
- displayModelDetail() 显示详情
- expandAllDetails() 展开全部
- collapseAllDetails() 收起全部
```

#### 3.6 models/actions.js
```javascript
/* 模型操作 */
- toggleHidden() 隐藏/显示
- togglePin() 置顶/取消置顶
- copyModelInfo() 复制信息
```

---

### 第四阶段：生成素材模块分离

#### 4.1 generate/index.js
```javascript
/* 生成素材主入口 */
- generateImage() 生成图片
- 全局变量管理
```

#### 4.2 generate/form.js
```javascript
/* 表单处理 */
- 表单验证
- 数据收集
- 参数处理逻辑
```

#### 4.3 generate/model-selector.js
```javascript
/* 第 2535-2623 行提取 */
- openModelSelector() 打开选择器
- closeModelSelector() 关闭选择器
- addModel() 添加模型
- renderSelectedModels() 渲染已选模型
```

#### 4.4 generate/presets.js
```javascript
/* 第 2431-2494 行提取 */
- presetModelCombos 预设组合
- renderPresetModelComboButtons() 渲染按钮
- applyPresetModelCombo() 应用预设
```

#### 4.5 generate/poller.js
```javascript
/* 第 3578-3883 行提取 */
- GenerationPoller 类
- 轮询逻辑
- 历史记录管理
```

---

### 第五阶段：任务管理模块分离

#### 5.1 tasks/index.js
```javascript
/* 第 1973-2049 行提取 */
- loadTasks() 加载任务
- displayTasks() 显示任务列表
- queryTask() 查询任务
- downloadTask() 下载任务
```

#### 5.2 tasks/detail.js
```javascript
/* 第 2051-2273 行提取 */
- viewTaskDetail() 查看详情
- showTaskDetailModal() 显示详情弹框
- copyTaskParams() 复制参数
```

---

### 第六阶段：素材库模块分离

#### 6.1 assets/index.js
```javascript
/* 第 2321-2424 行提取 */
- loadAssets() 加载素材
- displayAssets() 显示素材
- deleteAsset() 删除素材
```

---

### 第七阶段：火柴人编辑器模块分离

#### 7.1 stickman/index.js
```javascript
/* 火柴人编辑器入口 */
- stickmanEditor 对象
- 初始化逻辑
```

#### 7.2 stickman/canvas.js
```javascript
/* 第 2803-2853 行提取 */
- draw() 绘制函数
- 颜色配置
- 连接线绘制
- 关节点绘制
```

#### 7.3 stickman/poses.js
```javascript
/* 第 3000-3116 行提取 */
- loadPoseList() 加载姿势列表
- renderPoseList() 渲染列表
- loadPoseById() 加载指定姿势
- deletePose() 删除姿势
- filterPoses() 筛选姿势
```

#### 7.4 stickman/editor.js
```javascript
/* 编辑器交互 */
- loadPreset() 加载预设
- resetPose() 重置姿势
- savePose() 保存姿势
- exportPNG() 导出图片
- generateDescription() 生成描述
- useInGeneration() 用于文生图
```

#### 7.5 stickman/pose-selector.js
```javascript
/* 第 3122-3246 行提取 */
- openStickmanPoseModal() 打开姿势选择
- selectStickmanPose() 选择姿势
- clearStickmanPose() 清除姿势
```

---

### 第八阶段：快捷应用模块分离

#### 8.1 quick-presets/index.js
```javascript
/* 第 3248-3494 行提取 */
- loadQuickPresets() 加载列表
- saveQuickPreset() 保存配置
- openQuickPresetModal() 打开弹框
- applyQuickPreset() 应用配置
- togglePresetFavorite() 切换收藏
- deleteQuickPreset() 删除配置
```

---

## 实施步骤

### 步骤 1: 创建目录结构
```bash
mkdir -p projects/asset-debugger/server/static/css
mkdir -p projects/asset-debugger/server/static/js/{models,generate,tasks,assets,stickman,quick-presets}
mkdir -p projects/asset-debugger/server/static/components
```

### 步骤 2: 分离 CSS
1. 创建 `css/base.css` - 提取基础样式
2. 创建 `css/components.css` - 提取组件样式
3. 创建 `css/modal.css` - 提取弹框样式
4. 创建 `css/stickman.css` - 提取火柴人样式

### 步骤 3: 分离 JavaScript 核心模块
1. 创建 `js/utils.js` - 工具函数
2. 创建 `js/api.js` - API 封装
3. 创建 `js/tabs.js` - 标签页管理
4. 创建 `js/main.js` - 入口初始化

### 步骤 4: 分离模型管理模块
1. 创建 `js/models/index.js`
2. 创建 `js/models/display.js`
3. 创建 `js/models/filter.js`
4. 创建 `js/models/selection.js`
5. 创建 `js/models/detail.js`
6. 创建 `js/models/actions.js`

### 步骤 5: 分离生成素材模块
1. 创建 `js/generate/index.js`
2. 创建 `js/generate/form.js`
3. 创建 `js/generate/model-selector.js`
4. 创建 `js/generate/presets.js`
5. 创建 `js/generate/poller.js`

### 步骤 6: 分离任务管理模块
1. 创建 `js/tasks/index.js`
2. 创建 `js/tasks/detail.js`

### 步骤 7: 分离素材库模块
1. 创建 `js/assets/index.js`

### 步骤 8: 分离火柴人编辑器模块
1. 创建 `js/stickman/index.js`
2. 创建 `js/stickman/canvas.js`
3. 创建 `js/stickman/poses.js`
4. 创建 `js/stickman/editor.js`
5. 创建 `js/stickman/pose-selector.js`

### 步骤 9: 分离快捷应用模块
1. 创建 `js/quick-presets/index.js`

### 步骤 10: 重构 index.html
- 引入所有 CSS 文件
- 引入所有 JS 模块
- 保留最小化的 HTML 结构

---

## 预期结果

| 文件 | 预期行数 | 实际行数 |
|------|----------|----------|
| index.html | ~150 | 3895 |
| css/base.css | ~200 | - |
| css/components.css | ~250 | - |
| css/modal.css | ~150 | - |
| css/stickman.css | ~100 | - |
| js/utils.js | ~150 | - |
| js/api.js | ~200 | - |
| js/main.js | ~100 | - |
| js/models/*.js | ~800 (6个文件) | - |
| js/generate/*.js | ~900 (5个文件) | - |
| js/tasks/*.js | ~350 (2个文件) | - |
| js/assets/*.js | ~150 (1个文件) | - |
| js/stickman/*.js | ~700 (5个文件) | - |
| js/quick-presets/*.js | ~200 (1个文件) | - |

**总计**: 约 20 个文件，每个文件平均 200 行左右，最大不超过 500 行。

---

## 注意事项

1. **依赖管理**: 确保模块间的依赖关系正确
2. **全局变量**: 将全局变量转换为模块导出/导入
3. **事件绑定**: 确保 DOM 加载完成后初始化
4. **兼容性**: 保持原有浏览器兼容性
5. **测试**: 每个模块分离后都需要测试功能正常
