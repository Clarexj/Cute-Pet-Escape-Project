// 文件名: Cabinet.ts
// 功能：储物柜交互（逃生者躲藏 / 追捕者搜查）

import { _decorator, Vec3, Node } from 'cc';
import { Interactable } from './Interactable';
import { PlayerController } from './PlayerController';
import { CharacterState } from './CharacterState';
import { HunterController } from './HunterController';
const { ccclass, property } = _decorator;

@ccclass('Cabinet')
export class Cabinet extends Interactable {
    @property(Node)
    public hidePoint: Node | null = null; // 躲藏时放置逃生者的位置

    @property(Node)
    public exitPoint: Node | null = null; // 离开时的传送点

    @property(Vec3)
    public fallbackExitOffset: Vec3 = new Vec3(0, 0, 1.2); // 若未配置exitPoint时，从柜子正前方偏移

    private _occupant: Node | null = null;
    private _originalParent: Node | null = null;
    private _originalWorldPos: Vec3 = new Vec3();
    private _hasOriginalWorldPos: boolean = false;
    private _tempVec3: Vec3 = new Vec3();

    start() {
        this.interactPrompt = '躲入储物柜';
        this.canInteractMultipleTimes = true;
    }

    public isOccupied(): boolean {
        return this._occupant !== null;
    }

    public getOccupant(): Node | null {
        return this._occupant;
    }

    protected onInteract(player: Node): void {
        if (!player) {
            return;
        }

        if (!this._occupant) {
            this.enterCabinet(player);
            return;
        }

        if (this._occupant === player) {
            this.exitCabinet(true);
            return;
        }

        // 追捕者可以强制开柜
        const hunter = player.getComponent(HunterController);
        if (hunter) {
            console.log(`[Cabinet] ${player.name} 打开储物柜，发现了 ${this._occupant.name}`);
            this.exitCabinet(false);
            return;
        }

        console.log('[Cabinet] 储物柜正在被占用');
    }

    public forceReveal() {
        if (this._occupant) {
            this.exitCabinet(false);
        }
    }

    private enterCabinet(player: Node) {
        if (player.getComponent(HunterController)) {
            console.log('[Cabinet] 追捕者无法躲藏在储物柜中');
            return;
        }

        const characterState = player.getComponent(CharacterState);
        if (characterState && !characterState.isNormal()) {
            console.log('[Cabinet] 非正常状态无法躲入储物柜');
            return;
        }

        const controller = player.getComponent(PlayerController);
        if (!controller) {
            console.warn('[Cabinet] 目标没有PlayerController，无法躲藏');
            return;
        }

        if (typeof controller.isInteracting === 'function' && controller.isInteracting()) {
            console.log('[Cabinet] 玩家正在进行其他交互');
            return;
        }

        player.getWorldPosition(this._originalWorldPos);
        this._hasOriginalWorldPos = true;
        this._originalParent = player.parent;

        this._occupant = player;
        controller.setMovementLocked(true);

        if (this.hidePoint) {
            player.setParent(this.hidePoint);
            player.setPosition(0, 0, 0);
        } else {
            player.setParent(this.node);
            player.setPosition(0, 0, 0);
        }

        this.interactPrompt = '离开储物柜';
        console.log(`[Cabinet] ${player.name} 躲入储物柜`);
    }

    private exitCabinet(voluntary: boolean) {
        if (!this._occupant) {
            return;
        }

        const occupant = this._occupant;
        const controller = occupant.getComponent(PlayerController);
        if (controller) {
            controller.setMovementLocked(false);
        }

        const targetParent = this._originalParent && this._originalParent.isValid ? this._originalParent : this.node.scene;
        occupant.setParent(targetParent);

        const exitWorld = this.getExitWorldPosition(this._tempVec3);
        occupant.setWorldPosition(exitWorld);

        this._occupant = null;
        this._originalParent = null;
        this._hasOriginalWorldPos = false;
        this.interactPrompt = '躲入储物柜';

        console.log(`[Cabinet] ${occupant.name} 离开储物柜${voluntary ? '' : '（被迫）'}`);
    }

    private getExitWorldPosition(out: Vec3): Vec3 {
        if (this.exitPoint) {
            this.exitPoint.getWorldPosition(out);
            return out;
        }

        if (this._hasOriginalWorldPos) {
            out.set(this._originalWorldPos);
            return out;
        }

        this.node.getWorldPosition(out);
        Vec3.add(out, out, this.fallbackExitOffset);
        return out;
    }
}
