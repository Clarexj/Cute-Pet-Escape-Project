class CabinetSimulation {
  constructor(options = {}) {
    const {
      name = 'Cabinet',
      hideDuration = 0.75,
      escapeCooldown = 0.5,
    } = options;

    this.name = name;
    this.hideDuration = hideDuration;
    this.escapeCooldown = escapeCooldown;

    this._occupant = null;
    this._hideTimer = 0;
    this._cooldownTimer = 0;
    this._timeline = [];
  }

  get occupant() {
    return this._occupant;
  }

  get timeline() {
    return [...this._timeline];
  }

  canEnter() {
    return !this._occupant && this._cooldownTimer <= 0;
  }

  tryEnter(playerName) {
    if (!this.canEnter()) {
      this._timeline.push(`${playerName} 尝试进入 ${this.name} 失败`);
      return false;
    }
    this._occupant = playerName;
    this._hideTimer = this.hideDuration;
    this._timeline.push(`${playerName} 潜入 ${this.name}`);
    return true;
  }

  forceDragOut(hunterName) {
    if (!this._occupant) {
      this._timeline.push(`${hunterName} 打开 ${this.name} 但无人可抓`);
      return null;
    }
    const player = this._occupant;
    this._occupant = null;
    this._cooldownTimer = this.escapeCooldown;
    this._timeline.push(`${hunterName} 把 ${player} 从 ${this.name} 拖出`);
    return player;
  }

  advance(deltaSeconds) {
    if (deltaSeconds <= 0) {
      return;
    }

    if (this._occupant) {
      this._hideTimer -= deltaSeconds;
      if (this._hideTimer <= 0) {
        this._timeline.push(`${this._occupant} 完成潜入冷却，可随时离开`);
        this._hideTimer = 0;
      }
    } else if (this._cooldownTimer > 0) {
      this._cooldownTimer = Math.max(0, this._cooldownTimer - deltaSeconds);
      if (this._cooldownTimer === 0) {
        this._timeline.push(`${this.name} 恢复可进入`);
      }
    }
  }

  leaveVoluntarily(playerName) {
    if (this._occupant !== playerName) {
      this._timeline.push(`${playerName} 试图从 ${this.name} 离开但不在里面`);
      return false;
    }
    this._occupant = null;
    this._cooldownTimer = this.escapeCooldown;
    this._timeline.push(`${playerName} 自行离开 ${this.name}`);
    return true;
  }
}

module.exports = {
  CabinetSimulation,
};
