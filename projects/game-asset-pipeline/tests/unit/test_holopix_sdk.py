import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from holopix_sdk import HolopixClient

class TestHolopixClient(unittest.TestCase):
    
    def setUp(self):
        self.access_key = "test_access_key"
        self.secret_key = "test_secret_key"
        self.client = HolopixClient(self.access_key, self.secret_key)
    
    def test_initialization(self):
        self.assertEqual(self.client.access_key, self.access_key)
        self.assertEqual(self.client.secret_key, self.secret_key)
        self.assertEqual(self.client.base_url, "https://api.holopix.cn")
    
    def test_generate_signature(self):
        timestamp = "1743888888888"
        nonce = "test_nonce_12345"
        signature = self.client._generate_signature(timestamp, nonce)
        self.assertIsNotNone(signature)
        self.assertEqual(len(signature), 32)
    
    def test_get_auth_headers(self):
        headers = self.client._get_auth_headers()
        self.assertIn("X-Access-Key", headers)
        self.assertIn("X-Signature", headers)
        self.assertIn("X-Timestamp", headers)
        self.assertIn("X-Nonce", headers)
        self.assertIn("Content-Type", headers)
        self.assertEqual(headers["Content-Type"], "application/json")
    
    @patch('requests.post')
    def test_generate_character(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": [{"url": "https://example.com/image.jpg"}]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        result = self.client.generate_character(
            prompt="test prompt",
            character_type="关羽"
        )
        
        self.assertIn("data", result)
        self.assertEqual(len(result["data"]), 1)
        mock_post.assert_called_once()
    
    @patch('requests.post')
    def test_remove_background(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": [{"url": "https://example.com/bg_removed.jpg"}]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        result = self.client.remove_background(
            image_url="https://example.com/image.jpg"
        )
        
        self.assertIn("data", result)
        mock_post.assert_called_once()
    
    @patch('requests.post')
    def test_image_variations(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": [
                {"url": "https://example.com/variant1.jpg"},
                {"url": "https://example.com/variant2.jpg"}
            ]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        result = self.client.image_variations(
            image_url="https://example.com/image.jpg",
            num_variations=2
        )
        
        self.assertIn("data", result)
        self.assertEqual(len(result["data"]), 2)
        mock_post.assert_called_once()
    
    @patch('requests.get')
    def test_download_image(self, mock_get):
        mock_response = MagicMock()
        mock_response.iter_content.return_value = [b'test image content']
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as f:
            temp_path = f.name
        
        try:
            result = self.client.download_image(
                "https://example.com/image.jpg",
                temp_path
            )
            self.assertEqual(result, temp_path)
            mock_get.assert_called_once()
        finally:
            os.unlink(temp_path)

if __name__ == '__main__':
    unittest.main()