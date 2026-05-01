# Bullet.gd
extends Area2D

var direction: Vector2 = Vector2.RIGHT
var speed: float = 520.0
var damage: int = 1
var pierce: int = 0
var hit_count: int = 0

@onready var life_timer: Timer = $LifeTimer

func _ready() -> void:
	add_to_group(&"bullet")
	monitoring = true
	monitorable = true
	life_timer.timeout.connect(queue_free)
	body_entered.connect(_on_body_entered)
	# 升级面板暂停时子弹也暂停
	process_mode = Node.PROCESS_MODE_PAUSABLE

func setup(dir: Vector2, dmg: int, pierce_count: int = 0, speed_mult: float = 1.0) -> void:
	direction = dir.normalized()
	damage = dmg
	pierce = pierce_count
	speed = 520.0 * speed_mult
	rotation = direction.angle()

func _process(delta: float) -> void:
	position += direction * speed * delta

func _on_body_entered(body: Node) -> void:
	_try_hit(body)

func _try_hit(body: Node) -> bool:
	if body.is_in_group(&"enemy") and body.has_method("take_damage"):
		body.take_damage(damage)
		hit_count += 1
		if hit_count > pierce:
			queue_free()
		return true
	return false
