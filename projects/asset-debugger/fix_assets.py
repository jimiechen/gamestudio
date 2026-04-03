#!/usr/bin/env python3
"""修复素材记录中的 local_path"""
import sys
import os
sys.path.insert(0, '.')
from server.database import db
from server.models import Asset

# 获取所有素材
assets = Asset.get_all()
print(f'找到 {len(assets)} 个素材记录')

# 构建文件名到路径的映射
# 从 asset-debugger 目录出发，找到 holopix-asset-generator/assets
script_dir = os.path.dirname(os.path.abspath(__file__))
abs_assets_dir = os.path.join(
    os.path.dirname(os.path.dirname(script_dir)),  # 到 projects 目录
    '.trae', 'skills', 'holopix-asset-generator', 'assets'
)

print(f'搜索目录: {abs_assets_dir}')

filename_to_path = {}
if os.path.exists(abs_assets_dir):
    for root, dirs, files in os.walk(abs_assets_dir):
        for file in files:
            if file.endswith('.png'):
                full_path = os.path.join(root, file)
                filename_to_path[file] = full_path
                print(f'  找到: {file}')
else:
    print(f'目录不存在: {abs_assets_dir}')

print(f'\n找到 {len(filename_to_path)} 个图片文件')

# 更新数据库
updated = 0
for asset in assets:
    filename = asset['filename']
    if filename in filename_to_path:
        local_path = filename_to_path[filename]
        # 更新数据库
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE assets SET local_path = ? WHERE id = ?',
                (local_path, asset['id'])
            )
            conn.commit()
        print(f'✅ 更新: {filename}')
        updated += 1
    else:
        print(f'❌ 未找到: {filename}')

print(f'\n更新了 {updated}/{len(assets)} 个素材记录')
