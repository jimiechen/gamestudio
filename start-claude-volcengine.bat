@echo off
chcp 65001 >nul
title Claude Code - 火山引擎 Coding Plan

echo ========================================
echo Claude Code 火山引擎启动脚本
echo ========================================
echo.

:: 火山引擎 Coding Plan 配置
:: 官方文档: https://www.volcengine.com/docs/82379/1928261
set "ANTHROPIC_AUTH_TOKEN=d35406ea-4341-4788-863e-1f969431a988"
set "ANTHROPIC_BASE_URL=https://ark.cn-beijing.volces.com/api/coding"
set "ANTHROPIC_MODEL=ark-code-latest"
set "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1"

:: 所有模型类型都指向同一个模型
echo [OK] 环境变量已设置
echo.
echo 配置信息：
echo   API Base: %ANTHROPIC_BASE_URL%
echo   Model: %ANTHROPIC_MODEL%
echo.
echo ========================================
echo 正在启动 Claude Code...
echo ========================================
echo.

:: 启动 Claude Code
claude

:: 暂停（如果 Claude 退出）
echo.
echo Claude Code 已退出。
pause
