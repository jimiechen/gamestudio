# -*- coding: utf-8 -*-
"""
数据模型操作类
"""

import json
from typing import List, Dict, Optional
from server.database import db


class Model:
    """AI模型"""

    @staticmethod
    def get_all() -> List[Dict]:
        """获取所有模型，置顶模型排在前面"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM models
                ORDER BY is_pinned DESC, pinned_at DESC, model_id
            ''')
            return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(model_id: str) -> Optional[Dict]:
        """根据ID获取模型"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM models WHERE model_id = ?', (model_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def create_or_update(data: Dict) -> int:
        """创建或更新模型"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO models
                (model_id, model_name, model_type, style_type, model_tags,
                 introduction, base_model, cover_image, commercial_license)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('id'),  # API 返回的是 id 而不是 modelId
                data.get('modelName'),
                data.get('modelType'),
                data.get('styleType'),
                data.get('modelTags'),
                data.get('introduction'),
                data.get('baseModel'),
                data.get('coverImage'),
                data.get('commercialLicense')
            ))
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def toggle_pin(model_id: str, is_pinned: bool) -> bool:
        """切换模型置顶状态"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE models
                SET is_pinned = ?, pinned_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END
                WHERE model_id = ?
            ''', (is_pinned, is_pinned, model_id))
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def toggle_hidden(model_id: str, is_hidden: bool) -> bool:
        """切换模型隐藏状态"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE models
                SET is_hidden = ?, hidden_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END
                WHERE model_id = ?
            ''', (is_hidden, is_hidden, model_id))
            conn.commit()
            return cursor.rowcount > 0


