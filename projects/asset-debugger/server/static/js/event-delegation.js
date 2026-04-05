// 事件委托模块 - 解决 ES Module + inline onclick 冲突

/**
 * 初始化事件委托
 * 将静态 HTML 中的 data-action 属性绑定到处理函数
 */
export function initEventDelegation() {
    document.addEventListener('click', handleDelegatedClick);
}

/**
 * 处理委托点击事件
 * @param {MouseEvent} e - 点击事件
 */
function handleDelegatedClick(e) {
    // 查找最近的带有 data-action 属性的元素
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    const actionName = actionEl.dataset.action;
    const handler = window.ActionHandlers?.[actionName];

    if (handler && typeof handler === 'function') {
        handler(actionEl, e);
    } else {
        console.warn(`未找到处理函数: ${actionName}`);
    }
}

/**
 * 处理函数映射表
 * 在 main.js 中填充具体的处理函数
 */
export const ActionHandlers = {};

/**
 * 注册处理函数
 * @param {string} name - 动作名称
 * @param {Function} handler - 处理函数
 */
export function registerHandler(name, handler) {
    if (!window.ActionHandlers) {
        window.ActionHandlers = {};
    }
    window.ActionHandlers[name] = handler;
}

/**
 * 批量注册处理函数
 * @param {Object} handlers - 处理函数对象 { name: handler }
 */
export function registerHandlers(handlers) {
    if (!window.ActionHandlers) {
        window.ActionHandlers = {};
    }
    Object.assign(window.ActionHandlers, handlers);
}
