/**
 * sounds/combat.ts — 战斗音效桩（Cocos 版）
 *
 * 原版使用 Web Audio API 实时合成，Cocos 中改用预制 AudioClip。
 * 保留函数签名供编译兼容，实际不会被调用。
 *
 * 原始波形参数已归档至 docs/audio_design_reference.md
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Ctx = any; type Gain = any;

export const playHitSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playCriticalSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playArmorSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playShieldBreakSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playEnemySound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playPlayerAttackSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playPlayerAoeSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playEnemyDefendSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playEnemySkillSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
export const playSkillSound = (_ctx: Ctx, _now: number, _master: Gain, _vol: number) => {};
