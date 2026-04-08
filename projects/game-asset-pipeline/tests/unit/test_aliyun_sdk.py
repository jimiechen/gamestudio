import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from aliyun_sdk import AliyunVideoClient

class TestAliyunVideoClient(unittest.TestCase):
    
    def setUp(self):
        self.api_key = "test_api_key"
        self.client = AliyunVideoClient(self.api_key)
    
    def test_initialization(self):
        self.assertEqual(self.client.api_key, self.api_key)
    
    @patch('dashscope.VideoSynthesis.async_call')
    @patch('dashscope.VideoSynthesis.wait')
    def test_image_to_video_first_frame(self, mock_wait, mock_async_call):
        mock_async_response = MagicMock()
        mock_async_response.status_code = 200
        mock_async_response.output.task_id = "test_task_id"
        mock_async_call.return_value = mock_async_response
        
        mock_wait_response = MagicMock()
        mock_wait_response.status_code = 200
        mock_wait_response.output.video_url = "https://example.com/video.mp4"
        mock_wait.return_value = mock_wait_response
        
        result = self.client.image_to_video(
            first_frame_url="https://example.com/image.jpg",
            prompt="test prompt"
        )
        
        self.assertEqual(result, "https://example.com/video.mp4")
        mock_async_call.assert_called_once()
        mock_wait.assert_called_once()
    
    @patch('dashscope.VideoSynthesis.async_call')
    @patch('dashscope.VideoSynthesis.wait')
    def test_image_to_video_first_last_frame(self, mock_wait, mock_async_call):
        mock_async_response = MagicMock()
        mock_async_response.status_code = 200
        mock_async_response.output.task_id = "test_task_id"
        mock_async_call.return_value = mock_async_response
        
        mock_wait_response = MagicMock()
        mock_wait_response.status_code = 200
        mock_wait_response.output.video_url = "https://example.com/video.mp4"
        mock_wait.return_value = mock_wait_response
        
        result = self.client.image_to_video(
            first_frame_url="https://example.com/first.jpg",
            last_frame_url="https://example.com/last.jpg",
            prompt="test prompt"
        )
        
        self.assertEqual(result, "https://example.com/video.mp4")
        mock_async_call.assert_called_once()
        mock_wait.assert_called_once()
    
    @patch('dashscope.VideoSynthesis.async_call')
    @patch('dashscope.VideoSynthesis.wait')
    def test_image_to_video_with_template(self, mock_wait, mock_async_call):
        mock_async_response = MagicMock()
        mock_async_response.status_code = 200
        mock_async_response.output.task_id = "test_task_id"
        mock_async_call.return_value = mock_async_response
        
        mock_wait_response = MagicMock()
        mock_wait_response.status_code = 200
        mock_wait_response.output.video_url = "https://example.com/video.mp4"
        mock_wait.return_value = mock_wait_response
        
        result = self.client.image_to_video(
            first_frame_url="https://example.com/image.jpg",
            template="mech1"
        )
        
        self.assertEqual(result, "https://example.com/video.mp4")
        mock_async_call.assert_called_once()
        mock_wait.assert_called_once()

if __name__ == '__main__':
    unittest.main()