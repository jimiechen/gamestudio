// 火柴人编辑器模块

import { API } from './api.js';
import { showNotification, escapeHtml } from './utils.js';

// 火柴人编辑器对象
export const stickmanEditor = {
    canvas: null,
    ctx: null,
    joints: {},
    selectedJoint: null,
    isDragging: false,
    poseFilter: '',
    currentPoseId: null,

    // 关节连接定义
    connections: [
        ['head', 'neck'],
        ['neck', 'leftShoulder'],
        ['neck', 'rightShoulder'],
        ['leftShoulder', 'leftElbow'],
        ['leftElbow', 'leftHand'],
        ['rightShoulder', 'rightElbow'],
        ['rightElbow', 'rightHand'],
        ['neck', 'spine'],
        ['spine', 'leftHip'],
        ['spine', 'rightHip'],
        ['leftHip', 'leftKnee'],
        ['leftKnee', 'leftFoot'],
        ['rightHip', 'rightKnee'],
        ['rightKnee', 'rightFoot']
    ],

    /**
     * 初始化编辑器
     */
    init() {
        this.canvas = document.getElementById('stickmanCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 500;

        // 绑定事件
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());

        // 初始化默认姿势
        this.resetPose();
        this.loadPoseList();
        this.initPresets();
    },

    /**
     * 绘制火柴人
     */
    draw() {
        if (!this.ctx) return;

        const ctx = this.ctx;
        const canvas = this.canvas;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制连接线
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        this.connections.forEach(([start, end]) => {
            if (this.joints[start] && this.joints[end]) {
                ctx.beginPath();
                ctx.moveTo(this.joints[start].x, this.joints[start].y);
                ctx.lineTo(this.joints[end].x, this.joints[end].y);
                ctx.stroke();
            }
        });

        // 绘制关节点
        Object.entries(this.joints).forEach(([name, pos]) => {
            ctx.fillStyle = name === this.selectedJoint ? '#1a73e8' : '#666';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // 绘制关节名称
            ctx.fillStyle = '#333';
            ctx.font = '10px sans-serif';
            ctx.fillText(name, pos.x - 15, pos.y - 12);
        });
    },

    /**
     * 获取鼠标位置
     */
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },

    /**
     * 鼠标按下事件
     */
    onMouseDown(e) {
        const pos = this.getMousePos(e);

        // 查找最近的关节
        let nearestJoint = null;
        let minDist = Infinity;

        Object.entries(this.joints).forEach(([name, jointPos]) => {
            const dist = Math.hypot(pos.x - jointPos.x, pos.y - jointPos.y);
            if (dist < minDist && dist < 20) {
                minDist = dist;
                nearestJoint = name;
            }
        });

        if (nearestJoint) {
            this.selectedJoint = nearestJoint;
            this.isDragging = true;
            this.draw();
        }
    },

    /**
     * 鼠标移动事件
     */
    onMouseMove(e) {
        if (!this.isDragging || !this.selectedJoint) return;

        const pos = this.getMousePos(e);
        this.joints[this.selectedJoint] = pos;
        this.draw();
    },

    /**
     * 鼠标释放事件
     */
    onMouseUp() {
        this.isDragging = false;
    },

    /**
     * 重置姿势
     */
    resetPose() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.joints = {
            head: { x: centerX, y: centerY - 100 },
            neck: { x: centerX, y: centerY - 70 },
            leftShoulder: { x: centerX - 40, y: centerY - 60 },
            rightShoulder: { x: centerX + 40, y: centerY - 60 },
            leftElbow: { x: centerX - 60, y: centerY - 20 },
            rightElbow: { x: centerX + 60, y: centerY - 20 },
            leftHand: { x: centerX - 50, y: centerY + 20 },
            rightHand: { x: centerX + 50, y: centerY + 20 },
            spine: { x: centerX, y: centerY },
            leftHip: { x: centerX - 30, y: centerY + 40 },
            rightHip: { x: centerX + 30, y: centerY + 40 },
            leftKnee: { x: centerX - 35, y: centerY + 100 },
            rightKnee: { x: centerX + 35, y: centerY + 100 },
            leftFoot: { x: centerX - 40, y: centerY + 160 },
            rightFoot: { x: centerX + 40, y: centerY + 160 }
        };

        this.currentPoseId = null;
        this.draw();
    },

    /**
     * 加载预设姿势
     */
    loadPreset(presetName) {
        const presets = {
            standing: this.joints, // 默认站立姿势
            walking: {
                // 行走姿势
            },
            running: {
                // 奔跑姿势
            },
            sitting: {
                // 坐姿
            }
        };

        if (presets[presetName]) {
            this.joints = { ...presets[presetName] };
            this.draw();
        }
    },

    /**
     * 保存姿势
     */
    async savePose() {
        const name = prompt('请输入姿势名称:');
        if (!name) return;

        const description = prompt('请输入姿势描述 (可选):') || '';

        try {
            const result = await API.saveStickmanPose({
                name,
                description,
                joints: this.joints
            });

            if (result.success) {
                showNotification('姿势已保存', 'success');
                this.loadPoseList();
            } else {
                showNotification('保存失败: ' + result.error, 'error');
            }
        } catch (error) {
            showNotification('保存失败: ' + error.message, 'error');
        }
    },

    /**
     * 加载姿势列表
     */
    async loadPoseList() {
        try {
            const result = await API.getStickmanPoses(this.poseFilter);
            if (result.success) {
                this.renderPoseList(result.data);
            }
        } catch (error) {
            console.error('加载姿势列表失败:', error);
        }
    },

    /**
     * 渲染姿势列表
     */
    renderPoseList(poses) {
        const container = document.getElementById('poseList');
        if (!container) return;

        if (poses.length === 0) {
            container.innerHTML = '<p style="color: #999;">暂无保存的姿势</p>';
            return;
        }

        container.innerHTML = poses.map(pose => `
            <div class="pose-item ${pose.id === this.currentPoseId ? 'active' : ''}" 
                 onclick="loadPoseById('${pose.id}')">
                <div style="font-weight: 500;">${escapeHtml(pose.name)}</div>
                <div style="font-size: 12px; color: #666;">${escapeHtml(pose.description || '')}</div>
            </div>
        `).join('');
    },

    /**
     * 加载指定姿势
     */
    async loadPoseById(poseId) {
        try {
            const result = await API.getStickmanPoses();
            if (result.success) {
                const pose = result.data.find(p => p.id === poseId);
                if (pose && pose.joints) {
                    this.joints = pose.joints;
                    this.currentPoseId = poseId;
                    this.draw();
                    this.loadPoseList(); // 刷新列表以更新激活状态
                }
            }
        } catch (error) {
            showNotification('加载姿势失败', 'error');
        }
    },

    /**
     * 删除姿势
     */
    async deletePose(poseId) {
        if (!confirm('确定要删除这个姿势吗？')) return;

        try {
            const result = await API.deleteStickmanPose(poseId);
            if (result.success) {
                showNotification('姿势已删除', 'success');
                this.loadPoseList();
            } else {
                showNotification('删除失败: ' + result.error, 'error');
            }
        } catch (error) {
            showNotification('删除失败: ' + error.message, 'error');
        }
    },

    /**
     * 筛选姿势
     */
    filterPoses(filter) {
        this.poseFilter = filter;
        this.loadPoseList();
    },

    /**
     * 导出 PNG
     */
    exportPNG() {
        if (!this.canvas) return;

        const link = document.createElement('a');
        link.download = `stickman_${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    },

    /**
     * 生成描述
     */
    generateDescription() {
        // 基于关节位置生成姿势描述
        const descriptions = [];

        // 分析手臂位置
        const leftArmUp = this.joints.leftHand.y < this.joints.leftShoulder.y;
        const rightArmUp = this.joints.rightHand.y < this.joints.rightShoulder.y;

        if (leftArmUp && rightArmUp) {
            descriptions.push('双臂举起');
        } else if (leftArmUp) {
            descriptions.push('左臂举起');
        } else if (rightArmUp) {
            descriptions.push('右臂举起');
        }

        // 分析腿部位置
        const leftLegBent = this.joints.leftKnee.y < this.joints.leftHip.y;
        const rightLegBent = this.joints.rightKnee.y < this.joints.rightHip.y;

        if (leftLegBent || rightLegBent) {
            descriptions.push('腿部弯曲');
        }

        const description = descriptions.length > 0 ? descriptions.join('，') : '标准站立姿势';

        // 填充到提示词输入框
        const promptInput = document.getElementById('prompt');
        if (promptInput) {
            const currentPrompt = promptInput.value;
            const poseDesc = `，人物姿势: ${description}`;
            if (!currentPrompt.includes(poseDesc)) {
                promptInput.value = currentPrompt + poseDesc;
            }
        }

        showNotification('姿势描述已生成', 'success');
    },

    /**
     * 用于文生图
     */
    useInGeneration() {
        // 将当前姿势转换为 ControlNet 可用的格式
        if (!this.canvas) return;

        const dataUrl = this.canvas.toDataURL('image/png');

        // 保存到状态，供生成时使用
        window.stickmanPoseData = {
            image: dataUrl,
            joints: this.joints
        };

        showNotification('姿势已保存，将在生成时应用', 'success');
    },

    /**
     * 初始化预设
     */
    initPresets() {
        // 预设按钮事件绑定
        const presetButtons = document.querySelectorAll('[data-preset]');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.loadPreset(preset);
            });
        });
    }
};

/**
 * 打开姿势选择弹框
 */
export function openStickmanPoseModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'stickmanPoseModal';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 600px;">
            <div class="modal-header">
                <h3>选择姿势</h3>
                <button class="modal-close" onclick="closeStickmanPoseModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>搜索姿势</label>
                    <input type="text" id="poseSearchInput" placeholder="输入姿势名称..." onkeyup="filterPoses(this.value)">
                </div>
                <div id="poseSelectorList" style="max-height: 400px; overflow-y: auto;">
                    <div class="loading"></div> 加载中...
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    loadPoseSelectorList();
}

/**
 * 关闭姿势选择弹框
 */
export function closeStickmanPoseModal() {
    const modal = document.getElementById('stickmanPoseModal');
    if (modal) modal.remove();
}

/**
 * 加载姿势选择器列表
 */
async function loadPoseSelectorList() {
    try {
        const result = await API.getStickmanPoses();
        const container = document.getElementById('poseSelectorList');

        if (!container) return;

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(pose => `
                <div class="pose-selector-item" 
                     style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;"
                     onclick="selectStickmanPose('${pose.id}', '${escapeHtml(pose.name)}', '${escapeHtml(pose.description || '')}', '${pose.thumbnail_url || ''}')">
                    <div style="font-weight: 500;">${escapeHtml(pose.name)}</div>
                    <div style="font-size: 12px; color: #666;">${escapeHtml(pose.description || '')}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="text-align: center; color: #999;">暂无姿势</p>';
        }
    } catch (error) {
        showNotification('加载姿势列表失败', 'error');
    }
}

/**
 * 选择姿势
 */
export function selectStickmanPose(poseId, poseName, poseDesc, thumbUrl) {
    stickmanEditor.loadPoseById(poseId);
    closeStickmanPoseModal();
    showNotification(`已选择姿势: ${poseName}`, 'success');
}

/**
 * 清除姿势
 */
export function clearStickmanPose() {
    stickmanEditor.resetPose();
    showNotification('姿势已重置', 'info');
}
