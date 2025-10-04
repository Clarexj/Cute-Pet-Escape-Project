// 文件名: CameraFollow.ts
// 功能：第三人称摄像机跟随系统，支持水平旋转（任务1.2）

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

    @property
    public rotationSmoothSpeed: number = 7.0; // 旋转平滑速度（优化：降低避免"飘"的感觉）

    private _currentOffset: Vec3 = new Vec3(); // 当前偏移量
    private _targetOffset: Vec3 = new Vec3(); // 目标偏移量
    private _lookAtPoint: Vec3 = new Vec3(); // 看向点

    // 任务1.2新增：水平旋转角度（yaw angle）
    private _yawAngle: number = 0; // 当前水平旋转角度
    private _targetYawAngle: number = 0; // 目标水平旋转角度

    // 性能优化：复用临时变量
    private _tempVec3: Vec3 = new Vec3();
    private _tempQuat: Quat = new Quat();

    start() {
        // 初始化摄像机偏移
        this.calculateTargetOffset();
        this._currentOffset.set(this._targetOffset);
        this.updateCameraPosition(0);
    }

    lateUpdate(deltaTime: number) {
        if (!this.target) return;

        // 平滑插值水平旋转角度
        const angleDiff = this._targetYawAngle - this._yawAngle;
        this._yawAngle += angleDiff * this.rotationSmoothSpeed * deltaTime;

        // 计算目标偏移
        this.calculateTargetOffset();

        // 平滑插值到目标偏移
        Vec3.lerp(this._currentOffset, this._currentOffset, this._targetOffset, this.smoothSpeed * deltaTime);

        // 更新摄像机位置和朝向
        this.updateCameraPosition(deltaTime);
    }

    /**
     * 计算摄像机相对角色的目标偏移（支持水平旋转）
     */
    private calculateTargetOffset() {
        // 俯仰角转弧度
        const pitchRad = this.pitchAngle * (Math.PI / 180);

        // 水平角转弧度
        const yawRad = this._yawAngle * (Math.PI / 180);

        // 计算水平距离和垂直距离
        const horizontalDist = this.followDistance * Math.cos(pitchRad);
        const verticalDist = this.followDistance * Math.sin(pitchRad) + this.followHeight;

        // 根据水平旋转角度计算偏移（围绕角色旋转）
        const offsetX = horizontalDist * Math.sin(yawRad);
        const offsetZ = -horizontalDist * Math.cos(yawRad);

        this._targetOffset.set(offsetX, verticalDist, offsetZ);
    }

    /**
     * 更新摄像机位置和朝向
     */
    private updateCameraPosition(deltaTime: number) {
        // 获取角色位置（只获取一次，复用）
        const targetPos = this.target.getWorldPosition(this._tempVec3);

        // 摄像机位置 = 角色位置 + 偏移
        Vec3.add(this._tempVec3, targetPos, this._currentOffset);
        this.node.setWorldPosition(this._tempVec3);

        // 摄像机看向角色（加上高度偏移）
        this._lookAtPoint.set(
            targetPos.x,
            targetPos.y + this.lookAtHeight,
            targetPos.z
        );

        // 计算朝向（复用_tempVec3）
        Vec3.subtract(this._tempVec3, this._lookAtPoint, this.node.worldPosition);
        this._tempVec3.normalize();
        Quat.fromViewUp(this._tempQuat, this._tempVec3);
        this.node.setWorldRotation(this._tempQuat);
    }

    /**
     * 设置水平旋转角度（任务1.2新增）
     * @param angle 水平旋转角度（度）
     */
    public setYawAngle(angle: number) {
        this._targetYawAngle = angle;
    }

    /**
     * 增加水平旋转角度（任务1.2新增）
     * @param delta 角度增量（度）
     */
    public addYawAngle(delta: number) {
        this._targetYawAngle += delta;
        // 规范化到-180到180度
        while (this._targetYawAngle > 180) this._targetYawAngle -= 360;
        while (this._targetYawAngle < -180) this._targetYawAngle += 360;
    }

    /**
     * 获取当前水平旋转角度
     */
    public getYawAngle(): number {
        return this._yawAngle;
    }

    /**
     * 设置俯仰角
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
