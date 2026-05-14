/**
 * BattleController — 战斗场景主控制器（2D + UI 双层架构）
 *
 * Scene2D 层：敌人、玩家角色、特效、飘字（2D 世界坐标）
 * Canvas 层：血条、骰子手牌、按钮（UI 固定位置）
 */

import { _decorator, Component, Node, Label, Prefab, instantiate, Camera, director, tween, Vec3 } from 'cc';
import { EnemyView } from '../components/game/EnemyView';
import { DiceCardView, DiceCardData } from '../components/game/DiceCardView';
import { DamageNumberView } from '../components/game/DamageNumberView';
import { ProgressBarView } from '../components/ui/ProgressBarView';
import { ActionButtonView, ButtonStyle } from '../components/ui/ActionButtonView';
import { HeaderBarView } from '../components/ui/HeaderBarView';
import { EventBus, GameEvents } from '../managers/EventBus';
import { bindController, unbindController, startBattle, playSelectedDice, endPlayerTurn, rerollDice } from '../managers/BattleFlowManager';
import { getGame } from '../managers/GameStore';

const { ccclass, property } = _decorator;

@ccclass('BattleController')
export class BattleController extends Component {

    // ── Scene2D 层引用 ──

    @property(Node)
    enemySlot1: Node = null!;

    @property(Node)
    enemySlot2: Node = null!;

    @property(Node)
    enemySlot3: Node = null!;

    @property(Node)
    damageNumberLayer: Node = null!;

    @property(Node)
    effectLayer: Node = null!;

    @property(Camera)
    mainCamera: Camera = null!;

    // ── Canvas UI 层引用 ──

    @property(HeaderBarView)
    headerBar: HeaderBarView = null!;

    @property(ProgressBarView)
    playerHpBar: ProgressBarView = null!;

    @property(ProgressBarView)
    playerEnergyBar: ProgressBarView = null!;

    @property(Node)
    diceContainer: Node = null!;

    @property(Node)
    buffIconList: Node = null!;

    @property(ActionButtonView)
    rollButton: ActionButtonView = null!;

    @property(ActionButtonView)
    endTurnButton: ActionButtonView = null!;

    // ── Prefab 引用 ──

    @property(Prefab)
    enemyPrefab: Prefab = null!;

    @property(Prefab)
    diceCardPrefab: Prefab = null!;

    @property(Prefab)
    damageNumberPrefab: Prefab = null!;

    @property(Prefab)
    buffIconPrefab: Prefab = null!;

    // ── 私有成员 ──

    private _enemyViews: EnemyView[] = [];
    private _diceCardViews: DiceCardView[] = [];
    private _selectedDiceIds: string[] = [];

    // ── 生命周期 ──

    protected start(): void {
        bindController(this);
        this._initBattle();
        this._bindButtons();
    }

    protected onDestroy(): void {
        unbindController();
        this._enemyViews = [];
        this._diceCardViews = [];
    }

    // ── 战斗初始化 ──

    private _initBattle(): void {
        this.playerHpBar?.setProgress(100, 100);
        this.playerEnergyBar?.setProgress(0, 100);
    }

    // ── 按钮绑定 ──

    private _bindButtons(): void {
        if (this.rollButton) {
            this.rollButton.node.on('click', this._onRollClick, this);
        }
        if (this.endTurnButton) {
            this.endTurnButton.node.on('click', this._onEndTurnClick, this);
        }
    }

    private _onRollClick(): void {
        rerollDice();
    }

    private _onEndTurnClick(): void {
        endPlayerTurn();
    }

    /** 外部调用：出牌（由 UI 按钮触发） */
    public playDice(): void {
        playSelectedDice(this._selectedDiceIds);
    }

    // ── 相机震屏 ──

    public shakeCamera(intensity = 5, duration = 0.15): void {
        const cam = this.mainCamera.node;
        tween(cam)
            .to(0.03, { position: new Vec3(intensity, -intensity, 0) })
            .to(0.03, { position: new Vec3(-intensity, intensity, 0) })
            .to(0.03, { position: new Vec3(intensity, 0, 0) })
            .to(0.03, { position: new Vec3(0, -intensity, 0) })
            .to(0.03, { position: new Vec3(0, 0, 0) })
            .start();
    }

    // ── 敌人管理（Scene2D 层）──

    public spawnEnemy(slot: Node, enemyData: any): EnemyView | null {
        const node = instantiate(this.enemyPrefab);
        node.parent = slot;
        const view = node.getComponent(EnemyView);
        if (view) {
            view.init(enemyData);
            this._enemyViews.push(view);
        }
        return view;
    }

    public removeEnemy(uid: string): void {
        const idx = this._enemyViews.findIndex(v => v.enemyUid === uid);
        if (idx >= 0) {
            this._enemyViews[idx].playDeathAnim(() => {
                this._enemyViews.splice(idx, 1);
                if (this._enemyViews.length === 0) this._onBattleWin();
            });
        }
    }

    // ── 飘字（Scene2D 层）──

    public spawnDamageNumber(worldPos: Vec3, value: number, type: 'damage' | 'heal' | 'block' = 'damage'): void {
        const node = instantiate(this.damageNumberPrefab);
        node.parent = this.damageNumberLayer;
        const view = node.getComponent(DamageNumberView);
        if (view) view.show(value, worldPos, type);
    }

    // ── 骰子卡牌管理（Canvas UI 层）──

    public spawnDiceCards(diceList: DiceCardData[]): void {
        this._clearDiceCards();
        for (const data of diceList) {
            const node = instantiate(this.diceCardPrefab);
            node.parent = this.diceContainer;
            const view = node.getComponent(DiceCardView);
            if (view) {
                view.init(data, this._onDiceSelect.bind(this));
                this._diceCardViews.push(view);
            }
        }
    }

    private _clearDiceCards(): void {
        for (const view of this._diceCardViews) {
            if (view.node.isValid) view.node.destroy();
        }
        this._diceCardViews = [];
        this._selectedDiceIds = [];
    }

    private _onDiceSelect(diceId: string): void {
        const idx = this._selectedDiceIds.indexOf(diceId);
        if (idx >= 0) {
            this._selectedDiceIds.splice(idx, 1);
        } else {
            this._selectedDiceIds.push(diceId);
        }
        for (const view of this._diceCardViews) {
            view.setSelected(this._selectedDiceIds.includes(view.diceId));
        }
    }

    // ── 战斗结果 ──

    private _onBattleWin(): void {
        EventBus.emit(GameEvents.BATTLE_END, { result: 'win' });
        this.scheduleOnce(() => { director.loadScene('Settlement'); }, 1.0);
    }

    private _onBattleLose(): void {
        EventBus.emit(GameEvents.BATTLE_END, { result: 'lose' });
        this.scheduleOnce(() => { director.loadScene('Settlement'); }, 1.0);
    }
}