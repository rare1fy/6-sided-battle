import { _decorator, Component, Sprite, Label, UITransform, Color, tween } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ProgressBarView')
export class ProgressBarView extends Component {

    @property(Sprite)
    barBg: Sprite = null!;

    @property(Sprite)
    barFill: Sprite = null!;

    @property(Label)
    valueLabel: Label = null!;

    @property
    barWidth = 480;

    @property
    barHeight = 24;

    @property
    showLabel = true;

    @property
    labelFormat = '{current}/{max}';

    private _current = 0;
    private _max = 1;

    protected onLoad(): void {
        const bgUt = this.barBg.getComponent(UITransform);
        if (bgUt) { bgUt.width = this.barWidth; bgUt.height = this.barHeight; }
        const fillUt = this.barFill.getComponent(UITransform);
        if (fillUt) { fillUt.width = this.barWidth; fillUt.height = this.barHeight; }
        if (this.valueLabel) { this.valueLabel.node.active = this.showLabel; }
    }

    public setProgress(current: number, max: number): void {
        this._current = current;
        this._max = max;
        const ratio = max > 0 ? Math.max(Math.min(current / max, 1), 0) : 0;

        const fillUt = this.barFill.getComponent(UITransform);
        if (fillUt) { fillUt.width = this.barWidth * ratio; }

        this._updateLabel();
    }

    public setColor(color: Color): void {
        this.barFill.color = color;
    }

    public tweenTo(target: number, duration: number): void {
        const fillUt = this.barFill.getComponent(UITransform);
        if (!fillUt) return;
        const targetWidth = this.barWidth * Math.max(Math.min(target / this._max, 1), 0);
        tween(fillUt).to(duration, { width: targetWidth }).start();
        this._current = target;
        this._updateLabel();
    }

    private _updateLabel(): void {
        if (!this.valueLabel || !this.showLabel) return;
        const percent = this._max > 0 ? Math.floor((this._current / this._max) * 100) : 0;
        this.valueLabel.string = this.labelFormat
            .replace('{current}', String(Math.floor(this._current)))
            .replace('{max}', String(Math.floor(this._max)))
            .replace('{percent}', String(percent));
    }
}
