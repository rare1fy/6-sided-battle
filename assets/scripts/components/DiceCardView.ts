import { _decorator, Component, Node, Sprite, Label, Color, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/** 骰子卡牌显示数据 */
export interface DiceCardData {
    diceId: string;
    name: string;
    value: number;
    element: string;
    effectText: string;
}

@ccclass('DiceCardView')
export class DiceCardView extends Component {

    @property(Sprite)
    bgSprite: Sprite = null!;

    @property(Sprite)
    diceFace: Sprite = null!;

    @property(Label)
    valueLabel: Label = null!;

    @property(Label)
    effectLabel: Label = null!;

    @property(Node)
    selectedGlow: Node = null!;

    private _diceId = '';
    private _selected = false;
    private _onSelect: ((diceId: string) => void) | null = null;

    public get diceId(): string { return this._diceId; }
    public get isSelected(): boolean { return this._selected; }

    public init(data: DiceCardData, onSelect: (diceId: string) => void): void {
        this._diceId = data.diceId;
        this._onSelect = onSelect;

        this.valueLabel.string = String(data.value);
        this.effectLabel.string = data.effectText;
        this.setSelected(false);

        this.node.on(Node.EventType.TOUCH_END, this._onTap, this);
    }

    public setSelected(selected: boolean): void {
        this._selected = selected;
        this.selectedGlow.active = selected;

        if (selected) {
            tween(this.node)
                .to(0.1, { position: new Vec3(this.node.position.x, this.node.position.y + 10, 0) })
                .start();
        } else {
            tween(this.node)
                .to(0.1, { position: new Vec3(this.node.position.x, this.node.position.y, 0) })
                .start();
        }
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this._onTap, this);
        tween(this.node).stop();
    }

    private _onTap(): void {
        if (this._diceId && this._onSelect) {
            this._onSelect(this._diceId);
        }
    }
}
