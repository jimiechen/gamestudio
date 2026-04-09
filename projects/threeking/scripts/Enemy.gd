extends CharacterBody2D
class_name Enemy

@export var speed: float = 120.0
@export var max_hp: int = 30
@export var damage: int = 10
@export var score_value: int = 10

var current_hp: int
var player: Node2D

const HitEffectScript = preload("res://scripts/HitEffect.gd")

@onready var sprite: Sprite2D = $Sprite2D

func _ready():
    current_hp = max_hp
    add_to_group("enemies")

    call_deferred("_find_player")

func _find_player():
    player = get_tree().get_first_node_in_group("player")

func _physics_process(delta):
    if not player or not is_instance_valid(player):
        _find_player()
        return

    _chase_player(delta)
    move_and_slide()

    _check_player_collision()

func _chase_player(_delta):
    var direction = (player.global_position - global_position).normalized()
    velocity = direction * speed

    if direction.x < 0:
        sprite.flip_h = true
    else:
        sprite.flip_h = false

func _check_player_collision():
    for i in range(get_slide_collision_count()):
        var collision = get_slide_collision(i)
        var collider = collision.get_collider()

        if collider.is_in_group("player"):
            if collider.has_method("take_damage"):
                collider.take_damage(damage)
            die()
            break

func take_damage(amount: int):
    current_hp -= amount

    sprite.modulate = Color.WHITE
    await get_tree().create_timer(0.05).timeout
    sprite.modulate = Color(1, 0.5, 0.5)

    if current_hp <= 0:
        die()

func die():
    if get_tree() and get_tree().current_scene.has_method("add_score"):
        get_tree().current_scene.call("add_score", score_value)

    _spawn_death_effect()
    queue_free()

func _spawn_death_effect():
    var effect = Node2D.new()
    effect.name = "DeathEffect"
    effect.global_position = global_position
    get_tree().current_scene.add_child(effect)

    effect.set_script(HitEffectScript)

func _on_visible_on_screen_exited():
    if is_inside_tree():
        queue_free()
