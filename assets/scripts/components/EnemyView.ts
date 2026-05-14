import { _decorator, Component, Node, Sprite, Label, UITransform, Color, tween, Vec3 } from 'cc';
import type { Enemy } from '../types/entities';

const { ccclass, property } = _decorator;

@ccclass('EnemyView')
export class EnemyView extends Component {

    @property(Sprite)
    bodySprite: Sprite = null!;

    @property(Sprite)
    hpBarFill: Sprite = null!;

    @property(Label)
    hpLabel: Label = null!;

    @property(Sprite)
    intentIcon: Sprite = null!;

    @property(Node)
    buffSlot: Node = null!;

    private _enemyUid = '';
    private _maxHp = 0;
    private _barWidth = 160;

    public get enemyUid(): string { return this._enemyUid; }

    public init(enemy: Enemy): void {
        this._enemyUid = enemy.uid;
        this._maxHp = enemy.maxHp;
        this.refreshHp(enemy.hp, enemy.maxHp);
    }

    public refreshHp(current: number, max: number): void {
        this._maxHp = max;
        const ratio = max > 0 ? Math.max(current / max, 0) : 0;

        const ut = this.hpBarFill.getComponent(UITransform);
        if (ut) {
            ut.width = this._barWidth * ratio;
        }

        if (this.hpLabel) {
            this.hpLabel.string = `${current}/${max}`;
        }
    }

    public playHitEffect(): void {
        const original = this.node.position.clone();
        tween(this.node)
            .to(0.05, { position: new Vec3(original.x + 8, original.y, 0) })
            .to(0.05, { position: new Vec3(original.x - 8, original.y, 0) })
            .to(0.05, { position: original })
            .start();
    }

    public playDeathEffect(): void {
        tween(this.node)
            .to(0.3, { scale: new Vec3(0, 0, 1) })
            .call(() => { this.node.destroy(); })
            .start();
    }

    protected onDestroy(): void {
        tween(this.node).stop();
    }
}
