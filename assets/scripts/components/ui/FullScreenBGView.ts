import { _decorator, Component, Sprite, SpriteFrame, Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('FullScreenBGView')
export class FullScreenBGView extends Component {

    @property(Sprite)
    bgSprite: Sprite = null!;

    public setBackground(spriteFrame?: SpriteFrame, color?: Color): void {
        if (spriteFrame) {
            this.bgSprite.spriteFrame = spriteFrame;
        }
        if (color) {
            this.bgSprite.color = color;
        }
    }

    public setColor(r: number, g: number, b: number, a = 255): void {
        this.bgSprite.color = new Color(r, g, b, a);
    }
}
