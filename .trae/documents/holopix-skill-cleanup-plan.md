# HoloPix Asset Generator Skill 清理计划

## 当前问题分析

### 文件冗余情况
当前skill目录包含大量测试和调试文件，需要清理：

**核心文件（保留）:**
- `SKILL.md` - Skill定义文件
- `README.md` - 说明文档
- `holopix_client.py` - Python API客户端（主要实现）
- `requirements.txt` - Python依赖

**需要删除的冗余文件:**

#### JavaScript相关（API已转向Python实现）
- `holopix-client.js` - JavaScript客户端（与Python重复）
- `generate-characters.js` - JavaScript生成脚本
- `test-api.js` - JavaScript测试脚本
- `test-official.js` - 官方测试脚本
- `test-exact-match.js` - 签名测试
- `test-signature-variations.js` - 签名变体测试
- `diagnose-api.js` - API诊断脚本
- `package.json` - Node.js配置
- `package-lock.json` - Node.js锁定文件

#### Python测试/调试脚本（保留核心功能即可）
- `test_api.py` - API测试
- `test_base_urls.py` - URL测试
- `test_body_formats.py` - 请求体格式测试
- `test_custom_model.py` - 自定义模型测试
- `test_endpoints.py` - 端点测试
- `test_minimal.py` - 最小化测试
- `test_models.py` - 模型测试
- `test_more_formats.py` - 更多格式测试
- `test_reference_mode.py` - 参考模式测试
- `test_signature.py` - 签名测试
- `test_signature_formats.py` - 签名格式测试
- `test_status.py` - 状态测试
- `compare-signatures.py` - 签名对比
- `check_model_details.py` - 模型详情检查
- `list_all_models.py` - 列出所有模型
- `query_models.py` - 查询模型

#### 角色生成脚本（合并简化）
- `generate_guanyu.py` - 生成关羽
- `generate_guanyu_35head.py` - 生成关羽(3.5头身)
- `generate_guanyu_attack.py` - 生成关羽攻击动作
- `generate_guanyu_attack_v2.py` - 生成关羽攻击动作v2
- `generate_guanyu_hanri.py` - 生成关羽(韩日风格)
- `generate_guanyu_warcraft.py` - 生成关羽(魔兽风格)
- `generate_lvbu.py` - 生成吕布
- `generate_zhaoyun.py` - 生成赵云
- `generate_zhugeliang.py` - 生成诸葛亮
- `generate_zhangfei_human.py` - 生成张飞(真人风格)
- `generate_zhangfei_35head.py` - 生成张飞(3.5头身)
- `generate_five_tigers.py` - 生成五虎将
- `generate_wuhu_generals.py` - 生成五虎将(另一版本)
- `generate_wuhu_generals_v2.py` - 生成五虎将v2
- `generate_wuhu_guofeng.py` - 生成五虎将(国风)
- `generate_mvp_characters.py` - 生成MVP角色
- `generate_only.py` - 单独生成
- `generate_sprite_sheet.py` - 生成精灵表
- `quick_generate_example.py` - 快速生成示例
- `holopix_toolkit.py` - 工具包

#### 调试报告
- `api-debug-report.md` - API调试报告
- `model-debugger.html` - 模型调试器

## 清理方案

### 步骤1: 删除JavaScript相关文件
删除所有Node.js相关文件，因为主要实现已转向Python。

### 步骤2: 删除测试/调试脚本
删除所有测试和调试脚本，只保留核心的API客户端。

### 步骤3: 删除重复的角色生成脚本
删除所有单独的角色生成脚本，这些功能可以通过核心客户端实现。

### 步骤4: 删除调试报告
删除调试相关的文档和HTML文件。

### 步骤5: 更新SKILL.md
简化SKILL.md，移除过时的JavaScript使用说明，保留Python客户端的使用方式。

### 步骤6: 更新README.md
更新README.md，反映清理后的文件结构。

## 保留文件清单

```
holopix-asset-generator/
├── SKILL.md              # Skill定义（更新）
├── README.md             # 说明文档（更新）
├── holopix_client.py     # Python API客户端
└── requirements.txt      # Python依赖
```

## 删除文件清单

### JavaScript文件 (8个)
1. holopix-client.js
2. generate-characters.js
3. test-api.js
4. test-official.js
5. test-exact-match.js
6. test-signature-variations.js
7. diagnose-api.js
8. package.json
9. package-lock.json

### Python测试脚本 (13个)
1. test_api.py
2. test_base_urls.py
3. test_body_formats.py
4. test_custom_model.py
5. test_endpoints.py
6. test_minimal.py
7. test_models.py
8. test_more_formats.py
9. test_reference_mode.py
10. test_signature.py
11. test_signature_formats.py
12. test_status.py
13. compare-signatures.py
14. check_model_details.py
15. list_all_models.py
16. query_models.py

### 角色生成脚本 (18个)
1. generate_guanyu.py
2. generate_guanyu_35head.py
3. generate_guanyu_attack.py
4. generate_guanyu_attack_v2.py
5. generate_guanyu_hanri.py
6. generate_guanyu_warcraft.py
7. generate_lvbu.py
8. generate_zhaoyun.py
9. generate_zhugeliang.py
10. generate_zhangfei_human.py
11. generate_zhangfei_35head.py
12. generate_five_tigers.py
13. generate_wuhu_generals.py
14. generate_wuhu_generals_v2.py
15. generate_wuhu_guofeng.py
16. generate_mvp_characters.py
17. generate_only.py
18. generate_sprite_sheet.py
19. quick_generate_example.py
20. holopix_toolkit.py

### 调试文件 (2个)
1. api-debug-report.md
2. model-debugger.html

总计: 约42个文件将被删除
