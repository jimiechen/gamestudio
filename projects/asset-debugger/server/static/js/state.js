// 集中状态管理模块

// 模型相关状态
export let allModels = [];
export let currentFilter = 'all';
export let activeFilters = {
    modelType: '',
    styleType: '',
    baseModel: '',
    modelTags: '',
    searchName: '',
    modelIds: ''
};
export let modelListSelectedModels = new Map();

// 生成相关状态
export let selectedModels = [{ modelId: 2, strength: 0.9 }];

// 预设模型组合
export const presetModelCombos = {
    'q版卡通人物': {
        icon: '👧',
        models: [
            { modelId: '23v56pjLui', name: 'Q版基础模型', strength: 0.9 },
            { modelId: '2BB56NBV2F', name: '卡通渲染风格', strength: 0.8 },
            { modelId: 'iKXx6k89s3', name: '萌系表情增强', strength: 0.7 }
        ]
    },
    '中国风场景': {
        icon: '🏯',
        models: [
            { modelId: 'c3P5zkc92s', name: '水墨画风格', strength: 0.9 },
            { modelId: 'L3W5F7EE2P', name: '古建筑元素', strength: 0.8 },
            { modelId: '2KJ5GG8CC3', name: '山水意境', strength: 0.7 }
        ]
    },
    '写实风格': {
        icon: '📸',
        models: [
            { modelId: 'x3P5zkc92s', name: '写实基础模型', strength: 0.9 },
            { modelId: 'M3W5F7EE2P', name: '光影增强', strength: 0.8 },
            { modelId: '5KJ5GG8CC3', name: '细节增强', strength: 0.7 }
        ]
    },
    '二次元风格': {
        icon: '🎌',
        models: [
            { modelId: 'a3P5zkc92s', name: '日漫基础模型', strength: 0.9 },
            { modelId: 'N3W5F7EE2P', name: '赛璐珞风格', strength: 0.8 },
            { modelId: '6KJ5GG8CC3', name: '眼睛增强', strength: 0.7 }
        ]
    }
};

// 状态更新函数
export function setAllModels(models) {
    allModels = models;
}

export function setCurrentFilter(filter) {
    currentFilter = filter;
}

export function setActiveFilters(filters) {
    activeFilters = { ...activeFilters, ...filters };
}

export function resetActiveFilters() {
    activeFilters = {
        modelType: '',
        styleType: '',
        baseModel: '',
        modelTags: '',
        searchName: '',
        modelIds: ''
    };
}

export function setModelListSelectedModels(models) {
    modelListSelectedModels = models;
}

export function setSelectedModels(models) {
    selectedModels = models;
}

export function updateSelectedModelStrength(index, value) {
    if (selectedModels[index]) {
        selectedModels[index].strength = parseFloat(value);
    }
}

export function addSelectedModel(model) {
    selectedModels.push(model);
}

export function removeSelectedModel(index) {
    selectedModels.splice(index, 1);
}

export function clearSelectedModels() {
    selectedModels = [];
}
