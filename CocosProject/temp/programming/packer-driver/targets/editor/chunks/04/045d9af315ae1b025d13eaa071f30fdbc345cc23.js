System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _class3, _crd, ccclass, property, NetworkGameManager;

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
      director = _cc.director;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a7b606EvddH5ox8vHRbYWxW", "NetworkGameManager", undefined); // 文件名: NetworkGameManager.ts
      // 功能: 网络游戏管理器 - 统一管理所有网络功能（任务4.1-4.4）
      // 自动在GameScene启动时创建/加入房间，并同步所有游戏状态


      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass,
        property
      } = _decorator); // 声明Colyseus全局对象

      _export("NetworkGameManager", NetworkGameManager = (_dec = ccclass('NetworkGameManager'), _dec(_class = (_class2 = (_class3 = class NetworkGameManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "serverUrl", _descriptor, this);

          _initializerDefineProperty(this, "roomName", _descriptor2, this);

          _initializerDefineProperty(this, "autoCreateRoom", _descriptor3, this);

          // 自动创建房间
          _initializerDefineProperty(this, "playerName", _descriptor4, this);

          // 玩家名称（空则自动生成）
          _initializerDefineProperty(this, "characterType", _descriptor5, this);

          // 角色类型: survivor 或 hunter
          // Colyseus客户端和房间
          this.client = null;
          this.room = null;
          this.localSessionId = '';
        }

        onLoad() {
          // 单例模式
          if (NetworkGameManager._instance) {
            console.warn('[NetworkGameManager] 已存在实例，销毁当前节点');
            this.node.destroy();
            return;
          }

          NetworkGameManager._instance = this; // 跨场景持久化

          director.addPersistRootNode(this.node);
          console.log('[NetworkGameManager] 网络游戏管理器初始化');
        }

        start() {
          // 自动连接并创建房间
          if (this.autoCreateRoom) {
            this.scheduleOnce(() => {
              this.initializeNetwork();
            }, 0.5); // 延迟0.5秒，确保场景加载完成
          }
        }
        /**
         * 初始化网络连接
         */


        async initializeNetwork() {
          try {
            console.log('[NetworkGameManager] 正在初始化网络连接...'); // 创建Colyseus客户端

            if (typeof Colyseus === 'undefined') {
              console.error('[NetworkGameManager] Colyseus未加载！请检查colyseus.js是否正确引入');
              return;
            }

            this.client = new Colyseus.Client(this.serverUrl);
            console.log(`[NetworkGameManager] Colyseus客户端创建成功: ${this.serverUrl}`); // 生成玩家名称

            if (!this.playerName || this.playerName.trim() === '') {
              this.playerName = this.generateRandomName();
            } // 创建房间


            await this.createRoom();
          } catch (error) {
            console.error('[NetworkGameManager] 网络初始化失败:', error);
          }
        }
        /**
         * 创建房间
         */


        async createRoom() {
          try {
            console.log(`[NetworkGameManager] 正在创建房间...`);
            console.log(`[NetworkGameManager] 玩家名称: ${this.playerName}`);
            console.log(`[NetworkGameManager] 角色类型: ${this.characterType}`);
            this.room = await this.client.create(this.roomName, {
              playerName: this.playerName,
              characterType: this.characterType
            });
            this.localSessionId = this.room.sessionId;
            console.log(`[NetworkGameManager] ✅ 房间创建成功！`);
            console.log(`[NetworkGameManager] 房间ID: ${this.room.id}`);
            console.log(`[NetworkGameManager] 会话ID: ${this.localSessionId}`); // 设置房间事件监听

            this.setupRoomEvents();
          } catch (error) {
            console.error('[NetworkGameManager] 创建房间失败:', error);
          }
        }
        /**
         * 加入房间
         */


        async joinRoom(roomId) {
          try {
            console.log(`[NetworkGameManager] 正在加入房间: ${roomId}`);
            this.room = await this.client.joinById(roomId, {
              playerName: this.playerName,
              characterType: this.characterType
            });
            this.localSessionId = this.room.sessionId;
            console.log(`[NetworkGameManager] ✅ 加入房间成功！`);
            console.log(`[NetworkGameManager] 房间ID: ${this.room.id}`);
            console.log(`[NetworkGameManager] 会话ID: ${this.localSessionId}`);
            this.setupRoomEvents();
          } catch (error) {
            console.error('[NetworkGameManager] 加入房间失败:', error);
          }
        }
        /**
         * 设置房间事件监听
         */


        setupRoomEvents() {
          if (!this.room) return; // 玩家加入

          this.room.state.players.onAdd((player, sessionId) => {
            console.log(`[NetworkGameManager] 👤 玩家加入: ${player.name} (${sessionId})`);
            this.onPlayerJoined(player, sessionId);
          }); // 玩家离开

          this.room.state.players.onRemove((player, sessionId) => {
            console.log(`[NetworkGameManager] 👋 玩家离开: ${player.name} (${sessionId})`);
            this.onPlayerLeft(player, sessionId);
          }); // 玩家状态变化

          this.room.state.players.onAdd((player, sessionId) => {
            player.onChange(() => {
              this.onPlayerStateChanged(player, sessionId);
            });
          }); // 监听自定义消息

          this.setupCustomMessages();
        }
        /**
         * 设置自定义消息监听（任务4.2-4.4）
         */


        setupCustomMessages() {
          if (!this.room) return; // 矿石收集事件

          this.room.onMessage('oreCollected', message => {
            console.log('[NetworkGameManager] 📦 矿石被收集:', message);
            this.onOreCollectedNetwork(message);
          }); // 玩家被抓事件

          this.room.onMessage('playerCaptured', message => {
            console.log('[NetworkGameManager] 🎯 玩家被抓:', message);
            this.onPlayerCapturedNetwork(message);
          }); // 玩家被挂起事件

          this.room.onMessage('playerHanged', message => {
            console.log('[NetworkGameManager] 🪝 玩家被挂起:', message);
            this.onPlayerHangedNetwork(message);
          }); // 玩家被救援事件

          this.room.onMessage('playerRescued', message => {
            console.log('[NetworkGameManager] 🆘 玩家被救援:', message);
            this.onPlayerRescuedNetwork(message);
          }); // 玩家逃脱事件

          this.room.onMessage('playerEscaped', message => {
            console.log('[NetworkGameManager] 🚪 玩家逃脱:', message);
            this.onPlayerEscapedNetwork(message);
          }); // 游戏结束事件

          this.room.onMessage('gameOver', message => {
            console.log('[NetworkGameManager] 🏁 游戏结束:', message);
            this.onGameOverNetwork(message);
          });
        } // ============ 网络事件回调 ============


        onPlayerJoined(player, sessionId) {// TODO: 创建远程玩家
        }

        onPlayerLeft(player, sessionId) {// TODO: 销毁远程玩家
        }

        onPlayerStateChanged(player, sessionId) {// TODO: 更新远程玩家状态
        }

        onOreCollectedNetwork(message) {// TODO: 同步矿石收集
        }

        onPlayerCapturedNetwork(message) {// TODO: 同步玩家被抓
        }

        onPlayerHangedNetwork(message) {// TODO: 同步玩家被挂起
        }

        onPlayerRescuedNetwork(message) {// TODO: 同步玩家被救援
        }

        onPlayerEscapedNetwork(message) {// TODO: 同步玩家逃脱
        }

        onGameOverNetwork(message) {// TODO: 同步游戏结束
        } // ============ 发送网络消息 ============

        /**
         * 发送玩家移动
         */


        sendPlayerMove(x, y, z, rotationY, isMoving, animationState) {
          if (!this.room) return;
          this.room.send('playerMove', {
            x,
            y,
            z,
            rotationY,
            isMoving,
            animationState,
            timestamp: Date.now()
          });
        }
        /**
         * 发送矿石收集
         */


        sendOreCollected(oreId) {
          if (!this.room) return;
          this.room.send('oreCollected', {
            oreId,
            sessionId: this.localSessionId,
            timestamp: Date.now()
          });
        }
        /**
         * 发送玩家被抓
         */


        sendPlayerCaptured(targetSessionId) {
          if (!this.room) return;
          this.room.send('playerCaptured', {
            hunterSessionId: this.localSessionId,
            targetSessionId,
            timestamp: Date.now()
          });
        }
        /**
         * 发送玩家被挂起
         */


        sendPlayerHanged(targetSessionId, cageId) {
          if (!this.room) return;
          this.room.send('playerHanged', {
            hunterSessionId: this.localSessionId,
            targetSessionId,
            cageId,
            timestamp: Date.now()
          });
        }
        /**
         * 发送玩家被救援
         */


        sendPlayerRescued(rescuerSessionId, targetSessionId) {
          if (!this.room) return;
          this.room.send('playerRescued', {
            rescuerSessionId,
            targetSessionId,
            timestamp: Date.now()
          });
        }
        /**
         * 发送玩家逃脱
         */


        sendPlayerEscaped(sessionId) {
          if (!this.room) return;
          this.room.send('playerEscaped', {
            sessionId,
            timestamp: Date.now()
          });
        } // ============ 工具方法 ============

        /**
         * 生成随机玩家名称
         */


        generateRandomName() {
          const adjectives = ['快乐', '勇敢', '聪明', '可爱', '神秘', '强大', '灵活', '狡猾'];
          const nouns = ['小猫', '小狗', '小兔', '小熊', '小鸟', '小鱼', '小狼', '小虎'];
          const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
          const noun = nouns[Math.floor(Math.random() * nouns.length)];
          const num = Math.floor(Math.random() * 100);
          return `${adj}的${noun}${num}`;
        }
        /**
         * 获取房间ID
         */


        getRoomId() {
          return this.room ? this.room.id : '';
        }
        /**
         * 获取本地会话ID
         */


        getLocalSessionId() {
          return this.localSessionId;
        }
        /**
         * 是否已连接
         */


        isConnected() {
          return this.room !== null;
        }
        /**
         * 获取玩家数量
         */


        getPlayerCount() {
          return this.room ? this.room.state.players.size : 0;
        } // ============ 单例访问 ============


        static getInstance() {
          return NetworkGameManager._instance;
        }

        onDestroy() {
          if (NetworkGameManager._instance === this) {
            NetworkGameManager._instance = null;
          } // 离开房间


          if (this.room) {
            this.room.leave();
            this.room = null;
          }
        }

      }, _class3._instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "serverUrl", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'ws://localhost:2567';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "roomName", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'game_room';
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "autoCreateRoom", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "playerName", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "characterType", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'survivor';
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=045d9af315ae1b025d13eaa071f30fdbc345cc23.js.map