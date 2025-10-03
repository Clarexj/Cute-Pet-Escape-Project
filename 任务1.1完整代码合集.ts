// ============================================================
// 任务1.1 完整代码合集
// 项目：《萌宠大逃亡》- 虚拟摇杆移动系统
// 开发工具：Cocos Creator 3.x
// 开发时间：2025-10-01
// ============================================================

// ============================================================
// 文件1：Joystick.ts
// 功能：虚拟摇杆控制组件，用于触摸屏操作
// 位置：assets/scripts/Joystick.ts
// ============================================================

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


// ============================================================
// 文件2：PlayerController.ts
// 功能：逃生者角色移动控制（基于Transform，相对摄像机方向）
// 位置：assets/scripts/PlayerController.ts
// ============================================================

import { _decorator, Component, Node, Vec3, Quat } from 'cc';
import { Joystick } from './Joystick';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(Joystick)
    public joystick: Joystick = null!; // 虚拟摇杆引用

    @property(Node)
    public cameraNode: Node = null!; // 摄像机节点引用

    @property
    public moveSpeed: number = 5.0; // 移动速度（单位/秒），逃生者基础速度100%

    @property
    public rotationSpeed: number = 10.0; // 转身速度

    private _moveDirection: Vec3 = new Vec3(); // 世界空间移动方向
    private _targetRotation: Quat = new Quat(); // 目标旋转

    update(deltaTime: number) {
        if (!this.joystick || !this.cameraNode) return;

        // 获取摇杆输入
        const joyDir = this.joystick.getDirection();
        const joyStrength = this.joystick.getStrength();

        if (joyStrength > 0.01) {
            // 计算相对于摄像机的移动方向
            this.calculateMoveDirection(joyDir);

            // 移动角色
            const movement = this._moveDirection.clone().multiplyScalar(this.moveSpeed * joyStrength * deltaTime);
            const currentPos = this.node.position.clone();
            currentPos.add(movement);
            this.node.setPosition(currentPos);

            // 旋转角色面向移动方向
            this.rotateTowardsMovement(deltaTime);
        }
    }

    /**
     * 计算相对于摄像机的移动方向
     * @param joyDir 摇杆输入方向（2D）
     */
    private calculateMoveDirection(joyDir: Vec3 | { x: number; y: number }) {
        // 获取摄像机的前方和右方向（世界空间）
        const cameraForward = new Vec3();
        const cameraRight = new Vec3();

        // 摄像机的前方向
        this.cameraNode.getWorldRotation(new Quat()).getAxisZ(cameraForward);
        cameraForward.negative(); // Cocos中Z轴负方向是前方

        // 摄像机的右方向
        this.cameraNode.getWorldRotation(new Quat()).getAxisX(cameraRight);

        // 将前方和右方向投影到水平面（Y=0）
        cameraForward.y = 0;
        cameraForward.normalize();

        cameraRight.y = 0;
        cameraRight.normalize();

        // 组合摇杆输入和摄像机方向
        // 摇杆Y对应前后，摇杆X对应左右
        this._moveDirection.set(0, 0, 0);
        this._moveDirection.add(cameraForward.multiplyScalar(joyDir.y)); // 前后
        this._moveDirection.add(cameraRight.multiplyScalar(joyDir.x));   // 左右
        this._moveDirection.normalize();
    }

    /**
     * 平滑旋转角色面向移动方向
     */
    private rotateTowardsMovement(deltaTime: number) {
        if (this._moveDirection.lengthSqr() < 0.01) return;

        // 计算目标旋转（朝向移动方向）
        const targetEuler = new Vec3();
        targetEuler.y = Math.atan2(this._moveDirection.x, this._moveDirection.z) * (180 / Math.PI);

        Quat.fromEuler(this._targetRotation, 0, targetEuler.y, 0);

        // 平滑插值到目标旋转
        const currentRotation = this.node.rotation.clone();
        Quat.slerp(currentRotation, currentRotation, this._targetRotation, this.rotationSpeed * deltaTime);
        this.node.setRotation(currentRotation);
    }

    /**
     * 设置移动速度（用于后续追捕者115%速度）
     */
    public setMoveSpeed(speed: number) {
        this.moveSpeed = speed;
    }

    /**
     * 获取当前移动方向（用于动画系统）
     */
    public getMoveDirection(): Vec3 {
        return this._moveDirection.clone();
    }

    /**
     * 是否正在移动
     */
    public isMoving(): boolean {
        return this.joystick.isActive() && this.joystick.getStrength() > 0.01;
    }
}


// ============================================================
// 文件3：CameraFollow.ts
// 功能：第三人称摄像机跟随系统（为任务1.2的镜头旋转预留接口）
// 位置：assets/scripts/CameraFollow.ts
// ============================================================

