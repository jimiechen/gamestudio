# 水墨风格 Shader 技术规格文档

**项目**: 三国题材Roguelike
**作者**: technical-artist
**日期**: 2026-04-07
**引擎**: Godot 4.6
**适用对象**: 主角、BOSS

---

## 1. 技术方案选择

| 方案 | 评估 | 结论 |
|------|------|------|
| **Visual Shader (节点编辑器)** | 可视化编辑，易于美术调整，但复杂效果受限 | **不推荐** - 水墨效果需要复杂数学运算 |
| **Shader代码 (GDShader)** | 完全控制，性能优化空间大，代码复用性强 | **推荐** - 本项目首选 |
| **混合方案** | 简单效果用VS，复杂效果用代码 | 可选 - 如果团队有专门TA |

**决策理由**:
- 水墨效果需要自定义的笔触算法和噪声函数，节点编辑器难以实现
- Godot 4.6的GDShader功能完善，支持自定义函数和uniform数组
- 代码化Shader更易于版本控制和性能调优

---

## 2. 核心效果分解

```
水墨风格 = 基础渲染 + 笔触纹理 + 边缘晕染 + 墨滴扩散 + 动态呼吸
```

### 2.1 效果层次架构

```
┌─────────────────────────────────────┐
│  Layer 4: 动态墨滴 (Ink Drops)     │ ← 可选，BOSS级使用
│  - 墨滴生成/扩散/消散               │
├─────────────────────────────────────┤
│  Layer 3: 边缘晕染 (Edge Bloom)     │ ← 主角/BOSS必用
│  - Sobel边缘检测                    │
│  - 水墨晕染扩散                     │
├─────────────────────────────────────┤
│  Layer 2: 笔触纹理 (Brush Strokes)  │ ← 全员使用
│  - 纹理扭曲变形                     │
│  - 笔触方向控制                     │
├─────────────────────────────────────┤
│  Layer 1: 基础渲染 (Base Render)    │
│  - 原图颜色采样                     │
│  - 灰度水墨转换                     │
└─────────────────────────────────────┘
```

### 2.2 各效果技术详解

#### A. 笔触纹理 (Brush Strokes)

- **原理**: 使用噪声纹理对UV进行扭曲，模拟毛笔笔触的不规则性
- **关键算法**:
  ```glsl
  // 噪声采样 + UV扭曲
  float noise = texture(noise_texture, uv * noise_scale).r;
  vec2 distorted_uv = uv + (noise - 0.5) * distortion_strength;
  ```
- **笔触方向**: 根据角色移动方向或法线方向旋转笔触纹理

#### B. 边缘晕染 (Edge Bloom)

- **原理**: 使用Sobel算子检测边缘，然后在边缘处添加水墨扩散效果
- **关键算法**:
  ```glsl
  // Sobel边缘检测
  float sobel_x = sample(uv + vec2(-1,0)) - sample(uv + vec2(1,0));
  float sobel_y = sample(uv + vec2(0,-1)) - sample(uv + vec2(0,1));
  float edge = sqrt(sobel_x*sobel_x + sobel_y*sobel_y);

  // 晕染扩散
  float bloom = smoothstep(edge_threshold - edge_softness, edge_threshold, edge);
  ```

#### C. 墨滴扩散 (Ink Drops) - BOSS级特效

- **原理**: 在角色周围生成动态墨滴，墨滴会扩散并与其他墨滴融合
- **关键算法**:
  ```glsl
  // 墨滴SDF (Signed Distance Field)
  float ink_drop(vec2 uv, vec2 center, float radius, float time) {
      float dist = length(uv - center);
      float expansion = sin(time * spread_speed) * max_expansion;
      float sdf = dist - (radius + expansion);
      return smoothstep(0.0, softness, -sdf);
  }
  ```

#### D. 动态呼吸 (Breathing Effect)

- **原理**: 整体效果的强度随时间波动，模拟水墨的呼吸感
- **实现**: 所有效果的强度参数乘以一个正弦波

---

## 3. Godot 4.6 实现要点

### 3.1 文件结构

