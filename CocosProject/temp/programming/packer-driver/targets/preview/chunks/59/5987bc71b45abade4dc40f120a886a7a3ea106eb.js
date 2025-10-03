System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Quat, _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, CameraFollow;

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
      Node = _cc.Node;
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a0a58rb91lC6oMQa0RNXMpU", "CameraFollow", undefined); // 文件名: CameraFollow.ts
      // 功能：第三人称摄像机跟随系统（为任务1.2的镜头旋转预留接口）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Quat']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("CameraFollow", CameraFollow = (_dec = ccclass('CameraFollow'), _dec2 = property(Node), _dec(_class = (_class2 = class CameraFollow extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "target", _descriptor, this);

          // 跟随目标（玩家角色）
          _initializerDefineProperty(this, "followDistance", _descriptor2, this);

          // 摄像机距离角色的距离
          _initializerDefineProperty(this, "followHeight", _descriptor3, this);

          // 摄像机高度偏移
          _initializerDefineProperty(this, "lookAtHeight", _descriptor4, this);

          // 摄像机看向目标的高度偏移
          _initializerDefineProperty(this, "smoothSpeed", _descriptor5, this);

          // 跟随平滑速度
          _initializerDefineProperty(this, "pitchAngle", _descriptor6, this);

          // 俯仰角度（向下看的角度）
          this._currentOffset = new Vec3();
          // 当前偏移量
          this._targetOffset = new Vec3();
          // 目标偏移量
          this._lookAtPoint = new Vec3();
        }

        // 看向点
        start() {
          // 初始化摄像机偏移
          this.calculateTargetOffset();

          this._currentOffset.set(this._targetOffset);

          this.updateCameraPosition(0);
        }

        lateUpdate(deltaTime) {
          if (!this.target) return; // 计算目标偏移

          this.calculateTargetOffset(); // 平滑插值到目标偏移

          Vec3.lerp(this._currentOffset, this._currentOffset, this._targetOffset, this.smoothSpeed * deltaTime); // 更新摄像机位置和朝向

          this.updateCameraPosition(deltaTime);
        }
        /**
         * 计算摄像机相对角色的目标偏移
         * （为任务1.2预留：这里可以加入水平旋转角度参数）
         */


        calculateTargetOffset() {
          // 当前是固定的后上方视角
          // 任务1.2时，可以根据玩家拖动修改这个偏移方向
          // 俯仰角转弧度
          var pitchRad = this.pitchAngle * (Math.PI / 180); // 计算水平距离和垂直距离

          var horizontalDist = this.followDistance * Math.cos(pitchRad);
          var verticalDist = this.followDistance * Math.sin(pitchRad) + this.followHeight; // 默认在角色正后方（可以后续改为可旋转）

          this._targetOffset.set(0, verticalDist, -horizontalDist);
        }
        /**
         * 更新摄像机位置和朝向
         */


        updateCameraPosition(deltaTime) {
          // 摄像机位置 = 角色位置 + 偏移
          var targetPos = this.target.getWorldPosition();
          var cameraPos = targetPos.clone().add(this._currentOffset);
          this.node.setWorldPosition(cameraPos); // 摄像机看向角色（加上高度偏移）

          this._lookAtPoint.set(targetPos.x, targetPos.y + this.lookAtHeight, targetPos.z); // 计算朝向


          var forward = this._lookAtPoint.clone().subtract(cameraPos).normalize();

          var rotation = new Quat();
          Quat.fromViewUp(rotation, forward);
          this.node.setWorldRotation(rotation);
        }
        /**
         * 设置俯仰角（任务1.2可能会用到）
         */


        setPitchAngle(angle) {
          this.pitchAngle = Math.max(-85, Math.min(85, angle)); // 限制在-85到85度
        }
        /**
         * 设置跟随距离
         */


        setFollowDistance(distance) {
          this.followDistance = Math.max(3.0, Math.min(15.0, distance)); // 限制距离
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "target", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "followDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8.0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followHeight", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5.0;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "lookAtHeight", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.0;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "smoothSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5.0;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "pitchAngle", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 30.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5987bc71b45abade4dc40f120a886a7a3ea106eb.js.map