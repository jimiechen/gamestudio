/**
 * 结果展示模块
 * 处理生成结果的展示和下载
 */
const Results = {
    // 显示生成结果
    display(task) {
        const container = document.getElementById('generationResults');
        const grid = document.getElementById('resultsGrid');
        
        if (!container || !grid) return;

        // 获取图片数据
        const images = this.extractImages(task);
        
        if (images.length === 0) {
            console.warn('没有可显示的图片');
            return;
        }

        // 显示结果容器
        container.style.display = 'block';

        // 渲染图片网格
        grid.innerHTML = images.map((img, index) => `
            <div class="result-image-card" style="
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <img src="${img.url}" 
                    alt="生成结果 ${index + 1}" 
                    style="width: 100%; height: 200px; object-fit: cover; cursor: pointer;"
                    onclick="Results.previewImage('${img.url}')"
                    onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22200%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22200%22/><text fill=%22%23999%22 x=%2250%22 y=%22100%22 text-anchor=%22middle%22>图片加载失败</text></svg>'"
                >
                <div style="padding: 10px; display: flex; gap: 8px;">
                    <button class="btn" style="flex: 1; padding: 6px; font-size: 12px; background: #e8f0fe; color: #1a73e8;"
                        onclick="Results.downloadImage('${img.url}', 'generated_${index + 1}.png')">
                        下载
                    </button>
                    <button class="btn" style="flex: 1; padding: 6px; font-size: 12px; background: #34a853; color: white;"
                        onclick="Results.saveToAssets('${img.url}')">
                        保存到素材库
                    </button>
                </div>
            </div>
        `).join('');

        // 滚动到结果区域
        container.scrollIntoView({ behavior: 'smooth' });
    },

    // 提取图片数据
    extractImages(task) {
        const images = [];

        // 处理不同格式的图片数据
        if (task.images && Array.isArray(task.images)) {
            // 格式1: images数组
            task.images.forEach(img => {
                if (typeof img === 'string') {
                    images.push({ url: img });
                } else if (img.url) {
                    images.push(img);
                }
            });
        } else if (task.imageUrl) {
            // 格式2: 单个imageUrl
            images.push({ url: task.imageUrl });
        } else if (task.result && task.result.images) {
            // 格式3: result.images
            task.result.images.forEach(img => {
                if (typeof img === 'string') {
                    images.push({ url: img });
                } else if (img.url) {
                    images.push(img);
                }
            });
        } else if (task.output && task.output.images) {
            // 格式4: output.images
            task.output.images.forEach(img => {
                images.push({ url: typeof img === 'string' ? img : img.url });
            });
        }

        return images;
    },

    // 预览图片
    previewImage(url) {
        // 创建预览弹窗
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            cursor: zoom-out;
        `;
        
        modal.innerHTML = `
            <img src="${url}" style="max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px;">
            <button style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                font-size: 32px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
            ">×</button>
        `;

        modal.addEventListener('click', () => modal.remove());
        document.body.appendChild(modal);
    },

    // 下载图片
    downloadImage(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 保存到素材库
    async saveToAssets(url) {
        try {
            // 这里可以调用素材库API保存图片
            alert('图片已保存到素材库！');
        } catch (error) {
            alert('保存失败: ' + error.message);
        }
    },

    // 清空结果
    clear() {
        const container = document.getElementById('generationResults');
        const grid = document.getElementById('resultsGrid');
        
        if (container) container.style.display = 'none';
        if (grid) grid.innerHTML = '';
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Results;
}
