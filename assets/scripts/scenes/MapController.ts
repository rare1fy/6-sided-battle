import { _decorator, Component, Node, Label, Prefab, instantiate, director, ScrollView } from 'cc';
import { HeaderBarView } from '../components/ui/HeaderBarView';
import { PlayerInfoView } from '../components/ui/PlayerInfoView';
import { MapNodeView } from '../components/game/MapNodeView';
import { EventBus, GameEvents } from '../managers/EventBus';

const { ccclass, property } = _decorator;

@ccclass('MapController')
export class MapController extends Component {

    @property(HeaderBarView)
    headerBar: HeaderBarView = null!;

    @property(PlayerInfoView)
    playerInfo: PlayerInfoView = null!;

    @property(ScrollView)
    scrollView: ScrollView = null!;

    @property(Node)
    nodeLayer: Node = null!;

    @property(Node)
    pathLayer: Node = null!;

    @property(Prefab)
    mapNodePrefab: Prefab = null!;

    protected onLoad(): void {
        this.headerBar.init({
            title: '第 1 章',
            showBack: true,
            onBack: () => director.loadScene('ClassSelect'),
        });
        this.playerInfo.refresh({ hp: 100, maxHp: 100, gold: 0, diceCount: 6 });
        this._initMap();
    }

    private _initMap(): void {
        // TODO: 从 GameManager 获取地图数据，生成 MapNode 预制体实例
    }
}
