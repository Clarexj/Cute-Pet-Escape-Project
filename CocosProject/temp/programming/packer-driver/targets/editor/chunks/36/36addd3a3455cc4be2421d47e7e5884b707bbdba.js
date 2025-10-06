System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec2, Canvas, CameraFollow, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, CameraController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCameraFollow(extras) {
    _reporterNs.report("CameraFollow", "./CameraFollow", _context.meta, extras);
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
      Vec2 = _cc.Vec2;
      Canvas = _cc.Canvas;
    }, function (_unresolved_2) {
      CameraFollow = _unresolved_2.CameraFollow;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "72eb96gVNBJyrUJ3gdVRW0k", "CameraController", undefined); // 文件名: CameraController.ts
      // 功能：处理屏幕右侧触摸拖拽来旋转摄像机（任务1.2）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'EventTouch', 'Vec2', 'UITransform', 'Canvas']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("CameraController", CameraController = (_dec = ccclass('CameraController'), _dec2 = property(_crd && CameraFollow === void 0 ? (_reportPossibleCrUseOfCameraFollow({
        error: Error()
      }), CameraFollow) : CameraFollow), _dec3 = property(Node), _dec(_class = (_class2 = class CameraController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "cameraFollow", _descriptor, this);

          // CameraFollow组件引用
          _initializerDefineProperty(this, "joystickArea", _descriptor2, this);

          // 摇杆区域节点（用于判断是否在摇杆区域内）
          _initializerDefineProperty(this, "rotationSensitivity", _descriptor3, this);

          // 旋转灵敏度
          _initializerDefineProperty(this, "joystickExclusionRadius", _descriptor4, this);

          // 摇杆排除半径（屏幕左侧多大范围不响应）
          this._touchId = -1;
          // 当前触摸ID
          this._lastTouchPos = new Vec2();
          // 上一次触摸位置
          this._isDragging = false;
          // 是否正在拖拽
          // 性能优化：复用临时变量
          this._tempVec2 = new Vec2();
        }

        onLoad() {
          // 监听Canvas上的触摸事件（全屏监听）
          const canvas = this.node.getComponent(Canvas);

          if (canvas) {
            this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
          } else {
            console.warn('[CameraController] 请将此组件挂在Canvas节点上！');
          }
        }

        onDestroy() {
          this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
          this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
          this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }

        onTouchStart(event) {
          const uiPos = event.getUILocation(); // 检查是否在摇杆区域（左侧区域）

          if (this.isInJoystickArea(uiPos)) {
            return; // 在摇杆区域，不处理
          } // 记录触摸信息


          this._touchId = event.touch.getID();

          this._lastTouchPos.set(uiPos.x, uiPos.y);

          this._isDragging = true;
        }

        onTouchMove(event) {
          // 只处理当前触摸
          if (event.touch.getID() !== this._touchId || !this._isDragging) return;
          const uiPos = event.getUILocation(); // 计算拖拽偏移量

          this._tempVec2.set(uiPos.x - this._lastTouchPos.x, uiPos.y - this._lastTouchPos.y); // 水平拖拽控制摄像机水平旋转


          const deltaYaw = this._tempVec2.x * this.rotationSensitivity;

          if (this.cameraFollow) {
            this.cameraFollow.addYawAngle(deltaYaw);
          } // 更新上一次触摸位置


          this._lastTouchPos.set(uiPos.x, uiPos.y);
        }

        onTouchEnd(event) {
          // 只处理当前触摸
          if (event.touch.getID() !== this._touchId) return; // 重置状态

          this._touchId = -1;
          this._isDragging = false;
        }
        /**
         * 判断触摸位置是否在摇杆区域内
         * @param uiPos UI坐标系的触摸位置（左下角为原点）
         */


        isInJoystickArea(uiPos) {
          // ✅ 修复：直接使用UI坐标判断
          // UI坐标原点在左下角，x向右递增，y向上递增
          // 屏幕左侧joystickExclusionRadius范围内视为摇杆区域
          return uiPos.x < this.joystickExclusionRadius;
        }
        /**
         * 设置旋转灵敏度
         */


        setRotationSensitivity(sensitivity) {
          this.rotationSensitivity = Math.max(0.05, Math.min(1.0, sensitivity));
        }
        /**
         * 是否正在拖拽旋转摄像机
         */


        isDragging() {
          return this._isDragging;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "cameraFollow", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "joystickArea", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "rotationSensitivity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.2;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "joystickExclusionRadius", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 250;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=36addd3a3455cc4be2421d47e7e5884b707bbdba.js.map