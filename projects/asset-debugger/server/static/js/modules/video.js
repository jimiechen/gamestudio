/**
 * 图生视频模块
 * 处理图生视频的完整流程：图片上传 → 参数配置 → 任务提交 → 结果展示
 */
const VideoGenerator = {
    currentMode: 'first_frame',
    selectedImages: {
        firstFrame: null,
        lastFrame: null
    },

    init() {
        this.bindEvents();
        this.initDropZones();
        this.loadHistory();
    },

    bindEvents() {
        document.querySelectorAll('[data-video-mode]').forEach(radio => {
            radio.addEventListener('change', (e) => this.switchMode(e.target.value));
        });

        const generateBtn = document.querySelector('[data-action="generateVideo"]');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateVideo());
        }

        document.querySelectorAll('[data-select-image]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = e.currentTarget.dataset.selectImage;
                document.getElementById(`${type}Input`).click();
            });
        });

        document.querySelectorAll('[data-select-from-assets]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = e.currentTarget.dataset.selectFromAssets;
                this.openAssetSelector(type);
            });
        });

        // 文件输入监听
        ['firstFrame', 'lastFrame'].forEach(type => {
            const input = document.getElementById(`${type}Input`);
            if (input) {
                input.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.handleImageSelect(e.target.files[0], type);
                    }
                });
            }
        });
    },

    switchMode(mode) {
        this.currentMode = mode;

        const lastFrameSection = document.getElementById('lastFrameSection');
        if (lastFrameSection) {
            lastFrameSection.style.display = mode === 'first_last_frame' ? 'block' : 'none';
        }

        const modeHint = document.getElementById('modeHint');
        if (modeHint) {
            modeHint.textContent = mode === 'first_frame'
                ? '当前模式：仅使用首帧图片生成视频'
                : '当前模式：使用首尾帧图片生成过渡动画';
        }
    },

    initDropZones() {
        ['firstFrame', 'lastFrame'].forEach(type => {
            const dropZone = document.getElementById(`${type}DropZone`);
            if (!dropZone) return;

            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = '#667eea';
                    dropZone.style.background = '#f0f3ff';
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = '#ddd';
                    dropZone.style.background = '#fafafa';
                });
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageSelect(files[0], type);
                }
            });
        });
    },

    async handleImageSelect(file, type) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件（PNG/JPG/WebP）');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('图片大小不能超过10MB');
            return;
        }

        this.previewImage(file, type);
        await this.uploadImage(file, type);
    },

    previewImage(file, type) {
        const preview = document.getElementById(`${type}Preview`);
        const placeholder = document.getElementById(`${type}Placeholder`);

        if (preview && placeholder) {
            const url = URL.createObjectURL(file);
            preview.src = url;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }

        this.selectedImages[type] = {
            file: file,
            url: URL.createObjectURL(file),
            name: file.name,
            ossUrl: null,
            localPath: null
        };
    },

    async uploadImage(file, type) {
        const statusEl = document.getElementById(`${type}UploadStatus`);
        if (statusEl) statusEl.innerHTML = '<span style="color: #1a73e8;">⏳ 上传中...</span>';

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/video/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data) {
                this.selectedImages[type].ossUrl = result.data.oss_url;
                this.selectedImages[type].localPath = result.data.local_path;

                if (result.warning) {
                    if (statusEl) statusEl.innerHTML = `<span style="color: #f9ab00;">⚠️ ${result.warning}</span>`;
                } else {
                    if (statusEl) statusEl.innerHTML = '<span style="color: #34a853;">✅ 上传成功</span>';
                }
            } else {
                if (statusEl) statusEl.innerHTML = `<span style="color: #ea4335;">❌ 上传失败: ${result.error || '未知错误'}</span>`;
            }
        } catch (error) {
            console.error('上传出错:', error);
            if (statusEl) statusEl.innerHTML = '<span style="color: #ea4335;">❌ 上传失败</span>';
        }
    },

    collectFormData() {
        if (!this.selectedImages.firstFrame || !this.selectedImages.firstFrame.ossUrl) {
            alert('请选择或上传首帧图片');
            return null;
        }

        if (this.currentMode === 'first_last_frame') {
            if (!this.selectedImages.lastFrame || !this.selectedImages.lastFrame.ossUrl) {
                alert('请选择或上传尾帧图片');
                return null;
            }
        }

        return {
            mode: this.currentMode,
            prompt: document.getElementById('videoPrompt')?.value || '',
            first_frame_url: this.selectedImages.firstFrame.ossUrl,
            first_frame_local: this.selectedImages.firstFrame.localPath || '',
            last_frame_url: this.selectedImages.lastFrame?.ossUrl || null,
            last_frame_local: this.selectedImages.lastFrame?.localPath || '',
            resolution: document.getElementById('videoResolution')?.value || '720P',
            model: document.getElementById('videoModel')?.value || 'wan2.2-kf2v-flash',
            prompt_extend: document.getElementById('promptExtend')?.checked ?? true,
            watermark: document.getElementById('watermark')?.checked ?? true
        };
    },

    async generateVideo() {
        const data = this.collectFormData();
        if (!data) return;

        try {
            this.showProgress();

            const response = await fetch('/api/video/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                VideoPoller.startPolling(result.data.task_id, data);
                this.addToHistory(result.data.task_id, data);
                alert(`🎬 视频生成任务已提交！\n\n任务ID: ${result.data.task_id}\n\n预计等待时间：30秒~5分钟`);
            } else {
                this.hideProgress();
                alert(`任务提交失败: ${result.error || result.msg || '未知错误'}`);
            }
        } catch (error) {
            this.hideProgress();
            alert('请求失败: ' + error.message);
        }
    },

    showProgress() {
        const el = document.getElementById('videoProgress');
        if (el) el.style.display = 'block';
        this.updateProgress(0, '正在提交任务...', 0);
    },

    hideProgress() {
        const el = document.getElementById('videoProgress');
        if (el) el.style.display = 'none';
    },

    updateProgress(progress, status, elapsedSeconds) {
        const fill = document.getElementById('videoProgressFill');
        const statusEl = document.getElementById('videoProgressStatus');
        const timeEl = document.getElementById('videoProgressTime');

        if (fill) fill.style.width = progress + '%';
        if (statusEl) statusEl.textContent = status;
        if (timeEl) timeEl.textContent = `已等待: ${elapsedSeconds}秒`;
    },

    addToHistory(taskId, params) {
        const history = JSON.parse(localStorage.getItem('video_generation_history') || '[]');
        history.unshift({
            taskId,
            params,
            timestamp: new Date().toISOString(),
            status: 'submitted'
        });
        if (history.length > 50) history.pop();
        localStorage.setItem('video_generation_history', JSON.stringify(history));
        this.renderHistory();
    },

    renderHistory() {
        const container = document.getElementById('videoHistoryList');
        if (!container) return;

        const history = JSON.parse(localStorage.getItem('video_generation_history') || '[]');

        if (history.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">暂无视频生成记录</p>';
            return;
        }

        container.innerHTML = history.map(item => `
            <div style="
                padding: 12px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: white;
                border-radius: 6px;
                margin-bottom: 8px;
            ">
                <div>
                    <div style="font-weight: 500; font-size: 13px; color: #333;">
                        📹 ${item.params.mode === 'first_frame' ? '首帧' : '首尾帧'}模式 | 
                        <span style="color: #666; font-size: 12px;">${item.taskId.substring(0, 12)}...</span>
                    </div>
                    <div style="font-size: 11px; color: #999; margin-top: 4px;">
                        ${new Date(item.timestamp).toLocaleString('zh-CN')}
                        ${item.params.prompt ? `| ${item.params.prompt.substring(0, 40)}...` : ''}
                    </div>
                </div>
                <span class="status-badge" style="
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    background: ${
                        item.status === 'succeeded' ? '#e8f5e9' :
                        item.status === 'failed' ? '#fce4ec' :
                        item.status === 'timeout' ? '#fff3e0' : '#e3f2fd'
                    };
                    color: ${
                        item.status === 'succeeded' ? '#2e7d32' :
                        item.status === 'failed' ? '#c62828' :
                        item.status === 'timeout' ? '#ef6c00' : '#1565c0'
                    };
                ">${item.statusText || item.status}</span>
            </div>
        `).join('');
    },

    loadHistory() {
        this.renderHistory();
    },

    openAssetSelector(type) {
        alert(`从素材库选择${type === 'firstFrame' ? '首帧' : '尾帧'}图片 - 功能开发中，请使用文件上传`);
    },

    resetForm() {
        this.selectedImages = { firstFrame: null, lastFrame: null };
        this.currentMode = 'first_frame';

        ['firstFrame', 'lastFrame'].forEach(type => {
            const preview = document.getElementById(`${type}Preview`);
            const placeholder = document.getElementById(`${type}Placeholder`);
            const status = document.getElementById(`${type}UploadStatus`);

            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = '';
            if (status) status.textContent = '';
        });

        const promptEl = document.getElementById('videoPrompt');
        if (promptEl) promptEl.value = '';
    }
};

