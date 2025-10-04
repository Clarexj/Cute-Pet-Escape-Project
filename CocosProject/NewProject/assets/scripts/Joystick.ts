// 文件名: Joystick.ts
// 功能：虚拟摇杆控制组件，用于触摸屏操作
// 版本：V1.1 - 性能优化版

import { _decorator, Component, Node, Vec2, Vec3, UITransform, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    public stick: Node = null!; // 摇杆中心的小圆点

    @property
    public maxRadius: number = 100; // 摇杆最大拖动半径

    @property
    public deadZone: number = 0.1; // 死区半径（0-1），避免误触

    private _touchId: number = -1; // 当前触摸ID
    private _touchStartPos: Vec2 = new Vec2(); // 触摸起始位置
    private _direction: Vec2 = new Vec2(0, 0); // 归一化方向向量 (-1到1)
    private _strength: number = 0; // 摇杆偏移强度 (0到1)

    // 性能优化：复用临时变量
    private _tempVec2: Vec2 = new Vec2();

    onLoad() {
        // 检查stick节点是否绑定
        if (!this.stick) {
            console.error('[Joystick] stick节点未绑定！请在编辑器中将JoystickStick节点拖到Stick属性框。');
            return;
        }

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
        if (!this.stick) return; // 安全检查

        const uiPos = event.getUILocation();

        // 计算偏移量（复用对象）
        this._tempVec2.set(
            uiPos.x - this._touchStartPos.x,
            uiPos.y - this._touchStartPos.y
        );

        const distance = this._tempVec2.length();

        // 限制在最大半径内
        if (distance > this.maxRadius) {
            this._tempVec2.normalize().multiplyScalar(this.maxRadius);
        }

        // 更新摇杆视觉位置
        this.stick.setPosition(this._tempVec2.x, this._tempVec2.y, 0);

        // 计算强度（原始强度）
        const rawStrength = Math.min(distance / this.maxRadius, 1.0);

        // 应用死区
        if (rawStrength < this.deadZone) {
            this._strength = 0;
            this._direction.set(0, 0);
        } else {
            // 重新映射强度到0-1范围（死区外）
            this._strength = (rawStrength - this.deadZone) / (1 - this.deadZone);

            // 计算方向
            if (distance > 0.01) {
                this._direction.set(this._tempVec2.x, this._tempVec2.y);
                this._direction.normalize();
            } else {
                this._direction.set(0, 0);
            }
        }
    }

    private onTouchEnd(event: EventTouch) {
        // 只处理当前触摸
        if (event.touch!.getID() !== this._touchId) return;
        if (!this.stick) return; // 安全检查

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
     * ✅ 优化：获取摇杆方向（复用传入的Vec2，避免GC）
     * @param out 输出向量
     * @returns Vec2 返回传入的out对象
     */
    public getDirectionOut(out: Vec2): Vec2 {
        out.set(this._direction.x, this._direction.y);
        return out;
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
