# test_runner.gd
# 轻量级测试运行器 - 不依赖 GUT 插件
extends SceneTree

var _passed: int = 0
var _failed: int = 0
var _current_test: String = ""

func _init() -> void:
	print("=== 测试运行器启动 ===")
	_run_all_tests()
	print("\n=== 测试结果 ===")
	print("通过: %d" % _passed)
	print("失败: %d" % _failed)
	quit(_failed > 0)

func _run_all_tests() -> void:
	# 运行所有测试文件
	_run_test_file("res://tests/unit/test_smoke.gd")

func _run_test_file(path: String) -> void:
	var script: GDScript = load(path)
	if script == null:
		print("无法加载测试文件: %s" % path)
		return
	
	var instance = script.new()
	instance._test_runner = self
	
	# 查找所有 test_ 开头的方法
	var methods: Array[Dictionary] = instance.get_method_list()
	for m in methods:
		var name: String = m["name"]
		if name.begins_with("test_"):
			_current_test = "%s::%s" % [path, name]
			try:
				instance.call(name)
				_passed += 1
				print("  [PASS] %s" % _current_test)
			except:
				_failed += 1
				print("  [FAIL] %s" % _current_test)

# 断言方法
func assert_eq(actual, expected, message: String = "") -> void:
	if actual != expected:
		var msg: String = "断言失败: 期望 %s，实际 %s" % [str(expected), str(actual)]
		if message != "":
			msg += " (%s)" % message
		push_error(msg)
		# 抛出异常让上层捕获
		assert(false, msg)

func assert_almost_eq(actual: float, expected: float, tolerance: float, message: String = "") -> void:
	if abs(actual - expected) > tolerance:
		var msg: String = "断言失败: 期望约 %s，实际 %s (容差 %s)" % [str(expected), str(actual), str(tolerance)]
		if message != "":
			msg += " (%s)" % message
		push_error(msg)
		assert(false, msg)

func assert_true(condition: bool, message: String = "") -> void:
	if not condition:
		var msg: String = "断言失败: 期望为 true"
		if message != "":
			msg += " (%s)" % message
		push_error(msg)
		assert(false, msg)

func assert_false(condition: bool, message: String = "") -> void:
	if condition:
		var msg: String = "断言失败: 期望为 false"
		if message != "":
			msg += " (%s)" % message
		push_error(msg)
		assert(false, msg)
