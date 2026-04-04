# -*- coding: utf-8 -*-
"""
Flask 主应用
"""

import os
import sys

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from config import UPLOAD_FOLDER, DEBUG, PORT, HOST
from server.models import Model, ModelDetailCache, GenerationRecord, Asset, PromptPreset, StickmanPose, QuickPreset
from server.holopix_client import holopix_client

app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)


# ==================== 模型管理 API ====================

@app.route('/api/models', methods=['GET'])
def get_models():
    """获取所有模型"""
    models = Model.get_all()
    return jsonify({'success': True, 'data': models})


@app.route('/api/models/sync', methods=['POST'])
def sync_models():
    """同步 HoloPix 模型列表"""
    result = holopix_client.query_models()
    
    if result.get('success'):
        # API 返回的数据在 data.records 字段中
        data = result.get('data', {})
        models_data = data.get('records', []) if isinstance(data, dict) else []
        
        for model_data in models_data:
            if isinstance(model_data, dict):
                Model.create_or_update(model_data)
        
        return jsonify({'success': True, 'data': models_data, 'count': len(models_data)})
    else:
        return jsonify({'success': False, 'error': result.get('msg', '同步失败'), 'raw': result})


@app.route('/api/models/<model_id>', methods=['GET'])
def get_model_detail(model_id):
    """获取模型详情 - 优先使用本地缓存"""
    # 1. 先检查本地缓存
    cached = ModelDetailCache.get(model_id)
    if cached:
        print(f"[Cache] 命中模型详情缓存: {model_id}")
        return jsonify({'success': True, 'data': cached, 'from_cache': True})
    
    # 2. 缓存未命中，请求API
    print(f"[Cache] 未命中，请求API: {model_id}")
    result = holopix_client.query_model_detail(model_id)
    
    if result.get('success'):
        data = result.get('data', {})
        # 3. 保存到本地缓存
        ModelDetailCache.set(model_id, data)
        print(f"[Cache] 已保存到缓存: {model_id}")
        return jsonify({'success': True, 'data': data, 'from_cache': False})
    else:
        return jsonify({'success': False, 'error': result.get('msg', '查询失败')})


@app.route('/api/models/<model_id>/pin', methods=['POST'])
def toggle_model_pin(model_id):
    """切换模型置顶状态"""
    data = request.json or {}
    is_pinned = data.get('is_pinned', True)
    
    success = Model.toggle_pin(model_id, is_pinned)
    
    if success:
        return jsonify({'success': True, 'is_pinned': is_pinned})
    else:
        return jsonify({'success': False, 'error': '模型不存在'}), 404


@app.route('/api/models/<model_id>/hidden', methods=['POST'])
def toggle_model_hidden(model_id):
    """切换模型隐藏状态"""
    data = request.json or {}
    is_hidden = data.get('is_hidden', True)
    
    success = Model.toggle_hidden(model_id, is_hidden)
    
    if success:
        return jsonify({'success': True, 'is_hidden': is_hidden})
    else:
        return jsonify({'success': False, 'error': '模型不存在'}), 404


@app.route('/api/models/<model_id>/use', methods=['POST'])
def use_model(model_id):
    """使用指定模型，返回模型信息用于生成页面"""
    model = Model.get_by_id(model_id)
    
    if not model:
        return jsonify({'success': False, 'error': '模型不存在'}), 404
    
    # 根据模型类型判断支持的参数
    model_type = model.get('model_type', '') or model.get('base_model', '')
    
    # V1 模型不支持某些参数
    is_v1 = 'V1' in str(model_type).upper() or 'Holopix-V1' in str(model_type)
    
    supported_params = {
        'negative_prompt': not is_v1,  # V1 不支持反向提示词
        'hd_fix': not is_v1,           # V1 不支持高清修复
        'face_detail': True,           # 都支持面部细节
        'aspect_ratios': True,         # 都支持宽高比
        'seed': True,                  # 都支持种子
        'batch_size': True,            # 都支持批量生成
        'enable_perturb': not is_v1,   # V1 不支持扰动
        'simple_background': not is_v1 # V1 不支持简化背景
    }
    
    return jsonify({
        'success': True,
        'model': model,
        'supported_params': supported_params,
        'is_v1': is_v1
    })


