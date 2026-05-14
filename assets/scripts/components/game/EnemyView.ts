import { _decorator, Component, Node, Sprite, Label, tween, Vec3 } from 'cc';
import type { Enemy } from '../../types/entities';

const { ccclass, property } = _decorator;

@ccclass('EnemyView')
export class EnemyView extends Component {

    @property(Sprite)
    bodySprite: Sprite = null!;

    @property(Node)
    hpBarAnchor: Node = null!;

    @property(Sprite)
    intentIcon: Sprite = null!;

    @property(Node)
    buffSlot: Node = null!;

    @property(Node)
    hitEffect: Node = null!;

    private _enemyUid = '';
    private _maxHp = 0;

    public get enemyUid(): string { return this._enemyUid; }

    public init(enemy: Enemy): void {
        this._enemyUid = enemy.uid;
        this._maxHp = enemy.maxHp;
        if (this.hitEffect) this.hitEffect.active = false;
    }

    public playHurtAnim(): void {
        const original = this.node.position.clone();
        tween(this.node)
            .to(0.05, { position: new Vec3(original.x + 8, original.y, 0) })
            .to(0.05, { position: new Vec3(original.x - 8, original.y, 0) })
            .to(0.05, { position: original })
            .start();
    }

    public playDeathAnim(onComplete?: () => void): void {
        tween(this.node)
            .to(0.3, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                onComplete?.();
                this.node.destroy();
            })
            .start();
    }

    public playAttackAnim(): void {
        const original = this.node.position.clone();
        tween(this.node)
            .to(0.1, { position: new Vec3(original.x, original.y - 30, 0) })
            .to(0.15, { position: original })
            .start();
    }

    protected onDestroy(): void {
        tween(this.node).stop();
    }
}
