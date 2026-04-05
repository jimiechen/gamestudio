/**
 * State模块单元测试
 * 测试状态管理功能
 */

// 模拟State模块
const State = {
    models: [],
    selectedModels: [],
    tasks: [],
    currentTask: null,
    assets: [],
    generationProgress: {
        status: 'idle',
        progress: 0,
        elapsedTime: 0
    },
    
    listeners: {},
    
    get(key) {
        return this[key];
    },
    
    set(key, value) {
        this[key] = value;
        this.notify(key, value);
    },
    
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    },
    
    notify(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    },
    
    addSelectedModel(model) {
        if (this.selectedModels.length >= 5) {
            return false;
        }
        if (this.selectedModels.find(m => m.modelId === model.modelId)) {
            return false;
        }
        this.selectedModels.push({
            ...model,
            strength: 0.9
        });
        this.notify('selectedModels', this.selectedModels);
        return true;
    },
    
    removeSelectedModel(modelId) {
        this.selectedModels = this.selectedModels.filter(m => m.modelId !== modelId);
        this.notify('selectedModels', this.selectedModels);
    },
    
    updateModelStrength(modelId, strength) {
        const model = this.selectedModels.find(m => m.modelId === modelId);
        if (model) {
            model.strength = parseFloat(strength);
            this.notify('selectedModels', this.selectedModels);
        }
    },
    
    clearSelectedModels() {
        this.selectedModels = [];
        this.notify('selectedModels', this.selectedModels);
    },
    
    // 测试辅助方法
    reset() {
        this.models = [];
        this.selectedModels = [];
        this.tasks = [];
        this.currentTask = null;
        this.assets = [];
        this.generationProgress = {
            status: 'idle',
            progress: 0,
            elapsedTime: 0
        };
        this.listeners = {};
    }
};

// 测试套件
describe('State模块测试', () => {
    beforeEach(() => {
        State.reset();
    });

    describe('基础方法', () => {
        test('get方法应该返回正确的值', () => {
            State.models = [{ id: 1, name: 'test' }];
            expect(State.get('models')).toEqual([{ id: 1, name: 'test' }]);
        });

        test('set方法应该设置值并触发通知', () => {
            const callback = jest.fn();
            State.subscribe('tasks', callback);
            State.set('tasks', [{ id: 1 }]);
            expect(State.get('tasks')).toEqual([{ id: 1 }]);
            expect(callback).toHaveBeenCalledWith([{ id: 1 }]);
        });
    });

    describe('模型选择管理', () => {
        test('addSelectedModel应该添加模型', () => {
            const result = State.addSelectedModel({
                modelId: 1,
                modelName: 'Test Model'
            });
            expect(result).toBe(true);
            expect(State.selectedModels).toHaveLength(1);
            expect(State.selectedModels[0].strength).toBe(0.9);
        });

        test('addSelectedModel不应该添加重复模型', () => {
            State.addSelectedModel({ modelId: 1, modelName: 'Test' });
            const result = State.addSelectedModel({ modelId: 1, modelName: 'Test' });
            expect(result).toBe(false);
            expect(State.selectedModels).toHaveLength(1);
        });

        test('addSelectedModel不应该超过5个模型', () => {
            for (let i = 1; i <= 5; i++) {
                State.addSelectedModel({ modelId: i, modelName: `Model ${i}` });
            }
            const result = State.addSelectedModel({ modelId: 6, modelName: 'Model 6' });
            expect(result).toBe(false);
            expect(State.selectedModels).toHaveLength(5);
        });

        test('removeSelectedModel应该移除模型', () => {
            State.addSelectedModel({ modelId: 1, modelName: 'Test' });
            State.removeSelectedModel(1);
            expect(State.selectedModels).toHaveLength(0);
        });

        test('updateModelStrength应该更新模型强度', () => {
            State.addSelectedModel({ modelId: 1, modelName: 'Test' });
            State.updateModelStrength(1, 0.7);
            expect(State.selectedModels[0].strength).toBe(0.7);
        });

        test('clearSelectedModels应该清空所有模型', () => {
            State.addSelectedModel({ modelId: 1, modelName: 'Test1' });
            State.addSelectedModel({ modelId: 2, modelName: 'Test2' });
            State.clearSelectedModels();
            expect(State.selectedModels).toHaveLength(0);
        });
    });

    describe('订阅通知', () => {
        test('订阅者应该在值变化时收到通知', () => {
            const callback = jest.fn();
            State.subscribe('selectedModels', callback);
            State.addSelectedModel({ modelId: 1, modelName: 'Test' });
            expect(callback).toHaveBeenCalled();
        });

        test('多个订阅者都应该收到通知', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            State.subscribe('selectedModels', callback1);
            State.subscribe('selectedModels', callback2);
            State.addSelectedModel({ modelId: 1, modelName: 'Test' });
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });
});

// 导出模块
module.exports = State;
