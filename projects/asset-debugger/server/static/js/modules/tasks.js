/**
 * 任务列表模块
 * 处理任务列表的展示和管理
 */
const Tasks = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // 刷新任务按钮
        const refreshBtn = document.querySelector('[data-action="refreshTasks"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTasks());
        }
    },

    // 加载任务列表
    async loadTasks() {
        try {
            const button = document.querySelector('[data-action="refreshTasks"]');
            if (button) {
                button.disabled = true;
                button.textContent = '🔄 刷新中...';
            }

            const result = await API.getTasks();
            
            if (result.success && result.data) {
                State.set('tasks', result.data);
                this.renderTasks();
            } else {
                console.warn('获取任务列表失败:', result.msg);
            }
        } catch (error) {
            console.error('加载任务列表出错:', error);
        } finally {
            const button = document.querySelector('[data-action="refreshTasks"]');
            if (button) {
                button.disabled = false;
                button.textContent = '🔄 刷新';
            }
        }
    },

    // 渲染任务列表
    renderTasks() {
        const container = document.getElementById('tasksListContainer');
        if (!container) return;

        const tasks = State.get('tasks') || [];
        
        if (tasks.length === 0) {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">暂无任务数据</div>';
            return;
        }

        container.innerHTML = `
            <table class="tasks-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Client ID</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">状态</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">提示词</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">创建时间</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${tasks.map(task => this.renderTaskRow(task)).join('')}
                </tbody>
            </table>
        `;
    },

    // 渲染任务行
    renderTaskRow(task) {
        const statusClass = this.getStatusClass(task.status);
        const statusText = this.getStatusText(task.status);
        
        return `
            <tr style="border-bottom: 1px solid #eee;" data-task-id="${task.clientId}">
                <td style="padding: 12px; font-family: monospace; font-size: 12px;">${task.clientId}</td>
                <td style="padding: 12px;">
                    <span class="status-badge ${statusClass}" style="
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 500;
                        ${statusClass === 'status-succeed' ? 'background: #d4edda; color: #155724;' : ''}
                        ${statusClass === 'status-failed' ? 'background: #f8d7da; color: #721c24;' : ''}
                        ${statusClass === 'status-processing' ? 'background: #fff3cd; color: #856404;' : ''}
                        ${statusClass === 'status-submitted' ? 'background: #d1ecf1; color: #0c5460;' : ''}
                    ">${statusText}</span>
                </td>
                <td style="padding: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${task.prompt || '-'}
                </td>
                <td style="padding: 12px; font-size: 12px; color: #666;">
                    ${task.createdAt ? new Date(task.createdAt).toLocaleString('zh-CN') : '-'}
                </td>
                <td style="padding: 12px;">
                    <button class="btn" style="padding: 4px 12px; font-size: 12px; background: #e8f0fe; color: #1a73e8;"
                        onclick="Tasks.viewTaskDetail('${task.clientId}')">查看</button>
                </td>
            </tr>
        `;
    },

    // 获取状态样式类
    getStatusClass(status) {
        const statusMap = {
            'succeed': 'status-succeed',
            'failed': 'status-failed',
            'processing': 'status-processing',
            'submitted': 'status-submitted'
        };
        return statusMap[status] || 'status-unknown';
    },

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            'succeed': '成功',
            'failed': '失败',
            'processing': '处理中',
            'submitted': '已提交'
        };
        return statusMap[status] || status;
    },

    // 查看任务详情
    async viewTaskDetail(clientId) {
        try {
            const result = await API.getTaskStatus(clientId);
            
            if (!result.success) {
                alert('获取任务详情失败: ' + result.msg);
                return;
            }

            const task = result.data;
            this.showTaskDetailModal(task);
        } catch (error) {
            alert('获取任务详情出错: ' + error.message);
        }
    },

    // 显示任务详情弹窗
    showTaskDetailModal(task) {
        // 创建弹窗
        const modal = document.createElement('div');
        modal.id = 'taskDetailModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const statusClass = this.getStatusClass(task.status);
        const statusText = this.getStatusText(task.status);

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div style="
                    padding: 20px 25px;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8f9fa;
                ">
                    <h3 style="margin: 0; color: #1a73e8;">任务详情</h3>
                    <button onclick="document.getElementById('taskDetailModal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>
                <div style="padding: 25px; overflow-y: auto;">
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #666;">Client ID:</label>
                        <div style="font-family: monospace; margin-top: 5px;">${task.clientId}</div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #666;">状态:</label>
                        <div style="margin-top: 5px;">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #666;">正向提示词:</label>
                        <div style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 6px;">${task.prompt || '-'}</div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #666;">反向提示词:</label>
                        <div style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 6px;">${task.negativePrompt || '-'}</div>
                    </div>
                    ${task.images ? `
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight: 600; color: #666;">生成图片:</label>
                            <div style="margin-top: 5px; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
                                ${task.images.map(img => `
                                    <img src="${typeof img === 'string' ? img : img.url}" style="width: 100%; border-radius: 6px; cursor: pointer;" onclick="Results.previewImage('${typeof img === 'string' ? img : img.url}')">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${task.errorMessage ? `
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight: 600; color: #ea4335;">错误信息:</label>
                            <div style="margin-top: 5px; padding: 10px; background: #f8d7da; border-radius: 6px; color: #721c24;">${task.errorMessage}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tasks;
}
