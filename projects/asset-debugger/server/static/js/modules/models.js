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
        console.log('🚀 [Models] 模块初始化开始...');
        this.bindEvents();
        console.log('✅ [Models] 模块初始化完成');
    },

    bindEvents() {
        console.log('🔗 [Models] 正在绑定事件...');

        // 打开模型选择器按钮
        const openBtn = document.querySelector('[data-action="openModelSelector"]');
        console.log('🔍 [Models] 查找 openModelSelector 按钮:', openBtn);
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                console.log('🖱️ [Models] openModelSelector 按钮被点击!');
                this.openSelector();
            });
            console.log('✅ [Models] openModelSelector 事件绑定成功');
        } else {
            console.warn('⚠️ [Models] 未找到 openModelSelector 按钮');
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

        console.log('✅ [Models] 所有事件绑定完成');
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
                <td style="padding: 12px;">
                    <input type="checkbox" class="model-checkbox" data-model-id="${modelId}" data-model-name="${model.modelName || model.name || ''}"
                           onchange="Models.updateModelSelection()" style="cursor: pointer;">
                </td>
                <td style="padding: 12px;">${modelId}</td>
                <td style="padding: 12px; font-weight: 500;">${model.modelName || model.name}</td>
                <td style="padding: 12px;">${model.modelType || model.type || '-'}</td>
                <td style="padding: 12px;">${model.styleType || '-'}</td>
                <td style="padding: 12px;">${model.baseModel || '-'}</td>
                <td style="padding: 12px;">
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: #e8f0fe; color: #1a73e8; margin-right: 4px;"
                        onclick="event.stopPropagation(); Models.toggleModelDetail(${modelId}, ${index})">详情</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: ${isPinned ? '#34a853' : '#f0f0f0'}; color: ${isPinned ? 'white' : '#666'}; margin-right: 4px;"
                        onclick="event.stopPropagation(); Models.togglePin(${modelId}, ${!isPinned})">${isPinned ? '已置顶' : '置顶'}</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: ${isHidden ? '#ea4335' : '#f0f0f0'}; color: ${isHidden ? 'white' : '#666'}; margin-right: 4px;"
                        onclick="event.stopPropagation(); Models.toggleHidden(${modelId}, ${!isHidden})">${isHidden ? '已隐藏' : '隐藏'}</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; background: #e8f0fe; color: #1a73e8;"
                        onclick="event.stopPropagation(); Models.addToSelected(${modelId})">使用</button>
                </td>
            </tr>
            <tr id="model-detail-${index}" style="display: none; background: #f8f9fa;">
                <td colspan="7" style="padding: 15px;">
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

    // 打开模型选择器弹窗（完整版 - 带搜索和筛选功能）
    async openSelector() {
        console.log('📦 [Models] openSelector() 被调用');

        const selectedModels = State.get('selectedModels') || [];

        if (selectedModels.length >= 5) {
            alert('⚠️ 最多只能选择5个模型');
            return;
        }

        try {
            let models = [];

            // 优先策略：检查本地缓存
            const cachedModels = State.get('models');

            if (cachedModels && Array.isArray(cachedModels) && cachedModels.length > 0) {
                console.log(`💾 [Models] 使用本地缓存: ${cachedModels.length} 个模型`);
                models = cachedModels;
            } else {
                console.log('🔄 [Models] 本地无缓存, 正在从服务器获取...');

                // 降级策略：调用API获取
                const result = await API.getModels();

                if (!result.success || !result.data) {
                    console.error('❌ [Models] API 返回格式错误:', result);
                    alert(`❌ 加载模型列表失败\n\n响应数据: ${JSON.stringify(result).substring(0, 200)}`);
                    return;
                }

                if (!Array.isArray(result.data)) {
                    console.error('❌ [Models] result.data 不是数组:', typeof result.data);
                    alert('❌ 模型列表数据格式错误');
                    return;
                }

                models = result.data;

                // 缓存到本地State
                State.set('models', models);
                console.log(`✅ [Models] 从服务器获取 ${models.length} 个模型并已缓存`);
            }

            console.log(`✅ [Models] 可用模型总数: ${models.length}`);

            // 过滤隐藏模型
            this.selectorModels = models.filter(m => !(m.isHidden || m.is_hidden));
            console.log(`🔍 [Models] 过滤后剩余 ${this.selectorModels.length} 个可见模型`);
            this.selectorFilters = {
                searchName: '',
                modelType: '',
                styleType: ''
            };

            // 获取筛选选项
            const modelTypes = [...new Set(this.selectorModels.map(m => m.modelType || m.model_type || m.type).filter(Boolean))].sort();
            const styleTypes = [...new Set(this.selectorModels.map(m => m.styleType || m.style_type).filter(Boolean))].sort();

            const html = `
                <div class="modal-overlay" id="modelSelectorModal" onclick="if(event.target===this)Models.closeSelector()">
                    <div class="modal-container" style="max-width: 800px;">
                        <div class="modal-header">
                            <h3>添加模型 (已选 ${selectedModels.length}/5)</h3>
                            <button class="modal-close" onclick="Models.closeSelector()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <!-- 搜索和筛选区域 -->
                            <div style="
                                display: flex;
                                flex-wrap: wrap;
                                gap: 10px;
                                padding: 15px;
                                background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
                                border-radius: 8px;
                                margin-bottom: 20px;
                                border: 1px solid #e0e0e0;
                            ">
                                <!-- 搜索框 -->
                                <div style="flex: 1; min-width: 250px;">
                                    <input type="text" id="selectorSearchInput"
                                           placeholder="🔍 搜索模型名称..."
                                           oninput="Models.filterSelectorModels()"
                                           style="
                                               width: 100%;
                                               padding: 10px 12px;
                                               border: 2px solid #dadce0;
                                               border-radius: 6px;
                                               font-size: 14px;
                                               transition: all 0.3s;
                                           "
                                           onfocus="this.style.borderColor='#1a73e8'; this.style.boxShadow='0 0 0 3px rgba(26,115,232,0.1)'"
                                           onblur="this.style.borderColor='#dadce0'; this.style.boxShadow='none'">
                                </div>

                                <!-- 模型类型筛选 -->
                                <div style="min-width: 140px;">
                                    <select id="selectorModelTypeFilter"
                                            onchange="Models.filterSelectorModels()"
                                            style="
                                                width: 100%;
                                                padding: 10px;
                                                border: 2px solid #dadce0;
                                                border-radius: 6px;
                                                font-size: 14px;
                                                cursor: pointer;
                                                background: white;
                                            ">
                                        <option value="">全部类型</option>
                                        ${modelTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- 风格类型筛选 -->
                                <div style="min-width: 140px;">
                                    <select id="selectorStyleTypeFilter"
                                            onchange="Models.filterSelectorModels()"
                                            style="
                                                width: 100%;
                                                padding: 10px;
                                                border: 2px solid #dadce0;
                                                border-radius: 6px;
                                                font-size: 14px;
                                                cursor: pointer;
                                                background: white;
                                            ">
                                        <option value="">全部风格</option>
                                        ${styleTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- 清除按钮 -->
                                <button class="btn" onclick="Models.clearSelectorFilters()"
                                        style="
                                            background: linear-gradient(135deg, #fbbc05 0%, #f9a825 100%);
                                            color: #333;
                                            font-weight: 600;
                                            padding: 10px 20px;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                            box-shadow: 0 2px 4px rgba(251,188,5,0.3);
                                            transition: all 0.3s;
                                        "
                                        onmouseover="this.style.transform='translateY(-1px)'"
                                        onmouseout="this.style.transform='translateY(0)'">
                                    🗑️ 清除
                                </button>
                            </div>

                            <!-- 模型列表容器 -->
                            <div id="selectorModelList"
                                 style="
                                     max-height: 450px;
                                     overflow-y: auto;
                                     border: 1px solid #e0e0e0;
                                     border-radius: 8px;
                                     background: white;
                                 ">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <span id="selectorModelCount"
                                  style="
                                      color: #666;
                                      font-size: 13px;
                                      font-weight: 500;
                                  "></span>
                            <div style="flex: 1;"></div>
                            <button class="btn" onclick="Models.closeSelector()"
                                    style="
                                        padding: 10px 24px;
                                        background: #f5f5f5;
                                        color: #666;
                                        border: 1px solid #dadce0;
                                        border-radius: 6px;
                                        cursor: pointer;
                                    ">关闭</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', html);

            // 初始渲染
            this.filterSelectorModels();

            console.log('✅ [Models] 模型选择器弹框渲染完成');

        } catch (error) {
            console.error('❌ [Models] openSelector() 出错:', error);
            console.error('❌ [Models] 错误堆栈:', error.stack);
            alert(`❌ 加载模型列表失败\n\n错误信息: ${error.message}\n\n请检查:\n1. 网络连接是否正常\n2. 后端服务是否启动\n3. 浏览器控制台查看详细日志`);
        }
    },

    // 筛选模型列表
    filterSelectorModels() {
        const searchValue = (document.getElementById('selectorSearchInput')?.value || '').toLowerCase();
        const modelTypeValue = document.getElementById('selectorModelTypeFilter')?.value || '';
        const styleTypeValue = document.getElementById('selectorStyleTypeFilter')?.value || '';

        let filtered = this.selectorModels || [];

        // 模糊搜索（支持模型名称和ID）
        if (searchValue) {
            filtered = filtered.filter(m => {
                const name = (m.modelName || m.model_name || m.name || '').toLowerCase();
                const id = String(m.modelId || m.model_id || m.id || '').toLowerCase();
                return name.includes(searchValue) || id.includes(searchValue);
            });
        }

        // 模型类型筛选
        if (modelTypeValue) {
            filtered = filtered.filter(m => (m.modelType || m.model_type || m.type) === modelTypeValue);
        }

        // 风格类型筛选
        if (styleTypeValue) {
            filtered = filtered.filter(m => (m.styleType || m.style_type) === styleTypeValue);
        }

        // 渲染列表
        this.renderSelectorModelList(filtered);
    },

    // 渲染模型选择器列表
    renderSelectorModelList(models) {
        const container = document.getElementById('selectorModelList');
        const countEl = document.getElementById('selectorModelCount');
        if (!container) return;

        const selectedModels = State.get('selectedModels') || [];

        if (models.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 60px 20px;
                    color: #999;
                    font-size: 14px;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
                    <div>没有找到匹配的模型</div>
                    <div style="font-size: 12px; margin-top: 8px; color: #bbb;">
                        请尝试调整搜索条件或清除筛选
                    </div>
                </div>
            `;
            if (countEl) countEl.textContent = '共 0 个模型';
            return;
        }

        let html = '';
        models.forEach((model, index) => {
            // 获取当前模型的原始ID（保持原始格式，不做parseInt转换）
            const currentModelId = model.modelId || model.model_id || model.id;

            // 检查是否已被选中（使用宽松比较，兼容数字和字符串）
            const isAlreadySelected = selectedModels.some(m => {
                // 统一转换为字符串比较
                const selectedId = String(m.modelId || '').trim();
                const currentId = String(currentModelId || '').trim();

                // 精确匹配
                if (selectedId === currentId) return true;

                // 兼容：如果都是数字，尝试数值比较
                const selectedNum = Number(selectedId);
                const currentNum = Number(currentId);
                if (!isNaN(selectedNum) && !isNaN(currentNum) && selectedNum === currentNum) {
                    return true;
                }

                return false;
            });

            // 调试日志（仅输出前3个模型，避免日志过多）
            if (index < 3) {
                console.log(`🔍 [Models] 模型${index + 1}: ID=${currentModelId} (类型:${typeof currentModelId}), 已选=${isAlreadySelected}`);
                console.log(`   当前已选列表:`, selectedModels.map(m => ({id: m.modelId, type: typeof m.modelId})));
            } else if (index === 3) {
                console.log(`🔍 [Models] ... (共 ${models.length} 个模型, 已省略后续日志)`);
            }

            html += `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    border-bottom: 1px solid #f0f0f0;
                    ${isAlreadySelected
                        ? 'opacity: 0.5; background: #fafafa;'
                        : 'cursor: pointer; transition: all 0.2s;'}
                    ${!isAlreadySelected
                        ? 'onmouseover="this.style.background=\'#f8f9fa\'; this.style.paddingLeft=\'20px\'"'
                        : ''}
                    ${!isAlreadySelected
                        ? 'onmouseout="this.style.background=\'white\'; this.style.paddingLeft=\'15px\'"'
                        : ''}
                "
                     ${!isAlreadySelected ? `onclick="Models.addToSelectedFromSelector('${currentModelId}')"` : ''}>
                    <!-- 模型封面图 -->
                    <img src="${model.coverImage || model.cover_image || ''}"
                         style="
                             width: 60px;
                             height: 60px;
                             object-fit: cover;
                             border-radius: 8px;
                             border: 2px solid #e0e0e0;
                             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                         "
                         onerror="
                             this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%23e8f0fe%22 width=%2260%22 height=%2260%22 rx=%228%22/><text x=%2230%22 y=%2235%22 text-anchor=%22middle%22 fill=%22%231a73e8%22 font-size=%2220%22>📦</text></svg>'
                         ">

                    <!-- 模型信息 -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="
                            font-weight: 600;
                            color: #1a73e8;
                            font-size: 15px;
                            margin-bottom: 6px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        ">
                            ${model.modelName || model.model_name || '未命名模型'}
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <span style="
                                background: linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 100%);
                                color: #1a73e8;
                                padding: 3px 8px;
                                border-radius: 4px;
                                font-size: 11px;
                                font-weight: 500;
                                font-family: monospace;
                            ">ID: ${model.modelId || model.model_id || model.id}</span>
                            <span style="
                                background: linear-gradient(135deg, #fce8e6 0%, #fad2cf 100%);
                                color: #d32f2f;
                                padding: 3px 8px;
                                border-radius: 4px;
                                font-size: 11px;
                                font-weight: 500;
                            ">${model.modelType || model.model_type || model.type || '未知类型'}</span>
                            <span style="
                                background: linear-gradient(135deg, #e6f4ea 0%, #ccebcc 100%);
                                color: #2e7d32;
                                padding: 3px 8px;
                                border-radius: 4px;
                                font-size: 11px;
                                font-weight: 500;
                            ">${model.styleType || model.style_type || '未知风格'}</span>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    ${isAlreadySelected
                        ? `<span style="
                                color: #999;
                                font-size: 12px;
                                padding: 6px 14px;
                                background: #f5f5f5;
                                border-radius: 6px;
                                border: 1px solid #e0e0e0;
                           ">✓ 已添加</span>`
                        : `<span style="
                                color: #1a73e8;
                                font-size: 13px;
                                padding: 6px 16px;
                                background: linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 100%);
                                border-radius: 6px;
                                font-weight: 600;
                                border: 1px solid #aecbfa;
                                transition: all 0.3s;
                           ">点击添加 →</span>`
                    }
                </div>
            `;
        });

        container.innerHTML = html;

        // 更新计数
        if (countEl) {
            countEl.innerHTML = `共 <strong style="color: #1a73e8;">${models.length}</strong> 个模型`;
        }
    },

    // 清除筛选条件
    clearSelectorFilters() {
        const searchInput = document.getElementById('selectorSearchInput');
        const modelTypeFilter = document.getElementById('selectorModelTypeFilter');
        const styleTypeFilter = document.getElementById('selectorStyleTypeFilter');

        if (searchInput) searchInput.value = '';
        if (modelTypeFilter) modelTypeFilter.value = '';
        if (styleTypeFilter) styleTypeFilter.value = '';

        this.filterSelectorModels();
    },

    // 关闭模型选择器弹窗
    closeSelector() {
        const modal = document.getElementById('modelSelectorModal');
        if (modal) modal.remove();
    },

    // 从选择器中添加模型（保持原始ID格式）
    addToSelectedFromSelector(modelId) {
        console.log('➕ [Models] 尝试添加模型, 原始ID:', modelId, '类型:', typeof modelId);

        const selectedModels = State.get('selectedModels') || [];

        if (selectedModels.length >= 5) {
            alert('⚠️ 最多只能选择5个模型');
            return;
        }

        // 使用宽松比较检查是否已存在
        const normalizedInputId = String(modelId || '').trim();
        const isDuplicate = selectedModels.some(m => {
            const existingId = String(m.modelId || '').trim();
            return existingId === normalizedInputId ||
                   (!isNaN(Number(existingId)) && !isNaN(Number(normalizedInputId)) &&
                    Number(existingId) === Number(normalizedId));
        });

        if (isDuplicate) {
            alert('⚠️ 该模型已添加');
            return;
        }

        // 从selectorModels中查找模型信息（使用宽松匹配）
        const modelInfo = this.selectorModels.find(m => {
            const infoId = String(m.modelId || m.model_id || m.id || '').trim();
            return infoId === normalizedInputId ||
                   (!isNaN(Number(infoId)) && !isNaN(Number(normalizedInputId)) &&
                    Number(infoId) === Number(normalizedId));
        });

        if (modelInfo) {
            // 保持原始ID格式存储（不做 parseInt 转换）
            const originalModelId = modelInfo.modelId || modelInfo.model_id || modelInfo.id;

            console.log('✅ [Models] 找到模型信息, 存储原始ID:', originalModelId, '类型:', typeof originalModelId);

            State.addSelectedModel({
                modelId: originalModelId,  // 保持原始格式
                modelName: modelInfo.modelName || modelInfo.model_name || '未知模型',
                modelType: modelInfo.modelType || modelInfo.model_type,
                strength: 0.9
            });

            // 刷新显示
            this.renderSelectedModels();
            this.filterSelectorModels(); // 更新选择器中的状态

            // 显示成功提示
            const count = (State.get('selectedModels') || []).length;
            alert(`✅ 已添加模型！\n\n模型ID: ${modelId}\n当前已选: ${count}/5\n\n💡 提示：可继续添加或关闭窗口`);
        } else {
            alert('❌ 未找到该模型信息');
        }
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

    // 渲染已选模型列表（增强版 - 支持参数微调，样式优化）
    renderSelectedModels() {
        const container = document.getElementById('selectedModelsList');
        if (!container) return;

        const selectedModels = State.get('selectedModels') || [];

        if (selectedModels.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 15px; text-align: center; background: #fafafa; border-radius: 6px;">未选择模型，请点击下方按钮添加或使用预设组合</p>';
            return;
        }

        container.innerHTML = selectedModels.map((model, index) => `
            <div class="selected-model-item" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 15px;
                background: white;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 2px solid #e3f2fd;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                transition: all 0.3s;
            " onmouseover="this.style.borderColor='#1a73e8'; this.style.boxShadow='0 4px 8px rgba(26,115,232,0.15)'"
               onmouseout="this.style.borderColor='#e3f2fd'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: #1a73e8; font-size: 14px; margin-bottom: 3px;">
                        ${model.modelName || '未知模型'}
                    </div>
                    <div style="font-size: 11px; color: #666; font-family: monospace;">
                        ID: ${model.modelId}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex: 2;">
                    <input type="range" min="0" max="1" step="0.1" value="${model.strength}"
                           data-model-id="${model.modelId}"
                           style="
                               width: 140px;
                               height: 6px;
                               -webkit-appearance: none;
                               appearance: none;
                               background: linear-gradient(to right, #1a73e8 0%, #1a73e8 ${(model.strength * 100)}%, #e0e0e0 ${(model.strength * 100)}%, #e0e0e0 100%);
                               border-radius: 3px;
                               outline: none;
                               cursor: pointer;
                           "
                           oninput="
                               this.style.background = 'linear-gradient(to right, #1a73e8 0%, #1a73e8 ' + (this.value * 100) + '%, #e0e0e0 ' + (this.value * 100) + '%, #e0e0e0 100%)';
                               document.getElementById('strength-value-${model.modelId}').textContent = parseFloat(this.value).toFixed(1);
                           "
                           onchange="Models.updateModelStrength(${model.modelId}, this.value)">
                    <span id="strength-value-${model.modelId}" style="
                        min-width: 45px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #1a73e8;
                        background: #e3f2fd;
                        padding: 4px 8px;
                        border-radius: 4px;
                        text-align: center;
                    ">${parseFloat(model.strength).toFixed(1)}</span>
                    <span style="font-size: 12px; color: #666;">阈值</span>
                </div>
                <button onclick="Models.removeModel(${model.modelId})" style="
                    background: linear-gradient(135deg, #ea4335 0%, #d32f2f 100%);
                    color: white;
                    border: none;
                    padding: 6px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    box-shadow: 0 2px 4px rgba(234,67,53,0.3);
                    transition: all 0.3s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">删除</button>
            </div>
        `).join('');

        // 添加模型计数提示
        const countHtml = `
            <div style="
                margin-top: 10px;
                padding: 10px;
                background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                border-radius: 6px;
                font-size: 13px;
                color: #2e7d32;
                font-weight: 500;
                text-align: center;
            ">
                ✅ 已选择 ${selectedModels.length} 个模型（最多支持5个叠加）
            </div>
        `;
        container.innerHTML += countHtml;
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
    },

    // ==================== 多模型选择功能 ====================

    // 存储临时选中的模型（用于批量选择）
    tempSelectedModels: new Map(),

    // 全选/取消全选
    toggleSelectAllModels() {
        const selectAllCheckbox = document.getElementById('selectAllModels');
        const checkboxes = document.querySelectorAll('.model-checkbox');
        const isChecked = selectAllCheckbox.checked;

        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const modelId = checkbox.dataset.modelId;
            const modelName = checkbox.dataset.modelName;

            if (isChecked) {
                this.tempSelectedModels.set(modelId, { name: modelName, strength: 0.9 });
            } else {
                this.tempSelectedModels.delete(modelId);
            }
        });

        this.updateModelSelectionUI();
    },

    // 更新模型选择状态
    updateModelSelection() {
        this.tempSelectedModels.clear();
        const checkboxes = document.querySelectorAll('.model-checkbox:checked');

        checkboxes.forEach(checkbox => {
            const modelId = checkbox.dataset.modelId;
            const modelName = checkbox.dataset.modelName;
            this.tempSelectedModels.set(modelId, { name: modelName, strength: 0.9 });
        });

        this.updateModelSelectionUI();
    },

    // 更新选择状态UI
    updateModelSelectionUI() {
        const toolbar = document.getElementById('multiModelToolbar');
        const countSpan = document.getElementById('selectedModelCount');
        const selectAllCheckbox = document.getElementById('selectAllModels');

        const count = this.tempSelectedModels.size;
        countSpan.textContent = count;

        if (count > 0) {
            toolbar.style.display = 'flex';
        } else {
            toolbar.style.display = 'none';
        }

        // 更新全选框状态
        const checkboxes = document.querySelectorAll('.model-checkbox');
        const checkedBoxes = document.querySelectorAll('.model-checkbox:checked');
        selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
    },

    // 清除所有选择
    clearAllModelSelection() {
        this.tempSelectedModels.clear();
        const checkboxes = document.querySelectorAll('.model-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        document.getElementById('selectAllModels').checked = false;
        this.updateModelSelectionUI();
    },

    // 打开多模型生成弹窗
    openMultiModelGenerateModal() {
        if (this.tempSelectedModels.size === 0) {
            alert('请至少选择一个模型');
            return;
        }
        if (this.tempSelectedModels.size > 5) {
            alert('最多只能选择5个模型');
            return;
        }

        let modelListHtml = '';
        this.tempSelectedModels.forEach((data, modelId) => {
            modelListHtml += `
                <div style="display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <span style="flex: 1; font-weight: 500;">${data.name}</span>
                    <code style="background: #e8f0fe; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${modelId}</code>
                    <label style="font-size: 13px; color: #5f6368;">强度:</label>
                    <input type="number" class="multi-model-strength" data-model-id="${modelId}"
                           min="0" max="1" step="0.1" value="${data.strength}"
                           style="width: 70px; padding: 5px; border: 1px solid #dadce0; border-radius: 4px;">
                </div>
            `;
        });

        const modalHtml = `
            <div class="modal-overlay" id="multiModelGenerateModal" onclick="if(event.target===this)Models.closeModal(this)">
                <div class="modal-container" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>🎨 多模型叠加生成</h3>
                        <button class="modal-close" onclick="Models.closeModal(document.getElementById('multiModelGenerateModal'))">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #2e7d32;">
                            ✅ 已选择 ${this.tempSelectedModels.size} 个模型（最多支持5个模型叠加）
                        </div>

                        <h4 style="margin: 20px 0 10px; color: #333;">模型列表与强度设置</h4>
                        ${modelListHtml}

                        <h4 style="margin: 25px 0 10px; color: #333;">生成参数</h4>
                        <div style="display: grid; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-size: 13px; color: #5f6368;">正向提示词</label>
                                <textarea id="multiModelPrompt" rows="3" placeholder="输入提示词..."
                                          style="width: 100%; padding: 10px; border: 1px solid #dadce0; border-radius: 6px; resize: vertical;">Q版角色，可爱卡通风格，明亮色彩，干净线条，白色背景</textarea>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 13px; color: #5f6368;">宽高比</label>
                                    <select id="multiModelAspectRatio" style="width: 100%; padding: 8px; border: 1px solid #dadce0; border-radius: 6px;">
                                        <option value="1:1">1:1</option>
                                        <option value="3:4" selected>3:4</option>
                                        <option value="4:3">4:3</option>
                                        <option value="16:9">16:9</option>
                                        <option value="9:16">9:16</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 13px; color: #5f6368;">出图数量</label>
                                    <select id="multiModelBatchSize" style="width: 100%; padding: 8px; border: 1px solid #dadce0; border-radius: 6px;">
                                        <option value="1" selected>1</option>
                                        <option value="2">2</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn" onclick="Models.closeModal(document.getElementById('multiModelGenerateModal'))">取消</button>
                        <button class="btn btn-primary" onclick="Models.submitMultiModelGenerate()">🚀 开始生成</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    // 关闭弹窗
    closeModal(modal) {
        if (modal) {
            modal.remove();
        }
    },

    // 提交多模型生成
    async submitMultiModelGenerate() {
        const prompt = document.getElementById('multiModelPrompt').value;
        const aspectRatio = document.getElementById('multiModelAspectRatio').value;
        const batchSize = parseInt(document.getElementById('multiModelBatchSize').value);

        if (!prompt.trim()) {
            alert('请输入提示词');
            return;
        }

        // 收集模型和强度
        const modelDetailList = [];
        const strengthInputs = document.querySelectorAll('.multi-model-strength');
        strengthInputs.forEach(input => {
            modelDetailList.push({
                modelId: parseInt(input.dataset.modelId),
                strength: parseFloat(input.value) || 0.9
            });
        });

        const requestData = {
            data: {
                modelDetailList: modelDetailList,
                prompt: prompt,
                aspectRatios: aspectRatio,
                batchSize: batchSize,
                seed: -1,
                faceDetail: true
            }
        };

        alert('正在提交多模型生成任务...');

        try {
            const result = await API.generate(requestData);

            if (result.success) {
                alert(`✅ 生成任务已提交！Client ID: ${result.data.clientId}`);
                this.closeModal(document.getElementById('multiModelGenerateModal'));
                this.clearAllModelSelection();

                // 添加到历史
                if (typeof Generate !== 'undefined') {
                    Generate.addToHistory(result.data.clientId, requestData.data);
                }
            } else {
                alert('生成失败: ' + (result.msg || '未知错误'));
            }
        } catch (error) {
            alert('请求失败: ' + error.message);
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Models;
}
