// 文件名: RoomUI.ts
// 功能: 游戏房间UI - 显示房间信息和玩家列表（任务4.1）

import { _decorator, Component, Node, Label, Button, Color } from 'cc';
import { NetworkManager } from '../network/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('RoomUI')
export class RoomUI extends Component {
    // ============ UI元素 ============
    @property(Label)
    public roomIdLabel: Label | null = null; // 房间ID显示

    @property(Label)
    public playerCountLabel: Label | null = null; // 玩家数量显示

    @property(Label)
    public statusLabel: Label | null = null; // 连接状态显示

    @property(Button)
    public leaveRoomButton: Button | null = null; // 离开房间按钮（可选）

    @property(Node)
    public playerListContainer: Node | null = null; // 玩家列表容器（可选）

    // ============ 配置 ============
    @property
    public showRoomId: boolean = true; // 是否显示房间ID

    @property
    public showPlayerCount: boolean = true; // 是否显示玩家数量

    // 私有成员
    private _networkManager: NetworkManager | null = null;

    start() {
        console.log('[RoomUI] 房间UI初始化');

        // 获取NetworkManager
        this._networkManager = NetworkManager.getInstance();
        if (!this._networkManager) {
            console.error('[RoomUI] NetworkManager未找到！');
            return;
        }

        // 检查是否已连接到房间
        if (!this._networkManager.isConnected()) {
            console.error('[RoomUI] 未连接到房间！');
            this.showStatus('未连接到房间', true);
            return;
        }

        // 绑定按钮事件
        this.setupButtons();

        // 注册网络事件
        this.setupNetworkEvents();

        // 初始化显示
        this.updateRoomInfo();
        this.showStatus('已连接', false);
    }

    /**
     * 设置按钮事件
     */
    private setupButtons() {
        if (this.leaveRoomButton) {
            this.leaveRoomButton.node.on(Button.EventType.CLICK, this.onLeaveRoomClick, this);
        }
    }

    /**
     * 设置网络事件
     */
    private setupNetworkEvents() {
        if (!this._networkManager) return;

        // 监听玩家加入
        this._networkManager.on('playerAdded', (data: any) => {
            console.log(`[RoomUI] 玩家加入: ${data.sessionId}`);
            this.updateRoomInfo();
        });

        // 监听玩家离开
        this._networkManager.on('playerRemoved', (data: any) => {
            console.log(`[RoomUI] 玩家离开: ${data.sessionId}`);
            this.updateRoomInfo();
        });

        // 监听断开连接
        this._networkManager.on('disconnected', (code: number) => {
            console.log(`[RoomUI] 连接断开 [${code}]`);
            this.showStatus('连接已断开', true);
        });

        // 监听错误
        this._networkManager.on('error', (error: any) => {
            console.error('[RoomUI] 网络错误:', error);
            this.showStatus('网络错误', true);
        });
    }

    /**
     * 更新房间信息显示
     */
    private updateRoomInfo() {
        if (!this._networkManager) return;

        // 更新房间ID
        if (this.showRoomId && this.roomIdLabel) {
            const roomId = this._networkManager.getRoomId();
            this.roomIdLabel.string = `房间ID: ${roomId}`;
        }

        // 更新玩家数量
        if (this.showPlayerCount && this.playerCountLabel) {
            const playerCount = this._networkManager.getPlayerCount();
            const room = this._networkManager.getRoom();
            const maxPlayers = room ? room.state.maxPlayers : 5;
            this.playerCountLabel.string = `玩家: ${playerCount}/${maxPlayers}`;
        }
    }

    /**
     * 离开房间按钮点击
     */
    private async onLeaveRoomClick() {
        if (!this._networkManager) return;

        console.log('[RoomUI] 离开房间');
        await this._networkManager.leaveRoom();

        // 返回大厅场景
        // director.loadScene('LobbyScene');
    }

    /**
     * 显示状态信息
     */
    private showStatus(message: string, isError: boolean) {
        if (!this.statusLabel) return;

        this.statusLabel.string = message;
        this.statusLabel.color = isError
            ? new Color(255, 0, 0, 255)  // 红色
            : new Color(0, 255, 0, 255); // 绿色
    }

    /**
     * 手动刷新UI（供外部调用）
     */
    public refreshUI() {
        this.updateRoomInfo();
    }

    onDestroy() {
        // 清理事件监听
        if (this.leaveRoomButton) {
            this.leaveRoomButton.node.off(Button.EventType.CLICK, this.onLeaveRoomClick, this);
        }
    }
}
