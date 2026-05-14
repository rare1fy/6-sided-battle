/**
 * soundEffects.ts — 音效路由桩（Cocos 版）
 *
 * 原版使用 Web Audio API 实时合成音效，在 Cocos 中不可用。
 * 此文件保留接口签名供编译通过，实际音效播放由 AudioManager 通过预制音频文件实现。
 *
 * TODO: 后续用 Cocos AudioClip 资源替代代码合成音效
 */

export type SoundType =
  | 'roll' | 'select' | 'hit' | 'armor' | 'heal' | 'enemy'
  | 'victory' | 'defeat' | 'skill' | 'coin' | 'levelup'
  | 'critical' | 'poison' | 'burn' | 'shield_break' | 'reroll'
  | 'map_move' | 'shop_buy' | 'campfire' | 'event' | 'boss_appear'
  | 'dice_lock' | 'relic_activate' | 'turn_end'
  | 'enemy_defend' | 'enemy_skill' | 'enemy_heal' | 'player_attack' | 'player_aoe'
  | 'enemy_death' | 'player_death' | 'enemy_speak' | 'boss_laugh' | 'boss_roar' | 'gate_close';

/**
 * 音效 ID → AudioClip 资源路径映射
 * AudioManager 根据此映射加载并播放对应音频文件
 */
export const SOUND_CLIP_MAP: Record<SoundType, string> = {
  roll: 'audio/sfx/roll',
  select: 'audio/sfx/select',
  hit: 'audio/sfx/hit',
  armor: 'audio/sfx/armor',
  heal: 'audio/sfx/heal',
  enemy: 'audio/sfx/enemy',
  victory: 'audio/sfx/victory',
  defeat: 'audio/sfx/defeat',
  skill: 'audio/sfx/skill',
  coin: 'audio/sfx/coin',
  levelup: 'audio/sfx/levelup',
  critical: 'audio/sfx/critical',
  poison: 'audio/sfx/poison',
  burn: 'audio/sfx/burn',
  shield_break: 'audio/sfx/shield_break',
  reroll: 'audio/sfx/reroll',
  map_move: 'audio/sfx/map_move',
  shop_buy: 'audio/sfx/shop_buy',
  campfire: 'audio/sfx/campfire',
  event: 'audio/sfx/event',
  boss_appear: 'audio/sfx/boss_appear',
  dice_lock: 'audio/sfx/dice_lock',
  relic_activate: 'audio/sfx/relic_activate',
  turn_end: 'audio/sfx/turn_end',
  enemy_defend: 'audio/sfx/enemy_defend',
  enemy_skill: 'audio/sfx/enemy_skill',
  enemy_heal: 'audio/sfx/enemy_heal',
  player_attack: 'audio/sfx/player_attack',
  player_aoe: 'audio/sfx/player_aoe',
  enemy_death: 'audio/sfx/enemy_death',
  player_death: 'audio/sfx/player_death',
  enemy_speak: 'audio/sfx/enemy_speak',
  boss_laugh: 'audio/sfx/boss_laugh',
  boss_roar: 'audio/sfx/boss_roar',
  gate_close: 'audio/sfx/gate_close',
};

/**
 * playSound — 逻辑层不应直接调用此函数
 * 请使用 utils/sound.ts 的 playSound()，它通过 EventBus 派发
 * 此处保留仅为向后兼容
 */
export function playSound(type: SoundType): void {
  // No-op in Cocos — AudioManager handles playback via EventBus
}

/** 结算 tick（桩） */
export function playSettlementTick(_step: number): void { /* No-op */ }

/** 乘数 tick（桩） */
export function playMultiplierTick(_step: number): void { /* No-op */ }

/** 重击（桩） */
export function playHeavyImpact(_intensity?: number): void { /* No-op */ }
