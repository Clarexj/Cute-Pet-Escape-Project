System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, Interactable;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ce36cPedfZEtboCBe6viQ6O", "Interactable", undefined); // 文件名: Interactable.ts
      // 功能：可交互物体基类（任务1.3）


      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Interactable", Interactable = (_dec = ccclass('Interactable'), _dec(_class = (_class2 = class Interactable extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "interactRange", _descriptor, this);

          // 交互范围（米）
          _initializerDefineProperty(this, "interactPrompt", _descriptor2, this);

          // 交互提示文本
          _initializerDefineProperty(this, "canInteractMultipleTimes", _descriptor3, this);

          // 是否可以多次交互
          this._hasInteracted = false;
        }

        // 是否已经交互过

        /**
         * 检查是否可以交互
         * @returns 是否可以交互
         */
        canInteract() {
          if (!this.canInteractMultipleTimes && this._hasInteracted) {
            return false;
          }

          return true;
        }
        /**
         * 执行交互（子类需要重写此方法）
         * @param player 触发交互的玩家节点
         */


        interact(player) {
          if (!this.canInteract()) {
            return;
          }

          this._hasInteracted = true;
          this.onInteract(player);
        }
        /**
         * 子类重写此方法实现具体交互逻辑
         * @param player 触发交互的玩家节点
         */


        onInteract(player) {
          console.log("[Interactable] " + this.node.name + " \u88AB\u4EA4\u4E92\u4E86\uFF01");
        }
        /**
         * 获取交互提示文本
         */


        getInteractPrompt() {
          return this.interactPrompt;
        }
        /**
         * 获取交互范围
         */


        getInteractRange() {
          return this.interactRange;
        }
        /**
         * 重置交互状态（用于可以多次交互的物体）
         */


        resetInteraction() {
          this._hasInteracted = false;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "interactRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "interactPrompt", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return "交互";
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "canInteractMultipleTimes", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7de2a75db939658764c38e8594d90418669ba3b4.js.map