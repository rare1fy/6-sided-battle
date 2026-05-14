import { _decorator, Component, Node, Label, Sprite, Color } from 'cc';
import type { ClassDef, ClassId } from '../data/classes';

const { ccclass, property } = _decorator;

@ccclass('ClassCardItem')
export class ClassCardItem extends Component {

    @property(Sprite)
    bgSprite: Sprite = null!;

    @property(Sprite)
    portrait: Sprite = null!;

    @property(Label)
    classNameLabel: Label = null!;

    @property(Label)
    classTagLabel: Label = null!;

    @property(Node)
    selectedFrame: Node = null!;

    private _classId: ClassId | null = null;
    private _onSelect: ((classId: ClassId) => void) | null = null;

    // ── 初始化 ──

    public init(classDef: ClassDef, onSelect: (classId: ClassId) => void): void {
        this._classId = classDef.id;
        this._onSelect = onSelect;

        this.classNameLabel.string = classDef.name;
        this.classTagLabel.string = this._getTagText(classDef.id);

        const color = new Color();
        Color.fromHEX(color, classDef.color);
        this.bgSprite.color = color;

        this.setSelected(false);
        this.node.on(Node.EventType.TOUCH_END, this._onTap, this);
    }

    // ── 选中状态 ──

    public setSelected(selected: boolean): void {
        this.selectedFrame.active = selected;
    }

    // ── 生命周期 ──

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this._onTap, this);
    }

    // ── 私有方法 ──

    private _onTap(): void {
        if (this._classId && this._onSelect) {
            this._onSelect(this._classId);
        }
    }

    private _getTagText(classId: ClassId): string {
        switch (classId) {
            case 'warrior': return '近战';
            case 'mage':    return '法术';
            case 'rogue':   return '敏捷';
            default:        return '';
        }
    }
}
