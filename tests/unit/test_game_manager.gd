# test_game_manager.gd
extends "res://tests/test_base.gd"

# 信号监听器类
class SignalWatcher:
	var count: int = 0
	var captured_args: Array = []

	func watch_xp(current: int, _to_next: int) -> void:
		count += 1
		captured_args = [current, _to_next]

	func watch_level_up(new_level: int) -> void:
		count += 1
		captured_args = [new_level]

# U1: GameManager 初始状态
func test_initial_state() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	assert_eq(gm.level, 1, "initial level should be 1")
	assert_eq(gm.xp, 0, "initial xp should be 0")
	assert_eq(gm.xp_to_next, 5, "initial xp_to_next should be 5")
	assert_true(not gm.is_running, "initial is_running should be false")

# U2: XP 累计
func test_add_xp_accumulates() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()

	var watcher := SignalWatcher.new()
	gm.xp_changed.connect(watcher.watch_xp)

	gm.add_xp(3)
	assert_eq(gm.xp, 3, "xp should be 3 after adding 3")
	assert_eq(watcher.count, 1, "xp_changed should emit once")
	assert_eq(watcher.captured_args[0], 3, "signal should pass current xp = 3")

# Task 2: 升级阈值与等级上升
func test_level_up_when_xp_reaches_threshold() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()

	var watcher := SignalWatcher.new()
	gm.level_up.connect(watcher.watch_level_up)

	assert_eq(gm.xp_to_next, 5, "initial xp_to_next should be 5")
	gm.add_xp(5)
	assert_eq(gm.level, 2, "level should be 2 after reaching threshold")
	assert_eq(gm.xp, 0, "xp should reset to 0 after level up")
	assert_eq(watcher.count, 1, "level_up should emit once")
	assert_eq(watcher.captured_args[0], 2, "level_up signal should pass level 2")

# Task 3: 一次溢出多级
func test_multi_level_up_in_one_add() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()

	var watcher := SignalWatcher.new()
	gm.level_up.connect(watcher.watch_level_up)

	gm.add_xp(100)
	assert_true(gm.level >= 3, "should level up multiple times")
	assert_true(watcher.count >= 2, "level_up should emit at least twice")

# Task 4: 升级词条应用
func test_apply_upgrade_modifies_stats() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()

	gm.apply_upgrade("damage")
	assert_eq(gm.bonus_damage, 1, "damage upgrade should add 1")

	gm.apply_upgrade("attack_speed")
	gm.apply_upgrade("attack_speed")
	assert_almost_eq(gm.attack_rate_mult, 1.3225, 0.001, "two attack_speed upgrades should be 1.3225 (1.15^2)")

	gm.apply_upgrade("move_speed")
	assert_almost_eq(gm.move_speed_mult, 1.10, 0.001, "move_speed upgrade should be 1.10")

# Task 5: 重开清零
func test_start_run_resets_state() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()

	gm.add_xp(10)
	gm.apply_upgrade("damage")
	gm.apply_upgrade("attack_speed")
	gm.is_running = false

	gm.start_run()
	assert_eq(gm.level, 1, "level should reset to 1")
	assert_eq(gm.xp, 0, "xp should reset to 0")
	assert_eq(gm.xp_to_next, 5, "xp_to_next should reset to 5")
	assert_eq(gm.bonus_damage, 0, "bonus_damage should reset to 0")
	assert_eq(gm.bonus_multishot, 0, "bonus_multishot should reset to 0")
	assert_eq(gm.bonus_pierce, 0, "bonus_pierce should reset to 0")
	assert_eq(gm.attack_rate_mult, 1.0, "attack_rate_mult should reset to 1.0")
	assert_eq(gm.move_speed_mult, 1.0, "move_speed_mult should reset to 1.0")
	assert_eq(gm.bullet_speed_mult, 1.0, "bullet_speed_mult should reset to 1.0")
	assert_true(gm.is_running, "is_running should be true")
