---
name: "holopix-asset-generator"
description: "使用 HoloPix AI API 生成Q版卡通风格游戏美术资源。Invoke when user needs to generate chibi-style game assets, character sprites, emoticons, or scene tiles for the Three Kingdoms roguelike game."
---

# HoloPix Asset Generator

使用 HoloPix AI API 生成Q版卡通风格游戏美术资源。

## 使用方法

```python
from holopix_client import HolopixClient, ChibiCharacterGenerator

# 初始化客户端
client = HolopixClient()

# 生成Q版武将
generator = ChibiCharacterGenerator(client)
result = generator.generate(
    name="Guan Yu",
    description="red face, long black beard, legendary warrior",
    weapon="Green Dragon Crescent Blade",
    armor="green robe with golden trim",
    output_path="assets/characters"
)
```

## 文件说明

- `holopix_client.py` - Python API 客户端，包含 HolopixClient、ChibiCharacterGenerator、EmoticonGenerator 类
- `requirements.txt` - Python 依赖

## 依赖安装

```bash
pip install -r requirements.txt
```
