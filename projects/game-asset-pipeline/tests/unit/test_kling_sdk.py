import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from kling_sdk import KlingClient

class TestKlingClient(unittest.TestCase):
    
    def setUp(self):
        self.access_key = "test_access_key"
        self.secret_key = "test_secret_key"
        self.client = KlingClient(self.access_key, self.secret_key)
    
    def test_initialization(self):
        self.assertEqual(self.client.access_key, self.access_key)
        self.assertEqual(self.client.secret_key, self.secret_key)
        self.assertEqual(self.client.base_url, "https://api.klingai.com/v1")
    
    def test_auth_headers(self):
        headers = self.client._auth_headers()
        self.assertIn("Authorization", headers)
        self.assertIn("X-Timestamp", headers)
        self.assertIn("X-Signature", headers)
        self.assertIn("Content-Type", headers)
    
    @patch('requests.post')
    def test_upload_asset(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": {"url": "https://example.com/asset.jpg"}
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as f:
            temp_path = f.name
        
        try:
            result = self.client._upload_asset(temp_path)
            self.assertEqual(result, "https://example.com/asset.jpg")
            mock_post.assert_called_once()
        finally:
            os.unlink(temp_path)
    
    @patch('requests.post')
    @patch.object(KlingClient, '_upload_asset')
    @patch.object(KlingClient, '_poll_task')
    def test_image_to_video_motion(self, mock_poll_task, mock_upload_asset, mock_post):
        mock_upload_asset.side_effect = [
            "https://example.com/image.jpg",
            "https://example.com/video.mp4"
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": {"task_id": "test_task_id"}}
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        mock_poll_task.return_value = "https://example.com/output_video.mp4"
        
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as img_f, \
             tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as vid_f:
            img_path = img_f.name
            vid_path = vid_f.name
        
        try:
            result = self.client.image_to_video_motion(
                image_path=img_path,
                reference_video_path=vid_path
            )
            self.assertEqual(result, "https://example.com/output_video.mp4")
            self.assertEqual(mock_upload_asset.call_count, 2)
            mock_poll_task.assert_called_once()
        finally:
            os.unlink(img_path)
            os.unlink(vid_path)

if __name__ == '__main__':
    unittest.main()