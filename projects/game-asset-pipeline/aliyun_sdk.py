import os
from http import HTTPStatus
from dashscope import VideoSynthesis
import dashscope

class AliyunVideoClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # 北京地域URL，各地域的URL不同
        dashscope.base_http_api_url = 'https://dashscope.aliyuncs.com/api/v1'
    
    def image_to_video(
        self,
        first_frame_url: str,
        last_frame_url: str = None,
        prompt: str = None,
        template: str = None,
        resolution: str = "720P",
        model: str = "wan2.2-kf2v-flash"
    ) -> str:
        """
        阿里云图生视频
        
        Args:
            first_frame_url: 首帧图像URL
            last_frame_url: 尾帧图像URL（可选，使用特效时忽略）
            prompt: 提示词（可选，使用特效时忽略）
            template: 特效模板名称（可选）
            resolution: 视频分辨率，可选值：480P、720P、1080P
            model: 使用的模型，默认：wan2.2-kf2v-flash
        
        Returns:
            生成的视频URL
        """
        # 构建参数
        params = {
            "api_key": self.api_key,
            "model": model,
            "first_frame_url": first_frame_url,
            "resolution": resolution,
            "prompt_extend": True,
            "watermark": True
        }
        
        # 如果提供了尾帧URL，使用首尾帧模式
        if last_frame_url:
            params["last_frame_url"] = last_frame_url
            params["prompt"] = prompt
        
        # 如果提供了模板，使用特效模式
        if template:
            params["template"] = template
        
        # 异步调用
        rsp = VideoSynthesis.async_call(**params)
        
        if rsp.status_code != HTTPStatus.OK:
            raise Exception(f"创建任务失败: {rsp.code}, {rsp.message}")
        
        # 等待任务完成
        task = rsp
        rsp = VideoSynthesis.wait(task=task, api_key=self.api_key)
        
        if rsp.status_code != HTTPStatus.OK:
            raise Exception(f"任务执行失败: {rsp.code}, {rsp.message}")
        
        return rsp.output.video_url