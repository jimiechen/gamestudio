/**
 * HoloPix 素材调试器 - 应用入口
 */

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化标签页
    if (typeof Tabs !== 'undefined') {
        Tabs.init();
    }

    // 初始化文生图模块
    if (typeof Generate !== 'undefined') {
        Generate.init();
    }

    // 初始化快捷应用模块
    if (typeof QuickPresets !== 'undefined') {
        QuickPresets.init();
    }

    // 初始化模型模块
    if (typeof Models !== 'undefined') {
        Models.init();
    }

    // 初始化任务列表模块
    if (typeof Tasks !== 'undefined') {
        Tasks.init();
    }

    // 初始化素材库模块
    if (typeof Assets !== 'undefined') {
        Assets.init();
    }

    // 初始化火柴人编辑器模块
    if (typeof Stickman !== 'undefined') {
        Stickman.init();
    }
});
