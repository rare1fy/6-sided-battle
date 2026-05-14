/**
 * UI 辅助数据 — Cocos Creator 版
 *
 * 从 PixiJS 版 utils/uiHelpers.tsx 提取的纯数据部分
 * 去除了 React CSS class 相关逻辑（Cocos 不需要）
 */

import { DiceElement } from '../types/game';

/** 元素名称映射（用于日志和 UI 显示） */
export const ELEMENT_NAMES: Record<DiceElement, string> = {
    normal: '普通',
    fire: '火',
    ice: '冰',
    thunder: '雷',
    poison: '毒',
    holy: '圣',
    shadow: '影',
    wind: '风',
};

/** 元素颜色映射（HEX，用于 Cocos Label / Sprite 着色） */
export const ELEMENT_COLORS: Record<DiceElement, string> = {
    normal: '#8899aa',
    fire: '#e07830',
    ice: '#30a8d0',
    thunder: '#8060c0',
    poison: '#70c030',
    holy: '#d4a030',
    shadow: '#6a4a8a',
    wind: '#40b0a0',
};
