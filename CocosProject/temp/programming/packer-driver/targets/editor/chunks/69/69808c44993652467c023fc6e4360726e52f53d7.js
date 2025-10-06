System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, tween, Vec3, Interactable, GameManager, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, Ore;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfInteractable(extras) {
    _reporterNs.report("Interactable", "./Interactable", _context.meta, extras);
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
      tween = _cc.tween;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      Interactable = _unresolved_2.Interactable;
    }, function (_unresolved_3) {
      GameManager = _unresolved_3.GameManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ce21eZ2LIlCoYG1k6/OqUJ9", "Ore", undefined); // 文件名: Ore.ts
      // 功能：矿石交互（拾取后消失）
      // 版本：V1.1 - 新增GameManager统计通知（任务2.2）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'tween', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Ore", Ore = (_dec = ccclass('Ore'), _dec(_class = (_class2 = class Ore extends (_crd && Interactable === void 0 ? (_reportPossibleCrUseOfInteractable({
        error: Error()
      }), Interactable) : Interactable) {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "collectDuration", _descriptor, this);

          // 拾取动画时长（秒）
          _initializerDefineProperty(this, "collectScaleUp", _descriptor2, this);

          // 拾取时放大倍数
          _initializerDefineProperty(this, "floatUpDistance", _descriptor3, this);

          // 向上漂浮距离
          this._isCollecting = false;
        }

        // 是否正在拾取中
        start() {
          // 设置交互提示
          this.interactPrompt = "拾取矿石";
          this.canInteractMultipleTimes = false; // 只能拾取一次
        }
        /**
         * 检查是否可以交互
         */


        canInteract() {
          // 如果正在拾取中，不能再次交互
          return !this._isCollecting && super.canInteract();
        }
        /**
         * 执行交互：拾取矿石
         */


        onInteract(player) {
          if (this._isCollecting) {
            return;
          }

          console.log('[Ore] 矿石被拾取！');
          this.collect();
        }
        /**
         * 拾取动画
         */


        collect() {
          this._isCollecting = true; // 通知GameManager

          const gameManager = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();

          if (gameManager) {
            gameManager.onOreCollected(this.node);
          } // 保存初始位置和缩放


          const initialPosition = this.node.position.clone();
          const initialScale = this.node.scale.clone(); // 目标位置（向上漂浮）

          const targetPosition = new Vec3(initialPosition.x, initialPosition.y + this.floatUpDistance, initialPosition.z); // 目标缩放（放大后缩小到0）

          const enlargeScale = new Vec3(initialScale.x * this.collectScaleUp, initialScale.y * this.collectScaleUp, initialScale.z * this.collectScaleUp); // 使用tween实现拾取动画

          tween(this.node) // 第一阶段：放大 + 向上漂浮（前60%时间）
          .to(this.collectDuration * 0.6, {
            position: targetPosition,
            scale: enlargeScale
          }, {
            easing: 'quadOut'
          }) // 第二阶段：缩小到0（后40%时间）
          .to(this.collectDuration * 0.4, {
            scale: Vec3.ZERO
          }, {
            easing: 'quadIn'
          }) // 动画完成后销毁节点
          .call(() => {
            console.log('[Ore] 矿石拾取完成，节点销毁');
            this.node.destroy();
          }).start();
        }
        /**
         * 获取是否正在拾取中
         */


        isCollecting() {
          return this._isCollecting;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "collectDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.3;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "collectScaleUp", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "floatUpDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=69808c44993652467c023fc6e4360726e52f53d7.js.map