class ModelDetailCache:
    """模型详情缓存"""

    CACHE_EXPIRE_HOURS = 24  # 缓存24小时

    @staticmethod
    def get(model_id: str) -> Optional[Dict]:
        """获取缓存的模型详情"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM model_details_cache
                WHERE model_id = ?
                AND cached_at > datetime('now', '-{} hours')
            '''.format(ModelDetailCache.CACHE_EXPIRE_HOURS), (model_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def set(model_id: str, data: Dict) -> int:
        """保存模型详情到缓存"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO model_details_cache
                (model_id, model_name, model_tags, introduction, model_type,
                 style_type, base_model, cover_image, model_details_images,
                 commercial_license, model_available, cached_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (
                model_id,
                data.get('modelName') or data.get('ModelName'),
                data.get('modelTags') or data.get('ModelTags'),
                data.get('introduction') or data.get('Introduction'),
                data.get('modelType') or data.get('ModelType'),
                data.get('styleType') or data.get('StyleType'),
                data.get('baseModel') or data.get('BaseModel'),
                data.get('coverImage') or data.get('CoverImage'),
                data.get('modelDetailsImages') or data.get('ModelDetailsImages'),
                data.get('commercialLicense') or data.get('CommercialLicense'),
                data.get('modelAvailable') or data.get('ModelAvailable', 1)
            ))
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def clear_expired() -> int:
        """清理过期缓存"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                DELETE FROM model_details_cache
                WHERE cached_at < datetime('now', '-{} hours')
            '''.format(ModelDetailCache.CACHE_EXPIRE_HOURS))
            conn.commit()
            return cursor.rowcount


class GenerationRecord:
    """生成记录"""

    @staticmethod
    def create(data: Dict) -> int:
        """创建生成记录"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO generation_records
                (client_id, prompt, negative_prompt, model_id, model_strength,
                 aspect_ratios, seed, hd_fix, hd_scale, face_detail,
                 batch_size, enable_perturb, perturb, simple_background,
                 request_body, response_body, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('client_id'),
                data.get('prompt'),
                data.get('negative_prompt'),
                data.get('model_id'),
                data.get('model_strength', 0.9),
                data.get('aspect_ratios', '1:1'),
                data.get('seed', -1),
                data.get('hd_fix', False),
                data.get('hd_scale'),
                data.get('face_detail', False),
                data.get('batch_size', 1),
                data.get('enable_perturb', False),
                data.get('perturb'),
                data.get('simple_background', False),
                json.dumps(data.get('request_body'), ensure_ascii=False) if data.get('request_body') else None,
                json.dumps(data.get('response_body'), ensure_ascii=False) if data.get('response_body') else None,
                data.get('status', 'pending')
            ))
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_by_id(record_id: int) -> Optional[Dict]:
        """根据ID获取记录"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM generation_records WHERE id = ?', (record_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_by_client_id(client_id: str) -> Optional[Dict]:
        """根据Client ID获取记录"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM generation_records WHERE client_id = ?', (client_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_all(limit: int = 100) -> List[Dict]:
        """获取所有记录"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM generation_records
                ORDER BY created_at DESC
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def update_status(client_id: str, status: str, status_msg: str = None, response_body: Dict = None):
        """更新状态"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE generation_records
                SET status = ?, status_msg = ?, response_body = ?, updated_at = CURRENT_TIMESTAMP
                WHERE client_id = ?
            ''', (status, status_msg, json.dumps(response_body, ensure_ascii=False) if response_body else None, client_id))
            conn.commit()


class Asset:
    """素材"""

    @staticmethod
    def create(data: Dict) -> int:
        """创建素材记录"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO assets
                (record_id, filename, original_url, local_path, file_size,
                 width, height, asset_type, tags, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('record_id'),
                data.get('filename'),
                data.get('original_url'),
                data.get('local_path'),
                data.get('file_size'),
                data.get('width'),
                data.get('height'),
                data.get('asset_type', 'character'),
                data.get('tags'),
                data.get('description')
            ))
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_all(asset_type: str = None, limit: int = 100) -> List[Dict]:
        """获取所有素材"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            if asset_type:
                cursor.execute('''
                    SELECT * FROM assets
                    WHERE asset_type = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (asset_type, limit))
            else:
                cursor.execute('''
                    SELECT * FROM assets
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(asset_id: int) -> Optional[Dict]:
        """根据ID获取素材"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM assets WHERE id = ?', (asset_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def delete(asset_id: int) -> bool:
        """删除素材"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM assets WHERE id = ?', (asset_id,))
            conn.commit()
            return cursor.rowcount > 0


class PromptPreset:
    """预设提示词"""

    @staticmethod
    def create(data: Dict) -> int:
        """创建预设"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO prompt_presets
                (name, category, prompt_template, negative_prompt, default_params, description)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data.get('name'),
                data.get('category', 'character'),
                data.get('prompt_template'),
                data.get('negative_prompt'),
                json.dumps(data.get('default_params'), ensure_ascii=False) if data.get('default_params') else None,
                data.get('description')
            ))
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_all(category: str = None) -> List[Dict]:
        """获取所有预设"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            if category:
                cursor.execute('SELECT * FROM prompt_presets WHERE category = ?', (category,))
            else:
                cursor.execute('SELECT * FROM prompt_presets')
            return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_name(name: str) -> Optional[Dict]:
        """根据名称获取预设"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM prompt_presets WHERE name = ?', (name,))
            row = cursor.fetchone()
            return dict(row) if row else None


class StickmanPose:
    """火柴人姿势"""

    @staticmethod
    def create(data: Dict) -> int:
        """创建姿势"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO stickman_poses
                (name, action_type, joints, connections, thumbnail_path, description, is_preset, is_favorite)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('name'),
                data.get('action_type', 'custom'),
                json.dumps(data.get('joints'), ensure_ascii=False),
                json.dumps(data.get('connections'), ensure_ascii=False) if data.get('connections') else None,
                data.get('thumbnail_path'),
                data.get('description'),
                data.get('is_preset', False),
                data.get('is_favorite', False)
            ))
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_all(action_type: str = None, is_preset: bool = None) -> List[Dict]:
        """获取所有姿势"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM stickman_poses'
            params = []
            conditions = []

            if action_type and action_type != 'all':
                conditions.append('action_type = ?')
                params.append(action_type)
            if is_preset is not None:
                conditions.append('is_preset = ?')
                params.append(1 if is_preset else 0)

            if conditions:
                query += ' WHERE ' + ' AND '.join(conditions)

            query += ' ORDER BY is_preset DESC, is_favorite DESC, created_at DESC'

            cursor.execute(query, params)
            rows = cursor.fetchall()

            poses = []
            for row in rows:
                pose = dict(row)
                if pose.get('joints'):
                    pose['joints'] = json.loads(pose['joints'])
                if pose.get('connections'):
                    pose['connections'] = json.loads(pose['connections'])
                poses.append(pose)
            return poses

    @staticmethod
    def get_by_id(pose_id: int) -> Optional[Dict]:
        """根据ID获取姿势"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM stickman_poses WHERE id = ?', (pose_id,))
            row = cursor.fetchone()
            if row:
                pose = dict(row)
                if pose.get('joints'):
                    pose['joints'] = json.loads(pose['joints'])
                if pose.get('connections'):
                    pose['connections'] = json.loads(pose['connections'])
                return pose
            return None

    @staticmethod
    def update(pose_id: int, data: Dict) -> bool:
        """更新姿势"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            fields = []
            params = []

            if 'name' in data:
                fields.append('name = ?')
                params.append(data['name'])
            if 'action_type' in data:
                fields.append('action_type = ?')
                params.append(data['action_type'])
            if 'joints' in data:
                fields.append('joints = ?')
                params.append(json.dumps(data['joints'], ensure_ascii=False))
            if 'connections' in data:
                fields.append('connections = ?')
                params.append(json.dumps(data['connections'], ensure_ascii=False) if data['connections'] else None)
            if 'thumbnail_path' in data:
                fields.append('thumbnail_path = ?')
                params.append(data['thumbnail_path'])
            if 'description' in data:
                fields.append('description = ?')
                params.append(data['description'])
            if 'is_favorite' in data:
                fields.append('is_favorite = ?')
                params.append(1 if data['is_favorite'] else 0)

            if not fields:
                return False

            fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(pose_id)

            cursor.execute(f'''
                UPDATE stickman_poses
                SET {', '.join(fields)}
                WHERE id = ?
            ''', params)
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def delete(pose_id: int) -> bool:
        """删除姿势"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM stickman_poses WHERE id = ?', (pose_id,))
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def get_presets() -> List[Dict]:
        """获取预设姿势"""
        return StickmanPose.get_all(is_preset=True)

    @staticmethod
    def generate_description(pose_id: int) -> Optional[str]:
        """生成姿势描述文本"""
        pose = StickmanPose.get_by_id(pose_id)
        if not pose:
            return None

        action_type = pose.get('action_type', 'custom')
        descriptions = {
            'idle': '站立姿势，双脚并拢，双臂自然下垂，头部正直',
            'attack': '攻击姿势，右臂高举过头，身体扭转，左腿前弓右腿后蹬',
            'dodge': '躲避姿势，身体侧倾，双腿弯曲，双臂护住身体',
            'defend': '防御姿势，双臂前举，双腿稳固站立，身体微蹲'
        }

        base_desc = descriptions.get(action_type, '自定义姿势')
        custom_desc = pose.get('description', '')

        if custom_desc:
            return f"{base_desc}。{custom_desc}"
        return base_desc

    @staticmethod
    def init_presets():
        """初始化预设姿势"""
        presets = [
            {
                'name': '站立',
                'action_type': 'idle',
                'joints': {
                    'head': {'x': 300, 'y': 80},
                    'neck': {'x': 300, 'y': 110},
                    'shoulderL': {'x': 270, 'y': 130},
                    'shoulderR': {'x': 330, 'y': 130},
                    'elbowL': {'x': 250, 'y': 180},
                    'elbowR': {'x': 350, 'y': 180},
                    'wristL': {'x': 230, 'y': 230},
                    'wristR': {'x': 370, 'y': 230},
                    'hipCenter': {'x': 300, 'y': 230},
                    'hipL': {'x': 280, 'y': 230},
                    'hipR': {'x': 320, 'y': 230},
                    'kneeL': {'x': 280, 'y': 320},
                    'kneeR': {'x': 320, 'y': 320},
                    'ankleL': {'x': 280, 'y': 420},
                    'ankleR': {'x': 320, 'y': 420}
                },
                'description': '标准站立姿势',
                'is_preset': True
            },
            {
                'name': '挥动武器',
                'action_type': 'attack',
                'joints': {
                    'head': {'x': 320, 'y': 80},
                    'neck': {'x': 320, 'y': 110},
                    'shoulderL': {'x': 290, 'y': 130},
                    'shoulderR': {'x': 350, 'y': 120},
                    'elbowL': {'x': 260, 'y': 190},
                    'elbowR': {'x': 400, 'y': 60},
                    'wristL': {'x': 240, 'y': 240},
                    'wristR': {'x': 450, 'y': 30},
                    'hipCenter': {'x': 300, 'y': 230},
                    'hipL': {'x': 270, 'y': 240},
                    'hipR': {'x': 330, 'y': 220},
                    'kneeL': {'x': 250, 'y': 320},
                    'kneeR': {'x': 360, 'y': 300},
                    'ankleL': {'x': 230, 'y': 400},
                    'ankleR': {'x': 380, 'y': 380}
                },
                'description': '右手高举武器攻击',
                'is_preset': True
            },
            {
                'name': '躲避',
                'action_type': 'dodge',
                'joints': {
                    'head': {'x': 280, 'y': 90},
                    'neck': {'x': 290, 'y': 120},
                    'shoulderL': {'x': 260, 'y': 140},
                    'shoulderR': {'x': 320, 'y': 130},
                    'elbowL': {'x': 230, 'y': 170},
                    'elbowR': {'x': 340, 'y': 160},
                    'wristL': {'x': 210, 'y': 200},
                    'wristR': {'x': 360, 'y': 190},
                    'hipCenter': {'x': 300, 'y': 240},
                    'hipL': {'x': 270, 'y': 250},
                    'hipR': {'x': 330, 'y': 230},
                    'kneeL': {'x': 250, 'y': 340},
                    'kneeR': {'x': 350, 'y': 310},
                    'ankleL': {'x': 230, 'y': 420},
                    'ankleR': {'x': 370, 'y': 390}
                },
                'description': '侧身躲避姿势',
                'is_preset': True
            },
            {
                'name': '防御',
                'action_type': 'defend',
                'joints': {
                    'head': {'x': 300, 'y': 100},
                    'neck': {'x': 300, 'y': 130},
                    'shoulderL': {'x': 270, 'y': 150},
                    'shoulderR': {'x': 330, 'y': 150},
                    'elbowL': {'x': 290, 'y': 200},
                    'elbowR': {'x': 310, 'y': 200},
                    'wristL': {'x': 280, 'y': 180},
                    'wristR': {'x': 320, 'y': 180},
                    'hipCenter': {'x': 300, 'y': 250},
                    'hipL': {'x': 280, 'y': 260},
                    'hipR': {'x': 320, 'y': 260},
                    'kneeL': {'x': 270, 'y': 340},
                    'kneeR': {'x': 330, 'y': 340},
                    'ankleL': {'x': 260, 'y': 420},
                    'ankleR': {'x': 340, 'y': 420}
                },
                'description': '双臂前举防御',
                'is_preset': True
            }
        ]

        with db.get_connection() as conn:
            cursor = conn.cursor()
            # 检查是否已有预设
            cursor.execute('SELECT COUNT(*) FROM stickman_poses WHERE is_preset = 1')
            count = cursor.fetchone()[0]

            if count == 0:
                for preset in presets:
                    cursor.execute('''
                        INSERT INTO stickman_poses
                        (name, action_type, joints, description, is_preset)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        preset['name'],
                        preset['action_type'],
                        json.dumps(preset['joints'], ensure_ascii=False),
                        preset['description'],
                        preset['is_preset']
                    ))
                conn.commit()
                print(f"[Init] 已初始化 {len(presets)} 个预设姿势")


