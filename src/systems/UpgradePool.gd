# UpgradePool.gd
class_name UpgradePool

const UPGRADES: Array[Dictionary] = [
	{"id": "damage",       "text": "伤害 +1"},
	{"id": "multishot",    "text": "弹幕 +1"},
	{"id": "attack_speed", "text": "攻速 +15%"},
	{"id": "move_speed",   "text": "移速 +10%"},
	{"id": "pierce",       "text": "穿透 +1"},
	{"id": "bullet_speed", "text": "弹速 +20%"},
]

static func pick_three(rng: RandomNumberGenerator) -> Array[Dictionary]:
	var pool: Array[Dictionary] = []
	for u in UPGRADES:
		pool.append(u)
	pool.shuffle()
	
	var result: Array[Dictionary] = []
	if pool.size() < 3:
		for i in range(3):
			result.append(pool[i % pool.size()])
		return result
	
	for i in range(min(3, pool.size())):
		result.append(pool[i])
	return result
