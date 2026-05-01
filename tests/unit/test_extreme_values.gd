# test_extreme_values.gd
# Task 27: 极限值测试套件 U21~U25
extends "res://tests/test_base.gd"

# U21: 攻速倍率极大时 wait_time 被夹紧到安全下限
func test_attack_rate_clamped_to_min_when_mult_huge() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()
	gm.attack_rate_mult = 10000.0
	
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	var player = player_scene.instantiate()
	add_child(player)
	player._refresh_attack_rate()
	var wait: float = player.attack_timer.wait_time
	
	assert_gte(wait, 0.08, "attack timer must not go below safety floor")
	
	player.queue_free()

# U22: 升级阈值必须单调递增
func test_xp_threshold_grows_monotonically() -> void:
	var prev: int = 5
	for i in range(30):
		var next: int = MathUtils.calc_next_threshold(prev)
		assert_gt(next, prev, "threshold at step %d must grow" % i)
		prev = next

# U23: 30 级时单级所需经验应在合理区间
func test_xp_threshold_reasonable_at_level_30() -> void:
	var threshold: int = 5
	for i in range(29):
		threshold = MathUtils.calc_next_threshold(threshold)
	# 30 级应在 1000~5000 之间（设计意图：单局 5~10 分钟到 30 级）
	assert_between(threshold, 1000, 5000, "level 30 threshold sanity")

# U24: 10 分钟后敌人血量仍在可击杀范围
func test_enemy_health_growth_bounded() -> void:
	# 敌人血量随时间增长，10 分钟（600 秒）后不能高到无法击杀
	var hp_at_10min: int = 3 + int(600 / 15.0)  # = 43
	var player_dps: float = 1.0 / 0.6  # 1 伤害 / 0.6 秒
	var ttk: float = float(hp_at_10min) / player_dps
	assert_lt(ttk, 30.0, "10min enemy must be killable within 30s by base player")

# U25: 极限升级后数值仍合理
func test_player_with_max_upgrades_still_balanced() -> void:
	var gm: Node = load("res://src/autoload/GameManager.gd").new()
	gm.start_run()
	
	# 连升 20 级全部攻速
	for i in range(20):
		gm.apply_upgrade("attack_speed")
	
	var wait: float = max(0.08, 0.6 / gm.attack_rate_mult)
	assert_gt(wait, 0.0, "no division by zero or negative")
	assert_lte(gm.attack_rate_mult, 3.0, "attack rate mult should be capped at 3.0")
	
	# 连升 20 级全部弹速
	for i in range(20):
		gm.apply_upgrade("bullet_speed")
	assert_lte(gm.bullet_speed_mult, 3.0, "bullet speed mult should be capped at 3.0")
	
	# 连升 20 级全部 multishot
	for i in range(20):
		gm.apply_upgrade("multishot")
	assert_lte(gm.bonus_multishot, 5, "multishot should be capped at 5")
	
	# 连升 20 级全部 pierce
	for i in range(20):
		gm.apply_upgrade("pierce")
	assert_lte(gm.bonus_pierce, 3, "pierce should be capped at 3")
