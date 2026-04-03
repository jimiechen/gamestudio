# 设置要求

此模板需要安装一些工具才能发挥完整功能。
如果工具缺失，所有钩子都会优雅地失败 —— 不会损坏任何东西，但
你会失去验证功能。

## 必需

| 工具 | 用途 | 安装 |
| ---- | ---- | ---- |
| **Git** | 版本控制、分支管理 | [git-scm.com](https://git-scm.com/) |
| **Claude Code** | AI 智能体 CLI | `npm install -g @anthropic-ai/claude-code` |

## 推荐

| 工具 | 使用者 | 用途 | 安装 |
| ---- | ---- | ---- | ---- |
| **jq** | 钩子（8 个中的 4 个） | 在提交/推送/资源/智能体钩子中解析 JSON | 见下文 |
| **Python 3** | 钩子（8 个中的 2 个） | 数据文件的 JSON 验证 | [python.org](https://www.python.org/) |
| **Bash** | 所有钩子 | Shell 脚本执行 | Windows 版 Git 自带 |

### 安装 jq

**Windows**（以下任一）：
```
winget install jqlang.jq
choco install jq
scoop install jq
```

**macOS**：
```
brew install jq
```

**Linux**：
```
sudo apt install jq     # Debian/Ubuntu
sudo dnf install jq     # Fedora
sudo pacman -S jq       # Arch
```

## 平台说明

### Windows
- Windows 版 Git 包含 **Git Bash**，它提供了 `settings.json` 中所有钩子使用的 `bash` 命令
- 确保 Git Bash 在你的 PATH 中（通过 Git 安装程序默认安装）
- 钩子使用 `bash .claude/hooks/[name].sh` —— 这在 Windows 上有效，因为
  Claude Code 通过可以找到 `bash.exe` 的 shell 调用命令

### macOS / Linux
- Bash 原生可用
- 通过你的包管理器安装 `jq` 以获得完整的钩子支持

## 验证你的设置

运行这些命令检查先决条件：

```bash
git --version          # 应显示 git 版本
bash --version         # 应显示 bash 版本
jq --version           # 应显示 jq 版本（可选）
python3 --version      # 应显示 python 版本（可选）
```

## 缺少可选工具时会发生什么

| 缺少工具 | 影响 |
| ---- | ---- |
| **jq** | 提交验证、推送保护、资源验证和智能体审计钩子会静默跳过检查。提交和推送仍然有效。 |
| **Python 3** | 提交和资源钩子中的 JSON 数据文件验证被跳过。无效 JSON 可以在没有警告的情况下提交。 |
| **两者** | 所有钩子仍然可以无错误执行（退出 0），但不提供验证。你正在没有安全网的情况下飞行。 |

## 推荐的 IDE

Claude Code 可与任何编辑器配合使用，但此模板针对以下环境优化：
- **VS Code** 配合 Claude Code 扩展
- **Cursor**（兼容 Claude Code）
- 基于终端的 Claude Code CLI
