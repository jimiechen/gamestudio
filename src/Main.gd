# Main.gd
extends Node2D

@onready var hud: CanvasLayer = $HUD
@onready var player: Node = $Player
@onready var game_over_label: Label = $GameOverLabel

func _ready() -> void:
	randomize()
	game_over_label.visible = false
	hud.bind_player(player)
	player.died.connect(_on_player_died)
	GameManager.start_run()

func _on_player_died() -> void:
	game_over_label.visible = true

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_R:
		get_tree().paused = false
		get_tree().reload_current_scene()
