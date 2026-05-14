import { _decorator, Component, Label, UIOpacity, Color, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DamageNumberView')
export class DamageNumberView extends Component {

    @property(Label)
    label: Label = null!;

    public show(value: number, worldPos: Vec3, type: 'damage' | 'heal' | 'block' = 'damage'): void {
        this.node.setPosition(worldPos.x, worldPos.y, 0);
        this.node.active = true;

        this.label.string = type === 'heal' ? `+${value}` : String(value);
        this.label.fontSize = value >= 50 ? 48 : 36;

        switch (type) {
            case 'damage': this.label.color = new Color(255, 60, 60, 255); break;
            case 'heal':   this.label.color = new Color(76, 175, 80, 255); break;
            case 'block':  this.label.color = new Color(160, 160, 160, 255); break;
        }

        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) opacity = this.node.addComponent(UIOpacity);
        opacity.opacity = 255;

        const startY = worldPos.y;
        tween(this.node)
            .to(0.8, { position: new Vec3(worldPos.x, startY + 80, 0) })
            .start();
        tween(opacity)
            .delay(0.4)
            .to(0.4, { opacity: 0 })
            .call(() => { this.node.active = false; })
            .start();
    }

    protected onDestroy(): void {
        tween(this.node).stop();
    }
}
