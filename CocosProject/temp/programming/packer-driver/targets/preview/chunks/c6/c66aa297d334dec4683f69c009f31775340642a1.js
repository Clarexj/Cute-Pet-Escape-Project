System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, Color, NetworkManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _crd, ccclass, property, RoomUI;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
      Button = _cc.Button;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      NetworkManager = _unresolved_2.NetworkManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0992dQyCmJKy5Eayfab4MKl", "RoomUI", undefined); // 文件名: RoomUI.ts
      // 功能: 游戏房间UI - 显示房间信息和玩家列表（任务4.1）


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button', 'Color']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("RoomUI", RoomUI = (_dec = ccclass('RoomUI'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Button), _dec6 = property(Node), _dec(_class = (_class2 = class RoomUI extends Component {
        constructor() {
          super(...arguments);

          // ============ UI元素 ============
          _initializerDefineProperty(this, "roomIdLabel", _descriptor, this);

          // 房间ID显示
          _initializerDefineProperty(this, "playerCountLabel", _descriptor2, this);

          // 玩家数量显示
          _initializerDefineProperty(this, "statusLabel", _descriptor3, this);

          // 连接状态显示
          _initializerDefineProperty(this, "leaveRoomButton", _descriptor4, this);

          // 离开房间按钮（可选）
          _initializerDefineProperty(this, "playerListContainer", _descriptor5, this);

          // 玩家列表容器（可选）
          // ============ 配置 ============
          _initializerDefineProperty(this, "showRoomId", _descriptor6, this);

          // 是否显示房间ID
          _initializerDefineProperty(this, "showPlayerCount", _descriptor7, this);

          // 是否显示玩家数量
          // 私有成员
          this._networkManager = null;
        }

        start() {
          console.log('[RoomUI] 房间UI初始化'); // 获取NetworkManager

          this._networkManager = (_crd && NetworkManager === void 0 ? (_reportPossibleCrUseOfNetworkManager({
            error: Error()
          }), NetworkManager) : NetworkManager).getInstance();

          if (!this._networkManager) {
            console.error('[RoomUI] NetworkManager未找到！');
            return;
          } // 检查是否已连接到房间


          if (!this._networkManager.isConnected()) {
            console.error('[RoomUI] 未连接到房间！');
            this.showStatus('未连接到房间', true);
            return;
          } // 绑定按钮事件


          this.setupButtons(); // 注册网络事件

          this.setupNetworkEvents(); // 初始化显示

          this.updateRoomInfo();
          this.showStatus('已连接', false);
        }
        /**
         * 设置按钮事件
         */


        setupButtons() {
          if (this.leaveRoomButton) {
            this.leaveRoomButton.node.on(Button.EventType.CLICK, this.onLeaveRoomClick, this);
          }
        }
        /**
         * 设置网络事件
         */


        setupNetworkEvents() {
          if (!this._networkManager) return; // 监听玩家加入

          this._networkManager.on('playerAdded', data => {
            console.log("[RoomUI] \u73A9\u5BB6\u52A0\u5165: " + data.sessionId);
            this.updateRoomInfo();
          }); // 监听玩家离开


          this._networkManager.on('playerRemoved', data => {
            console.log("[RoomUI] \u73A9\u5BB6\u79BB\u5F00: " + data.sessionId);
            this.updateRoomInfo();
          }); // 监听断开连接


          this._networkManager.on('disconnected', code => {
            console.log("[RoomUI] \u8FDE\u63A5\u65AD\u5F00 [" + code + "]");
            this.showStatus('连接已断开', true);
          }); // 监听错误


          this._networkManager.on('error', error => {
            console.error('[RoomUI] 网络错误:', error);
            this.showStatus('网络错误', true);
          });
        }
        /**
         * 更新房间信息显示
         */


        updateRoomInfo() {
          if (!this._networkManager) return; // 更新房间ID

          if (this.showRoomId && this.roomIdLabel) {
            var roomId = this._networkManager.getRoomId();

            this.roomIdLabel.string = "\u623F\u95F4ID: " + roomId;
          } // 更新玩家数量


          if (this.showPlayerCount && this.playerCountLabel) {
            var playerCount = this._networkManager.getPlayerCount();

            var room = this._networkManager.getRoom();

            var maxPlayers = room ? room.state.maxPlayers : 5;
            this.playerCountLabel.string = "\u73A9\u5BB6: " + playerCount + "/" + maxPlayers;
          }
        }
        /**
         * 离开房间按钮点击
         */


        onLeaveRoomClick() {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (!_this._networkManager) return;
            console.log('[RoomUI] 离开房间');
            yield _this._networkManager.leaveRoom(); // 返回大厅场景
            // director.loadScene('LobbyScene');
          })();
        }
        /**
         * 显示状态信息
         */


        showStatus(message, isError) {
          if (!this.statusLabel) return;
          this.statusLabel.string = message;
          this.statusLabel.color = isError ? new Color(255, 0, 0, 255) // 红色
          : new Color(0, 255, 0, 255); // 绿色
        }
        /**
         * 手动刷新UI（供外部调用）
         */


        refreshUI() {
          this.updateRoomInfo();
        }

        onDestroy() {
          // 清理事件监听
          if (this.leaveRoomButton) {
            this.leaveRoomButton.node.off(Button.EventType.CLICK, this.onLeaveRoomClick, this);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "roomIdLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playerCountLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "statusLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "leaveRoomButton", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "playerListContainer", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showRoomId", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "showPlayerCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c66aa297d334dec4683f69c009f31775340642a1.js.map