@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """清理过期的模型详情缓存"""
    count = ModelDetailCache.clear_expired()
    return jsonify({'success': True, 'cleared_count': count})


@app.route('/api/cache/stats', methods=['GET'])
def get_cache_stats():
    """获取缓存统计信息"""
    from database import db
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        # 总缓存数
        cursor.execute('SELECT COUNT(*) FROM model_details_cache')
        total = cursor.fetchone()[0]
        
        # 有效缓存数
        cursor.execute('''
            SELECT COUNT(*) FROM model_details_cache 
            WHERE cached_at > datetime('now', '-24 hours')
        ''')
        valid = cursor.fetchone()[0]
        
        # 过期缓存数
        cursor.execute('''
            SELECT COUNT(*) FROM model_details_cache 
            WHERE cached_at <= datetime('now', '-24 hours')
        ''')
        expired = cursor.fetchone()[0]
        
        return jsonify({
            'success': True,
            'data': {
                'total': total,
                'valid': valid,
                'expired': expired,
                'expire_hours': 24
            }
        })


# ==================== 素材生成 API ====================

@app.route('/api/generate', methods=['POST'])
def generate_image():
    """生成图片"""
    data = request.json
    
    # 获取模型列表 (支持多模型)
    # 支持两种命名方式: model_detail_list (下划线) 或 modelDetailList (驼峰)
    model_detail_list = data.get('model_detail_list', []) or data.get('modelDetailList', [])
    if not model_detail_list:
        # 兼容旧格式
        model_detail_list = [{
            "modelId": data.get('model_id', 2),
            "strength": data.get('model_strength', 0.9)
        }]
    
    # 构建请求参数 (支持下划线或驼峰两种命名方式)
    params = {
        "modelDetailList": model_detail_list,
        "prompt": data.get('prompt', ''),
        "negativePrompt": data.get('negative_prompt', '') or data.get('negativePrompt', ''),
        "aspectRatios": data.get('aspect_ratios', '1:1') or data.get('aspectRatios', '1:1'),
        "seed": data.get('seed', -1),
        "batchSize": data.get('batch_size', 1) or data.get('batchSize', 1),
        "hdFix": data.get('hd_fix', False) or data.get('hdFix', False),
        "faceDetail": data.get('face_detail', False) or data.get('faceDetail', False)
    }
    
    # 可选参数
    if params['hdFix']:
        params['hdScale'] = data.get('hd_scale', 2) or data.get('hdScale', 2)
    
    if data.get('enable_perturb', False) or data.get('enablePerturb', False):
        params['enablePerturb'] = True
        params['perturb'] = data.get('perturb', 5) or data.get('perturb', 5)
    
    if data.get('simple_background', False) or data.get('simpleBackground', False):
        params['simpleBackground'] = True
    
    # 参考图片相关参数
    if data.get('image_reference') or data.get('imageReference'):
        params['imageReference'] = data.get('image_reference', '') or data.get('imageReference', '')
    
    if data.get('reference_mode') or data.get('referenceMode'):
        params['referenceMode'] = data.get('reference_mode', '') or data.get('referenceMode', '')
    
    if data.get('reference_weight') or data.get('referenceWeight'):
        params['referenceWeight'] = data.get('reference_weight', 0) or data.get('referenceWeight', 0)
    
    if data.get('character_pose') or data.get('characterPose'):
        params['characterPose'] = data.get('character_pose', '') or data.get('characterPose', '')
    
    # 调用 API
    result = holopix_client.generate_image(params)
    
    # 保存记录到数据库 (保存第一个模型的信息作为代表)
    primary_model = model_detail_list[0] if model_detail_list else {"modelId": 2, "strength": 0.9}
    if result.get('success') and result.get('data'):
        client_id = result['data'].get('clientId')
        record_data = {
            'client_id': client_id,
            'prompt': data.get('prompt', ''),
            'negative_prompt': data.get('negative_prompt', ''),
            'model_id': primary_model.get('modelId', 2),
            'model_strength': primary_model.get('strength', 0.9),
            'aspect_ratios': data.get('aspect_ratios', '1:1'),
            'seed': data.get('seed', -1),
            'batch_size': data.get('batch_size', 1),
            'hd_fix': data.get('hd_fix', False),
            'hd_scale': data.get('hd_scale') if data.get('hd_fix') else None,
            'face_detail': data.get('face_detail', False),
            'enable_perturb': data.get('enable_perturb', False),
            'perturb': data.get('perturb') if data.get('enable_perturb') else None,
            'simple_background': data.get('simple_background', False),
            'request_body': {'data': params},
            'response_body': result,
            'status': 'submitted'
        }
        GenerationRecord.create(record_data)
    
    return jsonify(result)


