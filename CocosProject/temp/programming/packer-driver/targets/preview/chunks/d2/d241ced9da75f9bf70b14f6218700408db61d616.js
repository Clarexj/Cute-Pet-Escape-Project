System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Sprite, Label, Color, CharacterStateType, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, TeamStatusUI;

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
      Sprite = _cc.Sprite;
      Label = _cc.Label;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      CharacterStateType = _unresolved_2.CharacterStateType;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "75663qbgV1NDovJ+QhEZ7KL", "TeamStatusUI", undefined); // 文件名: TeamStatusUI.ts
      // 功能：团队成员状态UI组件（任务3.2）
      // 单个团队成员状态方块的显示逻辑


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Sprite', 'Label', 'Color']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("TeamStatusUI", TeamStatusUI = (_dec = ccclass('TeamStatusUI'), _dec2 = property(Sprite), _dec3 = property(Label), _dec4 = property(Label), _dec(_class = (_class2 = class TeamStatusUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "statusSprite", _descriptor, this);

          // 状态方块
          _initializerDefineProperty(this, "memberIndexLabel", _descriptor2, this);

          // 成员编号（可选，显示1、2、3、4）
          _initializerDefineProperty(this, "stateTextLabel", _descriptor3, this);

          // 状态文字（可选，显示"正常"、"被抓"等）
          // 状态颜色配置
          _initializerDefineProperty(this, "normalColor", _descriptor4, this);

          // 正常：绿色
          _initializerDefineProperty(this, "caughtColor", _descriptor5, this);

          // 被抓：橙色
          _initializerDefineProperty(this, "hangedColor", _descriptor6, this);

          // 被挂起：红色
          _initializerDefineProperty(this, "eliminatedColor", _descriptor7, this);

          // 淘汰：灰色
          _initializerDefineProperty(this, "showStateText", _descriptor8, this);

          // 是否显示状态文字
          // 私有成员
          this._characterState = null;
          this._memberIndex = -1;
        }

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


        bindCharacter(characterState, index) {
          this._characterState = characterState;
          this._memberIndex = index; // 设置成员编号

          if (this.memberIndexLabel) {
            this.memberIndexLabel.string = "" + (index + 1); // 显示1-4
          } // 注册状态变化回调


          characterState.onStateChange((oldState, newState) => {
            this.onStateChange(oldState, newState);
          }); // 初始化显示

          this.updateDisplay();
          console.log("[TeamStatusUI] \u7ED1\u5B9A\u6210\u5458 " + index + ": " + characterState.node.name);
        }
        /**
         * 状态变化回调
         */


        onStateChange(oldState, newState) {
          console.log("[TeamStatusUI] \u6210\u5458 " + this._memberIndex + " \u72B6\u6001\u53D8\u5316: " + oldState + " -> " + newState);
          this.updateDisplay();
        }
        /**
         * 更新显示
         */


        updateDisplay() {
          if (!this._characterState || !this.statusSprite) return;

          var state = this._characterState.getCurrentState(); // 更新颜色


          this.updateColor(state); // 更新状态文字（如果启用）

          if (this.showStateText && this.stateTextLabel) {
            this.updateStateText(state);
          }
        }
        /**
         * 更新颜色
         */


        updateColor(state) {
          if (!this.statusSprite) return;
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

          this.statusSprite.color = color;
        }
        /**
         * 更新状态文字
         */


        updateStateText(state) {
          if (!this.stateTextLabel) return;
          var stateText;

          switch (state) {
            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).NORMAL:
              stateText = '正常';
              break;

            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).CAUGHT:
              stateText = '被抓';
              break;

            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).HANGED:
              stateText = '挂起';
              break;

            case (_crd && CharacterStateType === void 0 ? (_reportPossibleCrUseOfCharacterStateType({
              error: Error()
            }), CharacterStateType) : CharacterStateType).ELIMINATED:
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


        getCurrentState() {
          return this._characterState ? this._characterState.getCurrentState() : null;
        }
        /**
         * 获取成员索引
         */


        getMemberIndex() {
          return this._memberIndex;
        }
        /**
         * 获取绑定的角色节点
         */


        getCharacterNode() {
          return this._characterState ? this._characterState.node : null;
        }
        /**
         * 手动刷新显示（供外部调用）
         */


        refresh() {
          this.updateDisplay();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "statusSprite", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "memberIndexLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "stateTextLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "normalColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(0, 255, 0, 255);
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "caughtColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 165, 0, 255);
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "hangedColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 0, 0, 255);
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "eliminatedColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(128, 128, 128, 255);
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "showStateText", [property], {
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
//# sourceMappingURL=d241ced9da75f9bf70b14f6218700408db61d616.js.map