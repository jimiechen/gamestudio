extends GutTest

var hud: HUD

func before_each():
	hud = HUD.new()
	add_child_autofree(hud)

func after_each():
	hud = null

func test_initial_score_is_zero():
	assert_eq(hud.score, 0, "Initial score should be 0")

func test_initial_game_time_is_zero():
	assert_eq(hud.game_time, 0.0, "Initial game_time should be 0.0")

func test_initial_game_over_is_false():
	assert_false(hud.is_game_over, "is_game_over should be false initially")

func test_update_score_sets_score():
	hud.update_score(100)
	assert_eq(hud.score, 100, "Score should be set to 100")

func test_update_score_overwrites():
	hud.update_score(50)
	hud.update_score(30)
	assert_eq(hud.score, 30, "Score should overwrite to latest value")

func test_update_time_changes_time():
	hud.update_time(65.5)
	assert_almost_eq(hud.game_time, 65.5, 0.01, "game_time should update to 65.5")

func test_reset_clears_state():
	hud.update_score(999)
	hud.update_time(300.0)
	hud.is_game_over = true
	hud.reset()
	assert_eq(hud.score, 0, "Score should be 0 after reset")
	assert_almost_eq(hud.game_time, 0.0, 0.01, "game_time should be 0 after reset")
	assert_false(hud.is_game_over, "is_game_over should be false after reset")
