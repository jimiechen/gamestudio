#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
启动脚本
"""

import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.app import app
from config import HOST, PORT, DEBUG

if __name__ == '__main__':
    print(f"🚀 启动 HoloPix 素材调试器...")
    print(f"📍 访问地址: http://{HOST}:{PORT}")
    print(f"🛠️  调试模式: {DEBUG}")
    print()
    
    app.run(host=HOST, port=PORT, debug=DEBUG)
