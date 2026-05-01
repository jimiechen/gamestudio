# test_spawner.gd
# I11~I12: Spawner 集成
extends "res://tests/test_base.gd"

# I11: Spawner 在运行状态下生成敌人
func test_spawner_creates_enemy_after_interval() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)

	GameManager.start_run()
	await get_tree().create_timer(1.5).timeout

	var enemies := get_tree().get_nodes_in_group(&"enemy")
	assert_true(enemies.size() >= 1, "spawner should create at least 1 enemy after 1.5s (got %d)" % enemies.size())

	main.queue_free()

# I12: Spawner 在非运行状态下不生成
func test_spawner_does_not_spawn_when_not_running() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	var main = main_scene.instantiate()
	add_child(main)

	GameManager.is_running = false
	await get_tree().create_timer(2.0).timeout

	var enemies := get_tree().get_nodes_in_group(&"enemy")
	assert_eq(enemies.size(), 0, "spawner should not create enemies when not running")

	main.queue_free()
