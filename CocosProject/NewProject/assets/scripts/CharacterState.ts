// 文件名: CharacterState.ts
// 功能：角色状态管理（任务2.1）
// 负责管理逃生者的状态：正常、被抓、被挂起、被淘汰

import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 角色状态枚举
 */
export enum CharacterStateType {
    NORMAL = 'normal',          // 正常状态，可以自由移动
    CAUGHT = 'caught',          // 被抓状态，被追捕者抓住
    HANGED = 'hanged',          // 被挂起状态，在笼子上
    ELIMINATED = 'eliminated'   // 被淘汰状态，退出游戏
}

/**
 * 状态变化事件回调类型
 */
export type StateChangeCallback = (oldState: CharacterStateType, newState: CharacterStateType) => void;

@ccclass('CharacterState')
export class CharacterState extends Component {
    @property
    public maxHangCount: number = 2; // 最多被挂起次数（2条命）

    @property
    public hangDuration: number = 30.0; // 挂起倒计时（秒）

    @property
    public rescueDuration: number = 3.0; // 救援读条时长（秒）

    private _currentState: CharacterStateType = CharacterStateType.NORMAL;
    private _hangCount: number = 0; // 已被挂起次数
    private _hangTimer: number = 0; // 挂起倒计时计时器
    private _isHangTimerActive: boolean = false; // 倒计时是否激活

    // 状态变化回调
    private _stateChangeCallbacks: StateChangeCallback[] = [];

    // 被谁抓住（追捕者节点引用）
    private _caughtBy: Node | null = null;

    // 正在被谁救援（队友节点引用）
    private _beingRescuedBy: Node | null = null;
    private _rescueProgress: number = 0; // 救援进度 0-1
    private _isBeingRescued: boolean = false;

    start() {
        this._currentState = CharacterStateType.NORMAL;
        console.log(`[CharacterState] ${this.node.name} 初始状态：${this._currentState}`);
    }

    update(deltaTime: number) {
        // 处理挂起倒计时
        if (this._isHangTimerActive && this._currentState === CharacterStateType.HANGED) {
            this._hangTimer -= deltaTime;

            if (this._hangTimer <= 0) {
                // 倒计时结束，淘汰
                console.log(`[CharacterState] ${this.node.name} 挂起倒计时结束，淘汰`);
                this.eliminate();
            }
        }

        // 处理救援进度
        if (this._isBeingRescued && this._currentState === CharacterStateType.HANGED) {
            this._rescueProgress += deltaTime / this.rescueDuration;

            if (this._rescueProgress >= 1.0) {
                // 救援成功
                this.onRescueComplete();
            }
        }
    }

    // ============ 状态控制 ============

    /**
     * 获取当前状态
     */
    public getCurrentState(): CharacterStateType {
        return this._currentState;
    }

    /**
     * 设置被抓状态
     * @param hunter 追捕者节点
     */
    public setCaught(hunter: Node) {
        if (this._currentState !== CharacterStateType.NORMAL) {
            console.warn(`[CharacterState] ${this.node.name} 不是正常状态，无法被抓`);
            return;
        }

        const oldState = this._currentState;
        this._currentState = CharacterStateType.CAUGHT;
        this._caughtBy = hunter;

        console.log(`[CharacterState] ${this.node.name} 被 ${hunter.name} 抓住`);
        this.notifyStateChange(oldState, this._currentState);
    }

    /**
     * 设置被挂起状态
     */
    public setHanged() {
        if (this._currentState !== CharacterStateType.CAUGHT) {
            console.warn(`[CharacterState] ${this.node.name} 不是被抓状态，无法被挂起`);
            return;
        }

        this._hangCount++;
        this._caughtBy = null;

        // ✅ 检查是否超过最大挂起次数
        if (this._hangCount > this.maxHangCount) {
            console.log(`[CharacterState] ${this.node.name} 挂起次数超限（${this._hangCount}/${this.maxHangCount}），立即淘汰`);
            this.eliminate();
            return;
        }

        const oldState = this._currentState;
        this._currentState = CharacterStateType.HANGED;

        // 启动挂起倒计时
        this._hangTimer = this.hangDuration;
        this._isHangTimerActive = true;

        console.log(`[CharacterState] ${this.node.name} 被挂起（第${this._hangCount}次/${this.maxHangCount}次），倒计时${this.hangDuration}秒`);
        this.notifyStateChange(oldState, this._currentState);
    }

    /**
     * 开始救援
     * @param rescuer 救援者节点
     */
    public startRescue(rescuer: Node): boolean {
        if (this._currentState !== CharacterStateType.HANGED) {
            console.warn(`[CharacterState] ${this.node.name} 不是被挂起状态，无法救援`);
            return false;
        }

        if (this._isBeingRescued) {
            console.warn(`[CharacterState] ${this.node.name} 已经在被救援中`);
            return false;
        }

        this._isBeingRescued = true;
        this._beingRescuedBy = rescuer;
        this._rescueProgress = 0;

        console.log(`[CharacterState] ${rescuer.name} 开始救援 ${this.node.name}`);
        return true;
    }

