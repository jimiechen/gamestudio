extends Node2D
class_name HitEffect

@export var particle_count: int = 8
@export var spread: float = 100.0
@export var lifetime: float = 0.4

static var _particle_points: PackedVector2Array = _create_particle_points()

func _ready():
    _spawn_particles()

    get_tree().create_timer(lifetime).timeout.connect(queue_free)

static func _create_particle_points() -> PackedVector2Array:
    var points = PackedVector2Array()
    for i in range(3):
        points.append(Vector2(-3 + i * 3, -3))
        points.append(Vector2(-3 + i * 3, 3))
    return points

func _spawn_particles():
    for i in range(particle_count):
        var particle = Polygon2D.new()
        particle.name = "Particle%d" % i
        particle.polygon = _particle_points
        particle.color = Color.ORANGE_RED

        var angle = (float(i) / particle_count) * TAU
        var distance = randf_range(spread * 0.5, spread)
        var target_pos = Vector2(cos(angle), sin(angle)) * distance

        add_child(particle)

        var tween = create_tween()
        tween.set_parallel(true)
        tween.tween_property(particle, "position", target_pos, lifetime)
        tween.tween_property(particle, "modulate:a", 0.0, lifetime)
        tween.chain().tween_callback(particle.queue_free)
