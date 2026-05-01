# HUD.gd
extends CanvasLayer

@onready var hp_bar: ProgressBar = $Root/HealthBar
@onready var xp_bar: ProgressBar = $Root/XPBar
@onready var level_label: Label = $Root/LevelLabel
@onready var time_label: Label = $Root/TimeLabel
@onready var panel: Panel = $Root/UpgradePanel
@onready var btn1: Button = $Root/UpgradePanel/Btn1
@onready var btn2: Button = $Root/UpgradePanel/Btn2
@onready var btn3: Button = $Root/UpgradePanel/Btn3

func _ready() -> void:
	GameManager.xp_changed.connect(_on_xp_changed)
	GameManager.level_up.connect(_on_level_up)
	GameManager.game_time_changed.connect(_on_time_changed)
	panel.visible = false

func bind_player(p: Node) -> void:
	if p.has_signal("health_changed"):
		p.health_changed.connect(_on_hp_changed)

func _on_hp_changed(cur: int, max_v: int) -> void:
	hp_bar.max_value = max_v
	hp_bar.value = cur

func _on_xp_changed(cur: int, to_next: int) -> void:
	apply_xp_view(cur, to_next)

func apply_xp_view(cur: int, max_v: int) -> void:
	xp_bar.max_value = max_v
	xp_bar.value = cur
	level_label.text = "Lv. %d" % GameManager.level

func _on_time_changed(t: float) -> void:
	time_label.text = "Time: %.1fs" % t

func _on_level_up(_lv: int) -> void:
	_show_upgrade_choices()

func _show_upgrade_choices() -> void:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.randomize()
	var picks: Array[Dictionary] = UpgradePool.pick_three(rng)
	var buttons: Array[Button] = [btn1, btn2, btn3]
	
	for i in range(3):
		var data: Dictionary = picks[i]
		var b: Button = buttons[i]
		b.text = data["text"]
		# 清理旧连接
		for c in b.pressed.get_connections():
			b.pressed.disconnect(c["callable"])
		b.pressed.connect(func(): _pick(data["id"]))
	
	panel.visible = true
	get_tree().paused = true
	process_mode = Node.PROCESS_MODE_ALWAYS

func _pick(id: String) -> void:
	GameManager.apply_upgrade(id)
	panel.visible = false
	get_tree().paused = false
