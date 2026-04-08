import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import tempfile
import shutil

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from holopix_sdk import HolopixClient
from kling_sdk import KlingClient
from aliyun_sdk import AliyunVideoClient
from lark_uploader import LarkUploader

class TestPipelineIntegration(unittest.TestCase):
    
    def setUp(self):
        self.test_output_dir = tempfile.mkdtemp(prefix='test_pipeline_')
        self.holopix_access_key = "test_ak"
        self.holopix_secret_key = "test_sk"
        self.kling_access_key = "kling_ak"
        self.kling_secret_key = "kling_sk"
        self.aliyun_api_key = "aliyun_sk"
    
    def tearDown(self):
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)
    
    @patch('holopix_sdk.HolopixClient.generate_character')
    @patch('holopix_sdk.HolopixClient.download_image')
    @patch('holopix_sdk.HolopixClient.remove_background')
    @patch('holopix_sdk.HolopixClient.image_variations')
    def test_holopix_complete_workflow(self, mock_variations, 
                                         mock_remove_bg, 
                                         mock_download, 
                                         mock_generate):
        mock_generate.return_value = {
            "data": [{"url": "https://example.com/image.jpg"}]
        }
        mock_remove_bg.return_value = {
            "data": [{"url": "https://example.com/bg_removed.jpg"}]
        }
        mock_variations.return_value = {
            "data": [
                {"url": "https://example.com/variant1.jpg"},
                {"url": "https://example.com/variant2.jpg"},
                {"url": "https://example.com/variant3.jpg"},
                {"url": "https://example.com/variant4.jpg"}
            ]
        }
        
        client = HolopixClient(self.holopix_access_key, self.holopix_secret_key)
        
        result = client.generate_character(
            prompt="test prompt",
            character_type="关羽"
        )
        self.assertIn("data", result)
        
        bg_result = client.remove_background(
            image_url="https://example.com/image.jpg"
        )
        self.assertIn("data", bg_result)
        
        variations_result = client.image_variations(
            image_url="https://example.com/image.jpg",
            num_variations=4
        )
        self.assertIn("data", variations_result)
        self.assertEqual(len(variations_result["data"]), 4)
        
        self.assertEqual(mock_generate.call_count, 1)
        self.assertEqual(mock_remove_bg.call_count, 1)
        self.assertEqual(mock_variations.call_count, 1)
    
    @patch('holopix_sdk.HolopixClient.generate_character')
    @patch('holopix_sdk.HolopixClient.download_image')
    @patch('kling_sdk.KlingClient.image_to_video_motion')
    def test_holopix_kling_integration(self, mock_kling_video, 
                                       mock_download, 
                                       mock_generate):
        mock_generate.return_value = {
            "data": [{"url": "https://example.com/image.jpg"}]
        }
        mock_kling_video.return_value = "https://example.com/video.mp4"
        
        holopix_client = HolopixClient(self.holopix_access_key, self.holopix_secret_key)
        kling_client = KlingClient(self.kling_access_key, self.kling_secret_key)
        
        image_result = holopix_client.generate_character(
            prompt="test prompt",
            character_type="关羽"
        )
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as img_f:
            img_path = img_f.name
        
        try:
            holopix_client.download_image(
                image_result["data"][0]["url"],
                img_path
            )
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as ref_f:
                ref_path = ref_f.name
            
            try:
                video_url = kling_client.image_to_video_motion(
                    image_path=img_path,
                    reference_video_path=ref_path
                )
                
                self.assertEqual(video_url, "https://example.com/video.mp4")
            finally:
                os.unlink(ref_path)
        finally:
            os.unlink(img_path)
    
    @patch('holopix_sdk.HolopixClient.generate_character')
    @patch('holopix_sdk.HolopixClient.download_image')
    @patch('aliyun_sdk.AliyunVideoClient.image_to_video')
    def test_holopix_aliyun_integration(self, mock_aliyun_video,
                                        mock_download,
                                        mock_generate):
        mock_generate.return_value = {
            "data": [{"url": "https://example.com/image.jpg"}]
        }
        mock_aliyun_video.return_value = "https://example.com/video.mp4"
        
        holopix_client = HolopixClient(self.holopix_access_key, self.holopix_secret_key)
        aliyun_client = AliyunVideoClient(self.aliyun_api_key)
        
        image_result = holopix_client.generate_character(
            prompt="test prompt",
            character_type="关羽"
        )
        
        video_url = aliyun_client.image_to_video(
            first_frame_url=image_result["data"][0]["url"],
            prompt="test video prompt"
        )
        
        self.assertEqual(video_url, "https://example.com/video.mp4")
        self.assertEqual(mock_generate.call_count, 1)
        self.assertEqual(mock_aliyun_video.call_count, 1)

if __name__ == '__main__':
    unittest.main()