const VideoPoller = {
    pollingIntervals: new Map(),
    maxAttempts: 240,
    interval: 5000,

    startPolling(taskId, taskParams) {
        if (this.pollingIntervals.has(taskId)) {
            this.stopPolling(taskId);
        }

        let attempts = 0;
        const startTime = Date.now();

        this.queryTask(taskId, taskParams, attempts, startTime);

        const intervalId = setInterval(() => {
            attempts++;
            if (attempts >= this.maxAttempts) {
                this.handleTimeout(taskId);
                return;
            }
            this.queryTask(taskId, taskParams, attempts, startTime);
        }, this.interval);

        this.pollingIntervals.set(taskId, intervalId);
    },

    stopPolling(taskId) {
        const intervalId = this.pollingIntervals.get(taskId);
        if (intervalId) {
            clearInterval(intervalId);
            this.pollingIntervals.delete(taskId);
        }
    },

    async queryTask(taskId, taskParams, attempts, startTime) {
        try {
            const response = await fetch(`/api/video/tasks/${taskId}`);
            const result = await response.json();

            if (!result.success) {
                console.error('查询视频任务状态失败:', result.error);
                return;
            }

            const data = result.data;
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

            this.updateProgressUI(data, elapsedTime);

            switch (data.status) {
                case 'succeeded':
                    this.handleSuccess(taskId, data, taskParams);
                    break;
                case 'failed':
                    this.handleFailure(taskId, data);
                    break;
                case 'pending':
                case 'processing':
                    break;
            }
        } catch (error) {
            console.error('轮询出错:', error);
        }
    },

    updateProgressUI(data, elapsedTime) {
        let progress = 0;
        let statusText = '处理中...';

        switch (data.status) {
            case 'pending':
                progress = 10;
                statusText = '排队中，等待处理...';
                break;
            case 'processing':
                progress = Math.min(10 + (elapsedTime / 10), 80);
                statusText = '正在生成视频...（AI需要一些时间）';
                break;
            case 'succeeded':
                progress = 100;
                statusText = '视频生成完成！';
                break;
            case 'failed':
                progress = 0;
                statusText = '生成失败';
                break;
        }

        if (typeof VideoGenerator !== 'undefined') {
            VideoGenerator.updateProgress(progress, statusText, elapsedTime);
        }
    },

    handleSuccess(taskId, data, taskParams) {
        this.stopPolling(taskId);

        if (typeof VideoGenerator !== 'undefined') {
            VideoGenerator.hideProgress();
        }

        this.displayResult(data);
        this.updateHistoryStatus(taskId, 'succeeded', '已完成');
        this.autoDownloadVideo(taskId);

        alert('🎉 视频生成成功！\n\n视频已自动保存到素材库，您也可以在下方预览。');
    },

    handleFailure(taskId, data) {
        this.stopPolling(taskId);

        if (typeof VideoGenerator !== 'undefined') {
            VideoGenerator.hideProgress();
        }

        this.updateHistoryStatus(taskId, 'failed', '失败');

        alert(`❌ 视频生成失败\n\n原因: ${data.message || data.error_message || '未知错误'}\n\n请检查提示词或图片后重试。`);
    },

    handleTimeout(taskId) {
        this.stopPolling(taskId);

        if (typeof VideoGenerator !== 'undefined') {
            VideoGenerator.hideProgress();
        }

        this.updateHistoryStatus(taskId, 'timeout', '超时');

        alert('⏰ 视频生成超时（超过20分钟）\n\n请稍后在"视频生成历史"中查看结果。');
    },

    displayResult(data) {
        const container = document.getElementById('videoResults');
        const resultsContainer = document.getElementById('videoResultsContainer');

        if (!container || !resultsContainer) return;

        container.style.display = 'block';

        const videoCard = `
            <div class="video-result-card" style="
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
                margin-bottom: 15px;
            ">
                <div style="background: #000; padding: 0;">
                    <video controls autoplay loop muted style="width: 100%; max-height: 450px; display: block;"
                           src="${data.video_url}" poster="">
                        您的浏览器不支持视频播放
                    </video>
                </div>
                <div style="padding: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <button onclick="window.open('${data.video_url}', '_blank')"
                            style="flex: 1; min-width: 140px; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">
                        🔗 在浏览器打开
                    </button>
                    <button onclick="VideoPoller.downloadVideo('${data.task_id}')"
                            style="flex: 1; min-width: 140px; padding: 12px; background: linear-gradient(135deg, #11998e, #38ef7d); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">
                        💾 保存到素材库
                    </button>
                </div>
            </div>
        `;

        resultsContainer.insertAdjacentHTML('afterbegin', videoCard);
    },

    async autoDownloadVideo(taskId) {
        try {
            const response = await fetch(`/api/video/tasks/${taskId}/download`, {
                method: 'POST'
            });
            const result = await response.json();

            if (result.success) {
                console.log('✅ 视频已自动保存到素材库:', result.data.filename);
            } else {
                console.warn('自动下载视频失败:', result.error);
            }
        } catch (error) {
            console.error('自动下载视频异常:', error);
        }
    },

    async downloadVideo(taskId) {
        try {
            alert('正在下载视频到本地素材库...');
            const response = await fetch(`/api/video/tasks/${taskId}/download`, {
                method: 'POST'
            });
            const result = await response.json();

            if (result.success) {
                alert(`✅ 视频已保存到素材库！\n\n文件名: ${result.data.filename}\n大小: ${(result.data.file_size / 1024 / 1024).toFixed(2)} MB`);
            } else {
                alert('保存失败: ' + (result.error || '未知错误'));
            }
        } catch (error) {
            alert('保存出错: ' + error.message);
        }
    },

    updateHistoryStatus(taskId, status, statusText) {
        const history = JSON.parse(localStorage.getItem('video_generation_history') || '[]');
        const item = history.find(h => h.taskId === taskId);
        if (item) {
            item.status = status;
            item.statusText = statusText;
            localStorage.setItem('video_generation_history', JSON.stringify(history));
            if (typeof VideoGenerator !== 'undefined') {
                VideoGenerator.renderHistory();
            }
        }
    }
};

// 初始化图生视频模块
document.addEventListener('DOMContentLoaded', function() {
    if (typeof VideoGenerator !== 'undefined') {
        VideoGenerator.init();
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VideoGenerator, VideoPoller };
}
