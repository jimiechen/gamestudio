# -*- coding: utf-8 -*-
"""
下载火柴人姿势图片并保存到数据库
"""

import os
import sys
import requests

# 添加项目路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from server.models import StickmanPose
from server.database import db

# 图片URL列表（8个姿势）
POSE_URLS = [
    "https://pino-img.yingzhongshare.com/posePreview/2.5/1.png",
    "https://pino-img.yingzhongshare.com/posePreview/2.5/2.png",
    "https://pino-img.yingzhongshare.com/posePreview/2.5/3.png",
    "https://pino-img.yingzhongshare.com/posePreview/2.5/4.png",
    "https://pino-img.yingzhongshare.com/posePreview/2.5/5.png",
    "https://pino-img.yingzhongshare.com/posePreview/2.5/6.png",
    "https://pino-img.yingzhongshare.com/posePreview/2.5/7.png",
    "https://pino-img.yingzhongshare.com/posePreview/2.5/8.png",
]

# 姿势名称映射（8个）
POSE_NAMES = {
    1: "站立",
    2: "行走",
    3: "奔跑",
    4: "跳跃",
    5: "攻击",
    6: "防御",
    7: "坐下",
    8: "挥手"
}

# 姿势描述映射（8个）
POSE_DESCRIPTIONS = {
    1: "标准站立姿势，双脚并拢，双臂自然下垂",
    2: "行走姿势，一腿前迈，双臂自然摆动",
    3: "奔跑姿势，身体前倾，双腿大步迈开",
    4: "跳跃姿势，双腿弯曲，双臂上举",
    5: "攻击姿势，右臂前伸，身体扭转",
    6: "防御姿势，双臂交叉护住身体",
    7: "坐下姿势，双腿弯曲，身体下沉",
    8: "挥手姿势，一臂高举摆动"
}

def download_image(url, save_path):
    """下载图片"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f"下载失败 {url}: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"下载失败 {url}: {e}")
        return False

def main():
    # 创建缩略图目录
    thumbs_dir = os.path.join(project_root, 'server', 'static', 'stickman_thumbs')
    os.makedirs(thumbs_dir, exist_ok=True)
    print(f"图片保存目录: {thumbs_dir}")

    # 下载并保存每个姿势
    for i, url in enumerate(POSE_URLS, 1):
        filename = f"pose_{i}.png"
        save_path = os.path.join(thumbs_dir, filename)
        relative_path = f"stickman_thumbs/{filename}"

        print(f"\n处理姿势 {i}/8: {POSE_NAMES.get(i, f'姿势{i}')}")
        print(f"URL: {url}")

        # 下载图片
        if download_image(url, save_path):
            print(f"✓ 图片已下载: {save_path}")
            file_size = os.path.getsize(save_path)
            print(f"  文件大小: {file_size} bytes")

            # 检查数据库中是否已存在
            with db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id FROM stickman_poses WHERE name = ? AND is_preset = 1",
                    (POSE_NAMES.get(i, f"姿势{i}"),)
                )
                existing = cursor.fetchone()

                if existing:
                    # 更新现有记录
                    pose_id = existing[0]
                    cursor.execute(
                        "UPDATE stickman_poses SET thumbnail_path = ?, description = ? WHERE id = ?",
                        (relative_path, POSE_DESCRIPTIONS.get(i, f"预设姿势{i}"), pose_id)
                    )
                    conn.commit()
                    print(f"✓ 已更新数据库记录 ID: {pose_id}")
                else:
                    # 创建新记录
                    pose_data = {
                        'name': POSE_NAMES.get(i, f"姿势{i}"),
                        'action_type': 'preset',
                        'joints': {},
                        'thumbnail_path': relative_path,
                        'description': POSE_DESCRIPTIONS.get(i, f"预设姿势{i}"),
                        'is_preset': True
                    }
                    pose_id = StickmanPose.create(pose_data)
                    print(f"✓ 已创建数据库记录 ID: {pose_id}")
        else:
            print(f"✗ 下载失败，跳过")

    print("\n" + "="*50)
    print("处理完成!")

    # 显示所有预设姿势
    poses = StickmanPose.get_presets()
    print(f"\n当前共有 {len(poses)} 个预设姿势:")
    for pose in poses:
        thumb = pose.get('thumbnail_path', '无缩略图')
        print(f"  - ID:{pose['id']} {pose['name']} ({thumb})")

if __name__ == '__main__':
    main()
