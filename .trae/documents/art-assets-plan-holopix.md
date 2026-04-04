# 美术资源规划与 HoloPix API 封装计划

## 项目概述

为《三国像素幸存者》游戏规划美术资源需求，并封装 HoloPix API 作为素材生成技能。

***

## 风格选择评估：像素风 vs Q版

### 方案对比

| 维度         | 16-bit像素风   | Q版卡通风格       |
| ---------- | ----------- | ------------ |
| **目标受众**   | 核心玩家、怀旧玩家   | 全年龄段、休闲玩家    |
| **市场接受度**  | 垂直领域，受众精准   | 更广泛，更易传播     |
| **美术成本**   | 中等（需像素画技能）  | 中等（AI生成友好）   |
| **开发难度**   | 需要像素画经验     | 更容易找到参考和素材   |
| **变现潜力**   | 中等          | 更高（皮肤、周边）    |
| **竞品差异**   | 吸血鬼幸存者已有像素版 | Q版三国幸存者较少    |
| **移动端表现**  | 小屏幕可读性一般    | 小屏幕更清晰可爱     |
| **AI生成适配** | HoloPix支持像素 | HoloPix更擅长Q版 |

### 市场分析

#### 像素风市场

* ✅ **优势**：

  * 核心玩家认可度高

  * 开发成本相对可控

  * 与幸存者类型契合

* ❌ **劣势**：

  * 市场较饱和（吸血鬼幸存者、土豆兄弟等）

  * 对休闲玩家吸引力有限

  * 移动端小屏幕表现不佳

#### Q版卡通市场

* ✅ **优势**：

  * **受众更广**：吸引女性玩家、年轻玩家

  * **传播性强**：可爱的角色更容易 viral

  * **变现潜力**：皮肤、表情包、周边更容易销售

  * **竞品少**：Q版三国幸存者类游戏稀缺

  * **移动端友好**：小屏幕清晰度高

  * **AI友好**：HoloPix等工具生成Q版效果更好

* ❌ **劣势**：

  * 核心玩家可能觉得"不够硬核"

  * 需要平衡可爱与三国史诗感

### 推荐方案：Q版卡通风格

**决策理由**：

1. **市场面更广** - 休闲玩家、女性玩家、年轻玩家都接受
2. **差异化明显** - 避开像素风幸存者红海
3. **变现潜力高** - 皮肤、表情包、周边开发空间大
4. **开发友好** - AI生成Q版效果更好，素材获取更容易
5. **移动端优势** - 小屏幕清晰度高，符合目标平台

**风格定义**：

* **头身比**：2-3头身（可爱但不失武将特征）

* **色彩**：明亮饱和，符合移动端审美

* **特征**：保留武将标志性元素（关羽绿袍、赵云银甲）

* **表情**：丰富的表情变化，增强情感连接

***

## 美术资源需求清单（Q版风格）

### 1. 角色资源（Q版卡通）

#### MVP 武将（5个）

| 武将  | 尺寸    | 动画需求        | 描述                    |
| --- | ----- | ----------- | --------------------- |
| 关羽  | 64x64 | 待机、移动、攻击、技能 | 2.5头身，红脸长髯，青龙偃月刀，绿色战袍 |
| 赵云  | 64x64 | 待机、移动、攻击、技能 | 2.5头身，银甲银枪，英气勃勃       |
| 吕布  | 64x64 | 待机、移动、攻击、技能 | 2.5头身，紫金冠，方天画戟，霸气外露   |
| 诸葛亮 | 64x64 | 待机、移动、攻击、技能 | 2.5头身，羽扇纶巾，智者形象       |
| 貂蝉  | 64x64 | 待机、移动、攻击、技能 | 2.5头身，舞姬装扮，优雅灵动       |

**每个武将需要**：

* 4方向待机动画（4帧）

* 4方向移动动画（6帧）

* 4方向攻击动画（4帧）

* 技能释放动画（6-8帧）

* 受伤/死亡动画（4帧）

