System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, BoxCollider, CharacterState, GameManager, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, ExitZone;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCharacterState(extras) {
    _reporterNs.report("CharacterState", "./CharacterState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./GameManager", _context.meta, extras);
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
      BoxCollider = _cc.BoxCollider;
    }, function (_unresolved_2) {
      CharacterState = _unresolved_2.CharacterState;
    }, function (_unresolved_3) {
      GameManager = _unresolved_3.GameManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "12ba9jzxkVFaIJgn/iSu6ce", "ExitZone", undefined); // 文件名: ExitZone.ts
      // 功能：逃脱区域（任务2.2）
      // 逃生者进入此区域即可逃脱，计入逃脱人数


      __checkObsolete__(['_decorator', 'Component', 'Node', 'BoxCollider', 'ITriggerEvent']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("ExitZone", ExitZone = (_dec = ccclass('ExitZone'), _dec(_class = (_class2 = class ExitZone extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "exitPrompt", _descriptor, this);

          // 区域提示文字
          _initializerDefineProperty(this, "requireOreCount", _descriptor2, this);

          // 逃脱所需矿石数量（0=不需要）
          _initializerDefineProperty(this, "destroySurvivorOnExit", _descriptor3, this);

          // 逃脱后是否销毁逃生者节点
          this._escapedSurvivors = new Set();
        }

        // 已逃脱的逃生者（防止重复计数）
        start() {
          // 设置触发器监听
          var collider = this.node.getComponent(BoxCollider);

          if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.isTrigger = true; // 确保是触发器模式

            console.log('[ExitZone] 逃脱区域初始化完成');
          } else {
            console.error('[ExitZone] 未找到BoxCollider组件！请添加BoxCollider并设置为Trigger');
          }
        }
        /**
         * 触发器进入
         */


        onTriggerEnter(event) {
          var survivorNode = event.otherCollider.node; // 检查是否是逃生者

          var characterState = survivorNode.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (!characterState) {
            return; // 不是角色，忽略
          } // 只有正常状态的逃生者才能逃脱


          if (!characterState.isNormal()) {
            console.log("[ExitZone] " + survivorNode.name + " \u4E0D\u662F\u6B63\u5E38\u72B6\u6001\uFF0C\u65E0\u6CD5\u9003\u8131");
            return;
          } // 检查是否已经逃脱过（防止重复计数）


          if (this._escapedSurvivors.has(survivorNode)) {
            return;
          } // 检查矿石数量（可选）


          if (this.requireOreCount > 0) {
            var gameManager = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
              error: Error()
            }), GameManager) : GameManager).getInstance();

            if (gameManager) {
              var stats = gameManager.getStats();

              if (stats.oreCollected < this.requireOreCount) {
                console.log("[ExitZone] " + survivorNode.name + " \u77FF\u77F3\u6570\u91CF\u4E0D\u8DB3 (" + stats.oreCollected + "/" + this.requireOreCount + ")");
                return;
              }
            }
          } // 逃脱成功


          this.onSurvivorEscape(survivorNode, characterState);
        }
        /**
         * 逃生者逃脱
         */


        onSurvivorEscape(survivorNode, characterState) {
          console.log("[ExitZone] " + survivorNode.name + " \u6210\u529F\u9003\u8131\uFF01"); // 标记为已逃脱

          this._escapedSurvivors.add(survivorNode); // 通知GameManager


          var gameManager = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();

          if (gameManager) {
            gameManager.onSurvivorEscaped(survivorNode);
          } // 处理逃生者节点


          if (this.destroySurvivorOnExit) {
            // 销毁节点（模拟离开场景）
            survivorNode.destroy();
          } else {
            // 隐藏节点（保留用于调试）
            survivorNode.active = false;
          }
        }
        /**
         * 获取已逃脱人数
         */


        getEscapedCount() {
          return this._escapedSurvivors.size;
        }
        /**
         * 重置逃脱记录（用于重新开始游戏）
         */


        reset() {
          this._escapedSurvivors.clear();

          console.log('[ExitZone] 逃脱记录已重置');
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "exitPrompt", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return "逃脱区域";
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "requireOreCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "destroySurvivorOnExit", [property], {
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
//# sourceMappingURL=f8d3fe3b1be13af7aef7106d093231f19b1448cd.js.map