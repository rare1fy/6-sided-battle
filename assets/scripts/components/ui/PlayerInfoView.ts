import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerInfoView')
export class PlayerInfoView extends Component {

    @property(Label)
    hpLabel: Label = null!;

    @property(Label)
    goldLabel: Label = null!;

    @property(Label)
    diceCountLabel: Label = null!;

    public refresh(data: { hp: number; maxHp: number; gold: number; diceCount: number }): void {
        this.hpLabel.string = `${data.hp}/${data.maxHp}`;
        this.goldLabel.string = String(data.gold);
        this.diceCountLabel.string = String(data.diceCount);
    }
}
