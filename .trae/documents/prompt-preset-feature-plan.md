# 提示词选项卡 + 弹框选择器 — 需求分析与实现方案

> **需求来源**: 为生成素材页面增加提示词管理能力，支持正向/反向提示词的预设选择、管理、复用
> **涉及模块**: 前端新增 PromptPresets 模块 + 后端 API 扩展 + 数据库增强
> **预估工作量**: 3\~4小时

***

## 一、现状分析

### 1.1 已有能力

| 组件                      | 状态    | 说明                                                                            |
| ----------------------- | ----- | ----------------------------------------------------------------------------- |
| `prompt_presets` 数据库表   | ✅ 已有  | 含 name/category/prompt\_template/negative\_prompt/default\_params/description |
| `PromptPreset` Model    | ✅ 已有  | 支持 create/get\_all/get\_by\_name                                              |
| `/api/presets` GET/POST | ✅ 已有  | 后端API已就绪                                                                      |
| 模型选择器弹窗模式               | ✅ 可参考 | `modelSelectorModal` 的交互模式可直接复用                                               |

### 1.2 当前痛点

```
当前用户输入提示词流程:
  用户手动在 textarea 中敲入 → 无历史记录 → 无模板 → 无法复用 → 每次从零开始

期望流程:
  从预设库选择基础模板 → 一键填入 → 微调修改 → 可保存为新预设 → 下次直接选用
```

**具体问题**：

1. 正向/反向提示词只有裸 textarea，无辅助输入能力
2. 已有 `prompt_presets` 表和后端API，但**前端完全没有对应的UI**
3. 用户无法分类管理常用提示词（角色/场景/风格/动作等）
4. 反向提示词（negativePrompt）同样缺乏模板支持

***

## 二、需求梳理

### 2.1 功能范围

| #   | 功能            | 优先级 | 说明                                                                             |
| --- | ------------- | --- | ------------------------------------------------------------------------------ |
| F1  | **提示词选项卡**    | P0  | 在主标签栏新增"📝 提示词库"标签页，作为提示词管理中心                                                  |
| F2  | **正向提示词选择弹窗** | P0  | 在生成页的 prompt textarea 旁增加"📋 选择模板"按钮，弹出选择器                                     |
| F3  | **反向提示词选择弹窗** | P0  | 在 negativePrompt textarea 旁增加"📋 选择模板"按钮，共用同一套选择器                              |
| F4  | **预设列表展示**    | P0  | 分类展示所有提示词预设（卡片式），支持搜索/筛选                                                       |
| F5  | **一键应用预设**    | P0  | 点击预设卡片 → 自动填充到对应 textarea（支持追加/替换两种模式）                                         |
| F6  | **创建新预设**     | P1  | 在选项卡内提供创建表单：名称 + 分类 + 正向/反向提示词 + 描述                                            |
| F7  | **编辑/删除预设**   | P1  | 对已保存的预设支持编辑和删除操作                                                               |
| F8  | **从当前输入快速保存** | P1  | 在生成页提供"💾 存为预设"按钮，一键将当前正/反提示词存入库                                               |
| F9  | **预设分类体系**    | P1  | 内置分类：character(角色)/scene(场景)/style(风格)/action(动作)/quality(质量增强)/negative(专用反向) |
| F10 | **预设导入/导出**   | P2  | 支持JSON格式批量导入导出预设                                                               |

### 2.2 不做（边界）

* ❌ 不做提示词AI自动补全（复杂度高，独立功能）

* ❌ 不做提示词语法高亮（低优先级）

* ❌ 不做版本历史/回滚（过度设计）

* ❌ 不改后端数据库结构（现有表足够用）

***

## 三、交互设计方案

### 3.1 整体布局

