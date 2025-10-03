// 文件名: GameUI.ts
// 功能：游戏UI显示 - 倒计时、统计数据、游戏结果（任务2.2）

import { _decorator, Component, Node, Label } from 'cc';
import { GameManager, GameState, GameStats } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    @property(Label)
    public timerLabel: Label = null!; // 倒计时显示

    @property(Label)
    public oreLabel: Label = null!; // 矿石数量显示

    @property(Label)
    public escapedLabel: Label = null!; // 逃脱人数显示

    @property(Label)
    public eliminatedLabel: Label = null!; // 淘汰人数显示

    @property(Node)
    public gameOverPanel: Node = null!; // 游戏结束面板

    @property(Label)
    public gameOverLabel: Label = null!; // 游戏结束文字

    @property(Label)
    public exitDoorNotification: Label | null = null; // 逃生门开启提示（可选）

    @property
    public notificationDuration: number = 5.0; // 提示显示时长（秒）

    @property
    public showDebugInfo: boolean = true; // 是否显示调试信息

    private _gameManager: GameManager | null = null;
    private _exitDoorNotified: boolean = false; // 是否已显示逃生门提示

    start() {
        // 获取GameManager单例
        this._gameManager = GameManager.getInstance();

        if (!this._gameManager) {
            console.error('[GameUI] GameManager未找到！请确保场景中有GameManager组件');
            return;
        }

        // 注册回调
        this._gameManager.onStateChange((newState, stats) => {
            this.onGameStateChange(newState, stats);
        });

        this._gameManager.onStatsChange((stats) => {
            this.onStatsChange(stats);
        });

        // 初始化UI
        if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
        }

        if (this.exitDoorNotification) {
            this.exitDoorNotification.node.active = false;
        }

        // 显示初始统计
        this.updateStatsDisplay(this._gameManager.getStats());

        console.log('[GameUI] 游戏UI初始化完成');
    }

    update(deltaTime: number) {
        if (!this._gameManager || !this._gameManager.isPlaying()) return;

        // 每帧更新倒计时显示（确保精确）
        this.updateTimerDisplay(this._gameManager.getTimeRemaining());
    }

    // ============ 回调处理 ============

    /**
     * 游戏状态变化
     */
    private onGameStateChange(newState: GameState, stats: GameStats) {
        console.log(`[GameUI] 游戏状态变化：${newState}`);

        // 更新统计显示
        this.updateStatsDisplay(stats);

        // 处理游戏结束
        if (newState !== GameState.PLAYING && newState !== GameState.WAITING) {
            this.showGameOver(newState);
        }
    }

    /**
     * 游戏统计变化
     */
    private onStatsChange(stats: GameStats) {
        this.updateStatsDisplay(stats);

        // 检查是否需要显示逃生门开启提示
        if (!this._exitDoorNotified && this._gameManager && this._gameManager.isExitZoneGenerated()) {
            this.showExitDoorNotification();
            this._exitDoorNotified = true;
        }
    }

    // ============ UI更新 ============

    /**
     * 更新倒计时显示
     */
    private updateTimerDisplay(timeRemaining: number) {
        if (!this.timerLabel) return;

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.timerLabel.string = `时间: ${timeStr}`;

        // 时间不足1分钟时变红色（可选）
        if (timeRemaining < 60) {
            this.timerLabel.color = new (this.timerLabel.color.constructor as any)(255, 0, 0, 255);
        } else {
            this.timerLabel.color = new (this.timerLabel.color.constructor as any)(255, 255, 255, 255);
        }
    }

    /**
     * 更新统计数据显示
     */
    private updateStatsDisplay(stats: GameStats) {
        // 更新倒计时
        this.updateTimerDisplay(stats.timeRemaining);

        // 更新矿石数量
        if (this.oreLabel) {
            this.oreLabel.string = `矿石: ${stats.oreCollected}`;
        }

        // 更新逃脱人数
        if (this.escapedLabel) {
            this.escapedLabel.string = `逃脱: ${stats.survivorsEscaped}/3`;

            // 达到胜利条件时变绿色
            if (stats.survivorsEscaped >= 3) {
                this.escapedLabel.color = new (this.escapedLabel.color.constructor as any)(0, 255, 0, 255);
            }
        }

        // 更新淘汰人数
        if (this.eliminatedLabel) {
            this.eliminatedLabel.string = `淘汰: ${stats.survivorsEliminated}/3`;

            // 达到追捕者胜利条件时变红色
            if (stats.survivorsEliminated >= 3) {
                this.eliminatedLabel.color = new (this.eliminatedLabel.color.constructor as any)(255, 0, 0, 255);
            }
        }
    }

    /**
     * 显示游戏结束面板
     */
    private showGameOver(result: GameState) {
        if (!this.gameOverPanel || !this.gameOverLabel) {
            console.warn('[GameUI] 游戏结束面板或文字未绑定');
            return;
        }

        // 显示面板
        this.gameOverPanel.active = true;

        // 设置文字和颜色
        let resultText = '';
        let color = new (this.gameOverLabel.color.constructor as any)(255, 255, 255, 255);

        switch (result) {
            case GameState.HUNTER_WIN:
                resultText = '追捕者胜利！';
                color = new (this.gameOverLabel.color.constructor as any)(255, 0, 0, 255); // 红色
                break;

            case GameState.SURVIVOR_WIN:
                resultText = '逃生者胜利！';
                color = new (this.gameOverLabel.color.constructor as any)(0, 255, 0, 255); // 绿色
                break;

            case GameState.DRAW:
                resultText = '平局！';
                color = new (this.gameOverLabel.color.constructor as any)(255, 255, 0, 255); // 黄色
                break;

            default:
                resultText = '游戏结束';
                break;
        }

        this.gameOverLabel.string = resultText;
        this.gameOverLabel.color = color;

        console.log(`[GameUI] 显示游戏结束：${resultText}`);
    }

    /**
     * 隐藏游戏结束面板
     */
    public hideGameOver() {
        if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
        }
    }

    /**
     * 显示逃生门开启提示
     */
    private showExitDoorNotification() {
        if (!this.exitDoorNotification) return;

        console.log('[GameUI] 显示逃生门开启提示');

        // 显示提示
        this.exitDoorNotification.node.active = true;
        this.exitDoorNotification.string = '逃生门已开启！';
        this.exitDoorNotification.color = new (this.exitDoorNotification.color.constructor as any)(0, 255, 0, 255); // 绿色

        // 定时隐藏
        this.scheduleOnce(() => {
            if (this.exitDoorNotification) {
                this.exitDoorNotification.node.active = false;
            }
        }, this.notificationDuration);
    }

    // ============ 按钮事件（可由UI按钮调用） ============

    /**
     * 重新开始游戏
     */
    public onRestartButtonClick() {
        console.log('[GameUI] 点击重新开始');

        if (this._gameManager) {
            this.hideGameOver();
            this._gameManager.restartGame();
        }
    }

    /**
     * 开始游戏（用于手动启动）
     */
    public onStartButtonClick() {
        console.log('[GameUI] 点击开始游戏');

        if (this._gameManager) {
            this._gameManager.startGame();
        }
    }

    // ============ 调试功能 ============

    /**
     * 调试：模拟逃脱
     */
    public debugEscape() {
        if (this._gameManager) {
            this._gameManager.debugEscape(1);
        }
    }

    /**
     * 调试：模拟淘汰
     */
    public debugEliminate() {
        if (this._gameManager) {
            this._gameManager.debugEliminate(1);
        }
    }

    /**
     * 调试：设置剩余时间
     */
    public debugSetTime(seconds: number) {
        if (this._gameManager) {
            this._gameManager.setTimeRemaining(seconds);
        }
    }
}
