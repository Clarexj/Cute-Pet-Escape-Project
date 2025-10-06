System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Button, Label, UIOpacity, ProgressBar, PlayerController, CharacterState, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, InteractionUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfPlayerController(extras) {
    _reporterNs.report("PlayerController", "./PlayerController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterState(extras) {
    _reporterNs.report("CharacterState", "./CharacterState", _context.meta, extras);
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
      UIOpacity = _cc.UIOpacity;
      ProgressBar = _cc.ProgressBar;
    }, function (_unresolved_2) {
      PlayerController = _unresolved_2.PlayerController;
    }, function (_unresolved_3) {
      CharacterState = _unresolved_3.CharacterState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1ceeahPo6hLT5d7VI9QlV9O", "InteractionUI", undefined); // 文件名: InteractionUI.ts
      // 功能：交互按钮UI控制（显示/隐藏，触发交互）+ 救援系统
      // 版本：V1.1 - 支持救援交互（任务2.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label', 'UIOpacity', 'ProgressBar']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("InteractionUI", InteractionUI = (_dec = ccclass('InteractionUI'), _dec2 = property(_crd && PlayerController === void 0 ? (_reportPossibleCrUseOfPlayerController({
        error: Error()
      }), PlayerController) : PlayerController), _dec3 = property(Node), _dec4 = property(Label), _dec5 = property(ProgressBar), _dec(_class = (_class2 = class InteractionUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "player", _descriptor, this);

          // 玩家控制器引用
          _initializerDefineProperty(this, "buttonNode", _descriptor2, this);

          // 交互按钮节点
          _initializerDefineProperty(this, "promptLabel", _descriptor3, this);

          // 提示文本Label（可选）
          _initializerDefineProperty(this, "rescueProgressBar", _descriptor4, this);

          // 救援进度条（可选）
          _initializerDefineProperty(this, "fadeDuration", _descriptor5, this);

          // 淡入淡出动画时长（秒）
          this._button = null;
          // 按钮组件
          this._uiOpacity = null;
          // 透明度组件
          this._isVisible = false;
          // 当前是否可见
          this._fadeTimer = 0;
          // 淡入淡出计时器
          this._targetOpacity = 0;
          // 目标透明度
          // 任务2.1新增：救援模式
          this._isRescueMode = false;
          // 是否是救援模式
          this._currentRescueTarget = null;
        }

        // 当前救援目标
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
          } // 获取或添加UIOpacity组件


          this._uiOpacity = this.buttonNode.getComponent(UIOpacity);

          if (!this._uiOpacity) {
            this._uiOpacity = this.buttonNode.addComponent(UIOpacity);
          } // 初始隐藏按钮


          this._uiOpacity.opacity = 0;
          this._targetOpacity = 0;
          this._isVisible = false; // 初始隐藏救援进度条

          if (this.rescueProgressBar) {
            this.rescueProgressBar.node.active = false;
            this.rescueProgressBar.progress = 0;
          } // 监听按钮点击事件


          this._button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        }

        start() {
          // 检查玩家控制器引用
          if (!this.player) {
            console.error('[InteractionUI] player未绑定！');
            return;
          } // 注册交互状态变化回调


          this.player.onInteractionChange(interactable => {
            // 救援模式优先级更高，如果正在救援则不响应普通交互
            if (this._isRescueMode) return;

            if (interactable) {
              // 有可交互物体，显示按钮
              this.showButton(interactable.getInteractPrompt(), false);
            } else {
              // 没有可交互物体，隐藏按钮
              this.hideButton();
            }
          }); // 任务2.1新增：注册救援目标变化回调

          this.player.onRescueTargetChange(target => {
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

        update(deltaTime) {
          // 平滑淡入淡出动画
          if (this._uiOpacity.opacity !== this._targetOpacity) {
            var opacityDiff = this._targetOpacity - this._uiOpacity.opacity;
            var changeSpeed = 255 / this.fadeDuration; // 每秒变化速度

            var changeAmount = changeSpeed * deltaTime;

            if (Math.abs(opacityDiff) <= changeAmount) {
              // 到达目标透明度
              this._uiOpacity.opacity = this._targetOpacity;
            } else {
              // 平滑过渡
              this._uiOpacity.opacity += Math.sign(opacityDiff) * changeAmount;
            }
          } // 任务2.1新增：更新救援进度条


          if (this._isRescueMode && this._currentRescueTarget && this.rescueProgressBar) {
            var targetState = this._currentRescueTarget.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
              error: Error()
            }), CharacterState) : CharacterState);

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


        showButton(promptText, isRescue) {
          if (isRescue === void 0) {
            isRescue = false;
          }

          if (this._isVisible) return;
          this._isVisible = true;
          this._targetOpacity = 255; // 更新提示文本

          if (this.promptLabel && promptText) {
            this.promptLabel.string = promptText;
          }

          console.log("[InteractionUI] \u663E\u793A" + (isRescue ? '救援' : '交互') + "\u6309\u94AE");
        }
        /**
         * 隐藏按钮
         */


        hideButton() {
          if (!this._isVisible) return;
          this._isVisible = false;
          this._targetOpacity = 0; // 同时隐藏救援进度条

          if (this.rescueProgressBar) {
            this.rescueProgressBar.node.active = false;
            this.rescueProgressBar.progress = 0;
          }

          console.log('[InteractionUI] 隐藏交互按钮');
        }
        /**
         * 按钮点击事件
         */


        onButtonClick() {
          console.log("[InteractionUI] " + (this._isRescueMode ? '救援' : '交互') + "\u6309\u94AE\u88AB\u70B9\u51FB"); // 触发玩家交互或救援

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


        setVisible(visible) {
          if (visible) {
            this.showButton();
          } else {
            this.hideButton();
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "player", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "buttonNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "promptLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "rescueProgressBar", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "fadeDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.2;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a3262ea54dd511867d6c3e09053b4bd19648cdf0.js.map