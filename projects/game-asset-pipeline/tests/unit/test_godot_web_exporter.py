import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import json
import tempfile
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from godot_web_exporter import GodotWebExporter

class TestGodotWebExporter(unittest.TestCase):
    
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.output_dir = Path(self.temp_dir.name)
        
        self.test_metadata = {
            "frames": [
                {"index": 0, "x": 2, "y": 2, "w": 100, "h": 200},
                {"index": 1, "x": 104, "y": 2, "w": 100, "h": 200}
            ],
            "sprite_sheet": str(self.output_dir / "test_spritesheet.png"),
            "frame_size": {"w": 100, "h": 200},
            "total_frames": 2,
            "character": "关羽",
            "action": "挥刀斩击"
        }
        
        self.metadata_path = self.output_dir / "test_spritesheet.json"
        with open(self.metadata_path, 'w') as f:
            json.dump(self.test_metadata, f)
        
        with open(self.test_metadata["sprite_sheet"], 'w') as f:
            f.write("fake image content")
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_initialization(self):
        exporter = GodotWebExporter(str(self.output_dir))
        self.assertEqual(str(exporter.output_dir), str(self.output_dir))
        self.assertEqual(str(exporter.web_dir), str(self.output_dir / "web"))
        self.assertEqual(str(exporter.godot_dir), str(self.output_dir / "godot"))
    
    @patch('shutil.copy')
    @patch('zipfile.ZipFile')
    def test_export_to_web(self, mock_zip, mock_copy):
        mock_zip_instance = MagicMock()
        mock_zip.return_value.__enter__.return_value = mock_zip_instance
        
        exporter = GodotWebExporter(str(self.output_dir))
        result = exporter.export_to_web(str(self.metadata_path))
        
        self.assertIn("web_dir", result)
        self.assertIn("deployment_zip", result)
        self.assertIn("sprite_sheet", result)
        self.assertIn("total_frames", result)
        self.assertEqual(result["total_frames"], 2)
        
        self.assertTrue(exporter.web_dir.exists())
        mock_copy.assert_called()
        mock_zip.assert_called()
    
    def test_generate_web_test_page(self):
        exporter = GodotWebExporter(str(self.output_dir))
        exporter._generate_web_test_page(self.test_metadata)
        
        index_html = exporter.web_dir / "index.html"
        self.assertTrue(index_html.exists())
        
        content = index_html.read_text(encoding='utf-8')
        self.assertIn('Godot 动画测试', content)
        self.assertIn('关羽', content)
        self.assertIn('挥刀斩击', content)
        self.assertIn('2', content)
        self.assertIn('100x200', content)
    
    def test_generate_server_config(self):
        exporter = GodotWebExporter(str(self.output_dir))
        exporter._generate_server_config()
        
        nginx_config = exporter.web_dir / "nginx.conf"
        self.assertTrue(nginx_config.exists())
        
        docker_compose = exporter.web_dir / "docker-compose.yml"
        self.assertTrue(docker_compose.exists())
    
    @patch('zipfile.ZipFile')
    def test_create_deployment_zip(self, mock_zip):
        mock_zip_instance = MagicMock()
        mock_zip.return_value.__enter__.return_value = mock_zip_instance
        
        exporter = GodotWebExporter(str(self.output_dir))
        zip_path = exporter._create_deployment_zip()
        
        # 验证路径生成正确
        self.assertTrue('godot-web-deployment' in str(zip_path))
        # 验证zipfile被调用
        mock_zip.assert_called()

if __name__ == '__main__':
    unittest.main()
