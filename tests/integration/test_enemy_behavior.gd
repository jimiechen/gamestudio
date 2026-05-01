# test_enemy_behavior.gd
# I8~I10: Enemy 行为
extends "res://tests/test_base.gd"

# I8: 敌人追踪玩家
func test_enemy_chases_player() -> void:
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")
	var enemy = enemy_scene.instantiate()
	add_child(enemy)

	# 创建一个假玩家
	var fake_player: Node2D = Node2D.new()
	fake_player.add_to_group("player")
	fake_player.position = Vector2.ZERO
	add_child(fake_player)

	enemy.position = Vector2(200, 0)
	await get_tree().physics_frame

	for i in range(10):
		await get_tree().physics_frame

	assert_true(enemy.position.x < 190.0, "enemy should move toward player (got x=%.1f)" % enemy.position.x)

	enemy.queue_free()
	fake_player.queue_free()

# I9: 敌人接触伤害有冷却
func test_enemy_contact_damages_player_with_cooldown() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")

	var player = player_scene.instantiate()
	var enemy = enemy_scene.instantiate()
	add_child(player)
	add_child(enemy)

	# 等待 _ready 完成
	await get_tree().process_frame

	# 重叠放置
	player.position = Vector2(100, 100)
	enemy.position = Vector2(100, 100)

	var initial_hp: int = player.current_health

	# 跑 1.2 秒（约 72 帧），给足够时间触发 2 次伤害
	for i in range(72):
		await get_tree().physics_frame

	var damage_count: int = initial_hp - player.current_health
	# 0.5s 冷却，1.2 秒内应该触发 2~3 次
	assert_true(damage_count >= 2, "contact damage should trigger at least twice (got %d)" % damage_count)

	player.queue_free()
	enemy.queue_free()

# I10: 敌人死亡奖励经验
func test_enemy_death_awards_xp() -> void:
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")
	var enemy = enemy_scene.instantiate()
	add_child(enemy)

	var xp_reward: int = enemy.xp_reward
	var initial_xp: int = GameManager.xp
	enemy.take_damage(999)
	await get_tree().process_frame

	assert_eq(GameManager.xp, initial_xp + xp_reward, "enemy death should award xp")

	if is_instance_valid(enemy):
		enemy.queue_free()
