// 文件名: Board.ts
// 功能：木板交互（推倒木板，旋转90度倒下）

import { _decorator, Component, Node, tween, Vec3, Quat } from 'cc';
import { Interactable } from './Interactable';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

/**
 * 木板状态
 */
enum BoardState {
    STANDING = 'standing',  // 直立
    FALLING = 'falling',    // 倒下中
    DOWN = 'down',          // 已倒下
    BROKEN = 'broken'       // 已破碎（预留给追捕者交互）
}

@ccclass('Board')
export class Board extends Interactable {
    @property
    public fallDuration: number = 1.0; // 倒下动画时长（秒）

    @property
    public fallDirection: Vec3 = new Vec3(0, 0, 1); // 倒下方向（世界空间）

    private _state: BoardState = BoardState.STANDING;
    private _initialRotation: Quat = new Quat();

    start() {
        // 记录初始旋转
        this.node.getRotation(this._initialRotation);

        // 设置交互提示
        this.interactPrompt = "推倒木板";
        this.canInteractMultipleTimes = false; // 只能推倒一次
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
        // 可以在这里添加额外逻辑
        // 例如：检查是否砸到追捕者，成为路障等
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
    }

    /**
     * 追捕者踩碎木板（预留接口）
     */
    public breakBoard() {
        if (this._state === BoardState.DOWN) {
            this._state = BoardState.BROKEN;
            // 可以添加破碎动画和销毁节点
            console.log('[Board] 木板被踩碎');
            // this.node.destroy(); // 暂不销毁，方便测试
        }
    }
}
