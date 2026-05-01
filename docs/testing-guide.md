# 测试运行指南

## 环境要求

- Godot 4.6.1 Stable
- Windows PowerShell（推荐）或 cmd
- 项目路径：`c:\projects\Claude-Code-Game-Studios-main`

---

## 快速运行测试

### 方式一：Godot 编辑器内运行（推荐开发时）

1. 用 Godot 编辑器打开项目
2. 打开 `tests/TestRunner.tscn`
3. 按 **F6** 运行当前场景
4. 在 Output 面板查看结果

### 方式二：命令行运行（推荐 CI/CD）

```powershell
# 标准命令
& 'C:\Users\MAC\Downloads\Godot_v4.6.1-stable_win64\Godot_v4.6.1-stable_win64.exe' `
  --path 'c:\projects\Claude-Code-Game-Studios-main' `
  --headless `
  tests/TestRunner.tscn
```

**预期输出**：
```
========== 测试运行器启动 ==========
运行: res://tests/unit/test_smoke.gd
  [PASS] test_smoke.gd::test_sanity_check
...
========== 测试结果 ==========
通过: 66
失败: 0
==============================
```

---

## 常见问题：PSReadLine 终端错误

### 错误现象

在 Trae IDE 或某些 PowerShell 环境中运行命令时，出现以下异常：

```
System.ArgumentOutOfRangeException: 该值必须大于或等于零，且必须小于控制台缓冲区在该维度的大小。
参数名: top
实际值是 -7。
```

### 根因

PSReadLine 模块与当前终端的缓冲区大小不兼容，导致任何命令都无法正常执行。

### 解决方案

#### 方案 A：使用 -NoProfile 并移除 PSReadLine（推荐）

```powershell
powershell -NoProfile -Command "Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue; <你的命令>"
```

**完整测试命令示例**：
```powershell
powershell -NoProfile -Command "Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue; & 'C:\Users\MAC\Downloads\Godot_v4.6.1-stable_win64\Godot_v4.6.1-stable_win64.exe' --path 'c:\projects\Claude-Code-Game-Studios-main' --headless tests/TestRunner.tscn"
```

#### 方案 B：使用 Start-Process 避免终端交互

```powershell
powershell -NoProfile -Command "Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue; Start-Process 'C:\Users\MAC\Downloads\Godot_v4.6.1-stable_win64\Godot_v4.6.1-stable_win64.exe' '--path c:\projects\Claude-Code-Game-Studios-main --headless tests/TestRunner.tscn' -Wait"
```

#### 方案 C：在 Godot 编辑器内运行

如果命令行始终无法工作，直接在 Godot 编辑器中打开 `tests/TestRunner.tscn` 并按 F6 运行。

---

## 日志规范

### 日志目录

所有测试和运行日志统一存放于：

```
c:\projects\Claude-Code-Game-Studios-main\logs\
```

### 日志文件命名规范

| 类型 | 文件名格式 | 示例 |
|------|-----------|------|
| 测试输出 | `test_YYYYMMDD_HHMMSS.log` | `test_20260501_143022.log` |
| Godot 错误 | `godot_error_YYYYMMDD_HHMMSS.log` | `godot_error_20260501_143022.log` |
| 构建日志 | `build_YYYYMMDD_HHMMSS.log` | `build_20260501_143022.log` |

### 生成日志的命令

```powershell
# 将测试输出保存到日志文件
powershell -NoProfile -Command "Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue; & 'C:\Users\MAC\Downloads\Godot_v4.6.1-stable_win64\Godot_v4.6.1-stable_win64.exe' --path 'c:\projects\Claude-Code-Game-Studios-main' --headless tests/TestRunner.tscn" | Out-File -FilePath 'c:\projects\Claude-Code-Game-Studios-main\logs\test_$(Get-Date -Format yyyyMMdd_HHmmss).log' -Encoding UTF8
```

---

## 测试框架说明

### 测试分层

| 层级 | 目录 | 文件数 | 说明 |
|------|------|--------|------|
| Unit | `tests/unit/` | 5 | 纯函数、状态机、升级池、极限值 |
| Integration | `tests/integration/` | 9 | 节点树、物理碰撞、信号、弹幕反馈 |
| UI | `tests/ui/` | 1 | HUD 响应、升级面板交互 |
| E2E | `tests/e2e/` | 2 | 完整循环、稳态仿真 |

### 测试文件清单

```
tests/
├── unit/
│   ├── test_smoke.gd
│   ├── test_game_manager.gd
│   ├── test_math_utils.gd
│   ├── test_upgrade_pool.gd
│   └── test_extreme_values.gd
├── integration/
│   ├── test_game_loop.gd
│   ├── test_bullet_hits_enemy.gd
│   ├── test_hud_reflects_damage.gd
│   ├── test_player_movement.gd
│   ├── test_bullet_lifetime.gd
│   ├── test_enemy_behavior.gd
│   ├── test_spawner.gd
│   ├── test_player_attack.gd
│   └── test_upgrade_visual_feedback.gd
├── ui/
│   └── test_hud.gd
├── e2e/
│   ├── test_game_loop_smoke.gd
│   └── test_balance_simulation.gd
├── test_base.gd          # 测试基类（断言库）
├── test_runner.gd        # 命令行运行器
├── test_runner_scene.gd  # 场景运行器（推荐）
└── TestRunner.tscn       # 测试场景入口
```

### 测试运行器选择

| 运行器 | 用途 | 特点 |
|--------|------|------|
| `test_runner_scene.gd` | 场景内运行 | 支持 `await`，适合集成/E2E测试 |
| `test_runner.gd` | 命令行运行 | 轻量快速，适合单元测试 |

**推荐**：开发时使用 `TestRunner.tscn`（基于 `test_runner_scene.gd`），CI/CD 时使用命令行。

---

## 测试隔离注意事项

### 状态污染问题

测试间共享全局状态（如 `GameManager`、场景树节点）可能导致测试失败。常见场景：

1. **敌人残留**：前一个测试生成的敌人未清理，影响后一个测试的敌人计数
2. **升级残留**：前一个测试应用的升级未重置，影响后一个测试的伤害/子弹数

### 修复模式

在测试方法开头添加清理逻辑：

```gdscript
# 清理场景树中的敌人
for enemy in get_tree().get_nodes_in_group(&"enemy"):
    enemy.queue_free()
await get_tree().process_frame

# 重置 GameManager 状态
GameManager.start_run()
```

### 示例文件

- `tests/integration/test_spawner.gd` — 包含敌人清理示例
- `tests/integration/test_upgrade_visual_feedback.gd` — 包含 GameManager 重置示例

---

## 验收标准

运行测试后应看到：

```
========== 测试结果 ==========
通过: 66
失败: 0
==============================
```

如果失败数不为 0，请检查：
1. 是否使用了正确的 Godot 版本（4.6.1）
2. 是否在项目根目录运行
3. 是否有测试间状态污染（参考"测试隔离注意事项"）
