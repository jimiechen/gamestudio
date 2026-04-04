# HoloPix 模型调试器计划

## 目标

创建一个本地HTML页面，用于调试 HoloPix API 的模型列表和参数。

## 功能需求

### 1. 模型列表查询

* **接口**: `POST /v1/model/apiList`

* **功能**: 查询账号下可用的模型列表

* **展示字段**:

  * modelName (模型名称)

  * id (模型唯一代码)

  * modelType (模型类型)

  * styleType (风格类型)

  * modelTags (模型标签)

  * introduction (模型简介)

  * baseModel (基础模型)

  * coverImage (封面图)

  * commercialLicense (商用许可)

### 2. 文生图参数调试

* **接口**: `POST /v1/images/generations/t2i`

* **可调参数**:

  * modelDetailList (模型列表，包含 modelId 和 strength)

  * prompt (正向提示词)

  * negativePrompt (反向提示词)

  * aspectRatios (宽高比: 16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9)

  * seed (随机种子，-1为随机)

  * hdFix (高清修复，true/false)

  * hdScale (高清倍数: 1.5, 2)

  * faceDetail (脸部修复，true/false)

  * batchSize (出图数: 1-4)

  * enablePerturb (画面增强，true/false)

  * perturb (增强强度: 0-5)

  * simpleBackground (简单背景，true/false)

### 3. 任务查询

* **接口**: `POST /v1/images/generations/queryProgress`

* **功能**: 查询任务状态和下载图片

### 4. 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  HoloPix 模型调试器                                          │
├──────────────┬──────────────────────────────────────────────┤
│  配置区域     │  模型列表                                     │
│  - API Key   │  (表格展示可用模型)                            │
│  - Secret Key├──────────────────────────────────────────────┤
│              │  文生图参数调试                                │
├──────────────┤  - 模型选择 (下拉框)                           │
│  操作按钮     │  - 提示词输入框                               │
│  - 查询模型  │  - 反向提示词输入框                            │
│  - 生成图片  │  - 参数滑块/选择框                            │
│  - 查询任务  │                                               │
├──────────────┴──────────────────────────────────────────────┤
│  结果展示区域                                                │
│  - 请求参数 (JSON)                                          │
│  - 响应结果 (JSON)                                          │
│  - 生成的图片预览                                            │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

* HTML5 + CSS3 + JavaScript (原生)

* 使用 Fetch API 调用 HoloPix API

* 本地文件运行 (file:// 或 localhost)

## 实现步骤

1. **创建基础HTML结构**

   * 页面布局和样式

   * 表单输入区域

   * 结果展示区域

2. **实现签名算法 (JavaScript)**

   * HMAC-SHA256 签名

   * 时间戳生成

   * Nonce生成

3. **实现模型列表查询**

   * 调用 /v1/model/apiList

   * 解析并展示模型列表

4. **实现文生图功能**

   * 参数表单

   * 调用 /v1/images/generations/t2i

   * 展示生成结果

5. **实现任务查询功能**

   * 调用 /v1/images/generations/queryProgress

   * 轮询任务状态

   * 图片预览

## 文件输出

* 输出路径: `.trae/skills/holopix-asset-generator/model-debugger.html`

