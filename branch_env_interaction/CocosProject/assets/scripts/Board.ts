// 文件名: Board.ts
// 功能：木板交互（推倒木板，旋转90度倒下）

import { _decorator, Node, tween, Vec3, Quat, Collider } from 'cc';
import { Interactable } from './Interactable';
import { PlayerController } from './PlayerController';
import { HunterController } from './HunterController';
const { ccclass, property } = _decorator;

/**
 * 木板状态
 */
export enum BoardState {
    STANDING = 'standing',      // 直立
    FALLING = 'falling',        // 倒下中
    DOWN = 'down',              // 已倒下形成路障
    BREAKING = 'breaking',      // 追捕者踩碎中
    BROKEN = 'broken'           // 已破碎
}

@ccclass('Board')
export class Board extends Interactable {
    @property
    public fallDuration: number = 1.0; // 倒下动画时长（秒）

    @property
    public fallDirection: Vec3 = new Vec3(0, 0, 1); // 倒下方向（世界空间）

    @property
    public stunRadius: number = 1.5; // 砸中判定半径

    @property
    public stunDuration: number = 1.5; // 眩晕时间

    @property
    public stunOffset: number = 1.2; // 从木板中心向倒下方向偏移的判定点（米）

    @property
    public breakDuration: number = 2.5; // 追捕者踩碎所需时长（秒）

    @property(Collider)
    public obstacleCollider: Collider | null = null; // 倒下后的阻挡碰撞体

    private _state: BoardState = BoardState.STANDING;
    private _initialRotation: Quat = new Quat();
    private _breakingHunter: HunterController | null = null;
    private _breakTimer: number = 0;

    private _tempVec3A: Vec3 = new Vec3();
    private _tempVec3B: Vec3 = new Vec3();

    start() {
        // 记录初始旋转
        this.node.getRotation(this._initialRotation);

        // 设置交互提示
        this.interactPrompt = "推倒木板";
        this.canInteractMultipleTimes = false; // 只能推倒一次

        if (!this.obstacleCollider) {
            this.obstacleCollider = this.node.getComponent(Collider);
        }

        if (this.obstacleCollider) {
            this.obstacleCollider.enabled = false;
        }
    }

    update(deltaTime: number) {
        if (this._state !== BoardState.BREAKING || !this._breakingHunter) {
            return;
        }

        this._breakTimer += deltaTime;
        const progress = Math.min(this._breakTimer / this.breakDuration, 1.0);
        this._breakingHunter.onBoardBreakProgress(this, progress, 'progress');

        if (progress >= 1.0) {
            console.log(`[Board] ${this.node.name} 被踩碎`);
            this.finishBreaking(true);
        }
    }

    /**
     * 检查是否可以交互
     */
    public canInteract(): boolean {
        // 只有直立状态才能交互
        return this._state === BoardState.STANDING && super.canInteract();
    }

    /**
     * 执行交互：推倒木板
     */
    protected onInteract(player: Node): void {
        if (this._state !== BoardState.STANDING) {
            return;
        }

        console.log('[Board] 木板被推倒！');

        // 锁定玩家移动
        const playerController = player.getComponent(PlayerController);
        if (playerController) {
            playerController.setMovementLocked(true);
        }

        this.fallDown(playerController);
    }

    /**
     * 木板倒下动画
     */
    private fallDown(playerController: PlayerController | null) {
        this._state = BoardState.FALLING;

        // 规范化倒下方向
        const fallDir = this.fallDirection.clone().normalize();

        // 计算倒下的目标旋转（绕X轴或Z轴旋转90度）
        // 这里简化处理：假设木板绕X轴旋转
        const targetRotation = new Quat();

        // 根据倒下方向计算旋转轴
        // 如果倒向+Z方向，绕X轴正向旋转90度
        // 如果倒向-Z方向，绕X轴负向旋转90度
        // 如果倒向+X方向，绕Z轴负向旋转90度
        // 如果倒向-X方向，绕Z轴正向旋转90度

        let rotationAxis = new Vec3();
        if (Math.abs(fallDir.z) > Math.abs(fallDir.x)) {
            // 主要沿Z轴倒下，绕X轴旋转
            rotationAxis.set(1, 0, 0);
            const angle = fallDir.z > 0 ? 90 : -90;
            Quat.fromAxisAngle(targetRotation, rotationAxis, angle * Math.PI / 180);
        } else {
            // 主要沿X轴倒下，绕Z轴旋转
            rotationAxis.set(0, 0, 1);
            const angle = fallDir.x > 0 ? -90 : 90;
            Quat.fromAxisAngle(targetRotation, rotationAxis, angle * Math.PI / 180);
        }

        // 组合初始旋转和倒下旋转
        Quat.multiply(targetRotation, this._initialRotation, targetRotation);

        // 使用tween动画实现平滑旋转
        const startRotation = this.node.rotation.clone();

        tween(this.node)
            .to(this.fallDuration, {
                rotation: targetRotation
            }, {
                easing: 'cubicOut', // 使用缓出效果，更自然
                onUpdate: () => {
                    // 可以在这里添加音效或粒子效果
                }
            })
            .call(() => {
                // 倒下完成
                this._state = BoardState.DOWN;
                console.log('[Board] 木板倒下完成');

                // 解锁玩家移动
                if (playerController) {
                    playerController.setMovementLocked(false);
                }

                this.onFallComplete();
            })
            .start();
    }

