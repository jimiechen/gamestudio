import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import json
import tempfile
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from godot_exporter import GodotExporter

class TestGodotExporter(unittest.TestCase):
    
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.output_dir = Path(self.temp_dir.name)
        
        self.test_metadata = {
            "frames": [
                {"index": 0, "x": 2, "y": 2, "w": 100, "h": 200},
                {"index": 1, "x": 104, "y": 2, "w": 100, "h": 200},
                {"index": 2, "x": 206, "y": 2, "w": 100, "h": 200},
                {"index": 3, "x": 308, "y": 2, "w": 100, "h": 200}
            ],
            "sprite_sheet": str(self.output_dir / "test_spritesheet.png"),
            "frame_size": {"w": 100, "h": 200},
            "total_frames": 4
        }
        
        self.metadata_path = self.output_dir / "test_spritesheet.json"
        with open(self.metadata_path, 'w') as f:
            json.dump(self.test_metadata, f)
        
        with open(self.test_metadata["sprite_sheet"], 'w') as f:
            f.write("fake image content")
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_initialization(self):
        exporter = GodotExporter(str(self.output_dir))
        self.assertEqual(str(exporter.output_dir), str(self.output_dir))
        self.assertEqual(str(exporter.godot_dir), str(self.output_dir / "godot"))
    
    @patch('shutil.copy')
    def test_export_to_godot(self, mock_copy):
        exporter = GodotExporter(str(self.output_dir))
        result = exporter.export_to_godot(str(self.metadata_path))
        
        self.assertIn("godot_dir", result)
        self.assertIn("sprite_sheet", result)
        self.assertIn("total_frames", result)
        self.assertEqual(result["total_frames"], 4)
        
        self.assertTrue(exporter.godot_dir.exists())
        mock_copy.assert_called_once()
    
    def test_convert_to_godot_format(self):
        exporter = GodotExporter(str(self.output_dir))
        godot_format = exporter._convert_to_godot_format(self.test_metadata, "test.png")
        
        self.assertEqual(godot_format["total_frames"], 4)
        self.assertEqual(godot_format["animation_name"], "default")
        self.assertEqual(godot_format["fps"], 10)
        self.assertEqual(godot_format["sprite_sheet"], "test.png")
    
    def test_generate_sprite_frames_resource(self):
        exporter = GodotExporter(str(self.output_dir))
        godot_metadata = exporter._convert_to_godot_format(self.test_metadata, "test.png")
        resource_content = exporter._generate_sprite_frames_resource(godot_metadata)
        
        self.assertIn('[gd_resource type="SpriteFrames"', resource_content)
        self.assertIn('animations/names', resource_content)
        self.assertIn('AtlasTexture_1', resource_content)
    
    def test_generate_animated_sprite_scene(self):
        exporter = GodotExporter(str(self.output_dir))
        scene_content = exporter._generate_animated_sprite_scene("test.png")
        
        self.assertIn('[gd_scene', scene_content)
        self.assertIn('type="AnimatedSprite2D"', scene_content)
    
    def test_generate_test_scene(self):
        exporter = GodotExporter(str(self.output_dir))
        test_scene_content = exporter._generate_test_scene()
        
        self.assertIn('[gd_scene', test_scene_content)
        self.assertIn('PlayButton', test_scene_content)
        self.assertIn('PauseButton', test_scene_content)
        self.assertIn('StopButton', test_scene_content)

if __name__ == '__main__':
    unittest.main()
