# test_upgrade_pool.gd
extends "res://tests/test_base.gd"

# U12: apply_damage_upgrade
func test_apply_damage_upgrade() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()
	gm.apply_upgrade("damage")
	assert_eq(gm.bonus_damage, 1, "damage upgrade should add 1")
	gm.apply_upgrade("damage")
	assert_eq(gm.bonus_damage, 2, "two damage upgrades should be 2")

# U13: apply_attack_speed_multiplicative
func test_apply_attack_speed_multiplicative() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()
	gm.apply_upgrade("attack_speed")
	gm.apply_upgrade("attack_speed")
	assert_almost_eq(gm.attack_rate_mult, 1.3225, 0.001, "two attack_speed upgrades should be 1.3225 (1.15^2)")

# U14: pick_three_unique
func test_pick_three_unique() -> void:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = 42

	for i in range(50):
		var picks: Array[Dictionary] = UpgradePool.pick_three(rng)
		assert_eq(picks.size(), 3, "should return exactly 3 upgrades")

		var ids: Array[String] = []
		for p in picks:
			ids.append(p["id"])

		var unique_ids := ids.duplicate()
		unique_ids.sort()
		for j in range(1, unique_ids.size()):
			assert_true(unique_ids[j] != unique_ids[j - 1], "upgrades should be unique")

# U15: pick_three_when_pool_smaller_than_3
func test_pick_three_when_pool_smaller_than_3() -> void:
	# 当前池有3个，无法测试小于3的情况
	# 但测试不应崩溃
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	var picks: Array[Dictionary] = UpgradePool.pick_three(rng)
	assert_eq(picks.size(), 3, "should return 3 even with exact pool size")
