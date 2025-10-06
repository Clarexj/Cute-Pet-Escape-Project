System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec2, Vec3, Quat, Joystick, Interactable, CharacterState, CharacterAnimationController, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _crd, ccclass, property, PlayerController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfJoystick(extras) {
    _reporterNs.report("Joystick", "./Joystick", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInteractable(extras) {
    _reporterNs.report("Interactable", "./Interactable", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterState(extras) {
    _reporterNs.report("CharacterState", "./CharacterState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterAnimationController(extras) {
    _reporterNs.report("CharacterAnimationController", "./CharacterAnimationController", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
    }, function (_unresolved_2) {
      Joystick = _unresolved_2.Joystick;
    }, function (_unresolved_3) {
      Interactable = _unresolved_3.Interactable;
    }, function (_unresolved_4) {
      CharacterState = _unresolved_4.CharacterState;
    }, function (_unresolved_5) {
      CharacterAnimationController = _unresolved_5.CharacterAnimationController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b5d64d1mL9NVYteQA9mM2N3", "PlayerController", undefined); // 文件名: PlayerController.ts
      // 功能：逃生者角色移动控制（基于Transform，相对摄像机方向）+ 交互检测 + 救援系统
      // 版本：V1.4 - 新增动画控制（任务3.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec2', 'Vec3', 'Quat', 'PhysicsSystem', 'geometry']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("PlayerController", PlayerController = (_dec = ccclass('PlayerController'), _dec2 = property(_crd && Joystick === void 0 ? (_reportPossibleCrUseOfJoystick({
        error: Error()
      }), Joystick) : Joystick), _dec3 = property(Node), _dec4 = property(_crd && CharacterAnimationController === void 0 ? (_reportPossibleCrUseOfCharacterAnimationController({
        error: Error()
      }), CharacterAnimationController) : CharacterAnimationController), _dec(_class = (_class2 = class PlayerController extends Component {
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
          _initializerDefineProperty(this, "interactDistance", _descriptor5, this);

          // 交互检测距离（米）
          _initializerDefineProperty(this, "rescueDistance", _descriptor6, this);

          // 救援检测距离（米）
          _initializerDefineProperty(this, "animationController", _descriptor7, this);

          // 动画控制器（任务3.1新增）
          this._moveDirection = new Vec3();
          // 世界空间移动方向
          this._targetRotation = new Quat();
          // 目标旋转
          // 任务1.3新增：交互系统
          this._currentInteractable = null;
          // 当前可交互的物体
          this._interactionCallbacks = [];
          // 交互状态变化回调
          this._isInteracting = false;
          // 是否正在交互中（锁定移动）
          // 任务2.1新增：角色状态和救援系统
          this._characterState = null;
          // 角色状态组件
          this._currentRescueTarget = null;
          // 当前救援目标
          this._rescueCallbacks = [];
          // 救援目标变化回调
          // 性能优化：缓存场景中的可交互物体和角色
          this._allInteractables = [];
          // 缓存所有可交互物体
          this._allCharacters = [];
          // 缓存所有角色
          // 性能优化：复用临时变量
          this._tempVec2 = new Vec2();
          // 用于接收摇杆方向
          this._tempVec3_1 = new Vec3();
          this._tempVec3_2 = new Vec3();
          this._tempVec3_3 = new Vec3();
          this._tempQuat = new Quat();
          this._cameraForward = new Vec3();
          this._cameraRight = new Vec3();
          this._rayOrigin = new Vec3();
          this._rayDirection = new Vec3();
        }

        start() {
          // 检查必需的引用
          if (!this.joystick) {
            console.error('[PlayerController] joystick未绑定！');
          }

          if (!this.cameraNode) {
            console.error('[PlayerController] cameraNode未绑定！');
          } // 获取角色状态组件


          this._characterState = this.node.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (!this._characterState) {
            console.error('[PlayerController] CharacterState组件未找到！');
          } // ✅ 性能优化：在启动时缓存场景中的可交互物体和角色


          this.refreshInteractablesCache();
          this.refreshCharactersCache(); // ✅ 任务3.1新增：获取动画控制器

          if (!this.animationController) {
            this.animationController = this.node.getComponentInChildren(_crd && CharacterAnimationController === void 0 ? (_reportPossibleCrUseOfCharacterAnimationController({
              error: Error()
            }), CharacterAnimationController) : CharacterAnimationController);

            if (!this.animationController) {
              console.warn('[PlayerController] CharacterAnimationController未找到，动画功能将不可用');
            }
          }
        }

        update(deltaTime) {
          if (!this.joystick || !this.cameraNode || !this._characterState) return; // 任务2.1：只有正常状态才能移动

          if (!this._characterState.isNormal()) {
            return;
          } // 如果正在交互中，禁止移动


          if (this._isInteracting) {
            return;
          } // ✅ 优化：获取摇杆输入（复用Vec2对象，避免GC）


          this.joystick.getDirectionOut(this._tempVec2);
          var joyStrength = this.joystick.getStrength();

          if (joyStrength > 0.01) {
            // 计算相对于摄像机的移动方向
            this.calculateMoveDirection(this._tempVec2); // 移动角色（复用对象）

            Vec3.multiplyScalar(this._tempVec3_1, this._moveDirection, this.moveSpeed * joyStrength * deltaTime);
            this.node.getPosition(this._tempVec3_2);
            Vec3.add(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
            this.node.setPosition(this._tempVec3_2); // 旋转角色面向移动方向

            this.rotateTowardsMovement(deltaTime);
          } else {
            // ✅ 修复：摇杆松开时重置移动方向
            this._moveDirection.set(0, 0, 0);
          } // 任务1.3新增：检测附近可交互物体


          this.detectInteractables(); // 任务2.1新增：检测附近可救援的队友

          this.detectRescueTargets(); // ✅ 任务3.1新增：更新动画状态

          this.updateAnimation();
        }
        /**
         * 更新动画状态（任务3.1新增）
         */


        updateAnimation() {
          if (!this.animationController) return; // 根据移动状态自动切换动画

          var isMoving = this.isMoving();
          this.animationController.updateMovementAnimation(isMoving);
        }
        /**
         * 计算相对于摄像机的移动方向
         * @param joyDir 摇杆输入方向（2D）
         */


        calculateMoveDirection(joyDir) {
          // 获取摄像机的世界旋转
          this.cameraNode.getWorldRotation(this._tempQuat); // ✅ 修复：使用Vec3.transformQuat转换标准向量（避免二次取负）
          // Cocos Creator标准坐标系：Z轴负方向是前方，X轴正方向是右方

          this._tempVec3_3.set(0, 0, -1); // 标准Forward向量


          Vec3.transformQuat(this._cameraForward, this._tempVec3_3, this._tempQuat);

          this._tempVec3_3.set(1, 0, 0); // 标准Right向量


          Vec3.transformQuat(this._cameraRight, this._tempVec3_3, this._tempQuat); // 将前方和右方向投影到水平面（Y=0）

          this._cameraForward.y = 0;

          this._cameraForward.normalize();

          this._cameraRight.y = 0;

          this._cameraRight.normalize(); // 组合摇杆输入和摄像机方向
          // 注意坐标系映射：
          //   - 摇杆Y轴（UI向上=正）→ 世界前后方向（摄像机Forward）
          //   - 摇杆X轴（UI向右=正）→ 世界左右方向（摄像机Right）


          Vec3.multiplyScalar(this._tempVec3_1, this._cameraForward, joyDir.y);
          Vec3.multiplyScalar(this._tempVec3_2, this._cameraRight, joyDir.x);
          Vec3.add(this._moveDirection, this._tempVec3_1, this._tempVec3_2);

          this._moveDirection.normalize();
        }
        /**
         * 平滑旋转角色面向移动方向
         */


        rotateTowardsMovement(deltaTime) {
          if (this._moveDirection.lengthSqr() < 0.01) return; // 计算目标旋转（朝向移动方向）

          var targetY = Math.atan2(this._moveDirection.x, this._moveDirection.z) * (180 / Math.PI);
          Quat.fromEuler(this._targetRotation, 0, targetY, 0); // 平滑插值到目标旋转（复用对象）

          this.node.getRotation(this._tempQuat);
          Quat.slerp(this._tempQuat, this._tempQuat, this._targetRotation, this.rotationSpeed * deltaTime);
          this.node.setRotation(this._tempQuat);
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
          return this.joystick && this.joystick.isActive() && this.joystick.getStrength() > 0.01;
        } // ============ 任务1.3新增：交互系统 ============

        /**
         * 刷新可交互物体缓存（新增物体时调用）
         */


        refreshInteractablesCache() {
          this._allInteractables = this.node.scene.getComponentsInChildren(_crd && Interactable === void 0 ? (_reportPossibleCrUseOfInteractable({
            error: Error()
          }), Interactable) : Interactable);
          console.log("[PlayerController] \u7F13\u5B58\u4E86 " + this._allInteractables.length + " \u4E2A\u53EF\u4EA4\u4E92\u7269\u4F53");
        }
        /**
         * 刷新角色缓存（新增角色时调用）
         */


        refreshCharactersCache() {
          this._allCharacters = this.node.scene.getComponentsInChildren(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);
          console.log("[PlayerController] \u7F13\u5B58\u4E86 " + this._allCharacters.length + " \u4E2A\u89D2\u8272");
        }
        /**
         * 检测附近的可交互物体（使用缓存的列表）
         */


        detectInteractables() {
          var closestInteractable = null;
          var closestDistance = this.interactDistance; // 获取玩家位置

          this.node.getWorldPosition(this._rayOrigin); // ✅ 优化：使用缓存的列表而非每帧遍历场景树

          for (var _interactable of this._allInteractables) {
            if (!_interactable.canInteract()) continue; // 获取可交互物体位置

            _interactable.node.getWorldPosition(this._tempVec3_1); // 计算距离


            Vec3.subtract(this._tempVec3_2, this._tempVec3_1, this._rayOrigin);

            var distance = this._tempVec3_2.length(); // 检查是否在交互范围内


            var range = Math.min(this.interactDistance, _interactable.getInteractRange());

            if (distance <= range && distance < closestDistance) {
              closestDistance = distance;
              closestInteractable = _interactable;
            }
          } // 如果当前可交互物体发生变化，触发回调


          if (closestInteractable !== this._currentInteractable) {
            this._currentInteractable = closestInteractable;
            this.notifyInteractionChange();
          }
        }
        /**
         * 触发交互（由UI按钮调用）
         */


        triggerInteraction() {
          if (this._currentInteractable && this._currentInteractable.canInteract()) {
            this._currentInteractable.interact(this.node);

            console.log("[PlayerController] \u4E0E " + this._currentInteractable.node.name + " \u4EA4\u4E92");
          } else {
            console.log('[PlayerController] 附近没有可交互的物体');
          }
        }
        /**
         * 获取当前可交互的物体
         */


        getCurrentInteractable() {
          return this._currentInteractable;
        }
        /**
         * 注册交互状态变化回调
         * @param callback 回调函数
         */


        onInteractionChange(callback) {
          this._interactionCallbacks.push(callback);
        }
        /**
         * 通知交互状态变化
         */


        notifyInteractionChange() {
          for (var callback of this._interactionCallbacks) {
            callback(this._currentInteractable);
          }
        }
        /**
         * 锁定玩家移动（用于交互动画期间）
         * @param locked 是否锁定
         */


        setMovementLocked(locked) {
          this._isInteracting = locked;

          if (locked) {
            console.log('[PlayerController] 移动已锁定（交互中）'); // ✅ 任务3.1 Bug修复：锁定时强制切换到idle动画

            if (this.animationController) {
              this.animationController.playIdle();
            }
          } else {
            console.log('[PlayerController] 移动已解锁');
          }
        }
        /**
         * 是否正在交互中
         */


        isInteracting() {
          return this._isInteracting;
        } // ============ 任务2.1新增：救援系统 ============

        /**
         * 检测附近可救援的队友（使用缓存的列表）
         */


        detectRescueTargets() {
          // 只有正常状态才能救援
          if (!this._characterState || !this._characterState.isNormal()) {
            return;
          }

          var nearestTarget = null;
          var nearestDistance = this.rescueDistance;
          this.node.getWorldPosition(this._rayOrigin); // ✅ 优化：使用缓存的列表而非每帧遍历场景树

          for (var character of this._allCharacters) {
            // 跳过自己
            if (character.node === this.node) continue; // 只检测被挂起且可以救援的队友

            if (!character.canBeRescued()) continue;
            character.node.getWorldPosition(this._tempVec3_1);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_1, this._rayOrigin);

            var distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
              nearestDistance = distance;
              nearestTarget = character.node;
            }
          } // 如果救援目标发生变化，触发回调


          if (nearestTarget !== this._currentRescueTarget) {
            this._currentRescueTarget = nearestTarget;
            this.notifyRescueTargetChange();
          }
        }
        /**
         * 触发救援（由UI按钮调用）
         */


        triggerRescue() {
          if (!this._currentRescueTarget) {
            console.log('[PlayerController] 附近没有可救援的队友');
            return;
          }

          var targetState = this._currentRescueTarget.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (!targetState || !targetState.canBeRescued()) {
            console.log('[PlayerController] 目标无法救援');
            return;
          } // 开始救援


          var success = targetState.startRescue(this.node);

          if (success) {
            // 锁定自己的移动
            this.setMovementLocked(true);
            console.log("[PlayerController] \u5F00\u59CB\u6551\u63F4 " + this._currentRescueTarget.name);
          }
        }
        /**
         * 取消救援
         */


        cancelRescue() {
          if (!this._currentRescueTarget) return;

          var targetState = this._currentRescueTarget.getComponent(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);

          if (targetState) {
            targetState.cancelRescue();
          } // 解锁移动


          this.setMovementLocked(false);
          console.log('[PlayerController] 取消救援');
        }
        /**
         * 获取当前救援目标
         */


        getCurrentRescueTarget() {
          return this._currentRescueTarget;
        }
        /**
         * 注册救援目标变化回调
         */


        onRescueTargetChange(callback) {
          this._rescueCallbacks.push(callback);
        }
        /**
         * 通知救援目标变化
         */


        notifyRescueTargetChange() {
          for (var callback of this._rescueCallbacks) {
            callback(this._currentRescueTarget);
          }
        }
        /**
         * 获取角色状态组件
         */


        getCharacterState() {
          return this._characterState;
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
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "interactDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.5;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "rescueDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.0;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "animationController", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=54ef71038c0524b408945e0b96e32b4f05d45ded.js.map