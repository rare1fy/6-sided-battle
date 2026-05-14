/**
 * EventBus — 全局事件总线（替代 PixiJS 版的 EventEmitter）
 *
 * 用法：
 *   import { EventBus } from '../managers/EventBus';
 *   EventBus.emit('battle:damage', { target, amount });
 *   EventBus.on('battle:damage', this._onDamage, this);
 *   EventBus.off('battle:damage', this._onDamage, this);
 */

import { EventTarget } from 'cc';

export const EventBus = new EventTarget();

/**
 * 事件名常量 — 避免字符串拼写错误
 */
export const GameEvents = {
    // ── 场景流转 ──
    SCENE_CHANGE: 'scene:change',

    // ── 战斗 ──
    BATTLE_START: 'battle:start',
    BATTLE_END: 'battle:end',
    TURN_START: 'turn:start',
    TURN_END: 'turn:end',
    DICE_ROLLED: 'dice:rolled',
    DICE_PLAYED: 'dice:played',
    HAND_EVALUATED: 'hand:evaluated',

    // ── 伤害 ──
    DAMAGE_DEALT: 'damage:dealt',
    DAMAGE_TAKEN: 'damage:taken',
    ENEMY_DIED: 'enemy:died',
    PLAYER_DIED: 'player:died',

    // ── 遗物 ──
    RELIC_ACQUIRED: 'relic:acquired',
    RELIC_TRIGGERED: 'relic:triggered',

    // ── UI ──
    SHOW_FLOAT_TEXT: 'ui:floatText',
    SHOW_TOOLTIP: 'ui:tooltip',
    HIDE_TOOLTIP: 'ui:hideTooltip',
    SCREEN_SHAKE: 'ui:screenShake',

    // ── 音频 ──
    PLAY_SFX: 'audio:sfx',
    PLAY_BGM: 'audio:bgm',
} as const;
