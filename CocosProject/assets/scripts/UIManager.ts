// 文件名: UIManager.ts
// 功能：HUD核心UI管理器（任务3.2）
// 管理倒计时、矿石进度、团队成员状态等核心UI元素

import { _decorator, Component, Node, Label, Sprite, Color } from 'cc';
import { GameManager, GameStats } from './GameManager';
import { CharacterState, CharacterStateType, StateChangeCallback } from './CharacterState';
const { ccclass, property } = _decorator;

/**
 * 团队成员UI状态
 */
interface TeamMemberUIData {
    characterNode: Node;           // 角色节点引用
    characterState: CharacterState; // 角色状态组件
    uiSprite: Sprite;              // UI显示方块
}

@ccclass('UIManager')
export class UIManager extends Component {
    // ============ 倒计时UI ============
    @property(Label)
    public timerLabel: Label | null = null; // 倒计时显示（格式：05:00）

    // ============ 矿石进度UI ============
    @property(Label)
    public oreProgressLabel: Label | null = null; // 矿石进度显示（格式：0/8）

    // ============ 团队成员状态UI ============
    @property(Node)
    public teamStatusContainer: Node | null = null; // 团队状态容器节点

    @property([Sprite])
    public teamMemberSprites: Sprite[] = []; // 4个团队成员状态方块（手动绑定）

    @property
    public autoFindTeamMembers: boolean = true; // 自动查找场景中的逃生者

    // ============ 状态颜色配置 ============
    @property
    public normalColor: Color = new Color(0, 255, 0, 255); // 正常状态：绿色

    @property
    public caughtColor: Color = new Color(255, 165, 0, 255); // 被抓状态：橙色

    @property
    public hangedColor: Color = new Color(255, 0, 0, 255); // 被挂起状态：红色

    @property
    public eliminatedColor: Color = new Color(128, 128, 128, 255); // 淘汰状态：灰色

    // ============ 调试选项 ============
    @property
    public enableDebugLog: boolean = false; // 是否启用调试日志

    // 私有成员
    private _gameManager: GameManager | null = null;
    private _teamMembers: TeamMemberUIData[] = []; // 团队成员数据列表

    start() {
        console.log('[UIManager] HUD UI管理器初始化');

        // 获取GameManager单例
        this._gameManager = GameManager.getInstance();
        if (!this._gameManager) {
            console.error('[UIManager] GameManager未找到！请确保场景中有GameManager组件');
            return;
        }

        // 注册GameManager回调
        this._gameManager.onStatsChange((stats) => {
            this.onStatsChange(stats);
        });

        // 初始化团队成员UI
        this.initializeTeamMemberUI();

        // 显示初始数据
        this.updateAllUI();

        console.log('[UIManager] HUD UI初始化完成');
    }

    update(deltaTime: number) {
        if (!this._gameManager || !this._gameManager.isPlaying()) return;

        // 每帧更新倒计时（确保精确显示）
        this.updateTimerDisplay();
    }

    // ============ 团队成员UI初始化 ============

    /**
     * 初始化团队成员UI
     */
    private initializeTeamMemberUI() {
        if (!this.autoFindTeamMembers) {
            console.log('[UIManager] 自动查找已禁用，需要手动配置团队成员');
            return;
        }

        // 查找场景中所有带CharacterState组件的逃生者
        const allCharacters = this.node.scene.getComponentsInChildren(CharacterState);

        // 筛选出逃生者（排除追捕者）
        // 假设追捕者节点名包含"Hunter"，逃生者节点名包含"Survivor"
        const survivors = allCharacters.filter(char =>
            char.node.name.toLowerCase().includes('survivor')
        );

        if (survivors.length === 0) {
            console.warn('[UIManager] 场景中未找到逃生者节点，团队成员UI将无法显示');
            return;
        }

        if (survivors.length > this.teamMemberSprites.length) {
            console.warn(`[UIManager] 逃生者数量(${survivors.length})超过UI方块数量(${this.teamMemberSprites.length})，部分角色不会显示`);
        }

        // 绑定逃生者与UI方块
        const maxMembers = Math.min(survivors.length, this.teamMemberSprites.length);
        for (let i = 0; i < maxMembers; i++) {
            const survivor = survivors[i];
            const sprite = this.teamMemberSprites[i];

            if (!sprite) {
                console.warn(`[UIManager] teamMemberSprites[${i}]未绑定，跳过`);
                continue;
            }

            // 创建团队成员UI数据
            const memberData: TeamMemberUIData = {
                characterNode: survivor.node,
                characterState: survivor,
                uiSprite: sprite
            };

            this._teamMembers.push(memberData);

            // 注册状态变化回调
            survivor.onStateChange((oldState: CharacterStateType, newState: CharacterStateType) => {
                this.onCharacterStateChange(memberData, oldState, newState);
            });

            // 初始化颜色
            this.updateTeamMemberColor(memberData);

            if (this.enableDebugLog) {
                console.log(`[UIManager] 绑定团队成员 ${i}: ${survivor.node.name}`);
            }
        }

        console.log(`[UIManager] 成功绑定 ${this._teamMembers.length} 个团队成员UI`);
    }

