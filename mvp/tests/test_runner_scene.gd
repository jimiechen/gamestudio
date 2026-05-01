# test_runner_scene.gd
# 测试运行器 - 在 Godot 中运行所有测试
extends Node

var _passed: int = 0
var _failed: int = 0

func _ready() -> void:
	print("\n========== 测试运行器启动 ==========\n")
	await _run_all_tests()
	print("\n========== 测试结果 ==========")
	print("通过: %d" % _passed)
	print("失败: %d" % _failed)
	print("==============================\n")

	# 在编辑器中不退出
	if not Engine.is_editor_hint():
		get_tree().quit(_failed)

func _run_all_tests() -> void:
	# Unit tests
	await _run_test_file("res://tests/unit/test_smoke.gd")
	await _run_test_file("res://tests/unit/test_game_manager.gd")
	await _run_test_file("res://tests/unit/test_math_utils.gd")
	await _run_test_file("res://tests/unit/test_upgrade_pool.gd")
	await _run_test_file("res://tests/unit/test_extreme_values.gd")
	# Integration tests
	await _run_test_file("res://tests/integration/test_game_loop.gd")
	await _run_test_file("res://tests/integration/test_bullet_hits_enemy.gd")
	await _run_test_file("res://tests/integration/test_hud_reflects_damage.gd")
	await _run_test_file("res://tests/integration/test_player_movement.gd")
	await _run_test_file("res://tests/integration/test_bullet_lifetime.gd")
	await _run_test_file("res://tests/integration/test_enemy_behavior.gd")
	await _run_test_file("res://tests/integration/test_spawner.gd")
	await _run_test_file("res://tests/integration/test_player_attack.gd")
	await _run_test_file("res://tests/integration/test_upgrade_visual_feedback.gd")
	# UI tests
	await _run_test_file("res://tests/ui/test_hud.gd")
	# E2E tests
	await _run_test_file("res://tests/e2e/test_game_loop_smoke.gd")
	await _run_test_file("res://tests/e2e/test_balance_simulation.gd")

func _run_test_file(path: String) -> void:
	var script: GDScript = load(path)
	if script == null:
		print("[ERROR] 无法加载测试文件: %s" % path)
		_failed += 1
		return

	var instance = script.new()
	if not instance.has_method("assert_eq"):
		print("[ERROR] 测试文件没有 assert_eq 方法: %s" % path)
		_failed += 1
		return

	# 集成测试需要加入场景树才能使用 get_tree()
	if instance is Node:
		add_child(instance)

	# 查找所有 test_ 开头的方法
	var methods: Array[Dictionary] = instance.get_method_list()
	var test_methods: Array[String] = []
	for m in methods:
		var name: String = m["name"]
		if name.begins_with("test_"):
			test_methods.append(name)

	if test_methods.is_empty():
		_cleanup_instance(instance)
		print("[WARN] 没有找到测试方法: %s" % path)
		return

	print("运行: %s" % path)
	for test_name in test_methods:
		instance.clear_errors()
		var full_name: String = "%s::%s" % [path.get_file(), test_name]

		# 调用测试方法（支持 async/await）
		# 使用 await 直接调用，兼容同步和异步方法
		await instance.call(test_name)

		if instance.has_errors():
			_failed += 1
			print("  [FAIL] %s" % full_name)
			for err in instance.get_errors():
				print("         -> %s" % err)
		else:
			_passed += 1
			print("  [PASS] %s" % full_name)

	# 清理
	_cleanup_instance(instance)

func _cleanup_instance(instance) -> void:
	if instance is Node:
		if instance.get_parent() != null:
			instance.get_parent().remove_child(instance)
		instance.queue_free()
	# RefCounted 不需要手动释放，由引用计数管理
