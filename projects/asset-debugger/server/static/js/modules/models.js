/**
 * 模型模块
 * 处理模型列表和模型选择器弹窗
 */
const Models = {
    // 筛选状态
    filters: {
        modelType: '',
        styleType: '',
        baseModel: '',
        searchName: ''
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // 打开模型选择器按钮
        const openBtn = document.querySelector('[data-action="openModelSelector"]');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openSelector());
        }

        // 关闭模型选择器按钮
        const closeBtn = document.querySelector('[data-action="closeModelSelector"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSelector());
        }

        // 同步模型按钮
        const syncBtn = document.querySelector('[data-action="syncModels"]');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncModels());
        }

        // 绑定筛选事件
        this.bindFilterEvents();
    },

    // 绑定筛选事件
    bindFilterEvents() {
        // 模型类型筛选
        const modelTypeFilter = document.getElementById('filterModelType');
        if (modelTypeFilter) {
            modelTypeFilter.addEventListener('change', (e) => {
                this.filters.modelType = e.target.value;
                this.applyFilters();
            });
        }

        // 风格类型筛选
        const styleTypeFilter = document.getElementById('filterStyleType');
        if (styleTypeFilter) {
            styleTypeFilter.addEventListener('change', (e) => {
                this.filters.styleType = e.target.value;
                this.applyFilters();
            });
        }

        // 基础模型筛选
        const baseModelFilter = document.getElementById('filterBaseModel');
        if (baseModelFilter) {
            baseModelFilter.addEventListener('change', (e) => {
                this.filters.baseModel = e.target.value;
                this.applyFilters();
            });
        }

        // 名称搜索
        const searchInput = document.getElementById('searchModelName');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.searchName = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // 重置筛选按钮
        const resetBtn = document.querySelector('[data-action="resetFilters"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    },

    // 应用筛选
    applyFilters() {
        const allModels = State.get('models') || [];
        
        const filteredModels = allModels.filter(model => {
            // 模型类型筛选
            if (this.filters.modelType && model.modelType !== this.filters.modelType) {
                return false;
            }
            
            // 风格类型筛选
            if (this.filters.styleType && model.styleType !== this.filters.styleType) {
                return false;
            }
            
            // 基础模型筛选
            if (this.filters.baseModel && model.baseModel !== this.filters.baseModel) {
                return false;
            }
            
            // 名称搜索
            if (this.filters.searchName) {
                const modelName = (model.modelName || model.name || '').toLowerCase();
                if (!modelName.includes(this.filters.searchName)) {
                    return false;
                }
            }
            
            return true;
        });

        this.renderFilteredModelsTable(filteredModels);
    },

    // 重置筛选
    resetFilters() {
        this.filters = {
            modelType: '',
            styleType: '',
            baseModel: '',
            searchName: ''
        };

        // 重置表单
        const modelTypeFilter = document.getElementById('filterModelType');
        if (modelTypeFilter) modelTypeFilter.value = '';
        
        const styleTypeFilter = document.getElementById('filterStyleType');
        if (styleTypeFilter) styleTypeFilter.value = '';
        
        const baseModelFilter = document.getElementById('filterBaseModel');
        if (baseModelFilter) baseModelFilter.value = '';
        
        const searchInput = document.getElementById('searchModelName');
        if (searchInput) searchInput.value = '';

        // 重新渲染
        this.renderModelsTable();
    },

    // 渲染筛选后的模型表格
    renderFilteredModelsTable(models) {
        const tbody = document.getElementById('modelsTableBody');
        if (!tbody) return;

        if (models.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #999;">没有找到匹配的模型</td></tr>';
            return;
        }

        tbody.innerHTML = models.map((model, index) => this.renderModelRow(model, index)).join('');
    },

    // 渲染模型行
    renderModelRow(model, index) {
        const modelId = model.modelId || model.id;
        const isPinned = model.isPinned || false;
        const isHidden = model.isHidden || false;
        
        return `
            <tr style="border-bottom: 1px solid #eee; ${isHidden ? 'opacity: 0.5;' : ''}" data-model-id="${modelId}">
                <td style="padding: 12px;">${modelId}</td>
                <td style="padding: 12px; font-weight: 500;">${model.modelName || model.name}</td>
                <td style="padding: 12px;">${model.modelType || model.type || '-'}</td>
                <td style="padding: 12px;">${model.styleType || '-'}</td>
                <td style="padding: 12px;">${model.baseModel || '-'}</td>
                <td style="padding: 12px;">
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: #e8f0fe; color: #1a73e8; margin-right: 4px;"
                        onclick="Models.toggleModelDetail(${modelId}, ${index})">详情</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: ${isPinned ? '#34a853' : '#f0f0f0'}; color: ${isPinned ? 'white' : '#666'}; margin-right: 4px;"
                        onclick="Models.togglePin(${modelId}, ${!isPinned})">${isPinned ? '已置顶' : '置顶'}</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: ${isHidden ? '#ea4335' : '#f0f0f0'}; color: ${isHidden ? 'white' : '#666'}; margin-right: 4px;"
                        onclick="Models.toggleHidden(${modelId}, ${!isHidden})">${isHidden ? '已隐藏' : '隐藏'}</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: #e8f0fe; color: #1a73e8;"
                        onclick="Models.addToSelected(${modelId})">使用</button>
                </td>
            </tr>
            <tr id="model-detail-${index}" style="display: none; background: #f8f9fa;">
                <td colspan="6" style="padding: 15px;">
                    <div id="model-detail-content-${index}">加载中...</div>
                </td>
            </tr>
        `;
    },

    // 切换模型详情展开/收起
    async toggleModelDetail(modelId, index) {
        const detailRow = document.getElementById(`model-detail-${index}`);
        if (!detailRow) return;

        if (detailRow.style.display === 'none') {
            // 展开
            detailRow.style.display = 'table-row';
            await this.loadModelDetail(modelId, index);
        } else {
            // 收起
            detailRow.style.display = 'none';
        }
    },

    // 加载模型详情
    async loadModelDetail(modelId, index) {
        const contentDiv = document.getElementById(`model-detail-content-${index}`);
        if (!contentDiv) return;

        try {
            const result = await API.getModelDetail(modelId);
            
            if (result.success && result.data) {
                const model = result.data;
                contentDiv.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <strong>模型ID:</strong> ${model.modelId || model.id}
                        </div>
                        <div>
                            <strong>模型名称:</strong> ${model.modelName || model.name}
                        </div>
                        <div>
                            <strong>模型类型:</strong> ${model.modelType || model.type || '-'}
                        </div>
                        <div>
                            <strong>风格类型:</strong> ${model.styleType || '-'}
                        </div>
                        <div>
                            <strong>基础模型:</strong> ${model.baseModel || '-'}
                        </div>
                        <div>
                            <strong>模型标签:</strong> ${model.tags ? model.tags.join(', ') : '-'}
                        </div>
                        <div>
                            <strong>创建时间:</strong> ${model.createdAt ? new Date(model.createdAt).toLocaleString('zh-CN') : '-'}
                        </div>
                        <div>
                            <strong>更新时间:</strong> ${model.updatedAt ? new Date(model.updatedAt).toLocaleString('zh-CN') : '-'}
                        </div>
                    </div>
                    ${model.description ? `
                        <div style="margin-top: 15px;">
                            <strong>模型描述:</strong>
                            <p style="margin: 5px 0; color: #666;">${model.description}</p>
                        </div>
                    ` : ''}
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn" style="background: #e8f0fe; color: #1a73e8;"
                            onclick="Models.copyModelInfo(${modelId})">复制模型信息</button>
                        <button class="btn" style="background: #34a853; color: white;"
                            onclick="Models.useModel(${modelId})">使用此模型</button>
                    </div>
                `;
            } else {
                contentDiv.innerHTML = '<p style="color: #ea4335;">加载模型详情失败</p>';
            }
        } catch (error) {
            contentDiv.innerHTML = `<p style="color: #ea4335;">加载出错: ${error.message}</p>`;
        }
    },

    // 切换置顶状态
    async togglePin(modelId, isPinned) {
        try {
            const result = await API.togglePinModel(modelId, isPinned);
            
            if (result.success) {
                // 更新本地状态
                const models = State.get('models') || [];
                const model = models.find(m => (m.modelId || m.id) === modelId);
                if (model) {
                    model.isPinned = isPinned;
                    State.set('models', models);
                }
                
                // 重新渲染
                this.applyFilters();
                
                alert(isPinned ? '模型已置顶' : '已取消置顶');
            } else {
                alert('操作失败: ' + (result.msg || '未知错误'));
            }
        } catch (error) {
            alert('操作出错: ' + error.message);
        }
    },

    // 切换隐藏状态
    async toggleHidden(modelId, isHidden) {
        try {
            const result = await API.toggleHiddenModel(modelId, isHidden);
            
            if (result.success) {
                // 更新本地状态
                const models = State.get('models') || [];
                const model = models.find(m => (m.modelId || m.id) === modelId);
                if (model) {
                    model.isHidden = isHidden;
                    State.set('models', models);
                }
                
                // 重新渲染
                this.applyFilters();
                
                alert(isHidden ? '模型已隐藏' : '已取消隐藏');
            } else {
                alert('操作失败: ' + (result.msg || '未知错误'));
            }
        } catch (error) {
            alert('操作出错: ' + error.message);
        }
    },

    // 复制模型信息
    copyModelInfo(modelId) {
        const models = State.get('models') || [];
        const model = models.find(m => (m.modelId || m.id) === modelId);
        
        if (!model) {
            alert('模型不存在');
            return;
        }

        const info = `模型ID: ${model.modelId || model.id}
模型名称: ${model.modelName || model.name}
模型类型: ${model.modelType || model.type || '-'}
风格类型: ${model.styleType || '-'}
基础模型: ${model.baseModel || '-'}`;

        navigator.clipboard.writeText(info).then(() => {
            alert('模型信息已复制到剪贴板');
        }).catch(() => {
            alert('复制失败');
        });
    },

    // 使用模型（跳转到生成页并添加）
    async useModel(modelId) {
        try {
            const result = await API.useModel(modelId);
            
            if (result.success) {
                // 添加到已选模型
                const models = State.get('models') || [];
                const model = models.find(m => (m.modelId || m.id) === modelId);
                
                if (model) {
                    State.addSelectedModel({
                        modelId: model.modelId || model.id,
                        modelName: model.modelName || model.name,
                        modelType: model.modelType || model.type
                    });
                    
                    // 切换到生成标签页
                    if (typeof Tabs !== 'undefined') {
                        Tabs.switch('generate');
                    }
                    
                    // 渲染已选模型
                    this.renderSelectedModels();
                    
                    alert('模型已添加到生成页！');
                }
            } else {
                alert('操作失败: ' + (result.msg || '未知错误'));
            }
        } catch (error) {
            alert('操作出错: ' + error.message);
        }
    },

    // 打开模型选择器弹窗
    openSelector() {
        const modal = document.getElementById('modelSelectorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderModelList();
        }
    },

    // 关闭模型选择器弹窗
    closeSelector() {
        const modal = document.getElementById('modelSelectorModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // 渲染模型列表
    renderModelList() {
        const container = document.getElementById('modelSelectorList');
        if (!container) return;

        const models = State.get('models') || [];
        
        if (models.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无模型数据，请先同步模型列表</p>';
            return;
        }

        container.innerHTML = models.map(model => `
            <div class="model-selector-item" data-model-id="${model.modelId || model.id}" style="
                padding: 15px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                <div style="font-weight: 600; color: #1a73e8;">${model.modelName || model.name}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${model.modelId || model.id}</div>
                <div style="font-size: 12px; color: #999; margin-top: 3px;">${model.modelType || model.type || '未知类型'}</div>
            </div>
        `).join('');

        // 绑定点击事件
        container.querySelectorAll('.model-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                const modelId = parseInt(item.dataset.modelId);
                const model = models.find(m => (m.modelId || m.id) === modelId);
                if (model) {
                    this.selectModel(model);
                }
            });
        });
    },

    // 选择模型
    selectModel(model) {
        const success = State.addSelectedModel({
            modelId: model.modelId || model.id,
            modelName: model.modelName || model.name,
            modelType: model.modelType || model.type
        });
        
        if (success) {
            this.renderSelectedModels();
            this.closeSelector();
        }
    },

    // 渲染已选模型列表
    renderSelectedModels() {
        const container = document.getElementById('selectedModelsList');
        if (!container) return;

        const selectedModels = State.get('selectedModels') || [];
        
        if (selectedModels.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">暂未选择模型</p>';
            return;
        }

        container.innerHTML = selectedModels.map(model => `
            <div class="selected-model-item" style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: white;
                border-radius: 6px;
                margin-bottom: 8px;
                border: 1px solid #e0e0e0;
            ">
                <span style="flex: 1;">${model.modelName} (ID: ${model.modelId})</span>
                <input type="range" min="0" max="1" step="0.1" value="${model.strength}" 
                    data-model-id="${model.modelId}"
                    style="width: 100px;"
                    onchange="Models.updateModelStrength(${model.modelId}, this.value)">
                <span style="min-width: 50px; font-size: 12px;">强度: ${model.strength}</span>
                <button onclick="Models.removeModel(${model.modelId})" style="
                    background: #ea4335;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                ">删除</button>
            </div>
        `).join('');
    },

    // 更新模型强度
    updateModelStrength(modelId, strength) {
        State.updateModelStrength(modelId, strength);
        this.renderSelectedModels();
    },

    // 移除模型
    removeModel(modelId) {
        State.removeSelectedModel(modelId);
        this.renderSelectedModels();
    },

    // 同步模型列表
    async syncModels() {
        try {
            const button = document.querySelector('[data-action="syncModels"]');
            if (button) {
                button.disabled = true;
                button.textContent = '🔄 同步中...';
            }

            const result = await API.syncModels();
            
            if (result.success && result.data) {
                State.set('models', result.data);
                this.renderModelsTable();
                alert('模型同步成功！');
            } else {
                alert('模型同步失败: ' + (result.msg || '未知错误'));
            }
        } catch (error) {
            alert('同步失败: ' + error.message);
        } finally {
            const button = document.querySelector('[data-action="syncModels"]');
            if (button) {
                button.disabled = false;
                button.textContent = '🔄 同步模型';
            }
        }
    },

    // 渲染模型表格
    renderModelsTable() {
        const tbody = document.getElementById('modelsTableBody');
        if (!tbody) return;

        const models = State.get('models') || [];
        
        if (models.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #999;">暂无模型数据，请点击"同步模型"按钮获取</td></tr>';
            return;
        }

        tbody.innerHTML = models.map((model, index) => this.renderModelRow(model, index)).join('');
    },

    // 添加到已选模型
    addToSelected(modelId) {
        const models = State.get('models') || [];
        const model = models.find(m => (m.modelId || m.id) === modelId);
        if (model) {
            State.addSelectedModel({
                modelId: model.modelId || model.id,
                modelName: model.modelName || model.name,
                modelType: model.modelType || model.type
            });
            alert('模型已添加！');
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Models;
}
