// 文件名: HunterUI.ts
// 功能：追捕者UI - 攻击按钮、踩碎木板按钮（任务2.2）

import { _decorator, Component, Node, Button, Label } from 'cc';
import { HunterController } from './HunterController';
import { Board } from './Board';
const { ccclass, property } = _decorator;

@ccclass('HunterUI')
export class HunterUI extends Component {
    @property(Node)
    public attackButton: Node = null!; // 攻击按钮节点

    @property(Label)
    public attackLabel: Label = null!; // 攻击按钮文字

    @property(Node)
    public breakBoardButton: Node = null!; // 踩碎木板按钮节点

    @property(Label)
    public breakBoardLabel: Label = null!; // 踩碎木板按钮文字

    @property(HunterController)
    public hunterController: HunterController = null!; // 追捕者控制器

    @property
    public showCooldownProgress: boolean = true; // 是否显示冷却进度

    start() {
        if (!this.hunterController) {
            console.error('[HunterUI] HunterController未绑定！');
            return;
        }

        // 初始化按钮状态
        this.hideAttackButton();
        this.hideBreakBoardButton();

        // 注册回调
        this.hunterController.onAttackTargetChange((target) => {
            this.onAttackTargetChange(target);
        });

        this.hunterController.onBoardTargetChange((board) => {
            this.onBoardTargetChange(board);
        });

        // 绑定按钮点击事件
        if (this.attackButton) {
            const button = this.attackButton.getComponent(Button);
            if (button) {
                button.node.on(Button.EventType.CLICK, this.onAttackButtonClick, this);
            }
        }

        if (this.breakBoardButton) {
            const button = this.breakBoardButton.getComponent(Button);
            if (button) {
                button.node.on(Button.EventType.CLICK, this.onBreakBoardButtonClick, this);
            }
        }

        console.log('[HunterUI] 追捕者UI初始化完成');
    }

    update(deltaTime: number) {
        // 更新攻击按钮冷却显示
        if (this.attackButton && this.attackButton.active && this.showCooldownProgress) {
            this.updateAttackCooldown();
        }
    }

    // ============ 攻击按钮 ============

    /**
     * 攻击目标变化
     */
    private onAttackTargetChange(target: Node | null) {
        if (target) {
            this.showAttackButton(target.name);
        } else {
            this.hideAttackButton();
        }
    }

    /**
     * 显示攻击按钮
     */
    private showAttackButton(targetName: string) {
        if (!this.attackButton) return;

        this.attackButton.active = true;

        if (this.attackLabel) {
            this.attackLabel.string = `攻击 ${targetName}`;
        }
    }

    /**
     * 隐藏攻击按钮
     */
    private hideAttackButton() {
        if (this.attackButton) {
            this.attackButton.active = false;
        }
    }

    /**
     * 更新攻击冷却显示
     */
    private updateAttackCooldown() {
        if (!this.hunterController || !this.attackLabel) return;

        const canAttack = this.hunterController.canAttack();
        const progress = this.hunterController.getAttackCooldownProgress();

        if (!canAttack) {
            // 显示冷却进度
            const percentage = Math.floor(progress * 100);
            this.attackLabel.string = `冷却中 ${percentage}%`;

            // 可选：改变按钮颜色
            const button = this.attackButton?.getComponent(Button);
            if (button) {
                button.interactable = false;
            }
        } else {
            // 恢复正常显示
            const target = this.hunterController.getAttackTarget();
            if (target) {
                this.attackLabel.string = `攻击 ${target.name}`;
            }

            const button = this.attackButton?.getComponent(Button);
            if (button) {
                button.interactable = true;
            }
        }
    }

    /**
     * 攻击按钮点击
     */
    private onAttackButtonClick() {
        if (!this.hunterController) return;

        console.log('[HunterUI] 点击攻击按钮');
        this.hunterController.triggerAttack();
    }

    // ============ 踩碎木板按钮 ============

    /**
     * 木板目标变化
     */
    private onBoardTargetChange(board: Board | null) {
        if (board) {
            this.showBreakBoardButton();
        } else {
            this.hideBreakBoardButton();
        }
    }

    /**
     * 显示踩碎木板按钮
     */
    private showBreakBoardButton() {
        if (!this.breakBoardButton) return;

        this.breakBoardButton.active = true;

        if (this.breakBoardLabel) {
            this.breakBoardLabel.string = "踩碎木板";
        }
    }

    /**
     * 隐藏踩碎木板按钮
     */
    private hideBreakBoardButton() {
        if (this.breakBoardButton) {
            this.breakBoardButton.active = false;
        }
    }

    /**
     * 踩碎木板按钮点击
     */
    private onBreakBoardButtonClick() {
        if (!this.hunterController) return;

        console.log('[HunterUI] 点击踩碎木板按钮');
        this.hunterController.triggerBreakBoard();
    }

    // ============ 手动控制接口 ============

    /**
     * 手动显示攻击按钮（用于调试）
     */
    public debugShowAttackButton() {
        this.showAttackButton('测试目标');
    }

    /**
     * 手动隐藏攻击按钮（用于调试）
     */
    public debugHideAttackButton() {
        this.hideAttackButton();
    }
}
