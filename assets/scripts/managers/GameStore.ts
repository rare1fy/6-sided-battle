/**
 * GameStore — 全局游戏状态管理器（替代 React useState）
 *
 * 逻辑层通过 GameStore 读写状态，UI 层通过 EventBus 监听变化。
 * 所有 setGame(prev => ...) / setEnemies(prev => ...) / setDice(prev => ...)
 * 统一改为 GameStore.updateGame() / updateEnemies() / updateDice()。
 *
 * 设计原则：
 * - 逻辑层只依赖此模块，不依赖任何 Cocos API
 * - UI 层通过 EventBus 监听 STATE_CHANGED 事件来刷新显示
 * - 支持函数式更新（与 React setState 签名兼容，降低迁移成本）
 */

import type { GameState, Enemy, Die } from '../types/game';
import { EventBus } from './EventBus';

// ── 事件名 ──

export const StoreEvents = {
  GAME_CHANGED: 'store:game:changed',
  ENEMIES_CHANGED: 'store:enemies:changed',
  DICE_CHANGED: 'store:dice:changed',
} as const;

// ── 内部状态 ──

let _game: GameState = null!;
let _enemies: Enemy[] = [];
let _dice: Die[] = [];

// ── 读取 ──

export function getGame(): GameState { return _game; }
export function getEnemies(): Enemy[] { return _enemies; }
export function getDice(): Die[] { return _dice; }

// ── 写入（兼容 React setState 函数式更新签名）──

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
}

export function setGame(updater: Updater<GameState>): void {
  _game = resolve(updater, _game);
  EventBus.emit(StoreEvents.GAME_CHANGED, _game);
}

export function setEnemies(updater: Updater<Enemy[]>): void {
  _enemies = resolve(updater, _enemies);
  EventBus.emit(StoreEvents.ENEMIES_CHANGED, _enemies);
}

export function setDice(updater: Updater<Die[]>): void {
  _dice = resolve(updater, _dice);
  EventBus.emit(StoreEvents.DICE_CHANGED, _dice);
}

// ── 初始化（场景加载时调用）──

export function initStore(game: GameState, enemies: Enemy[], dice: Die[]): void {
  _game = game;
  _enemies = enemies;
  _dice = dice;
}

// ── 批量更新（减少事件派发次数）──

export function batchUpdate(updates: {
  game?: Updater<GameState>;
  enemies?: Updater<Enemy[]>;
  dice?: Updater<Die[]>;
}): void {
  if (updates.game !== undefined) _game = resolve(updates.game, _game);
  if (updates.enemies !== undefined) _enemies = resolve(updates.enemies, _enemies);
  if (updates.dice !== undefined) _dice = resolve(updates.dice, _dice);

  // 统一派发一次
  if (updates.game !== undefined) EventBus.emit(StoreEvents.GAME_CHANGED, _game);
  if (updates.enemies !== undefined) EventBus.emit(StoreEvents.ENEMIES_CHANGED, _enemies);
  if (updates.dice !== undefined) EventBus.emit(StoreEvents.DICE_CHANGED, _dice);
}
