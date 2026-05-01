# test_math_utils.gd
extends "res://tests/test_base.gd"

# Task 6: 输入向量归一化
func test_normalize_input_diagonal() -> void:
	var result: Vector2 = MathUtils.normalize_input(Vector2(1, 1))
	assert_almost_eq(result.length(), 1.0, 0.001, "diagonal input should be normalized to length 1")

func test_normalize_input_zero() -> void:
	var result: Vector2 = MathUtils.normalize_input(Vector2.ZERO)
	assert_eq(result, Vector2.ZERO, "zero input should remain zero")

func test_normalize_input_straight() -> void:
	var result: Vector2 = MathUtils.normalize_input(Vector2.RIGHT)
	assert_eq(result, Vector2.RIGHT, "already normalized vector should stay the same")

# Task 2 Refactor: 升级阈值公式
func test_calc_next_threshold() -> void:
	assert_eq(MathUtils.calc_next_threshold(5), 8, "5 * 1.20 + 2 = 8 (int truncated)")
	assert_eq(MathUtils.calc_next_threshold(8), 11, "8 * 1.20 + 2 = 11 (int truncated)")

# Task 7: 索敌找最近敌人
func test_find_nearest_index() -> void:
	var positions: Array[Vector2] = [Vector2(100, 0), Vector2(10, 0), Vector2(50, 50)]
	var idx: int = MathUtils.find_nearest_index(Vector2.ZERO, positions)
	assert_eq(idx, 1, "nearest to (0,0) should be index 1 at (10,0)")

func test_find_nearest_index_empty() -> void:
	var positions: Array[Vector2] = []
	var idx: int = MathUtils.find_nearest_index(Vector2.ZERO, positions)
	assert_eq(idx, -1, "empty array should return -1")

# U11: 索敌平局时优先返回第一个
func test_find_nearest_tie_prefers_first() -> void:
	var positions: Array[Vector2] = [Vector2(10, 0), Vector2(10, 0), Vector2(50, 50)]
	var idx: int = MathUtils.find_nearest_index(Vector2.ZERO, positions)
	assert_eq(idx, 0, "tie should prefer the first occurrence")

# Task 13: 敌人追踪方向
func test_seek_direction() -> void:
	var dir: Vector2 = MathUtils.seek_direction(Vector2.ZERO, Vector2(3, 4))
	assert_almost_eq(dir.length(), 1.0, 0.001, "seek direction should be normalized")
	assert_almost_eq(dir.x, 0.6, 0.001, "x component should be 0.6")
	assert_almost_eq(dir.y, 0.8, 0.001, "y component should be 0.8")

func test_seek_direction_same_position() -> void:
	var dir: Vector2 = MathUtils.seek_direction(Vector2.ZERO, Vector2.ZERO)
	assert_eq(dir, Vector2.ZERO, "same position should return zero vector")

# Task 16: 刷怪间隔曲线
func test_calc_interval_initial() -> void:
	assert_eq(MathUtils.calc_interval(1.2, 0.0), 1.2, "initial interval should be base")

func test_calc_interval_shrinks() -> void:
	var result: float = MathUtils.calc_interval(1.2, 60.0)
	assert_almost_eq(result, 0.6, 0.001, "after 60s interval should shrink")

func test_calc_interval_floor() -> void:
	var result: float = MathUtils.calc_interval(1.2, 9999.0)
	assert_eq(result, 0.15, "interval should have floor of 0.15")

# Task 17: 出生点在玩家周围随机圆上
func test_spawn_position_is_on_ring() -> void:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = 12345
	var center: Vector2 = Vector2(100, 100)
	var radius: float = 500.0

	for i in range(100):
		var pos: Vector2 = MathUtils.calc_spawn_position(center, radius, rng)
		var dist: float = pos.distance_to(center)
		assert_almost_eq(dist, radius, 0.01, "spawn position should be on ring")
