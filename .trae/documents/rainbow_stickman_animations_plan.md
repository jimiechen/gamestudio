# 彩虹火柴人调试器集成计划（含数据库支持）

## 目标
在 asset-debugger 项目中新增火柴人调试菜单，实现可编辑的彩虹火柴人形状，支持多种动作，保存到数据库，提供列表查看，并能被文生图引用。

## 参考图片分析
- 黑色背景
- 彩虹色线条连接各个身体部位
- 关节处有圆点标记
- 身体结构：头部、躯干、双臂、双腿

## 集成方案

### 1. 数据库设计

#### 1.1 新增表: stickman_poses（火柴人姿势表）
```sql
CREATE TABLE stickman_poses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                    -- 姿势名称
    action_type TEXT DEFAULT 'custom',     -- 动作类型: idle, attack, dodge, defend, custom
    joints TEXT NOT NULL,                  -- 关节坐标 JSON
    connections TEXT,                      -- 连接线配置 JSON
    thumbnail_path TEXT,                   -- 缩略图路径
    description TEXT,                      -- 描述
    is_preset BOOLEAN DEFAULT 0,           -- 是否预设
    is_favorite BOOLEAN DEFAULT 0,         -- 是否收藏
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### 1.2 joints JSON 结构
```json
{
    "head": {"x": 400, "y": 100},
    "neck": {"x": 400, "y": 140},
    "shoulderL": {"x": 360, "y": 160},
    "shoulderR": {"x": 440, "y": 160},
    "elbowL": {"x": 320, "y": 220},
    "elbowR": {"x": 480, "y": 220},
    "wristL": {"x": 300, "y": 280},
    "wristR": {"x": 500, "y": 280},
    "hipCenter": {"x": 400, "y": 280},
    "hipL": {"x": 370, "y": 280},
    "hipR": {"x": 430, "y": 280},
    "kneeL": {"x": 360, "y": 380},
    "kneeR": {"x": 440, "y": 380},
    "ankleL": {"x": 350, "y": 480},
    "ankleR": {"x": 450, "y": 480}
}
```

### 2. 后端 API 扩展

#### 2.1 新增 API 端点 (app.py)
```python
# 火柴人姿势 CRUD
GET    /api/stickman/poses          # 获取姿势列表
POST   /api/stickman/poses          # 创建新姿势
GET    /api/stickman/poses/<id>     # 获取单个姿势
PUT    /api/stickman/poses/<id>     # 更新姿势
DELETE /api/stickman/poses/<id>     # 删除姿势

# 预设动作
GET    /api/stickman/presets        # 获取预设动作

# 生成描述文本
POST   /api/stickman/poses/<id>/description  # 生成姿势描述
```

#### 2.2 新增模型类 (models.py)
```python
class StickmanPose:
    @staticmethod
    def create(data: Dict) -> int
    @staticmethod
    def get_all(action_type: str = None) -> List[Dict]
    @staticmethod
    def get_by_id(pose_id: int) -> Optional[Dict]
    @staticmethod
    def update(pose_id: int, data: Dict) -> bool
    @staticmethod
    def delete(pose_id: int) -> bool
    @staticmethod
    def get_presets() -> List[Dict]
    @staticmethod
    def generate_description(pose_id: int) -> str
```

### 3. 前端实现

#### 3.1 新增标签页
```html
<div class="tab" onclick="switchTab('stickman')">🎭 火柴人调试</div>

<div id="stickman" class="tab-content">
    <!-- 双栏布局 -->
    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 20px;">
        <!-- 左侧: Canvas 编辑器 -->
        <div class="card">
            <h2>🎨 火柴人编辑器</h2>
            <canvas id="stickmanCanvas" width="600" height="500"></canvas>
            <div class="action-buttons">
                <button onclick="loadPose('idle')">站立</button>
                <button onclick="loadPose('attack')">挥动武器</button>
                <button onclick="loadPose('dodge')">躲避</button>
                <button onclick="loadPose('defend')">防御</button>
            </div>
            <div class="edit-tools">
                <button onclick="savePose()">💾 保存姿势</button>
                <button onclick="exportPNG()">🖼️ 导出PNG</button>
                <button onclick="generateDescription()">📝 生成描述</button>
                <button onclick="useInGeneration()">🎨 用于文生图</button>
            </div>
        </div>
        
        <!-- 右侧: 姿势列表 -->
        <div class="card">
            <h2>📋 姿势列表</h2>
            <div class="filter-bar">
                <button onclick="filterPoses('all')">全部</button>
                <button onclick="filterPoses('preset')">预设</button>
                <button onclick="filterPoses('custom')">自定义</button>
            </div>
            <div id="poseList" class="pose-list">
                <!-- 动态加载姿势列表 -->
            </div>
        </div>
    </div>
