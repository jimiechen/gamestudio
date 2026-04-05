/**
 * API模块
 * 封装所有后端API调用
 */
const API = {
    // 基础请求方法
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    // ========== 生成相关API ==========
    
    // 提交生成任务
    async generate(data) {
        return this.request('/api/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // 获取任务状态
    async getTaskStatus(clientId) {
        return this.request(`/api/tasks/${clientId}`);
    },
    
    // ========== 模型相关API ==========
    
    // 同步模型列表
    async syncModels() {
        return this.request('/api/models/sync', {
            method: 'POST'
        });
    },
    
    // 获取模型列表
    async getModels() {
        return this.request('/api/models');
    },
    
    // 获取模型详情
    async getModelDetail(modelId) {
        return this.request(`/api/models/${modelId}`);
    },
    
    // 置顶/取消置顶模型
    async togglePinModel(modelId, isPinned) {
        return this.request(`/api/models/${modelId}/pin`, {
            method: 'POST',
            body: JSON.stringify({ isPinned })
        });
    },
    
    // 隐藏/显示模型
    async toggleHiddenModel(modelId, isHidden) {
        return this.request(`/api/models/${modelId}/hidden`, {
            method: 'POST',
            body: JSON.stringify({ isHidden })
        });
    },
    
    // 使用模型（添加到生成页）
    async useModel(modelId) {
        return this.request(`/api/models/${modelId}/use`, {
            method: 'POST'
        });
    },
    
    // ========== 任务相关API ==========
    
    // 获取任务列表
    async getTasks() {
        return this.request('/api/tasks');
    },
    
    // ========== 素材相关API ==========
    
    // 获取素材列表
    async getAssets() {
        return this.request('/api/assets');
    },
    
    // 删除素材
    async deleteAsset(assetId) {
        return this.request(`/api/assets/${assetId}`, {
            method: 'DELETE'
        });
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