    /**
     * 倒下完成回调
     */
    private onFallComplete() {
        if (this.obstacleCollider) {
            this.obstacleCollider.enabled = true;
        }

        this._state = BoardState.DOWN;
        this.tryStunHunter();
    }

    /**
     * 检查是否砸到追捕者
     */
    private tryStunHunter() {
        const hunters = this.node.scene?.getComponentsInChildren(HunterController) ?? [];
        if (!hunters.length) {
            return;
        }

        const impactCenter = this._tempVec3A;
        this.node.getWorldPosition(impactCenter);

        const fallDir = this.fallDirection.clone();
        if (fallDir.lengthSqr() < 1e-4) {
            fallDir.set(0, 0, 1);
        }
        fallDir.normalize();

        Vec3.multiplyScalar(this._tempVec3B, fallDir, this.stunOffset);
        Vec3.add(impactCenter, impactCenter, this._tempVec3B);

        for (const hunter of hunters) {
            hunter.node.getWorldPosition(this._tempVec3B);
            const distance = Vec3.distance(impactCenter, this._tempVec3B);

            if (distance <= this.stunRadius) {
                console.log(`[Board] ${hunter.node.name} 被砸中，眩晕 ${this.stunDuration} 秒`);
                hunter.applyStun(this.stunDuration, this.node);
            }
        }
    }

    /**
     * 获取当前状态
     */
    public getState(): BoardState {
        return this._state;
    }

    /**
     * 重置木板（用于测试）
     */
    public reset() {
        this._state = BoardState.STANDING;
        this.node.setRotation(this._initialRotation);
        this.resetInteraction();
        this._breakingHunter = null;
        this._breakTimer = 0;
        this.node.active = true;
        if (this.obstacleCollider) {
            this.obstacleCollider.enabled = false;
        }
    }

    /**
     * 追捕者踩碎木板（预留接口）
     */
    public breakBoard() {
        if (this._state === BoardState.BROKEN) {
            return;
        }

        if (this._state === BoardState.BREAKING && this._breakingHunter) {
            this.finishBreaking(true);
            return;
        }

        console.log('[Board] breakBoard() 被直接调用，立即移除路障');
        this.disableObstacle();
        this._state = BoardState.BROKEN;
        this.node.active = false;
    }

    /**
     * 追捕者请求踩碎木板
     */
    public beginBreak(hunter: HunterController): boolean {
        if (this._state !== BoardState.DOWN || this._breakingHunter) {
            console.warn('[Board] 当前无法开始踩碎流程');
            return false;
        }

        console.log(`[Board] ${hunter.node.name} 开始踩碎 ${this.node.name}`);
        this._state = BoardState.BREAKING;
        this._breakingHunter = hunter;
        this._breakTimer = 0;
        hunter.onBoardBreakProgress(this, 0, 'start');
        return true;
    }

    /**
     * 中断踩碎
     */
    public cancelBreak(hunter: HunterController) {
        if (this._state !== BoardState.BREAKING || this._breakingHunter !== hunter) {
            return;
        }

        console.log(`[Board] ${hunter.node.name} 中断踩碎 ${this.node.name}`);
        this.finishBreaking(false);
    }

    private finishBreaking(success: boolean) {
        const hunter = this._breakingHunter;

        if (hunter) {
            hunter.onBoardBreakFinished(this, success);
        }

        this._breakingHunter = null;
        this._breakTimer = 0;

        if (success) {
            this.disableObstacle();
            this._state = BoardState.BROKEN;
            this.node.active = false;
        } else {
            this._state = BoardState.DOWN;
        }
    }

    private disableObstacle() {
        if (this.obstacleCollider) {
            this.obstacleCollider.enabled = false;
        }
    }
}
