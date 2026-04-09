extends Area2D
class_name Bullet

@export var speed: float = 400.0
@export var damage: int = 10
@export var lifetime: float = 2.0

var direction: Vector2 = Vector2.RIGHT
static var _bullet_visual_points: PackedVector2Array = _create_bullet_points()

func _ready():
	add_to_group("bullets")
	_create_visual()

	get_tree().create_timer(lifetime).timeout.connect(_on_lifetime_timeout)

func _physics_process(delta):
	position += direction * speed * delta
	
	_check_boundary()

func _check_boundary():
	var viewport_size = get_viewport_rect().size
	var margin = 100.0  # 屏幕外100像素销毁
	
	if position.x < -margin or position.x > viewport_size.x + margin or position.y < -margin or position.y > viewport_size.y + margin:
		queue_free()

func _on_body_entered(body):
	_try_damage_target(body)

func _on_area_entered(area):
	var parent = area.get_parent()
	if parent:
		_try_damage_target(parent)

func _on_lifetime_timeout():
	queue_free()

static func _create_bullet_points() -> PackedVector2Array:
	var points = PackedVector2Array()
	var segments = 8
	var radius = 6.0

	for i in range(segments + 1):
		var angle = (float(i) / segments) * TAU
		points.append(Vector2(cos(angle), sin(angle)) * radius)

	return points

func _create_visual():
	var polygon = Polygon2D.new()
	polygon.name = "Visual"
	polygon.polygon = _bullet_visual_points
	polygon.color = Color.CYAN
	add_child(polygon)

func _try_damage_target(target: Node):
	if not target.is_in_group("enemies"):
		return

	if target.has_method("take_damage"):
		target.take_damage(damage)
	queue_free()