    /**
     * 角色状态变化回调
     */
    private onCharacterStateChange(memberData: TeamMemberUIData, oldState: CharacterStateType, newState: CharacterStateType) {
        if (this.enableDebugLog) {
            console.log(`[UIManager] ${memberData.characterNode.name} 状态变化: ${oldState} -> ${newState}`);
        }

        this.updateTeamMemberColor(memberData);
    }

    /**
     * 更新团队成员UI颜色
     */
    private updateTeamMemberColor(memberData: TeamMemberUIData) {
        const state = memberData.characterState.getCurrentState();
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

        memberData.uiSprite.color = color;
    }

    // ============ 统计数据更新 ============

    /**
     * GameManager统计数据变化回调
     */
    private onStatsChange(stats: GameStats) {
        this.updateOreProgressDisplay(stats);
        this.updateTimerDisplay();
    }

    /**
     * 更新所有UI元素
     */
    private updateAllUI() {
        if (!this._gameManager) return;

        const stats = this._gameManager.getStats();
        this.updateTimerDisplay();
        this.updateOreProgressDisplay(stats);
        this.updateTeamMemberUI();
    }

    /**
     * 更新倒计时显示
     */
    private updateTimerDisplay() {
        if (!this.timerLabel || !this._gameManager) return;

        const timeRemaining = this._gameManager.getTimeRemaining();
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);

        // 格式化为 MM:SS
        this.timerLabel.string = `${this.padZero(minutes)}:${this.padZero(seconds)}`;

        // ✅ 倒计时 < 60秒时变红色提示
        if (timeRemaining <= 60 && timeRemaining > 0) {
            this.timerLabel.color = new Color(255, 0, 0, 255); // 红色
        } else {
            this.timerLabel.color = new Color(255, 255, 255, 255); // 白色
        }
    }

    /**
     * 更新矿石进度显示
     */
    private updateOreProgressDisplay(stats: GameStats) {
        if (!this.oreProgressLabel || !this._gameManager) return;

        const oresRequired = this._gameManager.getOresRequiredForExit();
        this.oreProgressLabel.string = `${stats.oreCollected}/${oresRequired}`;

        // ✅ 矿石收集完成时变绿色提示
        if (stats.oreCollected >= oresRequired) {
            this.oreProgressLabel.color = new Color(0, 255, 0, 255); // 绿色
        } else {
            this.oreProgressLabel.color = new Color(255, 255, 255, 255); // 白色
        }
    }

    /**
     * 更新团队成员UI（手动刷新所有成员颜色）
     */
    private updateTeamMemberUI() {
        for (const memberData of this._teamMembers) {
            this.updateTeamMemberColor(memberData);
        }
    }

    // ============ 工具方法 ============

    /**
     * 补零（01, 02, ..., 09, 10）
     */
    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    /**
     * 手动刷新UI（供外部调用）
     */
    public refreshUI() {
        this.updateAllUI();
    }

    /**
     * 获取团队成员数量
     */
    public getTeamMemberCount(): number {
        return this._teamMembers.length;
    }

    /**
     * 获取指定团队成员的状态
     */
    public getTeamMemberState(index: number): CharacterStateType | null {
        if (index < 0 || index >= this._teamMembers.length) {
            return null;
        }
        return this._teamMembers[index].characterState.getCurrentState();
    }

    // ============ 调试功能 ============

    /**
     * 打印所有团队成员状态（调试用）
     */
    public debugPrintTeamStatus() {
        console.log('=== 团队成员状态 ===');
        for (let i = 0; i < this._teamMembers.length; i++) {
            const member = this._teamMembers[i];
            const state = member.characterState.getCurrentState();
            const color = member.uiSprite.color;
            console.log(`[${i}] ${member.characterNode.name}: ${state} (颜色: ${color.toString()})`);
        }
        console.log('==================');
    }
}
