System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Quat, Joystick, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, PlayerController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfJoystick(extras) {
    _reporterNs.report("Joystick", "./Joystick", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
    }, function (_unresolved_2) {
      Joystick = _unresolved_2.Joystick;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b5d64d1mL9NVYteQA9mM2N3", "PlayerController", undefined); // 文件名: PlayerController.ts
      // 功能：逃生者角色移动控制（基于Transform，相对摄像机方向）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Quat']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("PlayerController", PlayerController = (_dec = ccclass('PlayerController'), _dec2 = property(_crd && Joystick === void 0 ? (_reportPossibleCrUseOfJoystick({
        error: Error()
      }), Joystick) : Joystick), _dec3 = property(Node), _dec(_class = (_class2 = class PlayerController extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "joystick", _descriptor, this);

          // 虚拟摇杆引用
          _initializerDefineProperty(this, "cameraNode", _descriptor2, this);

          // 摄像机节点引用
          _initializerDefineProperty(this, "moveSpeed", _descriptor3, this);

          // 移动速度（单位/秒），逃生者基础速度100%
          _initializerDefineProperty(this, "rotationSpeed", _descriptor4, this);

          // 转身速度
          this._moveDirection = new Vec3();
          // 世界空间移动方向
          this._targetRotation = new Quat();
        }

        // 目标旋转
        update(deltaTime) {
          if (!this.joystick || !this.cameraNode) return; // 获取摇杆输入

          var joyDir = this.joystick.getDirection();
          var joyStrength = this.joystick.getStrength();

          if (joyStrength > 0.01) {
            // 计算相对于摄像机的移动方向
            this.calculateMoveDirection(joyDir); // 移动角色

            var movement = this._moveDirection.clone().multiplyScalar(this.moveSpeed * joyStrength * deltaTime);

            var currentPos = this.node.position.clone();
            currentPos.add(movement);
            this.node.setPosition(currentPos); // 旋转角色面向移动方向

            this.rotateTowardsMovement(deltaTime);
          }
        }
        /**
         * 计算相对于摄像机的移动方向
         * @param joyDir 摇杆输入方向（2D）
         */


        calculateMoveDirection(joyDir) {
          // 获取摄像机的前方和右方向（世界空间）
          var cameraForward = new Vec3();
          var cameraRight = new Vec3(); // 摄像机的前方向

          this.cameraNode.getWorldRotation(new Quat()).getAxisZ(cameraForward);
          cameraForward.negative(); // Cocos中Z轴负方向是前方
          // 摄像机的右方向

          this.cameraNode.getWorldRotation(new Quat()).getAxisX(cameraRight); // 将前方和右方向投影到水平面（Y=0）

          cameraForward.y = 0;
          cameraForward.normalize();
          cameraRight.y = 0;
          cameraRight.normalize(); // 组合摇杆输入和摄像机方向
          // 摇杆Y对应前后，摇杆X对应左右

          this._moveDirection.set(0, 0, 0);

          this._moveDirection.add(cameraForward.multiplyScalar(joyDir.y)); // 前后


          this._moveDirection.add(cameraRight.multiplyScalar(joyDir.x)); // 左右


          this._moveDirection.normalize();
        }
        /**
         * 平滑旋转角色面向移动方向
         */


        rotateTowardsMovement(deltaTime) {
          if (this._moveDirection.lengthSqr() < 0.01) return; // 计算目标旋转（朝向移动方向）

          var targetEuler = new Vec3();
          targetEuler.y = Math.atan2(this._moveDirection.x, this._moveDirection.z) * (180 / Math.PI);
          Quat.fromEuler(this._targetRotation, 0, targetEuler.y, 0); // 平滑插值到目标旋转

          var currentRotation = this.node.rotation.clone();
          Quat.slerp(currentRotation, currentRotation, this._targetRotation, this.rotationSpeed * deltaTime);
          this.node.setRotation(currentRotation);
        }
        /**
         * 设置移动速度（用于后续追捕者115%速度）
         */


        setMoveSpeed(speed) {
          this.moveSpeed = speed;
        }
        /**
         * 获取当前移动方向（用于动画系统）
         */


        getMoveDirection() {
          return this._moveDirection.clone();
        }
        /**
         * 是否正在移动
         */


        isMoving() {
          return this.joystick.isActive() && this.joystick.getStrength() > 0.01;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "joystick", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "cameraNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5.0;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "rotationSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=54ef71038c0524b408945e0b96e32b4f05d45ded.js.map