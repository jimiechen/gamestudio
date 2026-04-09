extends Node2D

var player: Player
var score: int = 0
var game_time: float = 0.0
var is_game_over: bool = false

@export var max_enemies: int = 50
@export var spawn_interval: float = 1.5

@onready var camera: Camera2D = $Camera2D
@onready var spawn_timer: Timer = $SpawnTimer
@onready var hud: HUD = $HUD
@onready var game_over_ui: GameOverUI = $GameOverUI

const EnemyScene = preload("res://scenes/Enemy.tscn")

func _ready():
	_spawn_player()
	_setup_spawn_timer()
	_connect_ui_signals()

func _unhandled_input(event):
	if event.is_action_pressed("restart"):
		restart()

func _process(delta):
	if is_game_over:
		return

	game_time += delta

	if is_instance_valid(player):
		if is_instance_valid(hud):
			hud.update_hp(player.current_hp, player.max_hp)
			hud.update_time(game_time)

func _connect_ui_signals():
	if game_over_ui:
		game_over_ui.restart_requested.connect(_on_restart_requested)

func _setup_spawn_timer():
	spawn_timer.wait_time = spawn_interval
	spawn_timer.timeout.connect(_on_spawn_timeout)
	spawn_timer.start()

func _spawn_player():
	var player_scene = preload("res://scenes/Player.tscn")
	player = player_scene.instantiate()
	player.position = get_viewport_rect().size / 2
	add_child(player)

func _on_spawn_timeout():
	if is_game_over:
		return

	var current_enemy_count = get_tree().get_nodes_in_group("enemies").size()
	if current_enemy_count >= max_enemies:
		return

	_spawn_enemy()

func _spawn_enemy():
	var enemy = EnemyScene.instantiate()
	enemy.global_position = _get_random_spawn_position()
	add_child(enemy)

func _get_random_spawn_position() -> Vector2:
	var viewport_size = get_viewport_rect().size
	var margin = 50.0

	var side = randi() % 4
	var spawn_pos: Vector2

	match side:
		0:
			spawn_pos = Vector2(randf_range(0, viewport_size.x), -margin)
		1:
			spawn_pos = Vector2(viewport_size.x + margin, randf_range(0, viewport_size.y))
		2:
			spawn_pos = Vector2(randf_range(0, viewport_size.x), viewport_size.y + margin)
		3:
			spawn_pos = Vector2(-margin, randf_range(0, viewport_size.y))
		_:
			spawn_pos = Vector2.ZERO

	return spawn_pos

func add_score(amount: int):
	if is_game_over:
		return

	score += amount
	if hud:
		hud.update_score(score)

func show_game_over_ui(final_score: int, survival_time: float):
	if game_over_ui:
		game_over_ui.show_game_over(final_score, survival_time)

func game_over():
	if is_game_over:
		return

	is_game_over = true
	spawn_timer.stop()

	for enemy in get_tree().get_nodes_in_group("enemies"):
		enemy.queue_free()

	for bullet in get_tree().get_nodes_in_group("bullets"):
		bullet.queue_free()

	show_game_over_ui(score, game_time)

func restart():
	score = 0
	game_time = 0.0
	is_game_over = false

	if hud:
		hud.reset()

	for node in get_children():
		if node != camera and node != spawn_timer and node != hud and node != game_over_ui:
			node.queue_free()

	_spawn_player()
	spawn_timer.start()

func _on_restart_requested():
	restart()
