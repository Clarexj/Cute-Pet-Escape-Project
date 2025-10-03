// 文件名: TeamStatusUI.ts
// 功能：团队成员状态UI组件（任务3.2）
// 单个团队成员状态方块的显示逻辑

import { _decorator, Component, Node, Sprite, Label, Color } from 'cc';
import { CharacterState, CharacterStateType } from './CharacterState';
const { ccclass, property } = _decorator;

@ccclass('TeamStatusUI')
export class TeamStatusUI extends Component {
    @property(Sprite)
    public statusSprite: Sprite | null = null; // 状态方块

    @property(Label)
    public memberIndexLabel: Label | null = null; // 成员编号（可选，显示1、2、3、4）

    @property(Label)
    public stateTextLabel: Label | null = null; // 状态文字（可选，显示"正常"、"被抓"等）

    // 状态颜色配置
    @property
    public normalColor: Color = new Color(0, 255, 0, 255); // 正常：绿色

    @property
    public caughtColor: Color = new Color(255, 165, 0, 255); // 被抓：橙色

    @property
    public hangedColor: Color = new Color(255, 0, 0, 255); // 被挂起：红色

    @property
    public eliminatedColor: Color = new Color(128, 128, 128, 255); // 淘汰：灰色

    @property
    public showStateText: boolean = false; // 是否显示状态文字

    // 私有成员
    private _characterState: CharacterState | null = null;
    private _memberIndex: number = -1;

    start() {
        // 初始化状态文字可见性
        if (this.stateTextLabel) {
            this.stateTextLabel.node.active = this.showStateText;
        }
    }

    /**
     * 绑定角色状态
     * @param characterState 角色状态组件
     * @param index 成员索引（0-3）
     */
    public bindCharacter(characterState: CharacterState, index: number) {
        this._characterState = characterState;
        this._memberIndex = index;

        // 设置成员编号
        if (this.memberIndexLabel) {
            this.memberIndexLabel.string = `${index + 1}`; // 显示1-4
        }

        // 注册状态变化回调
        characterState.onStateChange((oldState, newState) => {
            this.onStateChange(oldState, newState);
        });

        // 初始化显示
        this.updateDisplay();

        console.log(`[TeamStatusUI] 绑定成员 ${index}: ${characterState.node.name}`);
    }

    /**
     * 状态变化回调
     */
    private onStateChange(oldState: CharacterStateType, newState: CharacterStateType) {
        console.log(`[TeamStatusUI] 成员 ${this._memberIndex} 状态变化: ${oldState} -> ${newState}`);
        this.updateDisplay();
    }

    /**
     * 更新显示
     */
    private updateDisplay() {
        if (!this._characterState || !this.statusSprite) return;

        const state = this._characterState.getCurrentState();

        // 更新颜色
        this.updateColor(state);

        // 更新状态文字（如果启用）
        if (this.showStateText && this.stateTextLabel) {
            this.updateStateText(state);
        }
    }

    /**
     * 更新颜色
     */
    private updateColor(state: CharacterStateType) {
        if (!this.statusSprite) return;

        let color: Color;

        switch (state) {
            case CharacterStateType.NORMAL:
                color = this.normalColor;
                break;
            case CharacterStateType.CAUGHT:
                color = this.caughtColor;
                break;
            case CharacterStateType.HANGED:
                color = this.hangedColor;
                break;
            case CharacterStateType.ELIMINATED:
                color = this.eliminatedColor;
                break;
            default:
                color = this.normalColor;
        }

        this.statusSprite.color = color;
    }

    /**
     * 更新状态文字
     */
    private updateStateText(state: CharacterStateType) {
        if (!this.stateTextLabel) return;

        let stateText: string;

        switch (state) {
            case CharacterStateType.NORMAL:
                stateText = '正常';
                break;
            case CharacterStateType.CAUGHT:
                stateText = '被抓';
                break;
            case CharacterStateType.HANGED:
                stateText = '挂起';
                break;
            case CharacterStateType.ELIMINATED:
                stateText = '淘汰';
                break;
            default:
                stateText = '未知';
        }

        this.stateTextLabel.string = stateText;
    }

    /**
     * 获取当前状态
     */
    public getCurrentState(): CharacterStateType | null {
        return this._characterState ? this._characterState.getCurrentState() : null;
    }

    /**
     * 获取成员索引
     */
    public getMemberIndex(): number {
        return this._memberIndex;
    }

    /**
     * 获取绑定的角色节点
     */
    public getCharacterNode(): Node | null {
        return this._characterState ? this._characterState.node : null;
    }

    /**
     * 手动刷新显示（供外部调用）
     */
    public refresh() {
        this.updateDisplay();
    }
}
