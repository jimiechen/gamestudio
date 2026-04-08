# Godot Sprite Sheet 集成与测试技术方案

## 一、方案概述

本方案提供了完整的游戏资源从生成到Godot引擎测试的端到端解决方案，支持快速验证动画效果。

## 二、技术架构

### 2.1 输出格式
- **Sprite Sheet**: PNG格式，带透明通道（RGBA）
- **元数据**: JSON格式，包含每帧位置、尺寸信息
- **Godot资源**: 自动生成`.tres`和`.tscn`文件

### 2.2 核心组件
1. **[frame_extractor.py](file:///workspace/game-asset-pipeline/frame_extractor.py#L98-L155)**: Sprite Sheet生成器
2. **[godot_exporter.py](file:///workspace/game-asset-pipeline/godot_exporter.py)**: Godot资源导出器
3. **[game_asset_pipeline.py](file:///workspace/game-asset-pipeline/game_asset_pipeline.py)**: 主流水线（集成Godot导出）

## 三、Godot资源结构

### 3.1 生成的文件
```
godot/
├── {character}_{action}_spritesheet.png    # Sprite Sheet图片
├── sprite_frames.tres                       # SpriteFrames资源
├── animated_sprite.tscn                     # AnimatedSprite2D场景
├── test_scene.tscn                          # 完整测试场景
└── metadata.json                             # 元数据
```

### 3.2 SpriteFrames资源
- 类型：`SpriteFrames`
- 使用`AtlasTexture`定义每帧区域
- 支持动画速度和循环设置

### 3.3 测试场景特性
- 预配置的`AnimatedSprite2D`节点
- 播放/暂停/停止控制按钮
- FPS调节滑块（1-30 FPS）
- 位置和缩放控制说明

## 四、使用流程

### 4.1 生成资源并导出到Godot

```bash
# 使用--export-to-godot选项
python game_asset_pipeline.py \
  -c 关羽 \
  -a "挥刀斩击" \
  -v ./reference_video.mp4 \
  --export-to-godot
```

### 4.2 在Godot中测试

1. **创建新项目**
   - 打开Godot引擎
   - 创建新项目（2D模板）
   - 保存项目

2. **导入资源**
   - 将`godot/`目录下的所有文件复制到项目根目录
   - 等待Godot自动导入资源

3. **打开测试场景**
   - 在文件系统中双击`test_scene.tscn`
   - 点击"运行当前场景"（F6）

4. **测试动画**
   - 使用控制面板播放/暂停动画
   - 调节FPS滑块查看不同速度效果
   - 使用方向键移动，滚轮缩放

## 五、手动集成指南（可选）

### 5.1 手动导入Sprite Sheet

1. 将Sprite Sheet图片拖入Godot项目
2. 创建`SpriteFrames`资源
3. 添加动画，设置FPS
4. 逐帧添加图片，使用`Region`模式
5. 设置每帧的区域坐标

### 5.2 使用AnimatedSprite2D

```gdscript
extends Node2D

@onready var animated_sprite = $AnimatedSprite2D

func _ready():
    animated_sprite.play("default")
    animated_sprite.speed_scale = 1.0

func _process(delta):
    if Input.is_action_just_pressed("ui_accept"):
        if animated_sprite.is_playing():
            animated_sprite.pause()
        else:
            animated_sprite.play()
```

## 六、技术可行性评估

### 6.1 优点

✅ **完全自动化**: 一键生成所有必要的Godot资源
✅ **零配置**: 测试场景已预配置，开箱即用
✅ **高度兼容**: 支持Godot 4.x标准格式
✅ **灵活可调**: 支持FPS调节和播放控制
✅ **可扩展性**: 易于添加更多动画和控制功能

### 6.2 技术要点

1. **坐标系统**
   - Godot使用左上原点坐标系
   - 与OpenCV生成的坐标兼容
   - 自动处理padding和间距

2. **透明通道**
   - 支持PNG透明背景
   - 绿幕抠图已在生成阶段完成
   - 无需在Godot中额外处理

3. **性能优化**
   - Sprite Sheet减少绘制调用
   - AtlasTexture高效内存管理
   - 支持预加载和缓存

### 6.3 局限性与解决方案

| 局限性 | 解决方案 |
|--------|----------|
| 测试场景UI较简单 | 可根据需要扩展控制面板 |
| 单动画支持 | 可扩展为多动画管理 |
| 无碰撞检测 | 可添加CollisionShape2D |

## 七、最佳实践

1. **资源组织**
   - 按角色和动作分类存储
   - 使用清晰的命名规范
   - 保留原始元数据

2. **动画调优**
   - 从10-15 FPS开始测试
   - 根据动作复杂度调整
   - 循环动画确保首尾帧衔接

3. **性能监控**
   - 关注FPS和内存使用
   - 大Sprite Sheet考虑分割
   - 使用Godot Profiler分析

## 八、快速测试示例

### 8.1 使用OpenClaw Skill

```yaml
# 在OpenClaw中调用
skill: game-asset-generator-openclaw
inputs:
  character: 关羽
  action: 挥刀斩击
  reference_video: /path/to/video.mp4
  export_to_godot: true
```

### 8.2 独立使用导出器

```bash
# 直接使用Godot导出器
python godot_exporter.py \
  ./output/关羽_挥刀斩击_20240101_000000/关羽_挥刀斩击_spritesheet.json
```

## 九、总结

本技术方案提供了从资源生成到Godot测试的完整工作流，具有高度自动化、易于使用和良好扩展性的特点。通过一键导出功能，团队可以快速验证动画效果，显著提升游戏资源开发效率。
