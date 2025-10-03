// 文件名: CharacterAnimationController.ts
// 功能：角色动画控制器（任务3.1）
// 支持逃生者和追捕者的动画状态管理

import { _decorator, Component, Node, AnimationComponent, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 动画状态枚举
 */
export enum AnimationState {
    IDLE = 'idle',       // 待机
    RUN = 'run',         // 跑步
    ATTACK = 'attack'    // 攻击（仅追捕者）
}

/**
 * 角色类型枚举
 */
export enum CharacterType {
    SURVIVOR = 'survivor',  // 逃生者
    HUNTER = 'hunter'       // 追捕者
}

@ccclass('CharacterAnimationController')
export class CharacterAnimationController extends Component {
    @property({ type: AnimationComponent })
    public animationComponent: AnimationComponent | null = null; // 动画组件引用

    @property({ type: AnimationClip })
    public idleClip: AnimationClip | null = null; // idle动画剪辑

    @property({ type: AnimationClip })
    public runClip: AnimationClip | null = null; // run动画剪辑

    @property({ type: AnimationClip })
    public attackClip: AnimationClip | null = null; // attack动画剪辑（可选，追捕者用）

    @property
    public characterType: CharacterType = CharacterType.SURVIVOR; // 角色类型

    @property
    public crossFadeDuration: number = 0.2; // 动画过渡时长（秒）

    @property
    public attackAnimationDuration: number = 1.0; // 攻击动画时长（秒）

    @property
    public autoFindAnimation: boolean = true; // 自动查找动画组件

    private _currentState: AnimationState = AnimationState.IDLE; // 当前动画状态
    private _isAttacking: boolean = false; // 是否正在攻击中

    start() {
        // 自动查找动画组件
        if (this.autoFindAnimation && !this.animationComponent) {
            this.animationComponent = this.node.getComponent(AnimationComponent);
            if (!this.animationComponent) {
                console.error('[CharacterAnimationController] 未找到AnimationComponent组件！');
                return;
            }
        }

        // 验证必需的动画剪辑
        if (!this.idleClip) {
            console.warn('[CharacterAnimationController] 缺少idle动画剪辑！');
        }
        if (!this.runClip) {
            console.warn('[CharacterAnimationController] 缺少run动画剪辑！');
        }

        // ✅ 任务3.1 Bug修复：自动获取攻击动画时长
        if (this.attackClip && this.characterType === CharacterType.HUNTER) {
            this.attackAnimationDuration = this.attackClip.duration;
            console.log(`[CharacterAnimationController] 自动检测攻击动画时长：${this.attackAnimationDuration.toFixed(2)}s`);
        }

        // 播放初始动画
        this.playIdle();

        console.log(`[CharacterAnimationController] ${this.characterType} 动画控制器初始化完成`);
    }

    // ============ 动画播放接口 ============

    /**
     * 播放待机动画
     */
    public playIdle() {
        if (this._isAttacking) return; // 攻击中不切换

        if (this._currentState === AnimationState.IDLE) return; // 已经是待机状态

        this._currentState = AnimationState.IDLE;
        this.crossFadeToClip(this.idleClip, 'idle');
    }

    /**
     * 播放跑步动画
     */
    public playRun() {
        if (this._isAttacking) return; // 攻击中不切换

        if (this._currentState === AnimationState.RUN) return; // 已经是跑步状态

        this._currentState = AnimationState.RUN;
        this.crossFadeToClip(this.runClip, 'run');
    }

    /**
     * 播放攻击动画（仅追捕者）
     */
    public playAttack() {
        if (this.characterType !== CharacterType.HUNTER) {
            console.warn('[CharacterAnimationController] 只有追捕者才能播放攻击动画');
            return;
        }

        if (!this.attackClip) {
            console.error('[CharacterAnimationController] 缺少attack动画剪辑！');
            return;
        }

        if (this._isAttacking) {
            console.log('[CharacterAnimationController] 攻击动画正在播放中，跳过');
            return;
        }

        console.log('[CharacterAnimationController] 播放攻击动画');

        this._isAttacking = true;
        this._currentState = AnimationState.ATTACK;

        // 播放攻击动画（不循环）
        if (this.animationComponent) {
            this.animationComponent.crossFade(this.attackClip.name, this.crossFadeDuration);

            // 攻击动画播放完后自动切换回待机
            this.scheduleOnce(() => {
                this._isAttacking = false;
                this.playIdle();
            }, this.attackAnimationDuration);
        }
    }

    /**
     * 根据移动状态自动切换动画
     * @param isMoving 是否正在移动
     */
    public updateMovementAnimation(isMoving: boolean) {
        if (isMoving) {
            this.playRun();
        } else {
            this.playIdle();
        }
    }

    // ============ 内部方法 ============

    /**
     * 交叉淡入淡出到指定动画剪辑
     */
    private crossFadeToClip(clip: AnimationClip | null, clipName: string) {
        if (!this.animationComponent) {
            console.error('[CharacterAnimationController] animationComponent未绑定！');
            return;
        }

        if (!clip) {
            console.error(`[CharacterAnimationController] ${clipName}动画剪辑未绑定！`);
            return;
        }

        // 使用crossFade实现平滑过渡
        this.animationComponent.crossFade(clip.name, this.crossFadeDuration);

        // console.log(`[CharacterAnimationController] 切换到 ${clipName} 动画`);
    }

    // ============ 查询接口 ============

    /**
     * 获取当前动画状态
     */
    public getCurrentState(): AnimationState {
        return this._currentState;
    }

    /**
     * 是否正在攻击中
     */
    public isAttacking(): boolean {
        return this._isAttacking;
    }

    /**
     * 是否正在播放指定动画
     */
    public isPlaying(state: AnimationState): boolean {
        return this._currentState === state;
    }

    // ============ 调试功能 ============

    /**
     * 获取动画状态信息（调试用）
     */
    public getAnimationInfo(): string {
        return `状态:${this._currentState}, 攻击中:${this._isAttacking}, 类型:${this.characterType}`;
    }

    /**
     * 强制切换到指定状态（调试用）
     */
    public forceSetState(state: AnimationState) {
        this._currentState = state;

        switch (state) {
            case AnimationState.IDLE:
                this.crossFadeToClip(this.idleClip, 'idle');
                break;
            case AnimationState.RUN:
                this.crossFadeToClip(this.runClip, 'run');
                break;
            case AnimationState.ATTACK:
                if (this.attackClip) {
                    this.crossFadeToClip(this.attackClip, 'attack');
                }
                break;
        }
    }
}