```
┌─────────────────────────────────────────────────────────────┐
│  标签栏                                                    │
│ [🎨 生成素材] [📋 模型列表] [📋 任务列表] [🖼️ 素材库]      │
│ [🎭 火柴人调试] [🎬 图生视频] [📝 提示词库] ← 新增         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 生成页 — 提示词区域改造

改造前：

```
┌──────────────────────────────────────┐
│ 📝 2. 文本提示词                      │
│ ┌──────────────────────────────────┐ │
│ │ 正向提示词 (prompt) *             │ │
│ │ ┌────────────────────────────┐   │ │
│ │ │  (大textarea，纯手动输入)    │   │ │
│ │ └────────────────────────────┘   │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 反向提示词 (negativePrompt)      │ │
│ │ ┌────────────────────────────┐   │ │
│ │ │  (大textarea，纯手动输入)    │   │ │
│ │ └────────────────────────────┘   │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

改造后：

```
┌──────────────────────────────────────────────────────┐
│ 📝 2. 文本提示词                                      │
│                                                      │
│ 正向提示词 (prompt) *          [📋 选择模板] [💾 保存] │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Q版三国武将关羽，大头小身二头身比例...              │ │
│ └──────────────────────────────────────────────────┘ │
│ 最近使用: [关羽立绘] [Q版角色] [战斗姿势] [+清除记录]  │
│                                                      │
│ 反向提示词 (negativePrompt)    [📋 选择模板] [💾 保存] │
│ ┌──────────────────────────────────────────────────┐ │
│ │ 3d, realistic, blurry, low quality, deformed...  │ │
│ └──────────────────────────────────────────────────┘ │
│ 最近使用: [通用反向] [质量增强反向] [+清除记录]        │
└──────────────────────────────────────────────────────┘
```

### 3.3 提示词选择弹窗

```
┌─ 提示词模板选择器 ──────────────────────────────────────┐  ↑ 居中模态弹窗
│                                                       │
│ 🔍 [搜索提示词...]           分类: [全部 ▾]            │
│                                                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ 👤 角色   │ │ 🏞️ 场景   │ │ 🎨 风格   │ │ 🏃 动作   │  │  ← 分类Tab
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│ ┌──────────┐ ┌──────────┐                              │
│ │ ⭐ 质量   │ │ 🚫 反向  │                              │
│ └──────────┘ └──────────┘                              │
│                                                       │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ 📜 关羽立绘完整版     │ │ 📜 Q版角色通用版     │       │  ← 卡片网格
│ │ Q版三国武将关羽...   │ │ Q版卡通角色，大头小  │       │
│ │ 🏷️ character  ⭐     │ │ 身...               │       │
│ │ [应用到正向] [预览]   │ │ 🏷️ character        │       │
│ └─────────────────────┘ └─────────────────────┘       │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ 📜 战斗攻击动作      │ │ 📜 行走循环动画      │       │
│ │ 角色挥刀攻击...     │ │ 角色向前行走...     │       │
│ │ 🏷️ action           │ │ 🏷️ action           │       │
│ │ [应用到正向] [预览]   │ │ [应用到正向] [预览]   │       │
│ └─────────────────────┘ └─────────────────────┘       │
│ ...更多卡片...                                       │
│                                                       │
│                    [取消]              │
└───────────────────────────────────────────────────────┘
```

### 3.4 提示词库选项卡（独立管理页）

