@echo off
chcp 65001 >nul
title Claude Code - 火山引擎

:: ============================================
:: 重要：请修改以下 MODEL_ID 为你的实际推理接入点 ID
:: ============================================
:: 获取方式：
:: 1. 登录 https://console.volcengine.com/ark/
:: 2. 进入「模型推理」→「推理接入点」
:: 3. 创建或查看已有接入点，复制接入点 ID
:: ============================================
set "MODEL_ID=ep-xxxxxxxxxxxxx"

:: 检查是否已修改 MODEL_ID
if "%MODEL_ID%"=="ep-xxxxxxxxxxxxx" (
    echo [!] 警告：你还没有设置正确的 MODEL_ID
    echo.
    echo 请按以下步骤操作：
    echo 1. 登录火山引擎控制台: https://console.volcengine.com/ark/
    echo 2. 进入「模型推理」→「推理接入点」
    echo 3. 创建接入点（选择 Kimi-K2.5 模型）
    echo 4. 复制接入点 ID（格式如：ep-20250101-xxxxx）
    echo 5. 修改本脚本中的 MODEL_ID 变量
    echo.
    pause
    exit /b 1
)

echo ========================================
echo Claude Code 火山引擎启动脚本
echo ========================================
echo.

:: 设置环境变量
set "ANTHROPIC_AUTH_TOKEN=d35406ea-4341-4788-863e-1f969431a988"
set "ANTHROPIC_BASE_URL=https://ark.cn-beijing.volces.com/api/v3"
set "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1"
set "ANTHROPIC_DEFAULT_OPUS_MODEL=%MODEL_ID%"
set "ANTHROPIC_DEFAULT_SONNET_MODEL=%MODEL_ID%"
set "ANTHROPIC_DEFAULT_HAIKU_MODEL=%MODEL_ID%"

echo [OK] 环境变量已设置
echo.
echo 配置信息：
echo   API Base: %ANTHROPIC_BASE_URL%
echo   Model ID: %MODEL_ID%
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
