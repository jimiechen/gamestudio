#!/usr/bin/env python3
import json
import shutil
from pathlib import Path
from typing import Dict, Any

class GodotExporter:
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.godot_dir = self.output_dir / "godot"
    
    def export_to_godot(self, metadata_path: str) -> Dict[str, Any]:
        """
        导出为Godot可用的资源包
        """
        metadata_path = Path(metadata_path)
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        sprite_sheet_path = Path(metadata["sprite_sheet"])
        
        self.godot_dir.mkdir(parents=True, exist_ok=True)
        
        shutil.copy(sprite_sheet_path, self.godot_dir / sprite_sheet_path.name)
        
        godot_metadata = self._convert_to_godot_format(metadata, sprite_sheet_path.name)
        
        with open(self.godot_dir / "sprite_frames.tres", 'w', encoding='utf-8') as f:
            f.write(self._generate_sprite_frames_resource(godot_metadata))
        
        with open(self.godot_dir / "animated_sprite.tscn", 'w', encoding='utf-8') as f:
            f.write(self._generate_animated_sprite_scene(sprite_sheet_path.name))
        
        with open(self.godot_dir / "test_scene.tscn", 'w', encoding='utf-8') as f:
            f.write(self._generate_test_scene())
        
        with open(self.godot_dir / "metadata.json", 'w', encoding='utf-8') as f:
            json.dump(godot_metadata, f, indent=2, ensure_ascii=False)
        
        return {
            "godot_dir": str(self.godot_dir),
            "sprite_sheet": sprite_sheet_path.name,
            "total_frames": metadata["total_frames"]
        }
    
    def _convert_to_godot_format(self, metadata: Dict, sprite_filename: str) -> Dict:
        """
        转换为Godot SpriteFrames格式
        """
        return {
            "frames": metadata["frames"],
            "frame_size": metadata["frame_size"],
            "total_frames": metadata["total_frames"],
            "sprite_sheet": sprite_filename,
            "animation_name": "default",
            "fps": 10
        }
    
    def _generate_sprite_frames_resource(self, metadata: Dict) -> str:
        """
        生成Godot SpriteFrames资源文件
        """
        content = f"""[gd_resource type="SpriteFrames" load_steps=2 format=3 uid="uid://b{abs(hash(metadata['sprite_sheet'])) % 1000000000}"]

[ext_resource type="Texture2D" uid="uid://t{abs(hash(metadata['sprite_sheet'] + '_tex')) % 1000000000}" path="res://{metadata['sprite_sheet']}" id="1_{abs(hash(metadata['sprite_sheet'])) % 10000}"]

[sub_resource type="AtlasTexture" id="AtlasTexture_1"]
atlas = ExtResource("1_{abs(hash(metadata['sprite_sheet'])) % 10000}")
"""
        
        for i, frame in enumerate(metadata["frames"]):
            content += f"""
region = Rect2({frame['x']}, {frame['y']}, {frame['w']}, {frame['h']})

[sub_resource type="AtlasTexture" id="AtlasTexture_{i + 2}"]
atlas = ExtResource("1_{abs(hash(metadata['sprite_sheet'])) % 10000}")
"""
        
        content += f"""
[resource]
animations/names = Array["{metadata['animation_name']}"]
animations/speeds = Array[{metadata['fps']}.0]
animations/loop = Array[true]
"""
        
        frames_list = ", ".join([f"SubResource(\"AtlasTexture_{i + 1}\")" for i in range(metadata["total_frames"])])
        content += f'animations/frames = Array[Array]([{frames_list}])\n'
        
        return content
    
    def _generate_animated_sprite_scene(self, sprite_filename: str) -> str:
        """
        生成Godot AnimatedSprite2D场景文件
        """
        return f"""[gd_scene load_steps=2 format=3 uid="uid://n{abs(hash(sprite_filename + '_scene')) % 1000000000}"]

[ext_resource type="SpriteFrames" uid="uid://s{abs(hash(sprite_filename + '_frames')) % 1000000000}" path="res://sprite_frames.tres" id="1_{abs(hash(sprite_filename)) % 10000}"]

[node name="AnimatedSprite2D" type="AnimatedSprite2D"]
sprite_frames = ExtResource("1_{abs(hash(sprite_filename)) % 10000}")
animation = &"default"
centered = true
"""
    
    def _generate_test_scene(self) -> str:
        """
        生成完整的测试场景，包含播放控制
        """
        return """[gd_scene load_steps=2 format=3 uid="uid://t123456789"]

[ext_resource type="PackedScene" uid="uid://n987654321" path="res://animated_sprite.tscn" id="1_sprite"]

[node name="TestScene" type="Node2D"]

[node name="AnimatedSprite2D" parent="." instance=ExtResource("1_sprite")]
position = Vector2(400, 300)
scale = Vector2(2, 2)

[node name="ControlPanel" type="Control" parent="."]
anchors_preset = 15
anchor_right = 1.0
anchor_bottom = 1.0
grow_horizontal = 2
grow_vertical = 2

[node name="VBoxContainer" type="VBoxContainer" parent="ControlPanel"]
anchors_preset = 2
anchor_right = 1.0
anchor_bottom = 1.0
offset_left = 10.0
offset_top = 10.0
offset_right = -10.0
offset_bottom = -10.0
grow_horizontal = 2
grow_vertical = 2

[node name="HBoxContainer" type="HBoxContainer" parent="ControlPanel/VBoxContainer"]

[node name="PlayButton" type="Button" parent="ControlPanel/VBoxContainer/HBoxContainer"]
text = "▶ 播放"

[node name="PauseButton" type="Button" parent="ControlPanel/VBoxContainer/HBoxContainer"]
text = "⏸ 暂停"

[node name="StopButton" type="Button" parent="ControlPanel/VBoxContainer/HBoxContainer"]
text = "⏹ 停止"

[node name="FPSLabel" type="Label" parent="ControlPanel/VBoxContainer"]
text = "播放速度: 10 FPS"

[node name="FPSlider" type="HSlider" parent="ControlPanel/VBoxContainer"]
min_value = 1.0
max_value = 30.0
value = 10.0
tick_count = 30
ticks_on_borders = true

[node name="InfoLabel" type="Label" parent="ControlPanel/VBoxContainer"]
text = "使用方向键移动，滚轮缩放"
"""

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python godot_exporter.py <metadata.json路径>")
        sys.exit(1)
    
    metadata_path = sys.argv[1]
    output_dir = Path(metadata_path).parent.parent
    
    exporter = GodotExporter(str(output_dir))
    result = exporter.export_to_godot(metadata_path)
    
    print(f"✅ Godot资源已导出到: {result['godot_dir']}")
    print(f"📊 共 {result['total_frames']} 帧")
    print("\n使用方法:")
    print("1. 在Godot中创建新项目")
    print("2. 将godot目录下的所有文件复制到项目根目录")
    print("3. 打开test_scene.tscn开始测试")
