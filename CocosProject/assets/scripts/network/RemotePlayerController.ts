// 文件名: RemotePlayerController.ts
// 功能: 远程玩家控制器 - 接收并应用远程玩家数据（任务4.1）

import { _decorator, Component, Node, Vec3, Quat, tween } from 'cc';
import { PlayerData } from './NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('RemotePlayerController')
export class RemotePlayerController extends Component {
    // ============ 配置 ============
    @property
    public interpolationSpeed: number = 10.0; // 插值速度（越大越快，建议5-20）

    @property
    public snapThreshold: number = 5.0; // 距离阈值（米），超过此距离直接传送

    @property
    public enableSmoothing: boolean = true; // 是否启用平滑插值

    @property
    public showDebugInfo: boolean = false; // 是否显示调试信息

    // 玩家信息
    private _sessionId: string = "";
    private _playerName: string = "";

    // 目标状态（从服务器接收）
    private _targetPosition: Vec3 = new Vec3();
    private _targetRotationY: number = 0;
    private _targetAnimationState: string = "idle";
    private _targetIsMoving: boolean = false;

    // 当前状态（实际显示）
    private _currentPosition: Vec3 = new Vec3();
    private _currentRotationY: number = 0;

    // 临时变量（性能优化）
    private _tempVec3: Vec3 = new Vec3();
    private _tempQuat: Quat = new Quat();

    // 动画控制器引用（如果有）
    private _animationController: any = null;

    start() {
        // 获取初始位置
        this.node.getPosition(this._currentPosition);
        this._currentRotationY = this.node.eulerAngles.y;

        this._targetPosition.set(this._currentPosition);
        this._targetRotationY = this._currentRotationY;

        // 尝试获取动画控制器
        this._animationController = this.node.getComponentInChildren('CharacterAnimationController');
        if (this._animationController) {
            console.log(`[RemotePlayerController] 找到动画控制器`);
        }
    }

    update(deltaTime: number) {
        if (!this.enableSmoothing) return;

        // 插值移动到目标位置
        this.interpolatePosition(deltaTime);

        // 插值旋转到目标角度
        this.interpolateRotation(deltaTime);
    }

    /**
     * 位置插值
     */
    private interpolatePosition(deltaTime: number) {
        this.node.getPosition(this._currentPosition);

        // 计算距离
        const distance = Vec3.distance(this._currentPosition, this._targetPosition);

        // 如果距离过大，直接传送（防止延迟导致的巨大偏移）
        if (distance > this.snapThreshold) {
            this.node.setPosition(this._targetPosition);
            this._currentPosition.set(this._targetPosition);
            if (this.showDebugInfo) {
                console.log(`[RemotePlayerController] 传送到目标位置（距离${distance.toFixed(2)}米）`);
            }
            return;
        }

        // 平滑插值
        if (distance > 0.01) {
            Vec3.lerp(this._tempVec3, this._currentPosition, this._targetPosition, this.interpolationSpeed * deltaTime);
            this.node.setPosition(this._tempVec3);
        }
    }

    /**
     * 旋转插值
     */
    private interpolateRotation(deltaTime: number) {
        const currentRotationY = this.node.eulerAngles.y;
        const angleDiff = this.getShortestAngleDifference(currentRotationY, this._targetRotationY);

        // 如果角度差距很小，直接设置
        if (Math.abs(angleDiff) < 1.0) {
            return;
        }

        // 平滑插值
        const newRotationY = currentRotationY + angleDiff * this.interpolationSpeed * deltaTime;
        this.node.setRotationFromEuler(0, newRotationY, 0);
        this._currentRotationY = newRotationY;
    }

    /**
     * 获取最短角度差（-180到180度）
     */
    private getShortestAngleDifference(from: number, to: number): number {
        let diff = to - from;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }

    // ============ 公共接口 ============

    /**
     * 初始化远程玩家
     */
    public initialize(sessionId: string, playerData: PlayerData) {
        this._sessionId = sessionId;
        this._playerName = playerData.name;

        console.log(`[RemotePlayerController] 初始化远程玩家: ${this._playerName} (${sessionId})`);

        // 设置初始位置
        this.updatePlayerState(playerData, true);
    }

    /**
     * 更新玩家状态
     */
    public updatePlayerState(playerData: PlayerData, immediate: boolean = false) {
        // 更新目标状态
        this._targetPosition.set(playerData.x, playerData.y, playerData.z);
        this._targetRotationY = playerData.rotationY;
        this._targetAnimationState = playerData.animationState;
        this._targetIsMoving = playerData.isMoving;

        // 如果需要立即应用（初始化或传送）
        if (immediate || !this.enableSmoothing) {
            this.node.setPosition(this._targetPosition);
            this.node.setRotationFromEuler(0, this._targetRotationY, 0);
            this._currentPosition.set(this._targetPosition);
            this._currentRotationY = this._targetRotationY;
        }

        // 更新动画状态
        this.updateAnimation();

        if (this.showDebugInfo) {
            console.log(`[RemotePlayerController] 更新状态: ${this._playerName}, pos(${playerData.x.toFixed(2)}, ${playerData.z.toFixed(2)}), moving(${playerData.isMoving})`);
        }
    }

    /**
     * 更新动画状态
     */
    private updateAnimation() {
        if (!this._animationController) return;

        // 根据移动状态播放动画
        if (this._targetIsMoving) {
            if (typeof this._animationController.playRun === 'function') {
                this._animationController.playRun();
            }
        } else {
            if (typeof this._animationController.playIdle === 'function') {
                this._animationController.playIdle();
            }
        }
    }

    /**
     * 获取会话ID
     */
    public getSessionId(): string {
        return this._sessionId;
    }

    /**
     * 获取玩家名称
     */
    public getPlayerName(): string {
        return this._playerName;
    }

    /**
     * 设置插值速度
     */
    public setInterpolationSpeed(speed: number) {
        this.interpolationSpeed = Math.max(1.0, speed);
    }

    /**
     * 启用/禁用平滑插值
     */
    public setSmoothing(enabled: boolean) {
        this.enableSmoothing = enabled;
    }
}
