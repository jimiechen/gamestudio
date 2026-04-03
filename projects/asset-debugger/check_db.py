#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查数据库表结构
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.database import db

def check_database():
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        # 查看所有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print("数据库表列表:")
        for table in tables:
            print(f"  - {table}")
        
        print("\n" + "="*50)
        
        # 查看模型详情缓存表结构
        if 'model_details_cache' in tables:
            print("\nmodel_details_cache 表结构:")
            cursor.execute("PRAGMA table_info(model_details_cache)")
            for row in cursor.fetchall():
                print(f"  {row[1]} ({row[2]})")
            
            # 查看缓存数据
            cursor.execute("SELECT COUNT(*) FROM model_details_cache")
            count = cursor.fetchone()[0]
            print(f"\n缓存记录数: {count}")
            
            if count > 0:
                cursor.execute("SELECT model_id, model_name, cached_at FROM model_details_cache")
                print("\n缓存的模型:")
                for row in cursor.fetchall():
                    print(f"  - {row[0]}: {row[1]} (缓存时间: {row[2]})")
        else:
            print("\n❌ model_details_cache 表不存在!")
        
        print("\n" + "="*50)
        
        # 查看 models 表
        if 'models' in tables:
            cursor.execute("SELECT COUNT(*) FROM models")
            count = cursor.fetchone()[0]
            print(f"\nmodels 表记录数: {count}")

if __name__ == "__main__":
    check_database()
