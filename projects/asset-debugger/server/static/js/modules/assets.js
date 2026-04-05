/**
 * 素材库模块
 * 处理素材的展示和管理
 */
const Assets = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // 刷新素材按钮
        const refreshBtn = document.querySelector('[data-action="refreshAssets"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAssets());
        }
    },

    // 加载素材列表
    async loadAssets() {
        try {
            const button = document.querySelector('[data-action="refreshAssets"]');
            if (button) {
                button.disabled = true;
                button.textContent = '🔄 刷新中...';
            }

            const result = await API.getAssets();
            
            if (result.success && result.data) {
                State.set('assets', result.data);
                this.renderAssets();
            } else {
                console.warn('获取素材列表失败:', result.msg);
            }
        } catch (error) {
            console.error('加载素材列表出错:', error);
        } finally {
            const button = document.querySelector('[data-action="refreshAssets"]');
            if (button) {
                button.disabled = false;
                button.textContent = '🔄 刷新';
            }
        }
    },

    // 渲染素材网格
    renderAssets() {
        const container = document.getElementById('assetsGridContainer');
        if (!container) return;

        const assets = State.get('assets') || [];
        
        if (assets.length === 0) {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">暂无素材数据</div>';
            return;
        }

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${assets.map(asset => this.renderAssetCard(asset)).join('')}
            </div>
        `;
    },

    // 渲染素材卡片
    renderAssetCard(asset) {
        const imageUrl = asset.url || asset.imageUrl || asset.path || '';
        const assetId = asset.id || asset.assetId || '';
        
        return `
            <div class="asset-card" style="
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="position: relative; padding-top: 100%; background: #f8f9fa;">
                    <img src="${imageUrl}" 
                        alt="素材" 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; cursor: pointer;"
                        onclick="Assets.previewAsset('${imageUrl}')"
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/><text fill=%22%23999%22 x=%22100%22 y=%22100%22 text-anchor=%22middle%22>图片加载失败</text></svg>'"
                    >
                </div>
                <div style="padding: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${asset.name || '未命名素材'}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn" style="flex: 1; padding: 6px; font-size: 12px; background: #e8f0fe; color: #1a73e8;"
                            onclick="Assets.downloadAsset('${imageUrl}', '${asset.name || 'asset'}.png')">
                            下载
                        </button>
                        <button class="btn" style="flex: 1; padding: 6px; font-size: 12px; background: #ea4335; color: white;"
                            onclick="Assets.deleteAsset('${assetId}')">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // 预览素材
    previewAsset(url) {
        Results.previewImage(url);
    },

    // 下载素材
    downloadAsset(url, filename) {
        Results.downloadImage(url, filename);
    },

    // 删除素材
    async deleteAsset(assetId) {
        if (!confirm('确定要删除这个素材吗？')) {
            return;
        }

        try {
            const result = await API.deleteAsset(assetId);
            
            if (result.success) {
                alert('素材已删除');
                this.loadAssets(); // 刷新列表
            } else {
                alert('删除失败: ' + (result.msg || '未知错误'));
            }
        } catch (error) {
            alert('删除出错: ' + error.message);
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Assets;
}
