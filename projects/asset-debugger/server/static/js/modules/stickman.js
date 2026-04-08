/**
 * 火柴人编辑器模块
 * 处理火柴人姿势的绘制和编辑
 */
const Stickman = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    currentTool: 'draw',
    strokes: [],
    currentStroke: [],

    // CDN基础地址
    CDN_BASE: 'https://pino-img.yingzhongshare.com',

    // 官方预设姿势库（从HoloPix平台提取）
    officialPoses: [
        { id: 1, name: '姿势 1', previewUrl: 'posePreview/7/1.png', poseUrl: 'pose/7/1.jpg', type: 'official' },
        { id: 2, name: '姿势 2', previewUrl: 'posePreview/7/2.png', poseUrl: 'pose/7/2.jpg', type: 'official' },
        { id: 3, name: '姿势 3', previewUrl: 'posePreview/7/3.png', poseUrl: 'pose/7/3.jpg', type: 'official' },
        { id: 4, name: '姿势 4', previewUrl: 'posePreview/7/4.png', poseUrl: 'pose/7/4.jpg', type: 'official' },
        { id: 5, name: '姿势 5', previewUrl: 'posePreview/7/5.png', poseUrl: 'pose/7/5.jpg', type: 'official' },
        { id: 6, name: '姿势 6', previewUrl: 'posePreview/7/6.png', poseUrl: 'pose/7/6.jpg', type: 'official' },
        { id: 7, name: '姿势 7', previewUrl: 'posePreview/7/7.png', poseUrl: 'pose/7/7.jpg', type: 'official' },
        { id: 8, name: '姿势 8', previewUrl: 'posePreview/7/8.png', poseUrl: 'pose/7/8.jpg', type: 'official' }
    ],

    // 本地绘制预设（代码生成的基本火柴人）
    presets: {
        'standing': '站立姿势',
        'walking': '行走姿势',
        'running': '奔跑姿势',
        'sitting': '坐姿',
        'jumping': '跳跃姿势',
        'fighting': '战斗姿势'
    },

    init() {
        this.canvas = document.getElementById('stickmanCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.bindEvents();
        this.clearCanvas();
    },

    bindEvents() {
        if (!this.canvas) return;

        // 鼠标/触摸事件
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // 触摸事件支持
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // 工具栏按钮
        const clearBtn = document.querySelector('[data-action="clearCanvas"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCanvas());
        }

        const saveBtn = document.querySelector('[data-action="savePose"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePose());
        }

        const exportBtn = document.querySelector('[data-action="exportPose"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPose());
        }

        const poseSelectorBtn = document.querySelector('[data-action="openPoseSelector"]');
        if (poseSelectorBtn) {
            poseSelectorBtn.addEventListener('click', () => this.openPoseSelector());
        }
    },

    // 获取鼠标/触摸位置
    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },

    // 开始绘制
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getPos(e);
        this.currentStroke = [pos];
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    },

    // 绘制
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getPos(e);
        this.currentStroke.push(pos);
        
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    },

    // 停止绘制
    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        
        if (this.currentStroke.length > 0) {
            this.strokes.push([...this.currentStroke]);
            this.currentStroke = [];
        }
    },

    // 清空画布
    clearCanvas() {
        if (!this.ctx) return;
        
        // 填充深色背景
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 清空笔画记录
        this.strokes = [];
        this.currentStroke = [];
    },

    // 绘制网格
    drawGrid() {
        this.ctx.strokeStyle = '#3d3d3d';
        this.ctx.lineWidth = 1;
        
        const gridSize = 32;
        
        // 垂直线
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    },

    // 保存姿势到localStorage
    savePose() {
        if (this.strokes.length === 0) {
            alert('请先绘制姿势');
            return;
        }

        const poseName = prompt('请输入姿势名称:', '自定义姿势');
        if (!poseName) return;

        const poses = JSON.parse(localStorage.getItem('holopix_stickman_poses') || '[]');
        poses.push({
            id: Date.now(),
            name: poseName,
            strokes: this.strokes,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('holopix_stickman_poses', JSON.stringify(poses));
        alert('姿势已保存！');
    },

    // 导出姿势为PNG
    exportPose() {
        if (!this.canvas) return;

        // 创建临时链接
        const link = document.createElement('a');
        link.download = `stickman_pose_${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 同时更新characterPose输入框
        const characterPoseInput = document.getElementById('characterPose');
        if (characterPoseInput) {
            characterPoseInput.value = this.canvas.toDataURL('image/png');
        }
    },

    // 加载预设姿势
    loadPreset(presetName) {
        this.clearCanvas();
        
        // 根据预设名称绘制基本姿势
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        switch (presetName) {
            case 'standing':
                this.drawStandingPose(centerX, centerY);
                break;
            case 'walking':
                this.drawWalkingPose(centerX, centerY);
                break;
            case 'running':
                this.drawRunningPose(centerX, centerY);
                break;
            case 'sitting':
                this.drawSittingPose(centerX, centerY);
                break;
            case 'jumping':
                this.drawJumpingPose(centerX, centerY);
                break;
            case 'fighting':
                this.drawFightingPose(centerX, centerY);
                break;
        }
    },

    // 绘制站立姿势
    drawStandingPose(x, y) {
        // 头
        this.drawCircle(x, y - 80, 20);
        // 身体
        this.drawLine(x, y - 60, x, y + 20);
        // 手臂
        this.drawLine(x, y - 40, x - 30, y + 10);
        this.drawLine(x, y - 40, x + 30, y + 10);
        // 腿
        this.drawLine(x, y + 20, x - 25, y + 100);
        this.drawLine(x, y + 20, x + 25, y + 100);
    },

    // 绘制行走姿势
    drawWalkingPose(x, y) {
        // 头
        this.drawCircle(x, y - 80, 20);
        // 身体
        this.drawLine(x, y - 60, x, y + 20);
        // 手臂（摆动）
        this.drawLine(x, y - 40, x - 35, y - 10);
        this.drawLine(x, y - 40, x + 35, y - 10);
        // 腿（一前一后）
        this.drawLine(x, y + 20, x - 30, y + 80);
        this.drawLine(x - 30, y + 80, x - 40, y + 100);
        this.drawLine(x, y + 20, x + 30, y + 70);
        this.drawLine(x + 30, y + 70, x + 40, y + 100);
    },

    // 绘制奔跑姿势
    drawRunningPose(x, y) {
        // 头
        this.drawCircle(x, y - 90, 20);
        // 身体（前倾）
        this.drawLine(x, y - 70, x + 10, y + 10);
        // 手臂（大幅摆动）
        this.drawLine(x + 5, y - 50, x - 40, y - 80);
        this.drawLine(x + 5, y - 50, x + 45, y - 20);
        // 腿（大步）
        this.drawLine(x + 10, y + 10, x - 20, y + 60);
        this.drawLine(x - 20, y + 60, x - 30, y + 100);
        this.drawLine(x + 10, y + 10, x + 40, y + 50);
        this.drawLine(x + 40, y + 50, x + 50, y + 90);
    },

    // 绘制坐姿
    drawSittingPose(x, y) {
        // 头
        this.drawCircle(x, y - 60, 20);
        // 身体
        this.drawLine(x, y - 40, x, y + 20);
        // 手臂
        this.drawLine(x, y - 30, x - 25, y + 10);
        this.drawLine(x, y - 30, x + 25, y + 10);
        // 腿（弯曲）
        this.drawLine(x, y + 20, x - 20, y + 50);
        this.drawLine(x - 20, y + 50, x - 30, y + 80);
        this.drawLine(x, y + 20, x + 20, y + 50);
        this.drawLine(x + 20, y + 50, x + 30, y + 80);
    },

    // 绘制跳跃姿势
    drawJumpingPose(x, y) {
        // 头
        this.drawCircle(x, y - 100, 20);
        // 身体
        this.drawLine(x, y - 80, x, y - 20);
        // 手臂（上举）
        this.drawLine(x, y - 60, x - 35, y - 100);
        this.drawLine(x, y - 60, x + 35, y - 100);
        // 腿（弯曲）
        this.drawLine(x, y - 20, x - 25, y + 10);
        this.drawLine(x - 25, y + 10, x - 30, y + 30);
        this.drawLine(x, y - 20, x + 25, y + 10);
        this.drawLine(x + 25, y + 10, x + 30, y + 30);
    },

    // 绘制战斗姿势
    drawFightingPose(x, y) {
        // 头
        this.drawCircle(x, y - 80, 20);
        // 身体
        this.drawLine(x, y - 60, x, y + 20);
        // 手臂（防御姿态）
        this.drawLine(x, y - 40, x - 30, y - 60);
        this.drawLine(x - 30, y - 60, x - 40, y - 40);
        this.drawLine(x, y - 40, x + 35, y - 30);
        this.drawLine(x + 35, y - 30, x + 50, y - 50);
        // 腿（马步）
        this.drawLine(x, y + 20, x - 30, y + 60);
        this.drawLine(x - 30, y + 60, x - 35, y + 100);
        this.drawLine(x, y + 20, x + 30, y + 60);
        this.drawLine(x + 30, y + 60, x + 35, y + 100);
    },

    // 绘制线条
    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    },

    // 绘制圆形
    drawCircle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    },

    // 打开姿势选择器（集成官方姿势库）
    openPoseSelector() {
        const modal = document.createElement('div');
        modal.id = 'poseSelectorModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const savedPoses = JSON.parse(localStorage.getItem('holopix_stickman_poses') || '[]');

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                max-width: 800px;
                width: 100%;
                max-height: 85vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div style="
                    padding: 20px 25px;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8f9fa;
                ">
                    <h3 style="margin: 0; color: #1a73e8;">🎭 选择火柴人姿势</h3>
                    <button onclick="document.getElementById('poseSelectorModal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>
                <div style="padding: 25px; overflow-y: auto; flex: 1;">
                    <!-- 官方预设姿势 -->
                    <h4 style="margin: 0 0 15px 0; color: #333; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                        <span style="background: #1a73e8; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">官方</span>
                        HoloPix 官方预设姿势（共${this.officialPoses.length}个）
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px;">
                        ${this.officialPoses.map(pose => `
                            <div style="
                                cursor: pointer;
                                border: 2px solid #e0e0e0;
                                border-radius: 8px;
                                padding: 10px;
                                text-align: center;
                                transition: all 0.2s;
                                background: white;
                            "
                                 onmouseover="this.style.borderColor='#1a73e8'; this.style.background='#f8f0ff'"
                                 onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='white'"
                                 onclick="Stickman.selectOfficialPose(${pose.id})">
                                <img src="${this.CDN_BASE}/${pose.previewUrl}?imageView2/2/w/160/q/90/format/webp"
                                     style="width: 100%; height: 120px; object-fit: contain; background: #000; border-radius: 4px; margin-bottom: 8px;"
                                     onerror="this.parentElement.style.display='none'"
                                     alt="${pose.name}">
                                <div style="font-weight: 500; font-size: 13px; color: #333;">${pose.name}</div>
                                <div style="font-size: 11px; color: #999; margin-top: 4px;">点击选择</div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- 本地绘制预设 -->
                    <h4 style="margin: 0 0 15px 0; color: #333; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                        <span style="background: #34a853; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">绘制</span>
                        基本预设动作（代码生成）
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 30px;">
                        ${Object.entries(this.presets).map(([key, name]) => `
                            <button class="btn" style="padding: 12px; background: #e8f0fe; color: #1a73e8; text-align: center; font-weight: 500;"
                                onclick="Stickman.loadPreset('${key}'); document.getElementById('poseSelectorModal').remove(); Stickman.updateCharacterPoseFromCanvas();">
                                🎨 ${name}
                            </button>
                        `).join('')}
                    </div>

                    <!-- 用户自定义姿势 -->
                    ${savedPoses.length > 0 ? `
                        <h4 style="margin: 0 0 15px 0; color: #333; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                            <span style="background: #ea4335; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">自定义</span>
                            我保存的姿势（共${savedPoses.length}个）
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            ${savedPoses.map(pose => `
                                <button class="btn" style="padding: 12px; background: #f0f0f0; color: #333; text-align: center;"
                                    onclick="Stickman.loadSavedPose(${pose.id}); document.getElementById('poseSelectorModal').remove(); Stickman.updateCharacterPoseFromCanvas();">
                                    ✏️ ${pose.name}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div style="
                    padding: 15px 25px;
                    border-top: 1px solid #e0e0e0;
                    background: #f8f9fa;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="font-size: 12px; color: #666;">
                        💡 提示：官方姿势会直接使用纯火柴人骨架图，本地绘制会导出为PNG
                    </div>
                    <button class="btn" style="background: #666; color: white;" onclick="document.getElementById('poseSelectorModal').remove()">
                        关闭
                    </button>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    },

    // 选择官方姿势（核心修复：填入纯火柴人骨架图URL）
    selectOfficialPose(poseId) {
        const pose = this.officialPoses.find(p => p.id === poseId);
        if (!pose) {
            alert('姿势不存在');
            return;
        }

        // 构建完整的纯火柴人骨架图URL
        // 使用相对路径格式：/pose/7/{id}.jpg
        const poseImageUrl = `/${pose.poseUrl}`;

        // 设置到characterPose输入框
        const characterPoseInput = document.getElementById('characterPose');
        if (characterPoseInput) {
            characterPoseInput.value = poseImageUrl;
            console.log(`✅ 已设置纯火柴人骨架图URL: ${poseImageUrl}`);
        }

        // 显示选中状态提示
        this.showPoseSelectedNotification(pose.name, poseImageUrl);

        // 关闭弹窗
        const modal = document.getElementById('poseSelectorModal');
        if (modal) {
            modal.remove();
        }
    },

    // 显示选中通知
    showPoseSelectedNotification(poseName, imageUrl) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #34a853;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            font-size: 14px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">✅ 已选择姿势</div>
            <div style="font-size: 13px; opacity: 0.9;">${poseName}</div>
            <div style="font-size: 11px; opacity: 0.7; margin-top: 5px; word-break: break-all;">${imageUrl}</div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // 从Canvas更新characterPose（用于本地绘制的姿势）
    updateCharacterPoseFromCanvas() {
        if (!this.canvas) return;

        const characterPoseInput = document.getElementById('characterPose');
        if (characterPoseInput) {
            characterPoseInput.value = this.canvas.toDataURL('image/png');
            console.log('✅ 已从Canvas导出姿势图到characterPose');
        }
    },

    // 加载保存的姿势
    loadSavedPose(poseId) {
        const poses = JSON.parse(localStorage.getItem('holopix_stickman_poses') || '[]');
        const pose = poses.find(p => p.id === poseId);
        
        if (!pose) {
            alert('姿势不存在');
            return;
        }

        this.clearCanvas();
        
        // 重绘保存的笔画
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        pose.strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            this.ctx.beginPath();
            this.ctx.moveTo(stroke[0].x, stroke[0].y);
            
            for (let i = 1; i < stroke.length; i++) {
                this.ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            
            this.ctx.stroke();
        });

        // 更新strokes数组
        this.strokes = pose.strokes;
    },

    // ==================== 自定义姿势管理功能（与index.html对齐）====================

    currentFilter: 'all',  // 当前筛选状态: all/official/custom

    // 保存自定义姿势（增强版：保存缩略图和完整数据）
    saveCustomPose() {
        if (this.strokes.length === 0) {
            alert('请先在画布上绘制姿势');
            return;
        }

        const poseName = prompt('请输入姿势名称:', `自定义姿势_${Date.now()}`);
        if (!poseName) return;

        const poseData = {
            id: Date.now(),
            name: poseName,
            action_type: 'custom',
            strokes: JSON.parse(JSON.stringify(this.strokes)),  // 深拷贝
            thumbnail: this.canvas.toDataURL('image/png'),
            timestamp: new Date().toISOString(),
            is_preset: false
        };

        try {
            const poses = JSON.parse(localStorage.getItem('holopix_stickman_poses') || '[]');
            poses.push(poseData);
            localStorage.setItem('holopix_stickman_poses', JSON.stringify(poses));

            console.log('✅ 姿势已保存:', poseName, 'ID:', poseData.id);
            alert(`✅ 姿势"${poseName}"已保存！`);

            // 刷新列表
            this.refreshPoseList();
        } catch (error) {
            console.error('❌ 保存失败:', error);
            alert('保存失败: ' + error.message);
        }
    },

    // 刷新姿势列表（合并官方+自定义）
    refreshPoseList() {
        let allPoses = [];

        // 添加官方预设（如果当前筛选允许）
        if (this.currentFilter === 'all' || this.currentFilter === 'official') {
            allPoses = [...this.officialPoses];
        }

        // 添加用户自定义姿势（如果当前筛选允许）
        if (this.currentFilter === 'all' || this.currentFilter === 'custom') {
            const customPoses = JSON.parse(localStorage.getItem('holopix_stickman_poses') || '[]');
            allPoses = [...allPoses, ...customPoses];
        }

        this.renderPoseList(allPoses);
    },

    // 渲染姿势列表UI（带缩略图、删除按钮）
    renderPoseList(poses) {
        const container = document.getElementById('poseList');
        if (!container) return;

        if (poses.length === 0) {
            container.innerHTML = `
                <div style="color: #999; text-align: center; padding: 40px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                    <div>暂无姿势</div>
                </div>
            `;
            return;
        }

        let html = '';
        poses.forEach(pose => {
            const isOfficial = pose.type === 'official';
            const icon = isOfficial ? '⭐' : '💾';
            const badgeColor = isOfficial ? '#1a73e8' : '#ea4335';
            const badgeText = isOfficial ? '官方' : '自定义';

            // 获取缩略图URL
            let thumbUrl = '';
            if (isOfficial) {
                thumbUrl = `${this.CDN_BASE}/${pose.previewUrl}?imageView2/2/w/50/q/90`;
            } else if (pose.thumbnail) {
                thumbUrl = pose.thumbnail;
            }

            html += `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                    transition: background 0.2s;
                "
                     onmouseover="this.style.background='#f8f9fa'"
                     onmouseout="this.style.background='white'"
                     onclick="${isOfficial ? `Stickman.selectOfficialPose(${pose.id})` : `Stickman.loadCustomPose(${pose.id})`}">
                    ${thumbUrl ?
                        `<img src="${thumbUrl}"
                             style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; background: #000;"
                             onerror="this.style.display='none'"
                             alt="${pose.name}">` :
                        `<div style="width: 50px; height: 50px; background: #000; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">${icon}</div>`
                    }
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${icon} ${pose.name}
                        </div>
                        <div style="display: flex; gap: 6px; margin-top: 4px;">
                            <span style="
                                font-size: 11px;
                                color: white;
                                background: ${badgeColor};
                                padding: 1px 6px;
                                border-radius: 3px;
                            ">${badgeText}</span>
                            <span style="font-size: 11px; color: #999;">${pose.action_type || 'preset'}</span>
                        </div>
                    </div>
                    ${!isOfficial ?
                        `<button onclick="event.stopPropagation(); Stickman.deleteCustomPose(${pose.id})"
                                 style="background: #ea4335; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background 0.2s;"
                                 onmouseover="this.style.background='#d33426'"
                                 onmouseout="this.style.background='#ea4335'">
                            🗑️ 删除
                        </button>` :
                        ''
                    }
                </div>
            `;
        });

        container.innerHTML = html;
        console.log(`✅ 已渲染${poses.length}个姿势项`);
    },

    // 加载自定义姿势到Canvas
    loadCustomPose(poseId) {
        const poses = JSON.parse(localStorage.getItem('holopix_stickman_poses') || '[]');
        const pose = poses.find(p => p.id === poseId);

        if (!pose) {
            alert('姿势不存在或已被删除');
            this.refreshPoseList();
            return;
        }

        this.clearCanvas();

        // 重绘保存的笔画
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (pose.strokes && Array.isArray(pose.strokes)) {
            pose.strokes.forEach(stroke => {
                if (!Array.isArray(stroke) || stroke.length < 2) return;

                this.ctx.beginPath();
                this.ctx.moveTo(stroke[0].x, stroke[0].y);

                for (let i = 1; i < stroke.length; i++) {
                    this.ctx.lineTo(stroke[i].x, stroke[i].y);
                }

                this.ctx.stroke();
            });
        }

        // 更新strokes数组
        this.strokes = pose.strokes;

        console.log(`✅ 已加载自定义姿势: ${pose.name}`);
        alert(`✅ 已加载姿势: ${pose.name}`);

        // 自动更新characterPose
        this.updateCharacterPoseFromCanvas();
    },

    // 删除自定义姿势
    deleteCustomPose(poseId) {
        if (!confirm('确定要删除这个自定义姿势吗？此操作不可恢复。')) return;

        try {
            const poses = JSON.parse(localStorage.getItem('holopix_stickman_poses') || '[]');
            const updatedPoses = poses.filter(p => p.id !== poseId);

            if (updatedPoses.length === poses.length) {
                alert('姿势不存在');
                return;
            }

            localStorage.setItem('holopix_stickman_poses', JSON.stringify(updatedPoses));

            console.log('✅ 已删除姿势 ID:', poseId);
            alert('✅ 姿势已删除');

            // 刷新列表
            this.refreshPoseList();
        } catch (error) {
            console.error('❌ 删除失败:', error);
            alert('删除失败: ' + error.message);
        }
    },

    // 筛选姿势
    filterPoses(filter) {
        this.currentFilter = filter;

        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.getElementById(`filter-${filter}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        console.log('📂 筛选条件:', filter);

        // 重新渲染列表
        this.refreshPoseList();
    },

    // 用于文生图生成（将当前Canvas内容填入characterPose）
    useInGeneration() {
        if (!this.canvas) {
            alert('请先绘制或选择一个姿势');
            return;
        }

        if (this.strokes.length === 0) {
            alert('当前画布为空，请先绘制或加载一个姿势');
            return;
        }

        // 导出为DataURL并设置到characterPose
        this.updateCharacterPoseFromCanvas();

        const characterPoseInput = document.getElementById('characterPose');
        if (characterPoseInput && characterPoseInput.value) {
            console.log('✅ 姿势已用于文生图生成');

            // 显示成功提示
            this.showNotification(
                '🎨 用于文生图',
                '当前姿势已设置到"角色姿态参考"字段，可以开始生成图片了！',
                '#1a73e8'
            );

            // 可选：切换到生成标签页
            setTimeout(() => {
                const generateTab = document.querySelector('[data-tab="generate"]');
                if (generateTab) {
                    generateTab.click();
                }
            }, 1500);
        } else {
            alert('设置失败，请重试');
        }
    },

    // 通用通知提示（复用）
    showNotification(title, message, color = '#34a853') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            font-size: 14px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">${title}</div>
            <div style="font-size: 13px; opacity: 0.9;">${message}</div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // 初始化时自动加载列表
    init() {
        this.canvas = document.getElementById('stickmanCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.bindEvents();
        this.clearCanvas();

        // 自动加载姿势列表
        setTimeout(() => {
            this.refreshPoseList();
        }, 100);
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stickman;
}
