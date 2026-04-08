import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from lark_uploader import LarkUploader

class TestLarkUploader(unittest.TestCase):
    
    def setUp(self):
        pass
    
    @patch('subprocess.run')
    def test_check_cli(self, mock_run):
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_run.return_value = mock_result
        
        uploader = LarkUploader.__new__(LarkUploader)
        uploader._check_cli = MagicMock()
        
        uploader._check_cli()
        self.assertTrue(uploader._check_cli.called)
    
    @patch('subprocess.run')
    def test_upload_to_drive(self, mock_run):
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = '{"data": {"file_token": "test_file_token"}}'
        mock_run.return_value = mock_result
        
        uploader = LarkUploader.__new__(LarkUploader)
        
        result = uploader.upload_to_drive(
            file_path="/path/to/file.png",
            folder_token="test_folder_token"
        )
        
        self.assertEqual(result, "test_file_token")
        mock_run.assert_called_once()
    
    @patch('subprocess.run')
    def test_create_bitable_record(self, mock_run):
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = '{"data": {"record_id": "test_record_id"}}'
        mock_run.return_value = mock_result
        
        uploader = LarkUploader.__new__(LarkUploader)
        
        result = uploader.create_bitable_record(
            app_token="test_app_token",
            table_id="test_table_id",
            character_name="关羽",
            sprite_sheet_token="test_sprite_token",
            animation_type="青龙斩",
            metadata={"total_frames": 8, "frame_size": {"w": 768, "h": 1024}}
        )
        
        self.assertEqual(result, "test_record_id")
        mock_run.assert_called_once()
    
    @patch('subprocess.run')
    def test_send_notification(self, mock_run):
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_run.return_value = mock_result
        
        uploader = LarkUploader.__new__(LarkUploader)
        
        uploader.send_notification(
            chat_id="test_chat_id",
            message="Test message"
        )
        
        mock_run.assert_called_once()
    
    @patch('subprocess.run')
    def test_send_card_notification(self, mock_run):
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_run.return_value = mock_result
        
        uploader = LarkUploader.__new__(LarkUploader)
        
        test_content = {
            "character": "关羽",
            "action": "挥刀斩击",
            "total_frames": 8,
            "frame_size": {"w": 100, "h": 200},
            "record_id": "test_record_id",
            "timestamp": "2024-01-01 00:00:00"
        }
        
        uploader.send_card_notification(
            chat_id="test_chat_id",
            title="测试通知",
            content=test_content
        )
        
        mock_run.assert_called_once()

if __name__ == '__main__':
    unittest.main()