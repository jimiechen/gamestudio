# -*- coding: utf-8 -*-
"""
快捷应用功能测试
"""

import pytest
from playwright.sync_api import expect


def test_quick_preset_section_exists(page, base_url):
    """测试快捷应用区域是否存在"""
    page.goto(base_url)

    # 检查快捷应用标题
    expect(page.locator("text=快捷应用")).to_be_visible()

    # 检查按钮
    expect(page.locator("button:has-text('加载配置')")).to_be_visible()
    expect(page.locator("button:has-text('保存配置')")).to_be_visible()


def test_save_quick_preset_button(page, base_url):
    """测试保存配置按钮"""
    page.goto(base_url)

    # 点击保存配置
    page.click("button:has-text('保存配置')")

    # 检查是否弹出输入框（prompt）
    # 注意：Playwright 无法直接测试 prompt，但我们可以检查后续行为


def test_load_quick_preset_modal(page, base_url):
    """测试加载配置弹窗"""
    page.goto(base_url)

    # 点击加载配置
    page.click("button:has-text('加载配置')")

    # 等待弹窗出现
    page.wait_for_selector("#quickPresetModal", state="visible")

    # 检查弹窗标题
    expect(page.locator("#quickPresetModal h3")).to_contain_text("选择快捷应用配置")

    # 关闭弹窗
    page.click("#quickPresetModal button:has-text('关闭')")

    # 等待弹窗关闭
    page.wait_for_selector("#quickPresetModal", state="hidden")


def test_generation_form_elements(page, base_url):
    """测试文生图表单元素"""
    page.goto(base_url)

    # 检查主要参数组
    expect(page.locator("text=模型配置")).to_be_visible()
    expect(page.locator("text=文本提示词")).to_be_visible()
    expect(page.locator("text=画面控制")).to_be_visible()
    expect(page.locator("text=增强选项")).to_be_visible()
    expect(page.locator("text=参考图片")).to_be_visible()

    # 检查输入框
    expect(page.locator("#prompt")).to_be_visible()
    expect(page.locator("#negativePrompt")).to_be_visible()
    expect(page.locator("#aspectRatios")).to_be_visible()
    expect(page.locator("#seed")).to_be_visible()

    # 检查生成按钮
    expect(page.locator("button:has-text('生成图片')")).to_be_visible()


def test_prompt_textarea(page, base_url):
    """测试提示词输入框"""
    page.goto(base_url)

    # 获取提示词输入框
    prompt_input = page.locator("#prompt")

    # 检查默认值
    expect(prompt_input).to_contain_text("Q版角色")

    # 清空并输入新值
    prompt_input.fill("测试提示词")

    # 检查新值
    expect(prompt_input).to_have_value("测试提示词")


def test_aspect_ratio_selection(page, base_url):
    """测试画面比例选择"""
    page.goto(base_url)

    # 获取下拉框
    aspect_select = page.locator("#aspectRatios")

    # 检查选项
    options = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"]
    for option in options:
        expect(aspect_select).to_contain_text(option)

    # 选择 16:9
    aspect_select.select_option("16:9")
    expect(aspect_select).to_have_value("16:9")


def test_enhancement_checkboxes(page, base_url):
    """测试增强选项复选框"""
    page.goto(base_url)

    # 检查复选框
    checkboxes = ["faceDetail", "hdFix", "simpleBackground", "enablePerturb"]
    for checkbox_id in checkboxes:
        checkbox = page.locator(f"#{checkbox_id}")
        expect(checkbox).to_be_visible()

    # 测试高清修复联动
    hd_checkbox = page.locator("#hdFix")
    hd_checkbox.check()

    # 检查高清倍数选择器是否显示
    expect(page.locator("#hdScaleContainer")).to_be_visible()
