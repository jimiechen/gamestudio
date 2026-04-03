# -*- coding: utf-8 -*-
"""
页面加载测试
"""

import pytest
from playwright.sync_api import expect


def test_homepage_loads(page, base_url):
    """测试首页是否正常加载"""
    page.goto(base_url)

    # 检查页面标题
    expect(page).to_have_title("HoloPix 素材调试器")

    # 检查主要元素是否存在
    expect(page.locator("h1")).to_contain_text("HoloPix 素材调试器")

    # 检查标签页是否存在
    tabs = ["生成素材", "模型列表", "任务列表", "素材库", "火柴人调试"]
    for tab in tabs:
        expect(page.locator(".tabs")).to_contain_text(tab)


def test_tab_switching(page, base_url):
    """测试标签页切换功能"""
    page.goto(base_url)

    # 切换到模型列表
    page.click("text=模型列表")
    expect(page.locator("#models")).to_be_visible()

    # 切换到任务列表
    page.click("text=任务列表")
    expect(page.locator("#tasks")).to_be_visible()

    # 切换到素材库
    page.click("text=素材库")
    expect(page.locator("#assets")).to_be_visible()

    # 切换到火柴人调试
    page.click("text=火柴人调试")
    expect(page.locator("#stickman")).to_be_visible()

    # 切换回生成素材
    page.click("text=生成素材")
    expect(page.locator("#generate")).to_be_visible()
