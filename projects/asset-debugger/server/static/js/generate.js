// 生成素材模块

import {
    selectedModels, presetModelCombos, setSelectedModels,
    updateSelectedModelStrength, addSelectedModel, removeSelectedModel
} from './state.js';
import { API } from './api.js';
import { showNotification, escapeHtml } from './utils.js';

/**
 * 筛选模型列表
 */
export function filterModelList() {
    const searchValue = document.getElementById('modelSearchInput')?.value?.toLowerCase() || '';
    const items = document.querySelectorAll('.model-selector-item');

    items.forEach(item => {
        const modelId = item.dataset.modelId?.toLowerCase() || '';
        const modelName = item.dataset.modelName?.toLowerCase() || '';
        const match = modelId.includes(searchValue) || modelName.includes(searchValue);
        item.style.display = match ? 'block' : 'none';
    });
}

/**
 * 切换高清修复
 */
export function toggleHdScale() {
    const hdScale = document.getElementById('hdScale')?.checked;
    const hrOptions = document.getElementById('hrOptions');
    if (hrOptions) {
        hrOptions.style.display = hdScale ? 'block' : 'none';
    }
}

/**
 * 切换画面增强
 */
export function togglePerturb() {
    // 画面增强开关状态在生成时会自动读取
}

/**
 * 渲染预设模型组合按钮
 */
export function renderPresetModelComboButtons() {
    const container = document.getElementById('presetModelCombos');
    if (!container) return;

    container.innerHTML = Object.entries(presetModelCombos).map(([name, combo]) => `
        <button class="btn btn-secondary" onclick="applyPresetModelCombo('${name}')" style="margin: 4px;">
            ${combo.icon} ${name}
        </button>
    `).join('');
}

/**
 * 应用预设模型组合
 * @param {string} comboName - 组合名称
 */
export function applyPresetModelCombo(comboName) {
    const combo = presetModelCombos[comboName];
    if (!combo) return;

    // 清空当前选择
    setSelectedModels([...combo.models]);
    renderSelectedModels();

    showNotification(`已应用预设组合: ${comboName}`, 'success');
}
 * 生成图片
 */
export async function generateImage() {
    const prompt = document.getElementById('prompt')?.value?.trim();
    if (!prompt) {
        showNotification('请输入提示词', 'error');
        return;
    }

    // 收集参数
    const params = {
        prompt,
        negative_prompt: document.getElementById('negativePrompt')?.value?.trim() || '',
        width: parseInt(document.getElementById('width')?.value) || 512,
        height: parseInt(document.getElementById('height')?.value) || 512,
        steps: parseInt(document.getElementById('steps')?.value) || 20,
        cfg_scale: parseFloat(document.getElementById('cfgScale')?.value) || 7,
        seed: parseInt(document.getElementById('seed')?.value) || -1,
        sampler: document.getElementById('sampler')?.value || 'Euler a',
        batch_size: parseInt(document.getElementById('batchSize')?.value) || 1,
        models: selectedModels
    };

    // 高清修复参数
    const hdScale = document.getElementById('hdScale')?.checked;
    if (hdScale) {
        params.enable_hr = true;
        params.hr_scale = parseFloat(document.getElementById('hrScale')?.value) || 2;
        params.hr_steps = parseInt(document.getElementById('hrSteps')?.value) || 20;
        params.hr_sampler = document.getElementById('hrSampler')?.value || 'Euler a';
    }

    // 画面增强
    const perturb = document.getElementById('perturb')?.checked;
    if (perturb) {
        params.perturb = true;
    }

    try {
        showNotification('正在提交生成任务...', 'info');
        const result = await API.generate(params);

        if (result.success) {
            showNotification('生成任务已提交', 'success');
            // 开始轮询任务状态
            if (window.generationPoller) {
                window.generationPoller.startPolling(result.client_id, params);
            }
        } else {
            showNotification('提交失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('请求失败: ' + error.message, 'error');
    }
}

/**
 * 渲染已选模型
 */
export function renderSelectedModels() {
    const container = document.getElementById('selectedModels');
    if (!container) return;

    if (selectedModels.length === 0) {
        container.innerHTML = '<p style="color: #999;">未选择模型</p>';
        return;
    }

    container.innerHTML = selectedModels.map((model, index) => `
        <div class="selected-model-item" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f0f7ff; border-radius: 6px; margin-bottom: 8px;">
            <span style="flex: 1;">${escapeHtml(model.name || `模型 ${model.modelId}`)}</span>
            <input type="range" min="0" max="1" step="0.1" value="${model.strength}" 
                   onchange="updateModelStrength(${index}, this.value)" style="width: 100px;">
            <span style="min-width: 40px; text-align: center;">${model.strength}</span>
            <button class="btn btn-danger" onclick="removeModel(${index})" style="padding: 4px 8px; font-size: 12px;">删除</button>
        </div>
    `).join('');
}

/**
 * 更新模型强度
 * @param {number} index - 模型索引
 * @param {string} value - 强度值
 */
export function updateModelStrength(index, value) {
    updateSelectedModelStrength(index, value);
    renderSelectedModels();
}

/**
 * 移除模型
 * @param {number} index - 模型索引
 */
export function removeModel(index) {
    removeSelectedModel(index);
    renderSelectedModels();
}

/**
 * 打开模型选择器
 */
export function openModelSelector() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modelSelectorModal';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 600px;">
            <div class="modal-header">
                <h3>选择模型</h3>
                <button class="modal-close" onclick="closeModelSelector()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>搜索模型</label>
                    <input type="text" id="modelSearchInput" placeholder="输入模型名称或ID..." onkeyup="filterModelList()">
                </div>
                <div id="modelSelectorList" style="max-height: 400px; overflow-y: auto;">
                    <div class="loading"></div> 加载中...
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    loadModelSelectorList();
}

/**
 * 关闭模型选择器
 */
export function closeModelSelector() {
    const modal = document.getElementById('modelSelectorModal');
    if (modal) modal.remove();
}

/**
 * 加载模型选择器列表
 */
async function loadModelSelectorList() {
    try {
        const result = await API.getModels();
        const container = document.getElementById('modelSelectorList');

        if (!container) return;

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(model => {
                const modelId = model.model_id || model.modelId || model.id;
                const modelName = model.model_name || model.modelName;
                const isSelected = selectedModels.some(m => m.modelId == modelId);

                return `
                    <div class="model-selector-item" data-model-id="${modelId}" data-model-name="${escapeHtml(modelName)}" 
                         style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; ${isSelected ? 'background: #e8f0fe;' : ''}"
                         onclick="addModel('${modelId}')">
                        <div style="font-weight: 500;">${escapeHtml(modelName)}</div>
                        <div style="font-size: 12px; color: #666;">ID: ${modelId}</div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p style="text-align: center; color: #999;">暂无模型</p>';
        }
    } catch (error) {
        showNotification('加载模型列表失败', 'error');
    }
}

/**
 * 添加模型
 * @param {string} modelId - 模型ID
 */
export function addModel(modelId) {
    // 检查是否已存在
    if (selectedModels.some(m => m.modelId == modelId)) {
        showNotification('该模型已添加', 'error');
        return;
    }

    // 获取模型名称
    const modelItem = document.querySelector(`[data-model-id="${modelId}"]`);
    const modelName = modelItem?.dataset.modelName || `模型 ${modelId}`;

    addSelectedModel({
        modelId,
        name: modelName,
        strength: 0.9
    });

    renderSelectedModels();
    showNotification('模型已添加', 'success');

    // 更新选中状态
    if (modelItem) {
        modelItem.style.background = '#e8f0fe';
    }
}

/**