import { _decorator, Component, Node, Vec3, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {
    @property(Node)
    public target: Node = null!; // 跟随目标（玩家角色）

    @property
    public followDistance: number = 8.0; // 摄像机距离角色的距离

    @property
    public followHeight: number = 5.0; // 摄像机高度偏移

    @property
    public lookAtHeight: number = 1.0; // 摄像机看向目标的高度偏移

    @property
    public smoothSpeed: number = 5.0; // 跟随平滑速度

    @property
    public pitchAngle: number = 30.0; // 俯仰角度（向下看的角度）

    private _currentOffset: Vec3 = new Vec3(); // 当前偏移量
    private _targetOffset: Vec3 = new Vec3(); // 目标偏移量
    private _lookAtPoint: Vec3 = new Vec3(); // 看向点

    start() {
        // 初始化摄像机偏移
        this.calculateTargetOffset();
        this._currentOffset.set(this._targetOffset);
        this.updateCameraPosition(0);
    }

    lateUpdate(deltaTime: number) {
        if (!this.target) return;

        // 计算目标偏移
        this.calculateTargetOffset();

        // 平滑插值到目标偏移
        Vec3.lerp(this._currentOffset, this._currentOffset, this._targetOffset, this.smoothSpeed * deltaTime);

        // 更新摄像机位置和朝向
        this.updateCameraPosition(deltaTime);
    }

    /**
     * 计算摄像机相对角色的目标偏移
     * （为任务1.2预留：这里可以加入水平旋转角度参数）
     */
    private calculateTargetOffset() {
        // 当前是固定的后上方视角
        // 任务1.2时，可以根据玩家拖动修改这个偏移方向

        // 俯仰角转弧度
        const pitchRad = this.pitchAngle * (Math.PI / 180);

        // 计算水平距离和垂直距离
        const horizontalDist = this.followDistance * Math.cos(pitchRad);
        const verticalDist = this.followDistance * Math.sin(pitchRad) + this.followHeight;

        // 默认在角色正后方（可以后续改为可旋转）
        this._targetOffset.set(0, verticalDist, -horizontalDist);
    }

    /**
     * 更新摄像机位置和朝向
     */
    private updateCameraPosition(deltaTime: number) {
        // 摄像机位置 = 角色位置 + 偏移
        const targetPos = this.target.getWorldPosition();
        const cameraPos = targetPos.clone().add(this._currentOffset);
        this.node.setWorldPosition(cameraPos);

        // 摄像机看向角色（加上高度偏移）
        this._lookAtPoint.set(
            targetPos.x,
            targetPos.y + this.lookAtHeight,
            targetPos.z
        );

        // 计算朝向
        const forward = this._lookAtPoint.clone().subtract(cameraPos).normalize();
        const rotation = new Quat();
        Quat.fromViewUp(rotation, forward);
        this.node.setWorldRotation(rotation);
    }

    /**
     * 设置俯仰角（任务1.2可能会用到）
     */
    public setPitchAngle(angle: number) {
        this.pitchAngle = Math.max(-85, Math.min(85, angle)); // 限制在-85到85度
    }

    /**
     * 设置跟随距离
     */
    public setFollowDistance(distance: number) {
        this.followDistance = Math.max(3.0, Math.min(15.0, distance)); // 限制距离
    }
}


// ============================================================
// 代码审查要点
// ============================================================
/*
请重点审查以下方面：

1. 性能问题：
   - PlayerController.ts 第37-40行、53-61行：频繁创建Vec3和Quat对象
   - Joystick.ts 第50-53行：每次onTouchMove创建新Vec2对象
   - CameraFollow.ts 第76、87-89行：频繁创建Vec3和Quat对象

2. 逻辑正确性：
   - 摇杆方向计算是否正确
   - 移动方向相对摄像机的转换是否正确
   - 角色旋转是否合理
   - 摄像机跟随是否平滑

3. 类型安全：
   - 是否有潜在的null/undefined错误
   - TypeScript类型定义是否完整

4. Cocos Creator 3.x最佳实践：
   - 组件生命周期使用是否正确
   - 事件监听注册和销毁是否完整
   - 向量运算是否高效

5. 功能需求：
   - 是否符合"相对摄像机方向移动"的要求
   - 是否符合第三人称游戏标准
   - 是否为任务1.2预留扩展性

设计文档参考：
- GAME_DESIGN_DOCUMENT.md：游戏核心设计
- DELIVERY_CHECKLIST.md：交付验收标准

技术背景：
- 使用Transform控制移动（非RigidBody）是有意的设计决策
- 目标平台：微信小游戏
- 需要考虑移动端性能优化
*/
