import { _decorator, Component, Node, Label, Button, Sprite, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HeaderBarView')
export class HeaderBarView extends Component {

    @property(Button)
    backButton: Button = null!;

    @property(Label)
    titleLabel: Label = null!;

    @property(Button)
    rightButton: Button = null!;

    private _onBack: (() => void) | null = null;
    private _onRight: (() => void) | null = null;

    public init(config: {
        title: string;
        showBack: boolean;
        rightIcon?: SpriteFrame;
        onBack?: () => void;
        onRight?: () => void;
    }): void {
        this.titleLabel.string = config.title;
        this.backButton.node.active = config.showBack;
        this._onBack = config.onBack ?? null;
        this._onRight = config.onRight ?? null;

        if (config.rightIcon) {
            this.rightButton.node.active = true;
            const sp = this.rightButton.node.getComponent(Sprite);
            if (sp) sp.spriteFrame = config.rightIcon;
        } else {
            this.rightButton.node.active = false;
        }
    }

    protected onLoad(): void {
        this.backButton.node.on(Button.EventType.CLICK, this._handleBack, this);
        this.rightButton.node.on(Button.EventType.CLICK, this._handleRight, this);
    }

    protected onDestroy(): void {
        this.backButton.node.off(Button.EventType.CLICK, this._handleBack, this);
        this.rightButton.node.off(Button.EventType.CLICK, this._handleRight, this);
    }

    private _handleBack(): void { this._onBack?.(); }
    private _handleRight(): void { this._onRight?.(); }
}
