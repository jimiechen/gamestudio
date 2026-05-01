# test_balance_simulation.gd
# Task 28: 稳态仿真测试套件 E6~E8
extends "res://tests/test_base.gd"

# E6: 完全不升级、不移动，玩家应在 10~90 秒内死亡
func test_player_survives_first_minute_with_no_upgrades() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)
	await get_tree().process_frame
	
	GameManager.start_run()
	
	var player := get_tree().get_nodes_in_group(&"player")[0]
	
	# 禁用自动攻击，确保不通过击杀敌人获得经验
	player.attack_timer.stop()
	
	# 阻止 HUD 弹出升级面板导致暂停
	var hud: CanvasLayer = main.get_node("HUD")
	if GameManager.level_up.is_connected(hud._on_level_up):
		GameManager.level_up.disconnect(hud._on_level_up)
	
	var death_time: float = -1.0
	var elapsed: float = 0.0
	var max_simulation: float = 120.0
	
	while elapsed < max_simulation and is_instance_valid(player):
		await get_tree().physics_frame
		elapsed += get_physics_process_delta_time()
	
	death_time = elapsed
	
	assert_between(death_time, 10.0, 90.0,
		"no-upgrade no-move death time should be 10~90s, got %.1f" % death_time)
	
	main.queue_free()
	GameManager.start_run()

# E7: 60 秒内完美击杀所有敌人，应能达到 5~12 级
func test_xp_per_minute_in_steady_state() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)
	await get_tree().process_frame
	
	GameManager.start_run()
	
	var player := get_tree().get_nodes_in_group(&"player")[0]
	# 禁用自动攻击，避免干扰
	player.attack_timer.stop()
	
	# 阻止 HUD 弹出升级面板导致暂停
	var hud: CanvasLayer = main.get_node("HUD")
	if GameManager.level_up.is_connected(hud._on_level_up):
		GameManager.level_up.disconnect(hud._on_level_up)
	
	var spawned: int = 0
	var elapsed: float = 0.0
	
	while elapsed < 60.0:
		# 确保游戏不会被暂停
		get_tree().paused = false
		
		# 每帧自动击杀所有敌人
		for e in get_tree().get_nodes_in_group(&"enemy"):
			if is_instance_valid(e) and e.has_method("take_damage"):
				e.take_damage(999)
				spawned += 1
		
		await get_tree().physics_frame
		elapsed += get_physics_process_delta_time()
	
	assert_between(GameManager.level, 5, 12,
		"1min level should be 5~12, got %d (killed %d enemies)" % [GameManager.level, spawned])
	
	main.queue_free()
	GameManager.start_run()

# E8: 玩家完全不输出，3 分钟后敌人数不应爆炸
func test_screen_enemy_count_does_not_explode() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)
	await get_tree().process_frame
	
	GameManager.start_run()
	
	var player := get_tree().get_nodes_in_group(&"player")[0]
	# 让玩家无敌且不动，专门测刷怪上限
	player.set_process(false)
	player.set_physics_process(false)
	player.attack_timer.stop()
	
	# 阻止 HUD 弹出升级面板导致暂停
	var hud: CanvasLayer = main.get_node("HUD")
	if GameManager.level_up.is_connected(hud._on_level_up):
		GameManager.level_up.disconnect(hud._on_level_up)
	
	var elapsed: float = 0.0
	while elapsed < 180.0:
		get_tree().paused = false
		await get_tree().physics_frame
		elapsed += get_physics_process_delta_time()
	
	var count: int = get_tree().get_nodes_in_group(&"enemy").size()
	assert_lt(count, 500,
		"enemy count must stay under 500 even after 3min, got %d" % count)
	
	main.queue_free()
	GameManager.start_run()
