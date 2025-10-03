// 文件名: Cage.ts
// 功能：笼子组件（任务2.1）
// 用于挂起逃生者的位置

import { _decorator, Component, Node } from 'cc';
import { CharacterState } from './CharacterState';
const { ccclass, property } = _decorator;

@ccclass('Cage')
export class Cage extends Component {
    @property
    public maxCapacity: number = 1; // 最大容量（可以挂起几个逃生者）

    private _hangedSurvivors: Node[] = []; // 当前挂起的逃生者列表

    start() {
        console.log(`[Cage] 笼子 ${this.node.name} 初始化，最大容量：${this.maxCapacity}`);
    }

    /**
     * 挂起一个逃生者
     * @param survivorNode 逃生者节点
     * @returns 是否成功挂起
     */
    public hangSurvivor(survivorNode: Node): boolean {
        // 检查容量
        if (this._hangedSurvivors.length >= this.maxCapacity) {
            console.warn(`[Cage] ${this.node.name} 已满，无法挂起更多逃生者`);
            return false;
        }

        // 检查是否已经挂在这个笼子上
        if (this._hangedSurvivors.includes(survivorNode)) {
            console.warn(`[Cage] ${survivorNode.name} 已经挂在 ${this.node.name} 上`);
            return false;
        }

        // 添加到列表
        this._hangedSurvivors.push(survivorNode);

        console.log(`[Cage] ${survivorNode.name} 被挂在 ${this.node.name} 上（${this._hangedSurvivors.length}/${this.maxCapacity}）`);

        // 监听状态变化，如果被救或淘汰，从列表移除
        const characterState = survivorNode.getComponent(CharacterState);
        if (characterState) {
            characterState.onStateChange((oldState, newState) => {
                if (newState !== 'hanged') {
                    this.removeSurvivor(survivorNode);
                }
            });
        }

        return true;
    }

    /**
     * 从笼子移除逃生者（救援成功或淘汰）
     */
    public removeSurvivor(survivorNode: Node) {
        const index = this._hangedSurvivors.indexOf(survivorNode);
        if (index === -1) return;

        this._hangedSurvivors.splice(index, 1);
        console.log(`[Cage] ${survivorNode.name} 离开 ${this.node.name}（${this._hangedSurvivors.length}/${this.maxCapacity}）`);
    }

    /**
     * 获取当前挂起的逃生者数量
     */
    public getHangedCount(): number {
        return this._hangedSurvivors.length;
    }

    /**
     * 是否已满
     */
    public isFull(): boolean {
        return this._hangedSurvivors.length >= this.maxCapacity;
    }

    /**
     * 获取所有挂起的逃生者
     */
    public getHangedSurvivors(): Node[] {
        return [...this._hangedSurvivors]; // 返回副本
    }
}