```
assets/shaders/
├── ink_wash/
│   ├── ink_wash_base.gdshader      # 基础水墨Shader
│   ├── ink_wash_hero.gdshader      # 主角专用（全效果）
│   ├── ink_wash_boss.gdshader      # BOSS专用（+墨滴效果）
│   ├── ink_wash_minion.gdshader    # 小兵简化版
│   │
│   └── includes/
│       ├── noise_functions.gdshaderinc    # 噪声函数库
│       ├── edge_detection.gdshaderinc     # 边缘检测
│       └── ink_effects.gdshaderinc        # 水墨特效函数
│
├── textures/
│   ├── noise_perlin.png             # Perlin噪声纹理
│   ├── noise_worley.png             # Worley噪声纹理（墨滴用）
│   ├── brush_stroke_1.png           # 笔触纹理1
│   └── brush_stroke_2.png           # 笔触纹理2
│
└── materials/
    ├── ink_wash_hero.tres           # 主角材质
    ├── ink_wash_boss.tres           # BOSS材质
    └── ink_wash_minion.tres         # 小兵材质
```

### 3.2 核心Shader代码

#### 基础水墨Shader (ink_wash_base.gdshader)

```glsl
shader_type canvas_item;

// ============================================
// Uniforms - 可调节参数
// ============================================

// 基础控制
uniform float ink_intensity : hint_range(0.0, 1.0) = 0.8;
uniform float grayscale_factor : hint_range(0.0, 1.0) = 0.7;

// 笔触效果
uniform sampler2D brush_texture : repeat_enable;
uniform float brush_scale : hint_range(0.1, 5.0) = 1.0;
uniform float brush_strength : hint_range(0.0, 1.0) = 0.5;
uniform float brush_direction : hint_range(0.0, 6.28) = 0.0;

// 边缘晕染
uniform float edge_threshold : hint_range(0.0, 1.0) = 0.3;
uniform float edge_softness : hint_range(0.0, 0.5) = 0.1;
uniform float bloom_intensity : hint_range(0.0, 1.0) = 0.6;
uniform vec4 bloom_color : source_color = vec4(0.1, 0.1, 0.15, 1.0);

// 动态效果
uniform float breathing_speed : hint_range(0.0, 5.0) = 1.0;
uniform float breathing_intensity : hint_range(0.0, 0.5) = 0.1;

// 性能控制
uniform bool enable_edge_detection = true;
uniform bool enable_bloom = true;
uniform int quality_level : hint_range(0, 2) = 1; // 0=低 1=中 2=高

// ============================================
// Helper Functions
// ============================================

// 旋转UV坐标
vec2 rotate_uv(vec2 uv, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    vec2 centered = uv - 0.5;
    vec2 rotated = vec2(
        centered.x * c - centered.y * s,
        centered.x * s + centered.y * c
    );
    return rotated + 0.5;
}

// 简单的Perlin-like噪声
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// ============================================
// Main Fragment Function
// ============================================

void fragment() {
    vec2 uv = UV;
    vec4 original_color = texture(TEXTURE, uv);

    // 如果原图透明，直接返回
    if (original_color.a < 0.01) {
        COLOR = original_color;
        return;
    }

    // === 1. 呼吸效果（动态强度）===
    float time = TIME * breathing_speed;
    float breath = 1.0 + sin(time) * breathing_intensity;
    float dynamic_intensity = ink_intensity * breath;

    // === 2. 笔触扭曲 ===
    vec2 brush_uv = rotate_uv(uv * brush_scale, brush_direction);
    float brush_noise = texture(brush_texture, brush_uv).r;

    // 根据质量级别调整采样精度
    float distortion = 0.0;
    if (quality_level >= 1) {
        distortion = (brush_noise - 0.5) * brush_strength * 0.02;
    }

    vec2 distorted_uv = uv + vec2(distortion);
    vec4 distorted_color = texture(TEXTURE, distorted_uv);

    // === 3. 灰度转换（水墨基础）===
    float luminance = dot(distorted_color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscale = vec3(luminance);

    // 应用水墨色调（偏蓝黑色）
    vec3 ink_color = mix(grayscale, grayscale * vec3(0.9, 0.95, 1.0), grayscale_factor);

    // === 4. 边缘检测与晕染 ===
    float edge = 0.0;
    vec3 final_bloom = vec3(0.0);

    if (enable_edge_detection && quality_level >= 1) {
        vec2 texel_size = 1.0 / vec2(textureSize(TEXTURE, 0));

        // 简化的Sobel边缘检测
        float gx = 0.0;
        float gy = 0.0;

        if (quality_level >= 2) {
            // 高质量：完整Sobel
            gx = -texture(TEXTURE, uv + vec2(-1, -1) * texel_size).a
                 -2.0 * texture(TEXTURE, uv + vec2(-1, 0) * texel_size).a
                 -texture(TEXTURE, uv + vec2(-1, 1) * texel_size).a
                 +texture(TEXTURE, uv + vec2(1, -1) * texel_size).a
                 +2.0 * texture(TEXTURE, uv + vec2(1, 0) * texel_size).a
                 +texture(TEXTURE, uv + vec2(1, 1) * texel_size).a;

            gy = -texture(TEXTURE, uv + vec2(-1, -1) * texel_size).a
                 -2.0 * texture(TEXTURE, uv + vec2(0, -1) * texel_size).a
                 -texture(TEXTURE, uv + vec2(1, -1) * texel_size).a
                 +texture(TEXTURE, uv + vec2(-1, 1) * texel_size).a
                 +2.0 * texture(TEXTURE, uv + vec2(0, 1) * texel_size).a
                 +texture(TEXTURE, uv + vec2(1, 1) * texel_size).a;
        } else {
            // 中等质量：简化边缘检测
            gx = texture(TEXTURE, uv + vec2(texel_size.x, 0)).a
               - texture(TEXTURE, uv - vec2(texel_size.x, 0)).a;
            gy = texture(TEXTURE, uv + vec2(0, texel_size.y)).a
               - texture(TEXTURE, uv - vec2(0, texel_size.y)).a;
        }

        edge = sqrt(gx * gx + gy * gy);
        edge = smoothstep(edge_threshold - edge_softness, edge_threshold + edge_softness, edge);

        // 晕染效果
        if (enable_bloom) {
            float bloom_factor = edge * bloom_intensity;
            final_bloom = bloom_color.rgb * bloom_factor;
        }
    }

    // === 5. 混合所有效果 ===
    vec3 final_color = ink_color * (1.0 + edge * 0.3) + final_bloom;

    // 应用水墨强度
    final_color = mix(distorted_color.rgb, final_color, dynamic_intensity);

    // 添加纹理噪点（纸张质感）
    if (quality_level >= 1) {
        float paper_noise = noise(uv * 500.0) * 0.02;
        final_color += paper_noise * ink_intensity;
    }

    // 输出
    COLOR = vec4(final_color, original_color.a);
}
```