* **表情图标**（开心、受伤、释放技能）

**总计**：约 24-30 帧/武将 + 3个表情 × 5 武将 = **135-165 张精灵图**

#### 敌人（3种基础 + 1 Boss）

| 敌人类型        | 尺寸    | 数量   | 描述        |
| ----------- | ----- | ---- | --------- |
| 步兵          | 48x48 | 3种变体 | Q版小兵，持剑/刀 |
| 骑兵          | 56x56 | 2种变体 | Q版骑马士兵    |
| 弓箭手         | 48x48 | 2种变体 | Q版远程攻击    |
| Boss（曹操/张辽） | 80x80 | 1个   | Q版但稍大，有气势 |

**总计**：约 7-10 个敌人 × 15-20 帧 = **105-200 张精灵图**

### 2. 场景资源

#### 长坂坡关卡（Q版风格）

| 资源类型 | 尺寸          | 数量    | 描述               |
| ---- | ----------- | ----- | ---------------- |
| 背景图  | 640x360     | 1张    | Q版战场远景，明亮色调      |
| 地面瓦片 | 48x48       | 8-10种 | 草地、泥土、石板等，圆润边缘   |
| 障碍物  | 48x48-80x80 | 5-8种  | rocks、树木、营帐，Q版比例 |
| 装饰物  | 24x24-48x48 | 10+种  | 武器架、旗帜、火把        |

**总计**：约 25-30 张场景资源

### 3. UI 资源（Q版风格）

| 资源类型    | 尺寸           | 数量   | 描述            |
| ------- | ------------ | ---- | ------------- |
| 按钮      | 80x40-160x60 | 5-8种 | 圆润Q版按钮        |
| 血条/经验条  | 160x20       | 2种   | 可爱风格进度条       |
| 技能图标    | 48x48        | 10+个 | Q版技能图标        |
| 武将头像    | 80x80        | 5个   | 圆形头像框         |
| 窗口/面板   | 可变           | 3-5种 | 圆润边框          |
| 字体      | -            | 1-2套 | 圆润可爱中文字体      |
| **表情包** | 128x128      | 10个  | 武将表情包（用于社交传播） |

**总计**：约 40-50 个 UI 元素（含表情包）

### 4. 特效资源（Q版风格）

| 特效类型 | 尺寸            | 数量   | 描述        |
| ---- | ------------- | ---- | --------- |
| 攻击特效 | 48x48-80x80   | 5-8种 | 可爱风格刀光、枪影 |
| 受击特效 | 48x48         | 2-3种 | 星星、闪光     |
| 升级特效 | 80x80         | 1种   | 可爱光环      |
| 技能特效 | 80x80-160x160 | 5种   | Q版大招特效    |
| 环境特效 | 48x48         | 3-5种 | 可爱火焰、烟雾   |

**总计**：约 20-25 个特效

### 5. 道具/掉落物（Q版）

| 资源类型 | 尺寸    | 数量 | 描述   |
| ---- | ----- | -- | ---- |
| 经验球  | 24x24 | 3种 | 可爱光球 |
| 金币   | 24x24 | 1种 | Q版金币 |
| 血包   | 32x32 | 1种 | 可爱药瓶 |
| 宝箱   | 48x48 | 2种 | Q版宝箱 |

**总计**：约 7 个道具图标

### 6. 营销素材（新增）

| 资源类型     | 尺寸        | 数量  | 描述       |
| -------- | --------- | --- | -------- |
| 应用图标     | 1024x1024 | 1个  | Q版武将组合   |
| 商店截图     | 各平台尺寸     | 5张  | 游戏内精彩画面  |
| 宣传图      | 1920x1080 | 3张  | 用于社交媒体   |
| 表情包      | 128x128   | 20个 | 微信/QQ表情包 |
| Loading图 | 640x360   | 3张  | Q版武将趣味场景 |

**总计**：约 32 个营销素材

***

## 资源统计汇总（Q版风格）

