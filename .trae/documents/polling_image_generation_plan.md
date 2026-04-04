# 生成素材选项卡 - 前端轮询图片生成方案

## 需求概述

在"生成素材"选项卡中：
1. 发起图片生成请求
2. 前端开启轮询，异步等待生图任务完成
3. 任务完成后在页面上显示图片结果
4. 支持多个图片列表显示（批量生成时）
5. **查看历史任务的结果和参数（弹框显示）**

---

## 当前现状

### 现有功能
- `generateImage()` 函数提交生成请求，返回 `clientId`
- 提示用户到「任务列表」查看进度
- 任务列表页面可手动查询任务状态
- 任务完成后可下载图片到素材库

### 存在的问题
- 生成后需要手动切换到任务列表查看
- 没有实时轮询机制
- 生成结果不直观，需要跳转到素材库查看
- **无法在当前页面查看历史任务的详细参数和结果**

---

## 目标方案

### 核心功能
1. **实时轮询** - 生成后自动轮询任务状态
2. **进度展示** - 显示生成进度和状态
3. **结果展示** - 完成后直接在生成页面显示图片
4. **多图支持** - 支持批量生成多张图片的展示
5. **历史任务查看** - 弹框显示任务详细参数和结果

---

## 详细设计

### 1. 页面结构修改

在生成素材选项卡添加结果展示区域和历史任务列表：

```html
<!-- 生成进度展示区域 -->
<div id="generationProgress" style="display: none;">
    <div class="progress-info">
        <span id="progressStatus">生成中...</span>
        <span id="progressTime">已等待: 0秒</span>
    </div>
    <div class="progress-bar">
        <div id="progressFill" style="width: 0%"></div>
    </div>
</div>

<!-- 生成的图片结果展示 -->
<div id="generationResults" style="display: none;">
    <h3>生成结果</h3>
    <div id="resultsGrid" class="results-grid">
        <!-- 动态插入图片卡片 -->
    </div>
</div>

<!-- 历史生成任务列表 -->
<div id="generationHistory" style="margin-top: 30px;">
    <h3>📋 最近生成任务</h3>
    <div id="historyList" class="history-list">
        <!-- 动态插入历史任务卡片 -->
    </div>
</div>
```

### 2. 轮询机制实现

```javascript
// 轮询管理器
class GenerationPoller {
    constructor() {
        this.pollingIntervals = new Map(); // clientId -> intervalId
        this.maxAttempts = 120; // 最大轮询次数 (约10分钟)
        this.interval = 5000;   // 轮询间隔 5秒
        this.taskHistory = [];  // 存储任务历史
    }

    // 开始轮询
    startPolling(clientId, taskParams = null) {
        let attempts = 0;
        
        // 保存任务参数到历史
        if (taskParams) {
            this.taskHistory.unshift({
                clientId: clientId,
                params: taskParams,
                status: 'submitted',
                startTime: Date.now(),
                result: null
            });
            this.renderHistoryList();
        }
        
        // 显示进度区域
        this.showProgress(clientId);
        
        const intervalId = setInterval(async () => {
            attempts++;
            
            try {
                const result = await this.queryTask(clientId);
                
                if (result.success) {
                    const task = result.data.clientList[0];
                    this.updateProgress(clientId, task, attempts);
                    this.updateTaskHistory(clientId, task);
                    
                    // 任务完成
                    if (task.status === 'succeed') {
                        this.handleSuccess(clientId, task);
                        this.stopPolling(clientId);
                    }
                    // 任务失败
                    else if (task.status === 'failed') {
                        this.handleFailure(clientId, task);
                        this.stopPolling(clientId);
                    }
                    // 超过最大次数
                    else if (attempts >= this.maxAttempts) {
                        this.handleTimeout(clientId);
                        this.stopPolling(clientId);
                    }
                }
            } catch (error) {
                console.error('轮询失败:', error);
            }
        }, this.interval);
        
        this.pollingIntervals.set(clientId, intervalId);
    }

    // 停止轮询
    stopPolling(clientId) {
        const intervalId = this.pollingIntervals.get(clientId);
        if (intervalId) {
            clearInterval(intervalId);
            this.pollingIntervals.delete(clientId);
        }
    }

    // 查询任务状态
    async queryTask(clientId) {
        const response = await fetch(`/api/tasks/${clientId}`);
        return await response.json();
    }

    // 更新任务历史
    updateTaskHistory(clientId, task) {
        const historyItem = this.taskHistory.find(h => h.clientId === clientId);
        if (historyItem) {
            historyItem.status = task.status;
            historyItem.result = task;
            historyItem.endTime = Date.now();
            this.renderHistoryList();
        }
    }

    // 渲染历史任务列表
    renderHistoryList() {
        const container = document.getElementById('historyList');
        if (!container) return;

        let html = '';
        this.taskHistory.slice(0, 10).forEach((item, index) => {
            const statusIcon = {
                'submitted': '⏳',
                'processing': '🔄',
                'succeed': '✅',
                'failed': '❌'
            }[item.status] || '⏳';
            
            const duration = item.endTime 
                ? Math.round((item.endTime - item.startTime) / 1000) + '秒'
                : '进行中';
            
            html += `
                <div class="history-item" onclick="generationPoller.showTaskDetail('${item.clientId}')">
                    <div class="history-status">${statusIcon}</div>
                    <div class="history-info">
                        <div class="history-prompt">${item.params?.prompt?.substring(0, 50) || '无提示词'}...</div>
                        <div class="history-meta">
                            <span>Client: ${item.clientId.substring(0, 15)}...</span>
                            <span>耗时: ${duration}</span>
                            <span>${new Date(item.startTime).toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <div class="history-action">
                        <button class="btn btn-sm" onclick="event.stopPropagation(); generationPoller.showTaskDetail('${item.clientId}')">查看详情</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p style="color: #999; padding: 20px;">暂无生成任务</p>';
    }

    // 显示任务详情弹框
    showTaskDetail(clientId) {
        const item = this.taskHistory.find(h => h.clientId === clientId);
        if (!item) {
            showNotification('任务不存在', 'error');
            return;
        }

        const params = item.params || {};
        const result = item.result || {};
        const images = result.subTaskList || [];
        
        // 构建参数详情HTML
        const paramsHtml = `
            <div class="detail-section">
                <h4>📝 生成参数</h4>
                <div class="detail-grid">
                    <div class="detail-item"><label>正向提示词:</label><div class="detail-value">${params.prompt || '-'}</div></div>
                    <div class="detail-item"><label>反向提示词:</label><div class="detail-value">${params.negative_prompt || '-'}</div></div>
                    <div class="detail-item"><label>模型列表:</label><div class="detail-value">${JSON.stringify(params.model_detail_list || [])}</div></div>
                    <div class="detail-item"><label>宽高比:</label><div class="detail-value">${params.aspect_rat