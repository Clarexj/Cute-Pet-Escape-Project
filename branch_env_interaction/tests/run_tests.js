#!/usr/bin/env node
const { BoardSimulation, BoardState } = require('./simulations/BoardSimulation');
const { HunterSimulation } = require('./simulations/HunterSimulation');
const { CabinetSimulation } = require('./simulations/CabinetSimulation');

function formatResult(result) {
  const status = result.pass ? '✅' : '❌';
  return `${status} ${result.name}\n${result.details}\n`;
}

function runBoardStunScenario() {
  const board = new BoardSimulation({ name: '走廊木板', fallDuration: 0.5 });
  const hunterA = new HunterSimulation('HunterA', { position: { x: 0.6, y: 0, z: 1.1 } });
  const hunterB = new HunterSimulation('HunterB', { position: { x: 2, y: 0, z: 0 } });

  board.push('玩家1', [hunterA, hunterB]);
  board.advance(0.5);

  const hunterAStunned = hunterA.isStunned;
  const hunterBStunned = hunterB.isStunned;
  const stateIsDown = board.state === BoardState.DOWN;

  const pass = hunterAStunned && !hunterBStunned && stateIsDown;
  const details = [
    `状态：${board.state}`,
    `HunterA 眩晕：${hunterA.isStunned}`,
    `HunterB 眩晕：${hunterB.isStunned}`,
    '时间线：',
    ...board.timeline,
    ...hunterA.progressLog,
  ].join('\n');

  return { name: '木板倒下眩晕判定', pass, details };
}

function runBoardBreakScenario() {
  const board = new BoardSimulation({ name: '大厅木板', fallDuration: 0.3, breakDuration: 2 });
  const hunter = new HunterSimulation('HunterA');

  board.push('玩家1');
  board.advance(0.3);
  board.startBreaking(hunter);
  board.advance(1);

  const midProgress = board.breakProgress;
  board.advance(1);

  const completed = board.state === BoardState.BROKEN;

  const pass = completed && midProgress > 0 && midProgress < 1 && !hunter.isStunned;
  const details = [
    `中途进度：${(midProgress * 100).toFixed(0)}%`,
    `最终状态：${board.state}`,
    '时间线：',
    ...board.timeline,
    ...hunter.progressLog,
  ].join('\n');

  return { name: '追捕者踩碎木板流程', pass, details };
}

function runBoardCancelScenario() {
  const board = new BoardSimulation({ name: '庭院木板', fallDuration: 0.2, breakDuration: 1.5 });
  const hunter = new HunterSimulation('HunterB');

  board.push('玩家1');
  board.advance(0.2);
  board.startBreaking(hunter);
  board.advance(0.8);
  board.cancelBreaking('玩家打断');

  const progressAfterCancel = board.breakProgress;
  const revertedState = board.state === BoardState.DOWN;
  const hunterReleased = hunter.breakingBoard === null;

  const pass = progressAfterCancel === 0 && revertedState && hunterReleased;
  const details = [
    `取消后进度：${(progressAfterCancel * 100).toFixed(0)}%`,
    `当前状态：${board.state}`,
    `追捕者释放：${hunterReleased}`,
    '时间线：',
    ...board.timeline,
    ...hunter.progressLog,
  ].join('\n');

  return { name: '破坏被中断的恢复', pass, details };
}

function runCabinetScenario() {
  const cabinet = new CabinetSimulation({ name: '更衣柜', hideDuration: 1, escapeCooldown: 0.5 });

  const enterSuccess = cabinet.tryEnter('玩家1');
  cabinet.advance(1);
  const voluntaryLeave = cabinet.leaveVoluntarily('玩家1');
  cabinet.advance(0.5);
  const reenter = cabinet.tryEnter('玩家1');
  cabinet.advance(1);
  const hunter = cabinet.forceDragOut('HunterA');

  const pass = enterSuccess && voluntaryLeave && reenter && hunter === '玩家1';
  const details = [
    `初次进入成功：${enterSuccess}`,
    `自行离开成功：${voluntaryLeave}`,
    `冷却后重新进入：${reenter}`,
    `被猎人拖出：${hunter}`,
    '时间线：',
    ...cabinet.timeline,
  ].join('\n');

  return { name: '柜子潜入与拉出流程', pass, details };
}

function runAllTests() {
  const scenarios = [
    runBoardStunScenario,
    runBoardBreakScenario,
    runBoardCancelScenario,
    runCabinetScenario,
  ];

  const results = scenarios.map((scenario) => {
    try {
      return scenario();
    } catch (error) {
      return { name: scenario.name, pass: false, details: `异常：${error.message}` };
    }
  });

  const header = '=== Cute Pet Escape 交互逻辑快速自测 ===\n';
  const summary = results
    .map((result) => formatResult(result))
    .join('\n');

  const stats = results.reduce(
    (acc, curr) => {
      acc.total += 1;
      if (curr.pass) acc.passed += 1;
      return acc;
    },
    { passed: 0, total: 0 }
  );

  const footer = `通过 ${stats.passed} / ${stats.total} 项\n`;

  console.log(header + summary + footer);

  const exitCode = stats.passed === stats.total ? 0 : 1;
  process.exit(exitCode);
}

runAllTests();
