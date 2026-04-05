/**
 * 页面元素选择器定义
 * 集中管理所有选择器，便于维护
 */

export const Selectors = {
  /* 标签页 */
  tabs: {
    generate: '[data-action="switchTab"][data-tab="generate"]',
    models: '[data-action="switchTab"][data-tab="models"]',
    tasks: '[data-action="switchTab"][data-tab="tasks"]',
    assets: '[data-action="switchTab"][data-tab="assets"]',
    stickman: '[data-action="switchTab"][data-tab="stickman"]',
  },
  
  /* 标签页内容 */
  tabContent: {
    generate: '#generate',
    models: '#models',
    tasks: '#tasks',
    assets: '#assets',
    stickman: '#stickman',
  },
  
  /* 生成素材页 */
  generate: {
    // 快捷应用
    openQuickPreset: '[data-action="openQuickPresetModal"]',
    saveQuickPreset: '[data-action="saveQuickPreset"]',
    quickPresetList: '#quickPresetList',
    
    // 模型配置
    openModelSelector: '[data-action="openModelSelector"]',
    selectedModels: '#selectedModels',
    presetModelCombos: '#presetModelCombos',
    
    // 提示词
    prompt: '#prompt',
    negativePrompt: '#negativePrompt',
    
    // 图像参数
    width: '#width',
    height: '#height',
    steps: '#steps',
    cfgScale: '#cfgScale',
    seed: '#seed',
    batchSize: '#batchSize',
    sampler: '#sampler',
    
    // 高级选项
    hdScale: '#hdScale',
    hrOptions: '#hrOptions',
    hrScale: '#hrScale',
    hrSteps: '#hrSteps',
    hrSampler: '#hrSampler',
    perturb: '#perturb',
    
    // 生成操作
    generateImage: '[data-action="generateImage"]',
    generationProgress: '#generationProgress',
    generationResults: '#generationResults',
    generationHistory: '#generationHistory',
  },
  
  /* 模型列表页 */
  models: {
    syncModels: '[data-action="syncModels"]',
    loadModels: '[data-action="loadModels"]',
    clearAllFilters: '[data-action="clearAllFilters"]',
    filterModelType: '#filterModelType',
    filterStyleType: '#filterStyleType',
    filterBaseModel: '#filterBaseModel',
    filterModelTags: '#filterModelTags',
    searchModelName: '#searchModelName',
    filterModelIds: '#filterModelIds',
    modelListContainer: '#modelListContainer',
    modelSelectionIndicator: '#modelSelectionIndicator',
  },
  
  /* 任务列表页 */
  tasks: {
    loadTasks: '[data-action="loadTasks"]',
    taskListContainer: '#taskListContainer',
  },
  
  /* 素材库页 */
  assets: {
    loadAssets: '[data-action="loadAssets"]',
    assetListContainer: '#assetListContainer',
  },
  
  /* 火柴人调试页 */
  stickman: {
    canvas: '#stickmanCanvas',
    savePose: 'button:has-text("保存姿势")',
    resetPose: 'button:has-text("重置")',
    exportPNG: 'button:has-text("导出PNG")',
    generateDesc: 'button:has-text("生成描述")',
    useInGeneration: 'button:has-text("用于文生图")',
    poseSearch: 'input[placeholder="搜索姿势..."]',
    poseList: '#poseList',
    presetStanding: '[data-preset="standing"]',
    presetWalking: '[data-preset="walking"]',
    presetRunning: '[data-preset="running"]',
    presetSitting: '[data-preset="sitting"]',
    openPoseModal: '[data-action="openStickmanPoseModal"]',
    clearPose: '[data-action="clearStickmanPose"]',
  },
} as const;
