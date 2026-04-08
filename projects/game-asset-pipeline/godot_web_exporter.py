#!/usr/bin/env python3
import json
import shutil
import zipfile
from pathlib import Path
from typing import Dict, Any

class GodotWebExporter:
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.web_dir = self.output_dir / "web"
        self.godot_dir = self.output_dir / "godot"
    
    def export_to_web(self, metadata_path: str) -> Dict[str, Any]:
        """
        导出为Web可用的Godot项目包
        """
        metadata_path = Path(metadata_path)
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        sprite_sheet_path = Path(metadata["sprite_sheet"])
        
        # 确保目录存在
        self.web_dir.mkdir(parents=True, exist_ok=True)
        
        # 复制Godot资源
        if self.godot_dir.exists():
            for file in self.godot_dir.iterdir():
                if file.is_file():
                    shutil.copy(file, self.web_dir / file.name)
        else:
            # 如果godot目录不存在，从原始资源创建
            from godot_exporter import GodotExporter
            godot_exporter = GodotExporter(str(self.output_dir))
            godot_exporter.export_to_godot(metadata_path)
            for file in self.godot_dir.iterdir():
                if file.is_file():
                    shutil.copy(file, self.web_dir / file.name)
        
        # 生成Web测试页面
        self._generate_web_test_page(metadata)
        
        # 生成服务器配置
        self._generate_server_config()
        
        # 创建部署包
        deployment_zip = self._create_deployment_zip()
        
        return {
            "web_dir": str(self.web_dir),
            "deployment_zip": str(deployment_zip),
            "sprite_sheet": sprite_sheet_path.name,
            "total_frames": metadata["total_frames"]
        }
    
    def _generate_web_test_page(self, metadata: Dict):
        """
        生成Web测试页面
        """
        # 确保web目录存在
        self.web_dir.mkdir(parents=True, exist_ok=True)
        
        character = metadata.get('character', '未知')
        action = metadata.get('action', '未知')
        total_frames = metadata.get('total_frames', 0)
        frame_width = metadata.get('frame_size', {}).get('w', 0)
        frame_height = metadata.get('frame_size', {}).get('h', 0)
        
        html_content = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Godot 动画测试 - {character} - {action}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #333;
            text-align: center;
        }}
        .info {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }}
        .info p {{
            margin: 5px 0;
        }}
        .godot-container {{
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            margin: 20px 0;
        }}
        canvas {{
            display: block;
            margin: 0 auto;
        }}
        .controls {{
            margin: 20px 0;
            text-align: center;
        }}
        button {{
            padding: 10px 20px;
            margin: 0 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background: #007bff;
            color: white;
        }}
        button:hover {{
            background: #0069d9;
        }}
        .status {{
            margin-top: 20px;
            padding: 10px;
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 动画测试页面</h1>
        
        <div class="info">
            <p><strong>角色:</strong> {character}</p>
            <p><strong>动作:</strong> {action}</p>
            <p><strong>帧数:</strong> {total_frames}</p>
            <p><strong>帧尺寸:</strong> {frame_width}x{frame_height}</p>
        </div>
        
        <div class="godot-container">
            <!-- Godot 游戏将在这里加载 -->
            <canvas id="game_canvas"></canvas>
        </div>
        
        <div class="controls">
            <button onclick="playAnimation()">▶ 播放</button>
            <button onclick="pauseAnimation()">⏸ 暂停</button>
            <button onclick="stopAnimation()">⏹ 停止</button>
        </div>
        
        <div class="status">
            <p>状态: 就绪</p>
            <p>使用说明: 点击上方按钮控制动画，可通过键盘方向键移动角色</p>
        </div>
    </div>
    
    <script>
        // 模拟Godot游戏加载
        function playAnimation() {{
            document.querySelector('.status p:first-child').textContent = '状态: 播放中';
        }}
        
        function pauseAnimation() {{
            document.querySelector('.status p:first-child').textContent = '状态: 暂停';
        }}
        
        function stopAnimation() {{
            document.querySelector('.status p:first-child').textContent = '状态: 已停止';
        }}
        
        // 实际项目中，这里会加载Godot导出的WebAssembly
        window.onload = function() {{
            console.log('Godot Web测试页面加载完成');
        }};
    </script>
</body>
</html>
        """
        
        with open(self.web_dir / "index.html", 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    def _generate_server_config(self):
        """
        生成服务器配置文件
        """
        # 确保web目录存在
        self.web_dir.mkdir(parents=True, exist_ok=True)
        
        # Nginx配置
        nginx_config = """
server {
    listen 80;
    server_name godot-test.example.com;
    
    root /var/www/godot-test;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 配置CORS
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
}
        """
        
        with open(self.web_dir / "nginx.conf", 'w', encoding='utf-8') as f:
            f.write(nginx_config)
        
        # Docker配置
        docker_compose = """
version: '3'
services:
  godot-web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    restart: always
        """
        
        with open(self.web_dir / "docker-compose.yml", 'w', encoding='utf-8') as f:
            f.write(docker_compose)
    
    def _create_deployment_zip(self) -> Path:
        """
        创建部署压缩包
        """
        # 确保web目录存在
        self.web_dir.mkdir(parents=True, exist_ok=True)
        
        zip_path = self.output_dir / f"godot-web-deployment-{self.output_dir.name}.zip"
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in self.web_dir.iterdir():
                if file.is_file():
                    arcname = f"godot-web/{file.name}"
                    zipf.write(file, arcname)
        
        return zip_path

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python godot_web_exporter.py <metadata.json路径>")
        sys.exit(1)
    
    metadata_path = sys.argv[1]
    output_dir = Path(metadata_path).parent.parent
    
    exporter = GodotWebExporter(str(output_dir))
    result = exporter.export_to_web(metadata_path)
    
    print(f"✅ Web部署包已生成到: {result['web_dir']}")
    print(f"📦 部署压缩包: {result['deployment_zip']}")
    print(f"📊 共 {result['total_frames']} 帧")
    print("\n部署步骤:")
    print("1. 上传部署压缩包到服务器")
    print("2. 解压到网站根目录")
    print("3. 运行: docker-compose up -d")
    print("4. 访问: http://服务器IP")
