/**
 * 任务轮询器模块
 * 处理生成任务的轮询和状态更新
 */
const Poller = {
    pollingIntervals: new Map(),
    maxAttempts: 120,  // 10分钟 (5秒间隔)
    interval: 5000,    // 5秒

    // 开始轮询
    startPolling(clientId, taskParams) {
        // 如果已经在轮询，先停止
        if (this.pollingIntervals.has(clientId)) {
            this.stopPolling(clientId);
        }

        let attempts = 0;
        const startTime = Date.now();

        // 立即查询一次
        this.queryTask(clientId, taskParams, attempts, startTime);

        // 设置定时轮询
        const intervalId = setInterval(() => {
            attempts++;
            if (attempts >= this.maxAttempts) {
                this.handleTimeout(clientId);
                return;
            }
            this.queryTask(clientId, taskParams, attempts, startTime);
        }, this.interval);

        this.pollingIntervals.set(clientId, intervalId);
    },

    // 停止轮询
    stopPolling(clientId) {
        const intervalId = this.pollingIntervals.get(clientId);
        if (intervalId) {
            clearInterval(intervalId);
            this.pollingIntervals.delete(clientId);
        }
    },

    // 查询任务状态
    async queryTask(clientId, taskParams, attempts, startTime) {
        try {
            const result = await API.getTaskStatus(clientId);
            
            if (!result.success) {
                console.error('查询任务状态失败:', result.msg);
                return;
            }

            const task = result.data;
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

            // 更新进度显示
            this.updateProgressUI(task, elapsedTime);

            // 根据状态处理
            switch (task.status) {
                case 'succeed':
                    this.handleSuccess(clientId, task, taskParams);
                    break;
                case 'failed':
                    this.handleFailure(clientId, task);
                    break;
                case 'submitted':
                case 'processing':
                    // 继续轮询
                    break;
                default:
                    console.warn('未知任务状态:', task.status);
            }
        } catch (error) {
            console.error('轮询任务状态出错:', error);
        }
    },

    // 更新进度UI
    updateProgressUI(task, elapsedTime) {
        let progress = 0;
        let statusText = '生成中...';

        switch (task.status) {
            case 'submitted':
                progress = 10;
                statusText = '已提交，等待处理...';
                break;
            case 'processing':
                progress = 50;
                statusText = '正在生成中...';
                break;
            case 'succeed':
                progress = 100;
                statusText = '生成完成！';
                break;
            case 'failed':
                progress = 0;
                statusText = '生成失败';
                break;
        }

        // 更新进度条
        if (typeof Generate !== 'undefined') {
            Generate.updateProgress(progress, statusText, elapsedTime);
        }
    },

    // 处理成功
    handleSuccess(clientId, task, taskParams) {
        this.stopPolling(clientId);
        
        // 隐藏进度
        if (typeof Generate !== 'undefined') {
            Generate.hideProgress();
        }

        // 显示结果
        Results.display(task);

        // 更新历史状态
        this.updateHistoryStatus(clientId, 'succeed');

        // 显示成功通知
        alert('图片生成成功！');
    },

    // 处理失败
    handleFailure(clientId, task) {
        this.stopPolling(clientId);
        
        // 隐藏进度
        if (typeof Generate !== 'undefined') {
            Generate.hideProgress();
        }

        // 更新历史状态
        this.updateHistoryStatus(clientId, 'failed');

        // 显示失败通知
        alert('生成失败: ' + (task.errorMessage || '未知错误'));
    },

    // 处理超时
    handleTimeout(clientId) {
        this.stopPolling(clientId);
        
        // 隐藏进度
        if (typeof Generate !== 'undefined') {
            Generate.hideProgress();
        }

        // 更新历史状态
        this.updateHistoryStatus(clientId, 'timeout');

        alert('生成任务超时，请稍后到任务列表查看结果');
    },

    // 更新历史状态
    updateHistoryStatus(clientId, status) {
        const history = JSON.parse(localStorage.getItem('holopix_generation_history') || '[]');
        const item = history.find(h => h.clientId === clientId);
        if (item) {
            item.status = status;
            localStorage.setItem('holopix_generation_history', JSON.stringify(history));
            if (typeof Generate !== 'undefined') {
                Generate.renderHistory();
            }
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Poller;
}
