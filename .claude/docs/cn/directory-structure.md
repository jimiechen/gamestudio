# 目录结构

```text
/
├── CLAUDE.md                    # 主配置
├── .claude/                     # 智能体定义、技能、钩子、规则、文档
├── src/                         # 游戏源代码（核心、游戏玩法、AI、网络、UI、工具）
├── assets/                      # 游戏资源（美术、音频、VFX、着色器、数据）
├── design/                      # 游戏设计文档（GDD、叙事、关卡、平衡）
├── docs/                        # 技术文档（架构、API、事后分析）
│   └── engine-reference/        # 精选引擎 API 快照（版本固定）
├── tests/                       # 测试套件（单元、集成、性能、游戏测试）
├── tools/                       # 构建和流程工具（CI、构建、资源流程）
├── prototypes/                  # 一次性原型（与 src/ 隔离）
└── production/                  # 制作管理（冲刺、里程碑、发布）
    ├── session-state/           # 临时会话状态（active.md — gitignored）
    └── session-logs/            # 会话审计追踪（gitignored）
```
