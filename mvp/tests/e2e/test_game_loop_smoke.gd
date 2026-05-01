# test_game_loop_smoke.gd
# E1~E5: E2E 端到端测试
extends "res://tests/test_base.gd"

# E1: 主场景运行 3 秒无错误
func test_main_scene_runs_3_seconds_without_errors() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)

	GameManager.start_run()
	await get_tree().create_timer(3.0).timeout

	var players := get_tree().get_nodes_in_group(&"player")
	assert_eq(players.size(), 1, "player should be alive after 3s")

	var enemies := get_tree().get_nodes_in_group(&"enemy")
	assert_true(enemies.size() > 0, "at least 1 enemy should be spawned")

	assert_true(GameManager.game_time > 2.5, "game_time should be advancing")

	main.queue_free()

# E2: 击杀敌人触发升级面板
func test_kill_enemies_triggers_level_up_panel() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)

	GameManager.start_run()
	await get_tree().process_frame

	# 手动给经验触发升级
	GameManager.add_xp(5)
	await get_tree().process_frame

	var hud: CanvasLayer = main.get_node("HUD")
	var panel: Panel = hud.get_node("Root/UpgradePanel")
	assert_true(panel.visible, "upgrade panel should be visible after level up")
	assert_true(get_tree().paused, "game should be paused during upgrade")

	# 恢复
	get_tree().paused = false
	main.queue_free()

# E3: 玩家死亡显示 GameOver
func test_player_death_shows_game_over() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)

	GameManager.start_run()
	await get_tree().process_frame

	var player := get_tree().get_nodes_in_group(&"player")[0]
	player.take_damage(999)
	await get_tree().process_frame

	var label: Label = main.get_node("GameOverLabel")
	assert_true(label.visible, "game over label should be shown")
	assert_true(not GameManager.is_running, "game should be marked not running")

	main.queue_free()

# E4: 完整战斗链
func test_full_combat_chain() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)

	GameManager.start_run()
	await get_tree().process_frame

	var player := get_tree().get_nodes_in_group(&"player")[0]
	var initial_hp: int = player.current_health

	# 强制 spawn 一个敌人贴脸
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")
	var enemy = enemy_scene.instantiate()
	enemy.global_position = player.global_position
	main.add_child(enemy)

	await get_tree().create_timer(0.8).timeout

	# 接触伤害应该已触发
	assert_true(player.current_health < initial_hp, "player should take contact damage")

	# HUD 血条应同步
	var hp_bar: ProgressBar = main.get_node("HUD/Root/HealthBar")
	assert_eq(hp_bar.value, float(player.current_health), "hp bar should be synced")

	main.queue_free()

# E5: 升级后属性生效
func test_upgrade_actually_affects_gameplay() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)

	GameManager.start_run()
	await get_tree().process_frame

	var player := get_tree().get_nodes_in_group(&"player")[0]
	var before_wait: float = player.get_node("AttackTimer").wait_time

	# 模拟选中"攻速"词条
	GameManager.apply_upgrade("attack_speed")
	player._refresh_attack_rate()
	var after_wait: float = player.get_node("AttackTimer").wait_time

	assert_true(after_wait < before_wait, "attack interval should shrink after upgrade")
	assert_almost_eq(after_wait, before_wait / 1.15, 0.001, "wait time should be divided by 1.15")

	main.queue_free()
