System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, NetworkManager, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, PlayerSyncController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfNetworkManager(extras) {
    _reporterNs.report("NetworkManager", "./NetworkManager", _context.meta, extras);
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
    }, function (_unresolved_2) {
      NetworkManager = _unresolved_2.NetworkManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "383a4fNBZNJNpEmiaygWDl/", "PlayerSyncController", undefined); // 文件名: PlayerSyncController.ts
      // 功能: 本地玩家同步控制器 - 将本地玩家数据同步到服务器（任务4.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("PlayerSyncController", PlayerSyncController = (_dec = ccclass('PlayerSyncController'), _dec(_class = (_class2 = class PlayerSyncController extends Component {
        constructor(...args) {
          super(...args);

          // ============ 配置 ============
          _initializerDefineProperty(this, "syncInterval", _descriptor, this);

          // 同步间隔（秒），默认50ms = 20次/秒
          _initializerDefineProperty(this, "positionThreshold", _descriptor2, this);

          // 位置变化阈值（米）
          _initializerDefineProperty(this, "rotationThreshold", _descriptor3, this);

          // 旋转变化阈值（度）
          _initializerDefineProperty(this, "enableDebugLog", _descriptor4, this);

          // 是否启用调试日志
          // 私有成员
          this._networkManager = null;
          this._syncTimer = 0;
          // 上一次发送的状态（用于变化检测）
          this._lastPosition = new Vec3();
          this._lastRotationY = 0;
          this._lastIsMoving = false;
          this._lastAnimationState = "idle";
          // 临时变量（性能优化）
          this._tempPosition = new Vec3();
        }

        start() {
          console.log('[PlayerSyncController] 玩家同步控制器初始化'); // 获取NetworkManager

          this._networkManager = (_crd && NetworkManager === void 0 ? (_reportPossibleCrUseOfNetworkManager({
            error: Error()
          }), NetworkManager) : NetworkManager).getInstance();

          if (!this._networkManager) {
            console.error('[PlayerSyncController] NetworkManager未找到！');
            return;
          } // 检查是否已连接到房间


          if (!this._networkManager.isConnected()) {
            console.warn('[PlayerSyncController] 未连接到房间，同步将在连接后开始');
          } // 初始化上一次状态


          this.node.getPosition(this._lastPosition);
          this._lastRotationY = this.node.eulerAngles.y;
        }

        update(deltaTime) {
          // 检查网络连接
          if (!this._networkManager || !this._networkManager.isConnected()) {
            return;
          } // 累积时间


          this._syncTimer += deltaTime; // 达到同步间隔时发送数据

          if (this._syncTimer >= this.syncInterval) {
            this.syncPlayerState();
            this._syncTimer = 0;
          }
        }
        /**
         * 同步玩家状态到服务器
         */


        syncPlayerState() {
          // 获取当前状态
          this.node.getPosition(this._tempPosition);
          const currentRotationY = this.node.eulerAngles.y; // 检测是否正在移动（通过位置变化判断）

          const positionChanged = Vec3.distance(this._tempPosition, this._lastPosition) > this.positionThreshold;
          const rotationChanged = Math.abs(currentRotationY - this._lastRotationY) > this.rotationThreshold; // 获取动画状态（如果有CharacterAnimationController）

          let animationState = "idle";
          let isMoving = false; // 尝试从PlayerController或其他移动控制器获取移动状态

          const playerController = this.node.getComponent('PlayerController');

          if (playerController && typeof playerController.isMoving === 'function') {
            isMoving = playerController.isMoving();
            animationState = isMoving ? "run" : "idle";
          } else {
            // 如果没有PlayerController，通过位置变化判断
            isMoving = positionChanged;
            animationState = isMoving ? "run" : "idle";
          } // 检查状态是否变化


          const stateChanged = positionChanged || rotationChanged || isMoving !== this._lastIsMoving || animationState !== this._lastAnimationState; // 只在状态变化时发送（节省带宽）

          if (stateChanged) {
            this._networkManager.sendPlayerMove(this._tempPosition.x, this._tempPosition.y, this._tempPosition.z, currentRotationY, isMoving, animationState); // 更新上一次状态


            this._lastPosition.set(this._tempPosition);

            this._lastRotationY = currentRotationY;
            this._lastIsMoving = isMoving;
            this._lastAnimationState = animationState;

            if (this.enableDebugLog) {
              console.log(`[PlayerSyncController] 同步状态: pos(${this._tempPosition.x.toFixed(2)}, ${this._tempPosition.z.toFixed(2)}), rot(${currentRotationY.toFixed(1)}), moving(${isMoving})`);
            }
          }
        }
        /**
         * 强制发送当前状态（供外部调用）
         */


        forceSyncState() {
          if (!this._networkManager || !this._networkManager.isConnected()) {
            return;
          }

          this.node.getPosition(this._tempPosition);
          const currentRotationY = this.node.eulerAngles.y; // 获取移动状态

          let isMoving = false;
          let animationState = "idle";
          const playerController = this.node.getComponent('PlayerController');

          if (playerController && typeof playerController.isMoving === 'function') {
            isMoving = playerController.isMoving();
            animationState = isMoving ? "run" : "idle";
          }

          this._networkManager.sendPlayerMove(this._tempPosition.x, this._tempPosition.y, this._tempPosition.z, currentRotationY, isMoving, animationState);

          console.log('[PlayerSyncController] 强制同步状态');
        }
        /**
         * 设置同步间隔
         */


        setSyncInterval(interval) {
          this.syncInterval = Math.max(0.01, interval); // 最小10ms

          console.log(`[PlayerSyncController] 同步间隔设置为 ${this.syncInterval}s`);
        }
        /**
         * 启用/禁用同步
         */


        setEnabled(enabled) {
          this.enabled = enabled;
          console.log(`[PlayerSyncController] 同步${enabled ? '启用' : '禁用'}`);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "syncInterval", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.05;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "positionThreshold", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.01;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "rotationThreshold", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.0;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "enableDebugLog", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=46c75db0a81d46e9963cb06ce3ae4919cde43cbd.js.map