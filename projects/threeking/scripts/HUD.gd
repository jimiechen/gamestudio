extends CanvasLayer
class_name HUD

var score: int = 0
var game_time: float = 0.0
var is_game_over: bool = false

@onready var hp_bar: ProgressBar = $HPContainer/HPBar
@onready var score_label: Label = $InfoContainer/ScoreLabel
@onready var time_label: Label = $InfoContainer/TimeLabel

func _process(_delta):
	pass

func update_score(new_score: int):
	score = new_score
	_update_score_display()

func update_time(new_time: float):
	game_time = new_time
	_update_time_display()

func update_hp(current_hp: int, max_hp: int):
	if not is_instance_valid(hp_bar):
		return

	hp_bar.value = current_hp
	hp_bar.max_value = max_hp
	
	var ratio = float(current_hp) / float(max_hp)
	if ratio > 0.6:
		hp_bar.modulate = Color(0, 1, 0, 1)
	elif ratio > 0.3:
		hp_bar.modulate = Color(1, 1, 0, 1)
	else:
		hp_bar.modulate = Color(1, 0, 0, 1)

func show_game_over(final_score: int, survival_time: float):
	is_game_over = true

	if get_tree().current_scene.has_method("show_game_over_ui"):
		get_tree().current_scene.call("show_game_over_ui", final_score, survival_time)

func reset():
	score = 0
	game_time = 0.0
	is_game_over = false

	_update_score_display()
	_update_time_display()

func _update_score_display():
	if is_instance_valid(score_label):
		score_label.text = "SCORE: %d" % score

func _update_time_display():
	if is_instance_valid(time_label):
		var minutes = int(game_time) / 60
		var seconds = int(game_time) % 60
		time_label.text = "TIME: %02d:%02d" % [minutes, seconds]
