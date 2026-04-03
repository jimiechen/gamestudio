#!/usr/bin/env python3
"""测试 API"""
import sys
sys.path.insert(0, '.')
from server.models import GenerationRecord

# 测试获取记录
record = GenerationRecord.get_by_id(8)
if record:
    print(f"找到记录 ID: 8")
    print(f"  prompt: {record.get('prompt', '-')[:50]}...")
    print(f"  model_id: {record.get('model_id', '-')}")
    print(f"  request_body 类型: {type(record.get('request_body'))}")
else:
    print("未找到记录")

# 检查所有记录
print("\n所有记录:")
records = GenerationRecord.get_all()
for r in records[-3:]:
    print(f"  ID: {r['id']}, model_id: {r.get('model_id', '-')}")
