#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HoloPix API Client (Python版)
用于生成Q版游戏美术资源
"""

import hmac
import hashlib
import base64
import json
import time
import random
import string
import requests
import os
from pathlib import Path
from typing import Dict, Any, Optional, List


class HolopixClient:
    """HoloPix API 客户端"""
    
    def __init__(self, access_key: str = None, secret_key: str = None, base_url: str = None):
        self.access_key = access_key or "2038883531596804096"
        self.secret_key = secret_key or "HjFMvWJaYfYpPJqb4txKqjcrCOd7UX3LnAS80Ul/678="
        self.base_url = base_url or "https://api.holopix.cn"
    
    def _generate_nonce(self, length: int = 16) -> str:
        """生成随机 nonce"""
        chars = string.ascii_letters + string.digits
        return ''.join(random.choice(chars) for _ in range(length))
    
    def _generate_signature(self, timestamp: str, params: Dict[str, Any]) -> str:
        """
        生成 HMAC-SHA256 签名
        格式: timestamp= + json_body，然后 hexdigest
        """
        # 将字典转换为紧凑格式的JSON字符串
        json_str = json.dumps(
            params,
            separators=(',', ':'),
            ensure_ascii=False  # 保持中文不转义
        )
        
        # 签名字符串格式：timestamp= + json_body
        string_to_sign = f"{timestamp}={json_str}"
        
        print(f"待签名字符串: {string_to_sign[:100]}...")
        
        # 生成HMAC-SHA256签名
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        print(f"生成签名: {signature}")
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
    
    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        生成图片
        
        Args:
            prompt: 提示词
            aspect_ratios: 宽高比，默认 "1:1"
            seed: 随机种子，默认 -1
            hd_fix: 是否开启高清修复，默认 True
            hd_scale: 高清缩放倍数，默认 2
            face_detail: 是否开启面部细节，默认 True
            
        Returns:
            包含 task_id 的字典
        """
        # 构造请求参数 (data 字段内的内容)
        # modelDetailList 是必填参数！
        model_detail_list = kwargs.get('model_detail_list', [
            {
                "modelId": "23MM6QW9GA",  # 默认模型ID（Holopix-V1 Q版风格）
                "strength": 0.9
            }
        ])
        
        data_params = {
            "modelDetailList": model_detail_list,
            "prompt": prompt,
            "seed": kwargs.get('seed', -1),
        }
        
        # 添加可选参数
        # Note: Holopix-V1 模型不支持 negativePrompt
        if 'aspect_ratios' in kwargs:
            data_params['aspectRatios'] = kwargs['aspect_ratios']
        
        # hdFix 和 hdScale 必须同时设置
        hd_fix = kwargs.get('hd_fix', False)
        if hd_fix:
            data_params['hdFix'] = True
            data_params['hdScale'] = kwargs.get('hd_scale', 2)
        
        if 'face_detail' in kwargs:
            data_params['faceDetail'] = kwargs['face_detail']
        if 'batch_size' in kwargs:
            data_params['batchSize'] = kwargs['batch_size']
        if 'character_pose' in kwargs:
            data_params['characterPose'] = kwargs['character_pose']
        if 'image_reference' in kwargs:
            data_params['imageReference'] = kwargs['image_reference']
        if 'reference_mode' in kwargs:
            data_params['referenceMode'] = kwargs['reference_mode']
        if 'reference_weight' in kwargs:
            data_params['referenceWeight'] = kwargs['reference_weight']
        
        # 请求体包含 data 字段
        request_body = {"data": data_params}
        
        # 签名使用整个请求体（包含 data 字段）
        headers = self._get_headers(request_body)
        
        url = f"{self.base_url}/v1/images/generations/t2i"
        
        print(f"\n请求URL: {url}")
        print(f"请求头: {json.dumps(headers, indent=2)}")
        print(f"请求体: {json.dumps(request_body, indent=2, ensure_ascii=False)}")
        
        try:
            response = requests.post(
                url,
                headers=headers,
                json=request_body,
                timeout=120
            )
            
            result = response.json()
            print(f"\n响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            if result.get('success'):
                data = result.get('data', {})
                # API 返回 clientId 而不是 task_id
                task_id = data.get('task_id') or data.get('clientId')
                return {
                    'success': True,
                    'task_id': task_id,
                    'status': data.get('status', 'pending'),
                    'message': result.get('msg'),
                    'prompt': prompt,  # 返回提示词以便保存
                    'request_body': request_body  # 返回请求体以便保存API参数
                }
            else:
                return {
                    'success': False,
                    'error': result.get('msg'),
                    'code': result.get('code')
                }
                
        except Exception as e:
            print(f"请求失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_status(self, client_id: str) -> Dict[str, Any]:
        """
        查询任务状态
        正确端点: POST /v1/images/generations/queryProgress
        """
        # 请求体包含 clientIds 列表
        request_body = {
            "data": {
                "clientIds": [client_id]
            }
        }
        
        # 签名使用整个请求体
        headers = self._get_headers(request_body)
        
        url = f"{self.base_url}/v1/images/generations/queryProgress"
        
        try:
            response = requests.post(
                url,
                headers=headers,
                json=request_body,
                timeout=30
            )
            
            result = response.json()
            
            if result.get('success'):
                data = result.get('data', {})
                client_list = data.get('clientList', [])
                
                if not client_list:
                    return {
                        'success': False,
                        'error': '未找到任务信息'
                    }
                
                # 获取第一个任务的状态
                task_info = client_list[0]
                return {
                    'success': True,
                    'client_id': task_info.get('clientId'),
                    'status': task_info.get('status'),  # submitted, processing, succeed, failed
                    'images': task_info.get('imgUrls', []),
                    'message': task_info.get('statusMsg'),
                    'created_time': task_info.get('createdTime'),
                    'content': task_info.get('content')
                }
            else:
                return {
                    'success': False,
                    'error': result.get('msg'),
                    'code': result.get('code')
                }
                
        except Exception as e:
            print(f"查询状态失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def download_image(self, url: str, output_path: str) -> bool:
        """下载图片"""
        try:
            response = requests.get(url, timeout=60)
            
            # 确保目录存在
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            # 保存图片
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ 已保存: {output_path}")
            return True
            
        except Exception as e:
            print(f"下载失败: {url}, 错误: {e}")
            return False
    
    def save_api_params(self, prompt: str, request_body: dict, output_dir: str, filename: str) -> bool:
        """保存API调用参数到文件"""
        try:
            # 确保目录存在
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            
            # 保存完整的API参数
            output_path = os.path.join(output_dir, f"{filename}_params.json")
            
            # 提取data中的参数
            data_params = request_body.get('data', {})
            
            api_params = {
                "prompt": prompt,
                "modelDetailList": data_params.get('modelDetailList', []),
                "aspectRatios": data_params.get('aspectRatios', '1:1'),
                "seed": data_params.get('seed', -1),
                "hdFix": data_params.get('hdFix', False),
                "hdScale": data_params.get('hdScale'),
                "faceDetail": data_params.get('faceDetail', False),
                "negativePrompt": data_params.get('negativePrompt', ''),
                "batchSize": data_params.get('batchSize', 1),
                "enablePerturb": data_params.get('enablePerturb', False),
                "perturb": data_params.get('perturb'),
                "simpleBackground": data_params.get('simpleBackground', False),
                "characterPose": data_params.get('characterPose'),
                "imageReference": data_params.get('imageReference'),
                "referenceMode": data_params.get('referenceMode'),
                "referenceWeight": data_params.get('referenceWeight'),
            }
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(api_params, f, indent=2, ensure_ascii=False)
            
            print(f"✓ 已保存API参数: {output_path}")
            return True
            
        except Exception as e:
            print(f"保存API参数失败: {e}")
            return False
    
    def wait_and_download(self, client_id: str, output_dir: str, filename: str, prompt: str = None, request_body: dict = None) -> Dict[str, Any]:
        """等待任务完成并下载图片"""
        if not client_id:
            return {'success': False, 'error': '无效的任务ID'}
        
        print(f"\n等待任务完成: {client_id}")
        
        # 保存API参数
        if prompt and request_body:
            self.save_api_params(prompt, request_body, output_dir, filename)
        
        max_attempts = 60  # 最多等待10分钟
        
        for attempt in range(max_attempts):
            status = self.get_status(client_id)
            
            if not status.get('success'):
                return {'success': False, 'error': status.get('error')}
            
            current_status = status.get('status')
            
            if current_status == 'succeed':
                print('\n✓ 任务完成，开始下载...')
                
                results = []
                images = status.get('images', [])
                
                for i, img_url in enumerate(images):
                    ext = '.png'
                    output_path = os.path.join(output_dir, f"{filename}_{i+1}{ext}")
                    
                    if self.download_image(img_url, output_path):
                        results.append(output_path)
                
                return {
                    'success': True,
                    'files': results
                }
            
            if current_status == 'failed':
                return {'success': False, 'error': f"任务失败: {status.get('message')}"}
            
            # 等待10秒
            time.sleep(10)
            print('.', end='', flush=True)
        
        return {'success': False, 'error': '等待超时'}


class ChibiCharacterGenerator:
    """Q版武将生成器"""
    
    def __init__(self, client: HolopixClient):
        self.client = client
    
    def generate(self, name: str, description: str, **kwargs) -> Dict[str, Any]:
        """
        生成Q版武将
        
        Args:
            name: 武将名称
            description: 武将描述
            weapon: 武器
            armor: 盔甲
            head_body_ratio: 头身比，默认 2.5
            output_path: 输出路径
        """
        head_body_ratio = kwargs.get('head_body_ratio', 2.5)
        weapon = kwargs.get('weapon', '')
        armor = kwargs.get('armor', '')
        
        # 构建中文提示词（效果更好）
        prompt = (
            f"Q版{name}，{description}，{head_body_ratio}头身比，大头小身体，"
            f"{weapon}，{armor}，可爱卡通风格，明亮色彩，干净线条，"
            f"透明背景，游戏角色，手游优化，高质量，精致面部，生动表情"
        )
        
        print(f"\n生成Q版武将: {name}")
        print(f"提示词: {prompt[:80]}...")
        
        # Note: Holopix-V1 模型不支持 negativePrompt 和 hd_fix
        result = self.client.generate(
            prompt=prompt,
            aspect_ratios='1:1',
            hd_fix=False,
            face_detail=True
        )
        
        if not result.get('success'):
            return result
        
        # 等待并下载
        output_dir = kwargs.get('output_path', 'assets/characters')
        filename = name.lower().replace(' ', '_')
        
        # 传递提示词和请求体以便保存
        return self.client.wait_and_download(
            result['task_id'], 
            output_dir, 
            filename,
            prompt=result.get('prompt'),
            request_body=result.get('request_body')
        )


class EmoticonGenerator:
    """表情包生成器"""
    
    def __init__(self, client: HolopixClient):
        self.client = client
    
    def generate(self, name: str, description: str, **kwargs) -> Dict[str, Any]:
        """生成表情包"""
        expressions = kwargs.get('expressions', ['happy', 'angry', 'cool', 'surprised'])
        results = []
        
        expression_map = {
            'happy': 'joyful smiling expression, happy face',
            'angry': 'furious angry expression, rage face with flames',
            'cool': 'confident cool expression, sunglasses pose',
            'surprised': 'shocked surprised expression, wide eyes',
            'sad': 'crying sad expression, tears',
            'love': 'heart eyes, blushing, in love expression'
        }
        
        for expression in expressions:
            expr_desc = expression_map.get(expression, expression)
            
            prompt = (
                f"chibi style {name} emoticon sticker, {description}, "
                f"{expr_desc}, big head small body, cute kawaii style, "
                f"square format, transparent background, "
                f"suitable for messaging apps, clear and recognizable"
            )
            
            print(f"\n生成表情包: {name} - {expression}")
            
            result = self.client.generate(
                prompt=prompt,
                aspect_ratios='1:1',
                hd_fix=False,
                face_detail=True
            )
            
            if result.get('success'):
                output_dir = kwargs.get('output_path', 'assets/emoticons')
                filename = f"{name.lower().replace(' ', '_')}_{expression}"
                
                download_result = self.client.wait_and_download(
                    result['task_id'],
                    output_dir,
                    filename
                )
                
                if download_result.get('success'):
                    results.append({
                        'expression': expression,
                        'files': download_result['files']
                    })
            
            # 间隔10秒避免限流
            time.sleep(10)
        
        return {
            'success': len(results) > 0,
            'emoticons': results
        }


# 导出
__all__ = ['HolopixClient', 'ChibiCharacterGenerator', 'EmoticonGenerator']


if __name__ == "__main__":
    # 测试代码
    print("🧪 测试 HoloPix API Client\n")
    
    client = HolopixClient()
    
    # 测试生成
    result = client.generate(
        prompt="chibi style Guan Yu from Three Kingdoms, green robe, long beard, big head small body, cute",
        aspect_ratios="1:1",
        hd_fix=True,
        face_detail=True
    )
    
    if result.get('success'):
        print(f"\n✅ 任务创建成功: {result['task_id']}")
    else:
        print(f"\n❌ 失败: {result.get('error')}")
