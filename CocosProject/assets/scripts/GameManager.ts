// 文件名: GameManager.ts
// 功能：游戏状态管理 + 倒计时 + 胜负判定（任务2.2）
// 管理完整的游戏流程

import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { CharacterState, CharacterStateType } from './CharacterState';
import { Ore } from './Ore';
const { ccclass, property } = _decorator;

/**
 * 游戏状态枚举
 */
export enum GameState {
    WAITING = 'waiting',        // 等待开始
    PLAYING = 'playing',        // 游戏中
    HUNTER_WIN = 'hunter_win',  // 追捕者胜利
    SURVIVOR_WIN = 'survivor_win', // 逃生者胜利
    DRAW = 'draw'               // 平局
}

/**
 * 游戏统计数据
 */
export interface GameStats {
    oreCollected: number;      // 矿石拾取数量
    survivorsEscaped: number;  // 逃脱人数
    survivorsEliminated: number; // 淘汰人数
    timeRemaining: number;     // 剩余时间（秒）
}

/**
 * 游戏状态变化回调类型
 */
export type GameStateCallback = (newState: GameState, stats: GameStats) => void;

/**
 * 游戏统计变化回调类型
 */
export type GameStatsCallback = (stats: GameStats) => void;

@ccclass('GameManager')
export class GameManager extends Component {
    @property
    public gameDuration: number = 300.0; // 游戏时长（秒），默认5分钟

    @property
    public survivorsToWin: number = 3; // 逃生者胜利所需逃脱人数

    @property
    public eliminationsToWin: number = 3; // 追捕者胜利所需淘汰人数

    @property
    public autoStartGame: boolean = false; // 是否自动开始游戏

    @property
    public oresRequiredForExit: number = 8; // 生成逃生门所需矿石数量

    @property(Prefab)
    public exitZonePrefab: Prefab | null = null; // 逃生门预制体（可选）

    @property(Node)
    public exitZoneSpawnPoint: Node | null = null; // 逃生门生成位置（可选）

    // 游戏状态
    private _currentState: GameState = GameState.WAITING;
    private _timeRemaining: number = 0;

    // 游戏统计
    private _oreCollected: number = 0;
    private _survivorsEscaped: number = 0;
    private _survivorsEliminated: number = 0;

    // 逃生门系统
    private _exitZoneGenerated: boolean = false; // 逃生门是否已生成
    private _exitZoneNode: Node | null = null; // 生成的逃生门节点

    // 角色引用
    private _allCharacters: CharacterState[] = [];

    // 回调系统
    private _stateChangeCallbacks: GameStateCallback[] = [];
    private _statsChangeCallbacks: GameStatsCallback[] = [];

    // 单例模式
    private static _instance: GameManager | null = null;

