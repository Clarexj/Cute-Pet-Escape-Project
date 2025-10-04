// 文件名: HunterController.ts
// 功能：追捕者可控移动 + 攻击 + 踩碎木板（任务2.2）
// 版本：V1.2 - 补充眩晕、木板破坏读条与进度事件

import { _decorator, Component, Node, Vec2, Vec3, Quat } from 'cc';
import { Joystick } from './Joystick';
import { CharacterState, CharacterStateType } from './CharacterState';
import { Hunter } from './Hunter';
import { Board, BoardState } from './Board';
import { CharacterAnimationController } from './CharacterAnimationController';
const { ccclass, property } = _decorator;

export type BoardBreakPhase = 'start' | 'progress' | 'cancelled' | 'finished';

@ccclass('HunterController')
export class HunterController extends Component {
    @property(Joystick)
    public joystick: Joystick = null!; // 虚拟摇杆引用

    @property(Node)
    public cameraNode: Node = null!; // 摄像机节点引用

    @property
    public moveSpeed: number = 5.75; // 移动速度（115% = 5 * 1.15）

    @property
    public rotationSpeed: number = 10.0; // 转身速度

    @property
    public attackRange: number = 2.0; // 攻击范围（米）

    @property
    public attackCooldown: number = 1.0; // 攻击冷却时间（秒）

    @property
    public boardBreakRange: number = 2.5; // 踩碎木板范围（米）

    @property(CharacterAnimationController)
    public animationController: CharacterAnimationController | null = null; // 动画控制器（任务3.1新增）

    private _moveDirection: Vec3 = new Vec3(); // 世界空间移动方向
    private _targetRotation: Quat = new Quat(); // 目标旋转

    // 攻击系统
    private _canAttack: boolean = true; // 是否可以攻击
    private _attackCooldownTimer: number = 0; // 攻击冷却计时器
    private _nearestSurvivor: Node | null = null; // 最近的逃生者
    private _attackCallbacks: ((target: Node | null) => void)[] = []; // 攻击目标变化回调

    // 木板系统
    private _nearestBoard: Board | null = null; // 最近的倒下木板
    private _boardCallbacks: ((board: Board | null) => void)[] = []; // 木板目标变化回调

    // Hunter组件引用
    private _hunter: Hunter | null = null;

    // 性能优化：缓存场景中的角色和木板
    private _allCharacters: CharacterState[] = [];
    private _allBoards: Board[] = [];

    // 性能优化：复用临时变量
    private _tempVec2: Vec2 = new Vec2();
    private _tempVec3_1: Vec3 = new Vec3();
    private _tempVec3_2: Vec3 = new Vec3();
    private _tempVec3_3: Vec3 = new Vec3();
    private _tempQuat: Quat = new Quat();
    private _cameraForward: Vec3 = new Vec3();
    private _cameraRight: Vec3 = new Vec3();

    // 眩晕与移动锁定
    private _isStunned: boolean = false;
    private _stunTimer: number = 0;
    private _stunSource: Node | null = null;
    private _movementLocks: Set<string> = new Set();
    private static readonly LOCK_BOARD_BREAK = 'board-break';

    // 木板踩碎流程
    private _activeBreakingBoard: Board | null = null;
    private _currentBoardBreakProgress: number = 0;
    private _boardBreakObservers: ((board: Board | null, progress: number, phase: BoardBreakPhase) => void)[] = [];

    start() {
        // 检查必需的引用
        if (!this.joystick) {
            console.error('[HunterController] joystick未绑定！');
        }
        if (!this.cameraNode) {
            console.error('[HunterController] cameraNode未绑定！');
        }

        // 获取Hunter组件
        this._hunter = this.node.getComponent(Hunter);
        if (!this._hunter) {
            console.error('[HunterController] Hunter组件未找到！');
        } else {
            // 禁用Hunter的自动抓捕，改用手动攻击
            this._hunter.autoCatchEnabled = false;
        }

        // 缓存场景中的角色和木板
        this.refreshCache();

        // ✅ 任务3.1新增：获取动画控制器
        if (!this.animationController) {
            this.animationController = this.node.getComponentInChildren(CharacterAnimationController);
            if (!this.animationController) {
                console.warn('[HunterController] CharacterAnimationController未找到，动画功能将不可用');
            }
        }

        console.log('[HunterController] 追捕者控制器初始化完成');
    }

