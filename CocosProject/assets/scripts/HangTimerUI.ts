// 文件名: HangTimerUI.ts
// 功能：被挂队友头顶倒计时UI显示（Checklist修复）
// 显示30秒挂起倒计时和生命值

import { _decorator, Component, Node, Label, Sprite } from 'cc';
import { CharacterState, CharacterStateType } from './CharacterState';
const { ccclass, property } = _decorator;

@ccclass('HangTimerUI')
export class HangTimerUI extends Component {
    @property(Label)
    public timerLabel: Label = null!; // 倒计时文字（如"23s"）

    @property(Sprite)
    public timerBar: Sprite | null = null; // 倒计时进度条（可选）

    @property(Label)
    public livesLabel: Label | null = null; // 生命值文字（如"1/2"）

    @property(Node)
    public targetCharacter: Node = null!; // 目标角色节点

    @property
    public showOnlyWhenHanged: boolean = true; // 仅在被挂起时显示

    @property
    public followOffset: number = 2.5; // 跟随偏移高度（头顶上方）

    private _characterState: CharacterState | null = null;

    start() {
        if (!this.targetCharacter) {
            console.error('[HangTimerUI] targetCharacter未绑定！');
            return;
        }

        // 获取角色状态组件
        this._characterState = this.targetCharacter.getComponent(CharacterState);
        if (!this._characterState) {
            console.error('[HangTimerUI] 目标角色没有CharacterState组件！');
            return;
        }

        // 初始隐藏
        if (this.showOnlyWhenHanged) {
            this.node.active = false;
        }

        console.log('[HangTimerUI] 挂起倒计时UI初始化完成');
    }

    update(deltaTime: number) {
        if (!this._characterState) return;

        // 检查是否被挂起
        const isHanged = this._characterState.isHanged();

        // 控制显示/隐藏
        if (this.showOnlyWhenHanged) {
            if (isHanged && !this.node.active) {
                this.node.active = true;
            } else if (!isHanged && this.node.active) {
                this.node.active = false;
            }
        }

        // 仅在被挂起时更新
        if (isHanged) {
            this.updateTimerDisplay();
            this.updateLivesDisplay();
            this.updatePosition();
        }
    }

    /**
     * 更新倒计时显示
     */
    private updateTimerDisplay() {
        if (!this._characterState || !this.timerLabel) return;

        const timeRemaining = this._characterState.getHangTimeRemaining();
        const seconds = Math.ceil(timeRemaining);

        // 更新文字
        this.timerLabel.string = `${seconds}s`;

        // 更新进度条（可选）
        if (this.timerBar) {
            const progress = timeRemaining / this._characterState.hangDuration;
            // 通过fillRange控制进度条
            // 注意：需要Sprite设置为FILLED类型
            // this.timerBar.fillRange = progress;
        }

        // 时间紧急时变红色
        if (timeRemaining <= 10) {
            this.timerLabel.color = new (this.timerLabel.color.constructor as any)(255, 0, 0, 255);
        } else {
            this.timerLabel.color = new (this.timerLabel.color.constructor as any)(255, 255, 255, 255);
        }
    }

    /**
     * 更新生命值显示
     */
    private updateLivesDisplay() {
        if (!this._characterState || !this.livesLabel) return;

        const currentLives = this._characterState.getRemainingLives();
        const maxLives = this._characterState.maxHangCount;

        this.livesLabel.string = `生命: ${currentLives}/${maxLives}`;

        // 生命值为0时变红色
        if (currentLives <= 0) {
            this.livesLabel.color = new (this.livesLabel.color.constructor as any)(255, 0, 0, 255);
        }
    }

    /**
     * 更新位置（跟随角色头顶）
     */
    private updatePosition() {
        if (!this.targetCharacter) return;

        // 获取角色世界位置
        const charWorldPos = this.targetCharacter.getWorldPosition();

        // 设置UI位置在角色上方
        this.node.setWorldPosition(
            charWorldPos.x,
            charWorldPos.y + this.followOffset,
            charWorldPos.z
        );

        // 让UI始终面向摄像机（Billboard效果）
        // 注意：需要摄像机引用才能实现，这里简化处理
        // 如果需要Billboard效果，可以在update中设置rotation
    }

    /**
     * 手动设置目标角色（动态绑定）
     */
    public setTargetCharacter(character: Node) {
        this.targetCharacter = character;
        this._characterState = character.getComponent(CharacterState);

        if (!this._characterState) {
            console.error('[HangTimerUI] 设置的角色没有CharacterState组件！');
        }
    }

    /**
     * 强制显示/隐藏
     */
    public setVisible(visible: boolean) {
        this.node.active = visible;
    }
}
