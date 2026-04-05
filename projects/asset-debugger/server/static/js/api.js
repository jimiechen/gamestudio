// API 封装模块

const BASE_URL = '';

/**
 * 发送 HTTP 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
 * @returns {Promise<any>} - 响应数据
 */
async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '请求失败' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

export const API = {
    // 生成图片
    async generate(data) {
        return request('/api/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 同步模型列表
    async syncModels() {
        return request('/api/models/sync', { method: 'POST' });
    },

    // 获取模型列表
    async getModels() {
        return request('/api/models');
    },

    // 获取模型详情
    async getModelDetail(modelId) {
        return request(`/api/models/${modelId}`);
    },

    // 切换模型隐藏状态
    async toggleModelHidden(modelId, isHidden) {
        return request(`/api/models/${modelId}/hidden`, {
            method: 'POST',
            body: JSON.stringify({ isHidden })
        });
    },

    // 切换模型置顶状态
    async toggleModelPin(modelId, isPinned) {
        return request(`/api/models/${modelId}/pin`, {
            method: 'POST',
            body: JSON.stringify({ isPinned })
        });
    },

    // 使用模型
    async useModel(modelId) {
        return request(`/api/models/${modelId}/use`, { method: 'POST' });
    },

    // 获取任务列表
    async getTasks() {
        return request('/api/tasks');
    },

    // 获取任务详情
    async getTaskDetail(clientId) {
        return request(`/api/tasks/${clientId}`);
    },

    // 下载任务图片
    async downloadTask(clientId) {
        return request(`/api/tasks/${clientId}/download`);
    },

    // 获取素材列表
    async getAssets() {
        return request('/api/assets');
    },

    // 删除素材
    async deleteAsset(assetId) {
        return request(`/api/assets/${assetId}`, { method: 'DELETE' });
    },

    // 获取火柴人姿势列表
    async getStickmanPoses(filter = '') {
        const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
        return request(`/api/stickman/poses${query}`);
    },

    // 保存火柴人姿势
    async saveStickmanPose(data) {
        return request('/api/stickman/poses', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 删除火柴人姿势
    async deleteStickmanPose(poseId) {
        return request(`/api/stickman/poses/${poseId}`, { method: 'DELETE' });
    },

    // 获取快捷应用列表
    async getQuickPresets() {
        return request('/api/quick-presets');
    },

    // 保存快捷应用
    async saveQuickPreset(data) {
        return request('/api/quick-presets', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 应用快捷应用
    async applyQuickPreset(presetId) {
        return request(`/api/quick-presets/${presetId}/apply`, { method: 'POST' });
    },

    // 删除快捷应用
    async deleteQuickPreset(presetId) {
        return request(`/api/quick-presets/${presetId}`, { method: 'DELETE' });
    },

    // 切换快捷应用收藏状态
    async toggleQuickPresetFavorite(presetId, isFavorite) {
        return request(`/api/quick-presets/${presetId}/favorite`, {
            method: 'POST',
            body: JSON.stringify({ isFavorite })
        });
    }
};
