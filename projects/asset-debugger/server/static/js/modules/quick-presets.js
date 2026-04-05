/**
 * 快捷应用模块
 * 处理配置保存和加载
 */
const QuickPresets = {
    STORAGE_KEY: 'holopix_quick_presets',

    init() {
        this.bindEvents();
        this.renderPresetList();
    },

    bindEvents() {
        // 保存配置按钮
        const saveBtn = document.querySelector('[data-action="saveQuickPreset"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePreset());
        }

        // 加载配置按钮
        const loadBtn = document.querySelector('[data-action="openQuickPresetModal"]');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.openPresetModal());
        }
    },

    savePreset() {
        const preset = this.collectFormData();
        const presets = this.getPresets();
        
        // 生成预设名称（基于时间）
        const name = `配置 ${new Date().toLocaleString('zh-CN')}`;
        presets.push({
            id: Date.now(),
            name: name,
            data: preset,
            createdAt: new Date().toISOString()
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
        this.renderPresetList();
        
        // 显示成功提示
        alert('配置已保存！');
    },

    collectFormData() {
        return {
            prompt: document.getElementById('prompt')?.value || '',
            negativePrompt: document.getElementById('negativePrompt')?.value || '',
            seed: document.getElementById('seed')?.value || '-1',
            batchSize: document.getElementById('batchSize')?.value || '1',
            aspectRatios: document.getElementById('aspectRatios')?.value || '1:1',
            faceDetail: document.getElementById('faceDetail')?.checked || false,
            hdFix: document.getElementById('hdFix')?.checked || false,
            hdScale: document.getElementById('hdScale')?.value || '1.5',
            simpleBackground: document.getElementById('simpleBackground')?.checked || false,
            enablePerturb: document.getElementById('enablePerturb')?.checked || false,
            perturb: document.getElementById('perturb')?.value || '5'
        };
    },

    getPresets() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    },

    renderPresetList() {
        const container = document.getElementById('quickPresetList');
        if (!container) return;

        const presets = this.getPresets();
        
        if (presets.length === 0) {
            container.innerHTML = '<span style="color: #999; font-size: 14px;">暂无快捷应用，请保存当前配置</span>';
            return;
        }

        container.innerHTML = presets.map(preset => `
            <div class="preset-item" data-preset-id="${preset.id}" style="
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #e8f0fe;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                color: #1a73e8;
            ">
                <span>⚡ ${preset.name}</span>
                <button data-action="deletePreset" data-preset-id="${preset.id}" style="
                    background: none;
                    border: none;
                    color: #ea4335;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 0 4px;
                ">×</button>
            </div>
        `).join('');

        // 绑定点击事件
        container.querySelectorAll('.preset-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.dataset.action === 'deletePreset') {
                    e.stopPropagation();
                    this.deletePreset(parseInt(e.target.dataset.presetId));
                } else {
                    this.loadPreset(parseInt(item.dataset.presetId));
                }
            });
        });
    },

    loadPreset(id) {
        const presets = this.getPresets();
        const preset = presets.find(p => p.id === id);
        if (!preset) return;

        const data = preset.data;
        
        // 填充表单
        if (document.getElementById('prompt')) {
            document.getElementById('prompt').value = data.prompt || '';
        }
        if (document.getElementById('negativePrompt')) {
            document.getElementById('negativePrompt').value = data.negativePrompt || '';
        }
        if (document.getElementById('seed')) {
            document.getElementById('seed').value = data.seed || '-1';
        }
        if (document.getElementById('batchSize')) {
            document.getElementById('batchSize').value = data.batchSize || '1';
        }
        if (document.getElementById('aspectRatios')) {
            document.getElementById('aspectRatios').value = data.aspectRatios || '1:1';
        }
        if (document.getElementById('faceDetail')) {
            document.getElementById('faceDetail').checked = data.faceDetail || false;
        }
        if (document.getElementById('hdFix')) {
            document.getElementById('hdFix').checked = data.hdFix || false;
        }
        if (document.getElementById('hdScale')) {
            document.getElementById('hdScale').value = data.hdScale || '1.5';
        }
        if (document.getElementById('simpleBackground')) {
            document.getElementById('simpleBackground').checked = data.simpleBackground || false;
        }
        if (document.getElementById('enablePerturb')) {
            document.getElementById('enablePerturb').checked = data.enablePerturb || false;
        }
        if (document.getElementById('perturb')) {
            document.getElementById('perturb').value = data.perturb || '5';
        }

        // 触发change事件更新UI
        if (typeof Generate !== 'undefined') {
            Generate.toggleHdScale();
            Generate.togglePerturb();
        }
    },

    deletePreset(id) {
        const presets = this.getPresets().filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
        this.renderPresetList();
    },

    openPresetModal() {
        // 简化为直接渲染列表在页面上
        this.renderPresetList();
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickPresets;
}
