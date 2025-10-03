// 文件名: Ore.ts
// 功能：矿石交互（拾取后消失）
// 版本：V1.1 - 新增GameManager统计通知（任务2.2）

import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Interactable } from './Interactable';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Ore')
export class Ore extends Interactable {
    @property
    public collectDuration: number = 0.3; // 拾取动画时长（秒）

    @property
    public collectScaleUp: number = 1.5; // 拾取时放大倍数

    @property
    public floatUpDistance: number = 1.0; // 向上漂浮距离

    private _isCollecting: boolean = false; // 是否正在拾取中

    start() {
        // 设置交互提示
        this.interactPrompt = "拾取矿石";
        this.canInteractMultipleTimes = false; // 只能拾取一次
    }

    /**
     * 检查是否可以交互
     */
    public canInteract(): boolean {
        // 如果正在拾取中，不能再次交互
        return !this._isCollecting && super.canInteract();
    }

    /**
     * 执行交互：拾取矿石
     */
    protected onInteract(player: Node): void {
        if (this._isCollecting) {
            return;
        }

        console.log('[Ore] 矿石被拾取！');
        this.collect();
    }

    /**
     * 拾取动画
     */
    private collect() {
        this._isCollecting = true;

        // 通知GameManager
        const gameManager = GameManager.getInstance();
        if (gameManager) {
            gameManager.onOreCollected(this.node);
        }

        // 保存初始位置和缩放
        const initialPosition = this.node.position.clone();
        const initialScale = this.node.scale.clone();

        // 目标位置（向上漂浮）
        const targetPosition = new Vec3(
            initialPosition.x,
            initialPosition.y + this.floatUpDistance,
            initialPosition.z
        );

        // 目标缩放（放大后缩小到0）
        const enlargeScale = new Vec3(
            initialScale.x * this.collectScaleUp,
            initialScale.y * this.collectScaleUp,
            initialScale.z * this.collectScaleUp
        );

        // 使用tween实现拾取动画
        tween(this.node)
            // 第一阶段：放大 + 向上漂浮（前60%时间）
            .to(this.collectDuration * 0.6, {
                position: targetPosition,
                scale: enlargeScale
            }, {
                easing: 'quadOut'
            })
            // 第二阶段：缩小到0（后40%时间）
            .to(this.collectDuration * 0.4, {
                scale: Vec3.ZERO
            }, {
                easing: 'quadIn'
            })
            // 动画完成后销毁节点
            .call(() => {
                console.log('[Ore] 矿石拾取完成，节点销毁');
                this.node.destroy();
            })
            .start();
    }

    /**
     * 获取是否正在拾取中
     */
    public isCollecting(): boolean {
        return this._isCollecting;
    }
}
