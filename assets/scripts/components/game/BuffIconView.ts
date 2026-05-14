import { _decorator, Component, Sprite, Label, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BuffIconView')
export class BuffIconView extends Component {

    @property(Sprite)
    iconSprite: Sprite = null!;

    @property(Label)
    stackLabel: Label = null!;

    @property(Label)
    durationLabel: Label = null!;

    public init(data: { icon?: SpriteFrame; stacks: number; duration: number }): void {
        if (data.icon) this.iconSprite.spriteFrame = data.icon;
        this.refresh(data.stacks, data.duration);
    }

    public refresh(stacks: number, duration: number): void {
        this.stackLabel.string = stacks > 1 ? String(stacks) : '';
        this.durationLabel.string = duration > 0 ? String(duration) : '';
    }
}
