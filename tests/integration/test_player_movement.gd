# test_player_movement.gd
# I1~I4: Player 节点行为
extends "res://tests/test_base.gd"

# I1: 玩家速度设置正确
func test_player_moves_right_with_velocity() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var player = player_scene.instantiate()
	add_child(player)

	# 直接设置速度（绕过输入系统）
	player.velocity = Vector2.RIGHT * player.base_speed
	var start_x: float = player.position.x
	player.move_and_slide()
	await get_tree().physics_frame

	assert_true(player.position.x > start_x, "player should move when velocity is set")

	player.queue_free()

# I2: 对角线速度归一化
func test_player_diagonal_speed_equals_straight() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")

	# 只按右
	var player1 = player_scene.instantiate()
	var straight_vec: Vector2 = MathUtils.normalize_input(Vector2.RIGHT)
	player1.free()

	# 按右+下
	var player2 = player_scene.instantiate()
	var diagonal_vec: Vector2 = MathUtils.normalize_input(Vector2(1, 1))
	player2.free()

	# 归一化后对角线长度应等于直线长度
	assert_almost_eq(diagonal_vec.length(), straight_vec.length(), 0.001, "diagonal normalized should equal straight normalized")

# I3: 移速词条生效
func test_player_move_speed_mult_takes_effect() -> void:
	GameManager.move_speed_mult = 2.0

	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var player = player_scene.instantiate()
	add_child(player)

	var speed: float = player.get_current_speed()
	assert_eq(speed, player.base_speed * 2.0, "get_current_speed should reflect move_speed_mult")

	player.free()
	GameManager.move_speed_mult = 1.0

# I4: 受伤减少血量
func test_player_take_damage_reduces_health() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var player = player_scene.instantiate()
	add_child(player)

	await get_tree().process_frame
	await get_tree().process_frame

	var initial_hp: int = player.current_health

	# 确保可以受伤
	player.can_be_hurt = true

	player.take_damage(3)
	await get_tree().process_frame

	assert_eq(player.current_health, initial_hp - 3, "take_damage should reduce current_health")

	player.queue_free()
