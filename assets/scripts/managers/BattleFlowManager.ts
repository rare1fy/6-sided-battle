/**
 * BattleFlowManager — 战斗流程管理器（逻辑层 ↔ 表现层桥接）
 *
 * 职责：
 * 1. 进入战斗 → 调用 logic/battleInit 构建初始状态 → 驱动 BattleController 生成敌人/骰子
 * 2. 玩家回合 → 投骰/选骰/出牌 → 调用 logic/ 计算伤害 → 驱动表现层播放动画
 * 3. 敌人回合 → 调用 logic/enemyAI → 驱动表现层播放攻击动画
 * 4. 回合结束 → 调用 logic/drawPhase → 抽新骰子
 *
 * 设计原则：
 * - 逻辑层通过 GameStore 的 setGame/setEnemies/setDice 读写状态
 * - 表现层通过 EventBus 监听状态变化来刷新 UI
 * - 本模块负责"编排"：按正确顺序调用逻辑函数 + 触发表现事件
 */

import { Vec3 } from 'cc';
import type { GameState, Enemy, Die, MapNode } from '../types/game';
import type { BattleController } from '../scenes/BattleController';
import { EventBus, GameEvents } from './EventBus';
import {
  getGame, getEnemies, getDice,
  setGame, setEnemies, setDice,
  initStore,
} from './GameStore';
import { buildBattleGameState, performDiceRollAnimation } from '../logic/battleInit';
import { executeEnemyTurn, type EnemyAICallbacks } from '../logic/enemyAI';
import { executeDrawPhase, type DrawPhaseContext } from '../logic/drawPhase';

// ============================================================
// 状态
// ============================================================

let _controller: BattleController | null = null;
let _rerollCount = 0;

// ============================================================
// 初始化
// ============================================================

/**
 * 绑定 BattleController 实例（场景加载时由 BattleController.start() 调用）
 */
export function bindController(ctrl: BattleController): void {
  _controller = ctrl;
}

/**
 * 解绑（场景销毁时调用）
 */
export function unbindController(): void {
  _controller = null;
}

// ============================================================
// 战斗入口
// ============================================================

/**
 * 开始战斗
 * @param prevGame 进入战斗前的 GameState
 * @param node 当前地图节点
 * @param waves 敌人波次数据
 */
export function startBattle(
  prevGame: GameState,
  node: MapNode,
  waves: { enemies: Enemy[] }[],
): void {
  const firstWave = waves[0]?.enemies ?? [];

  // 1. 构建战斗初始状态
  const battleState = buildBattleGameState({
    prev: prevGame,
    node,
    waves,
    firstWave,
    battleChallenge: null!,
  });

  // 2. 初始化 Store
  initStore(battleState, firstWave, []);

  // 3. 驱动表现层生成敌人
  if (_controller) {
    const slots = [_controller.enemySlot1, _controller.enemySlot2, _controller.enemySlot3];
    for (let i = 0; i < firstWave.length && i < slots.length; i++) {
      _controller.spawnEnemy(slots[i], firstWave[i]);
    }
    // 初始化血条
    _controller.playerHpBar?.setProgress(battleState.hp, battleState.maxHp);
  }

  // 4. 触发战斗开始事件
  EventBus.emit(GameEvents.BATTLE_START, { enemies: firstWave });

  // 5. 执行首次抽骰
  _startPlayerTurn();
}

// ============================================================
// 玩家回合
// ============================================================

