extends GutTest

var enemy: Enemy

func before_each():
	enemy = Enemy.new()
	enemy.max_hp = 30
	enemy.current_hp = 30
	enemy.speed = 120.0
	enemy.damage = 10
	enemy.score_value = 10
	var sprite = Sprite2D.new()
	sprite.name = "Sprite2D"
	enemy.add_child(sprite)
	add_child_autofree(enemy)

func after_each():
	enemy = null

func test_initial_hp_equals_max():
	assert_eq(enemy.current_hp, enemy.max_hp, "current_hp should equal max_hp")

func test_exported_properties_positive():
	assert_gt(enemy.speed, 0, "speed should be positive")
	assert_gt(enemy.max_hp, 0, "max_hp should be positive")
	assert_gt(enemy.damage, 0, "damage should be positive")
	assert_gt(enemy.score_value, 0, "score_value should be positive")

func test_current_hp_within_bounds():
	assert_lte(enemy.current_hp, enemy.max_hp, "current_hp should not exceed max_hp")
	assert_gte(enemy.current_hp, 0, "current_hp should not be negative")

func test_take_damage_zero_does_nothing():
	enemy.current_hp = 20
	enemy.take_damage(0)
	assert_eq(enemy.current_hp, 20, "Zero damage should not change HP")
