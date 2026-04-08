/**
 * 提示词预设模块
 * 处理提示词选择器弹窗、选项卡管理、CRUD操作
 */
const Prompts = {
    currentTarget: 'prompt',
    currentCategory: '',
    searchKeyword: '',
    applyMode: 'replace',

    categories: [
        { key: '', label: '全部', icon: '📋' },
        { key: 'character', label: '角色', icon: '👤' },
        { key: 'scene', label: '场景', icon: '🏞️' },
        { key: 'style', label: '风格', icon: '🎨' },
        { key: 'action', label: '动作', icon: '🏃' },
        { key: 'quality', label: '质量', icon: '⭐' },
        { key: 'negative', label: '反向', icon: '🚫' }
    ],

    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-prompt-action]');
            if (!action) return;

            const act = action.dataset.promptAction;
            if (act === 'openSelector') {
                this.openSelector(action.dataset.target || 'prompt');
            } else if (act === 'closeSelector') {
                this.closeSelector();
            } else if (act === 'applyPreset') {
                this.applyPreset(parseInt(action.dataset.id));
            } else if (act === 'saveCurrent') {
                this.saveCurrentAsPreset(action.dataset.target || 'prompt');
            } else if (act === 'openCreateModal') {
                this.openCreateModal();
            } else if (act === 'closeCreateModal') {
                this.closeCreateModal();
            } else if (act === 'submitCreate') {
                this.submitCreateForm();
            } else if (act === 'editPreset') {
                this.openEditModal(parseInt(action.dataset.id));
            } else if (act === 'deletePreset') {
                this.deletePreset(parseInt(action.dataset.id));
            } else if (act === 'switchCategory') {
                this.switchCategory(action.dataset.category);
            } else if (act === 'switchApplyMode') {
                this.switchApplyMode(action.dataset.mode);
            } else if (act === 'searchPresets') {
                this.handleSearch(action.dataset.target);
            } else if (act === 'clearSearch') {
                this.clearSearch();
            } else if (act === 'initPresets') {
                this.initPresets();
            }
        });
    },

    // ========== 选择器弹窗 ==========

    openSelector(target) {
        this.currentTarget = target;
        this.currentCategory = '';
        this.searchKeyword = '';
        const modal = document.getElementById('promptSelectorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadAndRenderSelectorCards();
        }
    },

    closeSelector() {
        const modal = document.getElementById('promptSelectorModal');
        if (modal) modal.style.display = 'none';
    },

    async loadAndRenderSelectorCards() {
        try {
            let result;
            if (this.searchKeyword) {
                result = await API.searchPresets(this.searchKeyword, this.currentCategory || undefined);
            } else {
                result = await API.getPresets(this.currentCategory || undefined);
            }

            if (result.success && result.data) {
                this.renderSelectorCards(result.data);
            }
        } catch (error) {
            console.error('加载预设失败:', error);
        }
    },

    renderSelectorCards(presets) {
        const grid = document.getElementById('promptCardsGrid');
        if (!grid) return;

        if (!presets || presets.length === 0) {
            grid.innerHTML = '<p style="text-align:center; color:#999; padding:40px; grid-column:1/-1;">暂无匹配的预设</p>';
            return;
        }

        grid.innerHTML = presets.map(p => `
            <div class="prompt-card" data-id="${p.id}" style="
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 14px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.borderColor='#1a73e8';this.style.boxShadow='0 2px 8px rgba(26,115,232,0.15)'"
               onmouseout="this.style.borderColor='#e0e0e0';this.style.boxShadow='none'">
                <div style="font-weight:600; color:#1a73e8; font-size:14px; margin-bottom:6px;">
                    ${this.getCategoryIcon(p.category)} ${p.name}
                </div>
                <div style="font-size:12px; color:#666; line-height:1.5; max-height:60px; overflow:hidden;">
                    ${this.truncateText(p.prompt_template, 80)}
                </div>
                <div style="display:flex; gap:6px; margin-top:10px;">
                    <button data-prompt-action="applyPreset" data-id="${p.id}"
                        style="flex:1; padding:5px 10px; font-size:12px; background:#1a73e8; color:white; border:none; border-radius:4px; cursor:pointer;">
                        应用${this.currentTarget === 'prompt' ? '到正向' : '到反向'}
                    </button>
                    ${p.negative_prompt ? `<button data-prompt-action="applyPreset" data-id="${p.id}" data-target="${this.currentTarget === 'prompt' ? 'negativePrompt' : 'prompt'}"
                        style="padding:5px 10px; font-size:12px; background:#f0f0f0; color:#666; border:none; border-radius:4px; cursor:pointer;">
                        ${this.currentTarget === 'prompt' ? '反向→' : '正向→'}
                    </button>` : ''}
                </div>
            </div>
        `).join('');

        this.renderCategoryTabs();
    },

    renderCategoryTabs() {
        const container = document.getElementById('promptCategoryTabs');
        if (!container) return;

        container.innerHTML = this.categories.map(cat => `
            <button data-prompt-action="switchCategory" data-category="${cat.key}"
                style="padding:6px 14px; font-size:13px; border:1px solid ${this.currentCategory === cat.key ? '#1a73e8' : '#ddd'};
                       background:${this.currentCategory === cat.key ? '#e8f0fe' : 'white'};
                       color:${this.currentCategory === cat.key ? '#1a73e8' : '#666'};
                       border-radius:20px; cursor:pointer; white-space:nowrap;">
                ${cat.icon} ${cat.label}
            </button>
        `).join('');
    },

    switchCategory(category) {
        this.currentCategory = category;
        this.loadAndRenderSelectorCards();
    },

    switchApplyMode(mode) {
        this.applyMode = mode;
        document.querySelectorAll('[data-prompt-action="switchApplyMode"]').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.style.background = isActive ? '#1a73e8' : '#f0f0f0';
            btn.style.color = isActive ? 'white' : '#666';
        });
    },

    async applyPreset(presetId, overrideTarget) {
        const target = overrideTarget || this.currentTarget;
        try {
            const result = await API.getPreset(presetId);
            if (!result.success || !result.data) {
                alert('获取预设失败');
                return;
            }

            const preset = result.data;
            const textarea = document.getElementById(target === 'prompt' ? 'prompt' : 'negativePrompt');
            if (!textarea) return;

            let textToApply = '';
            if (target === 'prompt' || (overrideTarget === 'prompt' && preset.prompt_template)) {
                textToApply = preset.prompt_template || '';
            } else {
                textToApply = preset.negative_prompt || '';
            }

            if (this.applyMode === 'replace' || !textarea.value) {
                textarea.value = textToApply;
            } else {
                textarea.value += '\n' + textToApply;
            }

            textarea.dispatchEvent(new Event('change'));
            this.closeSelector();

            const targetLabel = target === 'prompt' ? '正向' : '反向';
            alert(`✅ 已${this.applyMode === 'replace' ? '替换' : '追加'}「${preset.name}」到${targetLabel}提示词，可继续修改后保存`);
        } catch (error) {
            alert('应用预设失败: ' + error.message);
        }
    },

    handleSearch(target) {
        const input = document.getElementById('promptSearchInput');
        if (input) {
            this.searchKeyword = input.value.trim();
            this.loadAndRenderSelectorCards();
        }
    },

    clearSearch() {
        this.searchKeyword = '';
        const input = document.getElementById('promptSearchInput');
        if (input) input.value = '';
        this.loadAndRenderSelectorCards();
    },

    // ========== 保存当前输入为预设 ==========

    async saveCurrentAsPreset(target) {
        const textarea = document.getElementById(target === 'prompt' ? 'prompt' : 'negativePrompt');
        if (!textarea) return;

        const textValue = textarea.value.trim();
        if (!textValue) {
            alert(`${target === 'prompt' ? '正向' : '反向'}提示词为空，无法保存`);
            return;
        }

        const name = prompt(`请输入预设名称（当前保存${target === 'prompt' ? '正向' : '反向'}提示词）:`);
        if (!name) return;

        const category = prompt(`请选择分类: character/scene/style/action/quality/negative`, target === 'negativePrompt' ? 'negative' : 'character');

        try {
            const result = await API.createPreset({
                name: name,
                category: category || 'custom',
                prompt_template: target === 'prompt' ? textValue : '',
                negative_prompt: target === 'negativePrompt' ? textValue : '',
                description: `从生成页手动保存 - ${new Date().toLocaleString('zh-CN')}`
            });

            if (result.success) {
                alert(`✅ 预设「${name}」已保存（ID: ${result.id}）`);
            }
        } catch (error) {
            alert('保存失败: ' + error.message);
        }
    },

    // ========== 选项卡页面 ==========

    async renderLibraryPage() {
        const container = document.getElementById('promptsLibraryContent');
        if (!container) return;

        try {
            const result = await API.getPresets();
            if (result.success && result.data) {
                this.presets = result.data;
                this.renderLibraryList(container);
            }
        } catch (error) {
            container.innerHTML = '<p style="color:#ea4335;">加载失败: ' + error.message + '</p>';
        }
    },

    renderLibraryList(container) {
        if (!this.presets || this.presets.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#999;">
                    <p>暂无预设数据</p>
                    <button data-prompt-action="initPresets" style="margin-top:15px; padding:8px 20px; background:#1a73e8; color:white; border:none; border-radius:6px; cursor:pointer;">
                        📥 初始化内置预设
                    </button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
                <input id="librarySearchInput" placeholder="搜索预设..." 
                    style="flex:1; min-width:200px; padding:8px 12px; border:1px solid #ddd; border-radius:6px;"
                    onkeydown="if(event.key==='Enter'){ event.target.nextElementSibling.click() }">
                <button data-prompt-action="searchPresets" data-target="library"
                    style="padding:8px 16px; background:#f0f0f0; border:1px solid #ddd; border-radius:6px; cursor:pointer;">搜索</button>
            </div>
            <div class="library-list">
                ${this.presets.map(p => `
                    <div class="library-card" style="
                        background:white; border:1px solid #e0e0e0; border-radius:8px; padding:16px; margin-bottom:12px;
                    ">
                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                            <div>
                                <div style="font-weight:600; font-size:15px; color:#333;">
                                    ${this.getCategoryIcon(p.category)} ${p.name}
                                </div>
                                <div style="font-size:12px; color:#999; margin-top:3px;">
                                    🏷️ ${p.category} │ 创建: ${p.created_at ? p.created_at.substring(0,10) : '-'}
                                </div>
                            </div>
                            <div style="display:flex; gap:6px;">
                                <button data-prompt-action="editPreset" data-id="${p.id}"
                                    style="padding:4px 10px; font-size:12px; background:#e8f0fe; color:#1a73e8; border:none; border-radius:4px; cursor:pointer;">
                                    编辑
                                </button>
                                <button data-prompt-action="deletePreset" data-id="${p.id}"
                                    style="padding:4px 10px; font-size:12px; background:#fce8e6; color:#ea4335; border:none; border-radius:4px; cursor:pointer;">
                                    删除
                                </button>
                            </div>
                        </div>
                        ${p.prompt_template ? `
                        <div style="margin-bottom:6px;">
                            <span style="font-size:11px; color:#1a73e8; font-weight:500;">正向:</span>
                            <pre style="font-size:12px; color:#555; margin:2px 0; white-space:pre-wrap; word-break:break-all; background:#f8f9fa; padding:8px; border-radius:4px;">${p.prompt_template}</pre>
                        </div>` : ''}
                        ${p.negative_prompt ? `
                        <div>
                            <span style="font-size:11px; color:#ea4335; font-weight:500;">反向:</span>
                            <pre style="font-size:12px; color:#555; margin:2px 0; white-space:pre-wrap; word-break:break-all; background:#fef7f7; padding:8px; border-radius:4px;">${p.negative_prompt}</pre>
                        </div>` : ''}
                        ${p.description ? `<div style="font-size:11px; color:#999; margin-top:6px;">📝 ${p.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ========== 创建/编辑弹窗 ==========

    openCreateModal() {
        this.closeCreateModal();
        const modal = document.getElementById('promptCreateModal');
        if (modal) {
            modal.style.display = 'flex';
            const form = document.getElementById('promptCreateForm');
            if (form) form.reset();
        }
    },

    closeCreateModal() {
        const modal = document.getElementById('promptCreateModal');
        if (modal) modal.style.display = 'none';
        this.editingPresetId = null;
    },

    async openEditModal(presetId) {
        try {
            const result = await API.getPreset(presetId);
            if (!result.success || !result.data) {
                alert('获取预设失败');
                return;
            }

            this.editingPresetId = presetId;
            const preset = result.data;
            const modal = document.getElementById('promptCreateModal');
            if (modal) {
                modal.style.display = 'flex';
                const form = document.getElementById('promptCreateForm');
                if (form) {
                    const nameEl = form.querySelector('[name="name"]');
                    const catEl = form.querySelector('[name="category"]');
                    const promptEl = form.querySelector('[name="promptTemplate"]');
                    const negEl = form.querySelector('[name="negativePrompt"]');
                    const descEl = form.querySelector('[name="description"]');

                    if (nameEl) nameEl.value = preset.name || '';
                    if (catEl) catEl.value = preset.category || '';
                    if (promptEl) promptEl.value = preset.prompt_template || '';
                    if (negEl) negEl.value = preset.negative_prompt || '';
                    if (descEl) descEl.value = preset.description || '';

                    const titleEl = modal.querySelector('.modal-title');
                    if (titleEl) titleEl.textContent = '✏️ 编辑预设';
                    const submitBtn = form.querySelector('[data-prompt-action="submitCreate"]');
                    if (submitBtn) submitBtn.textContent = '💾 更新预设';
                }
            }
        } catch (error) {
            alert('加载预设详情失败: ' + error.message);
        }
    },

    async submitCreateForm() {
        const form = document.getElementById('promptCreateForm');
        if (!form) return;

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            category: formData.get('category') || 'custom',
            prompt_template: formData.get('promptTemplate') || '',
            negative_prompt: formData.get('negativePrompt') || '',
            description: formData.get('description') || ''
        };

        if (!data.name || (!data.prompt_template && !data.negative_prompt)) {
            alert('名称和至少一个提示词字段必填');
            return;
        }

        try {
            let result;
            if (this.editingPresetId) {
                result = await API.updatePreset(this.editingPresetId, data);
            } else {
                result = await API.createPreset(data);
            }

            if (result.success) {
                alert(this.editingPresetId ? '✅ 预设已更新' : '✅ 预设已创建');
                this.closeCreateModal();
                this.renderLibraryPage();
            } else {
                alert('操作失败: ' + (result.error || '未知错误'));
            }
        } catch (error) {
            alert('操作失败: ' + error.message);
        }
    },

    async deletePreset(presetId) {
        if (!confirm('确定要删除这个预设吗？此操作不可撤销。')) return;

        try {
            const result = await API.deletePreset(presetId);
            if (result.success) {
                alert('✅ 已删除');
                this.renderLibraryPage();
            } else {
                alert('删除失败: ' + (result.error || '未知错误'));
            }
        } catch (error) {
            alert('删除失败: ' + error.message);
        }
    },

    async initPresets() {
        try {
            const result = await API.initPresets();
            if (result.success) {
                alert(result.message || '初始化完成');
                this.renderLibraryPage();
            } else {
                alert('初始化失败: ' + (result.error || '未知错误'));
            }
        } catch (error) {
            alert('初始化失败: ' + error.message);
        }
    },

    // ========== 工具方法 ==========

    getCategoryIcon(category) {
        const cat = this.categories.find(c => c.key === category);
        return cat ? cat.icon : '📝';
    },

    truncateText(text, maxLen) {
        if (!text) return '';
        return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Prompts;
}
