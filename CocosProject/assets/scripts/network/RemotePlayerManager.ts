// 文件名: RemotePlayerManager.ts
// 功能: 远程玩家管理器 - 管理所有远程玩家的创建和销毁（任务4.1）

import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { NetworkManager, PlayerData } from './NetworkManager';
import { RemotePlayerController } from './RemotePlayerController';
const { ccclass, property } = _decorator;

@ccclass('RemotePlayerManager')
export class RemotePlayerManager extends Component {
    // ============ 配置 ============
    @property(Prefab)
    public remotePlayerPrefab: Prefab | null = null; // 远程玩家预制体

    @property(Node)
    public playersContainer: Node | null = null; // 玩家容器节点（可选）

    @property
    public enableDebugLog: boolean = true; // 是否启用调试日志

    // 私有成员
    private _networkManager: NetworkManager | null = null;
    private _remotePlayers: Map<string, Node> = new Map(); // sessionId -> 玩家节点

    start() {
        console.log('[RemotePlayerManager] 远程玩家管理器初始化');

        // 获取NetworkManager
        this._networkManager = NetworkManager.getInstance();
        if (!this._networkManager) {
            console.error('[RemotePlayerManager] NetworkManager未找到！');
            return;
        }

        // 检查预制体
        if (!this.remotePlayerPrefab) {
            console.error('[RemotePlayerManager] 远程玩家预制体未设置！');
            return;
        }

        // 注册网络事件
        this.setupNetworkEvents();

        // 创建已存在的玩家（加入房间时房间内已有的玩家）
        this.createExistingPlayers();
    }

    /**
     * 设置网络事件
     */
    private setupNetworkEvents() {
        if (!this._networkManager) return;

        // 监听玩家加入
        this._networkManager.on('playerAdded', (data: any) => {
            this.onPlayerAdded(data.sessionId, data.player);
        });

        // 监听玩家离开
        this._networkManager.on('playerRemoved', (data: any) => {
            this.onPlayerRemoved(data.sessionId);
        });

        // 监听玩家状态变化
        this._networkManager.on('playerChanged', (data: any) => {
            this.onPlayerChanged(data.sessionId, data.player);
        });
    }

    /**
     * 创建已存在的玩家
     */
    private createExistingPlayers() {
        if (!this._networkManager) return;

        const allPlayers = this._networkManager.getAllPlayers();
        const localSessionId = this._networkManager.getLocalSessionId();

        console.log(`[RemotePlayerManager] 当前房间有 ${allPlayers.size} 个玩家`);

        allPlayers.forEach((playerData: PlayerData, sessionId: string) => {
            // 跳过本地玩家
            if (sessionId === localSessionId) {
                console.log(`[RemotePlayerManager] 跳过本地玩家: ${sessionId}`);
                return;
            }

            // 创建远程玩家
            this.createRemotePlayer(sessionId, playerData);
        });
    }

    /**
     * 玩家加入事件
     */
    private onPlayerAdded(sessionId: string, playerData: PlayerData) {
        // 跳过本地玩家
        if (sessionId === this._networkManager!.getLocalSessionId()) {
            console.log(`[RemotePlayerManager] 本地玩家加入，跳过创建: ${sessionId}`);
            return;
        }

        console.log(`[RemotePlayerManager] 新玩家加入: ${sessionId}`);
        this.createRemotePlayer(sessionId, playerData);
    }

    /**
     * 玩家离开事件
     */
    private onPlayerRemoved(sessionId: string) {
        console.log(`[RemotePlayerManager] 玩家离开: ${sessionId}`);
        this.destroyRemotePlayer(sessionId);
    }

    /**
     * 玩家状态变化事件
     */
    private onPlayerChanged(sessionId: string, playerData: PlayerData) {
        const playerNode = this._remotePlayers.get(sessionId);
        if (!playerNode) {
            console.warn(`[RemotePlayerManager] 玩家节点不存在: ${sessionId}`);
            return;
        }

        // 更新远程玩家状态
        const remoteController = playerNode.getComponent(RemotePlayerController);
        if (remoteController) {
            remoteController.updatePlayerState(playerData);
        }
    }

    /**
     * 创建远程玩家
     */
    private createRemotePlayer(sessionId: string, playerData: PlayerData) {
        // 检查是否已存在
        if (this._remotePlayers.has(sessionId)) {
            console.warn(`[RemotePlayerManager] 玩家已存在: ${sessionId}`);
            return;
        }

        // 实例化预制体
        const playerNode = instantiate(this.remotePlayerPrefab!);
        playerNode.name = `RemotePlayer_${playerData.name}_${sessionId.substring(0, 4)}`;

        // 设置父节点
        if (this.playersContainer) {
            playerNode.setParent(this.playersContainer);
        } else {
            playerNode.setParent(this.node.scene);
        }

        // 设置初始位置
        playerNode.setPosition(new Vec3(playerData.x, playerData.y, playerData.z));
        playerNode.setRotationFromEuler(0, playerData.rotationY, 0);

        // 获取或添加RemotePlayerController组件
        let remoteController = playerNode.getComponent(RemotePlayerController);
        if (!remoteController) {
            remoteController = playerNode.addComponent(RemotePlayerController);
        }

        // 初始化远程玩家控制器
        remoteController.initialize(sessionId, playerData);

        // 保存引用
        this._remotePlayers.set(sessionId, playerNode);

        console.log(`[RemotePlayerManager] 创建远程玩家成功: ${playerData.name} (${sessionId})`);

        if (this.enableDebugLog) {
            console.log(`[RemotePlayerManager] 当前远程玩家数: ${this._remotePlayers.size}`);
        }
    }

    /**
     * 销毁远程玩家
     */
    private destroyRemotePlayer(sessionId: string) {
        const playerNode = this._remotePlayers.get(sessionId);
        if (!playerNode) {
            console.warn(`[RemotePlayerManager] 玩家节点不存在: ${sessionId}`);
            return;
        }

        // 销毁节点
        playerNode.destroy();

        // 移除引用
        this._remotePlayers.delete(sessionId);

        console.log(`[RemotePlayerManager] 销毁远程玩家: ${sessionId}`);

        if (this.enableDebugLog) {
            console.log(`[RemotePlayerManager] 当前远程玩家数: ${this._remotePlayers.size}`);
        }
    }

    /**
     * 获取所有远程玩家节点
     */
    public getAllRemotePlayers(): Map<string, Node> {
        return this._remotePlayers;
    }

    /**
     * 获取远程玩家数量
     */
    public getRemotePlayerCount(): number {
        return this._remotePlayers.size;
    }

    /**
     * 获取指定远程玩家节点
     */
    public getRemotePlayer(sessionId: string): Node | null {
        return this._remotePlayers.get(sessionId) || null;
    }

    onDestroy() {
        // 销毁所有远程玩家
        this._remotePlayers.forEach((playerNode) => {
            if (playerNode && playerNode.isValid) {
                playerNode.destroy();
            }
        });
        this._remotePlayers.clear();
    }
}
