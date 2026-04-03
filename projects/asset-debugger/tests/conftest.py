# -*- coding: utf-8 -*-
"""
Playwright 测试配置
"""

import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture(scope="session")
def browser():
    """启动浏览器"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    """创建新页面"""
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture
def base_url():
    """基础URL"""
    return "http://localhost:5000"
