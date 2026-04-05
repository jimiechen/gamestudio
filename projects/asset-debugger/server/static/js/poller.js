// 任务轮询器模块

import { API } from './api.js';
import { showNotification, formatDate } from './utils.js';

/**
 * 生成任务轮询器类
 */
export class GenerationPoller {
    constructor() {
        this.pollingIntervals = new Map();
        this.maxAttempts = 120;
        this.interval = 5000;
        this.taskHistory = [];
    }

    /**
     * 从数据库加载历史任务
     */
    async loadHistoryFromDB() {
        try {
            const result = await API.getTasks();
            if (result.success && result.data) {
                this.taskHistory = result.data.map(task => ({
                    clientId: task.client_id || task.clientId,
                    status: task.status,
                    params: task.original_params || task.originalParams,
                    result: task.result_images || task.resultImages,
                    timestamp: task.created_at || task.createdAt
                }));
                this.renderHistoryList();
            }
        } catch (error) {
            console.error('加载历史任务失败:', error);
        }
    }

    /**
     * 开始轮询
     * @param {string} clientId - 客户端ID
     * @param {Object} taskParams - 任务参数
     */
    startPolling(clientId, taskParams) {
        if (this.pollingIntervals.has(clientId)) {
            console.warn(`任务 ${clientId} 已经在轮询中`);
            return;
        }

        let attempts = 0;

        this.showProgress(clientId);

        const intervalId = setInterval(async () => {
            attempts++;

            if (attempts > this.maxAttempts) {
                this.handleTimeout(clientId);
                return;
            }

            try {
                const result = await API.getTaskDetail(clientId);

                if (result.success) {
                    const task = result.data;
                    this.updateProgress(clientId, task, attempts);

                    if (task.status === 'succeed') {
                        this.handleSuccess(clientId, task);
                    } else if (task.status === 'failed') {
                        this.handleFailure(clientId, task);
                    }
                }
            } catch (error) {
                console.error(`轮询任务 ${clientId} 失败:`, error);
            }
        }, this.interval);

        this.pollingIntervals.set(clientId, intervalId);
    }

    /**
     * 停止轮询
     * @param {string} clientId - 客户端ID
     */
    stopPolling(clientId) {
        const intervalId = this.pollingIntervals.get(clientId);
        if (intervalId) {
            clearInterval(intervalId);
            this.pollingIntervals.delete(clientId);
        }
    }

    /**
     * 显示进度
     * @param {string} clientId - 客户端ID
     */
    showProgress(clientId) {
        const container = document.getElementById('generationProgress');
        if (!container) return;

        const progressItem = document.createElement('div');
        progressItem.id = `progress-${clientId}`;
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f0f7ff; border-radius: 6px; margin-bottom: 8px;">
                <span>任务 ${clientId}</span>
                <span class="status">处理中...</span>
            </div>
        `;

        container.appendChild(progressItem);
    }

    /**
     * 更新进度
     * @param {string} clientId - 客户端ID
     * @param {Object} task - 任务数据
     * @param {number} attempts - 尝试次数
     */
    updateProgress(clientId, task, attempts) {
        const progressItem = document.getElementById(`progress-${clientId}`);
        if (!progressItem) return;

        const statusText = task.status === 'processing' ? `处理中 (${attempts})` :
                          task.status === 'succeed' ? '完成' :
                          task.status === 'failed' ? '失败' : '等待中';

        progressItem.querySelector('.status').textContent = statusText;
    }

    /**
     * 处理成功
     * @param {string} clientId - 客户端ID
     * @param {Object} task - 任务数据
     */
    handleSuccess(clientId, task) {
        this.stopPolling(clientId);

        // 添加到历史记录
        this.taskHistory.unshift({
            clientId,
            status: 'succeed',
            params: task.original_params || task.originalParams,
            result: task.result_images || task.resultImages,
            timestamp: new Date().toISOString()
        });

        // 移除进度显示
        const progressItem = document.getElementById(`progress-${clientId}`);
        if (progressItem) progressItem.remove();

        // 显示结果
        this.displayResults(task);
        this.renderHistoryList();

        showNotification('图片生成成功！', 'success');
    }

    /**
     * 处理失败
     * @param {string} clientId - 客户端ID
     * @param {Object} task - 任务数据
     */
    handleFailure(clientId, task) {
        this.stopPolling(clientId);

        // 添加到历史记录
        this.taskHistory.unshift({
            clientId,
            status: 'failed',
            params: task.original_params || task.originalParams,
            error: task.error_message || task.errorMessage,
            timestamp: new Date().toISOString()
        });

        // 移除进度显示
        const progressItem = document.getElementById(`progress-${clientId}`);
        if (progressItem) progressItem.remove();

        this.renderHistoryList();

        showNotification('图片生成失败: ' + (task.error_message || task.errorMessage), 'error');
    }

    /**
     * 处理超时
     * @param {string} clientId - 客户端ID
     */
    handleTimeout(clientId) {
        this.stopPolling(clientId);

        const progressItem = document.getElementById(`progress-${clientId}`);
        if (progressItem) {
            progressItem.querySelector('.status').textContent = '超时';
            progressItem.style.background = '#ffebee';
        }

        showNotification('任务处理超时，请稍后查看任务列表', 'warning');
    }

    /**
     * 显示结果
     * @param {Object} task - 任务数据
     * @param {boolean} append - 是否追加到现有结果
     */
    displayResults(task, append = true) {
        const container = document.getElementById('generationResults');
        if (!container) return;

        const images = task.result_images || task.resultImages || [];

        const resultHtml = `
            <div class="result-item" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-weight: 500;">任务 ${task.client_id || task.clientId}</span>
                    <span style="font-size: 12px; color: #666;">${formatDate(task.completed_at || task.completedAt)}</span>
                </div>
                <div class="results-grid">
                    ${images.map(img => `
                        <div class="result-card">
                            <img src="${img}" alt="生成结果" onclick="showImagePreview('${img}', '生成结果')">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        if (append) {
            container.insertAdjacentHTML('afterbegin', resultHtml);
        } else {
            container.innerHTML = resultHtml;
        }
    }

    /**
     * 渲染历史列表
     */
    renderHistoryList() {
        const container = document.getElementById('generationHistory');
        if (!container) return;

        if (this.taskHistory.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center;">暂无生成记录</p>';
            return;
        }

        container.innerHTML = this.taskHistory.map(item => `
            <div class="history-item" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;"
                 onclick="showTaskDetail('${item.clientId}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${item.clientId}</span>
                    <span class="status-badge ${item.status === 'succeed' ? 'status-succeed' : 'status-failed'}">
                        ${item.status === 'succeed' ? '成功' : '失败'}
                    </span>
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    ${formatDate(item.timestamp)}
                </div>
            </div>
        `).join('');
    }

    /**
     * 显示任务详情
     * @param {string} clientId - 客户端ID
     */
    async showTaskDetail(clientId) {
        try {
            const result = await API.getTaskDetail(clientId);
            if (result.success) {
                // 触发任务模块的详情显示
                if (window.viewTaskDetail) {
                    window.viewTaskDetail(clientId);
                }
            }
        } catch (error) {
            showNotification('获取任务详情失败', 'error');
        }
    }

    /**
     * 下载到素材库
     * @param {string} clientId - 客户端ID
     */
    async downloadToAssets(clientId) {
        try {
            const result = await API.downloadTask(clientId);
            if (result.success) {
                showNotification('已下载到素材库', 'success');
            } else {
                showNotification('下载失败: ' + result.error, 'error');
            }
        } catch (error) {
            showNotification('下载失败: ' + error.message, 'error');
        }
    }
}
