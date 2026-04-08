import requests
import base64
import time
from pathlib import Path

class KlingClient:
    def __init__(self, access_key: str, secret_key: str):
        self.access_key = access_key
        self.secret_key = secret_key
        self.base_url = "https://api.klingai.com/v1"
        
    def image_to_video_motion(
        self,
        image_path: str,
        reference_video_path: str,
        output_duration: int = 5,  # 秒
        resolution: str = "720p",  # 720p|1080p
        mode: str = "standard"  # standard|pro
    ) -> str:
        """
        可灵动作迁移：将参考视频动作应用到静态角色图
        """
        # 上传图片
        image_url = self._upload_asset(image_path)
        video_url = self._upload_asset(reference_video_path)
        
        payload = {
            "model": "kling-motion-2.6",
            "input": {
                "image": image_url,
                "reference_video": video_url,
                "mode": "motion_control",  # 动作控制模式
                "duration": output_duration,
                "resolution": resolution,
                "quality": mode
            },
            "parameters": {
                "motion_strength": 0.8,  # 动作强度
                "character_consistency": 0.9,  # 角色一致性锁定
                "camera_control": "static",  # 固定相机
                "preserve_audio": False
            }
        }
        
        # 提交任务
        resp = requests.post(
            f"{self.base_url}/videos/generations",
            headers=self._auth_headers(),
            json=payload
        )
        task_id = resp.json()["data"]["task_id"]
        
        # 轮询等待
        return self._poll_task(task_id)
    
    def _upload_asset(self, file_path: str) -> str:
        """上传资源到可灵云存储"""
        with open(file_path, 'rb') as f:
            b64_data = base64.b64encode(f.read()).decode()
        
        resp = requests.post(
            f"{self.base_url}/assets/upload",
            headers=self._auth_headers(),
            json={"file": b64_data, "filename": Path(file_path).name}
        )
        return resp.json()["data"]["url"]
    
    def _poll_task(self, task_id: str, max_retry: int = 60) -> str:
        """轮询任务状态"""
        for _ in range(max_retry):
            resp = requests.get(
                f"{self.base_url}/tasks/{task_id}",
                headers=self._auth_headers()
            )
            status = resp.json()["data"]["status"]
            
            if status == "completed":
                return resp.json()["data"]["output"]["video_url"]
            elif status == "failed":
                raise Exception(f"Task failed: {resp.json()}")
            
            time.sleep(5)
        
        raise TimeoutError("Task polling timeout")
    
    def _auth_headers(self):
        """生成认证头"""
        import hashlib
        timestamp = str(int(time.time()))
        sign = hashlib.sha256(
            f"{self.access_key}{self.secret_key}{timestamp}".encode()
        ).hexdigest()
        
        return {
            "Authorization": f"Bearer {self.access_key}",
            "X-Timestamp": timestamp,
            "X-Signature": sign,
            "Content-Type": "application/json"
        }