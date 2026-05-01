# test_player_attack.gd
# I13~I15: Player 自动攻击链
extends "res://tests/test_base.gd"

# I13: 玩家自动朝最近敌人发射子弹
func test_player_auto_fires_toward_nearest_enemy() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")

	var player = player_scene.instantiate()
	var enemy = enemy_scene.instantiate()
	add_child(player)
	add_child(enemy)

	player.position = Vector2.ZERO
	enemy.position = Vector2(100, 0)

	# 确保有 current_scene 供 bullet 添加
	if get_tree().current_scene == null:
		get_tree().current_scene = self

	# 手动触发攻击
	player._on_attack_timer()
	await get_tree().process_frame

	# 查找场景中的子弹（bullet 被添加到 current_scene）
	var bullets: Array[Node] = []
	for child in get_tree().current_scene.get_children():
		if child is Area2D and child.has_method("setup"):
			bullets.append(child)

	assert_true(bullets.size() > 0, "player should fire a bullet when enemy is present")

	player.queue_free()
	enemy.queue_free()
	for b in bullets:
		if is_instance_valid(b):
			b.queue_free()

# I14: 无敌人时不发射
func test_player_does_not_fire_when_no_enemy() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var player = player_scene.instantiate()
	add_child(player)

	player.position = Vector2.ZERO

	# 确保没有敌人
	for e in get_tree().get_nodes_in_group(&"enemy"):
		e.queue_free()

	player._on_attack_timer()
	await get_tree().process_frame

	# 查找子弹
	var bullet_count: int = 0
	for child in get_children():
		if child is Area2D and child.has_method("setup"):
			bullet_count += 1

	assert_eq(bullet_count, 0, "player should not fire when no enemy is present")

	player.queue_free()

# I15: 攻速词条缩短攻击间隔
func test_attack_rate_mult_shrinks_timer_wait() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var player = player_scene.instantiate()
	add_child(player)

	var before_wait: float = player.attack_timer.wait_time
	GameManager.attack_rate_mult = 2.0
	player._refresh_attack_rate()
	var after_wait: float = player.attack_timer.wait_time

	assert_true(after_wait < before_wait, "attack_rate_mult should shrink timer wait time")
	assert_almost_eq(after_wait, before_wait / 2.0, 0.01, "wait time should be halved when mult is 2.0")

	GameManager.attack_rate_mult = 1.0
	player.queue_free()
