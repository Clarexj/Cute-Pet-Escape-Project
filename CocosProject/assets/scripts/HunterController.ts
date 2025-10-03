// 文件名: HunterController.ts
// 功能：追捕者可控移动 + 攻击 + 踩碎木板（任务2.2）
// 版本：V1.1 - 新增动画控制（任务3.1）

import { _decorator, Component, Node, Vec2, Vec3, Quat, PhysicsSystem } from 'cc';
import { Joystick } from './Joystick';
import { CharacterState, CharacterStateType } from './CharacterState';
import { Hunter } from './Hunter';
import { Board } from './Board';
import { CharacterAnimationController } from './CharacterAnimationController';
const { ccclass, property } = _decorator;

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

        // 如果正在携带逃生者，禁止移动（由Hunter组件处理）
        if (this._hunter && this._hunter.isCarrying()) {
            return;
        }

        // 获取摇杆输入
        this.joystick.getDirectionOut(this._tempVec2);
        const joyStrength = this.joystick.getStrength();

        if (joyStrength > 0.01) {
            // 计算相对于摄像机的移动方向
            this.calculateMoveDirection(this._tempVec2);

            // 移动角色
            Vec3.multiplyScalar(this._tempVec3_1, this._moveDirection, this.moveSpeed * joyStrength * deltaTime);
            this.node.getPosition(this._tempVec3_2);
            Vec3.add(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
            this.node.setPosition(this._tempVec3_2);

            // 旋转角色面向移动方向
            this.rotateTowardsMovement(deltaTime);
        } else {
            // 摇杆松开时重置移动方向
            this._moveDirection.set(0, 0, 0);
        }

        // 检测附近的逃生者（用于攻击）
        this.detectSurvivors();

        // 检测附近的倒下木板（用于踩碎）
        this.detectBoards();

        // ✅ 任务3.1新增：更新动画状态
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
            // 只检测已倒下的木板
            if (board.getState() !== 'down') continue;

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
        if (!this._nearestBoard) {
            console.log('[HunterController] 附近没有可踩碎的木板');
            return;
        }

        console.log(`[HunterController] 踩碎木板 ${this._nearestBoard.node.name}`);
        this._nearestBoard.breakBoard();

        // 木板消失
        this._nearestBoard.node.active = false;

        // 清空引用
        this._nearestBoard = null;
        this.notifyBoardTargetChange();
    }

    /**
     * 获取当前木板目标
     */
    public getBoardTarget(): Board | null {
        return this._nearestBoard;
    }

    /**
     * 是否可以踩碎木板
     */
    public canBreakBoard(): boolean {
        return this._nearestBoard !== null;
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
            callback(this._nearestBoard);
        }
    }

    // ============ 工具方法 ============

    /**
     * 是否正在移动
     */
    public isMoving(): boolean {
        return this.joystick && this.joystick.isActive() && this.joystick.getStrength() > 0.01;
    }

    /**
     * 获取Hunter组件
     */
    public getHunter(): Hunter | null {
        return this._hunter;
    }
}
