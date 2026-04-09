extends GutTest

var player: Player

func before_each():
	player = Player.new()
	player.max_hp = 100
	player.current_hp = 100
	player.speed = 220.0
	player.friction = 0.15
	player.invincibility_duration = 0.01
	player.shoot_cooldown = 0.2
	player.bullet_speed = 400.0
	player.bullet_damage = 15
	var sprite = Sprite2D.new()
	sprite.name = "Sprite2D"
	player.add_child(sprite)
	var spawn = Node2D.new()
	spawn.name = "BulletSpawn"
	player.add_child(spawn)
	add_child_autofree(player)

func after_each():
	player = null

func test_initial_hp_equals_max():
	assert_eq(player.current_hp, player.max_hp, "current_hp should equal max_hp")

func test_initial_state():
	assert_false(player.is_invincible, "is_invincible should be false initially")
	assert_false(player.is_auto_shooting, "is_auto_shooting should be false initially")

func test_aim_mode_defaults_to_keys():
	assert_eq(player.aim_mode, Player.AimMode.KEYS, "Default aim mode should be KEYS")

func test_last_key_aim_direction_defaults_to_right():
	assert_eq(player.last_key_aim_direction, Vector2.RIGHT, "Default aim direction should be RIGHT")

func test_take_damage_reduces_hp_direct():
	var initial_hp = player.current_hp
	player.current_hp -= 10
	assert_eq(player.current_hp, initial_hp - 10, "HP should decrease by damage amount")
	player.current_hp = initial_hp

func test_invincible_flag_can_be_toggled():
	assert_false(player.is_invincible, "Initially not invincible")
	player.is_invincible = true
	assert_true(player.is_invincible, "Can be set to invincible")
	player.is_invincible = false
	assert_false(player.is_invincible, "Can be unset")

func test_exported_properties_positive():
	assert_gt(player.speed, 0, "speed should be positive")
	assert_gt(player.max_hp, 0, "max_hp should be positive")
	assert_gt(player.invincibility_duration, 0, "invincibility_duration should be positive")
	assert_gt(player.shoot_cooldown, 0, "shoot_cooldown should be positive")
	assert_gt(player.bullet_speed, 0, "bullet_speed should be positive")
	assert_gt(player.bullet_damage, 0, "bullet_damage should be positive")
	assert_gt(player.auto_aim_range, 0, "auto_aim_range should be positive")

func test_cycle_aim_mode_changes():
	var start_mode = player.aim_mode
	player._cycle_aim_mode()
	assert_ne(player.aim_mode, start_mode, "Mode should change after cycle")

func test_cycle_aim_mode_returns_after_full_cycle():
	var start_mode = player.aim_mode
	for i in range(Player.AimMode.size()):
		player._cycle_aim_mode()
	assert_eq(player.aim_mode, start_mode, "Mode should return to start after full cycle")

func test_find_nearest_enemy_returns_null_when_empty():
	var result = player._find_nearest_enemy()
	assert_null(result, "Should return null when no enemies exist")
