import { _decorator, Component, Node, Label, Sprite, Button, Color, UITransform } from 'cc';

const { ccclass, property } = _decorator;

export enum ButtonStyle { PRIMARY, SECONDARY, DANGER }

const STYLE_COLORS: Record<ButtonStyle, Color> = {
    [ButtonStyle.PRIMARY]:   new Color(76, 175, 80, 255),
    [ButtonStyle.SECONDARY]: new Color(102, 102, 102, 255),
    [ButtonStyle.DANGER]:    new Color(244, 67, 54, 255),
};

const STYLE_SIZES: Record<ButtonStyle, { w: number; h: number }> = {
    [ButtonStyle.PRIMARY]:   { w: 280, h: 80 },
    [ButtonStyle.SECONDARY]: { w: 200, h: 60 },
    [ButtonStyle.DANGER]:    { w: 200, h: 60 },
};

@ccclass('ActionButtonView')
export class ActionButtonView extends Component {

    @property(Sprite)
    bgSprite: Sprite = null!;

    @property(Label)
    buttonLabel: Label = null!;

    @property(Node)
    disabledOverlay: Node = null!;

    @property(Button)
    button: Button = null!;

    private _onClick: (() => void) | null = null;

    public init(config: {
        label: string;
        style: ButtonStyle;
        enabled?: boolean;
        onClick?: () => void;
    }): void {
        this.buttonLabel.string = config.label;
        this._onClick = config.onClick ?? null;

        const color = STYLE_COLORS[config.style];
        this.bgSprite.color = color;

        const size = STYLE_SIZES[config.style];
        const ut = this.node.getComponent(UITransform);
        if (ut) { ut.width = size.w; ut.height = size.h; }
        const bgUt = this.bgSprite.getComponent(UITransform);
        if (bgUt) { bgUt.width = size.w; bgUt.height = size.h; }

        this.setEnabled(config.enabled !== false);
    }

    public setEnabled(enabled: boolean): void {
        this.button.interactable = enabled;
        this.disabledOverlay.active = !enabled;
    }

    protected onLoad(): void {
        this.button.node.on(Button.EventType.CLICK, this._handleClick, this);
    }

    protected onDestroy(): void {
        this.button.node.off(Button.EventType.CLICK, this._handleClick, this);
    }

    private _handleClick(): void { this._onClick?.(); }
}