```
┌─ 📝 提示词库 ──────────────────────────────────────────┐
│                                                       │
│ [+ 新建预设]  [📥 导入]  [📤 导出]                     │
│                                                       │
│ 🔍 [搜索...]  分类: [全部 ▾]  排序: [最近使用 ▾]      │
│                                                       │
│ ┌───────────────────────────────────────────────────┐ │
│ │ 📜 关羽立绘完整版                    [编辑] [删除]  │ │
│ │                                                   │ │
│ │ 正向: Q版三国武将关羽，大头小身二头身比例...       │ │
│ │ 反向: 3d, realistic, blurry, low quality...        │ │
│ │ 分类: character  │  使用次数: 12  │  创建: 04-05  │ │
│ └───────────────────────────────────────────────────┘ │
│ ...更多预设卡片...                                    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

***

## 四、技术方案

### 4.1 新增文件清单

| 文件                             | 类型 | 说明                 |
| ------------------------------ | -- | ------------------ |
| `static/js/modules/prompts.js` | 新增 | 提示词核心模块（选择器+选项卡逻辑） |
| `static/css/prompts.css`       | 新增 | 提示词相关样式（弹窗、卡片、选项卡） |

### 4.2 修改文件清单

| 文件                         | 改动内容                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `static/index3.html`       | ① 标签栏增加"📝 提示词库"标签 ② 生成页提示词区域增加按钮和最近使用栏 ③ 增加提示词选择弹窗DOM ④ 增加提示词库选项卡DOM               |
| `static/js/app.js`         | 初始化 Prompts 模块                                                                      |
| `static/js/modules/api.js` | 增加 getPresets/createPreset/updatePreset/deletePreset/exportPresets/importPresets 方法 |
| `server/app.py`            | 增加 PUT/DELETE `/api/presets/<id>` 接口 + 导入导出接口                                       |
| `server/models.py`         | PromptPreset 类增加 update/delete/get\_by\_id 方法                                       |

### 4.3 模块架构

```
Prompts 模块 (prompts.js)
├── 状态
│   ├── presets[]           // 所有预设缓存
│   ├── categories[]        // 分类列表
│   ├── recentPrompts[]     // 最近使用的预设（正向/反向各5条）
│   └── currentTarget       // 当前打开选择器的目标: 'prompt' | 'negativePrompt'
│
├── 核心方法
│   ├── init()                           // 初始化绑定事件
│   ├── openSelector(target)             // 打开选择弹窗（target指定填充目标）
│   ├── closeSelector()                  // 关闭弹窗
│   ├── renderSelectorCards(category)    // 渲染弹窗内的预设卡片
│   ├── applyPreset(presetId, mode)      // 应用预设到目标textarea
│   │                                     // mode: 'replace' | 'append'
│   ├── saveCurrentAsPreset(target)       // 将当前textarea内容保存为新预设
│   ├── renderRecentPrompts(target)       // 渲染"最近使用"快捷标签
│   │
│   ├── // 选项卡页方法
│   ├── renderLibraryPage()              // 渲染提示词库选项卡内容
│   ├── openCreateModal()                // 打开新建预设弹窗
│   ├── openEditModal(presetId)          // 打开编辑预设弹窗
│   ├── deletePreset(presetId)           // 删除预设（带确认）
│   ├── exportPresets()                  // 导出为JSON文件
│   ├── importPresets(file)              // 从JSON文件导入
│   └── searchPresets(keyword)            // 搜索过滤
│
└── DOM结构（index3.html中新增）
    ├── #promptSelectorModal             // 选择器弹窗（复用模型选择器样式）
    │   ├── .prompt-search-bar           // 搜索栏
    │   ├── .prompt-category-tabs        // 分类Tab
    │   ├── .prompt-cards-grid           // 卡片网格
    │   └── .prompt-apply-mode          // 应用模式切换: 替换 / 追加
    │
    ├── #promptLibraryContent           // 提示词库选项卡内容区
    │   ├── .library-toolbar            // 工具栏（新建/导入/导出）
    │   ├── .library-filter-bar        // 筛选栏
    │   └── .library-presets-grid       // 预设卡片列表
    │
    └── #promptCreateModal              // 新建/编辑预设弹窗
        ├── input[name="presetName"]
        ├── select[name="category"]
        ├── textarea[name="promptTemplate"]
        ├── textarea[name="negativePrompt"]
        └── textarea[name="description"]
```

### 4.4 弹窗交互状态机

```
                   ┌──────────────┐
                   │   页面初始    │
                   └──────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               │
   [点击正向📋按钮]  [点击反向📋按钮]    │
          │               │               │
          ↓               ↓               │
   currentTarget =   currentTarget =      │
   'prompt'          'negativePrompt'    │
          │               │               │
          └───────┬───────┘               │
                  ↓                        │
         ┌──────────────┐                 │
         │ 显示选择弹窗   │                 │
         │ 加载预设列表   │                 │
         └──────┬───────┘                 │
                │                          │
   ┌────────────┼────────────┐            │
   ↓            ↓            ↓            │
[点击卡片]  [切换分类]   [搜索]          │
   │            │            │            │
   ↓            ↓            ↓            │
