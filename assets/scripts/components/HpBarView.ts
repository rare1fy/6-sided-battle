import { _decorator, Component, Sprite, Label, UITransform, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HpBarView')
export class HpBarView extends Component {

    @property(Sprite)
    fillSprite: Sprite = null!;

    @property(Sprite)
    bgSprite: Sprite = null!;

    @property(Label)
    hpLabel: Label = null!;

    private _maxWidth = 480;
    private _currentHp = 0;
    private _maxHp = 0;

    public init(maxWidth: number): void {
        this._maxWidth = maxWidth;
    }

    public refresh(current: number, max: number): void {
        this._currentHp = current;
        this._maxHp = max;
        const ratio = max > 0 ? Math.max(current / max, 0) : 0;

        const ut = this.fillSprite.getComponent(UITransform);
        if (ut) {
            ut.width = this._maxWidth * ratio;
        }

        if (this.hpLabel) {
            this.hpLabel.string = `${current}/${max}`;
        }
    }

    public setColor(r: number, g: number, b: number): void {
        this.fillSprite.color = new Color(r, g, b, 255);
    }
}
