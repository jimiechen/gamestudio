# 活动钩子

钩子在 `.claude/settings.json` 中配置并自动触发：

| 钩子 | 事件 | 触发器 | 操作 |
| ---- | ----- | ------- | ------ |
| `validate-commit.sh` | PreToolUse (Bash) | `git commit` 命令 | 验证设计文档部分、JSON 数据文件、硬编码值、TODO 格式 |
| `validate-push.sh` | PreToolUse (Bash) | `git push` 命令 | 对受保护分支（develop/main）的推送发出警告 |
| `validate-assets.sh` | PostToolUse (Write/Edit) | 资源文件更改 | 检查 `assets/` 中文件的命名约定和 JSON 有效性 |
| `session-start.sh` | SessionStart | 会话开始 | 加载冲刺上下文、里程碑、git 活动；检测并预览活动会话状态文件以进行恢复 |
| `detect-gaps.sh` | SessionStart | 会话开始 | 检测新项目（建议 /start）和代码/原型存在时缺失的文档，建议 /reverse-document 或 /project-stage-detect |
| `pre-compact.sh` | PreCompact | 上下文压缩 | 在压缩前将会话状态（active.md、修改的文件、WIP 设计文档）转储到对话中，以便它在摘要中保留 |
| `session-stop.sh` | Stop | 会话结束 | 总结成就并更新会话日志 |
| `log-agent.sh` | SubagentStart | 智能体生成 | 所有智能体调用的审计追踪，带时间戳 |

钩子参考文档：`.claude/docs/hooks-reference/`
钩子输入模式文档：`.claude/docs/hooks-reference/hook-input-schemas.md`
