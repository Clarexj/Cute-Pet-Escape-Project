// 文件名: PlayerController.ts
// 功能：逃生者角色移动控制（基于Transform，相对摄像机方向）+ 交互检测 + 救援系统
// 版本：V1.3 - 新增救援系统（任务2.1）

import { _decorator, Component, Node, Vec2, Vec3, Quat, PhysicsSystem, geometry } from 'cc';
import { Joystick } from './Joystick';
import { Interactable } from './Interactable';
import { CharacterState, CharacterStateType } from './CharacterState';
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

    @property
    public interactDistance: number = 2.5; // 交互检测距离（米）

    @property
    public rescueDistance: number = 2.0; // 救援检测距离（米）

    private _moveDirection: Vec3 = new Vec3(); // 世界空间移动方向
    private _targetRotation: Quat = new Quat(); // 目标旋转

    // 任务1.3新增：交互系统
    private _currentInteractable: Interactable | null = null; // 当前可交互的物体
    private _interactionCallbacks: ((interactable: Interactable | null) => void)[] = []; // 交互状态变化回调
    private _isInteracting: boolean = false; // 是否正在交互中（锁定移动）

    // 任务2.1新增：角色状态和救援系统
    private _characterState: CharacterState | null = null; // 角色状态组件
    private _currentRescueTarget: Node | null = null; // 当前救援目标
    private _rescueCallbacks: ((target: Node | null) => void)[] = []; // 救援目标变化回调

    // 性能优化：缓存场景中的可交互物体和角色
    private _allInteractables: Interactable[] = []; // 缓存所有可交互物体
    private _allCharacters: CharacterState[] = []; // 缓存所有角色

    // 性能优化：复用临时变量
    private _tempVec2: Vec2 = new Vec2(); // 用于接收摇杆方向
    private _tempVec3_1: Vec3 = new Vec3();
    private _tempVec3_2: Vec3 = new Vec3();
    private _tempVec3_3: Vec3 = new Vec3();
    private _tempQuat: Quat = new Quat();
    private _cameraForward: Vec3 = new Vec3();
    private _cameraRight: Vec3 = new Vec3();
    private _rayOrigin: Vec3 = new Vec3();
    private _rayDirection: Vec3 = new Vec3();

    start() {
        // 检查必需的引用
        if (!this.joystick) {
            console.error('[PlayerController] joystick未绑定！');
        }
        if (!this.cameraNode) {
            console.error('[PlayerController] cameraNode未绑定！');
        }

        // 获取角色状态组件
        this._characterState = this.node.getComponent(CharacterState);
        if (!this._characterState) {
            console.error('[PlayerController] CharacterState组件未找到！');
        }

        // ✅ 性能优化：在启动时缓存场景中的可交互物体和角色
        this.refreshInteractablesCache();
        this.refreshCharactersCache();
    }

    update(deltaTime: number) {
        if (!this.joystick || !this.cameraNode || !this._characterState) return;

        // 任务2.1：只有正常状态才能移动
        if (!this._characterState.isNormal()) {
            return;
        }

        // 如果正在交互中，禁止移动
        if (this._isInteracting) {
            return;
        }

        // ✅ 优化：获取摇杆输入（复用Vec2对象，避免GC）
        this.joystick.getDirectionOut(this._tempVec2);
        const joyStrength = this.joystick.getStrength();

        if (joyStrength > 0.01) {
            // 计算相对于摄像机的移动方向
            this.calculateMoveDirection(this._tempVec2);

            // 移动角色（复用对象）
            Vec3.multiplyScalar(this._tempVec3_1, this._moveDirection, this.moveSpeed * joyStrength * deltaTime);
            this.node.getPosition(this._tempVec3_2);
            Vec3.add(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
            this.node.setPosition(this._tempVec3_2);

            // 旋转角色面向移动方向
            this.rotateTowardsMovement(deltaTime);
        } else {
            // ✅ 修复：摇杆松开时重置移动方向
            this._moveDirection.set(0, 0, 0);
        }

        // 任务1.3新增：检测附近可交互物体
        this.detectInteractables();

        // 任务2.1新增：检测附近可救援的队友
        this.detectRescueTargets();
    }

    /**
     * 计算相对于摄像机的移动方向
     * @param joyDir 摇杆输入方向（2D）
     */
    private calculateMoveDirection(joyDir: Vec3 | { x: number; y: number }) {
        // 获取摄像机的世界旋转
        this.cameraNode.getWorldRotation(this._tempQuat);

        // ✅ 修复：使用Vec3.transformQuat转换标准向量（避免二次取负）
        // Cocos Creator标准坐标系：Z轴负方向是前方，X轴正方向是右方
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
        // 注意坐标系映射：
        //   - 摇杆Y轴（UI向上=正）→ 世界前后方向（摄像机Forward）
        //   - 摇杆X轴（UI向右=正）→ 世界左右方向（摄像机Right）
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

        // 平滑插值到目标旋转（复用对象）
        this.node.getRotation(this._tempQuat);
        Quat.slerp(this._tempQuat, this._tempQuat, this._targetRotation, this.rotationSpeed * deltaTime);
        this.node.setRotation(this._tempQuat);
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
        return this.joystick && this.joystick.isActive() && this.joystick.getStrength() > 0.01;
    }

    // ============ 任务1.3新增：交互系统 ============

    /**
     * 刷新可交互物体缓存（新增物体时调用）
     */
    public refreshInteractablesCache() {
        this._allInteractables = this.node.scene.getComponentsInChildren(Interactable);
        console.log(`[PlayerController] 缓存了 ${this._allInteractables.length} 个可交互物体`);
    }

    /**
     * 刷新角色缓存（新增角色时调用）
     */
    public refreshCharactersCache() {
        this._allCharacters = this.node.scene.getComponentsInChildren(CharacterState);
        console.log(`[PlayerController] 缓存了 ${this._allCharacters.length} 个角色`);
    }

    /**
     * 检测附近的可交互物体（使用缓存的列表）
     */
    private detectInteractables() {
        let closestInteractable: Interactable | null = null;
        let closestDistance = this.interactDistance;

        // 获取玩家位置
        this.node.getWorldPosition(this._rayOrigin);

        // ✅ 优化：使用缓存的列表而非每帧遍历场景树
        for (const interactable of this._allInteractables) {
            if (!interactable.canInteract()) continue;

            // 获取可交互物体位置
            interactable.node.getWorldPosition(this._tempVec3_1);

            // 计算距离
            Vec3.subtract(this._tempVec3_2, this._tempVec3_1, this._rayOrigin);
            const distance = this._tempVec3_2.length();

            // 检查是否在交互范围内
            const range = Math.min(this.interactDistance, interactable.getInteractRange());
            if (distance <= range && distance < closestDistance) {
                closestDistance = distance;
                closestInteractable = interactable;
            }
        }

        // 如果当前可交互物体发生变化，触发回调
        if (closestInteractable !== this._currentInteractable) {
            this._currentInteractable = closestInteractable;
            this.notifyInteractionChange();
        }
    }

    /**
     * 触发交互（由UI按钮调用）
     */
    public triggerInteraction() {
        if (this._currentInteractable && this._currentInteractable.canInteract()) {
            this._currentInteractable.interact(this.node);
            console.log(`[PlayerController] 与 ${this._currentInteractable.node.name} 交互`);
        } else {
            console.log('[PlayerController] 附近没有可交互的物体');
        }
    }

    /**
     * 获取当前可交互的物体
     */
    public getCurrentInteractable(): Interactable | null {
        return this._currentInteractable;
    }

    /**
     * 注册交互状态变化回调
     * @param callback 回调函数
     */
    public onInteractionChange(callback: (interactable: Interactable | null) => void) {
        this._interactionCallbacks.push(callback);
    }

    /**
     * 通知交互状态变化
     */
    private notifyInteractionChange() {
        for (const callback of this._interactionCallbacks) {
            callback(this._currentInteractable);
        }
    }

    /**
     * 锁定玩家移动（用于交互动画期间）
     * @param locked 是否锁定
     */
    public setMovementLocked(locked: boolean) {
        this._isInteracting = locked;
        if (locked) {
            console.log('[PlayerController] 移动已锁定（交互中）');
        } else {
            console.log('[PlayerController] 移动已解锁');
        }
    }

    /**
     * 是否正在交互中
     */
    public isInteracting(): boolean {
        return this._isInteracting;
    }

    // ============ 任务2.1新增：救援系统 ============

    /**
     * 检测附近可救援的队友（使用缓存的列表）
     */
    private detectRescueTargets() {
        // 只有正常状态才能救援
        if (!this._characterState || !this._characterState.isNormal()) {
            return;
        }

        let nearestTarget: Node | null = null;
        let nearestDistance = this.rescueDistance;

        this.node.getWorldPosition(this._rayOrigin);

        // ✅ 优化：使用缓存的列表而非每帧遍历场景树
        for (const character of this._allCharacters) {
            // 跳过自己
            if (character.node === this.node) continue;

            // 只检测被挂起且可以救援的队友
            if (!character.canBeRescued()) continue;

            character.node.getWorldPosition(this._tempVec3_1);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_1, this._rayOrigin);
            const distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestTarget = character.node;
            }
        }

        // 如果救援目标发生变化，触发回调
        if (nearestTarget !== this._currentRescueTarget) {
            this._currentRescueTarget = nearestTarget;
            this.notifyRescueTargetChange();
        }
    }

    /**
     * 触发救援（由UI按钮调用）
     */
    public triggerRescue() {
        if (!this._currentRescueTarget) {
            console.log('[PlayerController] 附近没有可救援的队友');
            return;
        }

        const targetState = this._currentRescueTarget.getComponent(CharacterState);
        if (!targetState || !targetState.canBeRescued()) {
            console.log('[PlayerController] 目标无法救援');
            return;
        }

        // 开始救援
        const success = targetState.startRescue(this.node);
        if (success) {
            // 锁定自己的移动
            this.setMovementLocked(true);
            console.log(`[PlayerController] 开始救援 ${this._currentRescueTarget.name}`);
        }
    }

    /**
     * 取消救援
     */
    public cancelRescue() {
        if (!this._currentRescueTarget) return;

        const targetState = this._currentRescueTarget.getComponent(CharacterState);
        if (targetState) {
            targetState.cancelRescue();
        }

        // 解锁移动
        this.setMovementLocked(false);
        console.log('[PlayerController] 取消救援');
    }

    /**
     * 获取当前救援目标
     */
    public getCurrentRescueTarget(): Node | null {
        return this._currentRescueTarget;
    }

    /**
     * 注册救援目标变化回调
     */
    public onRescueTargetChange(callback: (target: Node | null) => void) {
        this._rescueCallbacks.push(callback);
    }

    /**
     * 通知救援目标变化
     */
    private notifyRescueTargetChange() {
        for (const callback of this._rescueCallbacks) {
            callback(this._currentRescueTarget);
        }
    }

    /**
     * 获取角色状态组件
     */
    public getCharacterState(): CharacterState | null {
        return this._characterState;
    }
}
