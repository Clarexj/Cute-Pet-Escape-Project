System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Prefab, instantiate, Vec3, NetworkManager, RemotePlayerController, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, RemotePlayerManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfNetworkManager(extras) {
    _reporterNs.report("NetworkManager", "./NetworkManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerData(extras) {
    _reporterNs.report("PlayerData", "./NetworkManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRemotePlayerController(extras) {
    _reporterNs.report("RemotePlayerController", "./RemotePlayerController", _context.meta, extras);
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
      Prefab = _cc.Prefab;
      instantiate = _cc.instantiate;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      NetworkManager = _unresolved_2.NetworkManager;
    }, function (_unresolved_3) {
      RemotePlayerController = _unresolved_3.RemotePlayerController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c90a6dMYT5BLrpM/RObSeC0", "RemotePlayerManager", undefined); // 文件名: RemotePlayerManager.ts
      // 功能: 远程玩家管理器 - 管理所有远程玩家的创建和销毁（任务4.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'instantiate', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("RemotePlayerManager", RemotePlayerManager = (_dec = ccclass('RemotePlayerManager'), _dec2 = property(Prefab), _dec3 = property(Node), _dec(_class = (_class2 = class RemotePlayerManager extends Component {
        constructor(...args) {
          super(...args);

          // ============ 配置 ============
          _initializerDefineProperty(this, "remotePlayerPrefab", _descriptor, this);

          // 远程玩家预制体
          _initializerDefineProperty(this, "playersContainer", _descriptor2, this);

          // 玩家容器节点（可选）
          _initializerDefineProperty(this, "enableDebugLog", _descriptor3, this);

          // 是否启用调试日志
          // 私有成员
          this._networkManager = null;
          this._remotePlayers = new Map();
        }

        // sessionId -> 玩家节点
        start() {
          console.log('[RemotePlayerManager] 远程玩家管理器初始化'); // 获取NetworkManager

          this._networkManager = (_crd && NetworkManager === void 0 ? (_reportPossibleCrUseOfNetworkManager({
            error: Error()
          }), NetworkManager) : NetworkManager).getInstance();

          if (!this._networkManager) {
            console.error('[RemotePlayerManager] NetworkManager未找到！');
            return;
          } // 检查预制体


          if (!this.remotePlayerPrefab) {
            console.error('[RemotePlayerManager] 远程玩家预制体未设置！');
            return;
          } // 注册网络事件


          this.setupNetworkEvents(); // 创建已存在的玩家（加入房间时房间内已有的玩家）

          this.createExistingPlayers();
        }
        /**
         * 设置网络事件
         */


        setupNetworkEvents() {
          if (!this._networkManager) return; // 监听玩家加入

          this._networkManager.on('playerAdded', data => {
            this.onPlayerAdded(data.sessionId, data.player);
          }); // 监听玩家离开


          this._networkManager.on('playerRemoved', data => {
            this.onPlayerRemoved(data.sessionId);
          }); // 监听玩家状态变化


          this._networkManager.on('playerChanged', data => {
            this.onPlayerChanged(data.sessionId, data.player);
          });
        }
        /**
         * 创建已存在的玩家
         */


        createExistingPlayers() {
          if (!this._networkManager) return;

          const allPlayers = this._networkManager.getAllPlayers();

          const localSessionId = this._networkManager.getLocalSessionId();

          console.log(`[RemotePlayerManager] 当前房间有 ${allPlayers.size} 个玩家`);
          allPlayers.forEach((playerData, sessionId) => {
            // 跳过本地玩家
            if (sessionId === localSessionId) {
              console.log(`[RemotePlayerManager] 跳过本地玩家: ${sessionId}`);
              return;
            } // 创建远程玩家


            this.createRemotePlayer(sessionId, playerData);
          });
        }
        /**
         * 玩家加入事件
         */


        onPlayerAdded(sessionId, playerData) {
          // 跳过本地玩家
          if (sessionId === this._networkManager.getLocalSessionId()) {
            console.log(`[RemotePlayerManager] 本地玩家加入，跳过创建: ${sessionId}`);
            return;
          }

          console.log(`[RemotePlayerManager] 新玩家加入: ${sessionId}`);
          this.createRemotePlayer(sessionId, playerData);
        }
        /**
         * 玩家离开事件
         */


        onPlayerRemoved(sessionId) {
          console.log(`[RemotePlayerManager] 玩家离开: ${sessionId}`);
          this.destroyRemotePlayer(sessionId);
        }
        /**
         * 玩家状态变化事件
         */


        onPlayerChanged(sessionId, playerData) {
          const playerNode = this._remotePlayers.get(sessionId);

          if (!playerNode) {
            console.warn(`[RemotePlayerManager] 玩家节点不存在: ${sessionId}`);
            return;
          } // 更新远程玩家状态


          const remoteController = playerNode.getComponent(_crd && RemotePlayerController === void 0 ? (_reportPossibleCrUseOfRemotePlayerController({
            error: Error()
          }), RemotePlayerController) : RemotePlayerController);

          if (remoteController) {
            remoteController.updatePlayerState(playerData);
          }
        }
        /**
         * 创建远程玩家
         */


        createRemotePlayer(sessionId, playerData) {
          // 检查是否已存在
          if (this._remotePlayers.has(sessionId)) {
            console.warn(`[RemotePlayerManager] 玩家已存在: ${sessionId}`);
            return;
          } // 实例化预制体


          const playerNode = instantiate(this.remotePlayerPrefab);
          playerNode.name = `RemotePlayer_${playerData.name}_${sessionId.substring(0, 4)}`; // 设置父节点

          if (this.playersContainer) {
            playerNode.setParent(this.playersContainer);
          } else {
            playerNode.setParent(this.node.scene);
          } // 设置初始位置


          playerNode.setPosition(new Vec3(playerData.x, playerData.y, playerData.z));
          playerNode.setRotationFromEuler(0, playerData.rotationY, 0); // 获取或添加RemotePlayerController组件

          let remoteController = playerNode.getComponent(_crd && RemotePlayerController === void 0 ? (_reportPossibleCrUseOfRemotePlayerController({
            error: Error()
          }), RemotePlayerController) : RemotePlayerController);

          if (!remoteController) {
            remoteController = playerNode.addComponent(_crd && RemotePlayerController === void 0 ? (_reportPossibleCrUseOfRemotePlayerController({
              error: Error()
            }), RemotePlayerController) : RemotePlayerController);
          } // 初始化远程玩家控制器


          remoteController.initialize(sessionId, playerData); // 保存引用

          this._remotePlayers.set(sessionId, playerNode);

          console.log(`[RemotePlayerManager] 创建远程玩家成功: ${playerData.name} (${sessionId})`);

          if (this.enableDebugLog) {
            console.log(`[RemotePlayerManager] 当前远程玩家数: ${this._remotePlayers.size}`);
          }
        }
        /**
         * 销毁远程玩家
         */


        destroyRemotePlayer(sessionId) {
          const playerNode = this._remotePlayers.get(sessionId);

          if (!playerNode) {
            console.warn(`[RemotePlayerManager] 玩家节点不存在: ${sessionId}`);
            return;
          } // 销毁节点


          playerNode.destroy(); // 移除引用

          this._remotePlayers.delete(sessionId);

          console.log(`[RemotePlayerManager] 销毁远程玩家: ${sessionId}`);

          if (this.enableDebugLog) {
            console.log(`[RemotePlayerManager] 当前远程玩家数: ${this._remotePlayers.size}`);
          }
        }
        /**
         * 获取所有远程玩家节点
         */


        getAllRemotePlayers() {
          return this._remotePlayers;
        }
        /**
         * 获取远程玩家数量
         */


        getRemotePlayerCount() {
          return this._remotePlayers.size;
        }
        /**
         * 获取指定远程玩家节点
         */


        getRemotePlayer(sessionId) {
          return this._remotePlayers.get(sessionId) || null;
        }

        onDestroy() {
          // 销毁所有远程玩家
          this._remotePlayers.forEach(playerNode => {
            if (playerNode && playerNode.isValid) {
              playerNode.destroy();
            }
          });

          this._remotePlayers.clear();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "remotePlayerPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playersContainer", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "enableDebugLog", [property], {
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
//# sourceMappingURL=8337e0bf0d1e651b8f7ab9c509a9e738118e2ec1.js.map