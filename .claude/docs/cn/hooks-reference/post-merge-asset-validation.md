# 钩子：post-merge-asset-validation

## 触发器

在任何包含对 `assets/` 更改的合并到 `develop` 或 `main` 分支后
运行。

## 目的

验证合并分支中的所有资源是否符合命名约定、
大小预算和格式要求。防止不合规的资源在
集成分支上积累。

## 实现

```bash
#!/bin/bash
# 合并后钩子：资源验证
# 根据项目标准检查合并的资源

MERGED_ASSETS=$(git diff --name-only HEAD@{1} HEAD | grep -E '^assets/')

if [ -z "$MERGED_ASSETS" ]; then
    exit 0
fi

EXIT_CODE=0
WARNINGS=""

for file in $MERGED_ASSETS; do
    filename=$(basename "$file")

    # 检查命名约定（小写带下划线）
    if echo "$filename" | grep -qE '[A-Z[:space:]-]'; then
        WARNINGS="$WARNINGS\nNAMING: $file -- 必须是小写带下划线"
        EXIT_CODE=1
    fi

    # 检查纹理大小（必须是 2 的幂）
    if [[ "$file" == *.png || "$file" == *.jpg ]]; then
        # 需要 ImageMagick
        if command -v identify &> /dev/null; then
            dims=$(identify -format "%w %h" "$file" 2>/dev/null)
            if [ -n "$dims" ]; then
                w=$(echo "$dims" | cut -d' ' -f1)
                h=$(echo "$dims" | cut -d' ' -f2)
                if (( (w & (w-1)) != 0 || (h & (h-1)) != 0 )); then
                    WARNINGS="$WARNINGS\nSIZE: $file -- 尺寸 ${w}x${h} 不是 2 的幂"
                fi
            fi
        fi
    fi

    # 检查文件大小预算
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ -n "$size" ]; then
        # 纹理：最大 4MB
        if [[ "$file" == assets/art/* ]] && [ "$size" -gt 4194304 ]; then
            WARNINGS="$WARNINGS\nBUDGET: $file -- ${size} 字节超过 4MB 纹理预算"
            EXIT_CODE=1
        fi
        # 音频：音乐最大 10MB，SFX 最大 512KB
        if [[ "$file" == assets/audio/sfx* ]] && [ "$size" -gt 524288 ]; then
            WARNINGS="$WARNINGS\nBUDGET: $file -- ${size} 字节超过 512KB SFX 预算"
        fi
    fi
done

if [ -n "$WARNINGS" ]; then
    echo "=== 资源验证报告 ==="
    echo -e "$WARNINGS"
    echo "================================"
    echo "运行 /asset-audit 获取完整报告。"
fi

exit $EXIT_CODE
```

## 智能体集成

当此钩子报告问题时：
1. 对于命名违规：手动修复或调用 `art-director` 获取指导
2. 对于大小违规：调用 `technical-artist` 获取优化建议
3. 对于完整审计：运行 `/asset-audit` 技能
