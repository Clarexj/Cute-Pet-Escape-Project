// 文件名: CameraFollow.ts
// 功能：第三人称摄像机跟随系统（为任务1.2的镜头旋转预留接口）

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
