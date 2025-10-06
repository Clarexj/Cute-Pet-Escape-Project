System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, Quat, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, RemotePlayerController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfPlayerData(extras) {
    _reporterNs.report("PlayerData", "./NetworkManager", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f65bbCZPDtACrRYQf5p+cqq", "RemotePlayerController", undefined); // 文件名: RemotePlayerController.ts
      // 功能: 远程玩家控制器 - 接收并应用远程玩家数据（任务4.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Quat', 'tween']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("RemotePlayerController", RemotePlayerController = (_dec = ccclass('RemotePlayerController'), _dec(_class = (_class2 = class RemotePlayerController extends Component {
        constructor(...args) {
          super(...args);

          // ============ 配置 ============
          _initializerDefineProperty(this, "interpolationSpeed", _descriptor, this);

          // 插值速度（越大越快，建议5-20）
          _initializerDefineProperty(this, "snapThreshold", _descriptor2, this);

          // 距离阈值（米），超过此距离直接传送
          _initializerDefineProperty(this, "enableSmoothing", _descriptor3, this);

          // 是否启用平滑插值
          _initializerDefineProperty(this, "showDebugInfo", _descriptor4, this);

          // 是否显示调试信息
          // 玩家信息
          this._sessionId = "";
          this._playerName = "";
          // 目标状态（从服务器接收）
          this._targetPosition = new Vec3();
          this._targetRotationY = 0;
          this._targetAnimationState = "idle";
          this._targetIsMoving = false;
          // 当前状态（实际显示）
          this._currentPosition = new Vec3();
          this._currentRotationY = 0;
          // 临时变量（性能优化）
          this._tempVec3 = new Vec3();
          this._tempQuat = new Quat();
          // 动画控制器引用（如果有）
          this._animationController = null;
        }

        start() {
          // 获取初始位置
          this.node.getPosition(this._currentPosition);
          this._currentRotationY = this.node.eulerAngles.y;

          this._targetPosition.set(this._currentPosition);

          this._targetRotationY = this._currentRotationY; // 尝试获取动画控制器

          this._animationController = this.node.getComponentInChildren('CharacterAnimationController');

          if (this._animationController) {
            console.log(`[RemotePlayerController] 找到动画控制器`);
          }
        }

        update(deltaTime) {
          if (!this.enableSmoothing) return; // 插值移动到目标位置

          this.interpolatePosition(deltaTime); // 插值旋转到目标角度

          this.interpolateRotation(deltaTime);
        }
        /**
         * 位置插值
         */


        interpolatePosition(deltaTime) {
          this.node.getPosition(this._currentPosition); // 计算距离

          const distance = Vec3.distance(this._currentPosition, this._targetPosition); // 如果距离过大，直接传送（防止延迟导致的巨大偏移）

          if (distance > this.snapThreshold) {
            this.node.setPosition(this._targetPosition);

            this._currentPosition.set(this._targetPosition);

            if (this.showDebugInfo) {
              console.log(`[RemotePlayerController] 传送到目标位置（距离${distance.toFixed(2)}米）`);
            }

            return;
          } // 平滑插值


          if (distance > 0.01) {
            Vec3.lerp(this._tempVec3, this._currentPosition, this._targetPosition, this.interpolationSpeed * deltaTime);
            this.node.setPosition(this._tempVec3);
          }
        }
        /**
         * 旋转插值
         */


        interpolateRotation(deltaTime) {
          const currentRotationY = this.node.eulerAngles.y;
          const angleDiff = this.getShortestAngleDifference(currentRotationY, this._targetRotationY); // 如果角度差距很小，直接设置

          if (Math.abs(angleDiff) < 1.0) {
            return;
          } // 平滑插值


          const newRotationY = currentRotationY + angleDiff * this.interpolationSpeed * deltaTime;
          this.node.setRotationFromEuler(0, newRotationY, 0);
          this._currentRotationY = newRotationY;
        }
        /**
         * 获取最短角度差（-180到180度）
         */


        getShortestAngleDifference(from, to) {
          let diff = to - from;

          while (diff > 180) diff -= 360;

          while (diff < -180) diff += 360;

          return diff;
        } // ============ 公共接口 ============

        /**
         * 初始化远程玩家
         */


        initialize(sessionId, playerData) {
          this._sessionId = sessionId;
          this._playerName = playerData.name;
          console.log(`[RemotePlayerController] 初始化远程玩家: ${this._playerName} (${sessionId})`); // 设置初始位置

          this.updatePlayerState(playerData, true);
        }
        /**
         * 更新玩家状态
         */


        updatePlayerState(playerData, immediate = false) {
          // 更新目标状态
          this._targetPosition.set(playerData.x, playerData.y, playerData.z);

          this._targetRotationY = playerData.rotationY;
          this._targetAnimationState = playerData.animationState;
          this._targetIsMoving = playerData.isMoving; // 如果需要立即应用（初始化或传送）

          if (immediate || !this.enableSmoothing) {
            this.node.setPosition(this._targetPosition);
            this.node.setRotationFromEuler(0, this._targetRotationY, 0);

            this._currentPosition.set(this._targetPosition);

            this._currentRotationY = this._targetRotationY;
          } // 更新动画状态


          this.updateAnimation();

          if (this.showDebugInfo) {
            console.log(`[RemotePlayerController] 更新状态: ${this._playerName}, pos(${playerData.x.toFixed(2)}, ${playerData.z.toFixed(2)}), moving(${playerData.isMoving})`);
          }
        }
        /**
         * 更新动画状态
         */


        updateAnimation() {
          if (!this._animationController) return; // 根据移动状态播放动画

          if (this._targetIsMoving) {
            if (typeof this._animationController.playRun === 'function') {
              this._animationController.playRun();
            }
          } else {
            if (typeof this._animationController.playIdle === 'function') {
              this._animationController.playIdle();
            }
          }
        }
        /**
         * 获取会话ID
         */


        getSessionId() {
          return this._sessionId;
        }
        /**
         * 获取玩家名称
         */


        getPlayerName() {
          return this._playerName;
        }
        /**
         * 设置插值速度
         */


        setInterpolationSpeed(speed) {
          this.interpolationSpeed = Math.max(1.0, speed);
        }
        /**
         * 启用/禁用平滑插值
         */


        setSmoothing(enabled) {
          this.enableSmoothing = enabled;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "interpolationSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 10.0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "snapThreshold", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5.0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "enableSmoothing", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "showDebugInfo", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9e6116588c00dc563ea90e4ba69ccfcd8eb15b29.js.map