| 类别     | 预估数量              | 优先级 | 备注          |
| ------ | ----------------- | --- | ----------- |
| 武将精灵图  | 135-165 张         | P0  | 含表情         |
| 敌人精灵图  | 105-200 张         | P0  | <br />      |
| 场景资源   | 25-30 张           | P0  | <br />      |
| UI 元素  | 40-50 个           | P0  | 含表情包        |
| 特效资源   | 20-25 个           | P1  | <br />      |
| 道具图标   | 7 个               | P1  | <br />      |
| 营销素材   | 32 个              | P1  | 新增          |
| **总计** | **\~360-510 个资源** | -   | 比像素风多10-15% |

***

## HoloPix API 封装计划（Q版适配）

### 技能功能设计

#### 1. 技能名称

`holopix-asset-generator`

#### 2. 技能描述

使用 HoloPix AI API 生成Q版卡通风格游戏美术资源，支持角色、场景、UI、表情包的批量生成。

#### 3. 输入参数（Q版适配版）

```typescript
interface HoloPixAssetRequest {
  // 资源类型
  assetType: 'character' | 'scene' | 'ui' | 'effect' | 'item' | 'emoticon';
  
  // 资源名称/描述
  name: string;
  description: string;
  
  // 风格设置（Q版）
  style: {
    type: 'chibi' | 'cartoon' | 'kawaii';
    headBodyRatio: 2 | 2.5 | 3; // 头身比
    lineStyle: 'clean' | 'sketch' | 'bold';
    colorStyle: 'bright' | 'pastel' | 'vibrant';
  };
  
  // 尺寸设置
  size: {
    width: number;
    height: number;
  };
  
  // 动画帧数（仅角色）
  animationFrames?: number;
  
  // 表情类型（仅表情包）
  emoticonTypes?: ('happy' | 'sad' | 'angry' | 'surprised' | 'cool')[];
  
  // 生成数量
  count: number;
  
  // 变体描述（批量生成时使用）
  variants?: string[];
  
  // 输出路径
  outputPath: string;
}
```

#### 4. 输出结果

```typescript
interface HoloPixAssetResult {
  // 生成的资源列表
  assets: {
    id: string;
    name: string;
    filePath: string;
    previewUrl: string;
    dimensions: { width: number; height: number };
    frameCount?: number;
    emoticonType?: string; // 表情包类型
  }[];
  
  // 生成统计
  stats: {
    totalGenerated: number;
    successCount: number;
    failCount: number;
    totalTokens: number;
  };
  
  // 失败项
  failures?: {
    name: string;
    reason: string;
  }[];
}
```

### 使用示例（Q版风格）

#### 生成Q版关羽

```typescript
// 生成Q版关羽
{
  "assetType": "character",
  "name": "关羽",
  "description": "三国名将关羽，红脸长髯，手持青龙偃月刀，身穿绿色战袍，威风凛凛",
  "style": {
    "type": "chibi",
    "headBodyRatio": 2.5,
    "lineStyle": "clean",
    "colorStyle": "bright"
  },
  "size": {
    "width": 64,
    "height": 64
  },
  "animationFrames": 6,
  "count": 1,
  "outputPath": "assets/characters/guanyu/"
}
```

#### 生成武将表情包

```typescript
// 生成关羽表情包
{
  "assetType": "emoticon",
  "name": "关羽表情包",
  "description": "Q版关羽的各种表情",
  "style": {
    "type": "chibi",
    "headBodyRatio": 2,
    "lineStyle": "bold",
    "colorStyle": "bright"
  },
  "size": {
    "width": 128,
    "height": 128
  },
  "emoticonTypes": ["happy", "angry", "cool", "surprised"],
  "count": 4,
  "outputPath": "assets/emoticons/guanyu/"
}
```

#### 批量生成Q版敌人

