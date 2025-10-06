System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, CharacterStateType, CharacterState;

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
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f08c8dGfP9E+JKgioaXrLKa", "CharacterState", undefined); // 文件名: CharacterState.ts
      // 功能：角色状态管理（任务2.1）
      // 负责管理逃生者的状态：正常、被抓、被挂起、被淘汰


      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 角色状态枚举
       */

      _export("CharacterStateType", CharacterStateType = /*#__PURE__*/function (CharacterStateType) {
        CharacterStateType["NORMAL"] = "normal";
        CharacterStateType["CAUGHT"] = "caught";
        CharacterStateType["HANGED"] = "hanged";
        CharacterStateType["ELIMINATED"] = "eliminated";
        return CharacterStateType;
      }({}));
      /**
       * 状态变化事件回调类型
       */


      _export("CharacterState", CharacterState = (_dec = ccclass('CharacterState'), _dec(_class = (_class2 = class CharacterState extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "maxHangCount", _descriptor, this);

          // 最多被挂起次数（2条命）
          _initializerDefineProperty(this, "hangDuration", _descriptor2, this);

          // 挂起倒计时（秒）
          _initializerDefineProperty(this, "rescueDuration", _descriptor3, this);

          // 救援读条时长（秒）
          this._currentState = CharacterStateType.NORMAL;
          this._hangCount = 0;
          // 已被挂起次数
          this._hangTimer = 0;
          // 挂起倒计时计时器
          this._isHangTimerActive = false;
          // 倒计时是否激活
          // 状态变化回调
          this._stateChangeCallbacks = [];
          // 被谁抓住（追捕者节点引用）
          this._caughtBy = null;
          // 正在被谁救援（队友节点引用）
          this._beingRescuedBy = null;
          this._rescueProgress = 0;
          // 救援进度 0-1
          this._isBeingRescued = false;
        }

        start() {
          this._currentState = CharacterStateType.NORMAL;
          console.log(`[CharacterState] ${this.node.name} 初始状态：${this._currentState}`);
        }

        update(deltaTime) {
          // 处理挂起倒计时
          if (this._isHangTimerActive && this._currentState === CharacterStateType.HANGED) {
            this._hangTimer -= deltaTime;

            if (this._hangTimer <= 0) {
              // 倒计时结束，淘汰
              console.log(`[CharacterState] ${this.node.name} 挂起倒计时结束，淘汰`);
              this.eliminate();
            }
          } // 处理救援进度


          if (this._isBeingRescued && this._currentState === CharacterStateType.HANGED) {
            this._rescueProgress += deltaTime / this.rescueDuration;

            if (this._rescueProgress >= 1.0) {
              // 救援成功
              this.onRescueComplete();
            }
          }
        } // ============ 状态控制 ============

        /**
         * 获取当前状态
         */


        getCurrentState() {
          return this._currentState;
        }
        /**
         * 设置被抓状态
         * @param hunter 追捕者节点
         */


        setCaught(hunter) {
          if (this._currentState !== CharacterStateType.NORMAL) {
            console.warn(`[CharacterState] ${this.node.name} 不是正常状态，无法被抓`);
            return;
          }

          const oldState = this._currentState;
          this._currentState = CharacterStateType.CAUGHT;
          this._caughtBy = hunter;
          console.log(`[CharacterState] ${this.node.name} 被 ${hunter.name} 抓住`);
          this.notifyStateChange(oldState, this._currentState);
        }
        /**
         * 设置被挂起状态
         */


        setHanged() {
          if (this._currentState !== CharacterStateType.CAUGHT) {
            console.warn(`[CharacterState] ${this.node.name} 不是被抓状态，无法被挂起`);
            return;
          }

          this._hangCount++;
          this._caughtBy = null; // ✅ 检查是否超过最大挂起次数

          if (this._hangCount > this.maxHangCount) {
            console.log(`[CharacterState] ${this.node.name} 挂起次数超限（${this._hangCount}/${this.maxHangCount}），立即淘汰`);
            this.eliminate();
            return;
          }

          const oldState = this._currentState;
          this._currentState = CharacterStateType.HANGED; // 启动挂起倒计时

          this._hangTimer = this.hangDuration;
          this._isHangTimerActive = true;
          console.log(`[CharacterState] ${this.node.name} 被挂起（第${this._hangCount}次/${this.maxHangCount}次），倒计时${this.hangDuration}秒`);
          this.notifyStateChange(oldState, this._currentState);
        }
        /**
         * 开始救援
         * @param rescuer 救援者节点
         */


        startRescue(rescuer) {
          if (this._currentState !== CharacterStateType.HANGED) {
            console.warn(`[CharacterState] ${this.node.name} 不是被挂起状态，无法救援`);
            return false;
          }

          if (this._isBeingRescued) {
            console.warn(`[CharacterState] ${this.node.name} 已经在被救援中`);
            return false;
          }

          this._isBeingRescued = true;
          this._beingRescuedBy = rescuer;
          this._rescueProgress = 0;
          console.log(`[CharacterState] ${rescuer.name} 开始救援 ${this.node.name}`);
          return true;
        }
        /**
         * 中断救援
         */


        cancelRescue() {
          if (!this._isBeingRescued) return;
          console.log(`[CharacterState] ${this.node.name} 的救援被中断（进度${(this._rescueProgress * 100).toFixed(0)}%）`);
          this._isBeingRescued = false;
          this._beingRescuedBy = null;
          this._rescueProgress = 0;
        }
        /**
         * 救援完成
         */


        onRescueComplete() {
          if (!this._isBeingRescued) return;
          const rescuer = this._beingRescuedBy;
          console.log(`[CharacterState] ${rescuer == null ? void 0 : rescuer.name} 成功救援 ${this.node.name}`);
          const oldState = this._currentState;
          this._currentState = CharacterStateType.NORMAL;
          this._isHangTimerActive = false;
          this._isBeingRescued = false;
          this._beingRescuedBy = null;
          this._rescueProgress = 0; // 解锁救援者的移动

          if (rescuer) {
            const rescuerController = rescuer.getComponent('PlayerController');

            if (rescuerController && typeof rescuerController.setMovementLocked === 'function') {
              rescuerController.setMovementLocked(false);
            }
          } // 将被救的逃生者从笼子上移回场景


          this.node.setParent(this.node.scene);
          const currentPos = this.node.worldPosition;
          this.node.setWorldPosition(currentPos.x, 0, currentPos.z); // 放回地面

          this.notifyStateChange(oldState, this._currentState);
        }
        /**
         * 淘汰
         */


        eliminate() {
          const oldState = this._currentState;
          this._currentState = CharacterStateType.ELIMINATED;
          this._isHangTimerActive = false;
          this._isBeingRescued = false;
          console.log(`[CharacterState] ${this.node.name} 被淘汰`);
          this.notifyStateChange(oldState, this._currentState); // 隐藏节点（不销毁，方便调试）

          this.node.active = false;
        }
        /**
         * 强制设置状态为正常（用于救援成功或重置）
         */


        setNormal() {
          if (this._currentState === CharacterStateType.ELIMINATED) {
            console.warn(`[CharacterState] ${this.node.name} 已被淘汰，无法恢复正常状态`);
            return;
          }

          const oldState = this._currentState;
          this._currentState = CharacterStateType.NORMAL;
          this._caughtBy = null;
          this._isHangTimerActive = false;
          this._isBeingRescued = false;
          this._beingRescuedBy = null;
          this._rescueProgress = 0;
          this.notifyStateChange(oldState, this._currentState);
        } // ============ 状态查询 ============

        /**
         * 是否正常状态
         */


        isNormal() {
          return this._currentState === CharacterStateType.NORMAL;
        }
        /**
         * 是否被抓状态
         */


        isCaught() {
          return this._currentState === CharacterStateType.CAUGHT;
        }
        /**
         * 是否被挂起状态
         */


        isHanged() {
          return this._currentState === CharacterStateType.HANGED;
        }
        /**
         * 是否被淘汰状态
         */


        isEliminated() {
          return this._currentState === CharacterStateType.ELIMINATED;
        }
        /**
         * 是否正在被救援
         */


        isBeingRescued() {
          return this._isBeingRescued;
        }
        /**
         * 获取救援进度（0-1）
         */


        getRescueProgress() {
          return this._rescueProgress;
        }
        /**
         * 获取挂起剩余时间
         */


        getHangTimeRemaining() {
          return this._hangTimer;
        }
        /**
         * 获取已被挂起次数
         */


        getHangCount() {
          return this._hangCount;
        }
        /**
         * 获取剩余生命（可被挂起次数）
         */


        getRemainingLives() {
          return Math.max(0, this.maxHangCount - this._hangCount);
        }
        /**
         * 是否可以被救援
         */


        canBeRescued() {
          return this._currentState === CharacterStateType.HANGED && !this._isBeingRescued;
        } // ============ 回调系统 ============

        /**
         * 注册状态变化回调
         */


        onStateChange(callback) {
          this._stateChangeCallbacks.push(callback);
        }
        /**
         * 通知状态变化
         */


        notifyStateChange(oldState, newState) {
          for (const callback of this._stateChangeCallbacks) {
            callback(oldState, newState);
          }
        } // ============ 调试功能 ============

        /**
         * 重置状态（用于测试）
         */


        reset() {
          this._currentState = CharacterStateType.NORMAL;
          this._hangCount = 0;
          this._hangTimer = 0;
          this._isHangTimerActive = false;
          this._caughtBy = null;
          this._isBeingRescued = false;
          this._beingRescuedBy = null;
          this._rescueProgress = 0;
          this.node.active = true;
          console.log(`[CharacterState] ${this.node.name} 状态已重置`);
        }
        /**
         * 获取状态详情（调试用）
         */


        getStateInfo() {
          return `状态:${this._currentState}, 挂起次数:${this._hangCount}/${this.maxHangCount}, 剩余时间:${this._hangTimer.toFixed(1)}s, 救援进度:${(this._rescueProgress * 100).toFixed(0)}%`;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "maxHangCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "hangDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 30.0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "rescueDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d231bc6361827e437aec97d067914efab5053749.js.map