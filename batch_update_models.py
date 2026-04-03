#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新模型数据
读取所有模型的详情并填充基础字段
"""

import sys
import os
import time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.database import db
from server.holopix_client import holopix_client


def batch_update_models():
    """批量更新所有模型的详情"""
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        # 获取所有模型ID
        cursor.execute('SELECT model_id FROM models')
        model_ids = [row[0] for row in cursor.fetchall()]
        
    print(f"共有 {len(model_ids)} 个模型需要更新")
    print("=" * 60)
    
    updated = 0
    failed = 0
    
    for i, model_id in enumerate(model_ids, 1):
        print(f"\n[{i}/{len(model_ids)}] 更新模型: {model_id}")
        
        try:
            # 查询模型详情
            result = holopix_client.query_model_detail(model_id)
            
            if result.get('success'):
                data = result.get('data', {})
                
                # 提取字段
                model_type = data.get('modelType') or data.get('ModelType')
                style_type = data.get('styleType') or data.get('StyleType')
                base_model = data.get('baseModel') or data.get('BaseModel')
                model_tags = data.get('modelTags') or data.get('ModelTags')
                
                print(f"  模型类型: {model_type}")
                print(f"  风格类型: {style_type}")
                print(f"  基础模型: {base_model}")
                print(f"  标签: {model_tags}")
                
                # 更新数据库
                with db.get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE models 
                        SET model_type = ?, style_type = ?, base_model = ?, model_tags = ?
                        WHERE model_id = ?
                    ''', (model_type, style_type, base_model, model_tags, model_id))
                    conn.commit()
                
                updated += 1
            else:
                print(f"  ❌ 查询失败: {result.get('msg', '未知错误')}")
                failed += 1
                
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            failed += 1
        
        # 每10个模型暂停1秒，避免API限流
        if i % 10 == 0:
            print(f"\n⏳ 已处理 {i} 个模型，暂停1秒...")
            time.sleep(1)
    
    print("\n" + "=" * 60)
    print(f"更新完成: 成功 {updated} 个, 失败 {failed} 个")


if __name__ == "__main__":
    batch_update_models()
