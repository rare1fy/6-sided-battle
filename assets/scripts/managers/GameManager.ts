/**
 * GameManager — 全局游戏状态管理器（Cocos Autoload 单例）
 *
 * 职责：
 * 1. 持有 GameState（从 PixiJS 版 types/game.ts 迁移）
 * 2. 跨场景数据传递
 * 3. 存档/读档（微信小游戏用 wx.setStorage）
 *
 * 使用方式：
 * - 在 Cocos 编辑器中将此脚本挂到一个空节点上
 * - 将该节点设为常驻节点：director.addPersistRootNode(this.node)
 */

import { _decorator, Component, director, sys } from 'cc';
import type { GameState } from '../types/game';

const { ccclass, property } = _decorator;

const SAVE_KEY = 'dice_hero_save';

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;

    public static get instance(): GameManager {
        return GameManager._instance!;
    }

    /** 当前游戏状态 */
    private _gameState: GameState | null = null;

    public get gameState(): GameState | null {
        return this._gameState;
    }

    public set gameState(value: GameState | null) {
        this._gameState = value;
    }

    // ── 生命周期 ──

    protected onLoad(): void {
        if (GameManager._instance && GameManager._instance !== this) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        director.addPersistRootNode(this.node);
    }

    protected onDestroy(): void {
        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }

    // ── 存档 ──

    public saveGame(): void {
        if (!this._gameState) return;
        const json = JSON.stringify(this._gameState);
        sys.localStorage.setItem(SAVE_KEY, json);
    }

    public loadGame(): boolean {
        const json = sys.localStorage.getItem(SAVE_KEY);
        if (!json) return false;
        try {
            this._gameState = JSON.parse(json) as GameState;
            return true;
        } catch {
            return false;
        }
    }

    public clearSave(): void {
        sys.localStorage.removeItem(SAVE_KEY);
    }

    public hasSave(): boolean {
        return !!sys.localStorage.getItem(SAVE_KEY);
    }
}
