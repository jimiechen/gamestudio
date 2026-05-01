# test_hud.gd
# UI1~UI8: HUD 响应测试
extends "res://tests/test_base.gd"

# UI1: HUD 血条反映玩家伤害（已在 test_hud_reflects_damage.gd）
# 这里补充 UI2~UI8

# UI2: HUD 初始血条正确
func test_hp_bar_initialized_on_ready() -> void:
	var hud_scene: PackedScene = load("res://scenes/HUD.tscn")
	var hud = hud_scene.instantiate()
	add_child(hud)

	await get_tree().process_frame

	var hp_bar: ProgressBar = hud.get_node("Root/HealthBar")
	assert_eq(hp_bar.value, 10.0, "hp bar should initialize to 10")
	assert_eq(hp_bar.max_value, 10.0, "hp bar max should initialize to 10")

	hud.queue_free()

# UI3: XP 条响应信号
func test_xp_bar_reflects_signal() -> void:
	var hud_scene: PackedScene = load("res://scenes/HUD.tscn")
	var hud = hud_scene.instantiate()
	add_child(hud)

	await get_tree().process_frame

	GameManager.emit_signal("xp_changed", 3, 10)
	await get_tree().process_frame

	var xp_bar: ProgressBar = hud.get_node("Root/XPBar")
	assert_eq(xp_bar.value, 3.0, "xp bar should reflect signal value")
	assert_eq(xp_bar.max_value, 10.0, "xp bar max should reflect signal max")

	hud.queue_free()

# UI4: 等级标签更新
func test_level_label_updates() -> void:
	var hud_scene: PackedScene = load("res://scenes/HUD.tscn")
	var hud = hud_scene.instantiate()
	add_child(hud)

	await get_tree().process_frame

	GameManager.level = 3
	GameManager.emit_signal("xp_changed", 0, 10)
	await get_tree().process_frame

	var level_label: Label = hud.get_node("Root/LevelLabel")
	assert_eq(level_label.text, "Lv. 3", "level label should show current level")

	hud.queue_free()

# UI5: 时间标签格式
func test_time_label_formats() -> void:
	var hud_scene: PackedScene = load("res://scenes/HUD.tscn")
	var hud = hud_scene.instantiate()
	add_child(hud)

	await get_tree().process_frame

	# 断开 GameManager 信号，避免 _process 覆盖我们设置的值
	GameManager.game_time_changed.disconnect(hud._on_time_changed)
	
	# 直接调用 HUD 的时间更新方法
	hud._on_time_changed(12.34)
	await get_tree().process_frame

	var time_label: Label = hud.get_node("Root/TimeLabel")
	assert_eq(time_label.text, "Time: 12.3s", "time label should format to 1 decimal")
	
	# 恢复连接（避免影响其他测试）
	GameManager.game_time_changed.connect(hud._on_time_changed)

	hud.queue_free()

# UI6: 升级面板默认隐藏
func test_upgrade_panel_hidden_by_default() -> void:
	var hud_scene: PackedScene = load("res://scenes/HUD.tscn")
	var hud = hud_scene.instantiate()
	add_child(hud)

	await get_tree().process_frame

	var panel: Panel = hud.get_node("Root/UpgradePanel")
	assert_true(not panel.visible, "upgrade panel should be hidden by default")

	hud.queue_free()

# UI7: 升级时面板显示并暂停
func test_upgrade_panel_shows_on_level_up_and_pauses() -> void:
	var hud_scene: PackedScene = load("res://scenes/HUD.tscn")
	var hud = hud_scene.instantiate()
	add_child(hud)

	await get_tree().process_frame

	# 确保游戏未暂停
	get_tree().paused = false

	GameManager.emit_signal("level_up", 2)
	await get_tree().process_frame

	var panel: Panel = hud.get_node("Root/UpgradePanel")
	assert_true(panel.visible, "upgrade panel should be visible after level up")
	assert_true(get_tree().paused, "game should be paused during upgrade")

	# 恢复
	get_tree().paused = false
	hud.queue_free()

# UI8: 选择升级后恢复游戏
func test_upgrade_pick_applies_and_unpauses() -> void:
	var hud_scene: PackedScene = load("res://scenes/HUD.tscn")
	var hud = hud_scene.instantiate()
	add_child(hud)

	await get_tree().process_frame

	# 触发升级面板
	GameManager.emit_signal("level_up", 2)
	await get_tree().process_frame

	var panel: Panel = hud.get_node("Root/UpgradePanel")
	var btn1: Button = panel.get_node("Btn1")

	# 记录升级前的伤害
	var before_damage: int = GameManager.bonus_damage

	# 模拟点击第一个按钮
	btn1.pressed.emit()
	await get_tree().process_frame

	assert_true(not panel.visible, "panel should hide after pick")
	assert_true(not get_tree().paused, "game should unpause after pick")
	var any_applied: bool = (
		GameManager.bonus_damage > before_damage
		or GameManager.attack_rate_mult > 1.0
		or GameManager.move_speed_mult > 1.0
		or GameManager.bonus_multishot > 0
		or GameManager.bonus_pierce > 0
		or GameManager.bullet_speed_mult > 1.0
	)
	assert_true(any_applied, "some upgrade should be applied")

	hud.queue_free()
