# 素材调试工程

独立的素材调试工程，包含服务端和SQLite数据库，用于调试和管理HoloPix生成的素材。

## 项目结构

```
asset-debugger/
├── server/                 # 服务端
│   ├── app.py             # Flask主应用
│   ├── models.py          # 数据库模型
│   ├── database.py        # 数据库连接
│   ├── api/
│   │   ├── __init__.py
│   │   ├── models.py      # 模型列表API
│   │   ├── generate.py    # 生成图片API
│   │   └── tasks.py       # 任务查询API
│   └── static/            # 静态文件
│       └── uploads/       # 上传的图片
├── frontend/              # 前端
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── database/              # 数据库
│   └── asset_debugger.db  # SQLite数据库
├── config.py              # 配置文件
├── requirements.txt       # Python依赖
└── run.py                 # 启动脚本
```

## 功能特性

1. **模型管理**
   - 查询可用模型列表
   - 保存模型信息到数据库
   - 模型参数配置

2. **素材生成**
   - 调用HoloPix API生成图片
   - 保存生成记录到数据库
   - 支持批量生成

3. **任务管理**
   - 查询任务状态
   - 自动下载完成的图片
   - 任务历史记录

4. **素材库**
   - 浏览已生成的素材
   - 按角色/类型筛选
   - 导出素材包

## 快速开始

### 1. 安装依赖

```bash
cd projects/asset-debugger
pip install -r requirements.txt
```

### 2. 配置API密钥

编辑 `config.py`，填入你的HoloPix API密钥：

```python
HOLOPIX_ACCESS_KEY = "your_access_key"
HOLOPIX_SECRET_KEY = "your_secret_key"
```

### 3. 启动服务

```bash
python run.py
```

### 4. 访问调试器

打开浏览器访问：`http://localhost:5000`

## API文档

### 模型列表
- **GET** `/api/models` - 获取所有模型
- **POST** `/api/models/sync` - 同步HoloPix模型列表

### 素材生成
- **POST** `/api/generate` - 生成图片
- **GET** `/api/generate/:id` - 获取生成记录

### 任务管理
- **GET** `/api/tasks` - 获取任务列表
- **GET** `/api/tasks/:client_id` - 查询任务状态
- **POST** `/api/tasks/:client_id/download` - 下载图片

### 素材库
- **GET** `/api/assets` - 获取素材列表
- **GET** `/api/assets/:id` - 获取素材详情
- **DELETE** `/api/assets/:id` - 删除素材