[应用预设到]  [过滤显示]   [过滤显示]       │
currentTarget                      │
textarea                            │
   │                                 │
   ↓                                 │
[关闭弹窗]                           │
   │                                 │
   ↓                                 │
[更新最近使用栏]─────────────────────┘
```

### 4.5 与现有模块的关系

```
┌─────────────┐     调用      ┌─────────────┐
│  Generate   │ ──────────→  │   Prompts    │
│ (生成模块)   │  openSelector│  (提示词模块) │
│             │  applyPreset │              │
└─────────────┘             └──────┬───────┘
                                   │
                             调用 API
                                   │
                                   ↓
                            ┌─────────────┐
                            │  API 模块    │
                            │ /api/presets │
                            └──────┬───────┘
                                   │
                                   ↓
                            ┌─────────────┐
                            │ Flask 后端   │
                            │ PromptPreset │
                            └─────────────┘
```

### 4.6 数据流

```
用户点击"选择模板"
    │
    ▼
Prompts.openSelector('prompt')   ← 记录目标为正向提示词
    │
    ▼
API.getPresets()                  ← GET /api/presets?category=xxx
    │
    ▼
渲染预设卡片列表
    │
    ▼
用户点击某个预设卡片
    │
    ▼
Prompts.applyPreset(id, 'replace')
    │
    ├─→ 将 preset.prompt_template 写入 #prompt textarea
    ├─→ 若该预设有 negative_prompt 且当前目标是负向 → 同时写入 #negativePrompt
    ├─→ 更新 recentPromets（去重+限5条）→ 存 localStorage
    └─→ 关闭弹窗
```

***

## 五、后端 API 变更

### 5.1 新增接口

| 方法     | 路径                    | 说明          |
| ------ | --------------------- | ----------- |
| PUT    | `/api/presets/<id>`   | 更新预设        |
| DELETE | `/api/presets/<id>`   | 删除预设        |
| GET    | `/api/presets/export` | 导出所有预设为JSON |
| POST   | `/api/presets/import` | 从JSON导入预设   |

### 5.2 现有接口增强

| 方法  | 路径             | 增强                                           |
| --- | -------------- | -------------------------------------------- |
| GET | `/api/presets` | 增加 `?keyword=xxx` 搜索参数 + `?sort=recent` 排序参数 |

### 5.3 PromptPreset Model 补充方法

```python
class PromptPreset:
    # 已有: create(), get_all(), get_by_name()
    
    @staticmethod
    def update(preset_id: int, data: Dict) -> bool: ...
    
    @staticmethod
    def delete(preset_id: int) -> bool: ...
    
    @staticmethod
    def get_by_id(preset_id: int) -> Optional[Dict]: ...
    
    @staticmethod
    def search(keyword: str) -> List[Dict]: ...