@app.route('/api/generate/<int:record_id>', methods=['GET'])
def get_generation_record(record_id):
    """获取生成记录，包含原始参数和实际参数对比"""
    record = GenerationRecord.get_by_id(record_id)
    if not record:
        return jsonify({'success': False, 'error': '记录不存在'}), 404
    
    # 解析原始请求参数
    request_body = record.get('request_body') or '{}'
    if isinstance(request_body, str):
        try:
            request_body = json.loads(request_body)
        except:
            request_body = {}
    
    original_params = request_body.get('data', {}) if isinstance(request_body, dict) else {}
    
    # 构建实际使用的参数
    actual_params = {
        'prompt': record.get('prompt', ''),
        'negative_prompt': record.get('negative_prompt', ''),
        'model_id': record.get('model_id', ''),
        'model_strength': record.get('model_strength', 0.9),
        'aspect_ratios': record.get('aspect_ratios', '1:1'),
        'seed': record.get('seed', -1),
        'batch_size': record.get('batch_size', 1),
        'hd_fix': record.get('hd_fix', False),
        'hd_scale': record.get('hd_scale'),
        'face_detail': record.get('face_detail', False),
        'enable_perturb': record.get('enable_perturb', False),
        'perturb': record.get('perturb'),
        'simple_background': record.get('simple_background', False)
    }
    
    # 计算参数差异
    param_diff = {}
    for key in actual_params:
        orig_val = original_params.get(key)
        actual_val = actual_params[key]
        if orig_val != actual_val:
            param_diff[key] = {
                'original': orig_val,
                'actual': actual_val
            }
    
    # 添加参数对比信息到返回数据
    record_with_comparison = dict(record)
    record_with_comparison['param_comparison'] = {
        'original_params': original_params,
        'actual_params': actual_params,
        'differences': param_diff,
        'has_differences': len(param_diff) > 0
    }
    
    return jsonify({'success': True, 'data': record_with_comparison})


# ==================== 任务管理 API ====================

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """获取任务列表"""
    limit = request.args.get('limit', 100, type=int)
    tasks = GenerationRecord.get_all(limit=limit)
    return jsonify({'success': True, 'data': tasks})


@app.route('/api/tasks/<client_id>', methods=['GET'])
def query_task(client_id):
    """查询任务状态"""
    result = holopix_client.query_task(client_id)
    
    # 更新数据库状态
    if result.get('success') and result.get('data'):
        client_list = result['data'].get('clientList', [])
        if client_list:
            task = client_list[0]
            status = task.get('status')
            status_msg = task.get('statusMsg')
            GenerationRecord.update_status(client_id, status, status_msg, result)
    
    return jsonify(result)


@app.route('/api/tasks/<client_id>/download', methods=['POST'])
def download_task_images(client_id):
    """下载任务图片"""
    result = holopix_client.query_task(client_id)
    
    if not result.get('success'):
        return jsonify(result)
    
    client_list = result['data'].get('clientList', [])
    if not client_list:
        return jsonify({'success': False, 'error': '任务不存在'})
    
    task = client_list[0]
    if task.get('status') != 'succeed':
        return jsonify({'success': False, 'error': '任务未完成', 'status': task.get('status')})
    
    # 获取生成记录
    record = GenerationRecord.get_by_client_id(client_id)
    record_id = record['id'] if record else None
    
    # 下载图片
    downloaded = []
    img_urls = task.get('imgUrls', [])
    
    for i, url in enumerate(img_urls):
        filename = f"{client_id}_{i+1}.png"
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if holopix_client.download_image(url, save_path):
            # 保存素材记录
            asset_data = {
                'record_id': record_id,
                'filename': filename,
                'original_url': url,
                'local_path': save_path,
                'file_size': os.path.getsize(save_path),
                'asset_type': 'character'
            }
            Asset.create(asset_data)
            downloaded.append(filename)
    
    return jsonify({
        'success': True,
        'downloaded': downloaded,
        'count': len(downloaded)
    })


