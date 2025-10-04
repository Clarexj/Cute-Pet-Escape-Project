// 文件名: Hunter.ts
// 功能：追捕者原型（任务2.1）
// 简化版追捕者，用于测试抓捕和挂起逻辑

import { _decorator, Component, Node, Vec3, BoxCollider, ITriggerEvent } from 'cc';
import { CharacterState, CharacterStateType } from './CharacterState';
const { ccclass, property } = _decorator;

@ccclass('Hunter')
export class Hunter extends Component {
    @property
    public moveSpeed: number = 5.75; // 移动速度（115% = 5 * 1.15）

    @property
    public catchRange: number = 1.5; // 抓捕范围（米）

    @property
    public autoCatchEnabled: boolean = true; // 是否自动抓捕（用于测试）

    private _carriedSurvivor: Node | null = null; // 携带的逃生者
    private _nearestCage: Node | null = null; // 最近的笼子

    // 临时变量
    private _tempVec3_1: Vec3 = new Vec3();
    private _tempVec3_2: Vec3 = new Vec3();

    start() {
        console.log('[Hunter] 追捕者初始化');

        // 设置碰撞检测（如果有BoxCollider）
        const collider = this.node.getComponent(BoxCollider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.on('onTriggerStay', this.onTriggerStay, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
        }
    }

    update(deltaTime: number) {
        // 如果携带了逃生者，检测是否靠近笼子
        if (this._carriedSurvivor) {
            this.checkNearCage();
        }

        // 如果启用自动抓捕，检测附近的逃生者
        if (this.autoCatchEnabled && !this._carriedSurvivor) {
            this.autoDetectSurvivors();
        }
    }

    // ============ 碰撞检测 ============

    /**
     * 碰撞进入
     */
    private onTriggerEnter(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        // 检查是否是逃生者
        const characterState = otherNode.getComponent(CharacterState);
        if (characterState && characterState.isNormal() && !this._carriedSurvivor) {
            this.catchSurvivor(otherNode);
        }

        // 检查是否是笼子
        if (otherNode.name.includes('Cage') || otherNode.name.includes('cage')) {
            this._nearestCage = otherNode;
        }
    }

    /**
     * 碰撞持续
     */
    private onTriggerStay(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        // 检查是否碰到正在救援的逃生者，打断救援
        const characterState = otherNode.getComponent(CharacterState);
        if (characterState && characterState.isNormal()) {
            // 检查这个逃生者是否正在救援别人
            const playerController = otherNode.getComponent('PlayerController');
            if (playerController && typeof playerController.getCurrentRescueTarget === 'function') {
                const rescueTarget = playerController.getCurrentRescueTarget();
                if (rescueTarget) {
                    // 正在救援，打断救援并抓捕
                    console.log(`[Hunter] 打断 ${otherNode.name} 的救援行为`);
                    playerController.cancelRescue();

                    // 如果还没携带逃生者，抓捕这个救援者
                    if (!this._carriedSurvivor) {
                        this.catchSurvivor(otherNode);
                    }
                }
            }
        }
    }

    /**
     * 碰撞退出
     */
    private onTriggerExit(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;

        // 离开笼子范围
        if (otherNode === this._nearestCage) {
            this._nearestCage = null;
        }
    }

    // ============ 抓捕逻辑 ============

    /**
     * 自动检测附近的逃生者（简化版AI）
     */
    private autoDetectSurvivors() {
        // 查找所有逃生者
        const allSurvivors = this.node.scene.getComponentsInChildren(CharacterState);

        let nearestSurvivor: Node | null = null;
        let nearestDistance = this.catchRange;

        this.node.getWorldPosition(this._tempVec3_1);

        for (const survivor of allSurvivors) {
            // 跳过非正常状态的逃生者
            if (!survivor.isNormal()) continue;

            survivor.node.getWorldPosition(this._tempVec3_2);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
            const distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestSurvivor = survivor.node;
            }
        }

        // 如果找到附近的逃生者，抓捕
        if (nearestSurvivor) {
            this.catchSurvivor(nearestSurvivor);
        }
    }

    /**
     * 抓捕逃生者
     */
    public catchSurvivor(survivorNode: Node) {
        if (this._carriedSurvivor) {
            console.warn('[Hunter] 已经携带了一个逃生者，无法再次抓捕');
            return;
        }

        const characterState = survivorNode.getComponent(CharacterState);
        if (!characterState) {
            console.error('[Hunter] 目标节点没有CharacterState组件');
            return;
        }

        if (!characterState.isNormal()) {
            console.warn(`[Hunter] ${survivorNode.name} 不是正常状态，无法抓捕`);
            return;
        }

        // 设置逃生者状态为被抓
        characterState.setCaught(this.node);
        this._carriedSurvivor = survivorNode;

        console.log(`[Hunter] 抓住了 ${survivorNode.name}`);

        // 将逃生者设置为追捕者的子节点（视觉上跟随）
        survivorNode.setParent(this.node);
        survivorNode.setPosition(0, 2, 0); // 放在追捕者上方
    }

    /**
     * 检测是否靠近笼子
     */
    private checkNearCage() {
        if (!this._carriedSurvivor) return;

        // 查找场景中的笼子
        const allNodes = this.node.scene.children;
        let nearestCage: Node | null = null;
        let nearestDistance = 2.0; // 笼子检测范围

        this.node.getWorldPosition(this._tempVec3_1);

        for (const sceneNode of allNodes) {
            if (sceneNode.name.includes('Cage') || sceneNode.name.includes('cage')) {
                sceneNode.getWorldPosition(this._tempVec3_2);
                Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
                const distance = this._tempVec3_2.length();

                if (distance <= nearestDistance) {
                    nearestDistance = distance;
                    nearestCage = sceneNode;
                }
            }
        }

        // 如果靠近笼子，挂起逃生者
        if (nearestCage) {
            this.hangSurvivorOnCage(nearestCage);
        }
    }

    /**
     * 将逃生者挂在笼子上
     */
    private hangSurvivorOnCage(cageNode: Node) {
        if (!this._carriedSurvivor) return;

        const characterState = this._carriedSurvivor.getComponent(CharacterState);
        if (!characterState) return;

        console.log(`[Hunter] 将 ${this._carriedSurvivor.name} 挂在 ${cageNode.name} 上`);

        // 设置逃生者状态为被挂起
        characterState.setHanged();

        // 将逃生者设置为笼子的子节点
        this._carriedSurvivor.setParent(cageNode);
        this._carriedSurvivor.setPosition(0, 1.5, 0); // 笼子上方

        // 清除携带引用
        this._carriedSurvivor = null;
    }

    // ============ 手动控制接口（用于测试） ============

    /**
     * 手动触发抓捕（用于测试）
     */
    public manualCatch(survivorNode: Node) {
        this.catchSurvivor(survivorNode);
    }

    /**
     * 手动触发挂起（用于测试）
     */
    public manualHang(cageNode: Node) {
        if (this._carriedSurvivor) {
            this.hangSurvivorOnCage(cageNode);
        } else {
            console.warn('[Hunter] 没有携带逃生者，无法挂起');
        }
    }

    /**
     * 获取携带的逃生者
     */
    public getCarriedSurvivor(): Node | null {
        return this._carriedSurvivor;
    }

    /**
     * 是否正在携带逃生者
     */
    public isCarrying(): boolean {
        return this._carriedSurvivor !== null;
    }
}
