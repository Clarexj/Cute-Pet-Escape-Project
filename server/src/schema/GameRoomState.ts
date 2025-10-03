// 文件名: GameRoomState.ts
// 功能: 游戏房间状态Schema定义（任务4.1）
// Colyseus使用Schema来定义和同步服务器状态

import { Schema, MapSchema, type } from "@colyseus/schema";

/**
 * 玩家状态Schema
 */
export class Player extends Schema {
    @type("string") sessionId: string = "";      // 玩家会话ID（唯一标识）
    @type("string") name: string = "Player";     // 玩家名称

    // 位置信息
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;

    // 旋转信息（只需要Y轴旋转）
    @type("number") rotationY: number = 0;

    // 动画状态
    @type("boolean") isMoving: boolean = false;   // 是否正在移动
    @type("string") animationState: string = "idle"; // 当前动画状态（idle/run）

    // 角色类型（可选，用于后续扩展）
    @type("string") characterType: string = "survivor"; // survivor 或 hunter

    // 时间戳（用于插值）
    @type("number") timestamp: number = 0;
}

/**
 * 游戏房间状态Schema
 */
export class GameRoomState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>(); // 所有玩家

    @type("string") roomId: string = "";          // 房间ID（显示给玩家）
    @type("number") maxPlayers: number = 5;       // 最大玩家数（4个逃生者 + 1个追捕者）
    @type("number") playerCount: number = 0;      // 当前玩家数
    @type("boolean") gameStarted: boolean = false; // 游戏是否已开始（预留）
}
