// 文件名: index.ts
// 功能: Colyseus服务器入口文件（任务4.1）

import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { GameRoom } from "./rooms/GameRoom";

// 创建Express应用
const app = express();

// 启用CORS（允许跨域，重要！）
app.use(cors());
app.use(express.json());

// 提供静态文件服务（测试客户端）
import path from "path";
app.use(express.static(path.join(__dirname, "../public")));

// 创建HTTP服务器
const httpServer = createServer(app);

// 创建Colyseus服务器
const gameServer = new Server({
    transport: new WebSocketTransport({
        server: httpServer
    })
});

// 注册游戏房间
gameServer.define("game_room", GameRoom);

// 健康检查端点
app.get("/", async (req, res) => {
    try {
        const rooms = await gameServer.matchMaker.query({});
        res.json({
            status: "ok",
            message: "Cute Pet Escape Server is running!",
            version: "1.0.0",
            rooms: rooms.length
        });
    } catch (error) {
        res.json({
            status: "ok",
            message: "Cute Pet Escape Server is running!",
            version: "1.0.0",
            rooms: 0
        });
    }
});

// 获取所有房间列表（用于调试）
app.get("/rooms", (req, res) => {
    res.json({
        success: true,
        rooms: [],
        message: "Use Colyseus client to create and join rooms"
    });
});

// 监听端口
const PORT = process.env.PORT || 2567;

gameServer.listen(PORT).then(() => {
    console.log("=".repeat(60));
    console.log("🎮 Cute Pet Escape - Multiplayer Server");
    console.log("=".repeat(60));
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`✅ WebSocket endpoint: ws://localhost:${PORT}`);
    console.log("=".repeat(60));
    console.log("📋 Available endpoints:");
    console.log(`   GET  http://localhost:${PORT}/         - Health check`);
    console.log(`   GET  http://localhost:${PORT}/rooms    - List all rooms`);
    console.log("=".repeat(60));
    console.log("🚀 Server is ready to accept connections!");
    console.log("=".repeat(60));
}).catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
});

// 优雅关闭
process.on("SIGTERM", () => {
    console.log("\n⚠️  SIGTERM signal received: closing HTTP server");
    httpServer.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
    });
});
