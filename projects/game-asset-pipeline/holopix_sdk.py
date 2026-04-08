import requests
import time
import hashlib
import uuid
from typing import Optional, Dict, List

class HolopixClient:
    def __init__(self, access_key: str, secret_key: str, base_url: str = "https://api.holopix.cn"):
        self.access_key = access_key
        self.secret_key = secret_key
        self.base_url = base_url
    
    def _generate_signature(self, timestamp: str, nonce: str) -> str:
        """生成签名"""
        # 签名规则：将 access_key + secret_key + timestamp + nonce 按顺序拼接后进行 MD5 加密
        sign_str = f"{self.access_key}{self.secret_key}{timestamp}{nonce}"
        return hashlib.md5(sign_str.encode()).hexdigest()
    
    def _get_auth_headers(self) -> Dict:
        """获取认证头"""
        timestamp = str(int(time.time() * 1000))  # 毫秒级时间戳
        nonce = str(uuid.uuid4())  # 32位随机字符串
        signature = self._generate_signature(timestamp, nonce)
        
        return {
            "X-Access-Key": self.access_key,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
            "X-Nonce": nonce,
            "Content-Type": "application/json"
        }
    
    def generate_character(
        self, 
        prompt: str, 
        character_type: str = "五虎将",  # 关羽|张飞|赵云|马超|黄忠
        style_preset: str = "hand_drawn_roguelike",
        width: int = 768,
        height: int = 1024,
        seed: Optional[int] = None
    ) -> Dict:
        """
        生成三国武将角色原画
        """
        payload = {
            "model": "holopix-pro-v2",
            "prompt": self._build_prompt(prompt, character_type),
            "negative_prompt": "3d, realistic, photography, blurry, low quality",
            "width": width,
            "height": height,
            "style_preset": style_preset,
            "parameters": {
                "line_art": "thick_outline",  # 粗线条
                "color_palette": "muted_ancient",  # 古风低饱和
                "render_mode": "cell_shading"  # 赛璐珞渲染
            }
        }
        if seed:
            payload["seed"] = seed
            
        resp = requests.post(
            f"{self.base_url}/images/generations",
            headers=self._get_auth_headers(),
            json=payload,
            timeout=120
        )
        resp.raise_for_status()
        return resp.json()
    
    def _build_prompt(self, desc: str, char_type: str) -> str:
        templates = {
            "关羽": "Guan Yu, long beard, green robe, Azure Dragon Crescent Blade,",
            "张飞": "Zhang Fei, leopard head, fierce eyes, black armor, serpent spear,",
            "赵云": "Zhao Yun, silver armor, white robe, Dragon Spear, handsome,",
            "马超": "Ma Chao, lion helmet, silver armor, golden spear,",
            "黄忠": "Huang Zhong, white beard, gold armor, bow and arrow, veteran,"
        }
        base = templates.get(char_type, "")
        return f"{base} {desc}, chibi style, hand drawn, roguelike game character, thick black outline, flat color, ancient Chinese warrior, dynamic pose, white background, 2d game asset"

    def download_image(self, image_url: str, output_path: str):
        """下载生成的图片"""
        r = requests.get(image_url, stream=True)
        r.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return output_path
    
    def remove_background(
        self,
        image_url: str,
        model: str = "holopix-pro-v2",
        bg_type: str = "transparent"
    ) -> Dict:
        """
        抠图功能
        
        Args:
            image_url: 输入图片URL
            model: 使用的模型
            bg_type: 背景类型，可选值：transparent（透明）、white（白色）、black（黑色）
        
        Returns:
            包含抠图结果的字典
        """
        payload = {
            "model": model,
            "input": {
                "image_url": image_url
            },
            "parameters": {
                "bg_type": bg_type,
                "mode": "remove_background"
            }
        }
        
        resp = requests.post(
            f"{self.base_url}/images/process",
            headers=self._get_auth_headers(),
            json=payload,
            timeout=120
        )
        resp.raise_for_status()
        return resp.json()
    
    def image_variations(
        self,
        image_url: str,
        prompt: str = "",
        num_variations: int = 4,
        model: str = "holopix-pro-v2"
    ) -> Dict:
        """
        相似图裂变功能
        
        Args:
            image_url: 输入图片URL
            prompt: 提示词（可选）
            num_variations: 生成的变体数量
            model: 使用的模型
        
        Returns:
            包含裂变结果的字典
        """
        payload = {
            "model": model,
            "input": {
                "image_url": image_url
            },
            "parameters": {
                "prompt": prompt,
                "num_variations": num_variations,
                "mode": "image_variations"
            }
        }
        
        resp = requests.post(
            f"{self.base_url}/images/variations",
            headers=self._get_auth_headers(),
            json=payload,
            timeout=120
        )
        resp.raise_for_status()
        return resp.json()