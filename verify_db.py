#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证数据库中的任务和素材关联"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.database import db
from server.models import GenerationRecord, Asset

print('=' * 60)
print('生成任务记录 (最近5条)')
print('=' * 60)
records = GenerationRecord.get_all()
for r in records[-5:]:
    print(f"ID: {r['id']}, ClientID: {r['client_id'][:30]}..., 模型: {r['model_id']}, 状态: {r['status']}")
    print(f"   提示词: {r['prompt'][:40]}...")

print()
print('=' * 60)
print('素材记录 (最近5条)')
print('=' * 60)
assets = Asset.get_all()
for a in assets[-5:]:
    print(f"ID: {a['id']}, 记录ID: {a['record_id']}, 文件名: {a['filename']}")

print()
print('=' * 60)
print('关联验证')
print('=' * 60)
for r in records[-5:]:
    related_assets = [a for a in assets if a['record_id'] == r['id']]
    print(f"记录 {r['id']} ({r['model_id']}) -> {len(related_assets)} 个素材")
    for a in related_assets:
        print(f"   - {a['filename']}")

print()
print('=' * 60)
print('参数对比验证 (记录ID=2 关羽)')
print('=' * 60)
import json
record = GenerationRecord.get_by_id(2)
if record:
    print(f"原始参数:")
    print(f"  model_id: {record['model_id']}")
    print(f"  model_strength: {record['model_strength']}")
    print(f"  aspect_ratios: {record['aspect_ratios']}")
    print(f"  face_detail: {record['face_detail']}")
    
    # 检查general_info中的元数据
    general_info = record.get('general_info')
    if general_info:
        try:
            metadata = json.loads(general_info)
            print(f"  元数据: {metadata}")
        except:
            pass

print()
print('✅ 验证完成!')
