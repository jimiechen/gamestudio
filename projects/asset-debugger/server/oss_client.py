# -*- coding: utf-8 -*-
"""
阿里云 OSS 客户端
用于图生视频素材中转存储
"""

import os
import uuid
import oss2
from datetime import datetime
from config import (
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
    OSS_BUCKET_NAME,
    OSS_ENDPOINT
)


class OSSClient:
    """阿里云 OSS 客户端"""

    def __init__(self):
        self.auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
        self.bucket = oss2.Bucket(self.auth, OSS_ENDPOINT, OSS_BUCKET_NAME)

    def upload_file(self, local_path: str, object_key: str = None) -> dict:
        """
        上传文件到 OSS

        Args:
            local_path: 本地文件路径
            object_key: OSS 对象键，不传则自动生成

        Returns:
            {'success': bool, 'oss_url': str, 'object_key': str}
        """
        if not object_key:
            ext = os.path.splitext(local_path)[1]
            timestamp = datetime.now().strftime('%Y%m%d/%H%M%S')
            random_id = uuid.uuid4().hex[:8]
            object_key = f'holopix-videos/{timestamp}_{random_id}{ext}'

        try:
            with open(local_path, 'rb') as f:
                result = self.bucket.put_object(object_key, f)

            if result.status == 200:
                endpoint_clean = OSS_ENDPOINT.replace('https://', '').replace('http://', '')
                oss_url = f'https://{OSS_BUCKET_NAME}.{endpoint_clean}/{object_key}'
                return {
                    'success': True,
                    'oss_url': oss_url,
                    'object_key': object_key
                }
            else:
                return {'success': False, 'error': f'Upload failed: {result.status}'}

        except Exception as e:
            print(f"[OSS] 上传文件失败: {e}")
            return {'success': False, 'error': str(e)}

    def upload_from_bytes(self, file_data: bytes, filename: str, object_key: str = None) -> dict:
        """
        从字节数据上传到 OSS

        Args:
            file_data: 文件字节数据
            filename: 原始文件名
            object_key: OSS 对象键

        Returns:
            {'success': bool, 'oss_url': str, 'object_key': str}
        """
        if not object_key:
            ext = os.path.splitext(filename)[1]
            timestamp = datetime.now().strftime('%Y%m%d/%H%M%S')
            random_id = uuid.uuid4().hex[:8]
            object_key = f'holopix-videos/{timestamp}_{random_id}{ext}'

        try:
            result = self.bucket.put_object(object_key, file_data)

            if result.status == 200:
                endpoint_clean = OSS_ENDPOINT.replace('https://', '').replace('http://', '')
                oss_url = f'https://{OSS_BUCKET_NAME}.{endpoint_clean}/{object_key}'
                return {
                    'success': True,
                    'oss_url': oss_url,
                    'object_key': object_key
                }
            else:
                return {'success': False, 'error': f'Upload failed: {result.status}'}

        except Exception as e:
            print(f"[OSS] 上传字节数据失败: {e}")
            return {'success': False, 'error': str(e)}

    def delete_file(self, object_key: str) -> bool:
        """
        删除 OSS 上的文件

        Args:
            object_key: OSS 对象键

        Returns:
            是否删除成功
        """
        try:
            result = self.bucket.delete_object(object_key)
            return result.status in [204, 200]
        except Exception as e:
            print(f"[OSS] 删除文件失败: {e}")
            return False


# 全局实例
oss_client = OSSClient()
