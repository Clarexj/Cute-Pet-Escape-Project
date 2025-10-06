System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _class3, _crd, ccclass, property, NetworkManager;

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

      _cclegacy._RF.push({}, "f08f6X4o19PBbR952gL7LUw", "NetworkManager", undefined); // 文件名: NetworkManager.ts
      // 功能: 网络管理器 - 连接Colyseus服务器（任务4.1）
      // 处理房间创建、加入、连接管理
      // 声明全局Colyseus对象（从colyseus.js插件）


      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 玩家数据接口
       */

      /**
       * 房间状态接口
       */

      /**
       * 网络事件回调类型
       */

      _export("NetworkManager", NetworkManager = (_dec = ccclass('NetworkManager'), _dec(_class = (_class2 = (_class3 = class NetworkManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "serverUrl", _descriptor, this);

          // 服务器地址
          _initializerDefineProperty(this, "autoConnect", _descriptor2, this);

          // 是否自动连接（调试用）
          _initializerDefineProperty(this, "enableDebugLog", _descriptor3, this);

          // 是否启用调试日志
          // Colyseus客户端
          this._client = null;
          // 当前房间
          this._room = null;
          // 本地玩家会话ID
          this._localSessionId = "";
          // 事件回调
          this._eventCallbacks = new Map();
        }

        onLoad() {
          // 实现单例模式
          if (NetworkManager._instance) {
            console.warn('[NetworkManager] 已存在实例，销毁当前节点');
            this.node.destroy();
            return;
          }

          NetworkManager._instance = this; // 跨场景持久化（Cocos Creator 3.x API）

          director.addPersistRootNode(this.node);
          console.log('[NetworkManager] 网络管理器初始化，已设置为跨场景持久化');
        }

        start() {
          console.log('[NetworkManager] 网络管理器初始化'); // 创建Colyseus客户端

          this._client = new Colyseus.Client(this.serverUrl);

          if (this.autoConnect) {
            this.createRoom("TestPlayer");
          }
        }
        /**
         * 获取单例实例
         */


        static getInstance() {
          return NetworkManager._instance;
        } // ============ 房间管理 ============

        /**
         * 创建房间
         */


        async createRoom(playerName) {
          if (!this._client) {
            console.error('[NetworkManager] 客户端未初始化');
            return false;
          }

          try {
            console.log('[NetworkManager] 创建房间...');
            this._room = await this._client.create("game_room", {
              playerName: playerName
            });
            this._localSessionId = this._room.sessionId;
            console.log(`[NetworkManager] 房间创建成功！房间ID: ${this._room.roomId}`);
            console.log(`[NetworkManager] 本地玩家ID: ${this._localSessionId}`);
            this.setupRoomHandlers();
            this.emit('roomCreated', this._room.roomId);
            return true;
          } catch (error) {
            console.error('[NetworkManager] 创建房间失败:', error);
            this.emit('error', {
              type: 'createRoom',
              message: error.message
            });
            return false;
          }
        }
        /**
         * 加入房间（通过房间ID）
         */


        async joinRoom(roomId, playerName) {
          if (!this._client) {
            console.error('[NetworkManager] 客户端未初始化');
            return false;
          }

          try {
            console.log(`[NetworkManager] 加入房间: ${roomId}...`);
            this._room = await this._client.joinById(roomId, {
              playerName: playerName
            });
            this._localSessionId = this._room.sessionId;
            console.log(`[NetworkManager] 成功加入房间！房间ID: ${this._room.roomId}`);
            console.log(`[NetworkManager] 本地玩家ID: ${this._localSessionId}`);
            this.setupRoomHandlers();
            this.emit('roomJoined', this._room.roomId);
            return true;
          } catch (error) {
            console.error('[NetworkManager] 加入房间失败:', error);
            this.emit('error', {
              type: 'joinRoom',
              message: error.message
            });
            return false;
          }
        }
        /**
         * 离开房间
         */


        async leaveRoom() {
          if (!this._room) {
            console.warn('[NetworkManager] 没有活跃的房间连接');
            return;
          }

          try {
            console.log('[NetworkManager] 离开房间...');
            await this._room.leave();
            this._room = null;
            this._localSessionId = "";
            this.emit('roomLeft');
          } catch (error) {
            console.error('[NetworkManager] 离开房间失败:', error);
          }
        }
        /**
         * 设置房间事件处理器
         */


        setupRoomHandlers() {
          if (!this._room) return; // 监听状态变化

          this._room.onStateChange(state => {
            if (this.enableDebugLog) {
              console.log('[NetworkManager] 房间状态更新');
            }

            this.emit('stateChange', state);
          }); // 监听玩家加入


          this._room.state.players.onAdd((player, sessionId) => {
            console.log(`[NetworkManager] 玩家加入: ${sessionId}`);
            this.emit('playerAdded', {
              sessionId,
              player
            });
          }); // 监听玩家离开


          this._room.state.players.onRemove((player, sessionId) => {
            console.log(`[NetworkManager] 玩家离开: ${sessionId}`);
            this.emit('playerRemoved', {
              sessionId,
              player
            });
          }); // 监听玩家属性变化


          this._room.state.players.onChange((player, sessionId) => {
            if (sessionId !== this._localSessionId) {
              // 只处理远程玩家的变化
              this.emit('playerChanged', {
                sessionId,
                player
              });
            }
          }); // 监听服务器消息


          this._room.onMessage("welcome", message => {
            console.log('[NetworkManager] 收到欢迎消息:', message);
            this.emit('welcome', message);
          }); // 监听错误


          this._room.onError((code, message) => {
            console.error(`[NetworkManager] 房间错误 [${code}]: ${message}`);
            this.emit('error', {
              type: 'room',
              code,
              message
            });
          }); // 监听连接关闭


          this._room.onLeave(code => {
            console.log(`[NetworkManager] 连接关闭 [${code}]`);
            this.emit('disconnected', code);
          });
        } // ============ 消息发送 ============

        /**
         * 发送玩家移动消息
         */


        sendPlayerMove(x, y, z, rotationY, isMoving, animationState) {
          if (!this._room) {
            console.warn('[NetworkManager] 没有活跃的房间连接');
            return;
          }

          this._room.send("playerMove", {
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
         * 设置玩家名称
         */


        sendSetPlayerName(name) {
          if (!this._room) {
            console.warn('[NetworkManager] 没有活跃的房间连接');
            return;
          }

          this._room.send("setPlayerName", name);
        } // ============ 事件系统 ============

        /**
         * 注册事件监听
         */


        on(eventName, callback) {
          if (!this._eventCallbacks.has(eventName)) {
            this._eventCallbacks.set(eventName, []);
          }

          this._eventCallbacks.get(eventName).push(callback);
        }
        /**
         * 取消事件监听
         */


        off(eventName, callback) {
          const callbacks = this._eventCallbacks.get(eventName);

          if (!callbacks) return;
          const index = callbacks.indexOf(callback);

          if (index !== -1) {
            callbacks.splice(index, 1);
          }
        }
        /**
         * 触发事件
         */


        emit(eventName, ...args) {
          const callbacks = this._eventCallbacks.get(eventName);

          if (!callbacks) return;

          for (const callback of callbacks) {
            callback(...args);
          }
        } // ============ 查询接口 ============

        /**
         * 获取当前房间
         */


        getRoom() {
          return this._room;
        }
        /**
         * 获取房间ID
         */


        getRoomId() {
          return this._room ? this._room.roomId : "";
        }
        /**
         * 获取本地玩家会话ID
         */


        getLocalSessionId() {
          return this._localSessionId;
        }
        /**
         * 是否已连接到房间
         */


        isConnected() {
          return this._room !== null;
        }
        /**
         * 获取所有玩家数据
         */


        getAllPlayers() {
          if (!this._room) return new Map();
          return this._room.state.players;
        }
        /**
         * 获取玩家数量
         */


        getPlayerCount() {
          if (!this._room) return 0;
          return this._room.state.players.size;
        }

        onDestroy() {
          // 离开房间
          if (this._room) {
            this._room.leave();
          } // 清理单例


          if (NetworkManager._instance === this) {
            NetworkManager._instance = null;
          }
        }

      }, _class3._instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "serverUrl", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return "ws://localhost:2567";
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "autoConnect", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
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
//# sourceMappingURL=e315743c8a27741f9b866a2709ed8cbfdf823f4d.js.map