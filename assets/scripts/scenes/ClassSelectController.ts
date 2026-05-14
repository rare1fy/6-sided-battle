/**
 * ClassSelectController — 职业选择场景控制器
 */

import { _decorator, Component, Node, Label, Prefab, instantiate, director } from 'cc';
import { CLASS_LIST, ClassId } from '../data/classes';
import { ClassCardItem } from '../components/game/ClassCardItem';
import { ActionButtonView, ButtonStyle } from '../components/ui/ActionButtonView';
import { HeaderBarView } from '../components/ui/HeaderBarView';
import { GameManager } from '../managers/GameManager';
import { EventBus, GameEvents } from '../managers/EventBus';

const { ccclass, property } = _decorator;

@ccclass('ClassSelectController')
export class ClassSelectController extends Component {

    @property(Node)
    cardContainer: Node = null!;

    @property(Prefab)
    classCardPrefab: Prefab = null!;

    @property(HeaderBarView)
    headerBar: HeaderBarView = null!;

    @property(Label)
    classNameLabel: Label = null!;

    @property(Label)
    classDescLabel: Label = null!;

    @property(Label)
    statsLabel: Label = null!;

    @property(Node)
    detailPanel: Node = null!;

    @property(ActionButtonView)
    confirmButton: ActionButtonView = null!;

    private _selectedClassId: ClassId | null = null;
    private _cardItems: ClassCardItem[] = [];

    protected onLoad(): void {
        this.headerBar.init({ title: '选择你的职业', showBack: false });
        this.detailPanel.active = false;
        this.confirmButton.init({
            label: '开始冒险',
            style: ButtonStyle.PRIMARY,
            enabled: false,
            onClick: () => this.onConfirm(),
        });
        this._initCards();
    }

    protected onDestroy(): void {
        this._cardItems = [];
    }

    public selectClass(classId: ClassId): void {
        this._selectedClassId = classId;
        const classDef = CLASS_LIST.find(c => c.id === classId);
        if (!classDef) return;

        for (const card of this._cardItems) {
            card.setSelected(card.node.name === `ClassCard_${classId}`);
        }

        this.detailPanel.active = true;
        this.classNameLabel.string = classDef.name;
        this.classDescLabel.string = classDef.description;
        this.statsLabel.string = [
            `HP: ${classDef.hp}`,
            `抽骰: ${classDef.drawCount}`,
            `出牌: ${classDef.maxPlays}`,
            `重投: ${classDef.freeRerolls}`,
        ].join('  ');

        this.confirmButton.setEnabled(true);
    }

    public onConfirm(): void {
        if (!this._selectedClassId) return;
        EventBus.emit(GameEvents.SCENE_CHANGE, 'BattleScene');
        director.loadScene('Battle');
    }

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
}