class QuickPreset:
    """快捷应用配置"""

    @staticmethod
    def create(data: Dict) -> int:
        """创建快捷应用"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO quick_presets
                (name, description, model_list, prompt, negative_prompt, aspect_ratios,
                 seed, image_guidance_weights, face_detail, hd_fix, hd_scale,
                 simple_background, enable_perturb, perturb, image_reference,
                 reference_mode, reference_weight, character_pose, batch_size)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('name'),
                data.get('description'),
                json.dumps(data.get('model_list', []), ensure_ascii=False),
                data.get('prompt'),
                data.get('negative_prompt'),
                data.get('aspect_ratios', '1:1'),
                data.get('seed', -1),
                data.get('image_guidance_weights', 6),
                data.get('face_detail', False),
                data.get('hd_fix', False),
                data.get('hd_scale', 1.5),
                data.get('simple_background', False),
                data.get('enable_perturb', False),
                data.get('perturb', 5),
                data.get('image_reference'),
                data.get('reference_mode'),
                data.get('reference_weight', 0.8),
                data.get('character_pose'),
                data.get('batch_size', 1)
            ))
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_all() -> List[Dict]:
        """获取所有快捷应用"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM quick_presets
                ORDER BY is_favorite DESC, created_at DESC
            ''')
            presets = []
            for row in cursor.fetchall():
                preset = dict(row)
                if preset.get('model_list'):
                    preset['model_list'] = json.loads(preset['model_list'])
                presets.append(preset)
            return presets

    @staticmethod
    def get_by_id(preset_id: int) -> Optional[Dict]:
        """根据ID获取快捷应用"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM quick_presets WHERE id = ?', (preset_id,))
            row = cursor.fetchone()
            if row:
                preset = dict(row)
                if preset.get('model_list'):
                    preset['model_list'] = json.loads(preset['model_list'])
                return preset
            return None

    @staticmethod
    def update(preset_id: int, data: Dict) -> bool:
        """更新快捷应用"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            fields = []
            params = []

            field_mapping = {
                'name': 'name',
                'description': 'description',
                'model_list': 'model_list',
                'prompt': 'prompt',
                'negative_prompt': 'negative_prompt',
                'aspect_ratios': 'aspect_ratios',
                'seed': 'seed',
                'image_guidance_weights': 'image_guidance_weights',
                'face_detail': 'face_detail',
                'hd_fix': 'hd_fix',
                'hd_scale': 'hd_scale',
                'simple_background': 'simple_background',
                'enable_perturb': 'enable_perturb',
                'perturb': 'perturb',
                'image_reference': 'image_reference',
                'reference_mode': 'reference_mode',
                'reference_weight': 'reference_weight',
                'character_pose': 'character_pose',
                'batch_size': 'batch_size',
                'is_favorite': 'is_favorite'
            }

            for key, db_field in field_mapping.items():
                if key in data:
                    fields.append(f'{db_field} = ?')
                    if key == 'model_list':
                        params.append(json.dumps(data[key], ensure_ascii=False))
                    else:
                        params.append(data[key])

            if not fields:
                return False

            fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(preset_id)

            cursor.execute(f'''
                UPDATE quick_presets
                SET {', '.join(fields)}
                WHERE id = ?
            ''', params)
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def delete(preset_id: int) -> bool:
        """删除快捷应用"""
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM quick_presets WHERE id = ?', (preset_id,))
            conn.commit()
            return cursor.rowcount > 0
