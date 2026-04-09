extends GutTest

var bullet: Bullet

func before_each():
	bullet = Bullet.new()
	bullet.speed = 400.0
	bullet.damage = 10
	bullet.lifetime = 2.0
	bullet.direction = Vector2.RIGHT
	add_child_autofree(bullet)

func after_each():
	bullet = null

func test_initial_direction_is_right():
	assert_eq(bullet.direction, Vector2.RIGHT, "Default direction should be RIGHT")

func test_speed_is_positive():
	assert_gt(bullet.speed, 0, "speed should be positive")

func test_damage_is_positive():
	assert_gt(bullet.damage, 0, "damage should be positive")

func test_lifetime_is_positive():
	assert_gt(bullet.lifetime, 0, "lifetime should be positive")

func test_static_bullet_visual_points_exists():
	assert_true(Bullet._bullet_visual_points.size() > 0, "Static bullet visual points should be non-empty")

func test_static_bullet_visual_points_has_correct_count():
	var expected_segments = 9
	assert_eq(Bullet._bullet_visual_points.size(), expected_segments, "Bullet should have 9 points (8 segments + 1 closing)")

func test_bullet_direction_can_be_set():
	bullet.direction = Vector2.UP
	assert_eq(bullet.direction, Vector2.UP, "Direction should be updatable")

func test_bullet_direction_raw_stored():
	bullet.direction = Vector2(3, 4)
	var len_before = bullet.direction.length()
	assert_almost_eq(len_before, 5.0, 0.001, "Direction stores raw value before normalization in _physics_process")
