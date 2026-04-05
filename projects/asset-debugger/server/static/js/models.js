// 模型管理模块

import {
    allModels, currentFilter, activeFilters, modelListSelectedModels,
    setAllModels, setCurrentFilter, setActiveFilters, setModelListSelectedModels
} from './state.js';
import { API } from './api.js';
import { showNotification, escapeHtml } from './utils.js';

// 模型详情缓存
const modelDetailCache = new Map();

/**
 * 同步模型列表
 */
export async function syncModels() {
    try {
        const result = await API.syncModels();

        if (result.success) {
            displayModels(result.data);
            showNotification('模型同步成功', 'success');
        } else {
            showNotification('同步失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('请求失败: ' + error.message, 'error');
    }
}

/**
 * 加载模型列表
 */
export async function loadModels() {
    try {
        const result = await API.getModels();

        if (result.success && result.data.length > 0) {
            displayModels(result.data);
        }
    } catch (error) {
        console.error('加载模型失败:', error);
        showNotification('加载模型失败', 'error');
    }
}

/**
 * 获取筛选选项
 * @param {Array} models - 模型列表
 * @returns {Object} - 筛选选项
 */
function getFilterOptions(models) {
    return {
        modelTypes: [...new Set(models.map(m => m.model_type || m.modelType).filter(Boolean))].sort(),
        styleTypes: [...new Set(models.map(m => m.style_type || m.styleType).filter(Boolean))].sort(),
        baseModels: [...new Set(models.map(m => m.base_model || m.baseModel).filter(Boolean))].sort(),
        modelTags: [...new Set(models.map(m => m.model_tags || m.modelTags).filter(Boolean).flatMap(t => t ? t.split(',').map(s => s.trim()) : []))].sort()
    };
}

/**
 * 显示模型列表
 * @param {Array} models - 模型数据
 * @param {string} filter - 筛选类型
 * @param {Object} filters - 筛选条件
 */
export function displayModels(models, filter = 'all', filters = activeFilters) {
    setAllModels(models);
    setCurrentFilter(filter);
    setActiveFilters(filters);

    // 筛选逻辑
    let filteredModels = models;
    if (filter === 'visible') {
        filteredModels = models.filter(m => !(m.is_hidden || m.isHidden));
    } else if (filter === 'hidden') {
        filteredModels = models.filter(m => m.is_hidden || m.isHidden);
    }

    // 应用筛选条件
    if (filters.modelType) {
        filteredModels = filteredModels.filter(m => (m.model_type || m.modelType) === filters.modelType);
    }
    if (filters.styleType) {
        filteredModels = filteredModels.filter(m => (m.style_type || m.styleType) === filters.styleType);
    }
    if (filters.baseModel) {
        filteredModels = filteredModels.filter(m => (m.base_model || m.baseModel) === filters.baseModel);
    }
    if (filters.modelTags) {
        filteredModels = filteredModels.filter(m => {
            const tags = (m.model_tags || m.modelTags || '');
            return tags.includes(filters.modelTags);
        });
    }
    if (filters.searchName) {
        const lowerSearch = filters.searchName.toLowerCase();
        filteredModels = filteredModels.filter(m => {
            const modelName = (m.model_name || m.modelName || '').toLowerCase();
            return modelName.includes(lowerSearch);
        });
    }
    if (filters.modelIds) {
        const idList = filters.modelIds.split(',').map(id => id.trim()).filter(id => id);
        if (idList.length > 0) {
            filteredModels = filteredModels.filter(m => {
                const modelId = String(m.model_id || m.modelId || m.id || '');
                return idList.some(id => modelId.includes(id));
            });
        }
    }

    // 排序：置顶优先
    filteredModels.sort((a, b) => {
        const aPinned = a.is_pinned || a.isPinned;
        const bPinned = b.is_pinned || b.isPinned;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
    });

    // 渲染模型列表
    const container = document.getElementById('modelListContainer');
    if (!container) return;

    if (filteredModels.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无模型数据</p>';
        return;
    }

    // 更新筛选下拉框
    updateFilterOptions(getFilterOptions(models));

    // 渲染表格
    container.innerHTML = `
        <table class="model-table">
            <thead>
                <tr>
                    <th style="width: 40px;"><input type="checkbox" id="selectAllModels" onchange="toggleSelectAllModels()"></th>
                    <th>模型名称</th>
                    <th>模型类型</th>
                    <th>风格类型</th>
                    <th>基础模型</th>
                    <th>标签</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${filteredModels.map((model, index) => {
                    const modelId = model.model_id || model.modelId || model.id;
                    const modelName = model.model_name || model.modelName;
                    const isHidden = model.is_hidden || model.isHidden;
                    const isPinned = model.is_pinned || model.isPinned;

                    return `
                        <tr class="model-row ${isHidden ? 'hidden' : ''} ${isPinned ? 'pinned' : ''}" data-model-id="${modelId}" data-index="${index}">
                            <td><input type="checkbox" class="model-checkbox" value="${modelId}" onchange="updateModelSelection()"></td>
                            <td onclick="toggleModelDetail('${modelId}', ${index})">
                                ${isPinned ? '<span class="pin-icon">📌</span>' : ''}
                                ${isHidden ? '<span class="hide-icon">👁️‍🗨️</span>' : ''}
                                ${escapeHtml(modelName)}
                            </td>
                            <td>${escapeHtml(model.model_type || model.modelType || '-')}</td>
                            <td>${escapeHtml(model.style_type || model.styleType || '-')}</td>
                            <td>${escapeHtml(model.base_model || model.baseModel || '-')}</td>
                            <td>${escapeHtml(model.model_tags || model.modelTags || '-')}</td>
                            <td>${isHidden ? '<span class="badge badge-warning">隐藏</span>' : '<span class="badge badge-success">显示</span>'}</td>
                            <td class="model-actions">
                                <button class="btn btn-primary" onclick="useModel('${modelId}')">使用</button>
                                <button class="btn btn-secondary" onclick="togglePin('${modelId}', ${!isPinned})">${isPinned ? '取消置顶' : '置顶'}</button>
                                <button class="btn ${isHidden ? 'btn-success' : 'btn-secondary'}" onclick="toggleHidden('${modelId}', ${!isHidden})">${isHidden ? '显示' : '隐藏'}</button>
                                <button class="btn btn-secondary" onclick="copyModelInfo('${modelId}')">复制信息</button>
                            </td>
                        </tr>
                        <tr class="model-detail-row" id="model-detail-${index}">
                            <td colspan="8">
                                <div class="model-detail-content" id="model-detail-content-${index}">
                                    <div class="loading"></div>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * 更新筛选选项
 * @param {Object} options - 筛选选项
 */
function updateFilterOptions(options) {
    // 更新模型类型筛选
    const modelTypeSelect = document.getElementById('filterModelType');
    if (modelTypeSelect) {
        const currentValue = modelTypeSelect.value;
        modelTypeSelect.innerHTML = '<option value="">全部类型</option>' +
            options.modelTypes.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
        modelTypeSelect.value = currentValue;
    }

    // 更新风格类型筛选
    const styleTypeSelect = document.getElementById('filterStyleType');
    if (styleTypeSelect) {
        const currentValue = styleTypeSelect.value;
        styleTypeSelect.innerHTML = '<option value="">全部风格</option>' +
            options.styleTypes.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
        styleTypeSelect.value = currentValue;
    }

    // 更新基础模型筛选
    const baseModelSelect = document.getElementById('filterBaseModel');
    if (baseModelSelect) {
        const currentValue = baseModelSelect.value;
        baseModelSelect.innerHTML = '<option value="">全部基础模型</option>' +
            options.baseModels.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
        baseModelSelect.value = currentValue;
    }

    // 更新标签筛选
    const modelTagsSelect = document.getElementById('filterModelTags');
    if (modelTagsSelect) {
        const currentValue = modelTagsSelect.value;
        modelTagsSelect.innerHTML = '<option value="">全部标签</option>' +
            options.modelTags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
        modelTagsSelect.value = currentValue;
    }
}

/**
 * 更新筛选
 * @param {string} filterType - 筛选类型
 * @param {string} value - 筛选值
 */
export function updateFilter(filterType, value) {
    const newFilters = { ...activeFilters, [filterType]: value };
    setActiveFilters(newFilters);
    displayModels(allModels, currentFilter, newFilters);
}

/**
 * 应用名称搜索
 */
export function applyNameSearch() {
    const searchValue = document.getElementById('searchModelName')?.value || '';
    updateFilter('searchName', searchValue);
}

/**
 * 应用模型ID筛选
 */
export function applyModelIdFilter() {
    const idValue = document.getElementById('filterModelIds')?.value || '';
    updateFilter('modelIds', idValue);
}

/**
 * 清除所有筛选
 */
export function clearAllFilters() {
    setActiveFilters({
        modelType: '',
        styleType: '',
        baseModel: '',
        modelTags: '',
        searchName: '',
        modelIds: ''
    });

    // 重置筛选控件
    const filterIds = ['filterModelType', 'filterStyleType', 'filterBaseModel', 'filterModelTags', 'searchModelName', 'filterModelIds'];
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    displayModels(allModels, 'all', activeFilters);
}

/**
 * 切换模型隐藏状态
 * @param {string} modelId - 模型ID
 * @param {boolean} isHidden - 是否隐藏
 */
export async function toggleHidden(modelId, isHidden) {
    try {
        const result = await API.toggleModelHidden(modelId, isHidden);
        if (result.success) {
            showNotification(isHidden ? '模型已隐藏' : '模型已显示', 'success');
            loadModels();
        } else {
            showNotification('操作失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('请求失败: ' + error.message, 'error');
    }
}

/**
 * 切换模型置顶状态
 * @param {string} modelId - 模型ID
 * @param {boolean} isPinned - 是否置顶
 */
export async function togglePin(modelId, isPinned) {
    try {
        const result = await API.toggleModelPin(modelId, isPinned);
        if (result.success) {
            showNotification(isPinned ? '模型已置顶' : '已取消置顶', 'success');
            loadModels();
        } else {
            showNotification('操作失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('请求失败: ' + error.message, 'error');
    }
}

/**
 * 复制模型信息
 * @param {string} modelId - 模型ID
 */
export async function copyModelInfo(modelId) {
    const model = allModels.find(m => (m.model_id || m.modelId || m.id) == modelId);
    if (!model) return;

    const info = `模型名称: ${model.model_name || model.modelName}
模型ID: ${modelId}
模型类型: ${model.model_type || model.modelType || '-'}
风格类型: ${model.style_type || model.styleType || '-'}
基础模型: ${model.base_model || model.baseModel || '-'}
标签: ${model.model_tags || model.modelTags || '-'}`;

    try {
        await navigator.clipboard.writeText(info);
        showNotification('模型信息已复制', 'success');
    } catch (err) {
        showNotification('复制失败', 'error');
    }
}

/**
 * 使用模型
 * @param {string} modelId - 模型ID
 */
export async function useModel(modelId) {
    try {
        const result = await API.useModel(modelId);
        if (result.success) {
            showNotification('模型已应用到生成表单', 'success');
            // 切换到生成标签页
            if (window.switchTab) {
                window.switchTab('generate');
            }
            // 更新生成表单
            updateGenerateForm(result.data, result.supportedParams);
        } else {
            showNotification('应用失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('请求失败: ' + error.message, 'error');
    }
}

/**
 * 更新生成表单
 * @param {Object} model - 模型数据
 * @param {Array} supportedParams - 支持的参数
 */
export function updateGenerateForm(model, supportedParams) {
    // 更新模型选择
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.value = model.model_id || model.modelId || model.id;
    }

    // 根据支持的参数启用/禁用表单字段
    const paramFields = {
        'prompt': 'prompt',
        'negative_prompt': 'negativePrompt',
        'width': 'width',
        'height': 'height',
        'steps': 'steps',
        'cfg_scale': 'cfgScale',
        'seed': 'seed',
        'sampler': 'sampler',
        'batch_size': 'batchSize'
    };

    Object.entries(paramFields).forEach(([param, fieldId]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            const isSupported = supportedParams?.includes(param);
            field.disabled = !isSupported;
            field.parentElement?.classList.toggle('param-disabled', !isSupported);
        }
    });
}

/**
 * 切换模型详情显示
 * @param {string} modelId - 模型ID
 * @param {number} index - 模型索引
 */
export async function toggleModelDetail(modelId, index) {
    const detailRow = document.getElementById(`model-detail-${index}`);
    if (!detailRow) return;

    const isActive = detailRow.classList.contains('active');

    // 关闭所有其他详情
    document.querySelectorAll('.model-detail-row').forEach(row => {
        row.classList.remove('active');
    });

    if (!isActive) {
        detailRow.classList.add('active');
        await displayModelDetail(modelId, index);
    }
}

/**
 * 显示模型详情
 * @param {string} modelId - 模型ID
 * @param {number} index - 模型索引
 */
async function displayModelDetail(modelId, index) {
    const container = document.getElementById(`model-detail-content-${index}`);
    if (!container) return;

    // 检查缓存
    if (modelDetailCache.has(modelId)) {
        renderModelDetail(container, modelDetailCache.get(modelId));
        return;
    }

    container.innerHTML = '<div class="loading"></div> 加载中...';

    try {
        const result = await API.getModelDetail(modelId);
        if (result.success) {
            modelDetailCache.set(modelId, result.data);
            renderModelDetail(container, result.data);
        } else {
            container.innerHTML = `<p style="color: #ea4335;">加载失败: ${result.error}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p style="color: #ea4335;">加载失败: ${error.message}</p>`;
    }
}

/**
 * 渲染模型详情
 * @param {HTMLElement} container - 容器元素
 * @param {Object} data - 模型详情数据
 */
function renderModelDetail(container, data) {
    container.innerHTML = `
        <div class="model-detail-grid">
            <div class="model-detail-info">
                <h4>模型信息</h4>
                <p><span class="label">模型ID:</span> ${escapeHtml(data.model_id || data.modelId || '-')}</p>
                <p><span class="label">模型名称:</span> ${escapeHtml(data.model_name || data.modelName || '-')}</p>
                <p><span class="label">模型类型:</span> ${escapeHtml(data.model_type || data.modelType || '-')}</p>
                <p><span class="label">风格类型:</span> ${escapeHtml(data.style_type || data.styleType || '-')}</p>
                <p><span class="label">基础模型:</span> ${escapeHtml(data.base_model || data.baseModel || '-')}</p>
                <p><span class="label">标签:</span> ${escapeHtml(data.model_tags || data.modelTags || '-')}</p>
                <p><span class="label">描述:</span> ${escapeHtml(data.description || '-')}</p>
            </div>
            <div class="model-detail-images">
                ${data.cover_image || data.coverImage ? `
                    <div>
                        <h4>封面图</h4>
                        <img src="${data.cover_image || data.coverImage}" alt="封面图" style="max-width: 100%; border-radius: 8px;">
                    </div>
                ` : ''}
                ${data.preview_images || data.previewImages ? `
                    <div>
                        <h4>预览图</h4>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${(data.preview_images || data.previewImages).map(img => `
                                <img src="${img}" alt="预览图" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * 展开所有详情
 */
export function expandAllDetails() {
    allModels.forEach((model, index) => {
        const detailRow = document.getElementById(`model-detail-${index}`);
        if (detailRow && !detailRow.classList.contains('active')) {
            toggleModelDetail(model.model_id || model.modelId || model.id, index);
        }
    });
}

/**
 * 收起所有详情
 */
export function collapseAllDetails() {
    document.querySelectorAll('.model-detail-row').forEach(row => {
        row.classList.remove('active');
    });
}

/**
 * 全选/取消全选模型
 */
export function toggleSelectAllModels() {
    const selectAllCheckbox = document.getElementById('selectAllModels');
    const checkboxes = document.querySelectorAll('.model-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateModelSelection();
}

/**
 * 更新模型选择
 */
export function updateModelSelection() {
    const checkboxes = document.querySelectorAll('.model-checkbox:checked');
    const selected = new Map();

    checkboxes.forEach(checkbox => {
        const modelId = checkbox.value;
        const row = checkbox.closest('.model-row');
        const modelName = row?.querySelector('td:nth-child(2)')?.textContent?.trim() || modelId;
        selected.set(modelId, modelName);
    });

    setModelListSelectedModels(selected);
    updateModelSelectionUI();
}

/**
 * 更新模型选择UI
 */
function updateModelSelectionUI() {
    const count = modelListSelectedModels.size;
    const indicator = document.getElementById('modelSelectionIndicator');

    if (indicator) {
        if (count > 0) {
            indicator.innerHTML = `已选择 ${count} 个模型 <button class="btn btn-primary" onclick="openMultiModelGenerateModal()">批量生成</button> <button class="btn" onclick="clearAllModelSelection()">清除</button>`;
        } else {
            indicator.innerHTML = '';
        }
    }
}

/**
 * 清除所有模型选择
 */
export function clearAllModelSelection() {
    setModelListSelectedModels(new Map());

    const selectAllCheckbox = document.getElementById('selectAllModels');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;

    document.querySelectorAll('.model-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    updateModelSelectionUI();
}

/**
 * 打开多模型生成弹框
 */
export function openMultiModelGenerateModal() {
    if (modelListSelectedModels.size === 0) {
        showNotification('请先选择模型', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'multiModelGenerateModal';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>批量生成 - 已选择 ${modelListSelectedModels.size} 个模型</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>提示词</label>
                    <textarea id="multiPrompt" rows="3" placeholder="输入提示词..."></textarea>
                </div>
                <div class="form-group">
                    <label>负面提示词</label>
                    <textarea id="multiNegativePrompt" rows="2" placeholder="输入负面提示词..."></textarea>
                </div>
                <div class="params-grid">
                    <div class="form-group">
                        <label>宽度</label>
                        <input type="number" id="multiWidth" value="512">
                    </div>
                    <div class="form-group">
                        <label>高度</label>
                        <input type="number" id="multiHeight" value="512">
                    </div>
                    <div class="form-group">
                        <label>步数</label>
                        <input type="number" id="multiSteps" value="20">
                    </div>
                    <div class="form-group">
                        <label>CFG Scale</label>
                        <input type="number" id="multiCfgScale" value="7" step="0.5">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal-overlay').remove()">取消</button>
                <button class="btn btn-primary" onclick="submitMultiModelGenerate()">开始生成</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * 提交多模型生成
 */
export async function submitMultiModelGenerate() {
    const prompt = document.getElementById('multiPrompt')?.value;
    if (!prompt) {
        showNotification('请输入提示词', 'error');
        return;
    }

    const params = {
        prompt,
        negative_prompt: document.getElementById('multiNegativePrompt')?.value || '',
        width: parseInt(document.getElementById('multiWidth')?.value) || 512,
        height: parseInt(document.getElementById('multiHeight')?.value) || 512,
        steps: parseInt(document.getElementById('multiSteps')?.value) || 20,
        cfg_scale: parseFloat(document.getElementById('multiCfgScale')?.value) || 7
    };

    const modelIds = Array.from(modelListSelectedModels.keys());

    // 关闭弹框
    const modal = document.getElementById('multiModelGenerateModal');
    if (modal) modal.remove();

    showNotification(`开始为 ${modelIds.length} 个模型生成图片...`, 'info');

    // 依次生成
    for (const modelId of modelIds) {
        try {
            const result = await API.generate({
                ...params,
                model_id: modelId
            });

            if (result.success) {
                showNotification(`模型 ${modelId} 生成任务已提交`, 'success');
            } else {
                showNotification(`模型 ${modelId} 生成失败: ${result.error}`, 'error');
            }
        } catch (error) {
            showNotification(`模型 ${modelId} 请求失败: ${error.message}`, 'error');
        }

        // 延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    showNotification('批量生成任务已全部提交', 'success');
}