```typescript
// 生成Q版步兵变体
{
  "assetType": "character",
  "name": "步兵",
  "description": "三国时期Q版小兵",
  "style": {
    "type": "chibi",
    "headBodyRatio": 2.5,
    "lineStyle": "clean",
    "colorStyle": "bright"
  },
  "size": {
    "width": 48,
    "height": 48
  },
  "count": 3,
  "variants": [
    "持剑步兵，蓝色盔甲，可爱表情",
    "持刀步兵，红色盔甲，认真表情", 
    "持矛步兵，绿色盔甲，惊讶表情"
  ],
  "outputPath": "assets/enemies/infantry/"
}
```

### 实现步骤

#### Step 1: API 接入准备

* [ ] 注册 HoloPix 开发者账号

* [ ] 获取 API Key

* [ ] 测试Q版风格生成效果

* [ ] 确定最佳提示词模板

#### Step 2: 核心封装开发

* [ ] 创建 `HolopixClient` 类

* [ ] 实现基础请求方法

* [ ] 实现Q版专用提示词模板

* [ ] 实现错误处理和重试机制

#### Step 3: 游戏资源专用接口

* [ ] 实现Q版角色生成接口

* [ ] 实现表情包生成接口

* [ ] 实现场景资源生成接口

* [ ] 实现UI元素生成接口

#### Step 4: 资源管理功能

* [ ] 自动命名和文件组织

* [ ] 生成预览图

* [ ] 元数据记录（JSON）

* [ ] Godot项目导出

#### Step 5: 工作流集成

* [ ] 创建 Trae Skill 定义

* [ ] 实现提示词模板

* [ ] 集成到项目工作流

* [ ] 编写使用文档

### 技术实现

#### 核心类设计

```typescript
// HoloPix 客户端
class HolopixClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimiter: RateLimiter;
  
  constructor(config: HolopixConfig);
  
  // 基础方法
  async generate(request: GenerationRequest): Promise<GenerationResult>;
  async getStatus(jobId: string): Promise<JobStatus>;
  async download(url: string, outputPath: string): Promise<void>;
  
  // 批量方法
  async generateBatch(requests: GenerationRequest[]): Promise<BatchResult>;
}

// Q版游戏资源生成器
class ChibiAssetGenerator {
  private client: HolopixClient;
  
  constructor(client: HolopixClient);
  
  // Q版角色生成
  async generateChibiCharacter(config: ChibiCharacterConfig): Promise<AssetResult>;
  
  // 表情包生成
  async generateEmoticons(config: EmoticonConfig): Promise<AssetResult[]>;
  
  // 场景生成
  async generateScene(config: SceneConfig): Promise<AssetResult>;
  
  // UI生成
  async generateUI(config: UIConfig): Promise<AssetResult>;
  
  // 批量生成
  async generateBatch(configs: AssetConfig[]): Promise<BatchResult>;
}

// 资源管理器
class AssetManager {
  private projectPath: string;
  
  constructor(projectPath: string);
  
  // 保存资源
  async saveAsset(asset: Asset, category: string): Promise<string>;
  
  // 生成元数据
  generateMetadata(assets: Asset[]): AssetMetadata;
  
  // 导出到 Godot
  exportToGodot(assets: Asset[], godotPath: string): Promise<void>;
  
  // 生成表情包配置（用于微信/QQ）
  generateEmoticonConfig(assets: Asset[]): EmoticonPackageConfig;
}
```

#### Q版提示词模板

```typescript
// Q版角色提示词模板
const CHIBI_CHARACTER_PROMPT_TEMPLATE = `
Create a cute chibi-style character for a Three Kingdoms themed roguelike mobile game.

Character: {name}
Description: {description}
Style: Chibi, {headBodyRatio} head-to-body ratio, {lineStyle} lines, {colorStyle} colors
Size: {width}x{height} pixels

Requirements:
- Top-down view for game sprite
- Transparent background
- Cute and appealing design
- Recognizable as Three Kingdoms character
- Suitable for animation frames
- Mobile game optimized
- {additionalRequirements}

