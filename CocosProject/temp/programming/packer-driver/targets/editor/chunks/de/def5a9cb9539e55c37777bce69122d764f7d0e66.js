System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec2, Vec3, Quat, Joystick, CharacterState, Hunter, Board, CharacterAnimationController, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, HunterController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfJoystick(extras) {
    _reporterNs.report("Joystick", "./Joystick", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterState(extras) {
    _reporterNs.report("CharacterState", "./CharacterState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHunter(extras) {
    _reporterNs.report("Hunter", "./Hunter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBoard(extras) {
    _reporterNs.report("Board", "./Board", _context.meta, extras);
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
      CharacterState = _unresolved_3.CharacterState;
    }, function (_unresolved_4) {
      Hunter = _unresolved_4.Hunter;
    }, function (_unresolved_5) {
      Board = _unresolved_5.Board;
    }, function (_unresolved_6) {
      CharacterAnimationController = _unresolved_6.CharacterAnimationController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7cd09kvxzNA97kHJd2x9+v3", "HunterController", undefined); // 文件名: HunterController.ts
      // 功能：追捕者可控移动 + 攻击 + 踩碎木板（任务2.2）
      // 版本：V1.1 - 新增动画控制（任务3.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec2', 'Vec3', 'Quat', 'PhysicsSystem']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("HunterController", HunterController = (_dec = ccclass('HunterController'), _dec2 = property(_crd && Joystick === void 0 ? (_reportPossibleCrUseOfJoystick({
        error: Error()
      }), Joystick) : Joystick), _dec3 = property(Node), _dec4 = property(_crd && CharacterAnimationController === void 0 ? (_reportPossibleCrUseOfCharacterAnimationController({
        error: Error()
      }), CharacterAnimationController) : CharacterAnimationController), _dec(_class = (_class2 = class HunterController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "joystick", _descriptor, this);

          // 虚拟摇杆引用
          _initializerDefineProperty(this, "cameraNode", _descriptor2, this);

          // 摄像机节点引用
          _initializerDefineProperty(this, "moveSpeed", _descriptor3, this);

          // 移动速度（115% = 5 * 1.15）
          _initializerDefineProperty(this, "rotationSpeed", _descriptor4, this);

          // 转身速度
          _initializerDefineProperty(this, "attackRange", _descriptor5, this);

          // 攻击范围（米）
          _initializerDefineProperty(this, "attackCooldown", _descriptor6, this);

          // 攻击冷却时间（秒）
          _initializerDefineProperty(this, "boardBreakRange", _descriptor7, this);

          // 踩碎木板范围（米）
          _initializerDefineProperty(this, "animationController", _descriptor8, this);

          // 动画控制器（任务3.1新增）
          this._moveDirection = new Vec3();
          // 世界空间移动方向
          this._targetRotation = new Quat();
          // 目标旋转
          // 攻击系统
          this._canAttack = true;
          // 是否可以攻击
          this._attackCooldownTimer = 0;
          // 攻击冷却计时器
          this._nearestSurvivor = null;
          // 最近的逃生者
          this._attackCallbacks = [];
          // 攻击目标变化回调
          // 木板系统
          this._nearestBoard = null;
          // 最近的倒下木板
          this._boardCallbacks = [];
          // 木板目标变化回调
          // Hunter组件引用
          this._hunter = null;
          // 性能优化：缓存场景中的角色和木板
          this._allCharacters = [];
          this._allBoards = [];
          // 性能优化：复用临时变量
          this._tempVec2 = new Vec2();
          this._tempVec3_1 = new Vec3();
          this._tempVec3_2 = new Vec3();
          this._tempVec3_3 = new Vec3();
          this._tempQuat = new Quat();
          this._cameraForward = new Vec3();
          this._cameraRight = new Vec3();
        }

        start() {
          // 检查必需的引用
          if (!this.joystick) {
            console.error('[HunterController] joystick未绑定！');
          }

          if (!this.cameraNode) {
            console.error('[HunterController] cameraNode未绑定！');
          } // 获取Hunter组件


          this._hunter = this.node.getComponent(_crd && Hunter === void 0 ? (_reportPossibleCrUseOfHunter({
            error: Error()
          }), Hunter) : Hunter);

          if (!this._hunter) {
            console.error('[HunterController] Hunter组件未找到！');
          } else {
            // 禁用Hunter的自动抓捕，改用手动攻击
            this._hunter.autoCatchEnabled = false;
          } // 缓存场景中的角色和木板


          this.refreshCache(); // ✅ 任务3.1新增：获取动画控制器

          if (!this.animationController) {
            this.animationController = this.node.getComponentInChildren(_crd && CharacterAnimationController === void 0 ? (_reportPossibleCrUseOfCharacterAnimationController({
              error: Error()
            }), CharacterAnimationController) : CharacterAnimationController);

            if (!this.animationController) {
              console.warn('[HunterController] CharacterAnimationController未找到，动画功能将不可用');
            }
          }

          console.log('[HunterController] 追捕者控制器初始化完成');
        }

        update(deltaTime) {
          if (!this.joystick || !this.cameraNode) return; // 更新攻击冷却

          if (!this._canAttack) {
            this._attackCooldownTimer -= deltaTime;

            if (this._attackCooldownTimer <= 0) {
              this._canAttack = true;
            }
          } // 如果正在携带逃生者，禁止移动（由Hunter组件处理）


          if (this._hunter && this._hunter.isCarrying()) {
            return;
          } // 获取摇杆输入


          this.joystick.getDirectionOut(this._tempVec2);
          const joyStrength = this.joystick.getStrength();

          if (joyStrength > 0.01) {
            // 计算相对于摄像机的移动方向
            this.calculateMoveDirection(this._tempVec2); // 移动角色

            Vec3.multiplyScalar(this._tempVec3_1, this._moveDirection, this.moveSpeed * joyStrength * deltaTime);
            this.node.getPosition(this._tempVec3_2);
            Vec3.add(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);
            this.node.setPosition(this._tempVec3_2); // 旋转角色面向移动方向

            this.rotateTowardsMovement(deltaTime);
          } else {
            // 摇杆松开时重置移动方向
            this._moveDirection.set(0, 0, 0);
          } // 检测附近的逃生者（用于攻击）


          this.detectSurvivors(); // 检测附近的倒下木板（用于踩碎）

          this.detectBoards(); // ✅ 任务3.1新增：更新动画状态

          this.updateAnimation();
        }
        /**
         * 更新动画状态（任务3.1新增）
         */


        updateAnimation() {
          if (!this.animationController) return; // 根据移动状态自动切换动画

          const isMoving = this.isMoving();
          this.animationController.updateMovementAnimation(isMoving);
        }
        /**
         * 计算相对于摄像机的移动方向
         * @param joyDir 摇杆输入方向（2D）
         */


        calculateMoveDirection(joyDir) {
          // 获取摄像机的世界旋转
          this.cameraNode.getWorldRotation(this._tempQuat); // 使用Vec3.transformQuat转换标准向量

          this._tempVec3_3.set(0, 0, -1); // 标准Forward向量


          Vec3.transformQuat(this._cameraForward, this._tempVec3_3, this._tempQuat);

          this._tempVec3_3.set(1, 0, 0); // 标准Right向量


          Vec3.transformQuat(this._cameraRight, this._tempVec3_3, this._tempQuat); // 将前方和右方向投影到水平面（Y=0）

          this._cameraForward.y = 0;

          this._cameraForward.normalize();

          this._cameraRight.y = 0;

          this._cameraRight.normalize(); // 组合摇杆输入和摄像机方向


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

          const targetY = Math.atan2(this._moveDirection.x, this._moveDirection.z) * (180 / Math.PI);
          Quat.fromEuler(this._targetRotation, 0, targetY, 0); // 平滑插值到目标旋转

          this.node.getRotation(this._tempQuat);
          Quat.slerp(this._tempQuat, this._tempQuat, this._targetRotation, this.rotationSpeed * deltaTime);
          this.node.setRotation(this._tempQuat);
        }
        /**
         * 刷新缓存（新增角色或木板时调用）
         */


        refreshCache() {
          this._allCharacters = this.node.scene.getComponentsInChildren(_crd && CharacterState === void 0 ? (_reportPossibleCrUseOfCharacterState({
            error: Error()
          }), CharacterState) : CharacterState);
          this._allBoards = this.node.scene.getComponentsInChildren(_crd && Board === void 0 ? (_reportPossibleCrUseOfBoard({
            error: Error()
          }), Board) : Board);
          console.log(`[HunterController] 缓存了 ${this._allCharacters.length} 个角色, ${this._allBoards.length} 个木板`);
        } // ============ 攻击系统 ============

        /**
         * 检测附近的逃生者
         */


        detectSurvivors() {
          let nearestSurvivor = null;
          let nearestDistance = this.attackRange;
          this.node.getWorldPosition(this._tempVec3_1);

          for (const character of this._allCharacters) {
            // 只检测正常状态的逃生者
            if (!character.isNormal()) continue;
            character.node.getWorldPosition(this._tempVec3_2);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);

            const distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
              nearestDistance = distance;
              nearestSurvivor = character.node;
            }
          } // 如果目标发生变化，触发回调


          if (nearestSurvivor !== this._nearestSurvivor) {
            this._nearestSurvivor = nearestSurvivor;
            this.notifyAttackTargetChange();
          }
        }
        /**
         * 触发攻击（由UI按钮调用）
         */


        triggerAttack() {
          if (!this._canAttack) {
            console.log('[HunterController] 攻击冷却中...');
            return;
          }

          if (!this._nearestSurvivor) {
            console.log('[HunterController] 附近没有可攻击的逃生者');
            return;
          }

          if (!this._hunter) {
            console.error('[HunterController] Hunter组件未找到');
            return;
          } // ✅ 任务3.1新增：播放攻击动画


          if (this.animationController) {
            this.animationController.playAttack();
          } // 执行攻击：调用Hunter的抓捕逻辑


          console.log(`[HunterController] 攻击 ${this._nearestSurvivor.name}`);

          this._hunter.catchSurvivor(this._nearestSurvivor); // 进入冷却


          this._canAttack = false;
          this._attackCooldownTimer = this.attackCooldown;
        }
        /**
         * 获取当前攻击目标
         */


        getAttackTarget() {
          return this._nearestSurvivor;
        }
        /**
         * 是否可以攻击
         */


        canAttack() {
          return this._canAttack && this._nearestSurvivor !== null;
        }
        /**
         * 获取攻击冷却进度（0-1）
         */


        getAttackCooldownProgress() {
          if (this._canAttack) return 1.0;
          return 1.0 - this._attackCooldownTimer / this.attackCooldown;
        }
        /**
         * 注册攻击目标变化回调
         */


        onAttackTargetChange(callback) {
          this._attackCallbacks.push(callback);
        }
        /**
         * 通知攻击目标变化
         */


        notifyAttackTargetChange() {
          for (const callback of this._attackCallbacks) {
            callback(this._nearestSurvivor);
          }
        } // ============ 踩碎木板系统 ============

        /**
         * 检测附近的倒下木板
         */


        detectBoards() {
          let nearestBoard = null;
          let nearestDistance = this.boardBreakRange;
          this.node.getWorldPosition(this._tempVec3_1);

          for (const board of this._allBoards) {
            // 只检测已倒下的木板
            if (board.getState() !== 'down') continue;
            board.node.getWorldPosition(this._tempVec3_2);
            Vec3.subtract(this._tempVec3_2, this._tempVec3_2, this._tempVec3_1);

            const distance = this._tempVec3_2.length();

            if (distance <= nearestDistance) {
              nearestDistance = distance;
              nearestBoard = board;
            }
          } // 如果目标发生变化，触发回调


          if (nearestBoard !== this._nearestBoard) {
            this._nearestBoard = nearestBoard;
            this.notifyBoardTargetChange();
          }
        }
        /**
         * 触发踩碎木板（由UI按钮调用）
         */


        triggerBreakBoard() {
          if (!this._nearestBoard) {
            console.log('[HunterController] 附近没有可踩碎的木板');
            return;
          }

          console.log(`[HunterController] 踩碎木板 ${this._nearestBoard.node.name}`);

          this._nearestBoard.breakBoard(); // 木板消失


          this._nearestBoard.node.active = false; // 清空引用

          this._nearestBoard = null;
          this.notifyBoardTargetChange();
        }
        /**
         * 获取当前木板目标
         */


        getBoardTarget() {
          return this._nearestBoard;
        }
        /**
         * 是否可以踩碎木板
         */


        canBreakBoard() {
          return this._nearestBoard !== null;
        }
        /**
         * 注册木板目标变化回调
         */


        onBoardTargetChange(callback) {
          this._boardCallbacks.push(callback);
        }
        /**
         * 通知木板目标变化
         */


        notifyBoardTargetChange() {
          for (const callback of this._boardCallbacks) {
            callback(this._nearestBoard);
          }
        } // ============ 工具方法 ============

        /**
         * 是否正在移动
         */


        isMoving() {
          return this.joystick && this.joystick.isActive() && this.joystick.getStrength() > 0.01;
        }
        /**
         * 获取Hunter组件
         */


        getHunter() {
          return this._hunter;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "joystick", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "cameraNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5.75;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "rotationSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 10.0;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2.0;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "attackCooldown", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.0;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "boardBreakRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2.5;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "animationController", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=def5a9cb9539e55c37777bce69122d764f7d0e66.js.map