    update(deltaTime: number) {
        if (!this.joystick || !this.cameraNode) return;

        // 更新攻击冷却
        if (!this._canAttack) {
            this._attackCooldownTimer -= deltaTime;
            if (this._attackCooldownTimer <= 0) {
                this._canAttack = true;
            }
        }

        this.updateStun(deltaTime);

        if (this._hunter && this._hunter.isCarrying()) {
            return;
        }

        const isMovementLocked = this.isMovementLocked();

        if (this._isStunned || isMovementLocked) {
            this._moveDirection.set(0, 0, 0);
        } else {
            this.joystick.getDirectionOut(this._tempVec2);
            const joyStrength = this.joystick.getStrength();

            if (joyStrength > 0.01) {
                this.calculateMoveDirection(this._tempVec2);

                Vec3.multiplyScalar(this._tempVec3_1, this._moveDirection, this.moveSpeed * joyStrength * deltaTime);
                this.node.getPosition(this._tempVec3_2);
                Vec3.add(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
                this.node.setPosition(this._tempVec3_2);

                this.rotateTowardsMovement(deltaTime);
            } else {
                this._moveDirection.set(0, 0, 0);
            }
        }

        this.detectSurvivors();
        this.detectBoards();
        this.updateAnimation();
    }

    /**
     * 更新动画状态（任务3.1新增）
     */
    private updateAnimation() {
        if (!this.animationController) return;

        // 根据移动状态自动切换动画
        const isMoving = this.isMoving();
        this.animationController.updateMovementAnimation(isMoving);
    }

    private updateStun(deltaTime: number) {
        if (!this._isStunned) {
            return;
        }

        this._stunTimer -= deltaTime;
        if (this._stunTimer <= 0) {
            console.log('[HunterController] 眩晕结束');
            this._isStunned = false;
            this._stunTimer = 0;
            this._stunSource = null;
        }
    }

    public applyStun(duration: number, source?: Node | null) {
        if (duration <= 0) {
            return;
        }

        console.log(`[HunterController] 受到眩晕 ${duration}s`);

        if (this._activeBreakingBoard) {
            this._activeBreakingBoard.cancelBreak(this);
        }

        this._isStunned = true;
        this._stunTimer = Math.max(this._stunTimer, duration);
        this._stunSource = source ?? null;
        this._moveDirection.set(0, 0, 0);

        if (this.animationController) {
            this.animationController.updateMovementAnimation(false);
        }
    }

    public isStunned(): boolean {
        return this._isStunned;
    }

    private isMovementLocked(): boolean {
        return this._movementLocks.size > 0;
    }

    private setMovementLock(locked: boolean, reason: string) {
        if (locked) {
            this._movementLocks.add(reason);
        } else {
            this._movementLocks.delete(reason);
        }
    }

    public getBoardBreakProgress(): number {
        return this._currentBoardBreakProgress;
    }

    public isBreakingBoard(): boolean {
        return this._activeBreakingBoard !== null;
    }

    public onBoardBreakProgressUpdate(callback: (board: Board | null, progress: number, phase: BoardBreakPhase) => void) {
        this._boardBreakObservers.push(callback);
    }

    private notifyBoardBreakObservers(board: Board | null, progress: number, phase: BoardBreakPhase) {
        for (const observer of this._boardBreakObservers) {
            observer(board, progress, phase);
        }
    }

    public onBoardBreakProgress(board: Board, progress: number, phase: BoardBreakPhase) {
        switch (phase) {
            case 'start':
                this._activeBreakingBoard = board;
                this._currentBoardBreakProgress = progress;
                this.setMovementLock(true, HunterController.LOCK_BOARD_BREAK);
                break;
            case 'progress':
                if (board !== this._activeBreakingBoard) {
                    return;
                }
                this._currentBoardBreakProgress = progress;
                break;
            case 'finished':
                if (board === this._activeBreakingBoard) {
                    this._activeBreakingBoard = null;
                    this._currentBoardBreakProgress = 1;
                    this.setMovementLock(false, HunterController.LOCK_BOARD_BREAK);
                }
                break;
            case 'cancelled':
                if (board === this._activeBreakingBoard) {
                    this._activeBreakingBoard = null;
                    this._currentBoardBreakProgress = 0;
                    this.setMovementLock(false, HunterController.LOCK_BOARD_BREAK);
                }
                break;
        }

        this.notifyBoardBreakObservers(this._activeBreakingBoard ?? board, this._currentBoardBreakProgress, phase);
    }

    public onBoardBreakFinished(board: Board, success: boolean) {
        const phase: BoardBreakPhase = success ? 'finished' : 'cancelled';
        this.onBoardBreakProgress(board, success ? 1 : 0, phase);
    }

    /**
     * 计算相对于摄像机的移动方向
     * @param joyDir 摇杆输入方向（2D）
     */
    private calculateMoveDirection(joyDir: Vec3 | { x: number; y: number }) {
        // 获取摄像机的世界旋转
        this.cameraNode.getWorldRotation(this._tempQuat);

        // 使用Vec3.transformQuat转换标准向量
        this._tempVec3_3.set(0, 0, -1); // 标准Forward向量
        Vec3.transformQuat(this._cameraForward, this._tempVec3_3, this._tempQuat);

        this._tempVec3_3.set(1, 0, 0); // 标准Right向量
        Vec3.transformQuat(this._cameraRight, this._tempVec3_3, this._tempQuat);

        // 将前方和右方向投影到水平面（Y=0）
        this._cameraForward.y = 0;
        this._cameraForward.normalize();

        this._cameraRight.y = 0;
        this._cameraRight.normalize();

        // 组合摇杆输入和摄像机方向
        Vec3.multiplyScalar(this._tempVec3_1, this._cameraForward, joyDir.y);
        Vec3.multiplyScalar(this._tempVec3_2, this._cameraRight, joyDir.x);
        Vec3.add(this._moveDirection, this._tempVec3_1, this._tempVec3_2);
        this._moveDirection.normalize();
    }

    /**
     * 平滑旋转角色面向移动方向
     */
    private rotateTowardsMovement(deltaTime: number) {
        if (this._moveDirection.lengthSqr() < 0.01) return;

        // 计算目标旋转（朝向移动方向）
        const targetY = Math.atan2(this._moveDirection.x, this._moveDirection.z) * (180 / Math.PI);
        Quat.fromEuler(this._targetRotation, 0, targetY, 0);

        // 平滑插值到目标旋转
        this.node.getRotation(this._tempQuat);
        Quat.slerp(this._tempQuat, this._tempQuat, this._targetRotation, this.rotationSpeed * deltaTime);
        this.node.setRotation(this._tempQuat);
    }

    /**
     * 刷新缓存（新增角色或木板时调用）
     */
    public refreshCache() {
        this._allCharacters = this.node.scene.getComponentsInChildren(CharacterState);
        this._allBoards = this.node.scene.getComponentsInChildren(Board);
        console.log(`[HunterController] 缓存了 ${this._allCharacters.length} 个角色, ${this._allBoards.length} 个木板`);
    }

    // ============ 攻击系统 ============

    /**
     * 检测附近的逃生者
     */
    private detectSurvivors() {
        let nearestSurvivor: Node | null = null;
        let nearestDistance = this.attackRange;

        this.node.getWorldPosition(this._tempVec3_1);

        for (const character of this._allCharacters) {
            // 只检测正常状态的逃生者
            if (!character.isNormal()) continue;

            character.node.getWorldPosition(this._tempVec3_2);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
            const distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestSurvivor = character.node;
            }
        }

        // 如果目标发生变化，触发回调
        if (nearestSurvivor !== this._nearestSurvivor) {
            this._nearestSurvivor = nearestSurvivor;
            this.notifyAttackTargetChange();
        }
    }

