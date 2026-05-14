/**
 * sound.ts — 音效模块统一导出入口（Cocos 版）
 *
 * 逻辑层通过此模块播放音效，内部通过 EventBus 派发事件，
 * 由 AudioManager 组件监听并实际播放。
 * 逻辑层完全不依赖 Cocos 引擎 API。
 */

import { EventBus, GameEvents } from '../managers/EventBus';

// ── 音效类型定义 ──

export type SoundType =
  | 'roll' | 'select' | 'hit' | 'armor' | 'heal' | 'enemy'
  | 'victory' | 'defeat' | 'skill' | 'coin' | 'levelup'
  | 'critical' | 'poison' | 'burn' | 'shield_break' | 'reroll'
  | 'map_move' | 'shop_buy' | 'campfire' | 'event' | 'boss_appear'
  | 'enemy_death' | 'player_death' | 'boss_laugh' | 'boss_roar'
  | 'gate_close' | 'enemy_speak' | 'player_attack' | 'player_aoe'
  | 'enemy_defend' | 'enemy_skill' | 'enemy_heal' | 'dice_lock'
  | 'turn_end' | 'relic_activate';

// ── 播放接口 ──

/**
 * 播放音效 — 逻辑层唯一入口
 * 通过 EventBus 派发，UI 层的 AudioManager 负责实际播放
 */
export function playSound(id: SoundType | string): void {
  EventBus.emit(GameEvents.PLAY_SFX, id);
}

/** 结算 tick 音效 */
export function playSettlementTick(idx: number): void {
  EventBus.emit(GameEvents.PLAY_SFX, 'settlement_tick', idx);
}

/** 乘数 tick 音效 */
export function playMultiplierTick(idx: number): void {
  EventBus.emit(GameEvents.PLAY_SFX, 'multiplier_tick', idx);
}

/** 重击音效 */
export function playHeavyImpact(intensity: number): void {
  EventBus.emit(GameEvents.PLAY_SFX, 'heavy_impact', intensity);
}

// ── BGM 控制 ──

export function playBGM(type: string): void {
  EventBus.emit(GameEvents.PLAY_BGM, type);
}

export function stopBGM(): void {
  EventBus.emit(GameEvents.PLAY_BGM, '__stop__');
}

// ── 音量/开关状态（由 GameManager 持久化管理）──

let _sfxEnabled = true;
let _bgmEnabled = true;
let _masterVolume = 1.0;

export function isSfxEnabled(): boolean { return _sfxEnabled; }
export function isBgmEnabled(): boolean { return _bgmEnabled; }
export function getMasterVolume(): number { return _masterVolume; }

export function setSfxEnabled(v: boolean): void { _sfxEnabled = v; }
export function setBgmEnabled(v: boolean): void { _bgmEnabled = v; }
export function setMasterVolume(v: number): void { _masterVolume = v; }
