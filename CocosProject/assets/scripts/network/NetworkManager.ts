// 文件名: NetworkManager.ts
// 功能: 网络管理器 - 连接Colyseus服务器（任务4.1）
// 处理房间创建、加入、连接管理

// 声明全局Colyseus对象（从colyseus.js插件）
declare const Colyseus: any;

import { _decorator, Component, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 玩家数据接口
 */
export interface PlayerData {
    sessionId: string;
    name: string;
    x: number;
    y: number;
    z: number;
    rotationY: number;
    isMoving: boolean;
    animationState: string;
    characterType: string;
    timestamp: number;
}

/**
 * 房间状态接口
 */
export interface RoomState {
    players: Map<string, PlayerData>;
    roomId: string;
    maxPlayers: number;
    playerCount: number;
    gameStarted: boolean;
}

/**
 * 网络事件回调类型
 */
export type NetworkEventCallback = (...args: any[]) => void;

@ccclass('NetworkManager')
export class NetworkManager extends Component {
    @property
    public serverUrl: string = "ws://localhost:2567"; // 服务器地址

    @property
    public autoConnect: boolean = false; // 是否自动连接（调试用）

    @property
    public enableDebugLog: boolean = true; // 是否启用调试日志

    // Colyseus客户端
    private _client: Colyseus.Client | null = null;

    // 当前房间
    private _room: Colyseus.Room | null = null;

    // 本地玩家会话ID
    private _localSessionId: string = "";

    // 事件回调
    private _eventCallbacks: Map<string, NetworkEventCallback[]> = new Map();

    // 单例模式
    private static _instance: NetworkManager | null = null;

    onLoad() {
        // 实现单例模式
        if (NetworkManager._instance) {
            console.warn('[NetworkManager] 已存在实例，销毁当前节点');
            this.node.destroy();
            return;
        }
        NetworkManager._instance = this;

        // 跨场景持久化（Cocos Creator 3.x API）
        director.addPersistRootNode(this.node);

        console.log('[NetworkManager] 网络管理器初始化，已设置为跨场景持久化');
    }

    start() {
        console.log('[NetworkManager] 网络管理器初始化');

        // 创建Colyseus客户端
        this._client = new Colyseus.Client(this.serverUrl);

        if (this.autoConnect) {
            this.createRoom("TestPlayer");
        }
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): NetworkManager | null {
        return NetworkManager._instance;
    }

    // ============ 房间管理 ============

    /**
     * 创建房间
     */
    public async createRoom(playerName: string): Promise<boolean> {
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
            this.emit('error', { type: 'createRoom', message: error.message });
            return false;
        }
    }

    /**
     * 加入房间（通过房间ID）
     */
    public async joinRoom(roomId: string, playerName: string): Promise<boolean> {
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
            this.emit('error', { type: 'joinRoom', message: error.message });
            return false;
        }
    }

    /**
     * 离开房间
     */
    public async leaveRoom(): Promise<void> {
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
    private setupRoomHandlers() {
        if (!this._room) return;

        // 监听状态变化
        this._room.onStateChange((state: any) => {
            if (this.enableDebugLog) {
                console.log('[NetworkManager] 房间状态更新');
            }
            this.emit('stateChange', state);
        });

        // 监听玩家加入
        this._room.state.players.onAdd((player: any, sessionId: string) => {
            console.log(`[NetworkManager] 玩家加入: ${sessionId}`);
            this.emit('playerAdded', { sessionId, player });
        });

        // 监听玩家离开
        this._room.state.players.onRemove((player: any, sessionId: string) => {
            console.log(`[NetworkManager] 玩家离开: ${sessionId}`);
            this.emit('playerRemoved', { sessionId, player });
        });

        // 监听玩家属性变化
        this._room.state.players.onChange((player: any, sessionId: string) => {
            if (sessionId !== this._localSessionId) {
                // 只处理远程玩家的变化
                this.emit('playerChanged', { sessionId, player });
            }
        });

        // 监听服务器消息
        this._room.onMessage("welcome", (message: any) => {
            console.log('[NetworkManager] 收到欢迎消息:', message);
            this.emit('welcome', message);
        });

        // 监听错误
        this._room.onError((code: number, message: string) => {
            console.error(`[NetworkManager] 房间错误 [${code}]: ${message}`);
            this.emit('error', { type: 'room', code, message });
        });

        // 监听连接关闭
        this._room.onLeave((code: number) => {
            console.log(`[NetworkManager] 连接关闭 [${code}]`);
            this.emit('disconnected', code);
        });
    }

    // ============ 消息发送 ============

    /**
     * 发送玩家移动消息
     */
    public sendPlayerMove(x: number, y: number, z: number, rotationY: number, isMoving: boolean, animationState: string) {
        if (!this._room) {
            console.warn('[NetworkManager] 没有活跃的房间连接');
            return;
        }

        this._room.send("playerMove", {
            x, y, z, rotationY, isMoving, animationState,
            timestamp: Date.now()
        });
    }

    /**
     * 设置玩家名称
     */
    public sendSetPlayerName(name: string) {
        if (!this._room) {
            console.warn('[NetworkManager] 没有活跃的房间连接');
            return;
        }

        this._room.send("setPlayerName", name);
    }

    // ============ 事件系统 ============

    /**
     * 注册事件监听
     */
    public on(eventName: string, callback: NetworkEventCallback) {
        if (!this._eventCallbacks.has(eventName)) {
            this._eventCallbacks.set(eventName, []);
        }
        this._eventCallbacks.get(eventName)!.push(callback);
    }

    /**
     * 取消事件监听
     */
    public off(eventName: string, callback: NetworkEventCallback) {
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
    private emit(eventName: string, ...args: any[]) {
        const callbacks = this._eventCallbacks.get(eventName);
        if (!callbacks) return;

        for (const callback of callbacks) {
            callback(...args);
        }
    }

    // ============ 查询接口 ============

    /**
     * 获取当前房间
     */
    public getRoom(): Colyseus.Room | null {
        return this._room;
    }

    /**
     * 获取房间ID
     */
    public getRoomId(): string {
        return this._room ? this._room.roomId : "";
    }

    /**
     * 获取本地玩家会话ID
     */
    public getLocalSessionId(): string {
        return this._localSessionId;
    }

    /**
     * 是否已连接到房间
     */
    public isConnected(): boolean {
        return this._room !== null;
    }

    /**
     * 获取所有玩家数据
     */
    public getAllPlayers(): Map<string, PlayerData> {
        if (!this._room) return new Map();
        return this._room.state.players;
    }

    /**
     * 获取玩家数量
     */
    public getPlayerCount(): number {
        if (!this._room) return 0;
        return this._room.state.players.size;
    }

    onDestroy() {
        // 离开房间
        if (this._room) {
            this._room.leave();
        }

        // 清理单例
        if (NetworkManager._instance === this) {
            NetworkManager._instance = null;
        }
    }
}