function _startPlayerTurn(): void {
  EventBus.emit(GameEvents.TURN_START, { turn: getGame().battleTurn });

  // 抽骰子（首回合用 drawCount 数量从骰子库抽取）
  const game = getGame();
  const drawCount = Math.min(6, game.drawCount);

  // 简化版：直接从 diceBag 抽取
  const bag = [...game.diceBag];
  const drawn: Die[] = [];
  for (let i = 0; i < drawCount && bag.length > 0; i++) {
    const idx = Math.floor(Math.random() * bag.length);
    const defId = bag.splice(idx, 1)[0];
    drawn.push({
      uid: `dice_${Date.now()}_${i}`,
      diceDefId: defId,
      value: Math.floor(Math.random() * 6) + 1,
      element: 'physical',
      rolling: false,
      selected: false,
      spent: false,
      kept: false,
    } as Die);
  }

  // 更新状态
  setGame(prev => ({ ...prev, diceBag: bag }));
  setDice(drawn);

  // 驱动表现层显示骰子卡牌
  if (_controller) {
    _controller.spawnDiceCards(drawn.map(d => ({
      id: d.uid,
      diceDefId: d.diceDefId,
      value: d.value,
      element: d.element,
    })));
  }

  EventBus.emit(GameEvents.DICE_ROLLED, { dice: drawn });
}

// ============================================================
// 玩家操作：出牌
// ============================================================

/**
 * 玩家选中骰子后点击"出牌"
 * @param selectedDiceIds 选中的骰子 uid 列表
 */
export function playSelectedDice(selectedDiceIds: string[]): void {
  if (selectedDiceIds.length === 0) return;

  const game = getGame();
  const dice = getDice();
  const enemies = getEnemies();

  // 找到选中的骰子
  const selectedDice = dice.filter(d => selectedDiceIds.includes(d.uid));
  if (selectedDice.length === 0) return;

  // 计算伤害（简化版：骰子点数之和）
  const totalDamage = selectedDice.reduce((sum, d) => sum + d.value, 0);

  // 找到目标敌人
  const targetUid = game.targetEnemyUid;
  const targetEnemy = enemies.find(e => e.uid === targetUid) ?? enemies.find(e => e.hp > 0);

  if (!targetEnemy) return;

  // 应用伤害
  const newHp = Math.max(0, targetEnemy.hp - totalDamage);
  setEnemies(prev => prev.map(e =>
    e.uid === targetEnemy.uid ? { ...e, hp: newHp } : e,
  ));

  // 标记骰子为已使用
  setDice(prev => prev.map(d =>
    selectedDiceIds.includes(d.uid) ? { ...d, spent: true, selected: false } : d,
  ));

  // 减少出牌次数
  setGame(prev => ({ ...prev, playsLeft: prev.playsLeft - 1 }));

  // 驱动表现层
  if (_controller) {
    // 飘字
    const enemyWorldPos = new Vec3(0, 100, 0); // TODO: 从敌人节点获取实际位置
    _controller.spawnDamageNumber(enemyWorldPos, totalDamage, 'damage');

    // 震屏（大伤害时）
    if (totalDamage >= 15) {
      _controller.shakeCamera(totalDamage > 30 ? 10 : 5);
    }

    // 更新血条
    _controller.playerHpBar?.setProgress(getGame().hp, getGame().maxHp);
  }

  // 触发事件
  EventBus.emit(GameEvents.DAMAGE_DEALT, {
    target: targetEnemy.uid,
    amount: totalDamage,
    dice: selectedDice,
  });

  // 检查敌人是否死亡
  if (newHp <= 0) {
    _onEnemyDeath(targetEnemy.uid);
  }
}

// ============================================================
// 玩家操作：结束回合
// ============================================================

/**
 * 玩家点击"结束回合"
 */
export function endPlayerTurn(): void {
  EventBus.emit(GameEvents.TURN_END, { turn: getGame().battleTurn });

  // 进入敌人回合
  _executeEnemyTurn();
}

// ============================================================
// 敌人回合
// ============================================================