Output: Single character sprite sheet with {frameCount} animation frames.
`;

// 表情包提示词模板
const EMOTICON_PROMPT_TEMPLATE = `
Create a cute chibi emoticon/sticker for a Three Kingdoms themed game.

Character: {name}
Expression: {expression}
Style: Chibi, {headBodyRatio} head-to-body ratio, cute and expressive
Size: {width}x{height} pixels

Requirements:
- Square format
- Transparent background
- Exaggerated expression
- Suitable for messaging apps
- Cute and shareable

Output: Single emoticon image.
`;

// 场景提示词模板
const CHIBI_SCENE_PROMPT_TEMPLATE = `
Create a cute chibi-style tile for a Three Kingdoms battlefield scene.

Tile Type: {name}
Description: {description}
Style: Chibi, {colorStyle} colors, rounded shapes
Size: {width}x{height} pixels
Palette: {palette}

Requirements:
- Seamless tiling texture
- Top-down view
- Cute and appealing
- Consistent with Three Kingdoms era
- Mobile game optimized

Output: Single tile image.
`;
```

### 项目集成

#### 目录结构

```
.skills/
└── holopix-asset-generator/
    ├── skill.json              # Skill 定义
    ├── src/
    │   ├── index.ts            # 入口
    │   ├── client.ts           # HoloPix 客户端
    │   ├── generator.ts        # Q版资源生成器
    │   ├── manager.ts          # 资源管理器
    │   ├── templates.ts        # Q版提示词模板
    │   └── types.ts            # 类型定义
    ├── templates/              # 预设模板
    │   ├── characters/         # 武将模板
    │   ├── emoticons/          # 表情包模板
    │   ├── scenes/             # 场景模板
    │   └── ui/                 # UI 模板
    └── README.md               # 使用文档
```

#### Skill 定义

```json
{
  "name": "holopix-asset-generator",
  "version": "1.0.0",
  "description": "使用 HoloPix AI 生成Q版卡通风格游戏美术资源",
  "author": "Claude Code Game Studio",
  
  "entry": "src/index.ts",
  
  "config": {
    "apiKey": {
      "type": "string",
      "required": true,
      "description": "HoloPix API Key"
    },
    "defaultStyle": {
      "type": "object",
      "default": {
        "type": "chibi",
        "headBodyRatio": 2.5,
        "lineStyle": "clean",
        "colorStyle": "bright"
      }
    }
  },
  
  "commands": [
    {
      "name": "generate-chibi",
      "description": "生成Q版角色",
      "args": ["name", "description", "size"]
    },
    {
      "name": "generate-emoticons",
      "description": "生成武将表情包",
      "args": ["name", "expressions"]
    },
    {
      "name": "generate-scene",
      "description": "生成Q版场景资源",
      "args": ["name", "description", "tileSize"]
    },
    {
      "name": "generate-batch",
      "description": "批量生成资源",
      "args": ["configFile"]
    },
    {
      "name": "export-to-godot",
      "description": "导出资源到 Godot 项目",
      "args": ["assets", "godotPath"]
    },
    {
      "name": "export-emoticons",
      "description": "导出表情包配置（微信/QQ）",
      "args": ["assets", "platform"]
    }
  ]
}
```

### 使用工作流

#### 1. 初始化技能

```bash
# 配置 API Key
/skills holopix-asset-generator config apiKey YOUR_API_KEY

# 设置默认输出路径
/skills holopix-asset-generator config outputPath assets/generated/
```

#### 2. 生成Q版武将

```bash
# 生成Q版关羽
/holopix generate-chibi \
  --name "关羽" \
  --description "红脸长髯，青龙偃月刀，威风凛凛" \
  --size 64x64 \
  --head-body-ratio 2.5 \
  --frames 6 \
  --output assets/characters/guanyu/
```

#### 3. 生成表情包

```bash
# 生成关羽表情包
/holopix generate-emoticons \
  --name "关羽" \
  --expressions happy,angry,cool,surprised \
  --size 128x128 \
  --output assets/emoticons/guanyu/
```

