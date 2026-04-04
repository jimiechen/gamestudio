# HoloPix Asset Generator Skill

使用 HoloPix AI API 生成Q版卡通风格游戏美术资源。

## 文件结构

```
holopix-asset-generator/
├── SKILL.md              # Skill 定义
├── README.md             # 本文档
├── holopix_client.py     # Python API 客户端
└── requirements.txt      # Python 依赖
```

## 使用方法

### 安装依赖

```bash
pip install -r requirements.txt
```

### 生成Q版武将

```python
from holopix_client import HolopixClient, ChibiCharacterGenerator

client = HolopixClient()
generator = ChibiCharacterGenerator(client)

result = generator.generate(
    name="Guan Yu",
    description="red face, long black beard, legendary warrior",
    weapon="Green Dragon Crescent Blade",
    armor="green robe with golden trim",
    output_path="assets/characters"
)
```

### 生成表情包

```python
from holopix_client import HolopixClient, EmoticonGenerator

client = HolopixClient()
generator = EmoticonGenerator(client)

result = generator.generate(
    name="Guan Yu",
    description="red face, long black beard",
    expressions=['happy', 'angry', 'cool', 'surprised'],
    output_path="assets/emoticons"
)
```

## API 客户端功能

- `HolopixClient` - 核心API客户端，支持图片生成、状态查询、图片下载
- `ChibiCharacterGenerator` - Q版武将生成器
- `EmoticonGenerator` - 表情包生成器
