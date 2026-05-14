/**
 * settlement/types.ts — 结算演出接口定义（Cocos 版）
 *
 * 移除所有 React setState 签名，改为平台无关的回调接口。
 * UI 层通过实现 SettlementCallbacks 来响应逻辑层的结算事件。
 */

import type { Die, GameState, Enemy, HandResult, StatusEffect } from '../../types/game';
import type { ExpectedOutcomeResult } from '../expectedOutcomeTypes';

// ============================================================
// 回调接口 — UI 层实现，逻辑层调用
// ============================================================

/** 结算演出的 UI 回调（平台无关） */
export interface SettlementCallbacks {
  /** 更新结算面板数据 */
  onSettlementDataChanged: (data: SettlementData | null) => void;
  /** 更新结算阶段标识 */
  onSettlementPhaseChanged: (phase: string | null) => void;
  /** 显示/隐藏遗物面板 */
  onShowRelicPanel: (show: boolean) => void;
  /** 显示伤害覆盖层 */
  onShowDamageOverlay: (info: { damage: number; armor: number; heal: number } | null) => void;
  /** 触发屏幕震动 */
  onScreenShake: (active: boolean) => void;
  /** 高亮闪烁遗物 */
  onFlashRelics: (relicIds: string[]) => void;
  /** 更新游戏状态 */
  onGameStateChanged: (updater: (prev: GameState) => GameState) => void;
  /** 添加日志 */
  addLog: (msg: string) => void;
  /** 显示 Toast 提示 */
  addToast: (msg: string, type?: string, options?: { icon?: string; relicId?: string }) => void;
  /** 显示浮动文字 */
  addFloatingText: (text: string, color: string, icon?: string, target?: string, persistent?: boolean) => void;
  /** 播放音效 */
  playSound: (id: string) => void;
  /** 结算 tick 音效 */
  playSettlementTick: (idx: number) => void;
  /** 乘数 tick 音效 */
  playMultiplierTick: (idx: number) => void;
  /** 重击音效 */
  playHeavyImpact: (intensity: number) => void;
}

// ============================================================
// Context 接口
// ============================================================

export interface SettlementContext {
  // State 快照
  game: GameState;
  gameRef: { current: GameState };
  enemies: Enemy[];
  dice: Die[];
  currentHands: HandResult;
  selected: Die[];
  outcome: ExpectedOutcomeResult;
  targetEnemy: Enemy;
  comboFinisherBonus: number;
  straightUpgrade: number;
  isAoeActive: boolean;

  // UI 回调（平台无关）
  callbacks: SettlementCallbacks;
}

/** 结算面板数据 */
export interface SettlementData {
  bestHand: string;
  selectedDice: Die[];
  diceScores: number[];
  baseValue: number;
  mult: number;
  currentBase: number;
  currentMult: number;
  triggeredEffects: {
    name: string;
    detail: string;
    icon?: string;
    type: 'damage' | 'mult' | 'status' | 'heal' | 'armor';
    rawValue?: number;
    rawMult?: number;
    relicId?: string;
  }[];
  currentEffectIdx: number;
  finalDamage: number;
  finalArmor: number;
  finalHeal: number;
  statusEffects: StatusEffect[];
  isSameElement?: boolean;
}
