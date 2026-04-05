# Holopix 出图 → 可灵 API 动作帧生成：完整 SOP 流程

> **链路**：Holopix 一键成稿（角色立绘）→ 可灵 API（图生视频）→ FFmpeg 抽帧 → 批量抠图 → Sprite Sheet
> **成本**：每角色每动作约 ¥2（可灵）+ Holopix 算力
> **耗时**：单角色单动作约 5~8 分钟（含视频生成等待）

---

## 一、前置准备

### 1.1 开通服务

| 服务 | 地址 | 用途 |
|------|------|------|
| **Holopix** | [holopix.cn](https://holopix.cn) | 生成角色立绘（首帧图片） |
| **阿里云百炼** | [bailian.console.aliyun.com](https://bailian.console.aliyun.com/cn-beijing/?tab=model#/model-market/all) | 调用可灵 API 生成视频 |
| **FFmpeg** | `pip install ffmpeg-python` 或系统安装 | 视频抽帧 |

### 1.2 阿里云百炼开通可灵

```
1. 注册/登录阿里云账号
2. 进入百炼控制台 → 搜索"kling"
3. 找到「可灵AI」模型卡片 → 点击「立即开通」
4. 进入「API-KEY管理」→ 创建 API Key（选择北京地域）
5. 保存 API Key（格式：sk-xxxx）
```

### 1.3 安装依赖

```bash
# Python 环境（3.8+）
pip install requests pillow ffmpeg-python

# FFmpeg 系统安装
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg

# Windows：下载 https://ffmpeg.org/download.html
```

---

## 二、完整 SOP 流程（6步）

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 第1步       │     │ 第2步       │     │ 第3步       │
│ Holopix出图  │────→│ 上传图片    │────→│ 可灵API     │
│ 角色立绘     │     │ 获取URL     │     │ 图生视频     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
┌─────────────┐     ┌─────────────┐     ┌──────▼──────┐
│ 第6步       │     │ 第5步       │     │ 第4步       │
│ 拼接Sprite  │←────│ 批量抠图    │←────│ FFmpeg抽帧  │
│ Sheet       │     │ 统一尺寸    │     │ 视频转图片   │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 第1步：Holopix 生成角色立绘（首帧）

### 1.1 操作

1. 进入 Holopix「一键成稿」
2. 选择风格模型（如"Q版角色"）
3. 输入提示词，生成角色**正面站姿**图片
4. 使用「局部细化」精修
5. 使用「一键抠图」去除背景 → 导出 **透明PNG**
6. 使用「超清放大」提升至 1024×1024

### 1.2 关键要求

首帧图片是动作帧生成的**基准**，质量直接决定最终效果：

| 要求 | 说明 |
|------|------|
| 背景 | **纯色或透明**（便于后续抠图） |
| 姿势 | **标准站姿**，双手自然下垂或持武器 |
| 朝向 | **面朝正前方/正下方**（作为基准方向） |
| 尺寸 | **1024×1024** 或更大 |
| 格式 | **PNG**（不支持透明通道的JPG会导致边缘问题） |

### 1.3 示例提示词（关羽）

```
Q版三国武将关羽，大头小身体二头身比例，俯视角45度视角，角色面朝画面正下方，红脸膛，飘逸长须，头戴绿巾冠，身披绿色战袍外罩轻甲，右手拖青龙偃月刀，纯色浅灰背景，游戏角色立绘，白色描边，平涂色块，清晰线条，干净背景
```

---

## 第2步：上传首帧图片获取公网 URL

可灵 API 需要**公网可访问的图片 URL**，有以下几种方式：

### 方式A：上传到阿里云 OSS（推荐）

```python
import oss2

# 阿里云 OSS 配置
auth = oss2.Auth('your-access-key-id', 'your-access-key-secret')
bucket = oss2.Bucket(auth, 'https://oss-cn-beijing.aliyuncs.com', 'your-bucket-name')

# 上传图片
bucket.put_object_from_file('characters/guanyu.png', './guanyu.png')

# 获取公网 URL
image_url = 'https://your-bucket-name.oss-cn-beijing.aliyuncs.com/characters/guanyu.png'
print(image_url)
```

### 方式B：使用图床

上传到任意免费图床（如 imgbb、SM.MS），获取直链 URL。

### 方式C：使用飞书云盘（如果已集成）

通过 OpenClaw 飞书插件上传到云盘，获取临时下载链接。

---

## 第3步：可灵 API 图生视频

### 3.1 API 参数

| 参数 | 值 | 说明 |
|------|-----|------|
| Endpoint | `https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis` | 北京地域 |
| 模型 | `kling/kling-v3-video-generation` | 可灵V3（无声） |
| 认证 | `Bearer sk-你的百炼API-Key` | 百炼 API Key |
| 异步头 | `X-DashScope-Async: enable` | **必须设置** |

### 3.2 完整 Python 代码

```python
import requests
import time
import os

# ============ 配置 ============
API_KEY = "sk-你的百炼API-Key"  # 替换为你的阿里云百炼 API Key
BASE_URL = "https://dashscope.aliyuncs.com/api/v1"
MODEL = "kling/kling-v3-video-generation"  # 可灵V3无声版（更便宜）
# MODEL = "kling/kling-v3-omni-video-generation"  # 可灵V3有声版

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "X-DashScope-Async": "enable"  # 必须：异步模式
}

# ============ 步骤1：提交图生视频任务 ============
def submit_video_task(image_url: str, prompt: str, duration: int = 5) -> str:
    """
    提交图生视频任务
    :param image_url: 首帧图片公网URL
    :param prompt: 动作描述提示词
    :param duration: 视频时长（秒），3~15
    :return: task_id
    """
    payload = {
        "model": MODEL,
        "input": {
            "prompt": prompt,
            "media": [
                {
                    "type": "first_frame",  # 首帧图片
                    "url": image_url
                }
            ]
        },
        "parameters": {
            "mode": "std",       # std=720P（便宜），pro=1080P（贵）
            "duration": duration, # 视频时长
            "audio": False        # 不生成音频（省钱）
        }
    }

    response = requests.post(
        f"{BASE_URL}/services/aigc/video-generation/video-synthesis",
        headers=HEADERS,
        json=payload
    )
    result = response.json()

    if "output" in result:
        task_id = result["output"]["task_id"]
        print(f"✅ 任务提交成功！task_id: {task_id}")
        return task_id
    else:
        print(f"❌ 任务提交失败：{result}")
        return None


# ============ 步骤2：轮询查询任务结果 ============
def poll_task_result(task_id: str, interval: int = 15, max_wait: int = 600) -> str:
    """
    轮询查询视频生成结果
    :param task_id: 任务ID
    :param interval: 轮询间隔（秒）
    :param max_wait: 最大等待时间（秒）
    :return: 视频下载URL
    """
    url = f"{BASE_URL}/tasks/{task_id}"
    start_time = time.time()

    while time.time() - start_time < max_wait:
        response = requests.get(url, headers={"Authorization": f"Bearer {API_KEY}"})
        result = response.json()

        status = result.get("output", {}).get("task_status", "UNKNOWN")
        print(f"  状态: {status} (已等待 {int(time.time()-start_time)}秒)")

        if status == "SUCCEEDED":
            video_url = result["output"]["video_url"]
            usage = result.get("usage", {})
            print(f"✅ 视频生成成功！")
            print(f"   分辨率: {usage.get('size', 'N/A')}")
            print(f"   时长: {usage.get('duration', 'N/A')}秒")
            print(f"   帧率: {usage.get('fps', 'N/A')}fps")
            print(f"   视频URL: {video_url}")
            return video_url
        elif status == "FAILED":
            print(f"❌ 视频生成失败：{result.get('message', '未知错误')}")
            return None

        time.sleep(interval)

    print("⏰ 超时，任务未完成")
    return None


# ============ 步骤3：下载视频 ============
def download_video(video_url: str, save_path: str):
    """下载视频到本地"""
    response = requests.get(video_url, stream=True)
    with open(save_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"✅ 视频已保存: {save_path}")


# ============ 完整执行 ============
if __name__ == "__main__":
    # 配置
    IMAGE_URL = "https://your-bucket.oss-cn-beijing.aliyuncs.com/guanyu.png"
    PROMPT = "Q版卡通角色在原地缓慢旋转360度，展示8个不同朝向，纯色背景"
    DURATION = 10  # 10秒视频，足够旋转360度
    OUTPUT_DIR = "./output"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. 提交任务
    task_id = submit_video_task(IMAGE_URL, PROMPT, DURATION)

    if task_id:
        # 2. 轮询等待
        video_url = poll_task_result(task_id)

        if video_url:
            # 3. 下载视频
            video_path = f"{OUTPUT_DIR}/guanyu_rotate.mp4"
            download_video(video_url, video_path)
```

### 3.3 各动作类型的提示词

| 动作 | 提示词 | 建议时长 |
|------|--------|---------|
| **8方向旋转** | `Q版卡通角色在原地缓慢旋转360度，纯色背景，俯视角` | 10秒 |
| **行走** | `Q版卡通角色向前行走，手臂自然摆动，纯色背景，俯视角` | 5秒 |
| **跑步** | `Q版卡通角色向前奔跑，披风飘动，纯色背景，俯视角` | 5秒 |
| **攻击** | `Q版卡通角色挥刀攻击，从右上方劈向左下方，纯色背景` | 5秒 |
| **待机** | `Q版卡通角色原地轻微呼吸起伏，纯色背景` | 5秒 |
| **受击** | `Q版卡通角色身体向后仰倒，双手护胸，纯色背景` | 5秒 |

---

## 第4步：FFmpeg 视频抽帧

### 4.1 抽取全部帧

```bash
# 抽取全部帧（24fps，10秒视频 = 240帧）
ffmpeg -i guanyu_rotate.mp4 -vf "fps=24" frames/frame_%04d.png

# 创建输出目录
mkdir -p frames
```

### 4.2 均匀抽取8方向帧

```python
import os
import shutil

def extract_8_directions(video_path: str, output_dir: str, total_frames: int = 240):
    """
    从旋转视频中均匀抽取8个方向的帧
    :param video_path: 视频路径
    :param output_dir: 输出目录
    :param total_frames: 视频总帧数（10秒×24fps=240）
    """
    os.makedirs(output_dir, exist_ok=True)

    # 先抽取全部帧到临时目录
    tmp_dir = "./tmp_frames"
    os.makedirs(tmp_dir, exist_ok=True)
    os.system(f"ffmpeg -y -i {video_path} -vf 'fps=24' {tmp_dir}/frame_%04d.png")

    # 获取所有帧文件
    all_frames = sorted([f for f in os.listdir(tmp_dir) if f.endswith('.png')])

    # 每45度取一帧（360/8=45度，240帧/8=30帧间隔）
    directions = {
        "south": 0,       # 0° 正面朝下
        "southeast": 30,  # 45°
        "east": 60,       # 90°
        "northeast": 90,  # 135°
        "north": 120,     # 180° 背面
        "northwest": 150, # 225°
        "west": 180,      # 270°
        "southwest": 210, # 315°
    }

    for direction, frame_idx in directions.items():
        if frame_idx < len(all_frames):
            src = os.path.join(tmp_dir, all_frames[frame_idx])
            dst = os.path.join(output_dir, f"{direction}.png")
            shutil.copy2(src, dst)
            print(f"  ✅ {direction}: frame {frame_idx} → {dst}")

    # 清理临时目录
    shutil.rmtree(tmp_dir)
    print(f"\n✅ 8方向帧已提取到: {output_dir}/")

# 使用
extract_8_directions("./output/guanyu_rotate.mp4", "./output/guanyu_8dir")
```

### 4.3 抽取动作帧（行走/跑步/攻击等）

```python
def extract_action_frames(video_path: str, output_dir: str, fps: int = 8):
    """
    从动作视频中抽取关键帧
    :param video_path: 视频路径
    :param output_dir: 输出目录
    :param fps: 抽取帧率（8fps适合游戏动画）
    """
    os.makedirs(output_dir, exist_ok=True)
    cmd = f"ffmpeg -y -i {video_path} -vf 'fps={fps}' {output_dir}/frame_%03d.png"
    os.system(cmd)
    print(f"✅ 动作帧已提取到: {output_dir}/ ({fps}fps)")
```

---

## 第5步：批量抠图 + 统一尺寸

### 5.1 自动抠图（去除背景残留）

```python
from PIL import Image
import numpy as np

def remove_background(input_path: str, output_path: str, threshold: int = 240):
    """
    简易背景去除（适用于纯色/浅色背景）
    对于复杂背景，建议使用 remove.bg API 或 Holopix 一键抠图
    """
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    # 将接近白色的像素设为透明
    # 检测 RGB 三个通道都接近 threshold 的像素
    mask = (
        (data[:, :, 0] > threshold) &
        (data[:, :, 1] > threshold) &
        (data[:, :, 2] > threshold)
    )
    data[mask, 3] = 0  # 设为透明

    result = Image.fromarray(data)
    result.save(output_path)
    print(f"  ✅ 抠图完成: {output_path}")

# 批量处理
import glob

for filepath in glob.glob("./output/guanyu_8dir/*.png"):
    remove_background(filepath, filepath.replace(".png", "_clean.png"))
```

### 5.2 统一尺寸 + 居中裁剪

```python
def normalize_frame(input_path: str, output_path: str, target_size: tuple = (256, 256)):
    """
    统一帧尺寸：等比缩放 + 居中放置
    :param target_size: 目标尺寸 (宽, 高)
    """
    img = Image.open(input_path).convert("RGBA")

    # 等比缩放（fit）
    img.thumbnail(target_size, Image.LANCZOS)

    # 创建目标画布（透明背景）
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))

    # 居中粘贴
    offset_x = (target_size[0] - img.width) // 2
    offset_y = (target_size[1] - img.height) // 2
    canvas.paste(img, (offset_x, offset_y), img)

    canvas.save(output_path)

# 批量处理
for filepath in glob.glob("./output/guanyu_8dir/*_clean.png"):
    normalize_frame(filepath, filepath.replace("_clean.png", "_final.png"))
```

---

## 第6步：拼接 Sprite Sheet

### 6.1 拼接脚本

```python
from PIL import Image
import glob
import os

def create_sprite_sheet(frame_dir: str, output_path: str,
                        columns: int = 8, frame_size: tuple = (256, 256)):
    """
    将帧序列拼接为 Sprite Sheet
    :param frame_dir: 帧图片目录
    :param output_path: 输出路径
    :param columns: 每行列数
    :param frame_size: 每帧尺寸
    """
    # 获取所有帧文件并排序
    frames = sorted(glob.glob(os.path.join(frame_dir, "*_final.png")))

    if not frames:
        print(f"❌ 未找到帧文件: {frame_dir}")
        return

    rows = (len(frames) + columns - 1) // columns
    sheet_width = columns * frame_size[0]
    sheet_height = rows * frame_size[1]

    sheet = Image.new("RGBA", (sheet_width, sheet_height), (0, 0, 0, 0))

    for idx, frame_path in enumerate(frames):
        img = Image.open(frame_path).resize(frame_size, Image.LANCZOS)
        col = idx % columns
        row = idx // columns
        x = col * frame_size[0]
        y = row * frame_size[1]
        sheet.paste(img, (x, y))

    sheet.save(output_path)
    print(f"✅ Sprite Sheet 已生成: {output_path}")
    print(f"   尺寸: {sheet_width}×{sheet_height}")
    print(f"   帧数: {len(frames)} ({rows}行 × {columns}列)")

# 8方向 Sprite Sheet
create_sprite_sheet(
    "./output/guanyu_8dir",
    "./output/guanyu_8dir_spritesheet.png",
    columns=8,  # 8个方向排一行
    frame_size=(256, 256)
)

# 行走动画 Sprite Sheet
create_sprite_sheet(
    "./output/guanyu_walk",
    "./output/guanyu_walk_spritesheet.png",
    columns=6,  # 6帧排一行
    frame_size=(256, 256)
)
```

### 6.2 使用 TexturePacker（专业工具）

```bash
# 安装 TexturePacker CLI
# 或使用在线工具 https://www.codeandweb.com/texturepacker

# 命令行拼接
TexturePacker --format unity-texture2d \
  --data output/spritesheet.tpsheet \
  --sheet output/spritesheet.png \
  --size 2048x2048 \
  --padding 0 \
  --extrude 0 \
  ./output/guanyu_8dir/*_final.png
```

---

## 三、批量生产脚本（一键执行全流程）

```python
"""
一键执行：Holopix图片 → 可灵视频 → 抽帧 → Sprite Sheet
"""
import os
import requests
import time
import shutil
import glob
from PIL import Image
import numpy as np

# ============ 配置 ============
API_KEY = "sk-你的百炼API-Key"
MODEL = "kling/kling-v3-video-generation"
BASE_URL = "https://dashscope.aliyuncs.com/api/v1"
OUTPUT_DIR = "./game_assets"
FRAME_SIZE = (256, 256)

# 角色配置
CHARACTERS = {
    "guanyu": {
        "name": "关羽",
        "image_url": "https://your-oss/guanyu.png",
        "actions": {
            "rotate": {"prompt": "Q版卡通角色缓慢旋转360度，纯色背景", "duration": 10},
            "walk":   {"prompt": "Q版卡通角色向前行走，手臂摆动，纯色背景", "duration": 5},
            "attack": {"prompt": "Q版卡通角色挥刀攻击，纯色背景", "duration": 5},
        }
    },
    # 可继续添加其他角色...
}

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "X-DashScope-Async": "enable"
}

# ============ 核心函数 ============

def generate_video(image_url, prompt, duration):
    """提交可灵API图生视频任务并等待完成"""
    # 提交任务
    payload = {
        "model": MODEL,
        "input": {
            "prompt": prompt,
            "media": [{"type": "first_frame", "url": image_url}]
        },
        "parameters": {"mode": "std", "duration": duration, "audio": False}
    }
    resp = requests.post(f"{BASE_URL}/services/aigc/video-generation/video-synthesis",
                         headers=HEADERS, json=payload).json()
    task_id = resp["output"]["task_id"]
    print(f"  📤 任务已提交: {task_id}")

    # 轮询等待
    for _ in range(60):  # 最多等15分钟
        time.sleep(15)
        result = requests.get(f"{BASE_URL}/tasks/{task_id}",
                             headers={"Authorization": f"Bearer {API_KEY}"}).json()
        status = result["output"]["task_status"]
        if status == "SUCCEEDED":
            return result["output"]["video_url"]
        elif status == "FAILED":
            raise Exception(f"视频生成失败: {result.get('message')}")
    raise TimeoutError("视频生成超时")


def video_to_frames(video_url, output_dir, fps=8):
    """下载视频并抽帧"""
    os.makedirs(output_dir, exist_ok=True)
    video_path = f"{output_dir}/video.mp4"
    # 下载
    r = requests.get(video_url, stream=True)
    with open(video_path, 'wb') as f:
        for chunk in r.iter_content(8192): f.write(chunk)
    # 抽帧
    os.system(f"ffmpeg -y -i {video_path} -vf 'fps={fps}' {output_dir}/frame_%03d.png")
    os.remove(video_path)


def clean_and_normalize(frame_dir, size=FRAME_SIZE):
    """抠图 + 统一尺寸"""
    for fp in glob.glob(f"{frame_dir}/frame_*.png"):
        img = Image.open(fp).convert("RGBA")
        data = np.array(img)
        mask = (data[:,:,0]>240) & (data[:,:,1]>240) & (data[:,:,2]>240)
        data[mask, 3] = 0
        img = Image.fromarray(data)
        img.thumbnail(size, Image.LANCZOS)
        canvas = Image.new("RGBA", size, (0,0,0,0))
        canvas.paste(img, ((size[0]-img.width)//2, (size[1]-img.height)//2), img)
        canvas.save(fp)


def make_spritesheet(frame_dir, output_path, columns=8):
    """拼接Sprite Sheet"""
    frames = sorted(glob.glob(f"{frame_dir}/frame_*.png"))
    if not frames: return
    rows = (len(frames) + columns - 1) // columns
    sheet = Image.new("RGBA", (columns*FRAME_SIZE[0], rows*FRAME_SIZE[1]), (0,0,0,0))
    for i, fp in enumerate(frames):
        img = Image.open(fp).resize(FRAME_SIZE, Image.LANCZOS)
        sheet.paste(img, ((i%columns)*FRAME_SIZE[0], (i//columns)*FRAME_SIZE[1]))
    sheet.save(output_path)
    print(f"  📦 Sprite Sheet: {output_path} ({len(frames)}帧)")


# ============ 主流程 ============

def process_character(char_id, char_config):
    """处理单个角色的所有动作"""
    print(f"\n{'='*50}")
    print(f"🎮 处理角色: {char_config['name']} ({char_id})")
    print(f"{'='*50}")

    char_dir = f"{OUTPUT_DIR}/{char_id}"
    os.makedirs(char_dir, exist_ok=True)

    for action_name, action_config in char_config["actions"].items():
        print(f"\n  🎬 动作: {action_name}")

        action_dir = f"{char_dir}/{action_name}"
        if os.path.exists(action_dir) and len(glob.glob(f"{action_dir}/frame_*.png")) > 0:
            print(f"  ⏭️  已存在，跳过")
            continue

        try:
            # 1. 可灵API生成视频
            video_url = generate_video(
                char_config["image_url"],
                action_config["prompt"],
                action_config["duration"]
            )

            # 2. 抽帧
            fps = 8 if action_name != "rotate" else 24
            video_to_frames(video_url, action_dir, fps=fps)

            # 3. 抠图 + 统一尺寸
            clean_and_normalize(action_dir)

            # 4. 拼接 Sprite Sheet
            columns = 8 if action_name == "rotate" else 6
            make_spritesheet(action_dir, f"{action_dir}/spritesheet.png", columns=columns)

        except Exception as e:
            print(f"  ❌ 处理失败: {e}")


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for char_id, char_config in CHARACTERS.items():
        process_character(char_id, char_config)

    print(f"\n{'='*50}")
    print(f"✅ 全部完成！素材保存在: {OUTPUT_DIR}/")
    print(f"{'='*50}")
```

---

## 四、成本与时间估算

### 4.1 单角色全套动作帧

| 步骤 | 耗时 | 费用 |
|------|------|------|
| Holopix 生成首帧 | 1分钟 | ~1算力 |
| 可灵 旋转视频（10秒） | 3~5分钟 | ≈¥2 |
| 可灵 行走视频（5秒） | 2~3分钟 | ≈¥1 |
| 可灵 跑步视频（5秒） | 2~3分钟 | ≈¥1 |
| 可灵 攻击视频（5秒） | 2~3分钟 | ≈¥1 |
| 可灵 待机视频（5秒） | 2~3分钟 | ≈¥1 |
| 抽帧+抠图+拼接 | <1分钟 | 免费 |
| **合计** | **约15分钟** | **≈¥6** |

### 4.2 五虎将全套

| 项目 | 数量 | 费用 |
|------|------|------|
| 5个角色 × 5种动作 | 25个视频 | **≈¥30** |
| Holopix 首帧（5张） | 5张 | ≈5算力 |
| **总计** | — | **≈¥30** |

---

## 五、目录结构规范

```
game_assets/
├── guanyu/
│   ├── rotate/
│   │   ├── spritesheet.png        # 8方向 Sprite Sheet
│   │   └── frame_001.png ~ 192    # 原始帧（可选保留）
│   ├── walk/
│   │   └── spritesheet.png        # 行走动画 Sprite Sheet
│   ├── run/
│   │   └── spritesheet.png
│   ├── attack/
│   │   └── spritesheet.png
│   └── idle/
│       └── spritesheet.png
├── zhangfei/
│   └── ...（同上结构）
├── zhaoyun/
│   └── ...
├── machao/
│   └── ...
└── huangzhong/
    └── ...
```

---

## 六、接入 OpenClaw 自动化（进阶）

如果已配置 OpenClaw + 飞书，可将上述流程封装为 OpenClaw Skill：

```
飞书群 @机器人 → "批量生成关羽全套动作帧"
    ↓
OpenClaw 解析指令
    ↓
调用 Holopix API 生成首帧（或从云盘获取已有立绘）
    ↓
调用可灵 API 批量生成视频（5个动作并行提交）
    ↓
FFmpeg 抽帧 + 抠图 + 拼接
    ↓
上传 Sprite Sheet 到飞书云盘
    ↓
飞书群通知完成，附带下载链接
```

将批量生产脚本保存为 `kling_pipeline.py`，OpenClaw 通过 `bash` 工具调用即可：

```yaml
# OpenClaw Agent 配置片段
workflow:
  step1_generate_first_frame:
    action: holopix_generate
    # 或从飞书云盘获取已有立绘
  
  step2_generate_videos:
    action: bash
    command: "python3 kling_pipeline.py --character guanyu --actions rotate,walk,attack"
  
  step3_upload:
    action: feishu_drive_upload
    folder: "游戏素材库/三国五虎将/关羽"
  
  step4_notify:
    action: feishu_notify
    template: "✅ 关羽全套动作帧生成完成！[查看素材](链接)"
```
