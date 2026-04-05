// 任务管理模块

import { API } from './api.js';
import { showNotification, escapeHtml, formatDate, copyToClipboard } from './utils.js';

/**
 * 加载任务列表
 */
export async function loadTasks() {
    try {
        const result = await API.getTasks();
        if (result.success) {
            displayTasks(result.data);
        } else {
            showNotification('加载任务列表失败: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('加载任务列表失败:', error);
        showNotification('加载任务列表失败', 'error');
    }
}

/**
 * 显示任务列表
 * @param {Array} tasks - 任务数据
 */
export function displayTasks(tasks) {
    const container = document.getElementById('taskListContainer');
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无任务</p>';
        return;
    }

    container.innerHTML = `
        <div class="task-list">
            ${tasks.map(task => {
                const statusClass = task.status === 'succeed' ? 'status-succeed' :
                                   task.status === 'failed' ? 'status-failed' :
                                   task.status === 'processing' ? 'status-processing' : 'status-submitted';
                const statusText = task.status === 'succeed' ? '成功' :
                                  task.status === 'failed' ? '失败' :
                                  task.status === 'processing' ? '处理中' : '已提交';

                return `
                    <div class="task-item">
                        <div>
                            <div style="font-weight: 500;">任务 ${escapeHtml(task.client_id || task.clientId || '-')}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                ${formatDate(task.created_at || task.createdAt)}
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            <button class="btn btn-primary" onclick="viewTaskDetail('${task.record_id || task.recordId || task.client_id || task.clientId}')">查看</button>
                            ${task.status === 'succeed' ? `
                                <button class="btn btn-success" onclick="downloadTask('${task.client_id || task.clientId}')">下载</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * 查看任务详情
 * @param {string} recordId - 记录ID
 */
export async function viewTaskDetail(recordId) {
    try {
        const result = await API.getTaskDetail(recordId);
        if (result.success) {
            showTaskDetailModal(result.data);
        } else {
            showNotification('获取任务详情失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('获取任务详情失败: ' + error.message, 'error');
    }
}

/**
 * 显示任务详情弹框
 * @param {Object} task - 任务数据
 */
function showTaskDetailModal(task) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'taskDetailModal';

    const statusClass = task.status === 'succeed' ? 'status-succeed' :
                       task.status === 'failed' ? 'status-failed' :
                       task.status === 'processing' ? 'status-processing' : 'status-submitted';
    const statusText = task.status === 'succeed' ? '成功' :
                      task.status === 'failed' ? '失败' :
                      task.status === 'processing' ? '处理中' : '已提交';

    // 构建参数对比表格
    let paramTableHtml = '';
    if (task.original_params && task.actual_params) {
        const allKeys = new Set([
            ...Object.keys(task.original_params),
            ...Object.keys(task.actual_params)
        ]);

        paramTableHtml = `
            <h4 style="margin-top: 20px;">参数对比</h4>
            <table class="param-table">
                <thead>
                    <tr>
                        <th>参数名</th>
                        <th>提交值</th>
                        <th>实际值</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from(allKeys).map(key => {
                        const original = task.original_params[key];
                        const actual = task.actual_params[key];
                        const isDiff = JSON.stringify(original) !== JSON.stringify(actual);

                        return `
                            <tr class="${isDiff ? 'param-diff-row' : ''}">
                                <td class="param-name">${escapeHtml(key)}</td>
                                <td class="param-value ${isDiff ? 'original' : ''}">${escapeHtml(String(original ?? '-'))}</td>
                                <td class="param-value ${isDiff ? 'actual' : ''}">${escapeHtml(String(actual ?? '-'))}</td>
                                <td class="param-status">
                                    ${isDiff ?
                                        '<span class="status-diff">不同</span>' :
                                        '<span class="status-same">相同</span>'}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>任务详情 - ${escapeHtml(task.client_id || task.clientId || '-')}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div style="flex: 1;">
                        <p><strong>创建时间:</strong> ${formatDate(task.created_at || task.createdAt)}</p>
                        <p><strong>完成时间:</strong> ${formatDate(task.completed_at || task.completedAt)}</p>
                        ${task.error_message || task.errorMessage ? `
                            <p style="color: #ea4335;"><strong>错误信息:</strong> ${escapeHtml(task.error_message || task.errorMessage)}</p>
                        ` : ''}
                    </div>
                </div>

                ${task.result_images || task.resultImages ? `
                    <h4>生成结果</h4>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0;">
                        ${(task.result_images || task.resultImages).map(img => `
                            <img src="${img}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px; cursor: pointer;"
                                 onclick="showImagePreview('${img}', '生成结果')">
                        `).join('')}
                    </div>
                ` : ''}

                ${paramTableHtml}
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal-overlay').remove()">关闭</button>
                <button class="btn btn-secondary" onclick="copyTaskParams('${task.record_id || task.recordId || task.client_id || task.clientId}')">复制参数</button>
                ${task.status === 'succeed' ? `
                    <button class="btn btn-success" onclick="downloadTask('${task.client_id || task.clientId}')">下载图片</button>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * 复制任务参数
 * @param {string} recordId - 记录ID
 */
export async function copyTaskParams(recordId) {
    try {
        const result = await API.getTaskDetail(recordId);
        if (result.success && result.data.original_params) {
            const paramsText = JSON.stringify(result.data.original_params, null, 2);
            const success = await copyToClipboard(paramsText);
            if (success) {
                showNotification('参数已复制到剪贴板', 'success');
            } else {
                showNotification('复制失败', 'error');
            }
        } else {
            showNotification('获取参数失败', 'error');
        }
    } catch (error) {
        showNotification('复制失败: ' + error.message, 'error');
    }
}

/**
 * 查询任务状态
 * @param {string} clientId - 客户端ID
 */
export async function queryTask(clientId) {
    try {
        const result = await API.getTaskDetail(clientId);
        if (result.success) {
            showNotification(`任务状态: ${result.data.status}`, 'info');
            return result.data;
        } else {
            showNotification('查询失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('查询失败: ' + error.message, 'error');
    }
}

/**
 * 下载任务图片
 * @param {string} clientId - 客户端ID
 */
export async function downloadTask(clientId) {
    try {
        const result = await API.downloadTask(clientId);
        if (result.success) {
            showNotification('下载链接已获取', 'success');
            // 触发下载
            if (result.download_url) {
                const link = document.createElement('a');
                link.href = result.download_url;
                link.download = result.filename || `task_${clientId}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } else {
            showNotification('下载失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('下载失败: ' + error.message, 'error');
    }
}