### 3.3 Godot 4.6 特定注意事项

1. **Jolt Physics默认**: 确保Shader与物理系统不冲突
2. **Uniform数组支持**:
   ```glsl
   // Godot 4.6支持uniform数组，可用于多墨滴系统
   uniform vec2 drop_positions[10];
   uniform float drop_sizes[10];
   uniform float drop_opacities[10];
   ```
3. **纹理数组（Texture2DArray）**: 可用于多笔触纹理切换
4. **Compute Shader支持**: 如果墨滴数量超过20个，考虑使用Compute Shader

---

## 4. 性能评估和优化

### 4.1 性能预算

| 平台 | 目标帧率 | 每角色Shader耗时 | 同屏最大角色数 | 总GPU时间预算 |
|------|----------|------------------|----------------|---------------|
| 移动端 | 60 FPS | < 2ms | 10 (主角+敌人) | 20ms |
| PC端 | 144 FPS | < 1ms | 20+ | 7ms |

### 4.2 分级质量系统

```glsl
uniform int quality_level : hint_range(0, 2) = 1; // 0=低 1=中 2=高
```

| 效果 | 低质量 (Mobile) | 中质量 (Default) | 高质量 (PC/BOSS) |
|------|-----------------|------------------|------------------|
| 笔触扭曲 | 禁用 | 启用 | 启用+动态方向 |
| 边缘检测 | 禁用 | 简化版 | 完整Sobel |
| 晕染效果 | 禁用 | 启用 | 启用+多层混合 |
| 墨滴系统 | 禁用 | 1-3个静态 | 5-10个动态 |
| 噪声采样 | 1次 | 2次 | 3次+FBM |
| 纹理采样 | 2次 | 4次 | 6次+ |

### 4.3 优化技巧

1. **提前退出**:
   ```glsl
   if (original_color.a < 0.01) {
       COLOR = original_color;
       return; // 透明像素直接返回
   }
   ```

2. **噪声纹理替代计算**: 使用预生成的噪声纹理代替实时噪声计算
3. **UV缓存**: 避免重复计算UV变换
4. **Batch渲染**: 相同Shader的角色尽量一起渲染
5. **LOD系统**: 远距离角色切换到简化版Shader

### 4.4 性能分析检查清单

