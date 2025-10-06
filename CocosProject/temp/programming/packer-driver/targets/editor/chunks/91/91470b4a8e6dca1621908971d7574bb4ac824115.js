System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, EditBox, Button, director, Color, NetworkManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, LobbyUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfNetworkManager(extras) {
    _reporterNs.report("NetworkManager", "../network/NetworkManager", _context.meta, extras);
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
      Label = _cc.Label;
      EditBox = _cc.EditBox;
      Button = _cc.Button;
      director = _cc.director;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      NetworkManager = _unresolved_2.NetworkManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "92152cnZfhJGr0U7BNELS5T", "LobbyUI", undefined); // 文件名: LobbyUI.ts
      // 功能: 大厅UI - 创建/加入房间（任务4.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'EditBox', 'Button', 'director', 'Color']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("LobbyUI", LobbyUI = (_dec = ccclass('LobbyUI'), _dec2 = property(EditBox), _dec3 = property(EditBox), _dec4 = property(Button), _dec5 = property(Button), _dec6 = property(Label), _dec7 = property(Node), _dec(_class = (_class2 = class LobbyUI extends Component {
        constructor(...args) {
          super(...args);

          // ============ UI元素 ============
          _initializerDefineProperty(this, "playerNameInput", _descriptor, this);

          // 玩家名称输入框
          _initializerDefineProperty(this, "roomIdInput", _descriptor2, this);

          // 房间ID输入框
          _initializerDefineProperty(this, "createRoomButton", _descriptor3, this);

          // 创建房间按钮
          _initializerDefineProperty(this, "joinRoomButton", _descriptor4, this);

          // 加入房间按钮
          _initializerDefineProperty(this, "statusLabel", _descriptor5, this);

          // 状态提示Label
          _initializerDefineProperty(this, "loadingPanel", _descriptor6, this);

          // 加载中面板（可选）
          // ============ 配置 ============
          _initializerDefineProperty(this, "gameSceneName", _descriptor7, this);

          // 游戏场景名称
          _initializerDefineProperty(this, "defaultPlayerName", _descriptor8, this);

          // 默认玩家名称
          // 私有成员
          this._networkManager = null;
          this._isConnecting = false;
        }

        start() {
          console.log('[LobbyUI] 大厅UI初始化'); // 获取NetworkManager

          this._networkManager = (_crd && NetworkManager === void 0 ? (_reportPossibleCrUseOfNetworkManager({
            error: Error()
          }), NetworkManager) : NetworkManager).getInstance();

          if (!this._networkManager) {
            console.error('[LobbyUI] NetworkManager未找到！');
            this.showStatus('网络管理器未初始化', true);
            return;
          } // 绑定按钮事件


          this.setupButtons(); // 注册网络事件

          this.setupNetworkEvents(); // 隐藏加载面板

          if (this.loadingPanel) {
            this.loadingPanel.active = false;
          } // 设置默认玩家名称


          if (this.playerNameInput) {
            this.playerNameInput.string = this.generateRandomName();
          }

          this.showStatus('请输入玩家名称并创建或加入房间', false);
        }
        /**
         * 设置按钮事件
         */


        setupButtons() {
          if (this.createRoomButton) {
            this.createRoomButton.node.on(Button.EventType.CLICK, this.onCreateRoomClick, this);
          }

          if (this.joinRoomButton) {
            this.joinRoomButton.node.on(Button.EventType.CLICK, this.onJoinRoomClick, this);
          }
        }
        /**
         * 设置网络事件
         */


        setupNetworkEvents() {
          if (!this._networkManager) return; // 房间创建成功

          this._networkManager.on('roomCreated', roomId => {
            this.onRoomReady(roomId);
          }); // 房间加入成功


          this._networkManager.on('roomJoined', roomId => {
            this.onRoomReady(roomId);
          }); // 错误处理


          this._networkManager.on('error', error => {
            this.onNetworkError(error);
          });
        }
        /**
         * 创建房间按钮点击
         */


        async onCreateRoomClick() {
          if (this._isConnecting) {
            console.log('[LobbyUI] 正在连接中，请稍候...');
            return;
          }

          const playerName = this.getPlayerName();

          if (!playerName) {
            this.showStatus('请输入玩家名称', true);
            return;
          }

          this._isConnecting = true;
          this.setButtonsEnabled(false);
          this.showLoading(true);
          this.showStatus('正在创建房间...', false);
          const success = await this._networkManager.createRoom(playerName);

          if (!success) {
            this._isConnecting = false;
            this.setButtonsEnabled(true);
            this.showLoading(false);
            this.showStatus('创建房间失败，请重试', true);
          }
        }
        /**
         * 加入房间按钮点击
         */


        async onJoinRoomClick() {
          if (this._isConnecting) {
            console.log('[LobbyUI] 正在连接中，请稍候...');
            return;
          }

          const playerName = this.getPlayerName();
          const roomId = this.getRoomId();

          if (!playerName) {
            this.showStatus('请输入玩家名称', true);
            return;
          }

          if (!roomId) {
            this.showStatus('请输入房间ID', true);
            return;
          }

          this._isConnecting = true;
          this.setButtonsEnabled(false);
          this.showLoading(true);
          this.showStatus(`正在加入房间 ${roomId}...`, false);
          const success = await this._networkManager.joinRoom(roomId, playerName);

          if (!success) {
            this._isConnecting = false;
            this.setButtonsEnabled(true);
            this.showLoading(false);
            this.showStatus('加入房间失败，请检查房间ID', true);
          }
        }
        /**
         * 房间准备就绪
         */


        onRoomReady(roomId) {
          console.log(`[LobbyUI] 房间准备就绪: ${roomId}`);
          this.showStatus(`成功连接到房间 ${roomId}`, false); // 延迟1秒后切换到游戏场景

          this.scheduleOnce(() => {
            this.loadGameScene();
          }, 1.0);
        }
        /**
         * 网络错误处理
         */


        onNetworkError(error) {
          console.error('[LobbyUI] 网络错误:', error);
          this._isConnecting = false;
          this.setButtonsEnabled(true);
          this.showLoading(false);
          let message = '网络错误';

          if (error.type === 'createRoom') {
            message = '创建房间失败: ' + error.message;
          } else if (error.type === 'joinRoom') {
            message = '加入房间失败: ' + error.message;
          }

          this.showStatus(message, true);
        }
        /**
         * 加载游戏场景
         */


        loadGameScene() {
          console.log(`[LobbyUI] 加载游戏场景: ${this.gameSceneName}`);
          director.loadScene(this.gameSceneName, error => {
            if (error) {
              console.error('[LobbyUI] 加载场景失败:', error);
              this.showStatus('加载游戏场景失败', true);
              this._isConnecting = false;
              this.setButtonsEnabled(true);
              this.showLoading(false);
            }
          });
        } // ============ UI工具方法 ============

        /**
         * 获取玩家名称
         */


        getPlayerName() {
          if (!this.playerNameInput) return this.defaultPlayerName;
          const name = this.playerNameInput.string.trim();
          return name || this.defaultPlayerName;
        }
        /**
         * 获取房间ID
         */


        getRoomId() {
          if (!this.roomIdInput) return "";
          return this.roomIdInput.string.trim();
        }
        /**
         * 显示状态信息
         */


        showStatus(message, isError) {
          if (!this.statusLabel) return;
          this.statusLabel.string = message;
          this.statusLabel.color = isError ? new Color(255, 0, 0, 255) // 红色
          : new Color(255, 255, 255, 255); // 白色

          console.log(`[LobbyUI] ${isError ? '错误' : '状态'}: ${message}`);
        }
        /**
         * 显示/隐藏加载面板
         */


        showLoading(show) {
          if (!this.loadingPanel) return;
          this.loadingPanel.active = show;
        }
        /**
         * 启用/禁用按钮
         */


        setButtonsEnabled(enabled) {
          if (this.createRoomButton) {
            this.createRoomButton.interactable = enabled;
          }

          if (this.joinRoomButton) {
            this.joinRoomButton.interactable = enabled;
          }
        }
        /**
         * 生成随机玩家名称
         */


        generateRandomName() {
          const adjectives = ['快乐', '勇敢', '聪明', '可爱', '神秘'];
          const nouns = ['小猫', '小狗', '小兔', '小熊', '小鸟'];
          const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
          const noun = nouns[Math.floor(Math.random() * nouns.length)];
          const num = Math.floor(Math.random() * 100);
          return `${adj}的${noun}${num}`;
        }

        onDestroy() {
          // 清理事件监听
          if (this.createRoomButton) {
            this.createRoomButton.node.off(Button.EventType.CLICK, this.onCreateRoomClick, this);
          }

          if (this.joinRoomButton) {
            this.joinRoomButton.node.off(Button.EventType.CLICK, this.onJoinRoomClick, this);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "playerNameInput", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "roomIdInput", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "createRoomButton", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "joinRoomButton", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "statusLabel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "loadingPanel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "gameSceneName", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return "GameScene";
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "defaultPlayerName", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return "Player";
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=91470b4a8e6dca1621908971d7574bb4ac824115.js.map