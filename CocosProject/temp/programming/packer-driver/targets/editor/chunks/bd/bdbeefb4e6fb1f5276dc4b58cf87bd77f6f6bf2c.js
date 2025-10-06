System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Sprite, CharacterState, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, HangTimerUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

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
      Label = _cc.Label;
      Sprite = _cc.Sprite;
    }, function (_unresolved_2) {
      CharacterState = _unresolved_2.CharacterState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "eec41AcwXtLJZPw5ZNlf2i9", "HangTimerUI", undefined); // 文件名: HangTimerUI.ts
      // 功能：被挂队友头顶倒计时UI显示（Checklist修复）
      // 显示30秒挂起倒计时和生命值


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Sprite']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("HangTimerUI", HangTimerUI = (_dec = ccclass('HangTimerUI'), _dec2 = property(Label), _dec3 = property(Sprite), _dec4 = property(Label), _dec5 = property(Node), _dec(_class = (_class2 = class HangTimerUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "timerLabel", _descriptor, this);

          // 倒计时文字（如"23s"）
          _initializerDefineProperty(this, "timerBar", _descriptor2, this);

          // 倒计时进度条（可选）
          _initializerDefineProperty(this, "livesLabel", _descriptor3, this);

          // 生命值文字（如"1/2"）
          _initializerDefineProperty(this, "targetCharacter", _descriptor4, this);

          // 目标角色节点
          _initializerDefineProperty(this, "showOnlyWhenHanged", _descriptor5, this);

          // 仅在被挂起时显示
          _initializerDefineProperty(this, "followOffset", _descriptor6, this);

          // 跟随偏移高度（头顶上方）
          this._characterState = null;
        }

        start() {
          if (!this.targetCharacter) {
            console.error('[HangTimerUI] targetCharacter未绑定！');
            return;
          } // 获取角色状态组件


          this._characterState = this.targetCharacter.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (!this._characterState) {
            console.error('[HangTimerUI] 目标角色没有CharacterState组件！');
            return;
          } // 初始隐藏


          if (this.showOnlyWhenHanged) {
            this.node.active = false;
          }

          console.log('[HangTimerUI] 挂起倒计时UI初始化完成');
        }

        update(deltaTime) {
          if (!this._characterState) return; // 检查是否被挂起

          const isHanged = this._characterState.isHanged(); // 控制显示/隐藏


          if (this.showOnlyWhenHanged) {
            if (isHanged && !this.node.active) {
              this.node.active = true;
            } else if (!isHanged && this.node.active) {
              this.node.active = false;
            }
          } // 仅在被挂起时更新


          if (isHanged) {
            this.updateTimerDisplay();
            this.updateLivesDisplay();
            this.updatePosition();
          }
        }
        /**
         * 更新倒计时显示
         */


        updateTimerDisplay() {
          if (!this._characterState || !this.timerLabel) return;

          const timeRemaining = this._characterState.getHangTimeRemaining();

          const seconds = Math.ceil(timeRemaining); // 更新文字

          this.timerLabel.string = `${seconds}s`; // 更新进度条（可选）

          if (this.timerBar) {
            const progress = timeRemaining / this._characterState.hangDuration; // 通过fillRange控制进度条
            // 注意：需要Sprite设置为FILLED类型
            // this.timerBar.fillRange = progress;
          } // 时间紧急时变红色


          if (timeRemaining <= 10) {
            this.timerLabel.color = new this.timerLabel.color.constructor(255, 0, 0, 255);
          } else {
            this.timerLabel.color = new this.timerLabel.color.constructor(255, 255, 255, 255);
          }
        }
        /**
         * 更新生命值显示
         */


        updateLivesDisplay() {
          if (!this._characterState || !this.livesLabel) return;

          const currentLives = this._characterState.getRemainingLives();

          const maxLives = this._characterState.maxHangCount;
          this.livesLabel.string = `生命: ${currentLives}/${maxLives}`; // 生命值为0时变红色

          if (currentLives <= 0) {
            this.livesLabel.color = new this.livesLabel.color.constructor(255, 0, 0, 255);
          }
        }
        /**
         * 更新位置（跟随角色头顶）
         */


        updatePosition() {
          if (!this.targetCharacter) return; // 获取角色世界位置

          const charWorldPos = this.targetCharacter.getWorldPosition(); // 设置UI位置在角色上方

          this.node.setWorldPosition(charWorldPos.x, charWorldPos.y + this.followOffset, charWorldPos.z); // 让UI始终面向摄像机（Billboard效果）
          // 注意：需要摄像机引用才能实现，这里简化处理
          // 如果需要Billboard效果，可以在update中设置rotation
        }
        /**
         * 手动设置目标角色（动态绑定）
         */


        setTargetCharacter(character) {
          this.targetCharacter = character;
          this._characterState = character.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (!this._characterState) {
            console.error('[HangTimerUI] 设置的角色没有CharacterState组件！');
          }
        }
        /**
         * 强制显示/隐藏
         */


        setVisible(visible) {
          this.node.active = visible;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "timerLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "timerBar", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "livesLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "targetCharacter", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "showOnlyWhenHanged", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "followOffset", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2.5;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=bdbeefb4e6fb1f5276dc4b58cf87bd77f6f6bf2c.js.map