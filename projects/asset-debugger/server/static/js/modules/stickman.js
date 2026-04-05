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
    
    // 预设姿势
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

    // 打开姿势选择器
    openPoseSelector() {
        // 创建姿势选择弹窗
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
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
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
                    <h3 style="margin: 0; color: #1a73e8;">选择姿势</h3>
                    <button onclick="document.getElementById('poseSelectorModal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>
                <div style="padding: 25px; overflow-y: auto;">
                    <h4 style="margin: 0 0 15px 0; color: #666;">预设姿势</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-bottom: 25px;">
                        ${Object.entries(this.presets).map(([key, name]) => `
                            <button class="btn" style="padding: 10px; background: #e8f0fe; color: #1a73e8; text-align: center;"
                                onclick="Stickman.loadPreset('${key}'); document.getElementById('poseSelectorModal').remove();">
                                ${name}
                            </button>
                        `).join('')}
                    </div>
                    
                    ${savedPoses.length > 0 ? `
                        <h4 style="margin: 0 0 15px 0; color: #666;">已保存的姿势</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">
                            ${savedPoses.map(pose => `
                                <button class="btn" style="padding: 10px; background: #f0f0f0; color: #333; text-align: center;"
                                    onclick="Stickman.loadSavedPose(${pose.id}); document.getElementById('poseSelectorModal').remove();">
                                    ${pose.name}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
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
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stickman;
}