async function _executeEnemyTurn(): Promise<void> {
  const game = getGame();
  const enemies = getEnemies();
  const dice = getDice();

  // 构建回调适配器（将逻辑层回调映射到 Cocos 表现层）
  const callbacks: EnemyAICallbacks = {
    setGame,
    setEnemies,
    setEnemyEffects: () => {},
    setDyingEnemies: () => {},
    setEnemyEffectForUid: (uid, effect) => {
      // 驱动表现层播放敌人特效
      if (_controller && effect === 'attack') {
        const view = _controller['_enemyViews'].find(v => v.enemyUid === uid);
        if (view) view.playAttackAnim();
      }
    },
    enemyPreAction: async () => true,
    addLog: (msg) => { console.log('[Battle]', msg); },
    addFloatingText: (text, color, icon, target) => {
      if (_controller && target === 'player') {
        // 玩家受伤飘字
        const value = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(value)) {
          _controller.spawnDamageNumber(new Vec3(0, 200, 0), value, 'damage');
        }
      }
      EventBus.emit(GameEvents.SHOW_FLOAT_TEXT, { text, color, icon, target });
    },
    addToast: () => {},
    playSound: (id) => { EventBus.emit(GameEvents.PLAY_SFX, { id }); },
    setScreenShake: (v) => {
      if (v && _controller) _controller.shakeCamera();
    },
    setPlayerEffect: () => {},
    showEnemyQuote: () => {},
    scheduleDelayedQuote: () => {},
    getEnemyQuotes: () => undefined,
    pickQuote: () => null,
    setRerollCount: (v) => {
      _rerollCount = typeof v === 'function' ? v(_rerollCount) : v;
    },
    setWaveAnnouncement: () => {},
    setDice: (v) => { setDice(v); },
    rollAllDice: () => { /* TODO: 实现重投逻辑 */ },
    buildRelicContext: (() => ({})) as any,
    hasFatalProtection: () => false,
    triggerHourglass: (relics) => relics,
    handleVictory: () => { _onBattleVictory(); },
    gameRef: { get current() { return getGame(); } },
    enemiesRef: { get current() { return getEnemies(); } },
  };

  // 执行敌人回合
  const result = await executeEnemyTurn(game, enemies, dice, _rerollCount, callbacks);

  // 更新表现层血条
  if (_controller) {
    _controller.playerHpBar?.setProgress(getGame().hp, getGame().maxHp);
  }

  // 检查玩家是否死亡
  if (result.hp <= 0) {
    EventBus.emit(GameEvents.PLAYER_DIED, {});
    return;
  }

  // 如果没有波次转换，开始新的玩家回合
  if (!result.waveTransitioned) {
    _startPlayerTurn();
  }
}

// ============================================================
// 敌人死亡
// ============================================================

function _onEnemyDeath(uid: string): void {
  EventBus.emit(GameEvents.ENEMY_DIED, { uid });

  // 驱动表现层播放死亡动画
  if (_controller) {
    _controller.removeEnemy(uid);
  }

  // 从状态中移除
  setEnemies(prev => prev.filter(e => e.uid !== uid));

  // 检查是否全部死亡
  const remaining = getEnemies().filter(e => e.hp > 0);
  if (remaining.length === 0) {
    _onBattleVictory();
  }
}

// ============================================================
// 战斗胜利
// ============================================================

function _onBattleVictory(): void {
  setGame(prev => ({
    ...prev,
    phase: 'loot',
    stats: { ...prev.stats, battlesWon: prev.stats.battlesWon + 1 },
  }));
  EventBus.emit(GameEvents.BATTLE_END, { result: 'win' });
}

// ============================================================
// 玩家操作：重投骰子
// ============================================================

/**
 * 重投未选中的骰子
 */
export function rerollDice(): void {
  const game = getGame();
  if (game.freeRerollsLeft <= 0) return;

  setGame(prev => ({ ...prev, freeRerollsLeft: prev.freeRerollsLeft - 1 }));
  _rerollCount++;

  // 重投未选中的骰子
  setDice(prev => prev.map(d => {
    if (d.selected || d.spent) return d;
    return {
      ...d,
      value: Math.floor(Math.random() * 6) + 1,
      rolling: false,
    };
  }));

  // 刷新表现层
  if (_controller) {
    _controller.spawnDiceCards(getDice().filter(d => !d.spent).map(d => ({
      id: d.uid,
      diceDefId: d.diceDefId,
      value: d.value,
      element: d.element,
    })));
  }
}
