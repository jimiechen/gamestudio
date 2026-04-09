#!/usr/bin/env python3
"""
导入8.txt中的提示词预设到数据库
"""
import json
import os
import sys

# 确保可以导入server模块
server_dir = os.path.join(os.path.dirname(__file__), 'server')
sys.path.insert(0, server_dir)

from models import PromptPreset

def load_json_file(file_path):
    """加载JSON文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def import_presets(data):
    """导入提示词预设到数据库"""
    presets = []
    
    # 1. 导入提取的模板
    if 'extracted_templates' in data:
        for template in data['extracted_templates']:
            presets.append({
                'name': template['name'],
                'category': 'template',
                'prompt_template': template['content'],
                'negative_prompt': '',
                'default_params': '{}',
                'description': '提取的模板'
            })
    
    # 2. 导入holopix_cn - 持武器
    if 'holopix_cn' in data and 'with_weapons' in data['holopix_cn']:
        with_weapons = data['holopix_cn']['with_weapons']
        for char in with_weapons['characters']:
            presets.append({
                'name': f"Hades风格_{char['name']}_持武器",
                'category': 'character',
                'prompt_template': char['positive_prompt'],
                'negative_prompt': char.get('negative_prompt', ''),
                'default_params': '{}',
                'description': with_weapons['description']
            })
    
    # 3. 导入holopix_cn - 徒手
    if 'holopix_cn' in data and 'without_weapons' in data['holopix_cn']:
        without_weapons = data['holopix_cn']['without_weapons']
        for char in without_weapons['characters']:
            presets.append({
                'name': f"Hades风格_{char['name']}_徒手",
                'category': 'character',
                'prompt_template': char['positive_prompt'],
                'negative_prompt': char.get('negative_prompt', ''),
                'default_params': '{}',
                'description': without_weapons['description']
            })
    
    # 4. 导入泡泡玛特风格双视图
    if 'popmart_style_double_view' in data:
        popmart = data['popmart_style_double_view']
        for char in popmart['characters']:
            presets.append({
                'name': f"泡泡玛特风格_{char['name']}_双视图",
                'category': 'style',
                'prompt_template': char['positive_prompt'],
                'negative_prompt': '',
                'default_params': '{}',
                'description': popmart['description']
            })
    
    # 5. 导入四视图
    if 'four_view_sheet' in data:
        four_view = data['four_view_sheet']
        for char in four_view['characters']:
            presets.append({
                'name': f"四视图_{char['name']}",
                'category': 'pose',
                'prompt_template': char['positive_prompt'],
                'negative_prompt': '',
                'default_params': '{}',
                'description': four_view['description']
            })
    
    # 6. 导入表情整合图
    if 'expression_collage' in data:
        exp_collage = data['expression_collage']
        presets.append({
            'name': '五虎将表情整合图',
            'category': 'expression',
            'prompt_template': exp_collage['positive_prompt'],
            'negative_prompt': exp_collage.get('negative_prompt', ''),
            'default_params': '{}',
            'description': exp_collage['description']
        })
    
    # 插入到数据库
    inserted = 0
    for preset in presets:
        try:
            # 检查是否已存在
            existing = PromptPreset.get_by_name(preset['name'])
            if existing:
                print(f"跳过已存在的预设: {preset['name']}")
                continue
            
            # 创建新预设
            PromptPreset.create({
                'name': preset['name'],
                'category': preset['category'],
                'prompt_template': preset['prompt_template'],
                'negative_prompt': preset['negative_prompt'],
                'default_params': preset['default_params'],
                'description': preset['description']
            })
            inserted += 1
            print(f"导入成功: {preset['name']}")
        except Exception as e:
            print(f"导入失败 {preset['name']}: {e}")
    
    return inserted

def main():
    json_file = r'c:\projects\Claude-Code-Game-Studios-0.3.0\Claude-Code-Game-Studios-0.3.0\.trae\documents\8.txt'
    
    if not os.path.exists(json_file):
        print(f"文件不存在: {json_file}")
        return
    
    print(f"加载JSON文件: {json_file}")
    data = load_json_file(json_file)
    
    print("开始导入提示词预设...")
    inserted = import_presets(data)
    
    print(f"\n导入完成！成功导入 {inserted} 个提示词预设")

if __name__ == '__main__':
    main()