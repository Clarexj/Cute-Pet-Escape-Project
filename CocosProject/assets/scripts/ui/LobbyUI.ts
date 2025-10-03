// 文件名: LobbyUI.ts
// 功能: 大厅UI - 创建/加入房间（任务4.1）

import { _decorator, Component, Node, Label, EditBox, Button, director, Color } from 'cc';
import { NetworkManager } from '../network/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('LobbyUI')
export class LobbyUI extends Component {
    // ============ UI元素 ============
    @property(EditBox)
    public playerNameInput: EditBox | null = null; // 玩家名称输入框

    @property(EditBox)
    public roomIdInput: EditBox | null = null; // 房间ID输入框

    @property(Button)
    public createRoomButton: Button | null = null; // 创建房间按钮

    @property(Button)
    public joinRoomButton: Button | null = null; // 加入房间按钮

    @property(Label)
    public statusLabel: Label | null = null; // 状态提示Label

    @property(Node)
    public loadingPanel: Node | null = null; // 加载中面板（可选）

    // ============ 配置 ============
    @property
    public gameSceneName: string = "GameScene"; // 游戏场景名称

    @property
    public defaultPlayerName: string = "Player"; // 默认玩家名称

    // 私有成员
    private _networkManager: NetworkManager | null = null;
    private _isConnecting: boolean = false;

    start() {
        console.log('[LobbyUI] 大厅UI初始化');

        // 获取NetworkManager
        this._networkManager = NetworkManager.getInstance();
        if (!this._networkManager) {
            console.error('[LobbyUI] NetworkManager未找到！');
            this.showStatus('网络管理器未初始化', true);
            return;
        }

        // 绑定按钮事件
        this.setupButtons();

        // 注册网络事件
        this.setupNetworkEvents();

        // 隐藏加载面板
        if (this.loadingPanel) {
            this.loadingPanel.active = false;
        }

        // 设置默认玩家名称
        if (this.playerNameInput) {
            this.playerNameInput.string = this.generateRandomName();
        }

        this.showStatus('请输入玩家名称并创建或加入房间', false);
    }

    /**
     * 设置按钮事件
     */
    private setupButtons() {
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
    private setupNetworkEvents() {
        if (!this._networkManager) return;

        // 房间创建成功
        this._networkManager.on('roomCreated', (roomId: string) => {
            this.onRoomReady(roomId);
        });

        // 房间加入成功
        this._networkManager.on('roomJoined', (roomId: string) => {
            this.onRoomReady(roomId);
        });

        // 错误处理
        this._networkManager.on('error', (error: any) => {
            this.onNetworkError(error);
        });
    }

    /**
     * 创建房间按钮点击
     */
    private async onCreateRoomClick() {
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

        const success = await this._networkManager!.createRoom(playerName);

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
    private async onJoinRoomClick() {
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

        const success = await this._networkManager!.joinRoom(roomId, playerName);

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
    private onRoomReady(roomId: string) {
        console.log(`[LobbyUI] 房间准备就绪: ${roomId}`);
        this.showStatus(`成功连接到房间 ${roomId}`, false);

        // 延迟1秒后切换到游戏场景
        this.scheduleOnce(() => {
            this.loadGameScene();
        }, 1.0);
    }

    /**
     * 网络错误处理
     */
    private onNetworkError(error: any) {
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
    private loadGameScene() {
        console.log(`[LobbyUI] 加载游戏场景: ${this.gameSceneName}`);
        director.loadScene(this.gameSceneName, (error) => {
            if (error) {
                console.error('[LobbyUI] 加载场景失败:', error);
                this.showStatus('加载游戏场景失败', true);
                this._isConnecting = false;
                this.setButtonsEnabled(true);
                this.showLoading(false);
            }
        });
    }

    // ============ UI工具方法 ============

    /**
     * 获取玩家名称
     */
    private getPlayerName(): string {
        if (!this.playerNameInput) return this.defaultPlayerName;
        const name = this.playerNameInput.string.trim();
        return name || this.defaultPlayerName;
    }

    /**
     * 获取房间ID
     */
    private getRoomId(): string {
        if (!this.roomIdInput) return "";
        return this.roomIdInput.string.trim();
    }

    /**
     * 显示状态信息
     */
    private showStatus(message: string, isError: boolean) {
        if (!this.statusLabel) return;

        this.statusLabel.string = message;
        this.statusLabel.color = isError
            ? new Color(255, 0, 0, 255)  // 红色
            : new Color(255, 255, 255, 255); // 白色

        console.log(`[LobbyUI] ${isError ? '错误' : '状态'}: ${message}`);
    }

    /**
     * 显示/隐藏加载面板
     */
    private showLoading(show: boolean) {
        if (!this.loadingPanel) return;
        this.loadingPanel.active = show;
    }

    /**
     * 启用/禁用按钮
     */
    private setButtonsEnabled(enabled: boolean) {
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
    private generateRandomName(): string {
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
}
