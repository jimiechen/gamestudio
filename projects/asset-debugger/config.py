# -*- coding: utf-8 -*-
"""
配置文件
"""

import os

# 数据库配置
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database', 'asset_debugger.db')

# HoloPix API配置
HOLOPIX_BASE_URL = "https://api.holopix.cn"
HOLOPIX_ACCESS_KEY = "2038883531596804096"
HOLOPIX_SECRET_KEY = "HjFMvWJaYfYpPJqb4txKqjcrCOd7UX3LnAS80Ul/678="

# Flask配置
SECRET_KEY = "your-secret-key-here-change-in-production"
DEBUG = True
PORT = 5000
HOST = "0.0.0.0"

# 上传文件配置
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'server', 'static', 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# 确保上传目录存在
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

# ==================== 阿里云百炼配置（图生视频）====================
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", "sk-your-bailian-api-key-here")
DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/api/v1"

# ==================== 阿里云 OSS 配置（素材中转）====================
OSS_ACCESS_KEY_ID = os.getenv("OSS_ACCESS_KEY_ID", "your-access-key-id")
OSS_ACCESS_KEY_SECRET = os.getenv("OSS_ACCESS_KEY_SECRET", "your-access-key-secret")
OSS_BUCKET_NAME = os.getenv("OSS_BUCKET_NAME", "your-bucket-name")
OSS_ENDPOINT = os.getenv("OSS_ENDPOINT", "https://oss-cn-beijing.aliyuncs.com")

# 视频输出目录
VIDEO_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'videos')
os.makedirs(VIDEO_UPLOAD_FOLDER, exist_ok=True)
