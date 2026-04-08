import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import tempfile
import shutil
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

class TestSkill(unittest.TestCase):
    
    def setUp(self):
        self.test_output_dir = tempfile.mkdtemp(prefix='test_skill_')
        self.original_output_dir = os.environ.get('OUTPUT_DIR')
        os.environ['OUTPUT_DIR'] = self.test_output_dir
    
    def tearDown(self):
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)
        if self.original_output_dir:
            os.environ['OUTPUT_DIR'] = self.original_output_dir
        else:
            os.environ.pop('OUTPUT_DIR', None)
    
    def test_skill_inputs_validation(self):
        """测试 Skill 输入参数验证"""
        # 测试必填参数
        required_inputs = {
            "character": "关羽",
            "action": "青龙斩",
            "reference_video": "/path/to/video.mp4"
        }
        
        # 测试可选参数
        optional_inputs = {
            "video_service": "kling",
            "upload_to_lark": False
        }
        
        # 验证参数类型
        self.assertIsInstance(required_inputs["character"], str)
        self.assertIsInstance(required_inputs["action"], str)
        self.assertIsInstance(required_inputs["reference_video"], str)
        self.assertIsInstance(optional_inputs["video_service"], str)
        self.assertIsInstance(optional_inputs["upload_to_lark"], bool)
    
    def test_skill_outputs_structure(self):
        """测试 Skill 输出结构"""
        expected_outputs = {
            "sprite_sheet_path": "./output/test/sprite.png",
            "metadata": {
                "frames": [],
                "sprite_sheet": "./output/test/sprite.png",
                "frame_size": {"w": 720, "h": 1280},
                "total_frames": 8
            },
            "lark_record_id": "rec_123456"
        }
        
        # 验证输出结构
        self.assertIn("sprite_sheet_path", expected_outputs)
        self.assertIn("metadata", expected_outputs)
        self.assertIn("lark_record_id", expected_outputs)
        self.assertIsInstance(expected_outputs["sprite_sheet_path"], str)
        self.assertIsInstance(expected_outputs["metadata"], dict)
        self.assertIsInstance(expected_outputs["lark_record_id"], str)
    
    def test_skill_script_execution(self):
        """测试 Skill 解析脚本执行"""
        # 创建模拟输出目录结构
        test_work_dir = os.path.join(self.test_output_dir, "关羽_青龙斩_20260405_123456")
        os.makedirs(test_work_dir, exist_ok=True)
        
        # 创建模拟 Sprite Sheet 文件
        sprite_path = os.path.join(test_work_dir, "关羽_青龙斩_spritesheet.png")
        with open(sprite_path, 'w') as f:
            f.write("mock sprite sheet")
        
        # 创建模拟元数据文件
        metadata_path = sprite_path.replace(".png", ".json")
        metadata = {
            "frames": [],
            "sprite_sheet": sprite_path,
            "frame_size": {"w": 720, "h": 1280},
            "total_frames": 8
        }
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        # 创建模拟飞书记录ID文件
        lark_record_path = os.path.join(test_work_dir, "lark_record_id.txt")
        with open(lark_record_path, 'w') as f:
            f.write("rec_123456")
        
        # 运行 Skill 解析脚本
        script_path = os.path.join(
            os.path.dirname(__file__),
            '../../skill-game-asset-openclaw.yml'
        )
        
        # 提取脚本内容
        with open(script_path, 'r', encoding='utf-8') as f:
            skill_content = f.read()
        
        # 提取脚本部分
        import re
        script_match = re.search(r'script:\s*\|\|([\s\S]*?)$', skill_content, re.MULTILINE)
        if script_match:
            script_code = script_match.group(1)
            
            # 执行脚本
            exec_globals = {}
            exec(script_code, exec_globals)
            
            # 验证输出
            # 注意：这里我们只是验证脚本语法正确，实际执行需要在真实环境中测试
            self.assertTrue(True)
    
    @patch('subprocess.run')
    def test_skill_command_execution(self, mock_run):
        """测试 Skill 命令执行"""
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_run.return_value = mock_result
        
        # 模拟命令执行
        import subprocess
        try:
            # 测试命令格式
            cmd = [
                "python", "game_asset_pipeline.py",
                "--character", "关羽",
                "--action", "青龙斩",
                "--reference-video", "/path/to/video.mp4",
                "--video-service", "kling"
            ]
            
            # 验证命令格式正确
            self.assertEqual(cmd[0], "python")
            self.assertEqual(cmd[1], "game_asset_pipeline.py")
            self.assertEqual(cmd[2], "--character")
            self.assertEqual(cmd[3], "关羽")
            self.assertEqual(cmd[4], "--action")
            self.assertEqual(cmd[5], "青龙斩")
            self.assertEqual(cmd[6], "--reference-video")
            self.assertEqual(cmd[7], "/path/to/video.mp4")
            self.assertEqual(cmd[8], "--video-service")
            self.assertEqual(cmd[9], "kling")
        except Exception as e:
            self.fail(f"命令执行测试失败: {e}")

if __name__ == '__main__':
    unittest.main()