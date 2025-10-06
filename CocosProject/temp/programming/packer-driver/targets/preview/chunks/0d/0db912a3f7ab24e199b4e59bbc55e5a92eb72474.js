System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, BoxCollider, CharacterState, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, Hunter;

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
      Vec3 = _cc.Vec3;
      BoxCollider = _cc.BoxCollider;
    }, function (_unresolved_2) {
      CharacterState = _unresolved_2.CharacterState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "79566pwlLRHY5Qsj3hZtgm7", "Hunter", undefined); // 文件名: Hunter.ts
      // 功能：追捕者原型（任务2.1）
      // 简化版追捕者，用于测试抓捕和挂起逻辑


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'BoxCollider', 'ITriggerEvent']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Hunter", Hunter = (_dec = ccclass('Hunter'), _dec(_class = (_class2 = class Hunter extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "moveSpeed", _descriptor, this);

          // 移动速度（115% = 5 * 1.15）
          _initializerDefineProperty(this, "catchRange", _descriptor2, this);

          // 抓捕范围（米）
          _initializerDefineProperty(this, "autoCatchEnabled", _descriptor3, this);

          // 是否自动抓捕（用于测试）
          this._carriedSurvivor = null;
          // 携带的逃生者
          this._nearestCage = null;
          // 最近的笼子
          // 临时变量
          this._tempVec3_1 = new Vec3();
          this._tempVec3_2 = new Vec3();
        }

        start() {
          console.log('[Hunter] 追捕者初始化'); // 设置碰撞检测（如果有BoxCollider）

          var collider = this.node.getComponent(BoxCollider);

          if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.on('onTriggerStay', this.onTriggerStay, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
          }
        }

        update(deltaTime) {
          // 如果携带了逃生者，检测是否靠近笼子
          if (this._carriedSurvivor) {
            this.checkNearCage();
          } // 如果启用自动抓捕，检测附近的逃生者


          if (this.autoCatchEnabled && !this._carriedSurvivor) {
            this.autoDetectSurvivors();
          }
        } // ============ 碰撞检测 ============

        /**
         * 碰撞进入
         */


        onTriggerEnter(event) {
          var otherNode = event.otherCollider.node; // 检查是否是逃生者

          var characterState = otherNode.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (characterState && characterState.isNormal() && !this._carriedSurvivor) {
            this.catchSurvivor(otherNode);
          } // 检查是否是笼子


          if (otherNode.name.includes('Cage') || otherNode.name.includes('cage')) {
            this._nearestCage = otherNode;
          }
        }
        /**
         * 碰撞持续
         */


        onTriggerStay(event) {
          var otherNode = event.otherCollider.node; // 检查是否碰到正在救援的逃生者，打断救援

          var characterState = otherNode.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (characterState && characterState.isNormal()) {
            // 检查这个逃生者是否正在救援别人
            var playerController = otherNode.getComponent('PlayerController');

            if (playerController && typeof playerController.getCurrentRescueTarget === 'function') {
              var rescueTarget = playerController.getCurrentRescueTarget();

              if (rescueTarget) {
                // 正在救援，打断救援并抓捕
                console.log("[Hunter] \u6253\u65AD " + otherNode.name + " \u7684\u6551\u63F4\u884C\u4E3A");
                playerController.cancelRescue(); // 如果还没携带逃生者，抓捕这个救援者

                if (!this._carriedSurvivor) {
                  this.catchSurvivor(otherNode);
                }
              }
            }
          }
        }
        /**
         * 碰撞退出
         */


        onTriggerExit(event) {
          var otherNode = event.otherCollider.node; // 离开笼子范围

          if (otherNode === this._nearestCage) {
            this._nearestCage = null;
          }
        } // ============ 抓捕逻辑 ============

        /**
         * 自动检测附近的逃生者（简化版AI）
         */


        autoDetectSurvivors() {
          // 查找所有逃生者
          var allSurvivors = this.node.scene.getComponentsInChildren(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);
          var nearestSurvivor = null;
          var nearestDistance = this.catchRange;
          this.node.getWorldPosition(this._tempVec3_1);

          for (var survivor of allSurvivors) {
            // 跳过非正常状态的逃生者
            if (!survivor.isNormal()) continue;
            survivor.node.getWorldPosition(this._tempVec3_2);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);

            var distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
              nearestDistance = distance;
              nearestSurvivor = survivor.node;
            }
          } // 如果找到附近的逃生者，抓捕


          if (nearestSurvivor) {
            this.catchSurvivor(nearestSurvivor);
          }
        }
        /**
         * 抓捕逃生者
         */


        catchSurvivor(survivorNode) {
          if (this._carriedSurvivor) {
            console.warn('[Hunter] 已经携带了一个逃生者，无法再次抓捕');
            return;
          }

          var characterState = survivorNode.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (!characterState) {
            console.error('[Hunter] 目标节点没有CharacterState组件');
            return;
          }

          if (!characterState.isNormal()) {
            console.warn("[Hunter] " + survivorNode.name + " \u4E0D\u662F\u6B63\u5E38\u72B6\u6001\uFF0C\u65E0\u6CD5\u6293\u6355");
            return;
          } // 设置逃生者状态为被抓


          characterState.setCaught(this.node);
          this._carriedSurvivor = survivorNode;
          console.log("[Hunter] \u6293\u4F4F\u4E86 " + survivorNode.name); // 将逃生者设置为追捕者的子节点（视觉上跟随）

          survivorNode.setParent(this.node);
          survivorNode.setPosition(0, 2, 0); // 放在追捕者上方
        }
        /**
         * 检测是否靠近笼子
         */


        checkNearCage() {
          if (!this._carriedSurvivor) return; // 查找场景中的笼子

          var allNodes = this.node.scene.children;
          var nearestCage = null;
          var nearestDistance = 2.0; // 笼子检测范围

          this.node.getWorldPosition(this._tempVec3_1);

          for (var sceneNode of allNodes) {
            if (sceneNode.name.includes('Cage') || sceneNode.name.includes('cage')) {
              sceneNode.getWorldPosition(this._tempVec3_2);
              Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);

              var distance = this._tempVec3_2.length();

              if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestCage = sceneNode;
              }
            }
          } // 如果靠近笼子，挂起逃生者


          if (nearestCage) {
            this.hangSurvivorOnCage(nearestCage);
          }
        }
        /**
         * 将逃生者挂在笼子上
         */


        hangSurvivorOnCage(cageNode) {
          if (!this._carriedSurvivor) return;

          var characterState = this._carriedSurvivor.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (!characterState) return;
          console.log("[Hunter] \u5C06 " + this._carriedSurvivor.name + " \u6302\u5728 " + cageNode.name + " \u4E0A"); // 设置逃生者状态为被挂起

          characterState.setHanged(); // 将逃生者设置为笼子的子节点

          this._carriedSurvivor.setParent(cageNode);

          this._carriedSurvivor.setPosition(0, 1.5, 0); // 笼子上方
          // 清除携带引用


          this._carriedSurvivor = null;
        } // ============ 手动控制接口（用于测试） ============

        /**
         * 手动触发抓捕（用于测试）
         */


        manualCatch(survivorNode) {
          this.catchSurvivor(survivorNode);
        }
        /**
         * 手动触发挂起（用于测试）
         */


        manualHang(cageNode) {
          if (this._carriedSurvivor) {
            this.hangSurvivorOnCage(cageNode);
          } else {
            console.warn('[Hunter] 没有携带逃生者，无法挂起');
          }
        }
        /**
         * 获取携带的逃生者
         */


        getCarriedSurvivor() {
          return this._carriedSurvivor;
        }
        /**
         * 是否正在携带逃生者
         */


        isCarrying() {
          return this._carriedSurvivor !== null;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5.75;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "catchRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "autoCatchEnabled", [property], {
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
//# sourceMappingURL=0db912a3f7ab24e199b4e59bbc55e5a92eb72474.js.map