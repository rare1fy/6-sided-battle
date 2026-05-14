/**
 * ClassSelectController — 职业选择场景控制器
 *
 * 职责：
 * 1. 遍历 CLASS_LIST，为每个职业实例化 ClassCard 预制体
 * 2. 点击卡片 → 高亮 + 显示详情
 * 3. 确认按钮 → GameManager 存储选择 → 进入 BattleScene
 */

import { _decorator, Component, Node, Label, Prefab, instantiate, Button, director } from 'cc';
import { CLASS_LIST, ClassId, ClassDef } from '../data/classes';
import { ClassCardItem } from './ClassCardItem';
import { GameManager } from '../managers/GameManager';
import { EventBus, GameEvents } from '../managers/EventBus';

const { ccclass, property } = _decorator;

@ccclass('ClassSelectController')
export class ClassSelectController extends Component {

    // ── Inspector 绑定 ──

    @property(Node)
    cardContainer: Node = null!;

    @property(Prefab)
    classCardPrefab: Prefab = null!;

    @property(Label)
    titleLabel: Label = null!;

    @property(Label)
    classNameLabel: Label = null!;

    @property(Label)
    classDescLabel: Label = null!;

    @property(Label)
    statsLabel: Label = null!;

    @property(Node)
    detailPanel: Node = null!;

    @property(Button)
    confirmButton: Button = null!;

    // ── 私有成员 ──

    private _selectedClassId: ClassId | null = null;
    private _cardItems: ClassCardItem[] = [];

    // ── 生命周期 ──

    protected onLoad(): void {
        this.titleLabel.string = '选择你的职业';
        this.detailPanel.active = false;
        this._initCards();
        this._updateConfirmButton();
    }

    protected onDestroy(): void {
        this._cardItems = [];
    }

    // ── 公开方法 ──

    public selectClass(classId: ClassId): void {
        this._selectedClassId = classId;
        const classDef = CLASS_LIST.find(c => c.id === classId);
        if (!classDef) return;

        // 更新选中高亮
        for (const card of this._cardItems) {
            card.setSelected(card.node.name === `ClassCard_${classId}`);
        }

        // 更新详情面板
        this.detailPanel.active = true;
        this.classNameLabel.string = classDef.name;
        this.classDescLabel.string = classDef.description;
        this.statsLabel.string = [
            `HP: ${classDef.hp}`,
            `抽骰: ${classDef.drawCount}`,
            `出牌: ${classDef.maxPlays}`,
            `重投: ${classDef.freeRerolls}`,
        ].join('  ');

        this._updateConfirmButton();
    }

    public onConfirm(): void {
        if (!this._selectedClassId) return;

        const gm = GameManager.instance;
        if (gm) {
            // TODO: gm.gameState = initGame(this._selectedClassId);
        }

        EventBus.emit(GameEvents.SCENE_CHANGE, 'BattleScene');
        director.loadScene('Battle');
    }

    public onBack(): void {
        director.loadScene('Loading');
    }

    // ── 私有方法 ──

    private _initCards(): void {
        for (const classDef of CLASS_LIST) {
            const cardNode = instantiate(this.classCardPrefab);
            cardNode.name = `ClassCard_${classDef.id}`;
            cardNode.parent = this.cardContainer;

            const cardItem = cardNode.getComponent(ClassCardItem);
            if (cardItem) {
                cardItem.init(classDef, this.selectClass.bind(this));
                this._cardItems.push(cardItem);
            }
        }
    }

    private _updateConfirmButton(): void {
        const btnNode = this.confirmButton.node;
        if (this._selectedClassId) {
            btnNode.active = true;
            const label = btnNode.getChildByName('Label');
            if (label) {
                const lbl = label.getComponent(Label);
                if (lbl) {
                    const classDef = CLASS_LIST.find(c => c.id === this._selectedClassId);
                    lbl.string = `选择 ${classDef?.name} 开启冒险`;
                }
            }
        } else {
            btnNode.active = false;
        }
    }
}
