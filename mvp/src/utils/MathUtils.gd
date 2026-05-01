# MathUtils.gd
# 纯函数集合 - 便于单元测试
class_name MathUtils

static func normalize_input(v: Vector2) -> Vector2:
	if v.length() > 0.0:
		return v.normalized()
	return Vector2.ZERO

static func calc_next_threshold(current: int) -> int:
	return int(current * 1.20) + 2

static func find_nearest_index(origin: Vector2, positions: Array[Vector2]) -> int:
	var min_d: float = INF
	var nearest_idx: int = -1
	for i in range(positions.size()):
		var d: float = origin.distance_squared_to(positions[i])
		if d < min_d:
			min_d = d
			nearest_idx = i
	return nearest_idx

static func seek_direction(from: Vector2, to: Vector2) -> Vector2:
	var dir: Vector2 = to - from
	if dir.length() > 0.0:
		return dir.normalized()
	return Vector2.ZERO

static func calc_interval(base: float, elapsed: float) -> float:
	return max(0.15, base - elapsed * 0.01)

static func calc_spawn_position(center: Vector2, radius: float, rng: RandomNumberGenerator) -> Vector2:
	var angle: float = rng.randf() * TAU
	return center + Vector2(cos(angle), sin(angle)) * radius
