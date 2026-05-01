# test_hud_reflects_damage.gd
# Task 21: HUD 血条反映玩家伤害
extends "res://tests/test_base.gd"

func test_hud_reflects_player_damage() -> void:
	# 实例化 Main.tscn
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main: Node2D = main_scene.instantiate()
	add_child(main)

	# 获取玩家和 HUD
	var player: Node = main.get_node("Player")
	var hud: CanvasLayer = main.get_node("HUD")
	var hp_bar: ProgressBar = hud.get_node("Root/HealthBar")

	# 初始血量应为 10
	assert_eq(hp_bar.value, 10.0, "initial hp bar should be 10")
	assert_eq(hp_bar.max_value, 10.0, "initial hp bar max should be 10")

	# 调用 player.take_damage(3)
	player.take_damage(3)

	# 等待一帧让信号传播到 UI
	await get_tree().process_frame

	# 断言 hud.hp_bar.value == 7
	assert_eq(hp_bar.value, 7.0, "hp bar should reflect damage, expected 7 after taking 3 damage")

	# 清理
	main.queue_free()
