# -*- coding: utf-8 -*-
"""
数据库连接管理
"""

import sqlite3
import json
from datetime import datetime
from config import DATABASE_PATH


class Database:
    """数据库连接类"""
    
    def __init__(self):
        self.db_path = DATABASE_PATH
        self._init_database()
    
    def _init_database(self):
        """初始化数据库表"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 模型表 (model_id 改为 TEXT 类型，因为 API 返回字符串 ID)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS models (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_id TEXT UNIQUE NOT NULL,
                    model_name TEXT NOT NULL,
                    model_type TEXT,
                    style_type TEXT,
                    model_tags TEXT,
                    introduction TEXT,
                    base_model TEXT,
                    cover_image TEXT,
                    commercial_license TEXT,
                    is_available BOOLEAN DEFAULT 1,
                    is_pinned BOOLEAN DEFAULT 0,
                    pinned_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 生成记录表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS generation_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id TEXT UNIQUE,
                    prompt TEXT NOT NULL,
                    negative_prompt TEXT,
                    model_id INTEGER,
                    model_strength REAL DEFAULT 0.9,
                    aspect_ratios TEXT DEFAULT '1:1',
                    seed INTEGER DEFAULT -1,
                    hd_fix BOOLEAN DEFAULT 0,
                    hd_scale REAL,
                    face_detail BOOLEAN DEFAULT 0,
                    batch_size INTEGER DEFAULT 1,
                    enable_perturb BOOLEAN DEFAULT 0,
                    perturb REAL,
                    simple_background BOOLEAN DEFAULT 0,
                    status TEXT DEFAULT 'pending',
                    status_msg TEXT,
                    request_body TEXT,
                    response_body TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (model_id) REFERENCES models(model_id)
                )
            ''')
            
            # 素材表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS assets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    record_id INTEGER,
                    filename TEXT NOT NULL,
                    original_url TEXT,
                    local_path TEXT,
                    file_size INTEGER,
                    width INTEGER,
                    height INTEGER,
                    asset_type TEXT DEFAULT 'character',
                    tags TEXT,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (record_id) REFERENCES generation_records(id)
                )
            ''')
            
            # 预设提示词表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prompt_presets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    category TEXT DEFAULT 'character',
                    prompt_template TEXT NOT NULL,
                    negative_prompt TEXT,
                    default_params TEXT,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 模型详情缓存表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS model_details_cache (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_id TEXT UNIQUE NOT NULL,
                    model_name TEXT,
                    model_tags TEXT,
                    introduction TEXT,
                    model_type TEXT,
                    style_type TEXT,
                    base_model TEXT,
                    cover_image TEXT,
                    model_details_images TEXT,
                    commercial_license TEXT,
                    model_available BOOLEAN DEFAULT 1,
                    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (model_id) REFERENCES models(model_id)
                )
            ''')

            # 火柴人姿势表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS stickman_poses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    action_type TEXT DEFAULT 'custom',
                    joints TEXT NOT NULL,
                    connections TEXT,
                    thumbnail_path TEXT,
                    description TEXT,
                    is_preset BOOLEAN DEFAULT 0,
                    is_favorite BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # 快捷应用配置表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS quick_presets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    model_list TEXT NOT NULL,           -- JSON数组: [{"modelId": 123, "strength": 0.9}]
                    prompt TEXT,
                    negative_prompt TEXT,
                    aspect_ratios TEXT DEFAULT '1:1',
                    seed INTEGER DEFAULT -1,
                    image_guidance_weights INTEGER DEFAULT 6,
                    face_detail BOOLEAN DEFAULT 0,
                    hd_fix BOOLEAN DEFAULT 0,
                    hd_scale REAL DEFAULT 1.5,
                    simple_background BOOLEAN DEFAULT 0,
                    enable_perturb BOOLEAN DEFAULT 0,
                    perturb REAL DEFAULT 5,
                    image_reference TEXT,
                    reference_mode TEXT,
                    reference_weight REAL DEFAULT 0.8,
                    character_pose TEXT,
                    batch_size INTEGER DEFAULT 1,
                    is_favorite BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # 数据库迁移：添加缺失的字段
            self._migrate_database(cursor)
            
            conn.commit()
    
    def _migrate_database(self, cursor):
        """数据库迁移：添加缺失的字段"""
        # 检查 models 表是否有 is_pinned 字段
        cursor.execute("PRAGMA table_info(models)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'is_pinned' not in columns:
            print("[Migration] 添加 is_pinned 字段到 models 表")
            cursor.execute('ALTER TABLE models ADD COLUMN is_pinned BOOLEAN DEFAULT 0')
        
        if 'pinned_at' not in columns:
            print("[Migration] 添加 pinned_at 字段到 models 表")
            cursor.execute('ALTER TABLE models ADD COLUMN pinned_at TIMESTAMP')
        
        if 'is_hidden' not in columns:
            print("[Migration] 添加 is_hidden 字段到 models 表")
            cursor.execute('ALTER TABLE models ADD COLUMN is_hidden BOOLEAN DEFAULT 0')
        
        if 'hidden_at' not in columns:
            print("[Migration] 添加 hidden_at 字段到 models 表")
            cursor.execute('ALTER TABLE models ADD COLUMN hidden_at TIMESTAMP')
    
    def get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn


# 全局数据库实例
db = Database()
