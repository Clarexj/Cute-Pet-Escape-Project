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
        constructor() {
          super(...arguments);

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
          console.log("[CharacterState] " + this.node.name + " \u521D\u59CB\u72B6\u6001\uFF1A" + this._currentState);
        }

        update(deltaTime) {
          // 处理挂起倒计时
          if (this._isHangTimerActive && this._currentState === CharacterStateType.HANGED) {
            this._hangTimer -= deltaTime;

            if (this._hangTimer <= 0) {
              // 倒计时结束，淘汰
              console.log("[CharacterState] " + this.node.name + " \u6302\u8D77\u5012\u8BA1\u65F6\u7ED3\u675F\uFF0C\u6DD8\u6C70");
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
            console.warn("[CharacterState] " + this.node.name + " \u4E0D\u662F\u6B63\u5E38\u72B6\u6001\uFF0C\u65E0\u6CD5\u88AB\u6293");
            return;
          }

          var oldState = this._currentState;
          this._currentState = CharacterStateType.CAUGHT;
          this._caughtBy = hunter;
          console.log("[CharacterState] " + this.node.name + " \u88AB " + hunter.name + " \u6293\u4F4F");
          this.notifyStateChange(oldState, this._currentState);
        }
        /**
         * 设置被挂起状态
         */


        setHanged() {
          if (this._currentState !== CharacterStateType.CAUGHT) {
            console.warn("[CharacterState] " + this.node.name + " \u4E0D\u662F\u88AB\u6293\u72B6\u6001\uFF0C\u65E0\u6CD5\u88AB\u6302\u8D77");
            return;
          }

          this._hangCount++;
          this._caughtBy = null; // ✅ 检查是否超过最大挂起次数

          if (this._hangCount > this.maxHangCount) {
            console.log("[CharacterState] " + this.node.name + " \u6302\u8D77\u6B21\u6570\u8D85\u9650\uFF08" + this._hangCount + "/" + this.maxHangCount + "\uFF09\uFF0C\u7ACB\u5373\u6DD8\u6C70");
            this.eliminate();
            return;
          }

          var oldState = this._currentState;
          this._currentState = CharacterStateType.HANGED; // 启动挂起倒计时

          this._hangTimer = this.hangDuration;
          this._isHangTimerActive = true;
          console.log("[CharacterState] " + this.node.name + " \u88AB\u6302\u8D77\uFF08\u7B2C" + this._hangCount + "\u6B21/" + this.maxHangCount + "\u6B21\uFF09\uFF0C\u5012\u8BA1\u65F6" + this.hangDuration + "\u79D2");
          this.notifyStateChange(oldState, this._currentState);
        }
        /**
         * 开始救援
         * @param rescuer 救援者节点
         */


        startRescue(rescuer) {
          if (this._currentState !== CharacterStateType.HANGED) {
            console.warn("[CharacterState] " + this.node.name + " \u4E0D\u662F\u88AB\u6302\u8D77\u72B6\u6001\uFF0C\u65E0\u6CD5\u6551\u63F4");
            return false;
          }

          if (this._isBeingRescued) {
            console.warn("[CharacterState] " + this.node.name + " \u5DF2\u7ECF\u5728\u88AB\u6551\u63F4\u4E2D");
            return false;
          }

          this._isBeingRescued = true;
          this._beingRescuedBy = rescuer;
          this._rescueProgress = 0;
          console.log("[CharacterState] " + rescuer.name + " \u5F00\u59CB\u6551\u63F4 " + this.node.name);
          return true;
        }
        /**
         * 中断救援
         */


        cancelRescue() {
          if (!this._isBeingRescued) return;
          console.log("[CharacterState] " + this.node.name + " \u7684\u6551\u63F4\u88AB\u4E2D\u65AD\uFF08\u8FDB\u5EA6" + (this._rescueProgress * 100).toFixed(0) + "%\uFF09");
          this._isBeingRescued = false;
          this._beingRescuedBy = null;
          this._rescueProgress = 0;
        }
        /**
         * 救援完成
         */


        onRescueComplete() {
          if (!this._isBeingRescued) return;
          var rescuer = this._beingRescuedBy;
          console.log("[CharacterState] " + (rescuer == null ? void 0 : rescuer.name) + " \u6210\u529F\u6551\u63F4 " + this.node.name);
          var oldState = this._currentState;
          this._currentState = CharacterStateType.NORMAL;
          this._isHangTimerActive = false;
          this._isBeingRescued = false;
          this._beingRescuedBy = null;
          this._rescueProgress = 0; // 解锁救援者的移动

          if (rescuer) {
            var rescuerController = rescuer.getComponent('PlayerController');

            if (rescuerController && typeof rescuerController.setMovementLocked === 'function') {
              rescuerController.setMovementLocked(false);
            }
          } // 将被救的逃生者从笼子上移回场景


          this.node.setParent(this.node.scene);
          var currentPos = this.node.worldPosition;
          this.node.setWorldPosition(currentPos.x, 0, currentPos.z); // 放回地面

          this.notifyStateChange(oldState, this._currentState);
        }
        /**
         * 淘汰
         */


        eliminate() {
          var oldState = this._currentState;
          this._currentState = CharacterStateType.ELIMINATED;
          this._isHangTimerActive = false;
          this._isBeingRescued = false;
          console.log("[CharacterState] " + this.node.name + " \u88AB\u6DD8\u6C70");
          this.notifyStateChange(oldState, this._currentState); // 隐藏节点（不销毁，方便调试）

          this.node.active = false;
        }
        /**
         * 强制设置状态为正常（用于救援成功或重置）
         */


        setNormal() {
          if (this._currentState === CharacterStateType.ELIMINATED) {
            console.warn("[CharacterState] " + this.node.name + " \u5DF2\u88AB\u6DD8\u6C70\uFF0C\u65E0\u6CD5\u6062\u590D\u6B63\u5E38\u72B6\u6001");
            return;
          }

          var oldState = this._currentState;
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
          for (var callback of this._stateChangeCallbacks) {
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
          console.log("[CharacterState] " + this.node.name + " \u72B6\u6001\u5DF2\u91CD\u7F6E");
        }
        /**
         * 获取状态详情（调试用）
         */


        getStateInfo() {
          return "\u72B6\u6001:" + this._currentState + ", \u6302\u8D77\u6B21\u6570:" + this._hangCount + "/" + this.maxHangCount + ", \u5269\u4F59\u65F6\u95F4:" + this._hangTimer.toFixed(1) + "s, \u6551\u63F4\u8FDB\u5EA6:" + (this._rescueProgress * 100).toFixed(0) + "%";
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "maxHangCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "hangDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 30.0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "rescueDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d231bc6361827e437aec97d067914efab5053749.js.map