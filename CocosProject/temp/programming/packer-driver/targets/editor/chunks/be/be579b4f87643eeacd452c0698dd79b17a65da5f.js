System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec2, _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, Joystick;

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
      Vec2 = _cc.Vec2;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "60489287b5K3LC5xFz1zB0f", "Joystick", undefined); // 文件名: Joystick.ts
      // 功能：虚拟摇杆控制组件，用于触摸屏操作
      // 版本：V1.1 - 性能优化版


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec2', 'Vec3', 'UITransform', 'EventTouch']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Joystick", Joystick = (_dec = ccclass('Joystick'), _dec2 = property(Node), _dec(_class = (_class2 = class Joystick extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "stick", _descriptor, this);

          // 摇杆中心的小圆点
          _initializerDefineProperty(this, "maxRadius", _descriptor2, this);

          // 摇杆最大拖动半径
          _initializerDefineProperty(this, "deadZone", _descriptor3, this);

          // 死区半径（0-1），避免误触
          this._touchId = -1;
          // 当前触摸ID
          this._touchStartPos = new Vec2();
          // 触摸起始位置
          this._direction = new Vec2(0, 0);
          // 归一化方向向量 (-1到1)
          this._strength = 0;
          // 摇杆偏移强度 (0到1)
          // 性能优化：复用临时变量
          this._tempVec2 = new Vec2();
        }

        onLoad() {
          // 检查stick节点是否绑定
          if (!this.stick) {
            console.error('[Joystick] stick节点未绑定！请在编辑器中将JoystickStick节点拖到Stick属性框。');
            return;
          } // 监听触摸事件


          this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
          this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
          this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }

        onDestroy() {
          this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
          this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
          this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }

        onTouchStart(event) {
          // 记录触摸ID和起始位置
          this._touchId = event.touch.getID();
          const uiPos = event.getUILocation();

          this._touchStartPos.set(uiPos.x, uiPos.y);
        }

        onTouchMove(event) {
          // 只处理当前触摸
          if (event.touch.getID() !== this._touchId) return;
          if (!this.stick) return; // 安全检查

          const uiPos = event.getUILocation(); // 计算偏移量（复用对象）

          this._tempVec2.set(uiPos.x - this._touchStartPos.x, uiPos.y - this._touchStartPos.y);

          const distance = this._tempVec2.length(); // 限制在最大半径内


          if (distance > this.maxRadius) {
            this._tempVec2.normalize().multiplyScalar(this.maxRadius);
          } // 更新摇杆视觉位置


          this.stick.setPosition(this._tempVec2.x, this._tempVec2.y, 0); // 计算强度（原始强度）

          const rawStrength = Math.min(distance / this.maxRadius, 1.0); // 应用死区

          if (rawStrength < this.deadZone) {
            this._strength = 0;

            this._direction.set(0, 0);
          } else {
            // 重新映射强度到0-1范围（死区外）
            this._strength = (rawStrength - this.deadZone) / (1 - this.deadZone); // 计算方向

            if (distance > 0.01) {
              this._direction.set(this._tempVec2.x, this._tempVec2.y);

              this._direction.normalize();
            } else {
              this._direction.set(0, 0);
            }
          }
        }

        onTouchEnd(event) {
          // 只处理当前触摸
          if (event.touch.getID() !== this._touchId) return;
          if (!this.stick) return; // 安全检查
          // 重置摇杆

          this._touchId = -1;
          this.stick.setPosition(0, 0, 0);

          this._direction.set(0, 0);

          this._strength = 0;
        }
        /**
         * 获取摇杆方向 (归一化的2D向量)
         * @returns Vec2 x和y范围都是-1到1
         */


        getDirection() {
          return this._direction.clone();
        }
        /**
         * ✅ 优化：获取摇杆方向（复用传入的Vec2，避免GC）
         * @param out 输出向量
         * @returns Vec2 返回传入的out对象
         */


        getDirectionOut(out) {
          out.set(this._direction.x, this._direction.y);
          return out;
        }
        /**
         * 获取摇杆强度
         * @returns number 0到1之间的值
         */


        getStrength() {
          return this._strength;
        }
        /**
         * 是否正在操作摇杆
         */


        isActive() {
          return this._touchId !== -1;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "stick", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maxRadius", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 100;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "deadZone", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.1;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=be579b4f87643eeacd452c0698dd79b17a65da5f.js.map