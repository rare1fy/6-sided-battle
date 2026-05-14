import { _decorator, Component, Label, UIOpacity, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ToastView')
export class ToastView extends Component {

    @property(Label)
    messageLabel: Label = null!;

    public show(message: string, duration = 1.5): void {
        this.messageLabel.string = message;
        this.node.active = true;

        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) opacity = this.node.addComponent(UIOpacity);
        opacity.opacity = 255;

        const startY = this.node.position.y;
        this.node.setPosition(this.node.position.x, startY - 40, 0);

        tween(this.node)
            .to(0.2, { position: new Vec3(this.node.position.x, startY, 0) })
            .delay(duration)
            .start();

        tween(opacity)
            .delay(0.2 + duration)
            .to(0.3, { opacity: 0 })
            .call(() => { this.node.active = false; })
            .start();
    }
}
