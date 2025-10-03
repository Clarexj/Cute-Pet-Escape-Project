// 文件名: Joystick.ts
// 功能：虚拟摇杆控制组件，用于触摸屏操作

import { _decorator, Component, Node, Vec2, Vec3, UITransform, EventTouch, systemEvent, SystemEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    public stick: Node = null!; // 摇杆中心的小圆点

    @property
    public maxRadius: number = 100; // 摇杆最大拖动半径

    private _touchId: number = -1; // 当前触摸ID
    private _stickPos: Vec3 = new Vec3(); // 摇杆位置
    private _touchStartPos: Vec2 = new Vec2(); // 触摸起始位置
    private _direction: Vec2 = new Vec2(0, 0); // 归一化方向向量 (-1到1)
    private _strength: number = 0; // 摇杆偏移强度 (0到1)

    onLoad() {
        // 监听触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        // 记录触摸ID和起始位置
        this._touchId = event.touch!.getID();
        const uiPos = event.getUILocation();
        this._touchStartPos.set(uiPos.x, uiPos.y);
    }

    private onTouchMove(event: EventTouch) {
        // 只处理当前触摸
        if (event.touch!.getID() !== this._touchId) return;

        const uiPos = event.getUILocation();

        // 计算偏移量
        const delta = new Vec2(
            uiPos.x - this._touchStartPos.x,
            uiPos.y - this._touchStartPos.y
        );

        const distance = delta.length();

        // 限制在最大半径内
        if (distance > this.maxRadius) {
            delta.normalize().multiplyScalar(this.maxRadius);
        }

        // 更新摇杆视觉位置
        this.stick.setPosition(delta.x, delta.y, 0);

        // 计算方向和强度
        this._strength = Math.min(distance / this.maxRadius, 1.0);

        if (distance > 0.01) {
            this._direction.set(delta.x, delta.y);
            this._direction.normalize();
        } else {
            this._direction.set(0, 0);
        }
    }

    private onTouchEnd(event: EventTouch) {
        // 只处理当前触摸
        if (event.touch!.getID() !== this._touchId) return;

        // 重置摇杆
        this._touchId = -1;
        this.stick.setPosition(0, 0, 0);
        this._direction.set(0, 0);
        this._strength = 0;
    }

    /**
     * 获取摇杆方向 (归一化的2D向量)
     * @returns Vec2 x和y范围都是-1到1
     */
    public getDirection(): Vec2 {
        return this._direction.clone();
    }

    /**
     * 获取摇杆强度
     * @returns number 0到1之间的值
     */
    public getStrength(): number {
        return this._strength;
    }

    /**
     * 是否正在操作摇杆
     */
    public isActive(): boolean {
        return this._touchId !== -1;
    }
}