    onLoad() {
        // 实现单例模式
        if (GameManager._instance) {
            console.warn('[GameManager] 已存在实例，销毁当前节点');
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
    }

    start() {
        console.log('[GameManager] 游戏管理器初始化');

        // 初始化时间
        this._timeRemaining = this.gameDuration;

        // 缓存所有角色
        this.refreshCharacters();

        // 注册角色状态变化监听
        this.registerCharacterListeners();

        // 如果自动开始，启动游戏
        if (this.autoStartGame) {
            this.scheduleOnce(() => {
                this.startGame();
            }, 1.0); // 延迟1秒启动，确保所有组件初始化完成
        }

        // 通知初始统计
        this.notifyStatsChange();
    }

    update(deltaTime: number) {
        // 只有游戏进行中才倒计时
        if (this._currentState !== GameState.PLAYING) return;

        // 倒计时
        this._timeRemaining -= deltaTime;

        // 每秒通知一次统计更新（优化性能）
        if (Math.floor(this._timeRemaining * 10) % 10 === 0) {
            this.notifyStatsChange();
        }

        // 倒计时结束
        if (this._timeRemaining <= 0) {
            this._timeRemaining = 0;
            this.onTimeUp();
            return;
        }

        // 实时检查胜负条件
        this.checkWinConditions();
    }

    onDestroy() {
        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }

    // ============ 游戏流程控制 ============

    /**
     * 开始游戏
     */
    public startGame() {
        if (this._currentState !== GameState.WAITING) {
            console.warn('[GameManager] 游戏已经开始，无法重复开始');
            return;
        }

        console.log('[GameManager] 游戏开始！');

        this._currentState = GameState.PLAYING;
        this._timeRemaining = this.gameDuration;

        // 重置统计
        this._oreCollected = 0;
        this._survivorsEscaped = 0;
        this._survivorsEliminated = 0;

        this.notifyStateChange();
        this.notifyStatsChange();
    }

    /**
     * 暂停游戏
     */
    public pauseGame() {
        if (this._currentState === GameState.PLAYING) {
            console.log('[GameManager] 游戏暂停');
            // 这里可以添加暂停逻辑
        }
    }

    /**
     * 重新开始游戏
     */
    public restartGame() {
        console.log('[GameManager] 重新开始游戏');

        // 重置游戏状态
        this._currentState = GameState.WAITING;
        this._timeRemaining = this.gameDuration;
        this._oreCollected = 0;
        this._survivorsEscaped = 0;
        this._survivorsEliminated = 0;

        // 重置所有角色
        for (const character of this._allCharacters) {
            character.reset();
        }

        // 延迟启动
        this.scheduleOnce(() => {
            this.startGame();
        }, 0.5);
    }

    /**
     * 结束游戏
     */
    private endGame(result: GameState) {
        if (this._currentState !== GameState.PLAYING) return;

        console.log(`[GameManager] 游戏结束！结果：${result}`);

        this._currentState = result;
        this.notifyStateChange();
    }

    // ============ 胜负判定 ============

    /**
     * 检查胜负条件
     */
    private checkWinConditions() {
        // 条件1：淘汰人数 >= 3，追捕者胜利
        if (this._survivorsEliminated >= this.eliminationsToWin) {
            this.endGame(GameState.HUNTER_WIN);
            return;
        }

        // 条件2：逃脱人数 >= 3，逃生者胜利
        if (this._survivorsEscaped >= this.survivorsToWin) {
            this.endGame(GameState.SURVIVOR_WIN);
            return;
        }
    }

    /**
     * 时间到
     */
    private onTimeUp() {
        console.log('[GameManager] 时间到！');

        // 条件3：倒计时结束且逃脱人数 < 2，追捕者胜利
        if (this._survivorsEscaped < 2) {
            this.endGame(GameState.HUNTER_WIN);
        }
        // 条件4：倒计时结束且逃脱人数 == 2，平局
        else if (this._survivorsEscaped === 2) {
            this.endGame(GameState.DRAW);
        }
        // 条件5：倒计时结束且逃脱人数 >= 3，逃生者胜利（已在checkWinConditions中处理）
        else {
            this.endGame(GameState.SURVIVOR_WIN);
        }
    }

    // ============ 统计系统 ============

    /**
     * 刷新角色列表
     */
    public refreshCharacters() {
        this._allCharacters = this.node.scene.getComponentsInChildren(CharacterState);
        console.log(`[GameManager] 缓存了 ${this._allCharacters.length} 个角色`);
    }

    /**
     * 注册角色状态变化监听
     */
    private registerCharacterListeners() {
        for (const character of this._allCharacters) {
            character.onStateChange((oldState, newState) => {
                // 监听淘汰
                if (newState === CharacterStateType.ELIMINATED) {
                    this.onSurvivorEliminated(character.node);
                }
            });
        }
    }

    /**
     * 矿石被拾取
     */
    public onOreCollected(oreNode: Node) {
        this._oreCollected++;
        console.log(`[GameManager] 矿石被拾取，当前数量：${this._oreCollected}/${this.oresRequiredForExit}`);
        this.notifyStatsChange();

        // 检查是否达到生成逃生门的条件
        if (this._oreCollected >= this.oresRequiredForExit && !this._exitZoneGenerated) {
            this.generateExitZone();
        }
    }

    /**
     * 逃生者逃脱
     */
    public onSurvivorEscaped(survivorNode: Node) {
        this._survivorsEscaped++;
        console.log(`[GameManager] 逃生者逃脱，当前数量：${this._survivorsEscaped}`);
        this.notifyStatsChange();

        // 立即检查胜负条件
        this.checkWinConditions();
    }

    /**
     * 逃生者被淘汰
     */
    private onSurvivorEliminated(survivorNode: Node) {
        this._survivorsEliminated++;
        console.log(`[GameManager] 逃生者被淘汰，当前数量：${this._survivorsEliminated}`);
        this.notifyStatsChange();

        // 立即检查胜负条件
        this.checkWinConditions();
    }

    // ============ 逃生门生成系统 ============

    /**
     * 生成逃生门
     */
    private generateExitZone() {
        console.log('[GameManager] 矿石收集完成，生成逃生门！');

        this._exitZoneGenerated = true;

        // 方式1：如果提供了预制体，使用预制体生成
        if (this.exitZonePrefab) {
            this._exitZoneNode = instantiate(this.exitZonePrefab);
            this._exitZoneNode.setParent(this.node.scene);

            // 设置位置
            if (this.exitZoneSpawnPoint) {
                // 如果指定了生成点，使用生成点位置
                this._exitZoneNode.setWorldPosition(this.exitZoneSpawnPoint.getWorldPosition());
            } else {
                // 否则使用默认位置（场景中心偏远处）
                this._exitZoneNode.setPosition(new Vec3(20, 0, 20));
            }

            console.log(`[GameManager] 逃生门已在预制体方式生成，位置：${this._exitZoneNode.position}`);
        }
        // 方式2：如果没有预制体，激活场景中已存在但隐藏的ExitZone节点
        else {
            // 查找场景中名为ExitZone的隐藏节点
            const existingExitZone = this.findExitZoneInScene();
            if (existingExitZone) {
                existingExitZone.active = true;
                this._exitZoneNode = existingExitZone;
                console.log(`[GameManager] 逃生门已激活（场景中已存在的节点）`);
            } else {
                console.warn('[GameManager] 未找到ExitZone预制体或场景节点！请在场景中添加ExitZone节点（初始隐藏）或绑定预制体');
            }
        }

        // 通知UI更新（可以显示"逃生门已开启"提示）
        this.notifyStatsChange();
    }

    /**
     * 查找场景中的ExitZone节点
     */
    private findExitZoneInScene(): Node | null {
        // 查找所有子节点
        const allNodes = this.node.scene.children;
        for (const node of allNodes) {
            if (node.name.toLowerCase().includes('exit') || node.name.toLowerCase().includes('door')) {
                return node;
            }
        }
        return null;
    }

    /**
     * 检查逃生门是否已生成
     */
    public isExitZoneGenerated(): boolean {
        return this._exitZoneGenerated;
    }

    /**
     * 获取生成逃生门所需矿石数量（任务3.2新增）
     */
    public getOresRequiredForExit(): number {
        return this.oresRequiredForExit;
    }

    // ============ 查询接口 ============

    /**
     * 获取当前游戏状态
     */
    public getCurrentState(): GameState {
        return this._currentState;
    }

    /**
     * 获取游戏统计数据
     */
    public getStats(): GameStats {
        return {
            oreCollected: this._oreCollected,
            survivorsEscaped: this._survivorsEscaped,
            survivorsEliminated: this._survivorsEliminated,
            timeRemaining: this._timeRemaining
        };
    }

    /**
     * 获取剩余时间（秒）
     */
    public getTimeRemaining(): number {
        return this._timeRemaining;
    }

    /**
     * 获取剩余时间（格式化为MM:SS）
     */
    public getTimeRemainingFormatted(): string {
        const minutes = Math.floor(this._timeRemaining / 60);
        const seconds = Math.floor(this._timeRemaining % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 是否游戏进行中
     */
    public isPlaying(): boolean {
        return this._currentState === GameState.PLAYING;
    }

    /**
     * 是否游戏结束
     */
    public isGameOver(): boolean {
        return this._currentState === GameState.HUNTER_WIN ||
               this._currentState === GameState.SURVIVOR_WIN ||
               this._currentState === GameState.DRAW;
    }

    // ============ 回调系统 ============

    /**
     * 注册游戏状态变化回调
     */
    public onStateChange(callback: GameStateCallback) {
        this._stateChangeCallbacks.push(callback);
    }

    /**
     * 通知游戏状态变化
     */
    private notifyStateChange() {
        const stats = this.getStats();
        for (const callback of this._stateChangeCallbacks) {
            callback(this._currentState, stats);
        }
    }

    /**
     * 注册游戏统计变化回调
     */
    public onStatsChange(callback: GameStatsCallback) {
        this._statsChangeCallbacks.push(callback);
    }

    /**
     * 通知游戏统计变化
     */
    private notifyStatsChange() {
        const stats = this.getStats();
        for (const callback of this._statsChangeCallbacks) {
            callback(stats);
        }
    }

    // ============ 单例访问 ============

    /**
     * 获取GameManager单例
     */
    public static getInstance(): GameManager | null {
        return GameManager._instance;
    }

    // ============ 调试功能 ============

    /**
     * 设置剩余时间（用于测试）
     */
    public setTimeRemaining(seconds: number) {
        this._timeRemaining = seconds;
        console.log(`[GameManager] 剩余时间设置为 ${seconds} 秒`);
        this.notifyStatsChange();
    }

    /**
     * 模拟逃脱（用于测试）
     */
    public debugEscape(count: number = 1) {
        for (let i = 0; i < count; i++) {
            this.onSurvivorEscaped(new Node('DebugSurvivor'));
        }
    }

    /**
     * 模拟淘汰（用于测试）
     */
    public debugEliminate(count: number = 1) {
        for (let i = 0; i < count; i++) {
            this._survivorsEliminated++;
        }
        this.notifyStatsChange();
        this.checkWinConditions();
    }

    /**
     * 获取游戏信息（调试用）
     */
    public getGameInfo(): string {
        return `状态:${this._currentState}, 时间:${this.getTimeRemainingFormatted()}, 矿石:${this._oreCollected}, 逃脱:${this._survivorsEscaped}, 淘汰:${this._survivorsEliminated}`;
    }
}
