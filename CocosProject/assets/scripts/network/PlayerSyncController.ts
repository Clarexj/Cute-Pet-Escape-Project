// 文件名: PlayerSyncController.ts
// 功能: 本地玩家同步控制器 - 将本地玩家数据同步到服务器（任务4.1）

import { _decorator, Component, Node, Vec3 } from 'cc';
import { NetworkManager } from './NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerSyncController')
export class PlayerSyncController extends Component {
    // ============ 配置 ============
    @property
    public syncInterval: number = 0.05; // 同步间隔（秒），默认50ms = 20次/秒

    @property
    public positionThreshold: number = 0.01; // 位置变化阈值（米）

    @property
    public rotationThreshold: number = 1.0; // 旋转变化阈值（度）

    @property
    public enableDebugLog: boolean = false; // 是否启用调试日志

    // 私有成员
    private _networkManager: NetworkManager | null = null;
    private _syncTimer: number = 0;

    // 上一次发送的状态（用于变化检测）
    private _lastPosition: Vec3 = new Vec3();
    private _lastRotationY: number = 0;
    private _lastIsMoving: boolean = false;
    private _lastAnimationState: string = "idle";

    // 临时变量（性能优化）
    private _tempPosition: Vec3 = new Vec3();

    start() {
        console.log('[PlayerSyncController] 玩家同步控制器初始化');

        // 获取NetworkManager
        this._networkManager = NetworkManager.getInstance();
        if (!this._networkManager) {
            console.error('[PlayerSyncController] NetworkManager未找到！');
            return;
        }

        // 检查是否已连接到房间
        if (!this._networkManager.isConnected()) {
            console.warn('[PlayerSyncController] 未连接到房间，同步将在连接后开始');
        }

        // 初始化上一次状态
        this.node.getPosition(this._lastPosition);
        this._lastRotationY = this.node.eulerAngles.y;
    }

    update(deltaTime: number) {
        // 检查网络连接
        if (!this._networkManager || !this._networkManager.isConnected()) {
            return;
        }

        // 累积时间
        this._syncTimer += deltaTime;

        // 达到同步间隔时发送数据
        if (this._syncTimer >= this.syncInterval) {
            this.syncPlayerState();
            this._syncTimer = 0;
        }
    }

    /**
     * 同步玩家状态到服务器
     */
    private syncPlayerState() {
        // 获取当前状态
        this.node.getPosition(this._tempPosition);
        const currentRotationY = this.node.eulerAngles.y;

        // 检测是否正在移动（通过位置变化判断）
        const positionChanged = Vec3.distance(this._tempPosition, this._lastPosition) > this.positionThreshold;
        const rotationChanged = Math.abs(currentRotationY - this._lastRotationY) > this.rotationThreshold;

        // 获取动画状态（如果有CharacterAnimationController）
        let animationState = "idle";
        let isMoving = false;

        // 尝试从PlayerController或其他移动控制器获取移动状态
        const playerController = this.node.getComponent('PlayerController');
        if (playerController && typeof playerController.isMoving === 'function') {
            isMoving = playerController.isMoving();
            animationState = isMoving ? "run" : "idle";
        } else {
            // 如果没有PlayerController，通过位置变化判断
            isMoving = positionChanged;
            animationState = isMoving ? "run" : "idle";
        }

        // 检查状态是否变化
        const stateChanged = positionChanged ||
                            rotationChanged ||
                            isMoving !== this._lastIsMoving ||
                            animationState !== this._lastAnimationState;

        // 只在状态变化时发送（节省带宽）
        if (stateChanged) {
            this._networkManager!.sendPlayerMove(
                this._tempPosition.x,
                this._tempPosition.y,
                this._tempPosition.z,
                currentRotationY,
                isMoving,
                animationState
            );

            // 更新上一次状态
            this._lastPosition.set(this._tempPosition);
            this._lastRotationY = currentRotationY;
            this._lastIsMoving = isMoving;
            this._lastAnimationState = animationState;

            if (this.enableDebugLog) {
                console.log(`[PlayerSyncController] 同步状态: pos(${this._tempPosition.x.toFixed(2)}, ${this._tempPosition.z.toFixed(2)}), rot(${currentRotationY.toFixed(1)}), moving(${isMoving})`);
            }
        }
    }

    /**
     * 强制发送当前状态（供外部调用）
     */
    public forceSyncState() {
        if (!this._networkManager || !this._networkManager.isConnected()) {
            return;
        }

        this.node.getPosition(this._tempPosition);
        const currentRotationY = this.node.eulerAngles.y;

        // 获取移动状态
        let isMoving = false;
        let animationState = "idle";

        const playerController = this.node.getComponent('PlayerController');
        if (playerController && typeof playerController.isMoving === 'function') {
            isMoving = playerController.isMoving();
            animationState = isMoving ? "run" : "idle";
        }

        this._networkManager.sendPlayerMove(
            this._tempPosition.x,
            this._tempPosition.y,
            this._tempPosition.z,
            currentRotationY,
            isMoving,
            animationState
        );

        console.log('[PlayerSyncController] 强制同步状态');
    }

    /**
     * 设置同步间隔
     */
    public setSyncInterval(interval: number) {
        this.syncInterval = Math.max(0.01, interval); // 最小10ms
        console.log(`[PlayerSyncController] 同步间隔设置为 ${this.syncInterval}s`);
    }

    /**
     * 启用/禁用同步
     */
    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        console.log(`[PlayerSyncController] 同步${enabled ? '启用' : '禁用'}`);
    }
}
