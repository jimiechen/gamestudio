/**
 * 文生图模块
 * 处理图片生成表单和交互
 */
const Generate = {
    // 预设模型组合（完整版 - 支持多模型叠加）
    presetModelCombos: {
        'q版卡通人物': {
            icon: '👧',
            description: 'Q版基础模型 + 卡通渲染风格 + 萌系表情增强',
            models: [
                { modelId: '23v56pjLui', name: 'Q版基础模型', strength: 0.9 },
                { modelId: '2BB56NBV2F', name: '卡通渲染风格', strength: 0.8 },
                { modelId: 'iKXx6k89s3', name: '萌系表情增强', strength: 0.7 }
            ]
        },
        '中国风场景': {
            icon: '🏯',
            description: '水墨画风格 + 古建筑元素 + 山水意境',
            models: [
                { modelId: 'c3P5zkc92s', name: '水墨画风格', strength: 0.9 },
                { modelId: 'L3W5F7EE2P', name: '古建筑元素', strength: 0.8 },
                { modelId: '2KJ5GG8CC3', name: '山水意境', strength: 0.7 }
            ]
        },
        '3D渲染风格': {
            icon: '🎨',
            description: '3D基础模型 + 渲染增强',
            models: [
                { modelId: 3, name: '3D渲染风格', strength: 0.9 }
            ]
        },
        '动漫风格': {
            icon: '🎌',
            description: '动漫基础 + 线条优化',
            models: [
                { modelId: 4, name: '动漫风格', strength: 0.9 }
            ]
        },
        '写实风格': {
            icon: '📷',
            description: '写实基础 + 细节增强',
            models: [
                { modelId: 5, name: '写实风格', strength: 0.9 }
            ]
        }
    },

    init() {
        this.bindEvents();
        this.renderPresetModelComboButtons();
    },

    bindEvents() {
        // 高清修复开关
        const hdFix = document.getElementById('hdFix');
        if (hdFix) {
            hdFix.addEventListener('change', () => this.toggleHdScale());
        }

        // 画面增强开关
        const enablePerturb = document.getElementById('enablePerturb');
        if (enablePerturb) {
            enablePerturb.addEventListener('change', () => this.togglePerturb());
        }

        // 生成按钮
        const generateBtn = document.querySelector('[data-action="generateImage"]');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateImage());
        }
    },

    // 渲染预设模型组合按钮（增强版 - 显示详细模型信息）
    renderPresetModelComboButtons() {
        const container = document.getElementById('presetModelComboButtons');
        if (!container) return;

        let html = '';
        for (const [comboName, comboData] of Object.entries(this.presetModelCombos)) {
            const modelNames = comboData.models.map(m => m.name).join(' + ');
            const description = comboData.description || modelNames;

            html += `
                <button class="btn" onclick="Generate.applyPresetModelCombo('${comboName}')"
                    style="background: linear-gradient(135deg, #ffcc80 0%, #ffb74d 100%);
                           color: #e65100; font-size: 13px; text-align: left;
                           padding: 12px 16px; border: none; border-radius: 8px;
                           cursor: pointer; transition: all 0.3s; min-width: 200px;
                           box-shadow: 0 2px 4px rgba(230, 81, 0, 0.2);"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(230, 81, 0, 0.3)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(230, 81, 0, 0.2)'">
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                        ${comboData.icon} ${comboName}
                    </div>
                    <div style="font-size: 11px; color: #bf360c; line-height: 1.4; opacity: 0.9;">
                        ${description}
                    </div>
                </button>
            `;
        }
        container.innerHTML = html;
    },

    // 应用预设模型组合（增强版 - 支持参数微调）
    applyPresetModelCombo(comboName) {
        const combo = this.presetModelCombos[comboName];
        if (!combo) {
            alert('预设组合不存在');
            return;
        }

        // 清空当前模型列表
        State.clearSelectedModels();

        // 添加预设模型（带强度参数）
        combo.models.forEach(model => {
            State.addSelectedModel({
                modelId: model.modelId,
                modelName: model.name,
                strength: model.strength
            });
        });

        // 渲染已选模型列表（显示滑块可微调）
        if (typeof Models !== 'undefined') {
            Models.renderSelectedModels();
        }

        // 显示成功提示
        const modelCount = combo.models.length;
        const modelNames = combo.models.map(m => `${m.name}(${m.strength})`).join(', ');
        alert(`✅ 已应用预设: ${comboName}\n\n包含 ${modelCount} 个模型:\n${modelNames}\n\n💡 提示：可通过滑块微调每个模型的强度`);
    },

    toggleHdScale() {
        const hdFix = document.getElementById('hdFix');
        const hdScaleContainer = document.getElementById('hdScaleContainer');
        if (hdFix && hdScaleContainer) {
            hdScaleContainer.style.display = hdFix.checked ? 'block' : 'none';
        }
    },

    togglePerturb() {
        const enablePerturb = document.getElementById('enablePerturb');
        const perturbContainer = document.getElementById('perturbContainer');
        if (enablePerturb && perturbContainer) {
            perturbContainer.style.display = enablePerturb.checked ? 'block' : 'none';
        }
    },

    // 收集表单数据
    collectFormData() {
        const selectedModels = State.get('selectedModels') || [];
        
        // 构建模型列表
        let modelDetailList = [];
        if (selectedModels.length > 0) {
            modelDetailList = selectedModels.map(m => ({
                modelId: parseInt(m.modelId),
                strength: parseFloat(m.strength)
            }));
        } else {
            // 如果没有选择模型，使用默认值
            modelDetailList = [{
                modelId: 2,
                strength: 0.9
            }];
        }

        return {
            model_detail_list: modelDetailList,
            prompt: document.getElementById('prompt')?.value || '',
            negative_prompt: document.getElementById('negativePrompt')?.value || '',
            aspect_ratios: document.getElementById('aspectRatios')?.value || '1:1',
            seed: parseInt(document.getElementById('seed')?.value || '-1'),
            batch_size: parseInt(document.getElementById('batchSize')?.value || '1'),
            image_guidance_weights: parseInt(document.getElementById('imageGuidanceWeights')?.value || '6'),
            face_detail: document.getElementById('faceDetail')?.checked || false,
            hd_fix: document.getElementById('hdFix')?.checked || false,
            hd_scale: parseFloat(document.getElementById('hdScale')?.value || '1.5'),
            simple_background: document.getElementById('simpleBackground')?.checked || false,
            enable_perturb: document.getElementById('enablePerturb')?.checked || false,
            perturb: parseFloat(document.getElementById('perturb')?.value || '5'),
            // 参考图片相关参数
            image_reference: document.getElementById('imageReference')?.value || '',
            reference_mode: document.getElementById('referenceMode')?.value || '',
            reference_weight: parseFloat(document.getElementById('referenceWeight')?.value || '0.8'),
            character_pose: document.getElementById('characterPose')?.value || ''
        };
    },

    // 验证表单
    validateForm(data) {
        if (!data.prompt || data.prompt.trim() === '') {
            alert('请输入正向提示词');
            return false;
        }
        return true;
    },

    // 生成图片
    async generateImage() {
        const data = this.collectFormData();
        
        // 表单验证
        if (!this.validateForm(data)) {
            return;
        }

        try {
            // 显示进度
            this.showProgress();
            
            // 调用API
            const result = await API.generate(data);
            
            if (result.success) {
                // 启动轮询
                Poller.startPolling(result.data.clientId, data);
                
                // 添加到历史
                this.addToHistory(result.data.clientId, data);
                
                alert('生成任务已提交！Client ID: ' + result.data.clientId);
            } else {
                this.hideProgress();
                alert('生成失败: ' + (result.msg || '未知错误'));
            }
        } catch (error) {
            this.hideProgress();
            alert('请求失败: ' + error.message);
        }
    },

    // 显示进度
    showProgress() {
        const progressEl = document.getElementById('generationProgress');
        if (progressEl) {
            progressEl.style.display = 'block';
        }
        
        // 重置进度
        const fillEl = document.getElementById('progressFill');
        if (fillEl) {
            fillEl.style.width = '0%';
        }
        
        const statusEl = document.getElementById('progressStatus');
        if (statusEl) {
            statusEl.textContent = '生成中...';
        }
    },

    // 隐藏进度
    hideProgress() {
        const progressEl = document.getElementById('generationProgress');
        if (progressEl) {
            progressEl.style.display = 'none';
        }
    },

    // 更新进度
    updateProgress(progress, status, elapsedTime) {
        const fillEl = document.getElementById('progressFill');
        if (fillEl) {
            fillEl.style.width = progress + '%';
        }
        
        const statusEl = document.getElementById('progressStatus');
        if (statusEl) {
            statusEl.textContent = status;
        }
        
        const timeEl = document.getElementById('progressTime');
        if (timeEl) {
            timeEl.textContent = `已等待: ${elapsedTime}秒`;
        }
    },

    // 添加到历史
    addToHistory(clientId, params) {
        const history = JSON.parse(localStorage.getItem('holopix_generation_history') || '[]');
        history.unshift({
            clientId,
            params,
            timestamp: new Date().toISOString(),
            status: 'submitted'
        });
        // 只保留最近20条
        if (history.length > 20) {
            history.pop();
        }
        localStorage.setItem('holopix_generation_history', JSON.stringify(history));
        this.renderHistory();
    },

    // 渲染历史
    renderHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;

        const history = JSON.parse(localStorage.getItem('holopix_generation_history') || '[]');
        
        if (history.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">暂无生成任务</p>';
            return;
        }

        container.innerHTML = history.map(item => `
            <div class="history-item" style="
                padding: 15px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <div style="font-weight: 500;">Client ID: ${item.clientId}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        ${new Date(item.timestamp).toLocaleString('zh-CN')}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 2px;">
                        提示词: ${item.params.prompt.substring(0, 50)}...
                    </div>
                </div>
                <span class="status-badge status-${item.status}">${item.status}</span>
            </div>
        `).join('');
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Generate;
}
