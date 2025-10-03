// 文件名: PlayerController.ts
// 功能：逃生者角色移动控制（基于Transform，相对摄像机方向）

import { _decorator, Component, Node, Vec3, Quat } from 'cc';
import { Joystick } from './Joystick';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(Joystick)
    public joystick: Joystick = null!; // 虚拟摇杆引用

    @property(Node)
    public cameraNode: Node = null!; // 摄像机节点引用

    @property
    public moveSpeed: number = 5.0; // 移动速度（单位/秒），逃生者基础速度100%

    @property
    public rotationSpeed: number = 10.0; // 转身速度

    private _moveDirection: Vec3 = new Vec3(); // 世界空间移动方向
    private _targetRotation: Quat = new Quat(); // 目标旋转

    update(deltaTime: number) {
        if (!this.joystick || !this.cameraNode) return;

        // 获取摇杆输入
        const joyDir = this.joystick.getDirection();
        const joyStrength = this.joystick.getStrength();

        if (joyStrength > 0.01) {
            // 计算相对于摄像机的移动方向
            this.calculateMoveDirection(joyDir);

            // 移动角色
            const movement = this._moveDirection.clone().multiplyScalar(this.moveSpeed * joyStrength * deltaTime);
            const currentPos = this.node.position.clone();
            currentPos.add(movement);
            this.node.setPosition(currentPos);

            // 旋转角色面向移动方向
            this.rotateTowardsMovement(deltaTime);
        }
    }

    /**
     * 计算相对于摄像机的移动方向
     * @param joyDir 摇杆输入方向（2D）
     */
    private calculateMoveDirection(joyDir: Vec3 | { x: number; y: number }) {
        // 获取摄像机的前方和右方向（世界空间）
        const cameraForward = new Vec3();
        const cameraRight = new Vec3();

        // 摄像机的前方向
        this.cameraNode.getWorldRotation(new Quat()).getAxisZ(cameraForward);
        cameraForward.negative(); // Cocos中Z轴负方向是前方

        // 摄像机的右方向
        this.cameraNode.getWorldRotation(new Quat()).getAxisX(cameraRight);

        // 将前方和右方向投影到水平面（Y=0）
        cameraForward.y = 0;
        cameraForward.normalize();

        cameraRight.y = 0;
        cameraRight.normalize();

        // 组合摇杆输入和摄像机方向
        // 摇杆Y对应前后，摇杆X对应左右
        this._moveDirection.set(0, 0, 0);
        this._moveDirection.add(cameraForward.multiplyScalar(joyDir.y)); // 前后
        this._moveDirection.add(cameraRight.multiplyScalar(joyDir.x));   // 左右
        this._moveDirection.normalize();
    }

    /**
     * 平滑旋转角色面向移动方向
     */
    private rotateTowardsMovement(deltaTime: number) {
        if (this._moveDirection.lengthSqr() < 0.01) return;

        // 计算目标旋转（朝向移动方向）
        const targetEuler = new Vec3();
        targetEuler.y = Math.atan2(this._moveDirection.x, this._moveDirection.z) * (180 / Math.PI);

        Quat.fromEuler(this._targetRotation, 0, targetEuler.y, 0);

        // 平滑插值到目标旋转
        const currentRotation = this.node.rotation.clone();
        Quat.slerp(currentRotation, currentRotation, this._targetRotation, this.rotationSpeed * deltaTime);
        this.node.setRotation(currentRotation);
    }

    /**
     * 设置移动速度（用于后续追捕者115%速度）
     */
    public setMoveSpeed(speed: number) {
        this.moveSpeed = speed;
    }

    /**
     * 获取当前移动方向（用于动画系统）
     */
    public getMoveDirection(): Vec3 {
        return this._moveDirection.clone();
    }

    /**
     * 是否正在移动
     */
    public isMoving(): boolean {
        return this.joystick.isActive() && this.joystick.getStrength() > 0.01;
    }
}
