import unittest
import sys
import os
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

try:
    from frame_extractor import FrameExtractor
    HAS_FRAME_EXTRACTOR = True
except ImportError:
    HAS_FRAME_EXTRACTOR = False

class TestFrameExtractor(unittest.TestCase):
    
    @unittest.skipUnless(HAS_FRAME_EXTRACTOR, "Frame extractor requires OpenCV")
    def test_chroma_key(self):
        extractor = FrameExtractor.__new__(FrameExtractor)
        
        test_frame = np.full((100, 100, 3), 0, dtype=np.uint8)
        test_frame[:, :, 1] = 255
        
        key_color = (0, 255, 0)
        mask = extractor._chroma_key(test_frame, key_color)
        
        self.assertEqual(mask.shape, (100, 100))
        self.assertIn(0, mask)
        self.assertIn(255, mask)
    
    @unittest.skipUnless(HAS_FRAME_EXTRACTOR, "Frame extractor requires OpenCV")
    def test_uniform_sample(self):
        extractor = FrameExtractor.__new__(FrameExtractor)
        
        frames = []
        for _ in range(10):
            frame = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
            frames.append(frame)
        
        extractor._uniform_sample = lambda self, n: frames[:n]
        result = extractor._uniform_sample(None, 5)
        
        self.assertEqual(len(result), 5)
    
    @unittest.skipUnless(HAS_FRAME_EXTRACTOR, "Frame extractor requires OpenCV")
    def test_extract_action_frames(self):
        extractor = FrameExtractor.__new__(FrameExtractor)
        
        frames = []
        for i in range(10):
            frame = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
            frames.append(frame)
        
        extractor._uniform_sample = lambda self, n: frames[:n]
        extractor._optical_flow_sample = lambda self, n: frames[:n]
        extractor._scene_change_sample = lambda self, n: frames[:n]
        
        result_uniform = extractor.extract_action_frames(target_frames=5, method="uniform")
        self.assertEqual(len(result_uniform), 5)
        
        result_optical = extractor.extract_action_frames(target_frames=5, method="optical_flow")
        self.assertEqual(len(result_optical), 5)
        
        result_scene = extractor.extract_action_frames(target_frames=5, method="scene_change")
        self.assertEqual(len(result_scene), 5)

if __name__ == '__main__':
    unittest.main()