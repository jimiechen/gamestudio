// 标签页管理模块

import { loadModels } from './models.js';
import { loadTasks } from './tasks.js';
import { loadAssets } from './assets.js';

/**
 * 切换标签页
 * @param {string} tabName - 标签页名称
 */
export function switchTab(tabName) {
    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 移除所有标签页激活状态
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // 显示目标标签页
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // 激活对应标签
    const targetTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // 根据标签页加载对应数据
    switch (tabName) {
        case 'models':
            loadModels();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'assets':
            loadAssets();
            break;
    }
}

/**
 * 初始化标签页
 */
export function initTabs() {
    // 标签页点击事件已通过事件委托处理
    // 这里可以添加其他初始化逻辑
}
