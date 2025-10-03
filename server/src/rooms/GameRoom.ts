// 文件名: GameRoom.ts
// 功能: 游戏房间逻辑（任务4.1）
// 处理玩家加入、离开、状态同步

import { Room, Client } from "@colyseus/core";
import { GameRoomState, Player } from "../schema/GameRoomState";

/**
 * 玩家移动消息
 */
interface PlayerMoveMessage {
    x: number;
    y: number;
    z: number;
    rotationY: number;
    isMoving: boolean;
    animationState: string;
    timestamp: number;
}

/**
 * 游戏房间类
 */
export class GameRoom extends Room<GameRoomState> {
    maxClients = 5; // 最大5个玩家（4个逃生者 + 1个追捕者）

    onCreate(options: any) {
        console.log(`[GameRoom] 房间创建: ${this.roomId}`);

        // 初始化房间状态
        this.setState(new GameRoomState());
        this.state.roomId = this.roomId;

        // 注册消息处理器
        this.setupMessageHandlers();

        // 设置房间元数据（用于房间列表）
        this.setMetadata({
            roomId: this.roomId,
            playerCount: 0,
            maxPlayers: this.maxClients,
            createdAt: Date.now()
        });

        console.log(`[GameRoom] 房间 ${this.roomId} 初始化完成`);
    }

    /**
     * 设置消息处理器
     */
    private setupMessageHandlers() {
        // 处理玩家移动消息
        this.onMessage("playerMove", (client: Client, message: PlayerMoveMessage) => {
            const player = this.state.players.get(client.sessionId);
            if (!player) return;

            // 更新玩家位置和状态
            player.x = message.x;
            player.y = message.y;
            player.z = message.z;
            player.rotationY = message.rotationY;
            player.isMoving = message.isMoving;
            player.animationState = message.animationState;
            player.timestamp = Number(message.timestamp) || 0;

            // Colyseus会自动将state的变化广播给所有客户端
        });

        // 处理玩家设置名称（可选）
        this.onMessage("setPlayerName", (client: Client, name: string) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.name = name || `Player_${client.sessionId.substr(0, 4)}`;
                console.log(`[GameRoom] 玩家 ${client.sessionId} 设置名称: ${player.name}`);
            }
        });
    }

    /**
     * 玩家加入房间
     */
    onJoin(client: Client, options: any) {
        console.log(`[GameRoom] 玩家加入: ${client.sessionId}`);

        // 创建新玩家
        const player = new Player();
        player.sessionId = client.sessionId;
        player.name = options.playerName || `Player_${client.sessionId.substr(0, 4)}`;

        // 设置初始位置（随机分散位置，避免重叠）
        const spawnPoints = [
            { x: 0, y: 0, z: 0 },
            { x: 5, y: 0, z: 5 },
            { x: -5, y: 0, z: 5 },
            { x: 5, y: 0, z: -5 },
            { x: -5, y: 0, z: -5 }
        ];
        const spawnIndex = this.state.playerCount % spawnPoints.length;
        player.x = spawnPoints[spawnIndex].x;
        player.y = spawnPoints[spawnIndex].y;
        player.z = spawnPoints[spawnIndex].z;

        // 设置角色类型（可选）
        player.characterType = options.characterType || "survivor";

        // 添加到房间状态
        this.state.players.set(client.sessionId, player);
        this.state.playerCount = this.state.players.size;

        // 更新房间元数据
        this.setMetadata({
            ...this.metadata,
            playerCount: this.state.playerCount
        });

        console.log(`[GameRoom] 当前玩家数: ${this.state.playerCount}/${this.maxClients}`);

        // 发送欢迎消息给新玩家
        client.send("welcome", {
            sessionId: client.sessionId,
            roomId: this.roomId,
            playerCount: this.state.playerCount
        });
    }

    /**
     * 玩家离开房间
     */
    onLeave(client: Client, consented: boolean) {
        console.log(`[GameRoom] 玩家离开: ${client.sessionId} (consented: ${consented})`);

        // 移除玩家
        this.state.players.delete(client.sessionId);
        this.state.playerCount = this.state.players.size;

        // 更新房间元数据
        this.setMetadata({
            ...this.metadata,
            playerCount: this.state.playerCount
        });

        console.log(`[GameRoom] 剩余玩家数: ${this.state.playerCount}`);

        // 如果房间为空，可以选择销毁房间（延迟销毁，防止玩家重连）
        if (this.state.playerCount === 0) {
            console.log(`[GameRoom] 房间 ${this.roomId} 为空，将在30秒后自动销毁`);
            // 30秒后如果仍然没有玩家，销毁房间
            setTimeout(() => {
                if (this.state.playerCount === 0) {
                    console.log(`[GameRoom] 销毁空房间 ${this.roomId}`);
                    this.disconnect();
                }
            }, 30000);
        }
    }

    /**
     * 房间销毁
     */
    onDispose() {
        console.log(`[GameRoom] 房间 ${this.roomId} 已销毁`);
    }
}
