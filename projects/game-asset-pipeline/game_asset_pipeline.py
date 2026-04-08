import click
import os
from pathlib import Path
from datetime import datetime

from holopix_sdk import HolopixClient
from kling_sdk import KlingClient
from aliyun_sdk import AliyunVideoClient
from frame_extractor import FrameExtractor
from lark_uploader import LarkUploader
from godot_exporter import GodotExporter
from godot_web_exporter import GodotWebExporter

@click.command()
@click.option('--character', '-c', required=True, 
              type=click.Choice(['关羽', '张飞', '赵云', '马超', '黄忠']))
@click.option('--action', '-a', required=True, 
              help='动作描述，如"挥刀斩击"')
@click.option('--reference-video', '-v', required=True, 
              type=click.Path(exists=True), 
              help='参考动作视频路径')
@click.option('--output-dir', '-o', default='./output', 
              help='输出目录')
@click.option('--upload-to-lark', is_flag=True, 
              help='是否上传到飞书')
@click.option('--video-service', '-v', default='kling', 
              type=click.Choice(['kling', 'aliyun']),
              help='视频生成服务选择：kling（可灵）或 aliyun（阿里云）')
@click.option('--export-to-godot', is_flag=True, 
              help='是否导出为Godot资源')
@click.option('--export-to-web', is_flag=True, 
              help='是否导出为Web部署包')
