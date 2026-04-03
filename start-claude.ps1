# Claude Code 火山引擎一键启动脚本
# 配置并启动 Claude Code，使用火山引擎模型
# 注意：需要将 MODEL_ID 替换为你的实际推理接入点 ID

# 设置 UTF-8 编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 显示标题
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Claude Code 火山引擎启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 重要：请修改以下 MODEL_ID 为你的实际推理接入点 ID
# ============================================
# 获取方式：
# 1. 登录 https://console.volcengine.com/ark/
# 2. 进入「模型推理」→「推理接入点」
# 3. 创建或查看已有接入点，复制接入点 ID
# ============================================
$MODEL_ID = "ep-xxxxxxxxxxxxx"  # <-- 修改这里！

# 检查是否已修改 MODEL_ID
if ($MODEL_ID -eq "ep-xxxxxxxxxxxxx") {
    Write-Host "[!] 警告：你还没有设置正确的 MODEL_ID" -ForegroundColor Red
    Write-Host ""
    Write-Host "请按以下步骤操作：" -ForegroundColor Yellow
    Write-Host "1. 登录火山引擎控制台: https://console.volcengine.com/ark/" -ForegroundColor White
    Write-Host "2. 进入「模型推理」→「推理接入点」" -ForegroundColor White
    Write-Host "3. 创建接入点（选择 Kimi-K2.5 模型）" -ForegroundColor White
    Write-Host "4. 复制接入点 ID（格式如：ep-20250101-xxxxx）" -ForegroundColor White
    Write-Host "5. 修改本脚本中的 `$MODEL_ID 变量" -ForegroundColor White
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

# 设置环境变量
$env:ANTHROPIC_AUTH_TOKEN = "d35406ea-4341-4788-863e-1f969431a988"
$env:ANTHROPIC_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = $MODEL_ID
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = $MODEL_ID
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = $MODEL_ID

# 显示配置信息
Write-Host "[✓] 环境变量已设置" -ForegroundColor Green
Write-Host ""
Write-Host "配置信息：" -ForegroundColor Yellow
Write-Host "  API Key:    $($env:ANTHROPIC_AUTH_TOKEN.Substring(0, 8))..." -ForegroundColor Gray
Write-Host "  API Base:   $env:ANTHROPIC_BASE_URL" -ForegroundColor Gray
Write-Host "  Model ID:   $MODEL_ID" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      正在启动 Claude Code..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 claude 是否安装
try {
    $claudeVersion = claude --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Claude Code 版本: $claudeVersion" -ForegroundColor DarkGray
        Write-Host ""
    }
} catch {
    Write-Host "[✗] 警告: 未检测到 Claude Code，请先安装" -ForegroundColor Red
    Write-Host "    安装命令: npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

# 启动 Claude Code
try {
    claude
} catch {
    Write-Host ""
    Write-Host "[✗] 启动失败: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "按 Enter 键退出"
}

# 退出提示
Write-Host ""
Write-Host "Claude Code 已退出。" -ForegroundColor Gray
Write-Host ""
