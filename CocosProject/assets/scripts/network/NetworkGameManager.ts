// 文件名: NetworkGameManager.ts
// 功能: 网络游戏管理器 - 统一管理所有网络功能（任务4.1-4.4）
// 自动在GameScene启动时创建/加入房间，并同步所有游戏状态

import { _decorator, Component, director } from 'cc';
import { NetworkManager } from './NetworkManager';
const { ccclass, property } = _decorator;

// 声明Colyseus全局对象
declare const Colyseus: any;

@ccclass('NetworkGameManager')
export class NetworkGameManager extends Component {
    @property
    public serverUrl: string = 'ws://localhost:2567';

    @property
    public roomName: string = 'game_room';

    @property
    public autoCreateRoom: boolean = true; // 自动创建房间

    @property
    public playerName: string = ''; // 玩家名称（空则自动生成）

    @property
    public characterType: string = 'survivor'; // 角色类型: survivor 或 hunter

    // Colyseus客户端和房间
    private client: any = null;
    private room: any = null;
    private localSessionId: string = '';

    // 单例
    private static _instance: NetworkGameManager | null = null;

    onLoad() {
        // 单例模式
        if (NetworkGameManager._instance) {
            console.warn('[NetworkGameManager] 已存在实例，销毁当前节点');
            this.node.destroy();
            return;
        }
        NetworkGameManager._instance = this;

        // 跨场景持久化
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
    private async initializeNetwork() {
        try {
            console.log('[NetworkGameManager] 正在初始化网络连接...');

            // 创建Colyseus客户端
            if (typeof Colyseus === 'undefined') {
                console.error('[NetworkGameManager] Colyseus未加载！请检查colyseus.js是否正确引入');
                return;
            }

            this.client = new Colyseus.Client(this.serverUrl);
            console.log(`[NetworkGameManager] Colyseus客户端创建成功: ${this.serverUrl}`);

            // 生成玩家名称
            if (!this.playerName || this.playerName.trim() === '') {
                this.playerName = this.generateRandomName();
            }

            // 创建房间
            await this.createRoom();

        } catch (error) {
            console.error('[NetworkGameManager] 网络初始化失败:', error);
        }
    }

    /**
     * 创建房间
     */
    private async createRoom() {
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
            console.log(`[NetworkGameManager] 会话ID: ${this.localSessionId}`);

            // 设置房间事件监听
            this.setupRoomEvents();

        } catch (error) {
            console.error('[NetworkGameManager] 创建房间失败:', error);
        }
    }

    /**
     * 加入房间
     */
    public async joinRoom(roomId: string) {
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
    private setupRoomEvents() {
        if (!this.room) return;

        // 玩家加入
        this.room.state.players.onAdd((player: any, sessionId: string) => {
            console.log(`[NetworkGameManager] 👤 玩家加入: ${player.name} (${sessionId})`);
            this.onPlayerJoined(player, sessionId);
        });

        // 玩家离开
        this.room.state.players.onRemove((player: any, sessionId: string) => {
            console.log(`[NetworkGameManager] 👋 玩家离开: ${player.name} (${sessionId})`);
            this.onPlayerLeft(player, sessionId);
        });

        // 玩家状态变化
        this.room.state.players.onAdd((player: any, sessionId: string) => {
            player.onChange(() => {
                this.onPlayerStateChanged(player, sessionId);
            });
        });

        // 监听自定义消息
        this.setupCustomMessages();
    }

    /**
     * 设置自定义消息监听（任务4.2-4.4）
     */
    private setupCustomMessages() {
        if (!this.room) return;

        // 矿石收集事件
        this.room.onMessage('oreCollected', (message: any) => {
            console.log('[NetworkGameManager] 📦 矿石被收集:', message);
            this.onOreCollectedNetwork(message);
        });

        // 玩家被抓事件
        this.room.onMessage('playerCaptured', (message: any) => {
            console.log('[NetworkGameManager] 🎯 玩家被抓:', message);
            this.onPlayerCapturedNetwork(message);
        });

        // 玩家被挂起事件
        this.room.onMessage('playerHanged', (message: any) => {
            console.log('[NetworkGameManager] 🪝 玩家被挂起:', message);
            this.onPlayerHangedNetwork(message);
        });

        // 玩家被救援事件
        this.room.onMessage('playerRescued', (message: any) => {
            console.log('[NetworkGameManager] 🆘 玩家被救援:', message);
            this.onPlayerRescuedNetwork(message);
        });

        // 玩家逃脱事件
        this.room.onMessage('playerEscaped', (message: any) => {
            console.log('[NetworkGameManager] 🚪 玩家逃脱:', message);
            this.onPlayerEscapedNetwork(message);
        });

        // 游戏结束事件
        this.room.onMessage('gameOver', (message: any) => {
            console.log('[NetworkGameManager] 🏁 游戏结束:', message);
            this.onGameOverNetwork(message);
        });
    }

    // ============ 网络事件回调 ============

    private onPlayerJoined(player: any, sessionId: string) {
        // TODO: 创建远程玩家
    }

    private onPlayerLeft(player: any, sessionId: string) {
        // TODO: 销毁远程玩家
    }

    private onPlayerStateChanged(player: any, sessionId: string) {
        // TODO: 更新远程玩家状态
    }

    private onOreCollectedNetwork(message: any) {
        // TODO: 同步矿石收集
    }

    private onPlayerCapturedNetwork(message: any) {
        // TODO: 同步玩家被抓
    }

    private onPlayerHangedNetwork(message: any) {
        // TODO: 同步玩家被挂起
    }

    private onPlayerRescuedNetwork(message: any) {
        // TODO: 同步玩家被救援
    }

    private onPlayerEscapedNetwork(message: any) {
        // TODO: 同步玩家逃脱
    }

    private onGameOverNetwork(message: any) {
        // TODO: 同步游戏结束
    }

    // ============ 发送网络消息 ============

    /**
     * 发送玩家移动
     */
    public sendPlayerMove(x: number, y: number, z: number, rotationY: number, isMoving: boolean, animationState: string) {
        if (!this.room) return;

        this.room.send('playerMove', {
            x, y, z,
            rotationY,
            isMoving,
            animationState,
            timestamp: Date.now()
        });
    }

    /**
     * 发送矿石收集
     */
    public sendOreCollected(oreId: string) {
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
    public sendPlayerCaptured(targetSessionId: string) {
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
    public sendPlayerHanged(targetSessionId: string, cageId: string) {
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
    public sendPlayerRescued(rescuerSessionId: string, targetSessionId: string) {
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
    public sendPlayerEscaped(sessionId: string) {
        if (!this.room) return;

        this.room.send('playerEscaped', {
            sessionId,
            timestamp: Date.now()
        });
    }

    // ============ 工具方法 ============

    /**
     * 生成随机玩家名称
     */
    private generateRandomName(): string {
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
    public getRoomId(): string {
        return this.room ? this.room.id : '';
    }

    /**
     * 获取本地会话ID
     */
    public getLocalSessionId(): string {
        return this.localSessionId;
    }

    /**
     * 是否已连接
     */
    public isConnected(): boolean {
        return this.room !== null;
    }

    /**
     * 获取玩家数量
     */
    public getPlayerCount(): number {
        return this.room ? this.room.state.players.size : 0;
    }

    // ============ 单例访问 ============

    public static getInstance(): NetworkGameManager | null {
        return NetworkGameManager._instance;
    }

    onDestroy() {
        if (NetworkGameManager._instance === this) {
            NetworkGameManager._instance = null;
        }

        // 离开房间
        if (this.room) {
            this.room.leave();
            this.room = null;
        }
    }
}
