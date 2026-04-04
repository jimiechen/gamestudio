# -*- coding: utf-8 -*-
"""
更新火柴人姿势图片URL为网络地址
"""

import sys
import os

# 添加项目路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from server.models import StickmanPose
from server.database import db

# 姿势图片网络地址映射
POSE_IMAGE_URLS = {
    "站立": "https://pino-img.yingzhongshare.com/posePreview/2.5/1.png",
    "行走": "https://pino-img.yingzhongshare.com/posePreview/2.5/2.png",
    "奔跑": "https://pino-img.yingzhongshare.com/posePreview/2.5/3.png",
    "跳跃": "https://pino-img.yingzhongshare.com/posePreview/2.5/4.png",
    "攻击": "https://pino-img.yingzhongshare.com/posePreview/2.5/5.png",
    "防御": "https://pino-img.yingzhongshare.com/posePreview/2.5/6.png",
    "坐下": "https://pino-img.yingzhongshare.com/posePreview/2.5/7.png",
    "挥手": "https://pino-img.yingzhongshare.com/posePreview/2.5/8.png",
}

def update_pose_urls():
    """更新所有预设姿势的图片URL为网络地址"""
    print("开始更新姿势图片URL...")
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        # 获取所有预设姿势
        cursor.execute(
            "SELECT id, name, thumbnail_path FROM stickman_poses WHERE is_preset = 1"
        )
        poses = cursor.fetchall()
        
        print(f"找到 {len(poses)} 个预设姿势")
        
        updated_count = 0
        for pose in poses:
            pose_id = pose['id']
            pose_name = pose['name']
            current_path = pose['thumbnail_path']
            
            # 查找对应的网络URL
            network_url = POSE_IMAGE_URLS.get(pose_name)
            
            if network_url:
                # 更新为网络URL
                cursor.execute(
                    "UPDATE stickman_poses SET thumbnail_path = ? WHERE id = ?",
                    (network_url, pose_id)
                )
                print(f"✓ 更新: {pose_name}")
                print(f"  原路径: {current_path}")
                print(f"  新URL: {network_url}")
                updated_count += 1
            else:
                print(f"⚠ 未找到对应URL: {pose_name}")
        
        conn.commit()
        print(f"\n完成! 已更新 {updated_count} 个姿势")

if __name__ == '__main__':
    update_pose_urls()
