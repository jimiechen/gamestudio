# test_bullet_lifetime.gd
# I7: 子弹生命周期
extends "res://tests/test_base.gd"

func test_bullet_self_destructs_after_lifetime() -> void:
	var bullet_scene: PackedScene = load("res://scenes/Bullet.tscn")
	var bullet = bullet_scene.instantiate()
	add_child(bullet)
	bullet.setup(Vector2.RIGHT, 1)

	# LifeTimer 是 1.5 秒，等 2 秒确保超时
	await get_tree().create_timer(2.0).timeout

	assert_false(is_instance_valid(bullet), "bullet should be freed after lifetime expires")
