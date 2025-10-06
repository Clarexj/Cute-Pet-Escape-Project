System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, GameManager, GameState, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _crd, ccclass, property, GameUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameState(extras) {
    _reporterNs.report("GameState", "./GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameStats(extras) {
    _reporterNs.report("GameStats", "./GameManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Label = _cc.Label;
    }, function (_unresolved_2) {
      GameManager = _unresolved_2.GameManager;
      GameState = _unresolved_2.GameState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "72d71fiSb1GIZb6Lq76+Dkv", "GameUI", undefined); // 文件名: GameUI.ts
      // 功能：游戏UI显示 - 倒计时、统计数据、游戏结果（任务2.2）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("GameUI", GameUI = (_dec = ccclass('GameUI'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Node), _dec7 = property(Label), _dec8 = property(Label), _dec(_class = (_class2 = class GameUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "timerLabel", _descriptor, this);

          // 倒计时显示
          _initializerDefineProperty(this, "oreLabel", _descriptor2, this);

          // 矿石数量显示
          _initializerDefineProperty(this, "escapedLabel", _descriptor3, this);

          // 逃脱人数显示
          _initializerDefineProperty(this, "eliminatedLabel", _descriptor4, this);

          // 淘汰人数显示
          _initializerDefineProperty(this, "gameOverPanel", _descriptor5, this);

          // 游戏结束面板
          _initializerDefineProperty(this, "gameOverLabel", _descriptor6, this);

          // 游戏结束文字
          _initializerDefineProperty(this, "exitDoorNotification", _descriptor7, this);

          // 逃生门开启提示（可选）
          _initializerDefineProperty(this, "notificationDuration", _descriptor8, this);

          // 提示显示时长（秒）
          _initializerDefineProperty(this, "showDebugInfo", _descriptor9, this);

          // 是否显示调试信息
          this._gameManager = null;
          this._exitDoorNotified = false;
        }

        // 是否已显示逃生门提示
        start() {
          // 获取GameManager单例
          this._gameManager = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();

          if (!this._gameManager) {
            console.error('[GameUI] GameManager未找到！请确保场景中有GameManager组件');
            return;
          } // 注册回调


          this._gameManager.onStateChange((newState, stats) => {
            this.onGameStateChange(newState, stats);
          });

          this._gameManager.onStatsChange(stats => {
            this.onStatsChange(stats);
          }); // 初始化UI


          if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
          }

          if (this.exitDoorNotification) {
            this.exitDoorNotification.node.active = false;
          } // 显示初始统计


          this.updateStatsDisplay(this._gameManager.getStats());
          console.log('[GameUI] 游戏UI初始化完成');
        }

        update(deltaTime) {
          if (!this._gameManager || !this._gameManager.isPlaying()) return; // 每帧更新倒计时显示（确保精确）

          this.updateTimerDisplay(this._gameManager.getTimeRemaining());
        } // ============ 回调处理 ============

        /**
         * 游戏状态变化
         */


        onGameStateChange(newState, stats) {
          console.log(`[GameUI] 游戏状态变化：${newState}`); // 更新统计显示

          this.updateStatsDisplay(stats); // 处理游戏结束

          if (newState !== (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
            error: Error()
          }), GameState) : GameState).PLAYING && newState !== (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
            error: Error()
          }), GameState) : GameState).WAITING) {
            this.showGameOver(newState);
          }
        }
        /**
         * 游戏统计变化
         */


        onStatsChange(stats) {
          this.updateStatsDisplay(stats); // 检查是否需要显示逃生门开启提示

          if (!this._exitDoorNotified && this._gameManager && this._gameManager.isExitZoneGenerated()) {
            this.showExitDoorNotification();
            this._exitDoorNotified = true;
          }
        } // ============ UI更新 ============

        /**
         * 更新倒计时显示
         */


        updateTimerDisplay(timeRemaining) {
          if (!this.timerLabel) return;
          const minutes = Math.floor(timeRemaining / 60);
          const seconds = Math.floor(timeRemaining % 60);
          const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          this.timerLabel.string = `时间: ${timeStr}`; // 时间不足1分钟时变红色（可选）

          if (timeRemaining < 60) {
            this.timerLabel.color = new this.timerLabel.color.constructor(255, 0, 0, 255);
          } else {
            this.timerLabel.color = new this.timerLabel.color.constructor(255, 255, 255, 255);
          }
        }
        /**
         * 更新统计数据显示
         */


        updateStatsDisplay(stats) {
          // 更新倒计时
          this.updateTimerDisplay(stats.timeRemaining); // 更新矿石数量

          if (this.oreLabel) {
            this.oreLabel.string = `矿石: ${stats.oreCollected}`;
          } // 更新逃脱人数


          if (this.escapedLabel) {
            this.escapedLabel.string = `逃脱: ${stats.survivorsEscaped}/3`; // 达到胜利条件时变绿色

            if (stats.survivorsEscaped >= 3) {
              this.escapedLabel.color = new this.escapedLabel.color.constructor(0, 255, 0, 255);
            }
          } // 更新淘汰人数


          if (this.eliminatedLabel) {
            this.eliminatedLabel.string = `淘汰: ${stats.survivorsEliminated}/3`; // 达到追捕者胜利条件时变红色

            if (stats.survivorsEliminated >= 3) {
              this.eliminatedLabel.color = new this.eliminatedLabel.color.constructor(255, 0, 0, 255);
            }
          }
        }
        /**
         * 显示游戏结束面板
         */


        showGameOver(result) {
          if (!this.gameOverPanel || !this.gameOverLabel) {
            console.warn('[GameUI] 游戏结束面板或文字未绑定');
            return;
          } // 显示面板


          this.gameOverPanel.active = true; // 设置文字和颜色

          let resultText = '';
          let color = new this.gameOverLabel.color.constructor(255, 255, 255, 255);

          switch (result) {
            case (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
              error: Error()
            }), GameState) : GameState).HUNTER_WIN:
              resultText = '追捕者胜利！';
              color = new this.gameOverLabel.color.constructor(255, 0, 0, 255); // 红色

              break;

            case (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
              error: Error()
            }), GameState) : GameState).SURVIVOR_WIN:
              resultText = '逃生者胜利！';
              color = new this.gameOverLabel.color.constructor(0, 255, 0, 255); // 绿色

              break;

            case (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
              error: Error()
            }), GameState) : GameState).DRAW:
              resultText = '平局！';
              color = new this.gameOverLabel.color.constructor(255, 255, 0, 255); // 黄色

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


        hideGameOver() {
          if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
          }
        }
        /**
         * 显示逃生门开启提示
         */


        showExitDoorNotification() {
          if (!this.exitDoorNotification) return;
          console.log('[GameUI] 显示逃生门开启提示'); // 显示提示

          this.exitDoorNotification.node.active = true;
          this.exitDoorNotification.string = '逃生门已开启！';
          this.exitDoorNotification.color = new this.exitDoorNotification.color.constructor(0, 255, 0, 255); // 绿色
          // 定时隐藏

          this.scheduleOnce(() => {
            if (this.exitDoorNotification) {
              this.exitDoorNotification.node.active = false;
            }
          }, this.notificationDuration);
        } // ============ 按钮事件（可由UI按钮调用） ============

        /**
         * 重新开始游戏
         */


        onRestartButtonClick() {
          console.log('[GameUI] 点击重新开始');

          if (this._gameManager) {
            this.hideGameOver();

            this._gameManager.restartGame();
          }
        }
        /**
         * 开始游戏（用于手动启动）
         */


        onStartButtonClick() {
          console.log('[GameUI] 点击开始游戏');

          if (this._gameManager) {
            this._gameManager.startGame();
          }
        } // ============ 调试功能 ============

        /**
         * 调试：模拟逃脱
         */


        debugEscape() {
          if (this._gameManager) {
            this._gameManager.debugEscape(1);
          }
        }
        /**
         * 调试：模拟淘汰
         */


        debugEliminate() {
          if (this._gameManager) {
            this._gameManager.debugEliminate(1);
          }
        }
        /**
         * 调试：设置剩余时间
         */


        debugSetTime(seconds) {
          if (this._gameManager) {
            this._gameManager.setTimeRemaining(seconds);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "timerLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "oreLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "escapedLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "eliminatedLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "gameOverPanel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "gameOverLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "exitDoorNotification", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "notificationDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5.0;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "showDebugInfo", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4c798e5fb0356fa0c6fb0a5c27f209754e0ca254.js.map