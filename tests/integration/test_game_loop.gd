# test_game_loop.gd
extends "res://tests/test_base.gd"

# Task 20: 端到端冒烟测试
func test_main_scene_smoke() -> void:
	var main_scene: PackedScene = load("res://scenes/Main.tscn")
	assert_true(main_scene != null, "Main.tscn should be loadable")

	var main = main_scene.instantiate()
	assert_true(main.has_node("Player"), "Main should have Player")
	assert_true(main.has_node("HUD"), "Main should have HUD")
	assert_true(main.has_node("Spawner"), "Main should have Spawner")
	assert_true(main.has_node("GameOverLabel"), "Main should have GameOverLabel")
	main.free()

func test_player_scene_structure() -> void:
	var player_scene: PackedScene = load("res://scenes/Player.tscn")
	assert_true(player_scene != null, "Player.tscn should be loadable")

	var player = player_scene.instantiate()
	assert_true(player.has_node("Visual"), "Player should have Visual")
	assert_true(player.has_node("Collision"), "Player should have Collision")
	assert_true(player.has_node("AttackTimer"), "Player should have AttackTimer")
	assert_true(player.has_node("HurtCooldown"), "Player should have HurtCooldown")
	player.free()

func test_enemy_scene_structure() -> void:
	var enemy_scene: PackedScene = load("res://scenes/Enemy.tscn")
	assert_true(enemy_scene != null, "Enemy.tscn should be loadable")

	var enemy = enemy_scene.instantiate()
	assert_true(enemy.has_node("Visual"), "Enemy should have Visual")
	assert_true(enemy.has_node("Collision"), "Enemy should have Collision")
	enemy.free()

func test_bullet_scene_structure() -> void:
	var bullet_scene: PackedScene = load("res://scenes/Bullet.tscn")
	assert_true(bullet_scene != null, "Bullet.tscn should be loadable")

	var bullet = bullet_scene.instantiate()
	assert_true(bullet.has_node("Visual"), "Bullet should have Visual")
	assert_true(bullet.has_node("Collision"), "Bullet should have Collision")
	assert_true(bullet.has_node("LifeTimer"), "Bullet should have LifeTimer")
	bullet.free()
