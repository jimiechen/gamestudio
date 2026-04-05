// 素材库模块

import { API } from './api.js';
import { showNotification, escapeHtml, formatDate, showImagePreview } from './utils.js';
import { viewTaskDetail } from './tasks.js';

/**
 * 加载素材列表
 */
export async function loadAssets() {
    try {
        const result = await API.getAssets();
        if (result.success) {
            displayAssets(result.data);
        } else {
            showNotification('加载素材列表失败: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('加载素材列表失败:', error);
        showNotification('加载素材列表失败', 'error');
    }
}

/**
 * 显示素材列表
 * @param {Array} assets - 素材数据
 */
export function displayAssets(assets) {
    const container = document.getElementById('assetListContainer');
    if (!container) return;

    if (assets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无素材</p>';
        return;
    }

    container.innerHTML = `
        <div class="asset-grid">
            ${assets.map(asset => `
                <div class="asset-card">
                    <img src="${asset.thumbnail_url || asset.thumbnailUrl || asset.url}" 
                         alt="${escapeHtml(asset.name || '素材')}"
                         onclick="showImagePreview('${asset.url}', '${escapeHtml(asset.name || '素材')}')">
                    <div class="info">
                        <p style="font-weight: 500; margin-bottom: 4px;">${escapeHtml(asset.name || '未命名')}</p>
                        <p>创建: ${formatDate(asset.created_at || asset.createdAt)}</p>
                        ${asset.task_id || asset.taskId ? `<p>任务: ${escapeHtml(asset.task_id || asset.taskId)}</p>` : ''}
                    </div>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="showImagePreview('${asset.url}', '${escapeHtml(asset.name || '素材')}')">查看</button>
                        ${asset.task_id || asset.taskId ? `
                            <button class="btn btn-secondary" onclick="viewTaskDetail('${asset.task_id || asset.taskId}')">任务</button>
                        ` : ''}
                        <button class="btn btn-danger" onclick="deleteAsset('${asset.id}')">删除</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 删除素材
 * @param {string} assetId - 素材ID
 */
export async function deleteAsset(assetId) {
    if (!confirm('确定要删除这个素材吗？')) return;

    try {
        const result = await API.deleteAsset(assetId);
        if (result.success) {
            showNotification('素材已删除', 'success');
            loadAssets();
        } else {
            showNotification('删除失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('删除失败: ' + error.message, 'error');
    }
}
