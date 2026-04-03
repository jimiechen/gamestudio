# Claude Code 火山引擎配置脚本
# 设置环境变量指向火山引擎 Kimi-K2.5 模型

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Claude Code 火山引擎配置脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 设置用户级环境变量（永久生效）
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "d35406ea-4341-4788-863e-1f969431a988", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://ark.cn-beijing.volces.com/api/coding/v3", "User")
[Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC", "1", "User")

# 设置默认模型为 Kimi-K2.5
[Environment]::SetEnvironmentVariable("ANTHROPIC_DEFAULT_OPUS_MODEL", "kimi-k2.5", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_DEFAULT_SONNET_MODEL", "kimi-k2.5", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_DEFAULT_HAIKU_MODEL", "kimi-k2.5", "User")

# 同时设置当前会话环境变量
$env:ANTHROPIC_AUTH_TOKEN = "d35406ea-4341-4788-863e-1f969431a988"
$env:ANTHROPIC_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding/v3"
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = "kimi-k2.5"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = "kimi-k2.5"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = "kimi-k2.5"

Write-Host "✅ 环境变量设置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "已配置的环境变量：" -ForegroundColor Yellow
Write-Host "  ANTHROPIC_AUTH_TOKEN: $env:ANTHROPIC_AUTH_TOKEN"
Write-Host "  ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"
Write-Host "  ANTHROPIC_DEFAULT_OPUS_MODEL: $env:ANTHROPIC_DEFAULT_OPUS_MODEL"
Write-Host "  ANTHROPIC_DEFAULT_SONNET_MODEL: $env:ANTHROPIC_DEFAULT_SONNET_MODEL"
Write-Host "  ANTHROPIC_DEFAULT_HAIKU_MODEL: $env:ANTHROPIC_DEFAULT_HAIKU_MODEL"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "使用说明：" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. 在当前终端直接运行: claude" -ForegroundColor White
Write-Host "2. 或重启终端后运行: claude" -ForegroundColor White
Write-Host "3. 在 Claude Code 中输入 /status 查看模型配置" -ForegroundColor White
Write-Host ""
Write-Host "注意：如果火山引擎支持多个模型，可以修改脚本中的模型名称" -ForegroundColor DarkGray
