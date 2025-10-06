System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, tween, Vec3, Quat, Interactable, PlayerController, _dec, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, BoardState, Board;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfInteractable(extras) {
    _reporterNs.report("Interactable", "./Interactable", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerController(extras) {
    _reporterNs.report("PlayerController", "./PlayerController", _context.meta, extras);
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
      Quat = _cc.Quat;
    }, function (_unresolved_2) {
      Interactable = _unresolved_2.Interactable;
    }, function (_unresolved_3) {
      PlayerController = _unresolved_3.PlayerController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0b62d+szLtPVLQ44jOOZqPT", "Board", undefined); // 文件名: Board.ts
      // 功能：木板交互（推倒木板，旋转90度倒下）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'tween', 'Vec3', 'Quat']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 木板状态
       */

      BoardState = /*#__PURE__*/function (BoardState) {
        BoardState["STANDING"] = "standing";
        BoardState["FALLING"] = "falling";
        BoardState["DOWN"] = "down";
        BoardState["BROKEN"] = "broken";
        return BoardState;
      }(BoardState || {});

      _export("Board", Board = (_dec = ccclass('Board'), _dec(_class = (_class2 = class Board extends (_crd && Interactable === void 0 ? (_reportPossibleCrUseOfInteractable({
        error: Error()
      }), Interactable) : Interactable) {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "fallDuration", _descriptor, this);

          // 倒下动画时长（秒）
          _initializerDefineProperty(this, "fallDirection", _descriptor2, this);

          // 倒下方向（世界空间）
          this._state = BoardState.STANDING;
          this._initialRotation = new Quat();
        }

        start() {
          // 记录初始旋转
          this.node.getRotation(this._initialRotation); // 设置交互提示

          this.interactPrompt = "推倒木板";
          this.canInteractMultipleTimes = false; // 只能推倒一次
        }
        /**
         * 检查是否可以交互
         */


        canInteract() {
          // 只有直立状态才能交互
          return this._state === BoardState.STANDING && super.canInteract();
        }
        /**
         * 执行交互：推倒木板
         */


        onInteract(player) {
          if (this._state !== BoardState.STANDING) {
            return;
          }

          console.log('[Board] 木板被推倒！'); // 锁定玩家移动

          const playerController = player.getComponent(_crd && PlayerController === void 0 ? (_reportPossibleCrUseOfPlayerController({
            error: Error()
          }), PlayerController) : PlayerController);

          if (playerController) {
            playerController.setMovementLocked(true);
          }

          this.fallDown(playerController);
        }
        /**
         * 木板倒下动画
         */


        fallDown(playerController) {
          this._state = BoardState.FALLING; // 规范化倒下方向

          const fallDir = this.fallDirection.clone().normalize(); // 计算倒下的目标旋转（绕X轴或Z轴旋转90度）
          // 这里简化处理：假设木板绕X轴旋转

          const targetRotation = new Quat(); // 根据倒下方向计算旋转轴
          // 如果倒向+Z方向，绕X轴正向旋转90度
          // 如果倒向-Z方向，绕X轴负向旋转90度
          // 如果倒向+X方向，绕Z轴负向旋转90度
          // 如果倒向-X方向，绕Z轴正向旋转90度

          let rotationAxis = new Vec3();

          if (Math.abs(fallDir.z) > Math.abs(fallDir.x)) {
            // 主要沿Z轴倒下，绕X轴旋转
            rotationAxis.set(1, 0, 0);
            const angle = fallDir.z > 0 ? 90 : -90;
            Quat.fromAxisAngle(targetRotation, rotationAxis, angle * Math.PI / 180);
          } else {
            // 主要沿X轴倒下，绕Z轴旋转
            rotationAxis.set(0, 0, 1);
            const angle = fallDir.x > 0 ? -90 : 90;
            Quat.fromAxisAngle(targetRotation, rotationAxis, angle * Math.PI / 180);
          } // 组合初始旋转和倒下旋转


          Quat.multiply(targetRotation, this._initialRotation, targetRotation); // 使用tween动画实现平滑旋转

          const startRotation = this.node.rotation.clone();
          tween(this.node).to(this.fallDuration, {
            rotation: targetRotation
          }, {
            easing: 'cubicOut',
            // 使用缓出效果，更自然
            onUpdate: () => {// 可以在这里添加音效或粒子效果
            }
          }).call(() => {
            // 倒下完成
            this._state = BoardState.DOWN;
            console.log('[Board] 木板倒下完成'); // 解锁玩家移动

            if (playerController) {
              playerController.setMovementLocked(false);
            }

            this.onFallComplete();
          }).start();
        }
        /**
         * 倒下完成回调
         */


        onFallComplete() {// 可以在这里添加额外逻辑
          // 例如：检查是否砸到追捕者，成为路障等
        }
        /**
         * 获取当前状态
         */


        getState() {
          return this._state;
        }
        /**
         * 重置木板（用于测试）
         */


        reset() {
          this._state = BoardState.STANDING;
          this.node.setRotation(this._initialRotation);
          this.resetInteraction();
        }
        /**
         * 追捕者踩碎木板（预留接口）
         */


        breakBoard() {
          if (this._state === BoardState.DOWN) {
            this._state = BoardState.BROKEN; // 可以添加破碎动画和销毁节点

            console.log('[Board] 木板被踩碎'); // this.node.destroy(); // 暂不销毁，方便测试
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "fallDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fallDirection", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Vec3(0, 0, 1);
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=27f4a33f0f44ce272c5ae9bebc871818924a158c.js.map