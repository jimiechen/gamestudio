/**
 * 状态管理模块
 * 管理应用全局状态
 */
const State = {
    // 模型相关状态
    models: [],
    selectedModels: [],
    
    // 任务相关状态
    tasks: [],
    currentTask: null,
    
    // 素材相关状态
    assets: [],
    
    // 生成相关状态
    generationProgress: {
        status: 'idle',
        progress: 0,
        elapsedTime: 0
    },
    
    // 获取状态
    get(key) {
        return this[key];
    },
    
    // 设置状态
    set(key, value) {
        this[key] = value;
        this.notify(key, value);
    },
    
    // 订阅状态变化
    listeners: {},
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    },
    
    // 通知订阅者
    notify(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    },
    
    // 添加选中的模型
    addSelectedModel(model) {
        if (this.selectedModels.length >= 5) {
            alert('最多只能选择5个模型');
            return false;
        }
        if (this.selectedModels.find(m => m.modelId === model.modelId)) {
            alert('该模型已添加');
            return false;
        }
        this.selectedModels.push({
            ...model,
            strength: 0.9
        });
        this.notify('selectedModels', this.selectedModels);
        return true;
    },
    
    // 移除选中的模型
    removeSelectedModel(modelId) {
        this.selectedModels = this.selectedModels.filter(m => m.modelId !== modelId);
        this.notify('selectedModels', this.selectedModels);
    },
    
    // 更新模型强度
    updateModelStrength(modelId, strength) {
        const model = this.selectedModels.find(m => m.modelId === modelId);
        if (model) {
            model.strength = parseFloat(strength);
            this.notify('selectedModels', this.selectedModels);
        }
    },
    
    // 清空选中的模型
    clearSelectedModels() {
        this.selectedModels = [];
        this.notify('selectedModels', this.selectedModels);
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = State;
}
