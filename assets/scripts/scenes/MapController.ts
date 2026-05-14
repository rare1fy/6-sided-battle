import { _decorator, Component, Node, Label, Button, director, ScrollView } from 'cc';
import { EventBus, GameEvents } from '../managers/EventBus';

const { ccclass, property } = _decorator;

@ccclass('MapController')
export class MapController extends Component {

    @property(Label)
    hpLabel: Label = null!;

    @property(Label)
    goldLabel: Label = null!;

    @property(Label)
    diceCountLabel: Label = null!;

    @property(ScrollView)
    scrollView: ScrollView = null!;

    @property(Node)
    nodeLayer: Node = null!;

    @property(Node)
    pathLayer: Node = null!;

    @property(Button)
    backButton: Button = null!;

    protected onLoad(): void {
        this.backButton.node.on(Button.EventType.CLICK, this._onBack, this);
        this._initMap();
    }

    protected onDestroy(): void {
        this.backButton.node.off(Button.EventType.CLICK, this._onBack, this);
    }

    private _initMap(): void {
        // TODO: 从 GameManager 获取地图数据，生成节点
        this.hpLabel.string = 'HP: 100/100';
        this.goldLabel.string = '金币: 0';
        this.diceCountLabel.string = '骰子: 6';
    }

    private _onBack(): void {
        director.loadScene('ClassSelect');
    }
}
