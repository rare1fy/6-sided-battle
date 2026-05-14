import { _decorator, Component, Node, Label, Prefab, director } from 'cc';
import { ActionButtonView, ButtonStyle } from '../components/ui/ActionButtonView';
import { HeaderBarView } from '../components/ui/HeaderBarView';
import { EventBus, GameEvents } from '../managers/EventBus';

const { ccclass, property } = _decorator;

@ccclass('SettlementController')
export class SettlementController extends Component {

    @property(HeaderBarView)
    headerBar: HeaderBarView = null!;

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

    @property(ActionButtonView)
    continueButton: ActionButtonView = null!;

    protected onLoad(): void {
        this.headerBar.init({ title: '战斗结算', showBack: false });
        this.continueButton.init({
            label: '继续',
            style: ButtonStyle.PRIMARY,
            onClick: () => this._onContinue(),
        });
        this._showResult();
    }

    private _showResult(): void {
        this.resultLabel.string = '胜利！';
        this.goldRewardLabel.string = '+ 50 金币';
        this.expRewardLabel.string = '+ 20 经验';
    }

    private _onContinue(): void {
        EventBus.emit(GameEvents.SCENE_CHANGE, 'MapScene');
        director.loadScene('Map');
    }
}