def pipeline(character, action, reference_video, output_dir, upload_to_lark, video_service, export_to_godot, export_to_web):
    """
    三国五虎将游戏资源生产流水线
    
    示例:
    python game_asset_pipeline.py -c 关羽 -a "青龙斩" -v ./ref/slash.mp4 --upload-to-lark --export-to-godot --export-to-web
    """
    
    # 初始化目录
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    work_dir = Path(output_dir) / f"{character}_{action}_{ts}"
    work_dir.mkdir(parents=True, exist_ok=True)
    
    click.echo(f"🎮 开始生成 {character} - {action} 的动作资源...")
    
    # Step 1: Holopix 生成角色
    click.echo("🎨 Step 1/4: Holopix 生成角色原画...")
    holopix = HolopixClient(
        access_key=os.getenv("HOLOPIX_ACCESS_KEY"),
        secret_key=os.getenv("HOLOPIX_SECRET_KEY")
    )
    img_result = holopix.generate_character(
        prompt=f"{action} pose, dynamic action, warrior",
        character_type=character,
        width=768, height=1024
    )
    img_path = work_dir / "character_base.png"
    base_image_url = img_result["data"][0]["url"]
    holopix.download_image(base_image_url, str(img_path))
    click.echo(f"   ✓ 角色原画已保存: {img_path}")
    
    # Step 1.1: 抠图处理
    click.echo("✂️ Step 1.1/4: 抠图处理...")
    bg_removed = holopix.remove_background(
        image_url=base_image_url,
        bg_type="transparent"
    )
    transparent_img_path = work_dir / "character_transparent.png"
    holopix.download_image(bg_removed["data"][0]["url"], str(transparent_img_path))
    click.echo(f"   ✓ 抠图完成: {transparent_img_path}")
    
    # Step 1.2: 相似图裂变
    click.echo("🔄 Step 1.2/4: 相似图裂变...")
    variations = holopix.image_variations(
        image_url=base_image_url,
        prompt=f"{character} {action} different poses",
        num_variations=4
    )
    variation_dir = work_dir / "variations"
    variation_dir.mkdir(exist_ok=True)
    for i, variant in enumerate(variations["data"]):
        var_path = variation_dir / f"variant_{i+1}.png"
        holopix.download_image(variant["url"], str(var_path))
        click.echo(f"   ✓ 变体 {i+1} 已保存: {var_path}")
    
    # Step 2: 生成动作视频
    if video_service == 'kling':
        click.echo("🎬 Step 2/4: 可灵 Kling 动作迁移...")
        kling = KlingClient(
            os.getenv("KLING_ACCESS_KEY"),
            os.getenv("KLING_SECRET_KEY")
        )
        video_url = kling.image_to_video_motion(
            image_path=str(img_path),
            reference_video_path=reference_video,
            output_duration=3,  # 3秒足够提取8帧
            resolution="720p"
        )
    else:
        click.echo("🎬 Step 2/4: 阿里云图生视频...")
        aliyun = AliyunVideoClient(os.getenv("DASHSCOPE_API_KEY"))
        # 上传首帧到可访问的URL（这里简化处理，实际需要上传到OSS等）
        # 这里使用本地文件路径作为示例，实际需要上传到公网可访问的URL
        video_url = aliyun.image_to_video(
            first_frame_url=str(img_path),
            prompt=f"{character} {action} pose, dynamic action, warrior",
            resolution="720P"
        )
    
    video_path = work_dir / "action_video.mp4"
    # 下载视频
    import requests
    r = requests.get(video_url, stream=True)
    r.raise_for_status()
    with open(video_path, 'wb') as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    click.echo(f"   ✓ 动作视频已生成: {video_path}")
    
    # Step 3: 抽帧与 Sprite Sheet
    click.echo("✂️ Step 3/4: 智能抽帧与 Sprite Sheet 生成...")
    extractor = FrameExtractor(str(video_path))
    frames = extractor.extract_action_frames(target_frames=8, method="optical_flow")
    
    sprite_path = work_dir / f"{character}_{action}_spritesheet.png"
    metadata = extractor.generate_sprite_sheet(
        frames, str(sprite_path), columns=4, bg_color=(0, 255, 0)
    )
    extractor.cleanup()
    click.echo(f"   ✓ Sprite Sheet 已生成: {sprite_path}")
    click.echo(f"   ✓ 共提取 {len(frames)} 帧，尺寸 {metadata['frame_size']['w']}x{metadata['frame_size']['h']}")
    
    # Step 4: 上传飞书（可选）
    if upload_to_lark:
        click.echo("☁️ Step 4/4: 上传至飞书...")
        lark = LarkUploader()
        
        # 上传文件
        file_token = lark.upload_to_drive(
            str(sprite_path), 
            os.getenv("LARK_FOLDER_TOKEN")
        )
        
        # 创建记录
        record_id = lark.create_bitable_record(
            app_token=os.getenv("LARK_APP_TOKEN"),
            table_id=os.getenv("LARK_TABLE_ID"),
            character_name=character,
            sprite_sheet_token=file_token,
            animation_type=action,
            metadata=metadata
        )
        
        # 发送卡片通知
        from datetime import datetime
        lark.send_card_notification(
            os.getenv("LARK_CHAT_ID"),
            "🎮 新游戏资源生成完成",
            {
                "character": character,
                "action": action,
                "total_frames": metadata['total_frames'],
                "frame_size": metadata['frame_size'],
                "record_id": record_id,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        )
        # 保存飞书记录ID到文件，供 skill 读取
        lark_record_file = work_dir / "lark_record_id.txt"
        with open(lark_record_file, 'w', encoding='utf-8') as f:
            f.write(record_id)
        click.echo("   ✓ 已同步到飞书多维表格")
    
    # Step 5: 导出Godot资源（可选）
    if export_to_godot:
        click.echo("🎮 Step 5/6: 导出Godot资源...")
        godot_exporter = GodotExporter(str(work_dir.parent))
        metadata_json_path = str(sprite_path).replace(".png", ".json")
        godot_result = godot_exporter.export_to_godot(metadata_json_path)
        click.echo(f"   ✓ Godot资源已导出到: {godot_result['godot_dir']}")
        click.echo("   使用方法:")
        click.echo("   1. 在Godot中创建新项目")
        click.echo("   2. 将godot目录下的所有文件复制到项目根目录")
        click.echo("   3. 打开test_scene.tscn开始测试")
    
    # Step 6: 导出Web部署包（可选）
    if export_to_web:
        click.echo("🌐 Step 6/6: 导出Web部署包...")
        web_exporter = GodotWebExporter(str(work_dir.parent))
        metadata_json_path = str(sprite_path).replace(".png", ".json")
        web_result = web_exporter.export_to_web(metadata_json_path)
        click.echo(f"   ✓ Web部署包已生成到: {web_result['web_dir']}")
        click.echo(f"   📦 部署压缩包: {web_result['deployment_zip']}")
        click.echo("   部署步骤:")
        click.echo("   1. 上传部署压缩包到服务器")
        click.echo("   2. 解压到网站根目录")
        click.echo("   3. 运行: docker-compose up -d")
        click.echo("   4. 访问: http://服务器IP")
    
    click.echo(f"\n✅ 完成! 所有资源保存在: {work_dir}")

if __name__ == '__main__':
    pipeline()