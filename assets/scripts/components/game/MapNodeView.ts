import { _decorator, Component, Node, Sprite, SpriteFrame, Button } from 'cc';

const { ccclass, property } = _decorator;

export type MapNodeType = 'enemy' | 'elite' | 'boss' | 'event' | 'campfire' | 'treasure' | 'merchant';

@ccclass('MapNodeView')
export class MapNodeView extends Component {

    @property(Sprite)
    nodeIcon: Sprite = null!;

    @property(Sprite)
    nodeFrame: Sprite = null!;

    @property(Node)
    currentMarker: Node = null!;

    @property(Node)
    completedOverlay: Node = null!;

    @property(Button)
    button: Button = null!;

    private _nodeId = '';
    private _onClick: ((nodeId: string) => void) | null = null;

    public get nodeId(): string { return this._nodeId; }

    public init(data: {
        nodeId: string;
        type: MapNodeType;
        completed: boolean;
        isCurrent: boolean;
        reachable: boolean;
        onClick: (nodeId: string) => void;
    }): void {
        this._nodeId = data.nodeId;
        this._onClick = data.onClick;

        this.currentMarker.active = data.isCurrent;
        this.completedOverlay.active = data.completed;
        this.button.interactable = data.reachable && !data.completed;

        this.button.node.on(Button.EventType.CLICK, this._handleClick, this);
    }

    protected onDestroy(): void {
        this.button.node.off(Button.EventType.CLICK, this._handleClick, this);
    }

    private _handleClick(): void {
        this._onClick?.(this._nodeId);
    }
}
