// 文件名: Interactable.ts
// 功能：可交互物体基类（任务1.3）

import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Interactable')
export class Interactable extends Component {
    @property
    public interactRange: number = 2.0; // 交互范围（米）

    @property
    public interactPrompt: string = "交互"; // 交互提示文本

    @property
    public canInteractMultipleTimes: boolean = true; // 是否可以多次交互

    protected _hasInteracted: boolean = false; // 是否已经交互过

    /**
     * 检查是否可以交互
     * @returns 是否可以交互
     */
    public canInteract(): boolean {
        if (!this.canInteractMultipleTimes && this._hasInteracted) {
            return false;
        }
        return true;
    }

    /**
     * 执行交互（子类需要重写此方法）
     * @param player 触发交互的玩家节点
     */
    public interact(player: Node): void {
        if (!this.canInteract()) {
            return;
        }

        this._hasInteracted = true;
        this.onInteract(player);
    }

    /**
     * 子类重写此方法实现具体交互逻辑
     * @param player 触发交互的玩家节点
     */
    protected onInteract(player: Node): void {
        console.log(`[Interactable] ${this.node.name} 被交互了！`);
    }

    /**
     * 获取交互提示文本
     */
    public getInteractPrompt(): string {
        return this.interactPrompt;
    }

    /**
     * 获取交互范围
     */
    public getInteractRange(): number {
        return this.interactRange;
    }

    /**
     * 重置交互状态（用于可以多次交互的物体）
     */
    public resetInteraction(): void {
        this._hasInteracted = false;
    }
}