```

***

## 六、默认内置预设数据

首次启动时，通过 `StickmanPose.init_presets()` 同类机制，初始化一套内置提示词预设：

### 正向提示词预设

| 名称        | 分类        | prompt\_template                                                                   | negative\_prompt                                |
| --------- | --------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| Q版角色通用    | character | Q版卡通角色，{subject}，2.5头身比，大头小身体，可爱卡通风格，明亮色彩，粗黑线条，平涂色块，白色背景，2d游戏资产                    | 3d, realistic, photography, blurry, low quality |
| 三国武将-关羽   | character | 三国武将关羽，长须飘飘，红脸膛，绿巾冠，身披绿战袍，手持青龙偃月刀，Q版风格，俯视角45度，面朝画面下方，粗黑线条，白色背景                     | 3d, realistic, photograph, ugly, deformed       |
| 三国武将-张飞   | character | 三国武将张飞，豹头环眼，黑色铠甲，丈八蛇矛，Q版风格，威猛表情，粗黑线条，白色背景                                          | 3d, cute, feminine, slim                        |
| 战斗-挥刀斩击   | action    | {character}挥刀斩击动作，从右上方劈向左下方，动态姿态，衣袂飘动，力量感十足，Q版风格，纯色背景                              | static pose, standing still, peaceful           |
| 战斗-受击闪避   | action    | {character}受击向后闪避，双手护胸，惊讶表情，动态防御姿态，Q版风格                                            | standing calmly, no motion                      |
| 待机呼吸      | action    | {character}原地站立待机，轻微呼吸起伏，自然放松姿态，Q版风格，正面朝向                                          | aggressive, fast motion, combat                 |
| 行走循环      | action    | {character}向前行走循环动画，手臂自然摆动，步伐稳健，侧面视角，Q版风格                                          | running, flying, jumping                        |
| 古风场景-战场   | scene     | 古代战场场景，烽火台，战旗飘扬，远处军队阵列，烟尘弥漫，水墨画风格，俯视角                                              | modern, futuristic, sci-fi, clean               |
| 古风场景-营帐   | scene     | 古代军营场景，连绵营帐，篝火点点，士兵巡逻，夜晚星空，古风水墨风格                                                  | urban, indoor, bright daylight                  |
| 质量增强-标准   | quality   | masterpiece, best quality, highly detailed, 8k resolution, sharp focus             | lowres, bad anatomy, bad hands                  |
| 质量增强-游戏立绘 | quality   | game asset, sprite sheet ready, consistent proportions, clean lineart, flat colors | gradient, shading, complex background           |

### 专用反向提示词预设

| 名称      | 分类       | negative\_prompt                                                                                                            |
| ------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 通用反向-基础 | negative | 3d, render, sketch, painting, drawing, anime, cartoon, lowres, long neck, mutated hands, extra fingers, missing fingers     |
| 通用反向-质量 | negative | blurry, jpeg artifacts, watermark, signature, text, error, cropped, worst quality, low quality, normal quality              |
| 通用反向-构图 | negative | bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, duplicate, morbid, mutilated, out of frame |

***

## 七、实施步骤

| 步骤     | 内容                                                       | 文件                    | 时间         |
| ------ | -------------------------------------------------------- | --------------------- | ---------- |
| 1      | 后端：补充 PromptPreset 的 update/delete/search/get\_by\_id 方法 | models.py             | 15min      |
| 2      | 后端：补充 PUT/DELETE/export/import API 路由                    | app.py                | 20min      |
| 3      | 后端：编写 init\_presets() 内置数据初始化                            | models.py             | 20min      |
| 4      | 前端：创建 `prompts.js` 核心模块                                  | js/modules/prompts.js | 60min      |
| 5      | 前端：创建 `prompts.css` 样式文件                                 | css/prompts.css       | 30min      |
| 6      | 前端：改造 index3.html — 增加标签页+弹窗DOM+生成页按钮                    | index3.html           | 40min      |
| 7      | 前端：api.js 补充预设CRUD方法                                     | js/modules/api.js     | 15min      |
| 8      | 前端：app.js 注册 Prompts 初始化                                 | app.js                | 5min       |
| 9      | 联调测试：端到端验证全流程                                            | —                     | 20min      |
| **合计** | <br />                                                   | <br />                | **\~3.5h** |

***

## 八、评审要点

请确认以下决策点：

| #  | 决策项               | 选项                                                | 建议                     | <br />                         |
| -- | ----------------- | ------------------------------------------------- | ---------------------- | :----------------------------- |
| D1 | 预设存储位置            | A. 仅后端数据库（多设备同步） B. 仅localStorage（离线可用） C. 双写（推荐） | **C** — 后端为主+本地缓存最近使用  | <br />                         |
| D2 | 应用模式默认值           | A. 替换（清空再填） B. 追加（拼接到末尾）                          | **A** — 替换更符合预期，追加作为可选 | <br />                         |
| D3 | 是否需要变量模板          | A. 支持 `{character}` 占位符                           | B. 纯静态文本               | **A** — `{character}` 占位符提升复用性 |
| D4 | 内置预设初始化时机         | A. 首次访问时检测并初始化                                    | B. 手动触发                | **A** — 自动化体验更好                |
| D5 | 选项卡是否替代现有textarea | A. 保留textarea+增加辅助能力（推荐）                          | B. 完全重做                | **A** — 渐进增强，不破坏现有用法           |

