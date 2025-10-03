// 文件名: InteractionUI.ts
// 功能：交互按钮UI控制（显示/隐藏，触发交互）+ 救援系统
// 版本：V1.1 - 支持救援交互（任务2.1）

import { _decorator, Component, Node, Button, Label, UIOpacity, ProgressBar } from 'cc';
import { PlayerController } from './PlayerController';
import { CharacterState } from './CharacterState';
const { ccclass, property } = _decorator;

@ccclass('InteractionUI')
export class InteractionUI extends Component {
    @property(PlayerController)
    public player: PlayerController = null!; // 玩家控制器引用

    @property(Node)
    public buttonNode: Node = null!; // 交互按钮节点

    @property(Label)
    public promptLabel: Label = null!; // 提示文本Label（可选）

    @property(ProgressBar)
    public rescueProgressBar: ProgressBar = null!; // 救援进度条（可选）

    @property
    public fadeDuration: number = 0.2; // 淡入淡出动画时长（秒）

    private _button: Button = null!; // 按钮组件
    private _uiOpacity: UIOpacity = null!; // 透明度组件
    private _isVisible: boolean = false; // 当前是否可见
    private _fadeTimer: number = 0; // 淡入淡出计时器
    private _targetOpacity: number = 0; // 目标透明度

    // 任务2.1新增：救援模式
    private _isRescueMode: boolean = false; // 是否是救援模式
    private _currentRescueTarget: Node | null = null; // 当前救援目标

    onLoad() {
        // 获取按钮组件
        if (!this.buttonNode) {
            console.error('[InteractionUI] buttonNode未绑定！');
            return;
        }

        this._button = this.buttonNode.getComponent(Button);
        if (!this._button) {
            console.error('[InteractionUI] buttonNode上没有Button组件！');
            return;
        }

        // 获取或添加UIOpacity组件
        this._uiOpacity = this.buttonNode.getComponent(UIOpacity);
        if (!this._uiOpacity) {
            this._uiOpacity = this.buttonNode.addComponent(UIOpacity);
        }

        // 初始隐藏按钮
        this._uiOpacity.opacity = 0;
        this._targetOpacity = 0;
        this._isVisible = false;

        // 初始隐藏救援进度条
        if (this.rescueProgressBar) {
            this.rescueProgressBar.node.active = false;
            this.rescueProgressBar.progress = 0;
        }

        // 监听按钮点击事件
        this._button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
    }

    start() {
        // 检查玩家控制器引用
        if (!this.player) {
            console.error('[InteractionUI] player未绑定！');
            return;
        }

        // 注册交互状态变化回调
        this.player.onInteractionChange((interactable) => {
            // 救援模式优先级更高，如果正在救援则不响应普通交互
            if (this._isRescueMode) return;

            if (interactable) {
                // 有可交互物体，显示按钮
                this.showButton(interactable.getInteractPrompt(), false);
            } else {
                // 没有可交互物体，隐藏按钮
                this.hideButton();
            }
        });

        // 任务2.1新增：注册救援目标变化回调
        this.player.onRescueTargetChange((target) => {
            if (target) {
                // 有可救援的队友，显示救援按钮
                this._isRescueMode = true;
                this._currentRescueTarget = target;
                this.showButton("救援", true);
            } else {
                // 没有可救援的队友
                if (this._isRescueMode) {
                    this._isRescueMode = false;
                    this._currentRescueTarget = null;
                    this.hideButton();
                }
            }
        });
    }

    onDestroy() {
        // 清理事件监听
        if (this._button) {
            this._button.node.off(Button.EventType.CLICK, this.onButtonClick, this);
        }
    }

    update(deltaTime: number) {
        // 平滑淡入淡出动画
        if (this._uiOpacity.opacity !== this._targetOpacity) {
            const opacityDiff = this._targetOpacity - this._uiOpacity.opacity;
            const changeSpeed = 255 / this.fadeDuration; // 每秒变化速度
            const changeAmount = changeSpeed * deltaTime;

            if (Math.abs(opacityDiff) <= changeAmount) {
                // 到达目标透明度
                this._uiOpacity.opacity = this._targetOpacity;
            } else {
                // 平滑过渡
                this._uiOpacity.opacity += Math.sign(opacityDiff) * changeAmount;
            }
        }

        // 任务2.1新增：更新救援进度条
        if (this._isRescueMode && this._currentRescueTarget && this.rescueProgressBar) {
            const targetState = this._currentRescueTarget.getComponent(CharacterState);
            if (targetState && targetState.isBeingRescued()) {
                this.rescueProgressBar.node.active = true;
                this.rescueProgressBar.progress = targetState.getRescueProgress();
            } else {
                this.rescueProgressBar.node.active = false;
            }
        }
    }

    /**
     * 显示按钮
     * @param promptText 提示文本
     * @param isRescue 是否是救援模式
     */
    private showButton(promptText?: string, isRescue: boolean = false) {
        if (this._isVisible) return;

        this._isVisible = true;
        this._targetOpacity = 255;

        // 更新提示文本
        if (this.promptLabel && promptText) {
            this.promptLabel.string = promptText;
        }

        console.log(`[InteractionUI] 显示${isRescue ? '救援' : '交互'}按钮`);
    }

    /**
     * 隐藏按钮
     */
    private hideButton() {
        if (!this._isVisible) return;

        this._isVisible = false;
        this._targetOpacity = 0;

        // 同时隐藏救援进度条
        if (this.rescueProgressBar) {
            this.rescueProgressBar.node.active = false;
            this.rescueProgressBar.progress = 0;
        }

        console.log('[InteractionUI] 隐藏交互按钮');
    }

    /**
     * 按钮点击事件
     */
    private onButtonClick() {
        console.log(`[InteractionUI] ${this._isRescueMode ? '救援' : '交互'}按钮被点击`);

        // 触发玩家交互或救援
        if (this.player) {
            if (this._isRescueMode) {
                this.player.triggerRescue();
            } else {
                this.player.triggerInteraction();
            }
        }
    }

    /**
     * 手动设置按钮可见性（用于测试）
     */
    public setVisible(visible: boolean) {
        if (visible) {
            this.showButton();
        } else {
            this.hideButton();
        }
    }
}
