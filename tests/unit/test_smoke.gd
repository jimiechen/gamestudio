# test_smoke.gd
extends "res://tests/test_base.gd"

func test_sanity_check() -> void:
	assert_eq(1 + 1, 2, "basic math should work")
