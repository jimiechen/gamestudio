#!/usr/bin/env python3
import sys
sys.path.insert(0, '.')
from server.models import Asset, GenerationRecord

# 获取所有素材
assets = Asset.get_all()
print('=== 素材和任务关联检查 ===\n')

for asset in assets:
    record_id = asset.get('record_id')
    print(f"素材: {asset['filename']}")
    print(f"  record_id: {record_id}")
    
    if record_id:
        record = GenerationRecord.get_by_id(record_id)
        if record:
            print(f"  ✅ 找到任务记录")
            print(f"     提示词: {record.get('prompt', '-')[:50]}...")
            print(f"     模型ID: {record.get('model_id', '-')}")
        else:
            print(f"  ❌ 未找到任务记录 (ID: {record_id})")
    else:
        print(f"  ❌ 无 record_id")
    print()
