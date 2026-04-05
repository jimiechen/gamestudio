/**
 * 标签页模块
 * 处理标签页切换逻辑
 */
const Tabs = {
    init() {
        this.bindEvents();
        // 初始化时确保第一个标签页是激活状态
        const firstTab = document.querySelector('.tab');
        if (firstTab) {
            this.switch(firstTab.dataset.tab);
        }
    },
    
    bindEvents() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switch(tab.dataset.tab));
        });
    },
    
    switch(tabName) {
        if (!tabName) return;
        
        // 移除所有 active
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        
        // 添加 active 到当前
        const content = document.getElementById(tabName);
        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (content) content.classList.add('active');
        if (tab) tab.classList.add('active');
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tabs;
}
