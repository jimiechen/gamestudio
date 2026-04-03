# -*- coding: utf-8 -*-
"""
HoloPix API 客户端
"""

import hmac
import hashlib
import json
import time
import random
import string
import requests
from typing import Dict, Any, Optional
from config import HOLOPIX_ACCESS_KEY, HOLOPIX_SECRET_KEY, HOLOPIX_BASE_URL


class HolopixClient:
    """HoloPix API 客户端"""
    
    def __init__(self):
        self.access_key = HOLOPIX_ACCESS_KEY
        self.secret_key = HOLOPIX_SECRET_KEY
        self.base_url = HOLOPIX_BASE_URL
    
    def _generate_nonce(self, length: int = 16) -> str:
        """生成随机 nonce"""
        chars = string.ascii_letters + string.digits
        return ''.join(random.choice(chars) for _ in range(length))
    
    def _generate_signature(self, timestamp: str, params: Dict[str, Any]) -> str:
        """生成 HMAC-SHA256 签名"""
        json_str = json.dumps(params, separators=(',', ':'), ensure_ascii=False)
        sign_string = f"{timestamp}={json_str}"
        
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            sign_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def _get_headers(self, params: Dict[str, Any]) -> Dict[str, str]:
        """获取请求头"""
        timestamp = str(int(time.time() * 1000))
        nonce = self._generate_nonce()
        signature = self._generate_signature(timestamp, params)
        
        return {
            'Content-Type': 'application/json',
            'X-Access-Key': self.access_key,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
            'X-Nonce': nonce
        }
    
    def query_models(self) -> Dict[str, Any]:
        """查询可用模型列表"""
        url = f"{self.base_url}/v1/model/apiList"
        
        request_body = {}
        headers = self._get_headers(request_body)
        
        try:
            response = requests.post(url, headers=headers, json=request_body, timeout=30)
            result = response.json()
            print(f"HoloPix API query_models 返回: {result.keys() if isinstance(result, dict) else 'not dict'}")
            return result
        except Exception as e:
            print(f"HoloPix API query_models 错误: {e}")
            return {'success': False, 'error': str(e)}
    
    def generate_image(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """生成图片"""
        url = f"{self.base_url}/v1/images/generations/t2i"
        
        request_body = {"data": params}
        headers = self._get_headers(request_body)
        
        try:
            response = requests.post(url, headers=headers, json=request_body, timeout=120)
            return response.json()
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def query_task(self, client_id: str) -> Dict[str, Any]:
        """查询任务状态"""
        url = f"{self.base_url}/v1/images/generations/queryProgress"
        
        request_body = {
            "data": {
                "clientIds": [client_id]
            }
        }
        headers = self._get_headers(request_body)
        
        try:
            response = requests.post(url, headers=headers, json=request_body, timeout=30)
            return response.json()
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def download_image(self, url: str, save_path: str) -> bool:
        """下载图片"""
        try:
            response = requests.get(url, timeout=60)
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        except Exception as e:
            print(f"下载失败: {e}")
            return False
    
    def query_model_detail(self, model_id: str) -> Dict[str, Any]:
        """查询模型详情
        
        Args:
            model_id: 模型唯一代码
            
        Returns:
            模型详细信息，包括封面图、详情图等
        """
        url = f"{self.base_url}/v1/model/apiDetail"
        
        request_body = {
            "data": {
                "id": model_id
            }
        }
        headers = self._get_headers(request_body)
        
        try:
            response = requests.post(url, headers=headers, json=request_body, timeout=30)
            result = response.json()
            print(f"HoloPix API query_model_detail 返回: {result.keys() if isinstance(result, dict) else 'not dict'}")
            return result
        except Exception as e:
            print(f"HoloPix API query_model_detail 错误: {e}")
            return {'success': False, 'error': str(e)}


# 全局客户端实例
holopix_client = HolopixClient()