</div>
```

#### 3.2 Canvas 绘制系统
- **画布**: 600x500，黑底
- **关节点**: 14个可拖拽圆点
- **彩虹线条**: 按身体部位着色
- **交互**: 鼠标拖拽调整关节位置

#### 3.3 彩虹配色方案
```
头部/颈部: #9C27B0 (紫) -> #E91E63 (粉)
躯干: #F44336 (红) -> #FF9800 (橙)
左臂: #FFEB3B (黄) -> #4CAF50 (绿)
右臂: #00BCD4 (青) -> #2196F3 (蓝)
左腿: #4CAF50 (绿) -> #00BCD4 (青)
右腿: #2196F3 (蓝) -> #9C27B0 (紫)
```

### 4. 预设动作数据

#### 4.1 站立 (idle)
- 双脚并拢，双臂自然下垂
- 头部正直

#### 4.2 挥动武器 (attack)
- 右手高举过头（持武器）
- 左臂后摆
- 左腿前弓，右腿后蹬
- 身体扭转

#### 4.3 躲避 (dodge)
- 身体侧倾约30度
- 一腿弯曲，一腿伸直
- 双臂护住身体

#### 4.4 防御 (defend)
- 双臂交叉或举盾在前
- 双腿稳固站立
- 身体微蹲

### 5. 与文生图集成

#### 5.1 姿势描述生成
```python
def generate_description(joints, action_type):
    """生成姿势描述文本"""
    descriptions = {
        'idle': '站立姿势，双脚并拢，双臂自然下垂',
        'attack': '攻击姿势，右臂高举过头，身体扭转，左腿前弓右腿后蹬',
        'dodge': '躲避姿势，身体侧倾，双腿弯曲，双臂护住身体',
        'defend': '防御姿势，双臂前举，双腿稳固站立，身体微蹲'
    }
    return descriptions.get(action_type, '自定义姿势')
```

#### 5.2 引用到文生图
- 在「生成素材」页面添加「引用火柴人姿势」按钮
- 选择姿势后自动追加到提示词
- 格式: `[姿势参考: 挥动武器 - 右臂高举过头，身体扭转]`

### 6. 实现步骤

#### 步骤1: 数据库迁移
1. 在 database.py 添加 stickman_poses 表创建
2. 添加数据库迁移逻辑

#### 步骤2: 后端 API
1. 在 models.py 添加 StickmanPose 类
2. 在 app.py 添加火柴人相关 API 端点

#### 步骤3: 前端界面
1. 在 index.html 添加火柴人调试标签页
2. 实现 Canvas 绘制和交互
3. 实现姿势列表展示

#### 步骤4: 数据初始化
1. 插入4个预设动作到数据库
2. 生成预设缩略图

#### 步骤5: 文生图集成
1. 在生成素材页面添加引用功能
2. 实现姿势描述文本生成

### 7. 文件变更清单

#### 修改文件
- `server/database.py` - 添加 stickman_poses 表
- `server/models.py` - 添加 StickmanPose 类
- `server/app.py` - 添加火柴人 API
- `server/static/index.html` - 添加火柴人调试界面

#### 新增目录
- `server/static/stickman_thumbs/` - 缩略图存储

### 8. 界面布局

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎨 生成素材 │ 📋 模型列表 │ 📋 任务列表 │ 🖼️ 素材库 │ 🎭 火柴人调试 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────┐  ┌──────────────────────┐   │
│   │                                          │  │ 📋 姿势列表          │   │
│   │        Canvas 画布 (600x500)              │  │ ┌──────────────────┐ │   │
│   │        黑底 + 彩虹火柴人                  │  │ │ ⭐ 站立 (预设)   │ │   │
│   │                                          │  │ │ ⚔️ 挥动武器      │ │   │
│   │     [头]                                 │  │ │ 🛡️ 躲避          │ │   │
│   │      │                                   │  │ │ 🏃 防御          │ │   │
│   │   [肩]─[肩]                              │  │ │ ──────────────── │ │   │
│   │    │     │                               │  │ │ 💾 我的姿势1     │ │   │
│   │   [肘]   [肘]  ← 可拖拽                  │  │ │ 💾 攻击_v2       │ │   │
│   │    │     │                               │  │ └──────────────────┘ │   │
│   │   [手]   [手]                            │  │                      │   │
│   │      \   /                               │  │ [全部] [预设] [自定义]│   │
│   │     [臀部]                               │  └──────────────────────┘   │
│   │      /   \                               │                             │
│   │   [膝]   [膝]                            │                             │
│   │    │     │                               │                             │
│   │   [脚]   [脚]                            │                             │
│   │                                          │                             │
│   └──────────────────────────────────────────┘                             │
│                                                                             │
│   [站立] [挥动武器] [躲避] [防御] [重置]                                    │
│                                                                             │
│   💾 保存姿势    🖼️ 导出PNG    📝 生成描述    🎨 用于文生图                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9. 数据结构示例

#### 姿势记录示例
```json
{
    "id": 1,
    "name": "挥动武器",
    "action_type": "attack",
    "joints": {
        "head": {"x": 420, "y": 100},
        "neck": {"x": 420, "y": 140},
        "shoulderL": {"x": 380, "y": 160},
        "shoulderR": {"x": 460, "y": 150},
        "elbowL": {"x": 340, "y": 220},
        "elbowR": {"x": 500, "y": 80},
        "wristL": {"x": 320, "y": 280},
        "wristR": {"x": 520, "y": 50},
        "hipCenter": {"x": 400, "y": 280},
        "hipL": {"x": 370, "y": 280},
        "hipR": {"x": 430, "y": 280},
        "kneeL": {"x": 340, "y": 380},
        "kneeR": {"x": 460, "y": 370},
        "ankleL": {"x": 320, "y": 480},
        "ankleR": {"x": 480, "y": 460}
    },
    "thumbnail_path": "stickman_thumbs/attack_1.png",
    "description": "攻击姿势，右臂高举过头",
    "is_preset": true,
    "created_at": "2025-01-01 12:00:00"
}
```

### 10. 预期效果
1. 用户可以在 Canvas 上编辑彩虹火柴人
2. 4种预设动作可直接加载
3. 可拖拽关节点自定义姿势
4. 姿势保存到数据库，右侧列表实时显示
5. 可筛选查看全部/预设/自定义姿势
6. 姿势可导出 PNG 或用于文生图