    /**
     * 触发攻击（由UI按钮调用）
     */
    public triggerAttack() {
        if (this._isStunned) {
            console.log('[HunterController] 眩晕中，无法攻击');
            return;
        }

        if (this.isMovementLocked()) {
            console.log('[HunterController] 正在进行其他动作，无法攻击');
            return;
        }

        if (!this._canAttack) {
            console.log('[HunterController] 攻击冷却中...');
            return;
        }

        if (!this._nearestSurvivor) {
            console.log('[HunterController] 附近没有可攻击的逃生者');
            return;
        }

        if (!this._hunter) {
            console.error('[HunterController] Hunter组件未找到');
            return;
        }

        // ✅ 任务3.1新增：播放攻击动画
        if (this.animationController) {
            this.animationController.playAttack();
        }

        // 执行攻击：调用Hunter的抓捕逻辑
        console.log(`[HunterController] 攻击 ${this._nearestSurvivor.name}`);
        this._hunter.catchSurvivor(this._nearestSurvivor);

        // 进入冷却
        this._canAttack = false;
        this._attackCooldownTimer = this.attackCooldown;
    }

    /**
     * 获取当前攻击目标
     */
    public getAttackTarget(): Node | null {
        return this._nearestSurvivor;
    }

    /**
     * 是否可以攻击
     */
    public canAttack(): boolean {
        if (this._isStunned || this.isMovementLocked()) {
            return false;
        }
        return this._canAttack && this._nearestSurvivor !== null;
    }

