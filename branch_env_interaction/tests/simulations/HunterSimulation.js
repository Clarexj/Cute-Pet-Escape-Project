class HunterSimulation {
  constructor(name, options = {}) {
    const { position = { x: 0, y: 0, z: 0 } } = options;
    this.name = name;
    this.position = { ...position };
    this.isStunned = false;
    this.stunRemaining = 0;
    this.breakingBoard = null;
    this.progressLog = [];
  }

  applyStun(duration, reason = '') {
    this.isStunned = true;
    this.stunRemaining = duration;
    this.progressLog.push(`${this.name} 被眩晕${duration.toFixed(1)}秒 ${reason}`.trim());
  }

  advance(deltaSeconds) {
    if (!this.isStunned) {
      return;
    }
    this.stunRemaining -= deltaSeconds;
    if (this.stunRemaining <= 0) {
      this.recoverFromStun();
    }
  }

  recoverFromStun() {
    this.isStunned = false;
    this.stunRemaining = 0;
    this.progressLog.push(`${this.name} 结束眩晕`);
  }

  beginBoardBreak(board) {
    this.breakingBoard = board;
    this.progressLog.push(`${this.name} 开始踩碎 ${board.name}`);
  }

  reportBoardProgress(board, progress) {
    if (this.breakingBoard !== board) {
      return;
    }
    this.progressLog.push(`${this.name} 破坏进度 ${(progress * 100).toFixed(0)}%`);
  }

  endBoardBreak(board, success, reason) {
    if (this.breakingBoard !== board) {
      return;
    }
    this.progressLog.push(`${this.name} 停止破坏（${success ? '完成' : '中断'}：${reason}` + ')');
    this.breakingBoard = null;
  }
}

module.exports = {
  HunterSimulation,
};
