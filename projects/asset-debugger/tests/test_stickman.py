# -*- coding: utf-8 -*-
"""
火柴人调试功能测试
"""

import pytest
from playwright.sync_api import expect


def test_stickman_page_loads(page, base_url):
    """测试火柴人调试页面加载"""
    page.goto(base_url)
    page.click("text=火柴人调试")

    # 检查页面元素
    expect(page.locator("#stickman h2")).to_contain_text("火柴人编辑器")
    expect(page.locator("#stickmanCanvas")).to_be_visible()


def test_stickman_preset_buttons(page, base_url):
    """测试火柴人预设动作按钮"""
    page.goto(base_url)
    page.click("text=火柴人调试")

    # 检查预设动作按钮
    preset_buttons = ["站立", "挥动武器", "躲避", "防御"]
    for btn_text in preset_buttons:
        expect(page.locator("#stickman")).to_contain_text(btn_text)


def test_stickman_canvas_interaction(page, base_url):
    """测试火柴人画布交互"""
    page.goto(base_url)
    page.click("text=火柴人调试")

    # 等待画布加载
    canvas = page.locator("#stickmanCanvas")
    expect(canvas).to_be_visible()

    # 检查画布尺寸
    expect(canvas).to_have_attribute("width", "600")
    expect(canvas).to_have_attribute("height", "500")


def test_stickman_pose_list(page, base_url):
    """测试火柴人姿势列表"""
    page.goto(base_url)
    page.click("text=火柴人调试")

    # 检查姿势列表区域
    expect(page.locator("#poseList")).to_be_visible()

    # 检查筛选按钮
    filter_buttons = ["全部", "预设", "自定义"]
    for btn_text in filter_buttons:
        expect(page.locator("#stickman")).to_contain_text(btn_text)


def test_stickman_save_button(page, base_url):
    """测试火柴人保存按钮"""
    page.goto(base_url)
    page.click("text=火柴人调试")

    # 检查保存按钮
    expect(page.locator("button:has-text('保存姿势')")).to_be_visible()
    expect(page.locator("button:has-text('导出PNG')")).to_be_visible()
    expect(page.locator("button:has-text('生成描述')")).to_be_visible()
    expect(page.locator("button:has-text('用于文生图')")).to_be_visible()


def test_stickman_pose_selection_in_generation(page, base_url):
    """测试在文生图页面选择火柴人姿势"""
    page.goto(base_url)

    # 等待页面加载
    page.wait_for_selector("#generate")

    # 检查选择姿势按钮
    expect(page.locator("button:has-text('选择火柴人姿势')")).to_be_visible()

    # 点击选择姿势按钮
    page.click("button:has-text('选择火柴人姿势')")

    # 等待弹窗出现
    page.wait_for_selector("#stickmanPoseModal", state="visible")

    # 检查弹窗标题
    expect(page.locator("#stickmanPoseModal h3")).to_contain_text("选择火柴人姿势")

    # 关闭弹窗
    page.click("#stickmanPoseModal button:has-text('取消')")

    # 等待弹窗关闭
    page.wait_for_selector("#stickmanPoseModal", state="hidden")