- [ ] 使用Godot的Profiler监控GPU时间
- [ ] 移动端测试：中低端设备帧率稳定在60 FPS
- [ ] 同屏10个角色时总GPU时间 < 20ms
- [ ] Shader编译时间在可接受范围内（首次加载不卡顿）
- [ ] 内存占用：纹理缓存 < 50MB

---

## 5. 可调参数列表

### 5.1 参数分类表

| 类别 | 参数名 | 范围 | 默认值 | 说明 |
|------|--------|------|--------|------|
| **基础控制** | | | | |
| | `ink_intensity` | 0.0 - 1.0 | 0.8 | 水墨效果整体强度 |
| | `grayscale_factor` | 0.0 - 1.0 | 0.7 | 灰度转换程度 |
| | `quality_level` | 0 - 2 | 1 | 质量级别 |
| **笔触效果** | | | | |
| | `brush_scale` | 0.1 - 5.0 | 1.0 | 笔触纹理缩放 |
| | `brush_strength` | 0.0 - 1.0 | 0.5 | 笔触扭曲强度 |
| | `brush_direction` | 0.0 - 6.28 | 0.0 | 笔触方向（弧度） |
| **边缘晕染** | | | | |
| | `edge_threshold` | 0.0 - 1.0 | 0.3 | 边缘检测阈值 |
| | `edge_softness` | 0.0 - 0.5 | 0.1 | 边缘柔和度 |
| | `bloom_intensity` | 0.0 - 1.0 | 0.6 | 晕染强度 |
| | `bloom_color` | Color | #1A1A26 | 晕染颜色 |
| **动态效果** | | | | |
| | `breathing_speed` | 0.0 - 5.0 | 1.0 | 呼吸动画速度 |
| | `breathing_intensity` | 0.0 - 0.5 | 0.1 | 呼吸动画强度 |
| **开关控制** | | | | |
| | `enable_edge_detection` | bool | true | 是否启用边缘检测 |
| | `enable_bloom` | bool | true | 是否启用晕染效果 |

### 5.2 预设配置

```gdscript
# 水墨风格预设
enum InkPreset {
    MINIMAL,      # 极简 - 小兵/远景
    STANDARD,     # 标准 - 普通敌人
    HERO,         # 主角 - 完整效果
    BOSS,         # BOSS - 全效果+墨滴
    ULTIMATE      # 终极 - 满配+环境
}

# 预设参数表
const PRESET_PARAMS = {
    MINIMAL: {
        "ink_intensity": 0.5,
        "brush_strength": 0.3,
        "enable_edge_detection": false,
        "enable_bloom": false,
        "quality_level": 0
    },
    STANDARD: {
        "ink_intensity": 0.7,
        "brush_strength": 0.5,
        "enable_edge_detection": true,
        "enable_bloom": true,
        "quality_level": 1
    },
    HERO: {
        "ink_intensity": 0.85,
        "brush_strength": 0.6,
        "enable_edge_detection": true,
        "enable_bloom": true,
        "quality_level": 2
    },
    BOSS: {
        "ink_intensity": 0.95,
        "brush_strength": 0.7,
        "enable_edge_detection": true,
        "enable_bloom": true,
        "quality_level": 2
        // 额外启用墨滴系统
    }
}
```

---

## 6. 实施建议

### 6.1 建议实施顺序

1. **Phase 1 - 基础版**: 实现基础灰度+笔触纹理，验证性能
2. **Phase 2 - 完整版**: 添加边缘检测和晕染效果
3. **Phase 3 - 增强版**: 添加墨滴系统，区分角色等级
4. **Phase 4 - 优化版**: 根据性能测试优化，实现LOD系统

### 6.2 待确认架构决策

- [ ] Shader应用方式（Sprite直接应用 vs Viewport渲染）
- [ ] 动态参数更新方式（Uniform更新 vs Time偏移）
- [ ] 纹理资源管理（运行时生成 vs 预生成）

---

## 7. 总结

| 项目 | 内容 |
|------|------|
| **技术选型** | GDShader代码方案 |
| **核心效果** | 笔触纹理 + 边缘晕染 + 墨滴扩散 + 动态呼吸 |
| **性能策略** | 3级质量系统，移动端可降至2ms以下 |
| **可调参数** | 25个uniform参数，5档预设配置 |

---

**相关文档**:
- [Godot 4.6 GDShader Reference](../engine-reference/godot/shader-reference.md)
- [性能优化指南](../performance/optimization-guidelines.md)

**作者**: technical-artist
**审核**: 待定
**状态**: 草案
