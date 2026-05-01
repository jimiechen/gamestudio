# test_base.gd
# 测试基类 - 提供断言方法，支持单元测试和集成测试
extends Node

var _errors: Array[String] = []

func assert_eq(actual, expected, message: String = "") -> bool:
	if actual != expected:
		var msg: String = "期望 %s，实际 %s" % [str(expected), str(actual)]
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_almost_eq(actual: float, expected: float, tolerance: float, message: String = "") -> bool:
	if abs(actual - expected) > tolerance:
		var msg: String = "期望约 %s，实际 %s (容差 %s)" % [str(expected), str(actual), str(tolerance)]
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_true(condition: bool, message: String = "") -> bool:
	if not condition:
		var msg: String = "期望为 true"
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_false(condition: bool, message: String = "") -> bool:
	if condition:
		var msg: String = "期望为 false"
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_lt(actual: float, expected: float, message: String = "") -> bool:
	if actual >= expected:
		var msg: String = "期望 %s < %s" % [str(actual), str(expected)]
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_lte(actual: float, expected: float, message: String = "") -> bool:
	if actual > expected:
		var msg: String = "期望 %s <= %s" % [str(actual), str(expected)]
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_gt(actual: float, expected: float, message: String = "") -> bool:
	if actual <= expected:
		var msg: String = "期望 %s > %s" % [str(actual), str(expected)]
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_gte(actual: float, expected: float, message: String = "") -> bool:
	if actual < expected:
		var msg: String = "期望 %s >= %s" % [str(actual), str(expected)]
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func assert_between(actual: float, min_v: float, max_v: float, message: String = "") -> bool:
	if actual < min_v or actual > max_v:
		var msg: String = "期望 %s 在 [%s, %s] 之间" % [str(actual), str(min_v), str(max_v)]
		if message != "":
			msg = "%s | %s" % [message, msg]
		_errors.append(msg)
		return false
	return true

func has_errors() -> bool:
	return _errors.size() > 0

func get_errors() -> Array[String]:
	return _errors

func clear_errors() -> void:
	_errors.clear()
