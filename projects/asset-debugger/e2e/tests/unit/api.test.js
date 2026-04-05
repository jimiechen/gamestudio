/**
 * API模块单元测试
 * 测试API封装功能
 */

// 模拟fetch
global.fetch = jest.fn();

// API模块
const API = {
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
    
    // 生成相关API
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
    
    // 模型相关API
    async syncModels() {
        return this.request('/api/models/sync', {
            method: 'POST'
        });
    },
    
    async getModels() {
        return this.request('/api/models');
    },
    
    async getModelDetail(modelId) {
        return this.request(`/api/models/${modelId}`);
    },
    
    async togglePinModel(modelId, isPinned) {
        return this.request(`/api/models/${modelId}/pin`, {
            method: 'POST',
            body: JSON.stringify({ isPinned })
        });
    },
    
    async toggleHiddenModel(modelId, isHidden) {
        return this.request(`/api/models/${modelId}/hidden`, {
            method: 'POST',
            body: JSON.stringify({ isHidden })
        });
    },
    
    async useModel(modelId) {
        return this.request(`/api/models/${modelId}/use`, {
            method: 'POST'
        });
    },
    
    // 任务相关API
    async getTasks() {
        return this.request('/api/tasks');
    },
    
    // 素材相关API
    async getAssets() {
        return this.request('/api/assets');
    },
    
    async deleteAsset(assetId) {
        return this.request(`/api/assets/${assetId}`, {
            method: 'DELETE'
        });
    }
};

// 测试套件
describe('API模块测试', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe('基础请求', () => {
        test('request应该正确调用fetch', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            const result = await API.request('/api/test');
            expect(fetch).toHaveBeenCalledWith('/api/test', {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(result).toEqual({ success: true });
        });

        test('request应该在HTTP错误时抛出异常', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(API.request('/api/test')).rejects.toThrow('HTTP error! status: 404');
        });
    });

    describe('生成相关API', () => {
        test('generate应该发送POST请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: { clientId: '123' } })
            });

            const data = { prompt: 'test', model_detail_list: [] };
            await API.generate(data);

            expect(fetch).toHaveBeenCalledWith('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        });

        test('getTaskStatus应该发送GET请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: { status: 'succeed' } })
            });

            await API.getTaskStatus('123');

            expect(fetch).toHaveBeenCalledWith('/api/tasks/123', {
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe('模型相关API', () => {
        test('syncModels应该发送POST请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: [] })
            });

            await API.syncModels();

            expect(fetch).toHaveBeenCalledWith('/api/models/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        });

        test('getModels应该发送GET请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: [] })
            });

            await API.getModels();

            expect(fetch).toHaveBeenCalledWith('/api/models', {
                headers: { 'Content-Type': 'application/json' }
            });
        });

        test('getModelDetail应该发送GET请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: { id: 1 } })
            });

            await API.getModelDetail(1);

            expect(fetch).toHaveBeenCalledWith('/api/models/1', {
                headers: { 'Content-Type': 'application/json' }
            });
        });

        test('togglePinModel应该发送POST请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            await API.togglePinModel(1, true);

            expect(fetch).toHaveBeenCalledWith('/api/models/1/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPinned: true })
            });
        });

        test('toggleHiddenModel应该发送POST请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            await API.toggleHiddenModel(1, true);

            expect(fetch).toHaveBeenCalledWith('/api/models/1/hidden', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isHidden: true })
            });
        });

        test('useModel应该发送POST请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            await API.useModel(1);

            expect(fetch).toHaveBeenCalledWith('/api/models/1/use', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe('任务相关API', () => {
        test('getTasks应该发送GET请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: [] })
            });

            await API.getTasks();

            expect(fetch).toHaveBeenCalledWith('/api/tasks', {
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe('素材相关API', () => {
        test('getAssets应该发送GET请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: [] })
            });

            await API.getAssets();

            expect(fetch).toHaveBeenCalledWith('/api/assets', {
                headers: { 'Content-Type': 'application/json' }
            });
        });

        test('deleteAsset应该发送DELETE请求', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            await API.deleteAsset(1);

            expect(fetch).toHaveBeenCalledWith('/api/assets/1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });
});

// 导出模块
module.exports = API;
