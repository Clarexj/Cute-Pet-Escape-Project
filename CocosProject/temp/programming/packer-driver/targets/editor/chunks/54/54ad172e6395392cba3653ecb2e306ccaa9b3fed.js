System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, AnimationComponent, AnimationClip, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, AnimationState, CharacterType, CharacterAnimationController;

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
      AnimationComponent = _cc.AnimationComponent;
      AnimationClip = _cc.AnimationClip;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "80954DH2S9IOJmPXqDD2kAG", "CharacterAnimationController", undefined); // 文件名: CharacterAnimationController.ts
      // 功能：角色动画控制器（任务3.1）
      // 支持逃生者和追捕者的动画状态管理


      __checkObsolete__(['_decorator', 'Component', 'Node', 'AnimationComponent', 'AnimationClip']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 动画状态枚举
       */

      _export("AnimationState", AnimationState = /*#__PURE__*/function (AnimationState) {
        AnimationState["IDLE"] = "idle";
        AnimationState["RUN"] = "run";
        AnimationState["ATTACK"] = "attack";
        return AnimationState;
      }({}));
      /**
       * 角色类型枚举
       */


      _export("CharacterType", CharacterType = /*#__PURE__*/function (CharacterType) {
        CharacterType["SURVIVOR"] = "survivor";
        CharacterType["HUNTER"] = "hunter";
        return CharacterType;
      }({}));

      _export("CharacterAnimationController", CharacterAnimationController = (_dec = ccclass('CharacterAnimationController'), _dec2 = property({
        type: AnimationComponent
      }), _dec3 = property({
        type: AnimationClip
      }), _dec4 = property({
        type: AnimationClip
      }), _dec5 = property({
        type: AnimationClip
      }), _dec(_class = (_class2 = class CharacterAnimationController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "animationComponent", _descriptor, this);

          // 动画组件引用
          _initializerDefineProperty(this, "idleClip", _descriptor2, this);

          // idle动画剪辑
          _initializerDefineProperty(this, "runClip", _descriptor3, this);

          // run动画剪辑
          _initializerDefineProperty(this, "attackClip", _descriptor4, this);

          // attack动画剪辑（可选，追捕者用）
          _initializerDefineProperty(this, "characterType", _descriptor5, this);

          // 角色类型
          _initializerDefineProperty(this, "crossFadeDuration", _descriptor6, this);

          // 动画过渡时长（秒）
          _initializerDefineProperty(this, "attackAnimationDuration", _descriptor7, this);

          // 攻击动画时长（秒）
          _initializerDefineProperty(this, "autoFindAnimation", _descriptor8, this);

          // 自动查找动画组件
          this._currentState = AnimationState.IDLE;
          // 当前动画状态
          this._isAttacking = false;
        }

        // 是否正在攻击中
        start() {
          // 自动查找动画组件
          if (this.autoFindAnimation && !this.animationComponent) {
            this.animationComponent = this.node.getComponent(AnimationComponent);

            if (!this.animationComponent) {
              console.error('[CharacterAnimationController] 未找到AnimationComponent组件！');
              return;
            }
          } // 验证必需的动画剪辑


          if (!this.idleClip) {
            console.warn('[CharacterAnimationController] 缺少idle动画剪辑！');
          }

          if (!this.runClip) {
            console.warn('[CharacterAnimationController] 缺少run动画剪辑！');
          } // ✅ 任务3.1 Bug修复：自动获取攻击动画时长


          if (this.attackClip && this.characterType === CharacterType.HUNTER) {
            this.attackAnimationDuration = this.attackClip.duration;
            console.log(`[CharacterAnimationController] 自动检测攻击动画时长：${this.attackAnimationDuration.toFixed(2)}s`);
          } // 播放初始动画


          this.playIdle();
          console.log(`[CharacterAnimationController] ${this.characterType} 动画控制器初始化完成`);
        } // ============ 动画播放接口 ============

        /**
         * 播放待机动画
         */


        playIdle() {
          if (this._isAttacking) return; // 攻击中不切换

          if (this._currentState === AnimationState.IDLE) return; // 已经是待机状态

          this._currentState = AnimationState.IDLE;
          this.crossFadeToClip(this.idleClip, 'idle');
        }
        /**
         * 播放跑步动画
         */


        playRun() {
          if (this._isAttacking) return; // 攻击中不切换

          if (this._currentState === AnimationState.RUN) return; // 已经是跑步状态

          this._currentState = AnimationState.RUN;
          this.crossFadeToClip(this.runClip, 'run');
        }
        /**
         * 播放攻击动画（仅追捕者）
         */


        playAttack() {
          if (this.characterType !== CharacterType.HUNTER) {
            console.warn('[CharacterAnimationController] 只有追捕者才能播放攻击动画');
            return;
          }

          if (!this.attackClip) {
            console.error('[CharacterAnimationController] 缺少attack动画剪辑！');
            return;
          }

          if (this._isAttacking) {
            console.log('[CharacterAnimationController] 攻击动画正在播放中，跳过');
            return;
          }

          console.log('[CharacterAnimationController] 播放攻击动画');
          this._isAttacking = true;
          this._currentState = AnimationState.ATTACK; // 播放攻击动画（不循环）

          if (this.animationComponent) {
            this.animationComponent.crossFade(this.attackClip.name, this.crossFadeDuration); // 攻击动画播放完后自动切换回待机

            this.scheduleOnce(() => {
              this._isAttacking = false;
              this.playIdle();
            }, this.attackAnimationDuration);
          }
        }
        /**
         * 根据移动状态自动切换动画
         * @param isMoving 是否正在移动
         */


        updateMovementAnimation(isMoving) {
          if (isMoving) {
            this.playRun();
          } else {
            this.playIdle();
          }
        } // ============ 内部方法 ============

        /**
         * 交叉淡入淡出到指定动画剪辑
         */


        crossFadeToClip(clip, clipName) {
          if (!this.animationComponent) {
            console.error('[CharacterAnimationController] animationComponent未绑定！');
            return;
          }

          if (!clip) {
            console.error(`[CharacterAnimationController] ${clipName}动画剪辑未绑定！`);
            return;
          } // 使用crossFade实现平滑过渡


          this.animationComponent.crossFade(clip.name, this.crossFadeDuration); // console.log(`[CharacterAnimationController] 切换到 ${clipName} 动画`);
        } // ============ 查询接口 ============

        /**
         * 获取当前动画状态
         */


        getCurrentState() {
          return this._currentState;
        }
        /**
         * 是否正在攻击中
         */


        isAttacking() {
          return this._isAttacking;
        }
        /**
         * 是否正在播放指定动画
         */


        isPlaying(state) {
          return this._currentState === state;
        } // ============ 调试功能 ============

        /**
         * 获取动画状态信息（调试用）
         */


        getAnimationInfo() {
          return `状态:${this._currentState}, 攻击中:${this._isAttacking}, 类型:${this.characterType}`;
        }
        /**
         * 强制切换到指定状态（调试用）
         */


        forceSetState(state) {
          this._currentState = state;

          switch (state) {
            case AnimationState.IDLE:
              this.crossFadeToClip(this.idleClip, 'idle');
              break;

            case AnimationState.RUN:
              this.crossFadeToClip(this.runClip, 'run');
              break;

            case AnimationState.ATTACK:
              if (this.attackClip) {
                this.crossFadeToClip(this.attackClip, 'attack');
              }

              break;
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "animationComponent", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "idleClip", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "runClip", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "attackClip", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "characterType", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return CharacterType.SURVIVOR;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "crossFadeDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.2;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "attackAnimationDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.0;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "autoFindAnimation", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=54ad172e6395392cba3653ecb2e306ccaa9b3fed.js.map