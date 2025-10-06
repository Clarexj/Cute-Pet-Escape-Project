System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Sprite, Color, GameManager, CharacterState, CharacterStateType, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _crd, ccclass, property, UIManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameStats(extras) {
    _reporterNs.report("GameStats", "./GameManager", _context.meta, extras);
  }

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
      Label = _cc.Label;
      Sprite = _cc.Sprite;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      GameManager = _unresolved_2.GameManager;
    }, function (_unresolved_3) {
      CharacterState = _unresolved_3.CharacterState;
      CharacterStateType = _unresolved_3.CharacterStateType;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "789cbzxeEBLUa218HrhsDZ1", "UIManager", undefined); // 文件名: UIManager.ts
      // 功能：HUD核心UI管理器（任务3.2）
      // 管理倒计时、矿石进度、团队成员状态等核心UI元素


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Sprite', 'Color']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 团队成员UI状态
       */

      _export("UIManager", UIManager = (_dec = ccclass('UIManager'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Node), _dec5 = property([Sprite]), _dec(_class = (_class2 = class UIManager extends Component {
        constructor() {
          super(...arguments);

          // ============ 倒计时UI ============
          _initializerDefineProperty(this, "timerLabel", _descriptor, this);

          // 倒计时显示（格式：05:00）
          // ============ 矿石进度UI ============
          _initializerDefineProperty(this, "oreProgressLabel", _descriptor2, this);

          // 矿石进度显示（格式：0/8）
          // ============ 团队成员状态UI ============
          _initializerDefineProperty(this, "teamStatusContainer", _descriptor3, this);

          // 团队状态容器节点
          _initializerDefineProperty(this, "teamMemberSprites", _descriptor4, this);

          // 4个团队成员状态方块（手动绑定）
          _initializerDefineProperty(this, "autoFindTeamMembers", _descriptor5, this);

          // 自动查找场景中的逃生者
          // ============ 状态颜色配置 ============
          _initializerDefineProperty(this, "normalColor", _descriptor6, this);

          // 正常状态：绿色
          _initializerDefineProperty(this, "caughtColor", _descriptor7, this);

          // 被抓状态：橙色
          _initializerDefineProperty(this, "hangedColor", _descriptor8, this);

          // 被挂起状态：红色
          _initializerDefineProperty(this, "eliminatedColor", _descriptor9, this);

          // 淘汰状态：灰色
          // ============ 调试选项 ============
          _initializerDefineProperty(this, "enableDebugLog", _descriptor10, this);

          // 是否启用调试日志
          // 私有成员
          this._gameManager = null;
          this._teamMembers = [];
        }

        // 团队成员数据列表
        start() {
          console.log('[UIManager] HUD UI管理器初始化'); // 获取GameManager单例

          this._gameManager = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();

          if (!this._gameManager) {
            console.error('[UIManager] GameManager未找到！请确保场景中有GameManager组件');
            return;
          } // 注册GameManager回调


          this._gameManager.onStatsChange(stats => {
            this.onStatsChange(stats);
          }); // 初始化团队成员UI


          this.initializeTeamMemberUI(); // 显示初始数据

          this.updateAllUI();
          console.log('[UIManager] HUD UI初始化完成');
        }

        update(deltaTime) {
          if (!this._gameManager || !this._gameManager.isPlaying()) return; // 每帧更新倒计时（确保精确显示）

          this.updateTimerDisplay();
        } // ============ 团队成员UI初始化 ============

        /**
         * 初始化团队成员UI
         */


        initializeTeamMemberUI() {
          var _this = this;

          if (!this.autoFindTeamMembers) {
            console.log('[UIManager] 自动查找已禁用，需要手动配置团队成员');
            return;
          } // 查找场景中所有带CharacterState组件的逃生者


          var allCharacters = this.node.scene.getComponentsInChildren(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState); // 筛选出逃生者（排除追捕者）
          // 假设追捕者节点名包含"Hunter"，逃生者节点名包含"Survivor"

          var survivors = allCharacters.filter(char => char.node.name.toLowerCase().includes('survivor'));

          if (survivors.length === 0) {
            console.warn('[UIManager] 场景中未找到逃生者节点，团队成员UI将无法显示');
            return;
          }

          if (survivors.length > this.teamMemberSprites.length) {
            console.warn("[UIManager] \u9003\u751F\u8005\u6570\u91CF(" + survivors.length + ")\u8D85\u8FC7UI\u65B9\u5757\u6570\u91CF(" + this.teamMemberSprites.length + ")\uFF0C\u90E8\u5206\u89D2\u8272\u4E0D\u4F1A\u663E\u793A");
          } // 绑定逃生者与UI方块


          var maxMembers = Math.min(survivors.length, this.teamMemberSprites.length);

          var _loop = function _loop() {
            var survivor = survivors[i];
            var sprite = _this.teamMemberSprites[i];

            if (!sprite) {
              console.warn("[UIManager] teamMemberSprites[" + i + "]\u672A\u7ED1\u5B9A\uFF0C\u8DF3\u8FC7");
              return 1; // continue
            } // 创建团队成员UI数据


            var memberData = {
              characterNode: survivor.node,
              characterState: survivor,
              uiSprite: sprite
            };

            _this._teamMembers.push(memberData); // 注册状态变化回调


            survivor.onStateChange((oldState, newState) => {
              _this.onCharacterStateChange(memberData, oldState, newState);
            }); // 初始化颜色

            _this.updateTeamMemberColor(memberData);

            if (_this.enableDebugLog) {
              console.log("[UIManager] \u7ED1\u5B9A\u56E2\u961F\u6210\u5458 " + i + ": " + survivor.node.name);
            }
          };

          for (var i = 0; i < maxMembers; i++) {
            if (_loop()) continue;
          }

          console.log("[UIManager] \u6210\u529F\u7ED1\u5B9A " + this._teamMembers.length + " \u4E2A\u56E2\u961F\u6210\u5458UI");
        }
        /**
         * 角色状态变化回调
         */


        onCharacterStateChange(memberData, oldState, newState) {
          if (this.enableDebugLog) {
            console.log("[UIManager] " + memberData.characterNode.name + " \u72B6\u6001\u53D8\u5316: " + oldState + " -> " + newState);
          }

          this.updateTeamMemberColor(memberData);
        }
        /**
         * 更新团队成员UI颜色
         */


        updateTeamMemberColor(memberData) {
          var state = memberData.characterState.getCurrentState();
          var color;

          switch (state) {
            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).NORMAL:
              color = this.normalColor;
              break;

            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).CAUGHT:
              color = this.caughtColor;
              break;

            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).HANGED:
              color = this.hangedColor;
              break;

            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).ELIMINATED:
              color = this.eliminatedColor;
              break;

            default:
              color = this.normalColor;
          }

          memberData.uiSprite.color = color;
        } // ============ 统计数据更新 ============

        /**
         * GameManager统计数据变化回调
         */


        onStatsChange(stats) {
          this.updateOreProgressDisplay(stats);
          this.updateTimerDisplay();
        }
        /**
         * 更新所有UI元素
         */


        updateAllUI() {
          if (!this._gameManager) return;

          var stats = this._gameManager.getStats();

          this.updateTimerDisplay();
          this.updateOreProgressDisplay(stats);
          this.updateTeamMemberUI();
        }
        /**
         * 更新倒计时显示
         */


        updateTimerDisplay() {
          if (!this.timerLabel || !this._gameManager) return;

          var timeRemaining = this._gameManager.getTimeRemaining();

          var minutes = Math.floor(timeRemaining / 60);
          var seconds = Math.floor(timeRemaining % 60); // 格式化为 MM:SS

          this.timerLabel.string = this.padZero(minutes) + ":" + this.padZero(seconds); // ✅ 倒计时 < 60秒时变红色提示

          if (timeRemaining <= 60 && timeRemaining > 0) {
            this.timerLabel.color = new Color(255, 0, 0, 255); // 红色
          } else {
            this.timerLabel.color = new Color(255, 255, 255, 255); // 白色
          }
        }
        /**
         * 更新矿石进度显示
         */


        updateOreProgressDisplay(stats) {
          if (!this.oreProgressLabel || !this._gameManager) return;

          var oresRequired = this._gameManager.getOresRequiredForExit();

          this.oreProgressLabel.string = stats.oreCollected + "/" + oresRequired; // ✅ 矿石收集完成时变绿色提示

          if (stats.oreCollected >= oresRequired) {
            this.oreProgressLabel.color = new Color(0, 255, 0, 255); // 绿色
          } else {
            this.oreProgressLabel.color = new Color(255, 255, 255, 255); // 白色
          }
        }
        /**
         * 更新团队成员UI（手动刷新所有成员颜色）
         */


        updateTeamMemberUI() {
          for (var memberData of this._teamMembers) {
            this.updateTeamMemberColor(memberData);
          }
        } // ============ 工具方法 ============

        /**
         * 补零（01, 02, ..., 09, 10）
         */


        padZero(num) {
          return num < 10 ? "0" + num : "" + num;
        }
        /**
         * 手动刷新UI（供外部调用）
         */


        refreshUI() {
          this.updateAllUI();
        }
        /**
         * 获取团队成员数量
         */


        getTeamMemberCount() {
          return this._teamMembers.length;
        }
        /**
         * 获取指定团队成员的状态
         */


        getTeamMemberState(index) {
          if (index < 0 || index >= this._teamMembers.length) {
            return null;
          }

          return this._teamMembers[index].characterState.getCurrentState();
        } // ============ 调试功能 ============

        /**
         * 打印所有团队成员状态（调试用）
         */


        debugPrintTeamStatus() {
          console.log('=== 团队成员状态 ===');

          for (var i = 0; i < this._teamMembers.length; i++) {
            var member = this._teamMembers[i];
            var state = member.characterState.getCurrentState();
            var color = member.uiSprite.color;
            console.log("[" + i + "] " + member.characterNode.name + ": " + state + " (\u989C\u8272: " + color.toString() + ")");
          }

          console.log('==================');
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "timerLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "oreProgressLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "teamStatusContainer", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "teamMemberSprites", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "autoFindTeamMembers", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "normalColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(0, 255, 0, 255);
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "caughtColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 165, 0, 255);
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "hangedColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 0, 0, 255);
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "eliminatedColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(128, 128, 128, 255);
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "enableDebugLog", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=eec745fa4777e5392c0dba6aac1d3cdb385700d7.js.map