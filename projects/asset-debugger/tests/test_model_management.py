# -*- coding: utf-8 -*-
"""
模型管理功能测试
"""

import pytest
from playwright.sync_api import expect


def test_model_list_page_loads(page, base_url):
    """测试模型列表页面加载"""
    page.goto(base_url)
    page.click("text=模型列表")

    # 检查页面元素
    expect(page.locator("#models h2")).to_contain_text("可用模型列表")
    expect(page.locator("button:has-text('同步模型列表')")).to_be_visible()


def test_multi_model_selection(page, base_url):
    """测试多模型选择功能"""
    page.goto(base_url)

    # 等待页面加载
    page.wait_for_selector("#selectedModelsList")

    # 检查默认模型是否显示
    expect(page.locator("#selectedModelsList")).to_contain_text("模型 ID: 2")

    # 点击添加模型按钮
    page.click("text=添加模型")

    # 等待模型选择弹窗
    page.wait_for_selector("#modelSelectorModal", state="visible")

    # 检查弹窗标题
    expect(page.locator("#modelSelectorModal h3")).to_contain_text("添加模型")

    # 关闭弹窗
    page.click("#modelSelectorModal button:has-text('关闭')")

    # 等待弹窗关闭
    page.wait_for_selector("#modelSelectorModal", state="hidden")


def test_model_strength_slider(page, base_url):
    """测试模型强度滑块"""
    page.goto(base_url)

    # 等待模型列表加载
    page.wait_for_selector("#selectedModelsList")

    # 检查强度显示
    expect(page.locator("#selectedModelsList")).to_contain_text("强度: 0.9")

    # 获取滑块并修改值
    slider = page.locator("#selectedModelsList input[type='range']")
    expect(slider).to_be_visible()


def test_remove_model_button(page, base_url):
    """测试删除模型按钮"""
    page.goto(base_url)

    # 等待模型列表加载
    page.wait_for_selector("#selectedModelsList")

    # 先添加一个模型
    page.click("text=添加模型")
    page.wait_for_selector("#modelSelectorModal", state="visible")

    # 关闭弹窗（因为没有真实模型数据）
    page.click("#modelSelectorModal button:has-text('关闭')")

    # 检查删除按钮是否存在
    delete_buttons = page.locator("#selectedModelsList button:has-text('删除')")
    expect(delete_buttons).to_have_count(1)
