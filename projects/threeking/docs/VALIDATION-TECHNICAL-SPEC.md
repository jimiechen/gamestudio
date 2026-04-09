# ThreeKing Survivor - 验证技术方案

**文档版本**: v1.0
**创建日期**: 2026-04-08
**适用范围**: MVP 阶段（Day 1 - Day 10）
**编制人**: 技术总监

---

## 目录

1. [概述](#概述)
2. [测试策略](#测试策略)
3. [单元测试方案](#单元测试方案)
4. [集成测试方案](#集成测试方案)
5. [自动化测试方案](#自动化测试方案)
6. [截图录屏方案](#截图录屏方案)
7. [测试数据管理](#测试数据管理)
8. [持续集成](#持续集成)
9. [验收标准](#验收标准)
10. [附录](#附录)

---

## 概述

### 验证目标

| 目标类型 | 描述 | 验收标准 |
|---------|------|---------|
| 功能正确性 | 所有游戏机制按设计文档工作 | 100% 测试用例通过 |
| 性能稳定性 | 游戏在各种条件下稳定运行 | 60FPS，无内存泄漏 |
| 用户体验 | 操作响应及时，视觉反馈正确 | 延迟 < 100ms |
| 回归防护 | 新功能不破坏已有功能 | 自动化测试覆盖率 > 70% |

### 测试范围

```
┌─────────────────────────────────────────────────────────────┐
│                       测试金字塔                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────┐                                │
│                    │  E2E   │  ← 端到端测试（少量）           │
│                    │  10%   │     完整游戏流程验证             │
│                    └────┬────┘                                │
│                   ┌─────┴─────┐                              │
│                   │  集成测试  │  ← 组件交互测试（中等）         │
│                   │    30%    │     系统间协作验证               │
│                   └─────┬─────┘                              │
│              ┌──────────┴──────────┐                         │
│              │     单元测试        │  ← 核心逻辑测试（大量）    │
│              │       60%         │     函数/方法级别验证      │
│              └─────────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 测试策略

### 测试分层

| 层级 | 范围 | 目标 | 工具 | 频率 |
|------|------|------|------|------|
| 单元测试 | 单个函数/类 | 验证核心逻辑 | GUT + GDScript | 每次提交 |
| 集成测试 | 多个系统交互 | 验证组件协作 | GUT + 场景测试 | 每日构建 |
| E2E 测试 | 完整游戏流程 | 验证用户场景 | Playwright + 录屏 | 里程碑前 |
| 性能测试 | 压力场景 | 验证性能指标 | 自定义性能测试 | 每周 |
| 回归测试 | 全量功能 | 防止功能退化 | 自动化测试套件 | 每次发布 |

### 测试优先级

```
高优先级（必须测试）
├── 玩家移动和瞄准
├── 射击系统（发射、冷却、销毁）
├── 伤害计算和 HP 系统
├── 游戏状态切换（开始、结束、重启）
└── 性能（60FPS 稳定）

中优先级（应该测试）
├── 相机跟随平滑度
├── 边界限制准确性
├── 输入响应延迟
└── 视觉反馈正确性

低优先级（可以测试）
├── 边界情况处理
├── 异常输入处理
└── 多平台兼容性
```

---

## 单元测试方案

### 测试框架

**选用框架**: [GUT (Godot Unit Test)](https://github.com/bitwes/Gut)

**选择理由**:
- Godot 生态最成熟的测试框架
- 支持 GDScript 原生测试
- 提供命令行运行支持（CI 集成）
- 丰富的断言方法和测试钩子

**安装配置**:
```bash
# 通过 Godot Asset Library 安装 GUT
# 或使用 git submodule
git submodule add https://github.com/bitwes/Gut.git addons/gut

# 项目配置（project.godot）
[editor_plugins]
enabled=PoolStringArray( "gut" )
```

### 测试目录结构

```
res://
├── tests/
│   ├── unit/                    # 单元测试
│   │   ├── test_player.gd       # Player 类测试
│   │   ├── test_bullet.gd       # Bullet 类测试
│   │   ├── test_game.gd         # Game 类测试
│   │   └── test_utils.gd        # 工具函数测试
│   ├── integration/             # 集成测试
│   │   ├── test_player_bullet.gd
│   │   └── test_game_flow.gd
│   ├── e2e/                     # 端到端测试
│   │   └── test_full_game.gd
│   └── benchmarks/              # 性能测试
│       └── test_performance.gd
└── addons/gut/                  # GUT 框架
```

### 核心测试用例

#### 1. Player 类测试 (`test_player.gd`)

```gdscript
# tests/unit/test_player.gd
extends GutTest

var player: Player

func before_each():
	player = Player.new()
	add_child_autofree(player)
	player._ready()

func after_each():
	player.queue_free()

# ========== 移动测试 ==========

func test_initial_hp_is_max():
	assert_eq(player.current_hp, player.max_hp, "初始 HP 应等于最大 HP")

func test_move_up_increases_y_velocity():
	Input.action_press("ui_up")
	player._handle_movement(0.016)  # 假设 60FPS
	Input.action_release("ui_up")

	assert_lt(player.velocity.y, 0, "向上移动时 Y 速度应为负值")

func test_move_down_increases_y_velocity():
	Input.action_press("ui_down")
	player._handle_movement(0.016)
	Input.action_release("ui_down")

	assert_gt(player.velocity.y, 0, "向下移动时 Y 速度应为正值")

func test_move_left_increases_x_velocity():
	Input.action_press("ui_left")
	player._handle_movement(0.016)
	Input.action_release("ui_left")

	assert_lt(player.velocity.x, 0, "向左移动时 X 速度应为负值")

func test_move_right_increases_x_velocity():
	Input.action_press("ui_right")
	player._handle_movement(0.016)
	Input.action_release("ui_right")

	assert_gt(player.velocity.x, 0, "向右移动时 X 速度应为正值")

func test_no_input_reduces_velocity():
	player.velocity = Vector2(100, 100)
	player._handle_movement(0.016)

	assert_lt(player.velocity.length(), 100, "无输入时速度应因摩擦而减小")

# ========== 瞄准测试 ==========

func test_sprite_flips_when_aiming_left():
	# 模拟鼠标在玩家左侧
	player.global_position = Vector2(100, 100)
	# 注意：实际测试中需要模拟 get_global_mouse_position
	# 这里简化处理，直接设置 sprite.flip_h
	player.sprite.flip_h = true

	assert_true(player.sprite.flip_h, "向左瞄准时 Sprite 应翻转")

func test_sprite_not_flipped_when_aiming_right():
	player.sprite.flip_h = false

	assert_false(player.sprite.flip_h, "向右瞄准时 Sprite 不应翻转")

# ========== 受伤/死亡测试 ==========

func test_take_damage_reduces_hp():
	var initial_hp = player.current_hp
	player.take_damage(10)

	assert_eq(player.current_hp, initial_hp - 10, "受伤应减少 HP")

func test_take_damage_to_zero_or_below_triggers_death():
	player.current_hp = 10
	player.take_damage(20)

	# 注意：die() 会调用 queue_free，在测试中需要特殊处理
	# 这里简化断言
	assert_true(true, "HP <= 0 时应触发死亡")

func test_invincibility_prevents_damage():
	player.is_invincible = true
	var initial_hp = player.current_hp
	player.take_damage(10)

	assert_eq(player.current_hp, initial_hp, "无敌状态下不应受到伤害")

# ========== 边界测试 ==========

func test_clamp_to_screen_limits_position():
	player.screen_size = Vector2(640, 360)
	player.global_position = Vector2(-100, -100)
	player._clamp_to_screen()

	assert_gte(player.global_position.x, 16, "X 坐标不应小于边距")
	assert_gte(player.global_position.y, 16, "Y 坐标不应小于边距")

func test_clamp_to_screen_limits_max_position():
	player.screen_size = Vector2(640, 360)
	player.global_position = Vector2(1000, 1000)
	player._clamp_to_screen()

	assert_lte(player.global_position.x, 640 - 16, "X 坐标不应大于屏幕宽减边距")
	assert_lte(player.global_position.y, 360 - 16, "Y 坐标不应大于屏幕高减边距")
```

#### 2. Bullet 类测试 (`test_bullet.gd`)

```gdscript
# tests/unit/test_bullet.gd
extends GutTest

var bullet: Bullet

func before_each():
	bullet = Bullet.new()
	add_child_autofree(bullet)
	bullet._ready()

func after_each():
	bullet.queue_free()

# ========== 生命周期测试 ==========

func test_initial_lifetime_is_set():
	assert_eq(bullet.lifetime, 2.0, "子弹初始生命周期应为 2 秒")

func test_bullet_moves_in_direction():
	bullet.direction = Vector2.RIGHT
	bullet.speed = 100.0
	var initial_pos = bullet.global_position

	bullet._physics_process(0.1)

	assert_gt(bullet.global_position.x, initial_pos.x, "子弹应向指定方向移动")

func test_bullet_speed_affects_movement():
	bullet.direction = Vector2.RIGHT
	bullet.speed = 200.0

	var pos_1 = bullet.global_position
	bullet._physics_process(0.1)
	var pos_2 = bullet.global_position

	bullet.global_position = Vector2.ZERO
	bullet.speed = 400.0
	bullet._physics_process(0.1)
	var pos_3 = bullet.global_position

	assert_gt(pos_3.distance_to(Vector2.ZERO), pos_2.distance_to(pos_1), "速度越快移动距离应越远")

# ========== 碰撞测试 ==========

func test_bullet_deals_damage_to_enemy():
	# 模拟敌人
	var mock_enemy = Node2D.new()
	mock_enemy.add_to_group("enemies")
	add_child_autofree(mock_enemy)

	var damage_received = 0
	mock_enemy.set_meta("take_damage", func(amount): damage_received = amount)

	# 模拟碰撞
	bullet.damage = 10
	bullet._on_body_entered(mock_enemy)

	assert_eq(damage_received, 10, "子弹应对敌人造成伤害")

	mock_enemy.queue_free()

func test_bullet_destroys_after_hitting_enemy():
	var mock_enemy = Node2D.new()
	mock_enemy.add_to_group("enemies")
	add_child_autofree(mock_enemy)

	bullet._on_body_entered(mock_enemy)

	# 注意：queue_free 不会立即删除节点，需要等待帧结束
	# 这里简化验证
	assert_true(true, "子弹应在击中敌人后被销毁")

	mock_enemy.queue_free()

func test_bullet_damages_area_enemy():
	var mock_enemy_parent = Node2D.new()
	mock_enemy_parent.add_to_group("enemies")
	add_child_autofree(mock_enemy_parent)

	var mock_area = Area2D.new()
	mock_area.set_script(GDScript.new())
	mock_area.get_parent = func(): return mock_enemy_parent
	add_child_autofree(mock_area)

	bullet.damage = 15
	# 模拟区域碰撞
	bullet._on_area_entered(mock_area)

	assert_true(true, "子弹应通过区域碰撞对敌人造成伤害")

	mock_area.queue_free()
	mock_enemy_parent.queue_free()

# ========== 视觉测试 ==========

func test_bullet_has_visual():
	bullet._create_visual()

	var visual = bullet.get_node_or_null("Visual")
	assert_not_null(visual, "子弹应创建视觉节点")

func test_bullet_visual_is_cyan():
	bullet._create_visual()
	var visual = bullet.get_node_or_null("Visual")

	if visual and visual is Polygon2D:
		assert_eq(visual.color, Color.CYAN, "子弹视觉应为青色")
```

#### 3. Game 类测试 (`test_game.gd`)

```gdscript
# tests/unit/test_game.gd
extends GutTest

var game: Game

func before_each():
	game = Game.new()
	add_child_autofree(game)
	game._ready()

func after_each():
	game.queue_free()

# ========== 玩家生成测试 ==========

func test_spawns_player_on_ready():
	assert_not_null(game.player, "游戏应在 _ready 时生成玩家")

func test_player_spawned_at_center():
	var expected_pos = Vector2(320, 180)
	assert_eq(game.player.position, expected_pos, "玩家应在屏幕中心生成")

func test_player_is_in_scene_tree():
	assert_true(game.player.is_inside_tree(), "玩家应在场景树中")
	assert_eq(game.player.get_parent(), game, "玩家的父节点应为 Game")

# ========== 相机测试 ==========

func test_camera_exists():
	assert_not_null(game.camera, "游戏应有相机节点")

func test_camera_initial_position():
	var expected_pos = Vector2(320, 180)
	assert_eq(game.camera.position, expected_pos, "相机初始位置应在屏幕中心")

func test_camera_follows_player():
	# 移动玩家到新位置
	game.player.position = Vector2(100, 100)

	# 模拟一帧处理
	game._process(0.016)

	# 由于使用 lerp，相机位置应向玩家靠近
	var distance_before = game.camera.position.distance_to(Vector2(320, 180))
	var distance_after = game.camera.position.distance_to(game.player.position)

	assert_lt(distance_after, distance_before, "相机应向玩家位置靠近")

# ========== 屏幕尺寸测试 ==========

func test_screen_size_is_correct():
	assert_eq(game.screen_size, Vector2(640, 360), "屏幕尺寸应为 640x360")

# ========== 边界情况测试 ==========

func test_handles_player_death():
	# 模拟玩家死亡
	game.player.die()

	# 玩家应在下一帧被移除
	assert_false(is_instance_valid(game.player), "玩家死亡后应被释放")

func test_process_handles_null_player():
	# 移除玩家
	if game.player:
		game.player.queue_free()
		game.player = null

	# 不应抛出错误
	game._process(0.016)
	assert_true(true, "_process 应处理玩家为 null 的情况")
```

### 测试执行命令

```bash
# 运行所有测试
godot --headless --path . -s addons/gut/gut_cmdln.gd

# 运行特定测试文件
godot --headless --path . -s addons/gut/gut_cmdln.gd -gtest=tests/unit/test_player.gd

# 运行特定测试用例
godot --headless --path . -s addons/gut/gut_cmdln.gd -gtest=tests/unit/test_player.gd -gunit_test_name=test_initial_hp_is_max

# 生成测试报告（JSON 格式）
godot --headless --path . -s addons/gut/gut_cmdln.gd -gjson_output=tests/results/test_results.json
```

---

## 集成测试方案

### 测试范围

集成测试验证多个组件协同工作的正确性。

| 测试场景 | 涉及组件 | 验证目标 |
|---------|---------|---------|
| 玩家射击 | Player, Bullet, Game | 子弹正确生成、方向正确、速度正确 |
| 子弹命中 | Bullet, Enemy, Game | 伤害计算正确、敌人生成/销毁正确 |
| 游戏循环 | Game, Player, UI | 游戏状态切换、分数计算、时间统计 |
| 相机系统 | Game, Player, Camera2D | 跟随逻辑、边界处理、平滑度 |

### 测试场景设计

#### 场景 1: 玩家射击流程

```gdscript
# tests/integration/test_player_shooting.gd
extends GutTest

var game: Game
var player: Player

func before_each():
	game = Game.new()
	add_child_autofree(game)
	game._ready()
	player = game.player

func test_shooting_creates_bullet():
	# 启用自动射击
	player.is_auto_shooting = true

	# 等待射击冷却
	player.last_shot_time = 0  # 重置冷却时间

	# 触发射击处理
	player._handle_shooting()

	# 验证子弹是否创建
	var bullets = get_tree().get_nodes_in_group("bullets")
	assert_gt(bullets.size(), 0, "射击应创建子弹")

func test_bullet_direction_matches_aim():
	# 设置玩家位置
	player.global_position = Vector2(320, 180)

	# 模拟鼠标位置（在玩家右侧）
	# 注意：实际测试需要模拟 get_global_mouse_position
	# 这里简化处理

	# 创建子弹
	var bullet = player.BulletScene.instantiate()
	bullet.direction = Vector2.RIGHT

	assert_eq(bullet.direction, Vector2.RIGHT, "子弹方向应匹配瞄准方向")

	bullet.queue_free()

func test_shooting_respects_cooldown():
	var initial_bullet_count = get_tree().get_nodes_in_group("bullets").size()

	# 第一次射击
	player.is_auto_shooting = true
	player.last_shot_time = 0
	player._handle_shooting()

	var after_first_shot = get_tree().get_nodes_in_group("bullets").size()
	assert_gt(after_first_shot, initial_bullet_count, "第一次射击应创建子弹")

	// 立即再次尝试射击（在冷却时间内）
	player._handle_shooting()

	var after_second_attempt = get_tree().get_nodes_in_group("bullets").size()
	assert_eq(after_second_attempt, after_first_shot, "冷却时间内不应创建新子弹")
```

#### 场景 2: 子弹命中敌人

```gdscript
# tests/integration/test_bullet_hit.gd
extends GutTest

var bullet: Bullet
var mock_enemy: Node2D

func before_each():
	bullet = Bullet.new()
	add_child_autofree(bullet)
	bullet._ready()

	# 创建模拟敌人
	mock_enemy = Node2D.new()
	mock_enemy.add_to_group("enemies")
	add_child_autofree(mock_enemy)

func test_bullet_deals_damage_on_hit():
	var damage_received = 0

	# 模拟敌人 take_damage 方法
	mock_enemy.set_meta("damage_taken", 0)
	var original_script = mock_enemy.get_script()

	# 创建临时脚本添加 take_damage 方法
	var temp_script = GDScript.new()
	temp_script.source_code = """
    extends Node2D

    var damage_taken = 0

    func take_damage(amount):
        damage_taken += amount
	"""
	temp_script.reload()
	mock_enemy.set_script(temp_script)

	# 触发碰撞
	bullet.damage = 10
	bullet._on_body_entered(mock_enemy)

	assert_eq(mock_enemy.damage_taken, 10, "子弹应对敌人造成伤害")

	mock_enemy.set_script(original_script)

func test_bullet_destroys_after_hitting_enemy():
	# 使用模拟敌人
	bullet._on_body_entered(mock_enemy)

	# 注意：queue_free 不会立即删除节点
	# 在实际游戏中，子弹会被标记为待删除
	assert_true(true, "子弹应在击中敌人后被标记销毁")
```

### 运行集成测试

```bash
# 运行所有集成测试
godot --headless --path . -s addons/gut/gut_cmdln.gd -gtest=tests/integration/

# 运行特定集成测试
godot --headless --path . -s addons/gut/gut_cmdln.gd -gtest=tests/integration/test_player_shooting.gd

# 生成集成测试报告
godot --headless --path . -s addons/gut/gut_cmdln.gd -gtest=tests/integration/ -gjson_output=tests/results/integration_results.json
```

---

## 自动化测试方案

### CI/CD 集成

#### GitHub Actions 工作流

```yaml
# .github/workflows/godot-tests.yml
name: Godot Tests

on:
  push:
	branches: [main, develop]
  pull_request:
	branches: [main, develop]

jobs:
  test:
	runs-on: ubuntu-latest

	steps:
	  - name: Checkout code
		uses: actions/checkout@v4

	  - name: Setup Godot
		uses: chickensoft-games/setup-godot@v1
		with:
		  version: 4.6.0
		  use-dotnet: false

	  - name: Install GUT
		run: |
		  git clone https://github.com/bitwes/Gut.git addons/gut

	  - name: Run Unit Tests
		run: |
		  godot --headless --path . -s addons/gut/gut_cmdln.gd \
			-gtest=tests/unit/ \
			-gexit \
			-gjson_output=tests/results/unit_results.json

	  - name: Run Integration Tests
		run: |
		  godot --headless --path . -s addons/gut/gut_cmdln.gd \
			-gtest=tests/integration/ \
			-gexit \
			-gjson_output=tests/results/integration_results.json

	  - name: Upload Test Results
		uses: actions/upload-artifact@v4
		if: always()
		with:
		  name: test-results
		  path: tests/results/

	  - name: Check Test Results
		run: |
		  if [ -f tests/results/unit_results.json ]; then
			passed=$(cat tests/results/unit_results.json | grep -o '"passing": [0-9]*' | grep -o '[0-9]*')
			failing=$(cat tests/results/unit_results.json | grep -o '"failing": [0-9]*' | grep -o '[0-9]*')
			echo "Unit Tests: $passed passing, $failing failing"
			if [ "$failing" -gt 0 ]; then
			  exit 1
			fi
		  fi
```

### 自动化测试套件

#### 运行脚本

```bash
#!/bin/bash
# scripts/run_tests.sh

echo "=========================================="
echo "ThreeKing Survivor - 自动化测试套件"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 创建结果目录
mkdir -p tests/results

# 运行单元测试
echo -e "\n${YELLOW}[1/4] 运行单元测试...${NC}"
godot --headless --path . -s addons/gut/gut_cmdln.gd \
  -gtest=tests/unit/ \
  -gexit \
  -gjson_output=tests/results/unit_results.json 2>&1 | tee tests/results/unit_output.log

UNIT_EXIT_CODE=$?

# 运行集成测试
echo -e "\n${YELLOW}[2/4] 运行集成测试...${NC}"
godot --headless --path . -s addons/gut/gut_cmdln.gd \
  -gtest=tests/integration/ \
  -gexit \
  -gjson_output=tests/results/integration_results.json 2>&1 | tee tests/results/integration_output.log

INTEGRATION_EXIT_CODE=$?

# 运行性能测试
echo -e "\n${YELLOW}[3/4] 运行性能测试...${NC}"
godot --headless --path . -s tests/benchmarks/test_performance.gd 2>&1 | tee tests/results/performance_results.log

PERFORMANCE_EXIT_CODE=$?

# 生成测试报告
echo -e "\n${YELLOW}[4/4] 生成测试报告...${NC}"
python3 scripts/generate_test_report.py \
  --unit-results=tests/results/unit_results.json \
  --integration-results=tests/results/integration_results.json \
  --output=tests/results/test_report.html

# 输出测试结果摘要
echo -e "\n=========================================="
echo "测试摘要"
echo "=========================================="

if [ $UNIT_EXIT_CODE -eq 0 ]; then
	echo -e "${GREEN}✓ 单元测试通过${NC}"
else
	echo -e "${RED}✗ 单元测试失败${NC}"
fi

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
	echo -e "${GREEN}✓ 集成测试通过${NC}"
else
	echo -e "${RED}✗ 集成测试失败${NC}"
fi

if [ $PERFORMANCE_EXIT_CODE -eq 0 ]; then
	echo -e "${GREEN}✓ 性能测试通过${NC}"
else
	echo -e "${RED}✗ 性能测试失败${NC}"
fi

echo -e "\n详细报告: tests/results/test_report.html"
echo "=========================================="

# 返回总体结果
if [ $UNIT_EXIT_CODE -ne 0 ] || [ $INTEGRATION_EXIT_CODE -ne 0 ]; then
	exit 1
fi

exit 0
```

---

## 截图录屏方案

### 截图方案

#### 1. 自动化截图测试

```python
#!/usr/bin/env python3
# scripts/screenshot_tests.py

"""
自动化截图测试
使用 Playwright 控制 Godot 游戏并截图对比
"""

import asyncio
from playwright.async_api import async_playwright
from PIL import Image, ImageChops
import io
import os

class ScreenshotTester:
	def __init__(self):
		self.base_url = "http://localhost:8080"  # Godot Web 导出地址
		self.screenshot_dir = "tests/screenshots"
		self.reference_dir = f"{self.screenshot_dir}/reference"
		self.actual_dir = f"{self.screenshot_dir}/actual"
		self.diff_dir = f"{self.screenshot_dir}/diff"

		# 创建目录
		for dir_path in [self.reference_dir, self.actual_dir, self.diff_dir]:
			os.makedirs(dir_path, exist_ok=True)

	async def capture_screenshot(self, scenario_name: str, actions: list = None):
		"""捕获游戏截图"""
		async with async_playwright() as p:
			browser = await p.chromium.launch()
			page = await browser.new_page(viewport={'width': 640, 'height': 360})

			await page.goto(self.base_url)

			# 等待游戏加载
			await page.wait_for_timeout(2000)

			# 执行操作
			if actions:
				for action in actions:
					await self._execute_action(page, action)
					await page.wait_for_timeout(500)

			# 截图
			screenshot_path = f"{self.actual_dir}/{scenario_name}.png"
			await page.screenshot(path=screenshot_path)

			await browser.close()

			return screenshot_path

	async def _execute_action(self, page, action: dict):
		"""执行游戏操作"""
		action_type = action.get('type')

		if action_type == 'key':
			key = action.get('key')
			await page.keyboard.press(key)
		elif action_type == 'mouse_move':
			x, y = action.get('x'), action.get('y')
			await page.mouse.move(x, y)
		elif action_type == 'mouse_click':
			button = action.get('button', 'left')
			await page.mouse.click(button=button)

	def compare_screenshots(self, scenario_name: str, threshold: float = 0.01):
		"""对比截图"""
		ref_path = f"{self.reference_dir}/{scenario_name}.png"
		actual_path = f"{self.actual_dir}/{scenario_name}.png"
		diff_path = f"{self.diff_dir}/{scenario_name}.png"

		if not os.path.exists(ref_path):
			print(f"参考截图不存在: {ref_path}")
			return False

		if not os.path.exists(actual_path):
			print(f"实际截图不存在: {actual_path}")
			return False

		# 加载图片
		ref_img = Image.open(ref_path)
		actual_img = Image.open(actual_path)

		# 计算差异
		diff = ImageChops.difference(ref_img, actual_img)

		# 保存差异图
		diff.save(diff_path)

		# 计算差异比例
		diff_bbox = diff.getbbox()
		if diff_bbox is None:
			return True  # 完全相同

		diff_area = (diff_bbox[2] - diff_bbox[0]) * (diff_bbox[3] - diff_bbox[1])
		total_area = ref_img.size[0] * ref_img.size[1]
		diff_ratio = diff_area / total_area

		return diff_ratio <= threshold

# 测试场景定义
TEST_SCENARIOS = [
	{
		"name": "01_initial_state",
		"description": "游戏初始状态",
		"actions": [],
		"delay": 1000
	},
	{
		"name": "02_player_moving_up",
		"description": "玩家向上移动",
		"actions": [
			{"type": "key", "key": "w"}
		],
		"delay": 500
	},
	{
		"name": "03_player_moving_down",
		"description": "玩家向下移动",
		"actions": [
			{"type": "key", "key": "s"}
		],
		"delay": 500
	},
	{
		"name": "04_player_moving_left",
		"description": "玩家向左移动",
		"actions": [
			{"type": "key", "key": "a"}
		],
		"delay": 500
	},
	{
		"name": "05_player_moving_right",
		"description": "玩家向右移动",
		"actions": [
			{"type": "key", "key": "d"}
		],
		"delay": 500
	},
	{
		"name": "06_auto_shooting_enabled",
		"description": "开启自动射击",
		"actions": [
			{"type": "key", "key": "Space"}
		],
		"delay": 2000
	}
]

async def main():
	"""主函数"""
	tester = ScreenshotTester()

	print("=" * 50)
	print("ThreeKing Survivor - 截图测试")
	print("=" * 50)

	for scenario in TEST_SCENARIOS:
		print(f"\n执行场景: {scenario['name']}")
		print(f"描述: {scenario['description']}")

		try:
			screenshot_path = await tester.capture_screenshot(
				scenario['name'],
				scenario['actions']
			)
			print(f"截图已保存: {screenshot_path}")

			# 对比截图（如果有参考图）
			is_match = tester.compare_screenshots(scenario['name'])
			if is_match:
				print("✅ 截图匹配参考图")
			else:
				print("⚠️ 截图与参考图有差异")

		except Exception as e:
			print(f"❌ 错误: {e}")

	print("\n" + "=" * 50)
	print("测试完成")
	print("=" * 50)

if __name__ == "__main__":
	asyncio.run(main())
```

#### 2. Godot 内置截图工具

```gdscript
# tools/screenshot_tool.gd
@tool
extends EditorPlugin

## Godot 编辑器截图工具
## 用于在编辑器中快速捕获游戏画面

const SCREENSHOT_DIR = "res://tests/screenshots/capture/"

var screenshot_button: Button

func _enter_tree():
	# 创建截图按钮
	screenshot_button = Button.new()
	screenshot_button.text = "📸 截图"
	screenshot_button.tooltip_text = "捕获当前游戏画面"
	screenshot_button.pressed.connect(_on_screenshot_pressed)

	# 添加到编辑器工具栏
	add_control_to_container(EditorPlugin.CONTAINER_TOOLBAR, screenshot_button)

func _exit_tree():
	# 清理
	if screenshot_button:
		screenshot_button.queue_free()

func _on_screenshot_pressed():
	var dir = DirAccess.open(SCREENSHOT_DIR)
	if dir == null:
		DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(SCREENSHOT_DIR))

	# 生成文件名
	var timestamp = Time.get_datetime_string_from_system().replace(":", "-")
	var filename = "screenshot_%s.png" % timestamp
	var filepath = SCREENSHOT_DIR + filename

	# 捕获截图
	var image = get_viewport().get_texture().get_image()
	image.save_png(filepath)

	print("截图已保存: %s" % filepath)

	# 显示通知
	if Engine.is_editor_hint():
		var editor_interface = get_editor_interface()
		editor_interface.get_base_control().print_message("截图已保存: %s" % filename)
```

### 录屏方案

#### 1. Godot 内置录屏

```gdscript
# tools/recording/recorder.gd
class_name GameRecorder
extends Node

## 游戏录屏工具
## 支持录制游戏画面并保存为视频文件

signal recording_started
signal recording_stopped(filepath: String)
signal recording_progress(frame: int, fps: float)

enum Format {
	PNG_SEQUENCE,  # PNG 序列帧
	WEBM,          # WebM 视频（需要编译模块）
	AVI            # AVI 视频（需要编译模块）
}

@export var output_format: Format = Format.PNG_SEQUENCE
@export var output_directory: String = "user://recordings/"
@export var target_fps: float = 60.0
@export var capture_resolution: Vector2i = Vector2i(640, 360)

var is_recording: bool = false
var recording_start_time: float = 0.0
var frame_count: int = 0
var viewport: Viewport
var recording_session: String = ""

func _ready():
	viewport = get_viewport()

	# 创建输出目录
	var dir = DirAccess.open(output_directory)
	if dir == null:
		DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(output_directory))

func start_recording(session_name: String = "") -> bool:
	if is_recording:
		push_warning("已经在录制中")
		return false

	# 生成会话 ID
	if session_name.is_empty():
		var timestamp = Time.get_datetime_string_from_system().replace(":", "-")
		recording_session = "recording_%s" % timestamp
	else:
		recording_session = session_name

	is_recording = true
	recording_start_time = Time.get_unix_time_from_system()
	frame_count = 0

	# 创建会话目录
	var session_dir = output_directory + recording_session + "/"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(session_dir))

	recording_started.emit()
	print("开始录制: %s" % recording_session)

	return true

func stop_recording() -> String:
	if not is_recording:
		push_warning("当前不在录制中")
		return ""

	is_recording = false

	var duration = Time.get_unix_time_from_system() - recording_start_time
	var avg_fps = frame_count / duration if duration > 0 else 0.0

	print("停止录制: %s" % recording_session)
	print("  时长: %.2f 秒" % duration)
	print("  帧数: %d" % frame_count)
	print("  平均 FPS: %.2f" % avg_fps)

	# 保存录制信息
	_save_recording_info(duration, avg_fps)

	var output_path = output_directory + recording_session + "/"
	recording_stopped.emit(output_path)

	return output_path

func _process(delta: float):
	if not is_recording:
		return

	# 计算目标帧间隔
	var frame_interval = 1.0 / target_fps
	var elapsed = Time.get_unix_time_from_system() - recording_start_time
	var target_frame = int(elapsed / frame_interval)

	# 捕获需要的帧
	while frame_count < target_frame:
		_capture_frame()
		frame_count += 1

		# 发送进度信号（每 30 帧）
		if frame_count % 30 == 0:
			var current_fps = frame_count / elapsed if elapsed > 0 else 0.0
			recording_progress.emit(frame_count, current_fps)

func _capture_frame():
	var image := viewport.get_texture().get_image()

	# 调整分辨率
	if image.get_size() != capture_resolution:
		image.resize(capture_resolution.x, capture_resolution.y, Image.INTERPOLATE_BILINEAR)

	# 生成文件名
	var filename := "frame_%06d.png" % frame_count
	var filepath := output_directory + recording_session + "/" + filename

	# 保存
	image.save_png(filepath)

func _save_recording_info(duration: float, avg_fps: float):
	var info := {
		"session_name": recording_session,
		"duration": duration,
		"frame_count": frame_count,
		"average_fps": avg_fps,
		"target_fps": target_fps,
		"resolution": {"x": capture_resolution.x, "y": capture_resolution.y}
	}

	var file := FileAccess.open(output_directory + recording_session + "/info.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(info, "  "))
	file.close()

# 便捷函数
func toggle_recording() -> bool:
	if is_recording:
		stop_recording()
		return false
	else:
		return start_recording()
```

#### 2. 使用 FFmpeg 合成视频

```bash
#!/bin/bash
# scripts/convert_to_video.sh

# 将录制的 PNG 序列转换为视频

SESSION_DIR=$1
OUTPUT_FILE=$2

if [ -z "$SESSION_DIR" ]; then
	echo "用法: $0 <session_directory> [output_file]"
	echo "示例: $0 user://recordings/recording_2024-01-01/ output.mp4"
	exit 1
fi

if [ -z "$OUTPUT_FILE" ]; then
	OUTPUT_FILE="${SESSION_DIR}/video.mp4"
fi

echo "转换录制会话: $SESSION_DIR"
echo "输出文件: $OUTPUT_FILE"

# 使用 FFmpeg 转换
ffmpeg -y \
	-framerate 60 \
	-i "${SESSION_DIR}/frame_%06d.png" \
	-c:v libx264 \
	-pix_fmt yuv420p \
	-crf 23 \
	-preset fast \
    "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
	echo "✓ 视频转换成功: $OUTPUT_FILE"

	# 获取视频信息
	ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate -of csv=s=x:p=0 "$OUTPUT_FILE"
else
	echo "✗ 视频转换失败"
	exit 1
fi
```

---

## 测试数据管理

### 测试数据目录结构

```
res://tests/
├── data/                          # 测试数据
│   ├── fixtures/                  # 测试夹具
│   │   ├── player_fixture.tres    # 玩家测试数据
│   │   ├── enemy_fixture.tres     # 敌人测试数据
│   │   └── level_fixture.tres     # 关卡测试数据
│   ├── mocks/                     # 模拟对象
│   │   ├── mock_enemy.gd
│   │   ├── mock_bullet.gd
│   │   └── mock_input.gd
│   ├── assets/                    # 测试资源
│   │   └── test_texture.png
│   └── recordings/                # 录制数据
│       └── sample_gameplay/
├── results/                       # 测试结果
│   ├── unit_results.json
│   ├── integration_results.json
│   ├── performance_results.json
│   └── coverage_report/
└── screenshots/                   # 截图
	├── reference/                 # 参考截图
	├── actual/                    # 实际截图
	└── diff/                      # 差异对比
```

### 测试夹具示例

```gdscript
# tests/data/fixtures/player_fixture.gd
class_name PlayerFixture
extends Resource

## 玩家测试夹具
## 提供标准化的玩家初始状态

@export var initial_hp: int = 100
@export var initial_position: Vector2 = Vector2(320, 180)
@export var initial_velocity: Vector2 = Vector2.ZERO
@export var is_invincible: bool = false

func apply_to(player: Player) -> void:
	"""将夹具数据应用到玩家实例"""
	player.max_hp = initial_hp
	player.current_hp = initial_hp
	player.global_position = initial_position
	player.velocity = initial_velocity
	player.is_invincible = is_invincible

func create_player() -> Player:
	"""创建并配置玩家实例"""
	var player = Player.new()
	apply_to(player)
	return player
```

---

## 持续集成

### 完整 CI/CD 流程

```yaml
# .github/workflows/full-ci.yml
name: Full CI/CD Pipeline

on:
  push:
	branches: [main, develop]
	tags: ['v*']
  pull_request:
	branches: [main, develop]

jobs:
  # 1. 代码质量检查
  code-quality:
	runs-on: ubuntu-latest
	steps:
	  - uses: actions/checkout@v4

	  - name: Setup Godot
		uses: chickensoft-games/setup-godot@v1
		with:
		  version: 4.6.0

	  - name: Run GDScript Linter
		run: |
		  pip install gdtoolkit
		  gdlint scripts/

	  - name: Check Code Formatting
		run: |
		  gdformat --check scripts/

  # 2. 单元测试
  unit-tests:
	runs-on: ubuntu-latest
	needs: code-quality
	steps:
	  - uses: actions/checkout@v4

	  - name: Setup Godot
		uses: chickensoft-games/setup-godot@v1
		with:
		  version: 4.6.0

	  - name: Install GUT
		run: |
		  git clone --depth 1 https://github.com/bitwes/Gut.git addons/gut

	  - name: Run Unit Tests
		run: |
		  godot --headless --path . -s addons/gut/gut_cmdln.gd \
			-gtest=tests/unit/ \
			-gexit \
			-gjson_output=tests/results/unit_results.json

	  - name: Upload Test Results
		uses: actions/upload-artifact@v4
		if: always()
		with:
		  name: unit-test-results
		  path: tests/results/

  # 3. 集成测试
  integration-tests:
	runs-on: ubuntu-latest
	needs: unit-tests
	steps:
	  - uses: actions/checkout@v4

	  - name: Setup Godot
		uses: chickensoft-games/setup-godot@v1
		with:
		  version: 4.6.0

	  - name: Install GUT
		run: |
		  git clone --depth 1 https://github.com/bitwes/Gut.git addons/gut

	  - name: Run Integration Tests
		run: |
		  godot --headless --path . -s addons/gut/gut_cmdln.gd \
			-gtest=tests/integration/ \
			-gexit \
			-gjson_output=tests/results/integration_results.json

	  - name: Upload Test Results
		uses: actions/upload-artifact@v4
		if: always()
		with:
		  name: integration-test-results
		  path: tests/results/

  # 4. 性能测试
  performance-tests:
	runs-on: ubuntu-latest
	needs: unit-tests
	steps:
	  - uses: actions/checkout@v4

	  - name: Setup Godot
		uses: chickensoft-games/setup-godot@v1
		with:
		  version: 4.6.0

	  - name: Run Performance Tests
		run: |
		  godot --headless --path . -s tests/benchmarks/test_performance.gd \
			> tests/results/performance_results.log 2>&1

	  - name: Check Performance Results
		run: |
		  if grep -q "FAIL" tests/results/performance_results.log; then
			echo "性能测试未通过"
			exit 1
		  fi

	  - name: Upload Performance Results
		uses: actions/upload-artifact@v4
		if: always()
		with:
		  name: performance-test-results
		  path: tests/results/performance_results.log

  # 5. 截图对比测试
  screenshot-tests:
	runs-on: ubuntu-latest
	needs: [unit-tests, integration-tests]
	steps:
	  - uses: actions/checkout@v4

	  - name: Setup Godot
		uses: chickensoft-games/setup-godot@v1
		with:
		  version: 4.6.0

	  - name: Install Python Dependencies
		run: |
		  pip install playwright Pillow
		  playwright install chromium

	  - name: Build Web Export
		run: |
		  # 导出 Web 版本用于测试
		  godot --headless --path . --export-release "Web" dist/web/index.html

	  - name: Start HTTP Server
		run: |
		  python3 -m http.server 8080 --directory dist/web &
		  sleep 3

	  - name: Run Screenshot Tests
		run: |
		  python3 scripts/screenshot_tests.py

	  - name: Upload Screenshots
		uses: actions/upload-artifact@v4
		if: always()
		with:
		  name: screenshots
		  path: tests/screenshots/

  # 6. 构建和发布
  build-and-release:
	runs-on: ubuntu-latest
	needs: [screenshot-tests, performance-tests]
	if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')
	steps:
	  - uses: actions/checkout@v4

	  - name: Setup Godot
		uses: chickensoft-games/setup-godot@v1
		with:
		  version: 4.6.0

	  - name: Export Windows Build
		run: |
		  godot --headless --path . --export-release "Windows Desktop" dist/windows/ThreeKingSurvivor.exe

	  - name: Export Web Build
		run: |
		  godot --headless --path . --export-release "Web" dist/web/index.html

	  - name: Create Release Archive
		run: |
		  cd dist
		  zip -r ../ThreeKingSurvivor_Windows.zip windows/
		  zip -r ../ThreeKingSurvivor_Web.zip web/

	  - name: Upload to GitHub Releases
		uses: softprops/action-gh-release@v1
		with:
		  files: |
			ThreeKingSurvivor_Windows.zip
			ThreeKingSurvivor_Web.zip
		env:
		  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 验收标准

### 测试覆盖率要求

| 类型 | 目标覆盖率 | 最低接受度 | 当前状态 |
|------|-----------|-----------|---------|
| 单元测试 | 80% | 70% | 🔄 进行中 |
| 集成测试 | 60% | 50% | 🔄 进行中 |
| E2E 测试 | 40% | 30% | ⏳ 计划中 |
| 整体代码 | 70% | 60% | 🔄 进行中 |

### 性能验收标准

| 指标 | 目标值 | 警告阈值 | 失败阈值 |
|------|--------|---------|---------|
| FPS | >= 60 | 45-59 | < 45 |
| 帧时间 | <= 16.6ms | 16.6-22.2ms | > 22.2ms |
| 内存使用 | <= 200MB | 200-300MB | > 300MB |
| 加载时间 | <= 3s | 3-5s | > 5s |

### 质量门禁

```yaml
# 合并到 main 分支前的检查清单
quality_gate:
  code_quality:
	- lint_passed: true
	- format_check_passed: true

  testing:
	- unit_test_coverage: ">= 70%"
	- unit_test_pass_rate: "100%"
	- integration_test_pass_rate: ">= 90%"
	- screenshot_comparison_passed: true

  performance:
	- fps_benchmark: ">= 60"
	- memory_benchmark: "<= 200MB"
	- load_time_benchmark: "<= 3s"

  security:
	- no_hardcoded_secrets: true
	- no_debug_code_in_production: true
```

---

## Claude 评审意见

### 总体评分：⭐⭐⭐⭐☆ (4.0/5.0)

### 优点
1. **测试策略完整** - 清晰描述了测试金字塔（单元60%/集成30%/E2E10%），分层合理
2. **工具链选型正确** - GUT 是 Godot 生态最成熟的测试框架，选择合理
3. **CI/CD 集成** - 提供了 GitHub Actions 工作流示例，具备工程化思维
4. **性能测试覆盖** - 包含 FPS、内存、加载时间等性能基准测试

### 建议改进
1. **测试用例与实际代码不符** - 文档中的 `test_move_up_increases_y_velocity()` 等用例依赖输入模拟，但 Godot 输入在 headless 模式下难以复现
2. **缺少异步测试处理** - `take_damage()` 中的 `await` 和 `create_timer()` 需要特殊测试处理，文档未说明
3. **Godot 版本过时** - `PoolStringArray` 等语法是 Godot 3.x 风格，项目使用 4.6 应更新为 `PackedStringArray`
4. **过于理论化** - 大量篇幅描述测试策略，实际可执行的用例较少

### 与标准对比
| 维度 | 本文档 | 标准 | 差距 |
|------|--------|------|------|
| 策略设计 | 优秀 | 优秀 | 达标 |
| 与实际代码匹配度 | 70% | 90%+ | 需更新 |
| Godot 4 语法准确性 | 70% | 100% | 需更新 |
| 可执行性 | 中等 | 高 | 需改进 |

**结论**：作为测试策略指导文档有价值，但测试用例需要根据实际代码重写。建议参考 VALIDATION-TECHNICAL-SPEC-v2.md 的更新内容。

---
**评审者**: Claude
**评审日期**: 2026-04-09

---

## 附录

### A. 测试工具清单

| 工具 | 用途 | 版本 | 安装方式 |
|------|------|------|---------|
| GUT | 单元/集成测试框架 | 9.x | Asset Library |
| Playwright | E2E 测试、截图对比 | 1.40+ | pip |
| FFmpeg | 视频录制/处理 | 6.0+ | 系统包 |
| Python | 测试脚本 | 3.10+ | 系统安装 |
| GitHub Actions | CI/CD | N/A | 云服务 |

### B. 参考资料

1. [GUT 测试框架文档](https://gut.readthedocs.io/)
2. [Godot 最佳实践 - 测试](https://docs.godotengine.org/en/stable/tutorials/best_practices/testing.html)
3. [Playwright 文档](https://playwright.dev/python/)
4. [游戏测试金字塔](https://www.gamedeveloper.com/programming/the-test-pyramid-in-game-development)

### C. 常用命令速查

```bash
# 运行所有测试
godot --headless --path . -s addons/gut/gut_cmdln.gd

# 运行单元测试
godot --headless --path . -s addons/gut/gut_cmdln.gd -gtest=tests/unit/

# 运行带覆盖率
godot --headless --path . -s addons/gut/gut_cmdln.gd -gcover

# 生成测试报告
python3 scripts/generate_test_report.py

# 运行截图测试
python3 scripts/screenshot_tests.py

# 运行性能测试
godot --headless --path . -s tests/benchmarks/test_performance.gd
```
评审意见

toolName: view_files
			
status: success
		  
			
filePath: c:\projects\Claude-Code-Game-Studios-0.3.0\Claude-Code-Game-Studios-0.3.0\projects\threeking\docs\VALIDATION-TECHNICAL-SPEC.md
		  

		
			
toolName: no_need_execute
			
status: no_need_execute
		  
		  

		
			
toolName: view_folder
			
status: success
		  
c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking
		  

		
			
toolName: file_search
			
status: success
		  
file_pattern: c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/**/tests
		  

		
			
toolName: file_search
			
status: success
		  
file_pattern: c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/**/.github/workflows
		  

		
			
toolName: search_by_regex
			
status: success
		  
query: GUT
		  

		
			
toolName: search_by_regex
			
status: success
		  
query: Player.gd|Bullet.gd|Game.gd
		  
### Relevant Code Snippets
1. c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scenes/Game.tscn:L1-L50
  — 游戏主场景文件，包含游戏整体结构和节点配置，是项目的核心场景之一
2. c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scenes/Player.tscn:L1-L50
  — 玩家角色场景文件，定义了玩家角色的节点和属性设置
3. c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scenes/Bullet.tscn:L1-L50
  — 子弹场景文件，描述了子弹对象的节点配置
4. c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md:L1-L30
  — 技术规范文档，提供了项目的技术架构和验证标准，有助于了解项目整体结构
5. c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/MVP-MASTER-PLAN.md:L1-L30
  — MVP主计划文档，包含项目核心功能和开发路线，可作为项目当前状态的参考

这些文件揭示了项目结构、核心场景文件以及相关文档，但没有找到测试目录、CI配置或GUT框架的具体证据。
		
		  

		
评审意见：


toolName: view_folder
			
status: success
		  
c:\projects\Claude-Code-Game-Studios-0.3.0\Claude-Code-Game-Studios-0.3.0\projects\threeking
		  

		
			
toolName: file_search
			
status: success
		  
file_pattern: **/*.gd
		  

		
			
toolName: view_files
			
status: success
		  
			
filePath: c:\projects\Claude-Code-Game-Studios-0.3.0\Claude-Code-Game-Studios-0.3.0\projects\threeking\scripts\Player.gd
		  

		
			
toolName: view_files
			
status: success
		  
			
filePath: c:\projects\Claude-Code-Game-Studios-0.3.0\Claude-Code-Game-Studios-0.3.0\projects\threeking\scripts\Bullet.gd
		  

		
			
toolName: view_files
			
status: success
		  
			
filePath: c:\projects\Claude-Code-Game-Studios-0.3.0\Claude-Code-Game-Studios-0.3.0\projects\threeking\scripts\Game.gd
		  

		
			
toolName: view_files
			
status: success
		  
			
filePath: c:\projects\Claude-Code-Game-Studios-0.3.0\Claude-Code-Game-Studios-0.3.0\projects\threeking\scripts\Enemy.gd
		  
现在我已经完整阅读了验证技术方案文档，并对照了项目的实际源代码（[Player.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Player.gd)、[Bullet.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Bullet.gd)、[Game.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd)、[Enemy.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd)）。以下是详细的评审意见：

---

# ThreeKing Survivor 验证技术方案 — 评审报告

## 📊 总体评价

| 维度 | 评分 | 说明 |
|------|------|------|
| **结构完整性** | ⭐⭐⭐⭐ | 章节清晰，覆盖面广（单元/集成/E2E/性能/CI/截图录屏） |
| **与实际代码一致性** | ⭐⭐ | 测试用例与真实实现存在多处偏差，部分测试无法通过 |
| **可执行性** | ⭐⭐⭐ | 框架选型合理，但 CI 流程和截图方案存在落地障碍 |
| **覆盖率** | ⭐⭐⭐ | 缺少 Enemy、Score、Spawn 等核心模块的测试设计 |

**综合结论：方向正确，但需要大幅修订测试用例以匹配实际代码实现后才能使用。**

---

## 🔴 严重问题（必须修复）

### 1. 测试用例与实际源码不一致 — 最关键问题

文档中的测试代码与实际 [Player.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Player.gd) 实现存在根本性偏差：

| 测试中的假设 | 实际代码 | 影响 |
|-------------|---------|------|
| `player._handle_movement(0.016)` 直接传 delta | [`_handle_movement(delta)`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Player.gd#L42-L49) 内部调用 `Input.get_vector()` 获取输入，delta 不控制方向 | **4 个移动测试全部无效** — 在 headless 模式下 `Input.get_vector()` 返回 `Vector2.ZERO`，所有移动断言会失败 |
| `game.screen_size == Vector2(640, 360)` | Game.gd 中 **不存在** `screen_size` 属性，实际使用 [`get_viewport_rect().size`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd#L37) 动态获取 | `test_screen_size_is_correct` 会直接崩溃 |
| `game.player.position == Vector2(320, 180)` 硬编码 | 实际为 [`get_viewport_rect().size / 2`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd#L37)，headless 下视口尺寸不确定 | 断言必然失败 |
| `player.sprite.flip_h = true` 手动设置来测试瞄准 | 实际 [`_handle_aiming()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Player.gd#L50-L57) 通过 `get_global_mouse_position()` 计算方向后自动设置 flip_h | 测试绕过了被测逻辑，属于**无效测试** |

### 2. GDScript 语法错误

[第 532 行](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L532) 集成测试代码中使用了 `//` 注释符：

```gdscript
// 立即再次尝试射击（在冷却时间内）  ← ❌ GDScript 使用 # 注释
```

这会导致语法错误，测试文件无法加载。

### 3. 多处空断言（假测试）

以下测试用例的断言为 `assert_true(true, "...")`，**不验证任何行为**：

- [`test_take_damage_to_zero_or_below_triggers_death`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L221-L227) — 仅注释说明应触发死亡，但未做任何断言
- [`test_bullet_destroys_after_hitting_enemy`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L319-L330) — 同上
- [`test_bullet_damages_area_enemy`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L332-L349) — 同上
- [`test_bullet_destroys_after_hitting_enemy`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L586-L592)（集成测试）— 同上

这些应该替换为有意义的断言，例如检查 `is_instance_valid(bullet)` 或监听 `tree_exiting` 信号。

---

## 🟠 重要问题（建议修复）

### 4. 缺少 Enemy 类的完整测试覆盖

项目中有完整的 [Enemy.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd) 实现（68 行），包含：
- 追逐玩家逻辑 [`_chase_player()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd#L33-L40)
- 玩家碰撞伤害 [`_check_player_collision()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd#L42-L51)
- 受伤/死亡逻辑 [`take_damage()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd#L53-L61) / [`die()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd#L63-L67)
- 屏幕外销毁 [`_on_visible_on_screen_exited()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd#L69-L71)

但整个文档 **没有任何 Enemy 类的测试设计**。作为游戏的核心对抗实体，这是严重的覆盖遗漏。

### 5. 缺少关键集成场景

以下核心游戏流程未被纳入测试范围：

| 缺失场景 | 对应代码 | 优先级 |
|----------|---------|--------|
| 敌人生成逻辑 | [`_spawn_enemy()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd#L50-L53) + [`_get_random_spawn_position()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd#L55-L74) | 高 |
| 分数系统 | [`add_score()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd#L76-L81) | 高 |
| 游戏结束流程 | [`game_over()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd#L82-L93) | 高 |
| 重启流程 | [`restart()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd#L95-L104) | 高 |
| 敌人上限控制 | `max_enemies = 50` 逻辑 | 中 |
| 玩家无敌时间逻辑 | [`take_damage()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Player.gd#L87-L102) 中的 await/invincibility | 高 |

### 6. Headless 模式下 Input/Mouse 模拟方案不可行

当前测试直接调用 `Input.action_press("ui_up")` 来模拟输入，但在 **Godot headless 模式**下：

- `Input.get_vector()` 在没有窗口/渲染器时行为未定义
- `get_global_mouse_position()` 在 headless 中返回 `(0,0)` 或不可预测值
- `@onready` 节点引用在纯代码实例化（`Player.new()`）时为 **null**

**建议方案**：将输入处理逻辑抽取为纯函数，或使用依赖注入方式传入"输入状态"，而非依赖全局 `Input` 单例。

### 7. 截图测试方案架构风险

[截图测试方案](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L769-L957) 存在以下问题：

1. **依赖 Web 导出**：需要先完成 Godot → Web 的完整导出管线，且导出模板需预安装到 CI 环境
2. **实时性游戏的截图时机不可控**：游戏是实时运行的，`page.wait_for_timeout(500)` 后的游戏状态具有不确定性，截图对比会产生大量误报
3. **Playwright 键盘事件映射**：Godot Web 导出后的键码映射可能与原生不同（如 WASD vs 方向键）
4. **差异阈值 1% 过于严格**：对于像素级游戏画面，即使帧间微小差异也可能超过阈值

**建议**：MVP 阶段优先采用 Godot 内置截图工具（[editor plugin 方案](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L961-L1008) 已提供），Playwright 截图对比推迟到视觉稳定性建立后。

### 8. 性能测试章节为空壳

文档定义了明确的性能验收标准（FPS ≥ 60、内存 ≤ 200MB 等），但：
- 引用的 `tests/benchmarks/test_performance.gd` **从未给出实现**
- 没有描述如何测量 FPS、内存占用、帧时间的具体方法
- 没有定义性能基准测试的场景（如：50 敌人同时在场时的 FPS）

---

## 🟡 一般问题（建议改进）

### 9. CI/CD 工作流效率问题

- **GUT 重复安装**：每个 job 都执行 `git clone https://github.com/bitwes/Gut.git addons/gut`，应使用 cache 或作为独立步骤
- **Godot 安装无缓存**：`chickensoft-games/setup-godot@v1` 每次 download 较慢，建议增加 `cache` 配置
- **截图测试 job 依赖链过长**：`screenshot-tests` → 依赖 `unit-tests` + `integration-tests` → 依赖 `code-quality`，串行等待时间长
- **缺少并行化**：unit-tests 和 integration-tests 互相依赖（`needs: unit-tests`），实际上可以并行执行

### 10. `after_each()` 中的 `queue_free()` 与 `add_child_autofree()` 冗余

GUT 的 `add_child_autofree()` 已经会在测试结束后自动释放节点，[`after_each()`](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L155-L157) 中再调用 `queue_free()` 是冗余操作，且可能引发警告。

### 11. 覆盖率工具链不明确

- 命令速查中提到 `-gcover` 参数，但 **GUT 在 Godot 4.x 下的覆盖率支持有限制**（需要额外配置，且对 GDScript 的行级覆盖率统计不够成熟）
- 未说明覆盖率报告如何与 CI 质量门禁（要求 ≥70%）对接
- 建议明确：是否接受 GUT 自带的覆盖率统计？是否有备选方案？

### 12. 测试夹具（Fixture）设计过度工程化

[PlayerFixture](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L1234-L1260) 使用 `Resource` + `.tres` 文件方案对于 MVP 项目过重。GDScript 测试中使用简单的 helper 函数或 `before_each()` 初始化即可满足需求。

### 13. 安全检查项与游戏项目无关

[质量门禁](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/docs/VALIDATION-TECHNICAL-SPEC.md#L1508-L1511) 中的安全检查项：
```yaml
security:
  - no_hardcoded_secrets: true
  - no_debug_code_in_production: true
```
这是一个本地单机生存游戏，不涉及网络通信、用户认证或密钥管理。这些检查项虽然无害但不适用，建议替换为游戏相关的质量检查（如：资源引用完整性、场景树有效性）。

---

## ✅ 做得好的地方

1. **测试金字塔结构合理** — 60% 单元 / 30% 集成 / 10% E2E 的比例符合游戏项目最佳实践
2. **GUT 框架选型正确** — Godot 生态最成熟的测试方案，命令行支持完善
3. **测试目录结构清晰** — unit/integration/e2e/benchmarks 分层明确
4. **录屏方案实用** — PNG 序列帧 + FFmpeg 合成的方案可靠且跨平台
5. **验收标准量化充分** — FPS/内存/延迟/覆盖率都有明确数值指标
6. **Godot 编辑器截图工具** — 作为开发辅助工具非常实用

---

## 📋 修复优先级建议

| 优先级 | 问题 | 工作量估计 |
|--------|------|-----------|
| P0 | 根据实际源码重写所有测试用例（问题 #1） | 大 |
| P0 | 修复 GDScript 语法错误（问题 #2） | 小 |
| P0 | 替换所有空断言为有效验证（问题 #3） | 中 |
| P1 | 补充 Enemy 类完整测试（问题 #4） | 中 |
| P1 | 补充缺失的集成场景（问题 #5） | 中 |
| P1 | 解决 headless Input 模拟问题（问题 #6） | 中 |
| P1 | 补充性能测试实现（问题 #8） | 中 |
| P2 | 优化 CI 流水线（问题 #9） | 小 |
| P2 | 明确覆盖率工具链（问题 #11） | 小 |
| P3 | 简化截图方案为 MVP 友好版本（问题 #7） | 中 |

---

**总结**：该验证技术方案的框架设计和策略思路是正确的，适合指导 MVP 阶段的测试工作。但核心测试用例必须基于实际的 [Player.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Player.gd)、[Bullet.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Bullet.gd)、[Game.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Game.gd)、[Enemy.gd](file:///c:/projects/Claude-Code-Game-Studios-0.3.0/Claude-Code-Game-Studios-0.3.0/projects/threeking/scripts/Enemy.gd) 源码重写，否则现有测试代码基本无法运行通过。建议按 P0→P3 优先级逐步修订。

---

**文档版本历史**

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-04-08 | 初始版本 | 技术总监 |
| v1.1 | 2026-04-08 | 评审意见 | 研发经理 |
