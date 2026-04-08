import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple
import json

class FrameExtractor:
    def __init__(self, video_path: str):
        self.video = cv2.VideoCapture(video_path)
        self.fps = self.video.get(cv2.CAP_PROP_FPS)
        self.total_frames = int(self.video.get(cv2.CAP_PROP_FRAME_COUNT))
        
    def extract_action_frames(
        self, 
        target_frames: int = 8,
        method: str = "optical_flow"  # optical_flow|uniform|scene_change
    ) -> List[np.ndarray]:
        """
        智能提取动作关键帧
        """
        if method == "uniform":
            return self._uniform_sample(target_frames)
        elif method == "optical_flow":
            return self._optical_flow_sample(target_frames)
        else:
            return self._scene_change_sample(target_frames)
    
    def _optical_flow_sample(self, target_frames: int) -> List[np.ndarray]:
        """基于光流分析提取动作关键帧（推荐）"""
        frames = []
        prev_gray = None
        flow_scores = []
        
        # 第一遍：计算光流强度
        while True:
            ret, frame = self.video.read()
            if not ret:
                break
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            if prev_gray is not None:
                flow = cv2.calcOpticalFlowFarneback(
                    prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
                )
                mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
                flow_scores.append((len(flow_scores), np.mean(mag)))
            
            prev_gray = gray
            frames.append(frame)
        
        # 根据动作强度选择关键帧
        flow_scores.sort(key=lambda x: x[1], reverse=True)
        key_indices = [x[0] for x in flow_scores[:target_frames]]
        key_indices.sort()
        
        return [frames[i] for i in key_indices]
    
    def _uniform_sample(self, target_frames: int) -> List[np.ndarray]:
        """均匀采样帧"""
        frames = []
        step = max(1, self.total_frames // target_frames)
        
        for i in range(0, self.total_frames, step):
            self.video.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = self.video.read()
            if ret:
                frames.append(frame)
            if len(frames) >= target_frames:
                break
        
        return frames
    
    def _scene_change_sample(self, target_frames: int) -> List[np.ndarray]:
        """基于场景变化采样帧"""
        frames = []
        prev_frame = None
        scene_changes = []
        
        while True:
            ret, frame = self.video.read()
            if not ret:
                break
            
            if prev_frame is not None:
                diff = cv2.absdiff(prev_frame, frame)
                change = np.mean(diff)
                scene_changes.append((len(frames), change))
            
            prev_frame = frame
            frames.append(frame)
        
        scene_changes.sort(key=lambda x: x[1], reverse=True)
        key_indices = [x[0] for x in scene_changes[:target_frames]]
        key_indices.sort()
        
        return [frames[i] for i in key_indices]
    
    def generate_sprite_sheet(
        self, 
        frames: List[np.ndarray], 
        output_path: str,
        columns: int = 4,
        padding: int = 2,
        bg_color: Tuple[int, int, int] = (0, 255, 0)  # 绿幕背景
    ) -> dict:
        """
        生成游戏用的 Sprite Sheet（带透明通道）
        """
        if not frames:
            return {}
        
        h, w = frames[0].shape[:2]
        rows = (len(frames) + columns - 1) // columns
        
        # 创建画布
        sheet_w = columns * (w + padding) + padding
        sheet_h = rows * (h + padding) + padding
        sprite_sheet = np.full((sheet_h, sheet_w, 4), (*bg_color, 0), dtype=np.uint8)
        
        # 绿幕抠图并放置
        metadata = {
            "frames": [],
            "sprite_sheet": output_path,
            "frame_size": {"w": w, "h": h},
            "total_frames": len(frames)
        }
        
        for idx, frame in enumerate(frames):
            # 绿幕抠图（假设背景为纯色，实际可用rembg等库）
            mask = self._chroma_key(frame, bg_color)
            rgba = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
            rgba[:, :, 3] = mask
            
            row = idx // columns
            col = idx % columns
            
            x = col * (w + padding) + padding
            y = row * (h + padding) + padding
            
            sprite_sheet[y:y+h, x:x+w] = rgba
            
            metadata["frames"].append({
                "index": idx,
                "x": x, "y": y,
                "w": w, "h": h
            })
        
        cv2.imwrite(output_path, sprite_sheet)
        
        # 保存 JSON 元数据
        json_path = output_path.replace(".png", ".json")
        with open(json_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return metadata
    
    def _chroma_key(self, frame: np.ndarray, key_color: Tuple[int, int, int], 
                    tolerance: int = 30) -> np.ndarray:
        """简单的绿幕抠图"""
        diff = cv2.absdiff(frame, np.array(key_color))
        mask = cv2.inRange(diff, (0, 0, 0), (tolerance, tolerance, tolerance))
        return cv2.bitwise_not(mask)
    
    def cleanup(self):
        self.video.release()