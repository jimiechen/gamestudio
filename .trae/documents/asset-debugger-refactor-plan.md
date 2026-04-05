# HoloPix 素材调试器 - 功能重构计划

## 一、现状分析

### 1.1 两个版本对比

| 特性 | index.html (完整版) | index2.html (重构版) |
|------|---------------------|----------------------|
| **架构** | 单体 HTML + 内嵌 JS/CSS | 模块化 JS + 分离 CSS |
| **JS 组织** | 所有功能内联在 HTML 中 | ES6 模块 (main.js + 多个模块) |
| **事件绑定** | inline onclick | data-action + 事件委托 |
| **状态管理** | 全局变量 | state.js 集中管理 |
| **CSS** | 内嵌 style 标签 | 分离的 base.css + components.css + modal.css |
| **可用性** | ✅ 功能完整可用 | ❌ 无法使用 (模块加载问题) |

### 1.2 index2.html 存在的问题

#### 问题 1: ES6 模块兼容性问题
```html
<!-- index2.html 使用 ES6 模块 -->
<script type="module" src="js/main.js"></script>

<!-- 但 Flask 静态文件服务可能不支持 module 类型 -->
```

**影响**: 浏览器可能无法正确加载模块，导致页面白屏或功能失效。

#### 问题 2: 事件委托与 inline onclick 混用
```html
<!-- index2.html 中混用两种方式 -->
<div class="tab" data-action="switchTab" data-tab="generate">生成素材</div>
<button onclick="expandAllDetails()">展开全部</button>  <!-- 未定义 -->
```

**影响**: 部分按钮点击报错，函数未定义。

#### 问题 3: 功能缺失对比

| 功能模块 | index.html | index2.html | 状态 |
|----------|------------|-------------|------|
| 文生图参数配置 | ✅ 完整 (5组参数) | ⚠️ 简化 (4组，缺少参考图片) | 需补齐 |
| 模型列表筛选 | ✅ 6种筛选条件 | ⚠️ 基础筛选 | 需补齐 |
| 模型详情展开 | ✅ 完整详情展示 | ⚠️ 简化 | 需补齐 |
| 多模型选择 | ✅ 支持 | ❌ 缺失 | 需补齐 |
| 任务详情弹框 | ✅ 参数对比 | ⚠️ 基础 | 需补齐 |
| 生成进度轮询 | ✅ 完整 | ⚠️ 占位 | 需补齐 |
| 快捷应用配置 | ✅ 完整 | ⚠️ 基础 | 需补齐 |
| 火柴人编辑器 | ✅ 完整功能 | ⚠️ 简化 | 需补齐 |

#### 问题 4: API 调用不一致
- index.html 使用 `/api/models/sync` POST
- index2.html 可能缺少某些 API 封装

#### 问题 5: 状态管理未完全集成
- state.js 定义了状态，但部分模块仍使用全局变量
- 状态更新后 UI 未同步

---

## 二、重构目标

### 2.1 核心目标
1. **保持功能完整**: 不丢失 index.html 的任何功能
2. **架构现代化**: 采用模块化、组件化架构
3. **解决兼容性问题**: 确保在 Flask 环境下正常工作
4. **提升可维护性**: 代码结构清晰，易于扩展

### 2.2 技术选型
- **JS 加载方式**: 传统 `<script>` 标签 (非 ES6 module)，兼容 Flask
- **代码组织**: IIFE (立即执行函数) 模拟模块，合并到单一 app.js
- **事件系统**: 统一使用 data-action 事件委托
- **状态管理**: 全局状态对象 + 订阅模式

---

## 三、重构方案

### 3.1 文件结构重构

```
server/static/
├── index.html              # 主页面 (重构后)
├── css/
│   ├── base.css           # 基础样式 (已存在)
│   ├── components.css     # 组件样式 (已存在)
│   ├── modal.css          # 弹框样式 (已存在)
│   └── generate.css       # 生成页面专用样式 (新增)
└── js/
    └── app.js             # 合并后的单一 JS 文件 (重构)
```

### 3.2 JS 架构重构

采用 **Namespace Pattern** 组织代码：