# ==================== 素材库 API ====================

@app.route('/api/assets', methods=['GET'])
def get_assets():
    """获取素材列表"""
    asset_type = request.args.get('type')
    limit = request.args.get('limit', 100, type=int)
    assets = Asset.get_all(asset_type=asset_type, limit=limit)
    
    # 添加图片URL - 所有图片都在 uploads 目录下
    for asset in assets:
        asset['url'] = f'/uploads/{asset["filename"]}'
    
    return jsonify({'success': True, 'data': assets})


@app.route('/api/assets/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    """获取素材详情"""
    asset = Asset.get_by_id(asset_id)
    if asset:
        # 所有图片都在 uploads 目录下
        asset['url'] = f'/uploads/{asset["filename"]}'
        return jsonify({'success': True, 'data': asset})
    else:
        return jsonify({'success': False, 'error': '素材不存在'}), 404


@app.route('/api/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    """删除素材"""
    asset = Asset.get_by_id(asset_id)
    if asset:
        # 删除文件
        if asset.get('local_path') and os.path.exists(asset['local_path']):
            os.remove(asset['local_path'])
        
        # 删除数据库记录
        Asset.delete(asset_id)
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': '素材不存在'}), 404


# ==================== 预设提示词 API ====================

@app.route('/api/presets', methods=['GET'])
def get_presets():
    """获取预设提示词列表"""
    category = request.args.get('category')
    presets = PromptPreset.get_all(category=category)
    return jsonify({'success': True, 'data': presets})


@app.route('/api/presets', methods=['POST'])
def create_preset():
    """创建预设提示词"""
    data = request.json
    preset_id = PromptPreset.create(data)
    return jsonify({'success': True, 'id': preset_id})


# ==================== 静态文件服务 ====================

@app.route('/uploads/<filename>')
def serve_upload(filename):
    """提供上传的文件"""
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/assets/<path:filepath>')
def serve_assets(filepath):
    """提供素材目录下的文件"""
    # 构建指向 holopix-asset-generator/assets 的路径
    assets_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                              '.trae', 'skills', 'holopix-asset-generator', 'assets')
    return send_from_directory(assets_dir, filepath)


# ==================== 火柴人调试 API ====================

@app.route('/api/stickman/poses', methods=['GET'])
def get_stickman_poses():
    """获取火柴人姿势列表"""
    action_type = request.args.get('action_type', 'all')
    is_preset = request.args.get('is_preset')

    if is_preset is not None:
        is_preset = is_preset.lower() == 'true'

    poses = StickmanPose.get_all(action_type=action_type if action_type != 'all' else None, is_preset=is_preset)
    return jsonify({'success': True, 'data': poses})


@app.route('/api/stickman/poses', methods=['POST'])
def create_stickman_pose():
    """创建新姿势"""
    data = request.json

    if not data or not data.get('name') or not data.get('joints'):
        return jsonify({'success': False, 'error': '缺少必要参数: name, joints'}), 400

    pose_id = StickmanPose.create(data)
    return jsonify({'success': True, 'id': pose_id})


@app.route('/api/stickman/poses/<int:pose_id>', methods=['GET'])
def get_stickman_pose(pose_id):
    """获取单个姿势"""
    pose = StickmanPose.get_by_id(pose_id)
    if pose:
        return jsonify({'success': True, 'data': pose})
    else:
        return jsonify({'success': False, 'error': '姿势不存在'}), 404


@app.route('/api/stickman/poses/<int:pose_id>', methods=['PUT'])
def update_stickman_pose(pose_id):
    """更新姿势"""
    data = request.json

    success = StickmanPose.update(pose_id, data)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': '姿势不存在或无更新'}), 404


@app.route('/api/stickman/poses/<int:pose_id>', methods=['DELETE'])
def delete_stickman_pose(pose_id):
    """删除姿势"""
    # 检查是否是预设
    pose = StickmanPose.get_by_id(pose_id)
    if pose and pose.get('is_preset'):
        return jsonify({'success': False, 'error': '不能删除预设姿势'}), 403

    success = StickmanPose.delete(pose_id)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': '姿势不存在'}), 404


@app.route('/api/stickman/presets', methods=['GET'])
def get_stickman_presets():
    """获取预设姿势"""
    presets = StickmanPose.get_presets()
    return jsonify({'success': True, 'data': presets})


@app.route('/api/stickman/poses/<int:pose_id>/description', methods=['POST'])
def generate_stickman_description(pose_id):
    """生成姿势描述"""
    description = StickmanPose.generate_description(pose_id)
    if description:
        return jsonify({'success': True, 'description': description})
    else:
        return jsonify({'success': False, 'error': '姿势不存在'}), 404


@app.route('/api/stickman/poses/<int:pose_id>/thumbnail', methods=['POST'])
def save_stickman_thumbnail(pose_id):
    """保存姿势缩略图"""
    data = request.json
    image_data = data.get('image_data')  # base64 encoded image

    if not image_data:
        return jsonify({'success': False, 'error': '缺少图片数据'}), 400

    # 创建缩略图目录
    thumbs_dir = os.path.join(app.static_folder, 'stickman_thumbs')
    os.makedirs(thumbs_dir, exist_ok=True)

    # 保存图片
    import base64
    filename = f'pose_{pose_id}.png'
    filepath = os.path.join(thumbs_dir, filename)

    # 移除 base64 前缀
    if ',' in image_data:
        image_data = image_data.split(',')[1]

    with open(filepath, 'wb') as f:
        f.write(base64.b64decode(image_data))

    # 更新数据库
    relative_path = f'stickman_thumbs/{filename}'
    StickmanPose.update(pose_id, {'thumbnail_path': relative_path})

    return jsonify({'success': True, 'thumbnail_path': relative_path})


@app.route('/api/stickman/init-presets', methods=['POST'])
def init_stickman_presets():
    """初始化预设姿势"""
    StickmanPose.init_presets()
    return jsonify({'success': True, 'message': '预设姿势已初始化'})


# ==================== 快捷应用 API ====================

@app.route('/api/quick-presets', methods=['GET'])
def get_quick_presets():
    """获取所有快捷应用"""
    presets = QuickPreset.get_all()
    return jsonify({'success': True, 'data': presets})


@app.route('/api/quick-presets', methods=['POST'])
def create_quick_preset():
    """创建快捷应用"""
    data = request.json

    if not data or not data.get('name'):
        return jsonify({'success': False, 'error': '缺少名称'}), 400

    if not data.get('model_list') or len(data.get('model_list', [])) == 0:
        return jsonify({'success': False, 'error': '至少选择一个模型'}), 400

    preset_id = QuickPreset.create(data)
    return jsonify({'success': True, 'id': preset_id})


@app.route('/api/quick-presets/<int:preset_id>', methods=['GET'])
def get_quick_preset(preset_id):
    """获取单个快捷应用"""
    preset = QuickPreset.get_by_id(preset_id)
    if preset:
        return jsonify({'success': True, 'data': preset})
    else:
        return jsonify({'success': False, 'error': '快捷应用不存在'}), 404


@app.route('/api/quick-presets/<int:preset_id>', methods=['PUT'])
def update_quick_preset(preset_id):
    """更新快捷应用"""
    data = request.json
    success = QuickPreset.update(preset_id, data)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': '快捷应用不存在'}), 404


@app.route('/api/quick-presets/<int:preset_id>', methods=['DELETE'])
def delete_quick_preset(preset_id):
    """删除快捷应用"""
    success = QuickPreset.delete(preset_id)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': '快捷应用不存在'}), 404


@app.route('/api/quick-presets/<int:preset_id>/favorite', methods=['POST'])
def toggle_quick_preset_favorite(preset_id):
    """切换收藏状态"""
    data = request.json
    is_favorite = data.get('is_favorite', False)

    success = QuickPreset.update(preset_id, {'is_favorite': is_favorite})
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': '快捷应用不存在'}), 404


# ==================== 静态文件服务 ====================

@app.route('/')
def index():
    """主页"""
    return send_from_directory('static', 'index.html')


if __name__ == '__main__':
    # 初始化预设姿势
    StickmanPose.init_presets()
    app.run(host=HOST, port=PORT, debug=DEBUG)