    /**
     * 获取攻击冷却进度（0-1）
     */
    public getAttackCooldownProgress(): number {
        if (this._canAttack) return 1.0;
        return 1.0 - (this._attackCooldownTimer / this.attackCooldown);
    }

    /**
     * 注册攻击目标变化回调
     */
    public onAttackTargetChange(callback: (target: Node | null) => void) {
        this._attackCallbacks.push(callback);
    }

    /**
     * 通知攻击目标变化
     */
    private notifyAttackTargetChange() {
        for (const callback of this._attackCallbacks) {
            callback(this._nearestSurvivor);
        }
    }

    // ============ 踩碎木板系统 ============

    /**
     * 检测附近的倒下木板
     */
    private detectBoards() {
        let nearestBoard: Board | null = null;
        let nearestDistance = this.boardBreakRange;

        this.node.getWorldPosition(this._tempVec3_1);

        for (const board of this._allBoards) {
            const state = board.getState();
            const isCurrentBreaking = board === this._activeBreakingBoard;

            if (state === BoardState.BROKEN || state === BoardState.STANDING || state === BoardState.FALLING) {
                continue;
            }

            if (state === BoardState.BREAKING && !isCurrentBreaking) {
                continue;
            }

            if (isCurrentBreaking) {
                nearestBoard = board;
                break;
            }

            board.node.getWorldPosition(this._tempVec3_2);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
            const distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestBoard = board;
            }
        }

        // 如果目标发生变化，触发回调
        if (nearestBoard !== this._nearestBoard) {
            this._nearestBoard = nearestBoard;
            this.notifyBoardTargetChange();
        }
    }

    /**
     * 触发踩碎木板（由UI按钮调用）
     */
    public triggerBreakBoard() {
        if (this._activeBreakingBoard) {
            console.log(`[HunterController] 取消踩碎 ${this._activeBreakingBoard.node.name}`);
            this._activeBreakingBoard.cancelBreak(this);
            return;
        }

        if (!this._nearestBoard) {
            console.log('[HunterController] 附近没有可踩碎的木板');
            return;
        }

        if (this._nearestBoard.beginBreak(this)) {
            console.log(`[HunterController] 开始踩碎木板 ${this._nearestBoard.node.name}`);
        } else {
            console.log('[HunterController] 木板当前不可踩碎');
        }
    }

    /**
     * 获取当前木板目标
     */
    public getBoardTarget(): Board | null {
        return this._activeBreakingBoard ?? this._nearestBoard;
    }

    /**
     * 是否可以踩碎木板
     */
    public canBreakBoard(): boolean {
        if (this._isStunned) {
            return false;
        }

        if (this._activeBreakingBoard) {
            return true;
        }

        const target = this._nearestBoard;
        return !!target && target.getState() === BoardState.DOWN;
    }

    /**
     * 注册木板目标变化回调
     */
    public onBoardTargetChange(callback: (board: Board | null) => void) {
        this._boardCallbacks.push(callback);
    }

    /**
     * 通知木板目标变化
     */
    private notifyBoardTargetChange() {
        for (const callback of this._boardCallbacks) {
            callback(this.getBoardTarget());
        }
    }

    // ============ 工具方法 ============

    /**
     * 是否正在移动
     */
    public isMoving(): boolean {
        if (this._isStunned || this.isMovementLocked()) {
            return false;
        }
        return this.joystick && this.joystick.isActive() && this.joystick.getStrength() > 0.01;
    }

    /**
     * 获取Hunter组件
     */
    public getHunter(): Hunter | null {
        return this._hunter;
    }
}