#### 4. 批量生成

```bash
# 使用配置文件批量生成
/holopix generate-batch --config chibi-assets-config.json
```

#### 5. 导出到项目

```bash
# 导出到 Godot 项目
/holopix export-to-godot \
  --assets assets/generated/ \
  --godot-path src/

# 导出表情包配置
/holopix export-emoticons \
  --assets assets/emoticons/ \
  --platform wechat
```

***

## 预算估算（Q版风格）

### HoloPix API 费用（预估）

| 资源类型   | 数量         | 单价      | 小计           |
| ------ | ---------- | ------- | ------------ |
| Q版武将   | 5个         | ¥8-15/个 | ¥40-75       |
| Q版敌人   | 10个        | ¥5-8/个  | ¥50-80       |
| 表情包    | 20个        | ¥3-5/个  | ¥60-100      |
| 场景资源   | 30个        | ¥3-5/个  | ¥90-150      |
| UI 元素  | 40个        | ¥2-3/个  | ¥80-120      |
| 特效资源   | 25个        | ¥4-6/个  | ¥100-150     |
| 营销素材   | 32个        | ¥5-8/个  | ¥160-256     |
| **总计** | **\~162个** | -       | **¥580-930** |

**对比像素风**：预算增加约 ¥200-300，但获得表情包等营销素材

### 替代方案对比（Q版）

| 方案         | 成本          | 质量    | 时间   | 适合场景    |
| ---------- | ----------- | ----- | ---- | ------- |
| HoloPix AI | ¥600-1000   | 中等    | 1-2天 | MVP快速验证 |
| 购买Q版素材包    | ¥300-800    | 中等    | 即时   | 通用资源    |
| 外包Q版美术     | ¥5000-15000 | 高     | 3-6周 | 精品游戏    |
| 自己绘制       | 免费          | 取决于技能 | 4-8周 | 有美术能力   |

**推荐**：MVP阶段使用 HoloPix AI 生成Q版资源，配合表情包营销，验证市场后再考虑精品化。

***

## Q版风格优势总结

### 市场优势

1. **受众更广** - 吸引女性玩家（30%+手游用户）
2. **年龄跨度大** - 从儿童到成年人都接受
3. **传播性强** - 可爱的角色容易 viral
4. **变现潜力高** - 皮肤、表情包、周边

### 开发优势

1. **AI生成友好** - HoloPix等工具生成Q版效果更好
2. **素材获取容易** - Q版素材包更多
3. **移动端友好** - 小屏幕清晰度高
4. **差异化明显** - 避开像素风红海

### 风险与缓解

| 风险         | 缓解策略                 |
| ---------- | -------------------- |
| 核心玩家觉得不够硬核 | 强调策略Build深度，不只是外表    |
| 三国史诗感不足    | 保留武将标志性元素，Q版但可识别     |
| 与三国题材违和    | 参考《三国志大战》《真三国无双》Q版形象 |

***

## 下一步行动

1. **确认风格** - 确定采用Q版卡通风格
2. **注册 HoloPix 账号** - 获取 API Key
3. **测试生成** - 生成1-2个武将验证效果
4. **开发 Skill** - 按照上述计划封装 API
5. **生成 MVP 资源** - 优先生成 5 个Q版武将和表情包
6. **营销准备** - 同步准备表情包用于社交传播

***

## 附录：Q版风格参考

### 成功Q版三国游戏

* 《三国志大战》 - 街机Q版三国

* 《真三国无双》帝国模式 - Q版形象

* 《放开那三国》 - 手游Q版卡牌

* 《三国杀》 - Q版武将皮肤

### 风格关键词（用于AI生成）

* Chibi style

* Cute cartoon

* Kawaii warrior

* Big head small body

* Bright colors

* Clean lines

* Mobile game art

* Three Kingdoms character

***

*计划更新时间：2024年*\
*风格决策：Q版卡通（2.5头身）*\
*适用项目：三国像素幸存者 → 三国Q版幸存者*