    /**
     * 中断救援
     */
    public cancelRescue() {
        if (!this._isBeingRescued) return;

        console.log(`[CharacterState] ${this.node.name} 的救援被中断（进度${(this._rescueProgress * 100).toFixed(0)}%）`);

        this._isBeingRescued = false;
        this._beingRescuedBy = null;
        this._rescueProgress = 0;
    }

    /**
     * 救援完成
     */
    private onRescueComplete() {
        if (!this._isBeingRescued) return;

        const rescuer = this._beingRescuedBy;
        console.log(`[CharacterState] ${rescuer?.name} 成功救援 ${this.node.name}`);

        const oldState = this._currentState;
        this._currentState = CharacterStateType.NORMAL;
        this._isHangTimerActive = false;
        this._isBeingRescued = false;
        this._beingRescuedBy = null;
        this._rescueProgress = 0;

        // 解锁救援者的移动
        if (rescuer) {
            const rescuerController = rescuer.getComponent('PlayerController');
            if (rescuerController && typeof rescuerController.setMovementLocked === 'function') {
                rescuerController.setMovementLocked(false);
            }
        }

        // 将被救的逃生者从笼子上移回场景
        this.node.setParent(this.node.scene);
        const currentPos = this.node.worldPosition;
        this.node.setWorldPosition(currentPos.x, 0, currentPos.z); // 放回地面

        this.notifyStateChange(oldState, this._currentState);
    }

    /**
     * 淘汰
     */
    public eliminate() {
        const oldState = this._currentState;
        this._currentState = CharacterStateType.ELIMINATED;
        this._isHangTimerActive = false;
        this._isBeingRescued = false;

        console.log(`[CharacterState] ${this.node.name} 被淘汰`);
        this.notifyStateChange(oldState, this._currentState);

        // 隐藏节点（不销毁，方便调试）
        this.node.active = false;
    }

    /**
     * 强制设置状态为正常（用于救援成功或重置）
     */
    public setNormal() {
        if (this._currentState === CharacterStateType.ELIMINATED) {
            console.warn(`[CharacterState] ${this.node.name} 已被淘汰，无法恢复正常状态`);
            return;
        }

        const oldState = this._currentState;
        this._currentState = CharacterStateType.NORMAL;
        this._caughtBy = null;
        this._isHangTimerActive = false;
        this._isBeingRescued = false;
        this._beingRescuedBy = null;
        this._rescueProgress = 0;

        this.notifyStateChange(oldState, this._currentState);
    }

    // ============ 状态查询 ============

    /**
     * 是否正常状态
     */
    public isNormal(): boolean {
        return this._currentState === CharacterStateType.NORMAL;
    }

    /**
     * 是否被抓状态
     */
    public isCaught(): boolean {
        return this._currentState === CharacterStateType.CAUGHT;
    }

    /**
     * 是否被挂起状态
     */
    public isHanged(): boolean {
        return this._currentState === CharacterStateType.HANGED;
    }

    /**
     * 是否被淘汰状态
     */
    public isEliminated(): boolean {
        return this._currentState === CharacterStateType.ELIMINATED;
    }

    /**
     * 是否正在被救援
     */
    public isBeingRescued(): boolean {
        return this._isBeingRescued;
    }

    /**
     * 获取救援进度（0-1）
     */
    public getRescueProgress(): number {
        return this._rescueProgress;
    }

    /**
     * 获取挂起剩余时间
     */
    public getHangTimeRemaining(): number {
        return this._hangTimer;
    }

    /**
     * 获取已被挂起次数
     */
    public getHangCount(): number {
        return this._hangCount;
    }

    /**
     * 获取剩余生命（可被挂起次数）
     */
    public getRemainingLives(): number {
        return Math.max(0, this.maxHangCount - this._hangCount);
    }

    /**
     * 是否可以被救援
     */
    public canBeRescued(): boolean {
        return this._currentState === CharacterStateType.HANGED && !this._isBeingRescued;
    }

    // ============ 回调系统 ============

    /**
     * 注册状态变化回调
     */
    public onStateChange(callback: StateChangeCallback) {
        this._stateChangeCallbacks.push(callback);
    }

    /**
     * 通知状态变化
     */
    private notifyStateChange(oldState: CharacterStateType, newState: CharacterStateType) {
        for (const callback of this._stateChangeCallbacks) {
            callback(oldState, newState);
        }
    }

    // ============ 调试功能 ============

    /**
     * 重置状态（用于测试）
     */
    public reset() {
        this._currentState = CharacterStateType.NORMAL;
        this._hangCount = 0;
        this._hangTimer = 0;
        this._isHangTimerActive = false;
        this._caughtBy = null;
        this._isBeingRescued = false;
        this._beingRescuedBy = null;
        this._rescueProgress = 0;
        this.node.active = true;

        console.log(`[CharacterState] ${this.node.name} 状态已重置`);
    }

    /**
     * 获取状态详情（调试用）
     */
    public getStateInfo(): string {
        return `状态:${this._currentState}, 挂起次数:${this._hangCount}/${this.maxHangCount}, 剩余时间:${this._hangTimer.toFixed(1)}s, 救援进度:${(this._rescueProgress * 100).toFixed(0)}%`;
    }
}
