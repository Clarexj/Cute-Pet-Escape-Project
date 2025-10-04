// 文件名: CameraController.ts
// 功能：处理屏幕右侧触摸拖拽来旋转摄像机（任务1.2）

import { _decorator, Component, Node, EventTouch, Vec2, UITransform, Canvas } from 'cc';
import { CameraFollow } from './CameraFollow';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property(CameraFollow)
    public cameraFollow: CameraFollow = null!; // CameraFollow组件引用

    @property(Node)
    public joystickArea: Node = null!; // 摇杆区域节点（用于判断是否在摇杆区域内）

    @property
    public rotationSensitivity: number = 0.2; // 旋转灵敏度

    @property
    public joystickExclusionRadius: number = 250; // 摇杆排除半径（屏幕左侧多大范围不响应）

    private _touchId: number = -1; // 当前触摸ID
    private _lastTouchPos: Vec2 = new Vec2(); // 上一次触摸位置
    private _isDragging: boolean = false; // 是否正在拖拽

    // 性能优化：复用临时变量
    private _tempVec2: Vec2 = new Vec2();

    onLoad() {
        // 监听Canvas上的触摸事件（全屏监听）
        const canvas = this.node.getComponent(Canvas);
        if (canvas) {
            this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        } else {
            console.warn('[CameraController] 请将此组件挂在Canvas节点上！');
        }
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        const uiPos = event.getUILocation();

        // 检查是否在摇杆区域（左侧区域）
        if (this.isInJoystickArea(uiPos)) {
            return; // 在摇杆区域，不处理
        }

        // 记录触摸信息
        this._touchId = event.touch!.getID();
        this._lastTouchPos.set(uiPos.x, uiPos.y);
        this._isDragging = true;
    }

    private onTouchMove(event: EventTouch) {
        // 只处理当前触摸
        if (event.touch!.getID() !== this._touchId || !this._isDragging) return;

        const uiPos = event.getUILocation();

        // 计算拖拽偏移量
        this._tempVec2.set(
            uiPos.x - this._lastTouchPos.x,
            uiPos.y - this._lastTouchPos.y
        );

        // 水平拖拽控制摄像机水平旋转
        const deltaYaw = this._tempVec2.x * this.rotationSensitivity;

        if (this.cameraFollow) {
            this.cameraFollow.addYawAngle(deltaYaw);
        }

        // 更新上一次触摸位置
        this._lastTouchPos.set(uiPos.x, uiPos.y);
    }

    private onTouchEnd(event: EventTouch) {
        // 只处理当前触摸
        if (event.touch!.getID() !== this._touchId) return;

        // 重置状态
        this._touchId = -1;
        this._isDragging = false;
    }

    /**
     * 判断触摸位置是否在摇杆区域内
     * @param uiPos UI坐标系的触摸位置（左下角为原点）
     */
    private isInJoystickArea(uiPos: Vec2): boolean {
        // ✅ 修复：直接使用UI坐标判断
        // UI坐标原点在左下角，x向右递增，y向上递增
        // 屏幕左侧joystickExclusionRadius范围内视为摇杆区域
        return uiPos.x < this.joystickExclusionRadius;
    }

    /**
     * 设置旋转灵敏度
     */
    public setRotationSensitivity(sensitivity: number) {
        this.rotationSensitivity = Math.max(0.05, Math.min(1.0, sensitivity));
    }

    /**
     * 是否正在拖拽旋转摄像机
     */
    public isDragging(): boolean {
        return this._isDragging;
    }
}
