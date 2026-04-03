@echo off
chcp 65001 >nul
title Claude Code - 火山引擎 Coding Plan

echo ========================================
echo  Claude Code + 火山引擎 Coding Plan
echo ========================================
echo.

:: 设置环境变量
set "ANTHROPIC_AUTH_TOKEN=d35406ea-4341-4788-863e-1f969431a988"
set "ANTHROPIC_BASE_URL=https://ark.cn-beijing.volces.com/api/coding"
set "ANTHROPIC_MODEL=ark-code-latest"
set "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1"

echo [OK] 环境变量已设置
echo.
echo 配置信息：
echo   API Base: %ANTHROPIC_BASE_URL%
echo   Model: %ANTHROPIC_MODEL% (由火山引擎控制台控制)
echo.
echo 提示：在火山引擎控制台切换模型：
echo   https://console.volcengine.com/ark/coding/
echo   可选：Kimi-k2-thinking, Kimi-K2.5, GLM-4.7, DeepSeek-V3.2
echo.
echo ========================================
echo 正在启动 Claude Code...
echo ========================================
echo.

claude

echo.
echo Claude Code 已退出。
pause
