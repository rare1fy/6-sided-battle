import { _decorator, Component, Node, Label, Prefab, instantiate, Button, director } from 'cc';
import { DiceCardView, DiceCardData } from '../components/DiceCardView';
import { EventBus, GameEvents } from '../managers/EventBus';

const { ccclass, property } = _decorator;

@ccclass('SettlementController')
export class SettlementController extends Component {

    @property(Label)
    resultLabel: Label = null!;

    @property(Label)
    goldRewardLabel: Label = null!;

    @property(Label)
    expRewardLabel: Label = null!;

    @property(Node)
    diceRewardList: Node = null!;

    @property(Prefab)
    diceCardPrefab: Prefab = null!;

    @property(Button)
    continueButton: Button = null!;

    private _selectedRewardIdx = -1;

    protected onLoad(): void {
        this.continueButton.node.on(Button.EventType.CLICK, this._onContinue, this);
        this._showResult();
    }

    protected onDestroy(): void {
        this.continueButton.node.off(Button.EventType.CLICK, this._onContinue, this);
    }

    private _showResult(): void {
        // TODO: 从 GameManager 获取战斗结果
        this.resultLabel.string = '胜利！';
        this.goldRewardLabel.string = '+ 50 金币';
        this.expRewardLabel.string = '+ 20 经验';
    }

    private _onContinue(): void {
        EventBus.emit(GameEvents.SCENE_CHANGE, 'MapScene');
        director.loadScene('Map');
    }
}
