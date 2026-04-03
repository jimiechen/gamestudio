# Claude Code 火山引擎 Coding Plan 一键启动脚本
# 官方文档: https://www.volcengine.com/docs/82379/1928261

# 设置 UTF-8 编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 显示标题
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Claude Code 火山引擎 Coding Plan" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 火山引擎 Coding Plan 配置
# 注意：模型名称固定为 ark-code-latest，无需创建推理接入点
$env:ANTHROPIC_AUTH_TOKEN = "d35406ea-4341-4788-863e-1f969431a988"
$env:ANTHROPIC_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding"
$env:ANTHROPIC_MODEL = "ark-code-latest"
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1"

# 显示配置信息
Write-Host "[✓] 环境变量已设置" -ForegroundColor Green
Write-Host ""
Write-Host "配置信息：" -ForegroundColor Yellow
Write-Host "  API Key:    $($env:ANTHROPIC_AUTH_TOKEN.Substring(0, 8))..." -ForegroundColor Gray
Write-Host "  API Base:   $env:ANTHROPIC_BASE_URL" -ForegroundColor Gray
Write-Host "  Model:      $env:ANTHROPIC_MODEL" -ForegroundColor Green
Write-Host ""
Write-Host "说明：" -ForegroundColor DarkGray
Write-Host "  使用火山引擎 Coding Plan 固定模型 ark-code-latest" -ForegroundColor DarkGray
Write-Host "  该模型会自动路由到 Kimi-K2.5 或其他可用模型" -ForegroundColor DarkGray
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
