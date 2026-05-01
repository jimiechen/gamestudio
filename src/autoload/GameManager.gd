# GameManager.gd
# 全局单例 - 整局游戏状态中心
extends Node

signal xp_changed(current_xp: int, xp_to_next: int)
signal level_up(new_level: int)
signal player_died
signal game_time_changed(seconds: float)

var level: int = 1
var xp: int = 0
var xp_to_next: int = 5

var game_time: float = 0.0
var is_running: bool = false

var bonus_damage: int = 0
var bonus_multishot: int = 0
var bonus_pierce: int = 0
var attack_rate_mult: float = 1.0
var move_speed_mult: float = 1.0
var bullet_speed_mult: float = 1.0

func start_run() -> void:
	level = 1
	xp = 0
	xp_to_next = 5
	game_time = 0.0
	bonus_damage = 0
	bonus_multishot = 0
	bonus_pierce = 0
	attack_rate_mult = 1.0
	move_speed_mult = 1.0
	bullet_speed_mult = 1.0
	is_running = true
	xp_changed.emit(xp, xp_to_next)

func _process(delta: float) -> void:
	if is_running:
		game_time += delta
		game_time_changed.emit(game_time)

func add_xp(amount: int) -> void:
	xp += amount
	while xp >= xp_to_next:
		xp -= xp_to_next
		level += 1
		xp_to_next = int(xp_to_next * 1.35) + 2
		level_up.emit(level)
	xp_changed.emit(xp, xp_to_next)

func apply_upgrade(id: String) -> void:
	match id:
		"damage":
			bonus_damage += 1
		"multishot":
			bonus_multishot = min(bonus_multishot + 1, 5)
		"attack_speed":
			attack_rate_mult = min(attack_rate_mult * 1.15, 3.0)
		"move_speed":
			move_speed_mult *= 1.10
		"pierce":
			bonus_pierce = min(bonus_pierce + 1, 3)
		"bullet_speed":
			bullet_speed_mult = min(bullet_speed_mult * 1.20, 3.0)

func player_has_died() -> void:
	is_running = false
	player_died.emit()
