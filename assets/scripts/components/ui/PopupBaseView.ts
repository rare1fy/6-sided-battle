import { _decorator, Component, Node, Label, UITransform, UIOpacity, tween, Vec3, Size } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PopupBaseView')
export class PopupBaseView extends Component {

    @property(Node)
    mask: Node = null!;

    @property(Node)
    panel: Node = null!;

    @property(Label)
    titleLabel: Label = null!;

    @property(Node)
    contentSlot: Node = null!;

    @property(Node)
    confirmButton: Node = null!;

    @property(Node)
    cancelButton: Node = null!;

    private _onConfirm: (() => void) | null = null;
    private _onCancel: (() => void) | null = null;

    public init(config: {
        title: string;
        panelSize?: Size;
        confirmLabel?: string;
        cancelLabel?: string;
        closeOnMask?: boolean;
        onConfirm?: () => void;
        onCancel?: () => void;
    }): void {
        this.titleLabel.string = config.title;
        this._onConfirm = config.onConfirm ?? null;
        this._onCancel = config.onCancel ?? null;

        if (config.panelSize) {
            const ut = this.panel.getComponent(UITransform);
            if (ut) { ut.width = config.panelSize.width; ut.height = config.panelSize.height; }
        }

        if (config.cancelLabel) {
            this.cancelButton.active = true;
        } else {
            this.cancelButton.active = false;
        }

        if (config.closeOnMask) {
            this.mask.on(Node.EventType.TOUCH_END, () => this.hide());
        }
    }

    public show(): void {
        this.node.active = true;
        this.panel.setScale(new Vec3(0, 0, 1));
        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) opacity = this.node.addComponent(UIOpacity);
        opacity.opacity = 0;
        tween(this.panel).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
        tween(opacity).to(0.2, { opacity: 255 }).start();
    }

    public hide(): void {
        tween(this.panel).to(0.15, { scale: new Vec3(0, 0, 1) }).start();
        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) opacity = this.node.addComponent(UIOpacity);
        tween(opacity).to(0.15, { opacity: 0 }).call(() => {
            this.node.active = false;
        }).start();
    }

    protected onLoad(): void {
        this.confirmButton.on(Node.EventType.TOUCH_END, () => this._onConfirm?.());
        this.cancelButton.on(Node.EventType.TOUCH_END, () => { this._onCancel?.(); this.hide(); });
    }
}
