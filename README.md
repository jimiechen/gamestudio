<p align="center">
  <h1 align="center">Claude Code Game Studios</h1>
  <p align="center">
    Turn a single Claude Code session into a full game development studio.
    <br />
    48 agents. 37 workflows. One coordinated AI team.
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href=".claude/agents"><img src="https://img.shields.io/badge/agents-48-blueviolet" alt="48 Agents"></a>
  <a href=".claude/skills"><img src="https://img.shields.io/badge/skills-37-green" alt="37 Skills"></a>
  <a href=".claude/hooks"><img src="https://img.shields.io/badge/hooks-8-orange" alt="8 Hooks"></a>
  <a href=".claude/rules"><img src="https://img.shields.io/badge/rules-11-red" alt="11 Rules"></a>
  <a href="https://docs.anthropic.com/en/docs/claude-code"><img src="https://img.shields.io/badge/built%20for-Claude%20Code-f5f5f5?logo=anthropic" alt="Built for Claude Code"></a>
</p>

---

## 项目结构

```
CLAUDE.md                           # Master configuration
.claude/                            # Claude Code配置
  settings.json                     # Hooks, permissions, safety rules
  agents/                           # 48 agent definitions
  skills/                           # 37 slash commands
  hooks/                            # 8 hook scripts
  rules/                            # 11 path-scoped coding standards
  docs/                             # 文档模板

projects/                           # 游戏项目
├── asset-debugger/                 # HoloPix素材调试器
│   ├── server/                     # Flask后端
│   │   ├── app.py                  # 主应用
│   │   ├── models.py               # 数据库模型
│   │   ├── database.py             # 数据库连接
│   │   └── static/                 # 静态文件
│   ├── tests/                      # 测试框架
│   └── README.md                   # 项目说明
│
├── 2d/                             # 2D游戏项目
│   ├── sprite_shaders/             # 精灵着色器
│   ├── tween/                      # 补间动画
│   ├── skeleton/                   # 骨骼动画
│   └── role_playing_game/          # RPG游戏
│
└── ...                             # 其他项目

src/                                # 游戏源代码
assets/                             # 资源文件
design/                             # 设计文档
docs/                               # 技术文档
tests/                              # 测试套件
tools/                              # 构建工具
```

---

## Asset Debugger - HoloPix素材调试器

独立的素材调试工程，包含服务端和SQLite数据库，用于调试和管理HoloPix生成的素材。

### 功能特性

1. **模型管理**
   - 查询可用模型列表
   - 保存模型信息到数据库
   - 多模型组合（最多5个模型）

2. **素材生成**
   - 调用HoloPix API生成图片
   - 支持多模型叠加
   - 快捷应用保存/加载

3. **火柴人调试**
   - 8种预设姿势（站立、行走、奔跑、跳跃、攻击、防御、坐下、挥手）
   - 姿势编辑器
   - 姿势引用到文生图

4. **任务管理**
   - 查询任务状态
   - 自动下载完成的图片
   - 任务历史记录

### 快速开始

```bash
cd projects/asset-debugger
pip install -r requirements.txt
python run.py
```

访问：`http://localhost:5000`

---

## License

MIT License
