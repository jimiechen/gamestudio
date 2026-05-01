# Spawner.gd
extends Node

@export var enemy_scene: PackedScene
@export var spawn_interval: float = 1.2
@export var spawn_radius: float = 520.0

var _t: float = 0.0
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()

func _process(delta: float) -> void:
	if not GameManager.is_running:
		return
	_t += delta
	var cur_interval: float = MathUtils.calc_interval(spawn_interval, GameManager.game_time)
	if _t >= cur_interval:
		_t = 0.0
		_spawn_one()

func _spawn_one() -> void:
	var player_arr := get_tree().get_nodes_in_group(&"player")
	if player_arr.is_empty() or enemy_scene == null:
		return
	var player: Node2D = player_arr[0]
	var pos: Vector2 = MathUtils.calc_spawn_position(player.global_position, spawn_radius, _rng)
	var e := enemy_scene.instantiate()
	e.global_position = pos
	# 随时间加血
	var t: float = GameManager.game_time
	e.max_health = 3 + int(t / 15.0)
	e.current_health = e.max_health
	get_tree().current_scene.add_child(e)