```javascript
// 全局命名空间
window.HoloPix = {
    // 状态管理
    State: { ... },
    
    // API 封装
    API: { ... },
    
    // UI 组件
    UI: {
        Tabs: { ... },
        Modal: { ... },
        Notification: { ... }
    },
    
    // 功能模块
    Modules: {
        Generate: { ... },      // 文生图
        Models: { ... },        // 模型列表
        Tasks: { ... },         // 任务列表
        Assets: { ... },        // 素材库
        Stickman: { ... },      // 火柴人
        QuickPresets: { ... }   // 快捷应用
    },
    
    // 初始化
    init() { ... }
};
```

### 3.3 HTML 结构标准化

统一使用 `data-action` 属性：

```html
<!-- 标签页 -->
<div class="tab active" data-action="switchTab" data-tab="generate">生成素材</div>

<!-- 按钮 -->
<button data-action="generateImage">生成图片</button>
<button data-action="syncModels">同步模型</button>

<!-- 带参数的按钮 -->
<button data-action="loadPreset" data-preset="standing">站立</button>
```

### 3.4 功能模块详细设计

#### 3.4.1 文生图模块 (Generate)

**功能清单**:
- [ ] 模型选择 (多选，最多5个)
- [ ] 预设模型组合快捷按钮
- [ ] 正向/反向提示词
- [ ] 画面比例、随机种子、出图数量
- [ ] 增强选项 (脸部修复、高清修复、简单背景、画面增强)
- [ ] 参考图片 (形象样式、火柴人姿势)
- [ ] 生成按钮 + 进度展示
- [ ] 生成结果展示
- [ ] 生成历史

**参数配置** (与 index.html 保持一致):
```javascript
const generateParams = {
    model_detail_list: [],      // 模型列表
    prompt: '',                 // 正向提示词
    negative_prompt: '',        // 反向提示词
    aspect_ratios: '1:1',       // 画面比例
    seed: -1,                   // 随机种子
    batch_size: 1,              // 出图数量
    hd_fix: false,              // 高清修复
    hd_scale: 1.5,              // 高清倍数
    face_detail: false,         // 脸部修复
    enable_perturb: false,      // 画面增强
    perturb: 5,                 // 增强强度
    simple_background: false,   // 简单背景
    image_reference: '',        // 形象参考图
    reference_mode: 'standard', // 参考模式
    reference_weight: 0.8,      // 参考权重
    character_pose: ''          // 姿势参考图
};
```

#### 3.4.2 模型列表模块 (Models)

**功能清单**:
- [ ] 同步模型列表
- [ ] 模型表格展示
- [ ] 展开/收起详情
- [ ] 置顶/隐藏操作
- [ ] 多维度筛选 (类型、风格、基础模型、标签、名称、ID)
- [ ] 多模型选择 (复选框)
- [ ] 多模型生成弹框
- [ ] 复制模型信息

#### 3.4.3 任务列表模块 (Tasks)

**功能清单**:
- [ ] 任务列表展示
- [ ] 任务详情弹框 (参数对比)
- [ ] 查询任务状态
- [ ] 下载生成结果
- [ ] 复制任务参数

#### 3.4.4 素材库模块 (Assets)

**功能清单**:
- [ ] 素材网格展示
- [ ] 图片预览
- [ ] 下载素材
- [ ] 删除素材

#### 3.4.5 火柴人模块 (Stickman)

**功能清单**:
- [ ] Canvas 编辑器
- [ ] 预设姿势加载
- [ ] 姿势保存
- [ ] PNG 导出
- [ ] 姿势描述生成
- [ ] 用于文生图

#### 3.4.6 快捷应用模块 (QuickPresets)

**功能清单**:
- [ ] 保存当前配置
- [ ] 加载已保存配置
- [ ] 收藏配置
- [ ] 删除配置

---

## 四、实施步骤

### 阶段 1: 基础架构搭建
1. [ ] 创建新的 app.js 框架 (Namespace Pattern)
2. [ ] 实现事件委托系统
3. [ ] 实现状态管理
4. [ ] 实现 API 封装层

