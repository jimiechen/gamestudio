# -*- coding: utf-8 -*-
"""
阿里云百炼 API 客户端 - 万相图生视频
"""

import requests
import time
from typing import Optional, Dict
from config import DASHSCOPE_API_KEY, DASHSCOPE_BASE_URL


class DashScopeClient:
    """阿里云百炼 API 客户端 - 万相图生视频"""

    BASE_URL = DASHSCOPE_BASE_URL
    MODEL = "wan2.2-kf2v-flash"

    def __init__(self, api_key: str = None):
        self.api_key = api_key or DASHSCOPE_API_KEY
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "X-DashScope-Async": "enable"
        }

    def submit_video_task(self,
                           first_frame_url: str,
                           prompt: str = "",
                           last_frame_url: str = None,
                           mode: str = "first_frame",
                           resolution: str = "720P",
                           prompt_extend: bool = True,
                           watermark: bool = True) -> Dict:
        """
        提交图生视频任务

        Args:
            first_frame_url: 首帧图片公网URL（必填）
            prompt: 提示词（推荐填写）
            last_frame_url: 尾帧图片URL（首尾帧模式必填）
            mode: 模式 'first_frame' 或 'first_last_frame'
            resolution: 分辨率 480P/720P/1080P
            prompt_extend: 是否智能改写提示词
            watermark: 是否添加水印

        Returns:
            {'success': bool, 'task_id': str, ...}
        """
        input_data = {
            "first_frame_url": first_frame_url,
            "prompt": prompt
        }

        if mode == "first_last_frame":
            if not last_frame_url:
                return {
                    'success': False,
                    'error': '首尾帧模式必须提供尾帧图片'
                }
            input_data["last_frame_url"] = last_frame_url

        payload = {
            "model": self.MODEL,
            "input": input_data,
            "parameters": {
                "resolution": resolution,
                "prompt_extend": prompt_extend,
                "watermark": watermark
            }
        }

        try:
            response = requests.post(
                f"{self.BASE_URL}/services/aigc/image2video/video-synthesis",
                headers=self.headers,
                json=payload,
                timeout=30
            )

            result = response.json()

            if "output" in result and "task_id" in result["output"]:
                return {
                    'success': True,
                    'task_id': result["output"]["task_id"],
                    'request_id': result.get("request_id")
                }
            else:
                return {
                    'success': False,
                    'error': result.get("message", "未知错误"),
                    'code': result.get("code"),
                    'raw': result
                }

        except requests.exceptions.RequestException as e:
            print(f"[DashScope] 提交任务失败: {e}")
            return {'success': False, 'error': str(e)}

    def query_task_status(self, task_id: str) -> Dict:
        """
        查询视频任务状态

        Args:
            task_id: 任务ID

        Returns:
            {'success': bool, 'status': str, 'video_url': str, ...}
        """
        try:
            url = f"{self.BASE_URL}/tasks/{task_id}"
            headers = {"Authorization": f"Bearer {self.api_key}"}

            response = requests.get(url, headers=headers, timeout=30)
            result = response.json()

            output = result.get("output", {})
            status = output.get("task_status", "UNKNOWN")

            return {
                'success': True,
                'task_id': task_id,
                'status': status,
                'video_url': output.get("video_url"),
                'request_id': result.get("request_id"),
                'message': output.get("message", ""),
                'code': output.get("code"),
                'raw': result
            }

        except requests.exceptions.RequestException as e:
            print(f"[DashScope] 查询任务状态失败: {e}")
            return {'success': False, 'error': str(e)}

    def download_video(self, video_url: str, save_path: str) -> bool:
        """
        下载视频到本地

        Args:
            video_url: 视频URL
            save_path: 本地保存路径

        Returns:
            是否成功
        """
        try:
            response = requests.get(video_url, stream=True, timeout=120)
            response.raise_for_status()

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            print(f"[DashScope] 视频已下载: {save_path}")
            return True

        except Exception as e:
            print(f"[DashScope] 下载视频失败: {e}")
            return False


# 全局实例
dashscope_client = DashScopeClient()
