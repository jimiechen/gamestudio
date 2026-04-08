import subprocess
import json
from pathlib import Path
from typing import Optional

class LarkUploader:
    def __init__(self, app_id: Optional[str] = None, app_secret: Optional[str] = None):
        self.app_id = app_id
        self.app_secret = app_secret
        self._check_cli()
    
    def _check_cli(self):
        """检查 lark-cli 安装"""
        try:
            subprocess.run(["lark-cli", "--version"], check=True, capture_output=True)
        except FileNotFoundError:
            raise RuntimeError("lark-cli 未安装，请运行: npm install -g @larksuite/cli")
    
    def upload_to_drive(self, file_path: str, folder_token: str) -> str:
        """
        上传 Sprite Sheet 到飞书云空间
        """
        cmd = [
            "lark-cli", "drive", "+files-upload",
            "--file-path", file_path,
            "--parent-folder-token", folder_token,
            "--output", "json"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"上传失败: {result.stderr}")
        
        output = json.loads(result.stdout)
        return output["data"]["file_token"]
    
    def create_bitable_record(
        self, 
        app_token: str,
        table_id: str,
        character_name: str,
        sprite_sheet_token: str,
        animation_type: str,
        metadata: dict
    ) -> str:
        """
        在多维表格中记录动画资源
        """
        fields = {
            "角色名称": character_name,
            "动画类型": animation_type,
            "SpriteSheet": [{"file_token": sprite_sheet_token}],
            "帧数": metadata["total_frames"],
            "帧尺寸": f"{metadata['frame_size']['w']}x{metadata['frame_size']['h']}",
            "元数据": json.dumps(metadata, ensure_ascii=False)
        }
        
        cmd = [
            "lark-cli", "base", "+records-create",
            "--app-token", app_token,
            "--table-id", table_id,
            "--fields", json.dumps(fields),
            "--output", "json"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        output = json.loads(result.stdout)
        return output["data"]["record_id"]
    
    def send_notification(self, chat_id: str, message: str):
        """发送完成通知到飞书群"""
        cmd = [
            "lark-cli", "im", "+messages-send",
            "--chat-id", chat_id,
            "--msg-type", "text",
            "--content", json.dumps({"text": message})
        ]
        subprocess.run(cmd, check=True)
    
    def send_card_notification(self, chat_id: str, title: str, content: dict):
        """发送卡片式通知到飞书群"""
        card_content = {
            "config": {
                "wide_screen_mode": True
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "content": f"**{title}**",
                        "tag": "lark_md"
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "content": f"角色: **{content['character']}**",
                        "tag": "lark_md"
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "content": f"动作: **{content['action']}**",
                        "tag": "lark_md"
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "content": f"帧数: **{content['total_frames']}**",
                        "tag": "lark_md"
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "content": f"尺寸: **{content['frame_size']['w']}x{content['frame_size']['h']}**",
                        "tag": "lark_md"
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "content": f"记录ID: **{content['record_id']}**",
                        "tag": "lark_md"
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "content": f"生成时间: **{content['timestamp']}**",
                        "tag": "lark_md"
                    }
                }
            ]
        }
        
        if 'sprite_sheet_url' in content:
            card_content['elements'].append({
                "tag": "img",
                "img_key": content['sprite_sheet_url'],
                "alt": {
                    "content": "Sprite Sheet 预览"
                },
                "title": {
                    "content": "Sprite Sheet"
                }
            })
        
        cmd = [
            "lark-cli", "im", "+messages-send",
            "--chat-id", chat_id,
            "--msg-type", "interactive",
            "--content", json.dumps(card_content)
        ]
        subprocess.run(cmd, check=True)