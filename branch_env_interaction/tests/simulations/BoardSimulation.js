const BoardState = Object.freeze({
  STANDING: 'standing',
  FALLING: 'falling',
  DOWN: 'down',
  BREAKING: 'breaking',
  BROKEN: 'broken',
});

class BoardSimulation {
  constructor(options = {}) {
    const {
      name = 'Board',
      fallDuration = 1,
      breakDuration = 2.5,
      stunRadius = 1.5,
      stunDuration = 1.5,
      stunOffset = 1.2,
      position = { x: 0, y: 0, z: 0 },
      fallDirection = { x: 0, y: 0, z: 1 },
    } = options;

    this.name = name;
    this.fallDuration = fallDuration;
    this.breakDuration = breakDuration;
    this.stunRadius = stunRadius;
    this.stunDuration = stunDuration;
    this.stunOffset = stunOffset;
    this.position = { ...position };
    this.fallDirection = BoardSimulation._normalize(fallDirection);

    this._state = BoardState.STANDING;
    this._fallTimer = 0;
    this._breakTimer = 0;
    this._breakingHunter = null;
    this._stunnedHunters = [];
    this._timeline = [];
  }

  get state() {
    return this._state;
  }

  get breakingHunter() {
    return this._breakingHunter;
  }

  get breakProgress() {
    if (this._state !== BoardState.BREAKING || !this.breakDuration) {
      return 0;
    }
    return Math.min(this._breakTimer / this.breakDuration, 1);
  }

  get timeline() {
    return [...this._timeline];
  }

  push(playerName = 'Player', nearbyHunters = []) {
    if (this._state !== BoardState.STANDING) {
      throw new Error(`${this.name} cannot be pushed while ${this._state}`);
    }

    this._timeline.push(`${playerName} 开始推倒 ${this.name}`);
    this._state = BoardState.FALLING;
    this._fallTimer = 0;
    this._pendingHunters = nearbyHunters;
  }

  startBreaking(hunter) {
    if (this._state !== BoardState.DOWN) {
      throw new Error(`${this.name} 不是可破坏状态`);
    }
    if (!hunter) {
      throw new Error('必须提供追捕者才能开始破坏');
    }

    this._state = BoardState.BREAKING;
    this._breakTimer = 0;
    this._breakingHunter = hunter;
    this._timeline.push(`${hunter.name} 开始踩碎 ${this.name}`);
    hunter.beginBoardBreak(this);
  }

  cancelBreaking(reason = 'cancelled') {
    if (this._state !== BoardState.BREAKING) {
      return;
    }
    const hunter = this._breakingHunter;
    if (hunter) {
      hunter.endBoardBreak(this, false, reason);
    }
    this._timeline.push(`${this.name} 破坏被中断：${reason}`);
    this._state = BoardState.DOWN;
    this._breakTimer = 0;
    this._breakingHunter = null;
  }

  advance(deltaSeconds) {
    if (deltaSeconds <= 0) {
      return;
    }

    if (this._state === BoardState.FALLING) {
      this._advanceFall(deltaSeconds);
    } else if (this._state === BoardState.BREAKING) {
      this._advanceBreaking(deltaSeconds);
    }

    // update stunned hunters to reduce timers
    if (this._stunnedHunters.length) {
      this._stunnedHunters.forEach(({ hunter, remaining }) => {
        hunter.advance(deltaSeconds);
        remaining -= deltaSeconds;
        if (remaining <= 0 && hunter.isStunned) {
          hunter.recoverFromStun();
        }
      });
    }
  }

  _advanceFall(deltaSeconds) {
    this._fallTimer += deltaSeconds;
    if (this._fallTimer < this.fallDuration) {
      return;
    }

    this._state = BoardState.DOWN;
    this._timeline.push(`${this.name} 倒下形成路障`);
    this._stunnedHunters = this._applyStunToNearbyHunters(this._pendingHunters || []);
    this._pendingHunters = [];
    if (this._stunnedHunters.length) {
      this._timeline.push(`${this.name} 砸中了 ${this._stunnedHunters.length} 名追捕者`);
    }
  }

  _advanceBreaking(deltaSeconds) {
    this._breakTimer += deltaSeconds;
    const hunter = this._breakingHunter;
    if (hunter) {
      hunter.reportBoardProgress(this, this.breakProgress);
    }

    if (this._breakTimer >= this.breakDuration) {
      this._state = BoardState.BROKEN;
      this._timeline.push(`${this.name} 被 ${hunter ? hunter.name : '未知追捕者'} 踩碎`);
      if (hunter) {
        hunter.endBoardBreak(this, true, 'complete');
      }
      this._breakingHunter = null;
    }
  }

  _applyStunToNearbyHunters(hunters) {
    if (!hunters.length) {
      return [];
    }

    const impactPoint = {
      x: this.position.x + this.fallDirection.x * this.stunOffset,
      y: this.position.y + this.fallDirection.y * this.stunOffset,
      z: this.position.z + this.fallDirection.z * this.stunOffset,
    };

    return hunters
      .map((hunter) => {
        const distance = BoardSimulation._distance(hunter.position, impactPoint);
        if (distance <= this.stunRadius) {
          hunter.applyStun(this.stunDuration, `${this.name} 砸中`);
          return { hunter, remaining: this.stunDuration };
        }
        return null;
      })
      .filter(Boolean);
  }

  static _normalize(vec) {
    const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    if (length === 0) {
      return { x: 0, y: 0, z: 1 };
    }
    return { x: vec.x / length, y: vec.y / length, z: vec.z / length };
  }

  static _distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

module.exports = {
  BoardSimulation,
  BoardState,
};
