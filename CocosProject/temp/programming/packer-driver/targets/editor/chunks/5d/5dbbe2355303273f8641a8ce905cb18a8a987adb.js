System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, CharacterState, _dec, _class, _class2, _descriptor, _crd, ccclass, property, Cage;

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
    }, function (_unresolved_2) {
      CharacterState = _unresolved_2.CharacterState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f2640CHARtIg7kdwWKaASLI", "Cage", undefined); // 文件名: Cage.ts
      // 功能：笼子组件（任务2.1）
      // 用于挂起逃生者的位置


      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Cage", Cage = (_dec = ccclass('Cage'), _dec(_class = (_class2 = class Cage extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "maxCapacity", _descriptor, this);

          // 最大容量（可以挂起几个逃生者）
          this._hangedSurvivors = [];
        }

        // 当前挂起的逃生者列表
        start() {
          console.log(`[Cage] 笼子 ${this.node.name} 初始化，最大容量：${this.maxCapacity}`);
        }
        /**
         * 挂起一个逃生者
         * @param survivorNode 逃生者节点
         * @returns 是否成功挂起
         */


        hangSurvivor(survivorNode) {
          // 检查容量
          if (this._hangedSurvivors.length >= this.maxCapacity) {
            console.warn(`[Cage] ${this.node.name} 已满，无法挂起更多逃生者`);
            return false;
          } // 检查是否已经挂在这个笼子上


          if (this._hangedSurvivors.includes(survivorNode)) {
            console.warn(`[Cage] ${survivorNode.name} 已经挂在 ${this.node.name} 上`);
            return false;
          } // 添加到列表


          this._hangedSurvivors.push(survivorNode);

          console.log(`[Cage] ${survivorNode.name} 被挂在 ${this.node.name} 上（${this._hangedSurvivors.length}/${this.maxCapacity}）`); // 监听状态变化，如果被救或淘汰，从列表移除

          const characterState = survivorNode.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (characterState) {
            characterState.onStateChange((oldState, newState) => {
              if (newState !== 'hanged') {
                this.removeSurvivor(survivorNode);
              }
            });
          }

          return true;
        }
        /**
         * 从笼子移除逃生者（救援成功或淘汰）
         */


        removeSurvivor(survivorNode) {
          const index = this._hangedSurvivors.indexOf(survivorNode);

          if (index === -1) return;

          this._hangedSurvivors.splice(index, 1);

          console.log(`[Cage] ${survivorNode.name} 离开 ${this.node.name}（${this._hangedSurvivors.length}/${this.maxCapacity}）`);
        }
        /**
         * 获取当前挂起的逃生者数量
         */


        getHangedCount() {
          return this._hangedSurvivors.length;
        }
        /**
         * 是否已满
         */


        isFull() {
          return this._hangedSurvivors.length >= this.maxCapacity;
        }
        /**
         * 获取所有挂起的逃生者
         */


        getHangedSurvivors() {
          return [...this._hangedSurvivors]; // 返回副本
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "maxCapacity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5dbbe2355303273f8641a8ce905cb18a8a987adb.js.map