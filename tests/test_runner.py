# -*- coding: utf-8 -*-
"""
自测脚本 - 测试所有功能是否正常工作
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000"
API_URL = f"{BASE_URL}/api"


def test_api(endpoint, method="GET", data=None, description=""):
    """测试API接口"""
    try:
        url = f"{API_URL}/{endpoint}"
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, timeout=10)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ {description}")
                return True, result
            else:
                print(f"❌ {description} - API返回失败: {result.get('error')}")
                return False, result
        else:
            print(f"❌ {description} - HTTP {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ {description} - 异常: {e}")
        return False, None


def run_tests():
    """运行所有测试"""
    print("=" * 60)
    print("🧪 HoloPix 素材调试器 - 功能自测")
    print("=" * 60)

    passed = 0
    failed = 0

    # 1. 测试页面加载
    print("\n📄 1. 页面加载测试")
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200 and "HoloPix 素材调试器" in response.text:
            print("✅ 首页加载成功")
            passed += 1
        else:
            print("❌ 首页加载失败")
            failed += 1
    except Exception as e:
        print(f"❌ 首页加载异常: {e}")
        failed += 1

    # 2. 测试模型列表API
    print("\n🤖 2. 模型管理API测试")
    success, _ = test_api("models", description="获取模型列表")
    if success:
        passed += 1
    else:
        failed += 1

    # 3. 测试火柴人姿势API
    print("\n🎭 3. 火柴人姿势API测试")
    success, result = test_api("stickman/poses", description="获取姿势列表")
    if success:
        passed += 1
        poses = result.get('data', [])
        print(f"   找到 {len(poses)} 个姿势")
    else:
        failed += 1

    # 4. 测试快捷应用API
    print("\n⚡ 4. 快捷应用API测试")
    success, _ = test_api("quick-presets", description="获取快捷应用列表")
    if success:
        passed += 1
    else:
        failed += 1

    # 5. 测试创建快捷应用
    print("\n💾 5. 创建快捷应用测试")
    test_preset = {
        "name": "测试配置",
        "model_list": [{"modelId": 2, "strength": 0.9}],
        "prompt": "测试提示词",
        "aspect_ratios": "1:1",
        "seed": -1
    }
    success, result = test_api("quick-presets", method="POST", data=test_preset,
                               description="创建测试快捷应用")
    if success:
        passed += 1
        preset_id = result.get('id')

        # 测试获取单个快捷应用
        success, _ = test_api(f"quick-presets/{preset_id}",
                            description="获取单个快捷应用")
        if success:
            passed += 1
        else:
            failed += 1

        # 测试删除快捷应用
        success, _ = test_api(f"quick-presets/{preset_id}", method="DELETE",
                            description="删除测试快捷应用")
        if success:
            passed += 1
        else:
            failed += 1
    else:
        failed += 1

    # 6. 测试火柴人预设姿势
    print("\n🎯 6. 火柴人预设姿势测试")
    success, result = test_api("stickman/presets", description="获取预设姿势")
    if success:
        passed += 1
        presets = result.get('data', [])
        print(f"   找到 {len(presets)} 个预设姿势")
        for pose in presets:
            print(f"   - {pose.get('name')} (ID: {pose.get('id')})")
    else:
        failed += 1

    # 7. 测试生成任务列表
    print("\n📋 7. 生成任务列表API测试")
    success, _ = test_api("tasks", description="获取任务列表")
    if success:
        passed += 1
    else:
        failed += 1

    # 8. 测试素材库API
    print("\n🖼️ 8. 素材库API测试")
    success, _ = test_api("assets", description="获取素材列表")
    if success:
        passed += 1
    else:
        failed += 1

    # 汇总结果
    print("\n" + "=" * 60)
    print("📊 测试结果汇总")
    print("=" * 60)
    print(f"✅ 通过: {passed}")
    print(f"❌ 失败: {failed}")
    print(f"📈 成功率: {passed/(passed+failed)*100:.1f}%")

    if failed == 0:
        print("\n🎉 所有测试通过！")
        return 0
    else:
        print(f"\n⚠️ 有 {failed} 个测试失败，请检查功能")
        return 1


if __name__ == "__main__":
    sys.exit(run_tests())
