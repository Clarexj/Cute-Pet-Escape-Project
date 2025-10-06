System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Button, Label, HunterController, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, HunterUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfHunterController(extras) {
    _reporterNs.report("HunterController", "./HunterController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBoard(extras) {
    _reporterNs.report("Board", "./Board", _context.meta, extras);
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
      Button = _cc.Button;
      Label = _cc.Label;
    }, function (_unresolved_2) {
      HunterController = _unresolved_2.HunterController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5fc2etPMx9F3pKblrTfQb8a", "HunterUI", undefined); // 文件名: HunterUI.ts
      // 功能：追捕者UI - 攻击按钮、踩碎木板按钮（任务2.2）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("HunterUI", HunterUI = (_dec = ccclass('HunterUI'), _dec2 = property(Node), _dec3 = property(Label), _dec4 = property(Node), _dec5 = property(Label), _dec6 = property(_crd && HunterController === void 0 ? (_reportPossibleCrUseOfHunterController({
        error: Error()
      }), HunterController) : HunterController), _dec(_class = (_class2 = class HunterUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "attackButton", _descriptor, this);

          // 攻击按钮节点
          _initializerDefineProperty(this, "attackLabel", _descriptor2, this);

          // 攻击按钮文字
          _initializerDefineProperty(this, "breakBoardButton", _descriptor3, this);

          // 踩碎木板按钮节点
          _initializerDefineProperty(this, "breakBoardLabel", _descriptor4, this);

          // 踩碎木板按钮文字
          _initializerDefineProperty(this, "hunterController", _descriptor5, this);

          // 追捕者控制器
          _initializerDefineProperty(this, "showCooldownProgress", _descriptor6, this);
        }

        // 是否显示冷却进度
        start() {
          if (!this.hunterController) {
            console.error('[HunterUI] HunterController未绑定！');
            return;
          } // 初始化按钮状态


          this.hideAttackButton();
          this.hideBreakBoardButton(); // 注册回调

          this.hunterController.onAttackTargetChange(target => {
            this.onAttackTargetChange(target);
          });
          this.hunterController.onBoardTargetChange(board => {
            this.onBoardTargetChange(board);
          }); // 绑定按钮点击事件

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

        update(deltaTime) {
          // 更新攻击按钮冷却显示
          if (this.attackButton && this.attackButton.active && this.showCooldownProgress) {
            this.updateAttackCooldown();
          }
        } // ============ 攻击按钮 ============

        /**
         * 攻击目标变化
         */


        onAttackTargetChange(target) {
          if (target) {
            this.showAttackButton(target.name);
          } else {
            this.hideAttackButton();
          }
        }
        /**
         * 显示攻击按钮
         */


        showAttackButton(targetName) {
          if (!this.attackButton) return;
          this.attackButton.active = true;

          if (this.attackLabel) {
            this.attackLabel.string = `攻击 ${targetName}`;
          }
        }
        /**
         * 隐藏攻击按钮
         */


        hideAttackButton() {
          if (this.attackButton) {
            this.attackButton.active = false;
          }
        }
        /**
         * 更新攻击冷却显示
         */


        updateAttackCooldown() {
          if (!this.hunterController || !this.attackLabel) return;
          const canAttack = this.hunterController.canAttack();
          const progress = this.hunterController.getAttackCooldownProgress();

          if (!canAttack) {
            var _this$attackButton;

            // 显示冷却进度
            const percentage = Math.floor(progress * 100);
            this.attackLabel.string = `冷却中 ${percentage}%`; // 可选：改变按钮颜色

            const button = (_this$attackButton = this.attackButton) == null ? void 0 : _this$attackButton.getComponent(Button);

            if (button) {
              button.interactable = false;
            }
          } else {
            var _this$attackButton2;

            // 恢复正常显示
            const target = this.hunterController.getAttackTarget();

            if (target) {
              this.attackLabel.string = `攻击 ${target.name}`;
            }

            const button = (_this$attackButton2 = this.attackButton) == null ? void 0 : _this$attackButton2.getComponent(Button);

            if (button) {
              button.interactable = true;
            }
          }
        }
        /**
         * 攻击按钮点击
         */


        onAttackButtonClick() {
          if (!this.hunterController) return;
          console.log('[HunterUI] 点击攻击按钮');
          this.hunterController.triggerAttack();
        } // ============ 踩碎木板按钮 ============

        /**
         * 木板目标变化
         */


        onBoardTargetChange(board) {
          if (board) {
            this.showBreakBoardButton();
          } else {
            this.hideBreakBoardButton();
          }
        }
        /**
         * 显示踩碎木板按钮
         */


        showBreakBoardButton() {
          if (!this.breakBoardButton) return;
          this.breakBoardButton.active = true;

          if (this.breakBoardLabel) {
            this.breakBoardLabel.string = "踩碎木板";
          }
        }
        /**
         * 隐藏踩碎木板按钮
         */


        hideBreakBoardButton() {
          if (this.breakBoardButton) {
            this.breakBoardButton.active = false;
          }
        }
        /**
         * 踩碎木板按钮点击
         */


        onBreakBoardButtonClick() {
          if (!this.hunterController) return;
          console.log('[HunterUI] 点击踩碎木板按钮');
          this.hunterController.triggerBreakBoard();
        } // ============ 手动控制接口 ============

        /**
         * 手动显示攻击按钮（用于调试）
         */


        debugShowAttackButton() {
          this.showAttackButton('测试目标');
        }
        /**
         * 手动隐藏攻击按钮（用于调试）
         */


        debugHideAttackButton() {
          this.hideAttackButton();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "attackButton", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "attackLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "breakBoardButton", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "breakBoardLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "hunterController", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showCooldownProgress", [property], {
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
//# sourceMappingURL=3f991f6bfe26687cb2ab5929938175bee08ffe12.js.map