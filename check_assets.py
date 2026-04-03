#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '.')
from server.models import Asset

assets = Asset.get_all()
print('=== 素材库记录 ===')
for a in assets:
    print(f"ID: {a['id']}, record_id: {a.get('record_id')}, filename: {a['filename']}")
    print(f"    local_path: {a.get('local_path')}")
    print(f"    original_url: {a.get('original_url')}")
    # 检查文件是否存在
    local_path = a.get('local_path')
    if local_path:
        exists = os.path.exists(local_path)
        print(f"    文件存在: {exists}")
    print()
