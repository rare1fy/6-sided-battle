import { _decorator, Component, Label, tween, Vec3, UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DamageNumberView')
export class DamageNumberView extends Component {

    @property(Label)
    label: Label = null!;

    public show(value: number, isCrit = false): void {
        this.label.string = isCrit ? `${value}!` : String(value);
        this.label.fontSize = isCrit ? 48 : 36;

        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.node.addComponent(UIOpacity);
        }
        opacity.opacity = 255;

        const startY = this.node.position.y;
        tween(this.node)
            .to(0.6, { position: new Vec3(this.node.position.x, startY + 80, 0) })
            .start();
        tween(opacity)
            .delay(0.3)
            .to(0.3, { opacity: 0 })
            .call(() => { this.node.destroy(); })
            .start();
    }

    protected onDestroy(): void {
        tween(this.node).stop();
    }
}
