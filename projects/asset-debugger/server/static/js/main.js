// 主入口模块

import { initEventDelegation, registerHandlers } from './event-delegation.js';
import { switchTab } from './tabs.js';
import {
    loadModels, syncModels, toggleHidden, togglePin, useModel,
    toggleModelDetail, expandAllDetails, collapseAllDetails,
    toggleSelectAllModels, updateModelSelection, clearAllModelSelection,
    openMultiModelGenerateModal, submitMultiModelGenerate,
    updateFilter, applyNameSearch, applyModelIdFilter, clearAllFilters
} from './models.js';
import {
    generateImage, renderSelectedModels, renderPresetModelComboButtons,
    updateModelStrength, removeModel, openModelSelector, closeModelSelector,
    addModel, toggleHdScale, togglePerturb, applyPresetModelCombo,
    filterModelList
} from './generate.js';
import { loadTasks, viewTaskDetail, copyTaskParams, queryTask, downloadTask } from './tasks.js';
import { loadAssets, deleteAsset } from './assets.js';
import {
    stickmanEditor, openStickmanPoseModal, selectStickmanPose, clearStickmanPose
} from './stickman.js';
import {
    loadQuickPresets, saveQuickPreset, openQuickPresetModal, closeQuickPresetModal,
    applyQuickPreset, togglePresetFavorite, deleteQuickPreset
} from './quick-presets.js';
import { GenerationPoller } from './poller.js';
import { showImagePreview } from './utils.js';

// 将需要被动态 HTML 调用的函数挂载到 window
window.switchTab = switchTab;

// 模型管理
window.loadModels = loadModels;
window.syncModels = syncModels;
window.toggleHidden = toggleHidden;
window.togglePin = togglePin;
window.useModel = useModel;
window.toggleModelDetail = toggleModelDetail;
window.expandAllDetails = expandAllDetails;
window.collapseAllDetails = collapseAllDetails;
window.toggleSelectAllModels = toggleSelectAllModels;
window.updateModelSelection = updateModelSelection;
window.clearAllModelSelection = clearAllModelSelection;
window.openMultiModelGenerateModal = openMultiModelGenerateModal;
window.submitMultiModelGenerate = submitMultiModelGenerate;
window.updateFilter = updateFilter;
window.applyNameSearch = applyNameSearch;
window.applyModelIdFilter = applyModelIdFilter;
window.clearAllFilters = clearAllFilters;

// 生成素材
window.generateImage = generateImage;
window.renderSelectedModels = renderSelectedModels;
window.renderPresetModelComboButtons = renderPresetModelComboButtons;
window.updateModelStrength = updateModelStrength;
window.removeModel = removeModel;
window.openModelSelector = openModelSelector;
window.closeModelSelector = closeModelSelector;
window.addModel = addModel;
window.toggleHdScale = toggleHdScale;
window.togglePerturb = togglePerturb;
window.applyPresetModelCombo = applyPresetModelCombo;
window.filterModelList = filterModelList;

// 任务管理
window.loadTasks = loadTasks;
window.viewTaskDetail = viewTaskDetail;
window.copyTaskParams = copyTaskParams;
window.queryTask = queryTask;
window.downloadTask = downloadTask;

// 素材库
window.loadAssets = loadAssets;
window.deleteAsset = deleteAsset;

// 火柴人编辑器
window.stickmanEditor = stickmanEditor;
window.openStickmanPoseModal = openStickmanPoseModal;
window.selectStickmanPose = selectStickmanPose;
window.clearStickmanPose = clearStickmanPose;

// 快捷应用
window.loadQuickPresets = loadQuickPresets;
window.saveQuickPreset = saveQuickPreset;
window.openQuickPresetModal = openQuickPresetModal;
window.closeQuickPresetModal = closeQuickPresetModal;
window.applyQuickPreset = applyQuickPreset;
window.togglePresetFavorite = togglePresetFavorite;
window.deleteQuickPreset = deleteQuickPreset;

// 工具函数
window.showImagePreview = showImagePreview;

// 注册静态事件委托处理函数
registerHandlers({
    // 标签页切换
    switchTab: (el) => switchTab(el.dataset.tab),

    // 生成相关
    generateImage: () => generateImage(),
    openModelSelector: () => openModelSelector(),
    saveQuickPreset: () => saveQuickPreset(),
    openQuickPresetModal: () => openQuickPresetModal(),

    // 模型列表相关
    syncModels: () => syncModels(),
    loadModels: () => loadModels(),
    clearAllFilters: () => clearAllFilters(),

    // 任务相关
    loadTasks: () => loadTasks(),

    // 素材库相关
    loadAssets: () => loadAssets(),

    // 火柴人相关
    openStickmanPoseModal: () => openStickmanPoseModal(),
    clearStickmanPose: () => clearStickmanPose(),

    // 预设组合
    applyPresetModelCombo: (el) => applyPresetModelCombo(el.dataset.combo)
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async function () {
    // 初始化事件委托
    initEventDelegation();

    // 初始化各个模块
    loadModels();
    stickmanEditor.init();
    renderSelectedModels();
    renderPresetModelComboButtons();
    loadQuickPresets();

    // 创建全局轮询管理器实例
    window.generationPoller = new GenerationPoller();
    await window.generationPoller.loadHistoryFromDB();

    console.log('HoloPix 素材调试器已初始化');
});
