extends CanvasLayer
class_name GameOverUI

signal restart_requested

@onready var panel: Panel = $ColorRect/Panel
@onready var title_label: Label = $ColorRect/Panel/VBoxContainer/TitleLabel
@onready var score_label: Label = $ColorRect/Panel/VBoxContainer/ScoreLabel
@onready var time_label: Label = $ColorRect/Panel/VBoxContainer/TimeLabel
@onready var restart_button: Button = $ColorRect/Panel/VBoxContainer/RestartButton
@onready var color_rect: ColorRect = $ColorRect

func _ready():
    visible = false
    restart_button.pressed.connect(_on_restart_pressed)

func show_game_over(final_score: int, survival_time: float):
    visible = true
    
    score_label.text = "SCORE: %d" % final_score
    
    var minutes = int(survival_time) / 60
    var seconds = int(survival_time) % 60
    time_label.text = "SURVIVAL TIME: %02d:%02d" % [minutes, seconds]
    
    color_rect.modulate.a = 0.0
    panel.modulate.a = 0.0
    
    var tween = create_tween()
    tween.tween_property(color_rect, "modulate:a", 0.7, 0.5)
    tween.tween_property(panel, "modulate:a", 1.0, 0.3)

func hide_game_over():
    visible = false

func _on_restart_pressed():
    hide_game_over()
    restart_requested.emit()