### 阶段 2: 核心功能迁移
1. [ ] 迁移标签页切换功能
2. [ ] 迁移文生图功能 (完整参数)
3. [ ] 迁移模型列表功能
4. [ ] 迁移任务列表功能

### 阶段 3: 高级功能迁移
1. [ ] 迁移素材库功能
2. [ ] 迁移火柴人编辑器
3. [ ] 迁移快捷应用功能
4. [ ] 迁移多模型生成功能

### 阶段 4: 测试与优化
1. [ ] 功能完整性测试
2. [ ] 兼容性测试 (不同浏览器)
3. [ ] 性能优化
4. [ ] 代码清理

---

## 五、关键代码示例

### 5.1 事件委托系统

```javascript
// 事件委托初始化
HoloPix.EventDelegation = {
    init() {
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;
            
            const action = actionEl.dataset.action;
            const handler = this.handlers[action];
            
            if (handler) {
                handler(actionEl, e);
            } else {
                console.warn(`未找到处理函数: ${action}`);
            }
        });
    },
    
    handlers: {
        switchTab: (el) => HoloPix.Modules.Tabs.switch(el.dataset.tab),
        generateImage: () => HoloPix.Modules.Generate.submit(),
        syncModels: () => HoloPix.Modules.Models.sync(),
        // ... 更多处理器
    }
};
```

### 5.2 状态管理

```javascript
HoloPix.State = {
    data: {
        allModels: [],
        selectedModels: [{ modelId: 2, strength: 0.9 }],
        activeFilters: { ... },
        currentTab: 'generate',
        generationHistory: []
    },
    
    listeners: {},
    
    get(key) {
        return this.data[key];
    },
    
    set(key, value) {
        this.data[key] = value;
        this.notify(key, value);
    },
    
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    },
    
    notify(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(cb => cb(value));
        }
    }
};
```

### 5.3 API 封装

```javascript
HoloPix.API = {
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
    
    queryTask: (clientId) => this.request(`/api/query/${clientId}`),
    
    // 模型相关
    syncModels: () => this.request('/api/models/sync', { method: 'POST' }),
    getModels: () => this.request('/api/models'),
    getModelDetail: (id) => this.request(`/api/models/${id}`),
    toggleHidden: (id, isHidden) => this.request(`/api/models/${id}/hidden`, {
        method: 'POST',
        body: JSON.stringify({ is_hidden: isHidden })
    }),
    togglePin: (id, isPinned) => this.request(`/api/models/${id}/pin`, {
        method: 'POST',
        body: JSON.stringify({ is_pinned: isPinned })
    }),
    
    // 任务相关
    getTasks: () => this.request('/api/tasks'),
    getTaskDetail: (id) => this.request(`/api/generate/${id}`),
    
    // 素材相关
    getAssets: () => this.request('/api/assets'),
    deleteAsset: (id) => this.request(`/api/assets/${id}`, { method: 'DELETE' }),
    
    // 快捷应用
    getQuickPresets: () => this.request('/api/quick-presets'),
    saveQuickPreset: (data) => this.request('/api/quick-presets', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};
```

---

## 六、验收标准

### 6.1 功能验收
- [ ] 所有 index.html 的功能在重构版中可用
- [ ] 文生图参数与原版完全一致
- [ ] 模型列表筛选功能完整
- [ ] 任务详情参数对比正常
- [ ] 火柴人编辑器功能完整
- [ ] 快捷应用功能正常

### 6.2 兼容性验收
- [ ] 在 Flask 静态文件服务下正常工作
- [ ] Chrome/Firefox/Edge 最新版正常
- [ ] 无 ES6 模块相关报错

### 6.3 代码质量验收
- [ ] 无 inline onclick
- [ ] 统一使用 data-action
- [ ] 代码结构清晰，有适当注释
- [ ] 无 console.error 报错

---

## 七、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 功能遗漏 | 高 | 对照功能清单逐项检查 |
| 浏览器兼容 | 中 | 使用传统 JS，避免新特性 |
| 性能下降 | 低 | 代码分割，按需加载 |
| API 变更 | 低 | 封装 API 层，统一入口 |
