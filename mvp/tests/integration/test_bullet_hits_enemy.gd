# test_bullet_hits_enemy.gd
# Task 21: 集成回归测试 —— 子弹真实命中敌人
extends "res://tests/test_base.gd"

func test_bullet_hits_enemy_and_both_destroyed() -> void:
	# 实例化真实的 Bullet 和 Enemy（不是 mock）
	var bullet_scene: PackedScene = load("res://scenes/Bullet.tscn")
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")

	var bullet: Area2D = bullet_scene.instantiate()
	var enemy: CharacterBody2D = enemy_scene.instantiate()

	# 把它们加到 SceneTree
	var test_root: Node = Node.new()
	add_child(test_root)
	test_root.add_child(enemy)
	test_root.add_child(bullet)

	# 设置位置重叠
	enemy.global_position = Vector2(100, 100)
	bullet.global_position = Vector2(100, 100)

	# 设置子弹伤害（足以击杀）
	bullet.setup(Vector2.RIGHT, 99)

	# 等待一帧让节点完全初始化
	await get_tree().physics_frame

	# 手动触发碰撞检测（模拟 body_entered）
	# 因为 Area2D 的碰撞检测在 headless/测试环境下可能不可靠
	bullet._on_body_entered(enemy)

	# queue_free() 在下一帧才真正销毁，等待一帧
	await get_tree().process_frame

	# 断言：敌人被销毁（血量 3，受到 99 点伤害）
	assert_false(is_instance_valid(enemy), "enemy should be destroyed after taking damage")

	# 断言：子弹自毁
	assert_false(is_instance_valid(bullet), "bullet should queue_free after hit")

	# 清理
	if is_instance_valid(test_root):
		test_root.queue_free()

func test_bullet_collision_layers_configured() -> void:
	# 验证碰撞层配置正确，确保如果配错会失败
	var bullet_scene: PackedScene = load("res://scenes/Bullet.tscn")
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")

	var bullet: Area2D = bullet_scene.instantiate()
	var enemy: CharacterBody2D = enemy_scene.instantiate()

	# Bullet 应该在 Projectile 层(4)，检测 Enemy 层(2)
	assert_true(bullet.collision_layer == 4, "bullet should be on layer 4 (Projectile)")
	assert_true(bullet.collision_mask & 2 != 0, "bullet should mask layer 2 (Enemy)")

	# Enemy 应该在 Enemy 层(2)
	assert_true(enemy.collision_layer == 2, "enemy should be on layer 2 (Enemy)")

	bullet.free()
	enemy.free()
