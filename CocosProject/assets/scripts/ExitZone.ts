// 文件名: ExitZone.ts
// 功能：逃脱区域（任务2.2）
// 逃生者进入此区域即可逃脱，计入逃脱人数

import { _decorator, Component, Node, BoxCollider, ITriggerEvent } from 'cc';
import { CharacterState, CharacterStateType } from './CharacterState';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ExitZone')
export class ExitZone extends Component {
    @property
    public exitPrompt: string = "逃脱区域"; // 区域提示文字

    @property
    public requireOreCount: number = 0; // 逃脱所需矿石数量（0=不需要）

    @property
    public destroySurvivorOnExit: boolean = false; // 逃脱后是否销毁逃生者节点

    private _escapedSurvivors: Set<Node> = new Set(); // 已逃脱的逃生者（防止重复计数）

    start() {
        // 设置触发器监听
        const collider = this.node.getComponent(BoxCollider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.isTrigger = true; // 确保是触发器模式
            console.log('[ExitZone] 逃脱区域初始化完成');
        } else {
            console.error('[ExitZone] 未找到BoxCollider组件！请添加BoxCollider并设置为Trigger');
        }
    }

    /**
     * 触发器进入
     */
    private onTriggerEnter(event: ITriggerEvent) {
        const survivorNode = event.otherCollider.node;

        // 检查是否是逃生者
        const characterState = survivorNode.getComponent(CharacterState);
        if (!characterState) {
            return; // 不是角色，忽略
        }

        // 只有正常状态的逃生者才能逃脱
        if (!characterState.isNormal()) {
            console.log(`[ExitZone] ${survivorNode.name} 不是正常状态，无法逃脱`);
            return;
        }

        // 检查是否已经逃脱过（防止重复计数）
        if (this._escapedSurvivors.has(survivorNode)) {
            return;
        }

        // 检查矿石数量（可选）
        if (this.requireOreCount > 0) {
            const gameManager = GameManager.getInstance();
            if (gameManager) {
                const stats = gameManager.getStats();
                if (stats.oreCollected < this.requireOreCount) {
                    console.log(`[ExitZone] ${survivorNode.name} 矿石数量不足 (${stats.oreCollected}/${this.requireOreCount})`);
                    return;
                }
            }
        }

        // 逃脱成功
        this.onSurvivorEscape(survivorNode, characterState);
    }

    /**
     * 逃生者逃脱
     */
    private onSurvivorEscape(survivorNode: Node, characterState: CharacterState) {
        console.log(`[ExitZone] ${survivorNode.name} 成功逃脱！`);

        // 标记为已逃脱
        this._escapedSurvivors.add(survivorNode);

        // 通知GameManager
        const gameManager = GameManager.getInstance();
        if (gameManager) {
            gameManager.onSurvivorEscaped(survivorNode);
        }

        // 处理逃生者节点
        if (this.destroySurvivorOnExit) {
            // 销毁节点（模拟离开场景）
            survivorNode.destroy();
        } else {
            // 隐藏节点（保留用于调试）
            survivorNode.active = false;
        }
    }

    /**
     * 获取已逃脱人数
     */
    public getEscapedCount(): number {
        return this._escapedSurvivors.size;
    }

    /**
     * 重置逃脱记录（用于重新开始游戏）
     */
    public reset() {
        this._escapedSurvivors.clear();
        console.log('[ExitZone] 逃脱记录已重置');
    }
}
