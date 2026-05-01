# test_upgrade_visual_feedback.gd
# Task 26 Red: 验证 multishot 升级影响子弹数，damage 升级不影响子弹数
extends "res://tests/test_base.gd"

func _count_bullets() -> int:
	return get_tree().get_nodes_in_group(&"bullet").size()

func _setup_main_with_enemy() -> Node:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)
	
	var player_nodes: Array[Node] = get_tree().get_nodes_in_group(&"player")
	assert_true(player_nodes.size() > 0, "main scene should have player")
	
	# 放一个敌人让玩家有目标
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")
	var enemy: Node = enemy_scene.instantiate()
	var player: Node = player_nodes[0]
	enemy.global_position = player.global_position + Vector2(200, 0)
	main.add_child(enemy)
	
	return main

func test_multishot_upgrade_increases_bullet_count() -> void:
	GameManager.start_run()
	
	var main: Node = _setup_main_with_enemy()
	var player_nodes: Array[Node] = get_tree().get_nodes_in_group(&"player")
	var player: Node = player_nodes[0]
	
	# 第一次发射，记录新增子弹数
	var bullets_before: int = _count_bullets()
	player._on_attack_timer()
	await get_tree().process_frame
	var first_fire_count: int = _count_bullets() - bullets_before
	assert_eq(first_fire_count, 1, "base fire should produce exactly 1 bullet")
	
	# 应用 multishot 升级
	GameManager.apply_upgrade("multishot")
	
	# 第二次发射，记录新增子弹数
	bullets_before = _count_bullets()
	player._on_attack_timer()
	await get_tree().process_frame
	var second_fire_count: int = _count_bullets() - bullets_before
	
	assert_eq(second_fire_count - first_fire_count, 1, 
		"multishot upgrade should add exactly 1 more bullet per fire")
	
	main.queue_free()
	await get_tree().process_frame
	GameManager.start_run()

func test_damage_upgrade_does_not_change_bullet_count() -> void:
	# 重置 GameManager 状态，避免前一个测试的升级残留
	GameManager.start_run()
	
	var main: Node = _setup_main_with_enemy()
	var player_nodes: Array[Node] = get_tree().get_nodes_in_group(&"player")
	var player: Node = player_nodes[0]
	
	# 第一次发射，记录新增子弹数
	var bullets_before: int = _count_bullets()
	player._on_attack_timer()
	await get_tree().process_frame
	var first_fire_count: int = _count_bullets() - bullets_before
	
	# 应用 damage 升级
	GameManager.apply_upgrade("damage")
	
	# 第二次发射，记录新增子弹数
	bullets_before = _count_bullets()
	player._on_attack_timer()
	await get_tree().process_frame
	var second_fire_count: int = _count_bullets() - bullets_before
	
	assert_eq(second_fire_count - first_fire_count, 0, 
		"damage upgrade must NOT change bullet count")
	
	main.queue_free()
	await get_tree().process_frame
	GameManager.start_run()
