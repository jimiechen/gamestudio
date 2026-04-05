// 快捷应用模块

import { API } from './api.js';
import { showNotification, escapeHtml } from './utils.js';
import { setSelectedModels } from './state.js';
import { renderSelectedModels } from './generate.js';

/**
 * 加载快捷应用列表
 */
export async function loadQuickPresets() {
    try {
        const result = await API.getQuickPresets();
        if (result.success) {
            renderQuickPresets(result.data);
        }
    } catch (error) {
        console.error('加载快捷应用失败:', error);
    }
}

/**
 * 渲染快捷应用列表
 * @param {Array} presets - 快捷应用数据
 */
function renderQuickPresets(presets) {
    const container = document.getElementById('quickPresetList');
    if (!container) return;

    if (presets.length === 0) {
        container.innerHTML = '<span style="color: #999; font-size: 14px;">暂无快捷应用，请保存当前配置</span>';
        return;
    }

    container.innerHTML = presets.map(preset => `
        <div class="quick-preset-item" 
             style="padding: 8px 12px; background: #e8f0fe; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px;"
             onclick="applyQuickPreset('${preset.id}')">
            <span>${preset.is_favorite || preset.isFavorite ? '⭐' : '📌'}</span>
            <span style="font-weight: 500;">${escapeHtml(preset.name)}</span>
            <span style="font-size: 12px; color: #666;">${escapeHtml(preset.description || '')}</span>
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteQuickPreset('${preset.id}')" style="padding: 2px 6px; font-size: 12px;">删除</button>
        </div>
    `).join('');
}

/**
 * 保存快捷应用
 */
export async function saveQuickPreset() {
    const name = prompt('请输入配置名称:');
    if (!name) return;

    const description = prompt('请输入配置描述 (可选):') || '';

    // 收集当前表单参数
    const params = {
        prompt: document.getElementById('prompt')?.value || '',
        negative_prompt: document.getElementById('negativePrompt')?.value || '',
        width: parseInt(document.getElementById('width')?.value) || 512,
        height: parseInt(document.getElementById('height')?.value) || 512,
        steps: parseInt(document.getElementById('steps')?.value) || 20,
        cfg_scale: parseFloat(document.getElementById('cfgScale')?.value) || 7,
        seed: parseInt(document.getElementById('seed')?.value) || -1,
        sampler: document.getElementById('sampler')?.value || 'Euler a',
        batch_size: parseInt(document.getElementById('batchSize')?.value) || 1,
        models: window.selectedModels || []
    };

    try {
        const result = await API.saveQuickPreset({
            name,
            description,
            params
        });

        if (result.success) {
            showNotification('配置已保存', 'success');
            loadQuickPresets();
        } else {
            showNotification('保存失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('保存失败: ' + error.message, 'error');
    }
}

/**
 * 打开快捷应用弹框
 */
export function openQuickPresetModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'quickPresetModal';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 600px;">
            <div class="modal-header">
                <h3>加载配置</h3>
                <button class="modal-close" onclick="closeQuickPresetModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="quickPresetModalList" style="max-height: 400px; overflow-y: auto;">
                    <div class="loading"></div> 加载中...
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    loadQuickPresetModalList();
}

/**
 * 关闭快捷应用弹框
 */
export function closeQuickPresetModal() {
    const modal = document.getElementById('quickPresetModal');
    if (modal) modal.remove();
}

/**
 * 加载快捷应用弹框列表
 */
async function loadQuickPresetModalList() {
    try {
        const result = await API.getQuickPresets();
        const container = document.getElementById('quickPresetModalList');

        if (!container) return;

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(preset => `
                <div class="quick-preset-modal-item" 
                     style="padding: 15px; border-bottom: 1px solid #eee; cursor: pointer;"
                     onclick="applyQuickPreset('${preset.id}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">${escapeHtml(preset.name)} ${preset.is_favorite || preset.isFavorite ? '⭐' : ''}</div>
                            <div style="font-size: 12px; color: #666;">${escapeHtml(preset.description || '')}</div>
                        </div>
                        <div>
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); togglePresetFavorite('${preset.id}', ${!(preset.is_favorite || preset.isFavorite)})" style="margin-right: 8px;">
                                ${preset.is_favorite || preset.isFavorite ? '取消收藏' : '收藏'}
                            </button>
                            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteQuickPreset('${preset.id}')">删除</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无快捷应用</p>';
        }
    } catch (error) {
        showNotification('加载快捷应用失败', 'error');
    }
}

/**
 * 应用快捷应用
 * @param {string} presetId - 配置ID
 */
export async function applyQuickPreset(presetId) {
    try {
        const result = await API.applyQuickPreset(presetId);
        if (result.success && result.data) {
            const params = result.data.params;

            // 填充表单
            if (params.prompt) document.getElementById('prompt').value = params.prompt;
            if (params.negative_prompt) document.getElementById('negativePrompt').value = params.negative_prompt;
            if (params.width) document.getElementById('width').value = params.width;
            if (params.height) document.getElementById('height').value = params.height;
            if (params.steps) document.getElementById('steps').value = params.steps;
            if (params.cfg_scale) document.getElementById('cfgScale').value = params.cfg_scale;
            if (params.seed !== undefined) document.getElementById('seed').value = params.seed;
            if (params.sampler) document.getElementById('sampler').value = params.sampler;
            if (params.batch_size) document.getElementById('batchSize').value = params.batch_size;

            // 更新模型
            if (params.models) {
                setSelectedModels(params.models);
                renderSelectedModels();
            }

            showNotification('配置已应用', 'success');
            closeQuickPresetModal();
        } else {
            showNotification('应用失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('应用失败: ' + error.message, 'error');
    }
}

/**
 * 切换快捷应用收藏状态
 * @param {string} presetId - 配置ID
 * @param {boolean} isFavorite - 是否收藏
 */
export async function togglePresetFavorite(presetId, isFavorite) {
    try {
        const result = await API.toggleQuickPresetFavorite(presetId, isFavorite);
        if (result.success) {
            showNotification(isFavorite ? '已收藏' : '已取消收藏', 'success');
            loadQuickPresets();
            loadQuickPresetModalList(); // 刷新弹框列表
        } else {
            showNotification('操作失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('操作失败: ' + error.message, 'error');
    }
}

/**
 * 删除快捷应用
 * @param {string} presetId - 配置ID
 */
export async function deleteQuickPreset(presetId) {
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
        const result = await API.deleteQuickPreset(presetId);
        if (result.success) {
            showNotification('配置已删除', 'success');
            loadQuickPresets();
            const modalList = document.getElementById('quickPresetModalList');
            if (modalList) loadQuickPresetModalList();
        } else {
            showNotification('删除失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('删除失败: ' + error.message, 'error');
    }
}
