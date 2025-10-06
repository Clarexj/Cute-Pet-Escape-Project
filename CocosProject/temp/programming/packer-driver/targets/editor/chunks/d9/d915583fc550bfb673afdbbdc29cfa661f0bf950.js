System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Prefab, instantiate, Vec3, CharacterState, CharacterStateType, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _class3, _crd, ccclass, property, GameState, GameManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCharacterState(extras) {
    _reporterNs.report("CharacterState", "./CharacterState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterStateType(extras) {
    _reporterNs.report("CharacterStateType", "./CharacterState", _context.meta, extras);
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
      Prefab = _cc.Prefab;
      instantiate = _cc.instantiate;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      CharacterState = _unresolved_2.CharacterState;
      CharacterStateType = _unresolved_2.CharacterStateType;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1f21cULf7tJJ5UwbgLnU9Lh", "GameManager", undefined); // 文件名: GameManager.ts
      // 功能：游戏状态管理 + 倒计时 + 胜负判定（任务2.2）
      // 管理完整的游戏流程


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'instantiate', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 游戏状态枚举
       */

      _export("GameState", GameState = /*#__PURE__*/function (GameState) {
        GameState["WAITING"] = "waiting";
        GameState["PLAYING"] = "playing";
        GameState["HUNTER_WIN"] = "hunter_win";
        GameState["SURVIVOR_WIN"] = "survivor_win";
        GameState["DRAW"] = "draw";
        return GameState;
      }({}));
      /**
       * 游戏统计数据
       */

      /**
       * 游戏状态变化回调类型
       */

      /**
       * 游戏统计变化回调类型
       */


      _export("GameManager", GameManager = (_dec = ccclass('GameManager'), _dec2 = property(Prefab), _dec3 = property(Node), _dec(_class = (_class2 = (_class3 = class GameManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "gameDuration", _descriptor, this);

          // 游戏时长（秒），默认5分钟
          _initializerDefineProperty(this, "survivorsToWin", _descriptor2, this);

          // 逃生者胜利所需逃脱人数
          _initializerDefineProperty(this, "eliminationsToWin", _descriptor3, this);

          // 追捕者胜利所需淘汰人数
          _initializerDefineProperty(this, "autoStartGame", _descriptor4, this);

          // 是否自动开始游戏
          _initializerDefineProperty(this, "oresRequiredForExit", _descriptor5, this);

          // 生成逃生门所需矿石数量
          _initializerDefineProperty(this, "exitZonePrefab", _descriptor6, this);

          // 逃生门预制体（可选）
          _initializerDefineProperty(this, "exitZoneSpawnPoint", _descriptor7, this);

          // 逃生门生成位置（可选）
          // 游戏状态
          this._currentState = GameState.WAITING;
          this._timeRemaining = 0;
          // 游戏统计
          this._oreCollected = 0;
          this._survivorsEscaped = 0;
          this._survivorsEliminated = 0;
          // 逃生门系统
          this._exitZoneGenerated = false;
          // 逃生门是否已生成
          this._exitZoneNode = null;
          // 生成的逃生门节点
          // 角色引用
          this._allCharacters = [];
          // 回调系统
          this._stateChangeCallbacks = [];
          this._statsChangeCallbacks = [];
        }

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
          console.log('[GameManager] 游戏管理器初始化'); // 初始化时间

          this._timeRemaining = this.gameDuration; // 缓存所有角色

          this.refreshCharacters(); // 注册角色状态变化监听

          this.registerCharacterListeners(); // 如果自动开始，启动游戏

          if (this.autoStartGame) {
            this.scheduleOnce(() => {
              this.startGame();
            }, 1.0); // 延迟1秒启动，确保所有组件初始化完成
          } // 通知初始统计


          this.notifyStatsChange();
        }

        update(deltaTime) {
          // 只有游戏进行中才倒计时
          if (this._currentState !== GameState.PLAYING) return; // 倒计时

          this._timeRemaining -= deltaTime; // 每秒通知一次统计更新（优化性能）

          if (Math.floor(this._timeRemaining * 10) % 10 === 0) {
            this.notifyStatsChange();
          } // 倒计时结束


          if (this._timeRemaining <= 0) {
            this._timeRemaining = 0;
            this.onTimeUp();
            return;
          } // 实时检查胜负条件


          this.checkWinConditions();
        }

        onDestroy() {
          if (GameManager._instance === this) {
            GameManager._instance = null;
          }
        } // ============ 游戏流程控制 ============

        /**
         * 开始游戏
         */


        startGame() {
          if (this._currentState !== GameState.WAITING) {
            console.warn('[GameManager] 游戏已经开始，无法重复开始');
            return;
          }

          console.log('[GameManager] 游戏开始！');
          this._currentState = GameState.PLAYING;
          this._timeRemaining = this.gameDuration; // 重置统计

          this._oreCollected = 0;
          this._survivorsEscaped = 0;
          this._survivorsEliminated = 0;
          this.notifyStateChange();
          this.notifyStatsChange();
        }
        /**
         * 暂停游戏
         */


        pauseGame() {
          if (this._currentState === GameState.PLAYING) {
            console.log('[GameManager] 游戏暂停'); // 这里可以添加暂停逻辑
          }
        }
        /**
         * 重新开始游戏
         */


        restartGame() {
          console.log('[GameManager] 重新开始游戏'); // 重置游戏状态

          this._currentState = GameState.WAITING;
          this._timeRemaining = this.gameDuration;
          this._oreCollected = 0;
          this._survivorsEscaped = 0;
          this._survivorsEliminated = 0; // 重置所有角色

          for (const character of this._allCharacters) {
            character.reset();
          } // 延迟启动


          this.scheduleOnce(() => {
            this.startGame();
          }, 0.5);
        }
        /**
         * 结束游戏
         */


        endGame(result) {
          if (this._currentState !== GameState.PLAYING) return;
          console.log(`[GameManager] 游戏结束！结果：${result}`);
          this._currentState = result;
          this.notifyStateChange();
        } // ============ 胜负判定 ============

        /**
         * 检查胜负条件
         */


        checkWinConditions() {
          // 条件1：淘汰人数 >= 3，追捕者胜利
          if (this._survivorsEliminated >= this.eliminationsToWin) {
            this.endGame(GameState.HUNTER_WIN);
            return;
          } // 条件2：逃脱人数 >= 3，逃生者胜利


          if (this._survivorsEscaped >= this.survivorsToWin) {
            this.endGame(GameState.SURVIVOR_WIN);
            return;
          }
        }
        /**
         * 时间到
         */


        onTimeUp() {
          console.log('[GameManager] 时间到！'); // 条件3：倒计时结束且逃脱人数 < 2，追捕者胜利

          if (this._survivorsEscaped < 2) {
            this.endGame(GameState.HUNTER_WIN);
          } // 条件4：倒计时结束且逃脱人数 == 2，平局
          else if (this._survivorsEscaped === 2) {
            this.endGame(GameState.DRAW);
          } // 条件5：倒计时结束且逃脱人数 >= 3，逃生者胜利（已在checkWinConditions中处理）
          else {
            this.endGame(GameState.SURVIVOR_WIN);
          }
        } // ============ 统计系统 ============

        /**
         * 刷新角色列表
         */


        refreshCharacters() {
          this._allCharacters = this.node.scene.getComponentsInChildren(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);
          console.log(`[GameManager] 缓存了 ${this._allCharacters.length} 个角色`);
        }
        /**
         * 注册角色状态变化监听
         */


        registerCharacterListeners() {
          for (const character of this._allCharacters) {
            character.onStateChange((oldState, newState) => {
              // 监听淘汰
              if (newState === (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
                error: Error()
              }), CharacterStateType) : CharacterStateType).ELIMINATED) {
                this.onSurvivorEliminated(character.node);
              }
            });
          }
        }
        /**
         * 矿石被拾取
         */


        onOreCollected(oreNode) {
          this._oreCollected++;
          console.log(`[GameManager] 矿石被拾取，当前数量：${this._oreCollected}/${this.oresRequiredForExit}`);
          this.notifyStatsChange(); // 检查是否达到生成逃生门的条件

          if (this._oreCollected >= this.oresRequiredForExit && !this._exitZoneGenerated) {
            this.generateExitZone();
          }
        }
        /**
         * 逃生者逃脱
         */


        onSurvivorEscaped(survivorNode) {
          this._survivorsEscaped++;
          console.log(`[GameManager] 逃生者逃脱，当前数量：${this._survivorsEscaped}`);
          this.notifyStatsChange(); // 立即检查胜负条件

          this.checkWinConditions();
        }
        /**
         * 逃生者被淘汰
         */


        onSurvivorEliminated(survivorNode) {
          this._survivorsEliminated++;
          console.log(`[GameManager] 逃生者被淘汰，当前数量：${this._survivorsEliminated}`);
          this.notifyStatsChange(); // 立即检查胜负条件

          this.checkWinConditions();
        } // ============ 逃生门生成系统 ============

        /**
         * 生成逃生门
         */


        generateExitZone() {
          console.log('[GameManager] 矿石收集完成，生成逃生门！');
          this._exitZoneGenerated = true; // 方式1：如果提供了预制体，使用预制体生成

          if (this.exitZonePrefab) {
            this._exitZoneNode = instantiate(this.exitZonePrefab);

            this._exitZoneNode.setParent(this.node.scene); // 设置位置


            if (this.exitZoneSpawnPoint) {
              // 如果指定了生成点，使用生成点位置
              this._exitZoneNode.setWorldPosition(this.exitZoneSpawnPoint.getWorldPosition());
            } else {
              // 否则使用默认位置（场景中心偏远处）
              this._exitZoneNode.setPosition(new Vec3(20, 0, 20));
            }

            console.log(`[GameManager] 逃生门已在预制体方式生成，位置：${this._exitZoneNode.position}`);
          } // 方式2：如果没有预制体，激活场景中已存在但隐藏的ExitZone节点
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
          } // 通知UI更新（可以显示"逃生门已开启"提示）


          this.notifyStatsChange();
        }
        /**
         * 查找场景中的ExitZone节点
         */


        findExitZoneInScene() {
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


        isExitZoneGenerated() {
          return this._exitZoneGenerated;
        }
        /**
         * 获取生成逃生门所需矿石数量（任务3.2新增）
         */


        getOresRequiredForExit() {
          return this.oresRequiredForExit;
        } // ============ 查询接口 ============

        /**
         * 获取当前游戏状态
         */


        getCurrentState() {
          return this._currentState;
        }
        /**
         * 获取游戏统计数据
         */


        getStats() {
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


        getTimeRemaining() {
          return this._timeRemaining;
        }
        /**
         * 获取剩余时间（格式化为MM:SS）
         */


        getTimeRemainingFormatted() {
          const minutes = Math.floor(this._timeRemaining / 60);
          const seconds = Math.floor(this._timeRemaining % 60);
          return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        /**
         * 是否游戏进行中
         */


        isPlaying() {
          return this._currentState === GameState.PLAYING;
        }
        /**
         * 是否游戏结束
         */


        isGameOver() {
          return this._currentState === GameState.HUNTER_WIN || this._currentState === GameState.SURVIVOR_WIN || this._currentState === GameState.DRAW;
        } // ============ 回调系统 ============

        /**
         * 注册游戏状态变化回调
         */


        onStateChange(callback) {
          this._stateChangeCallbacks.push(callback);
        }
        /**
         * 通知游戏状态变化
         */


        notifyStateChange() {
          const stats = this.getStats();

          for (const callback of this._stateChangeCallbacks) {
            callback(this._currentState, stats);
          }
        }
        /**
         * 注册游戏统计变化回调
         */


        onStatsChange(callback) {
          this._statsChangeCallbacks.push(callback);
        }
        /**
         * 通知游戏统计变化
         */


        notifyStatsChange() {
          const stats = this.getStats();

          for (const callback of this._statsChangeCallbacks) {
            callback(stats);
          }
        } // ============ 单例访问 ============

        /**
         * 获取GameManager单例
         */


        static getInstance() {
          return GameManager._instance;
        } // ============ 调试功能 ============

        /**
         * 设置剩余时间（用于测试）
         */


        setTimeRemaining(seconds) {
          this._timeRemaining = seconds;
          console.log(`[GameManager] 剩余时间设置为 ${seconds} 秒`);
          this.notifyStatsChange();
        }
        /**
         * 模拟逃脱（用于测试）
         */


        debugEscape(count = 1) {
          for (let i = 0; i < count; i++) {
            this.onSurvivorEscaped(new Node('DebugSurvivor'));
          }
        }
        /**
         * 模拟淘汰（用于测试）
         */


        debugEliminate(count = 1) {
          for (let i = 0; i < count; i++) {
            this._survivorsEliminated++;
          }

          this.notifyStatsChange();
          this.checkWinConditions();
        }
        /**
         * 获取游戏信息（调试用）
         */


        getGameInfo() {
          return `状态:${this._currentState}, 时间:${this.getTimeRemainingFormatted()}, 矿石:${this._oreCollected}, 逃脱:${this._survivorsEscaped}, 淘汰:${this._survivorsEliminated}`;
        }

      }, _class3._instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gameDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 300.0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "survivorsToWin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "eliminationsToWin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "autoStartGame", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "oresRequiredForExit", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 8;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "exitZonePrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "exitZoneSpawnPoint", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d915583fc550bfb673afdbbdc29cfa661f0bf950.js.map