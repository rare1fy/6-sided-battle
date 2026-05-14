import { _decorator, Component, Label, director } from 'cc';
import { ProgressBarView } from '../components/ui/ProgressBarView';

const { ccclass, property } = _decorator;

const TARGET_SCENE = 'ClassSelect';
const FAKE_LOAD_DURATION = 1.5; // 模拟加载时长（秒）

@ccclass('LoadingController')
export class LoadingController extends Component {

    @property(ProgressBarView)
    progressBar: ProgressBarView = null!;

    @property(Label)
    hintLabel: Label = null!;

    private _elapsed = 0;
    private _done = false;

    protected start(): void {
        this.progressBar?.setProgress(0, 100);
        this._updateHint('正在加载资源...');
    }

    protected update(dt: number): void {
        if (this._done) return;

        this._elapsed += dt;
        const progress = Math.min(this._elapsed / FAKE_LOAD_DURATION, 1);
        this.progressBar?.setProgress(Math.floor(progress * 100), 100);

        if (progress >= 1) {
            this._done = true;
            this._updateHint('加载完成！');
            this._enterGame();
        }
    }

    private _updateHint(text: string): void {
        if (this.hintLabel) this.hintLabel.string = text;
    }

    private _enterGame(): void {
        this.scheduleOnce(() => { director.loadScene(TARGET_SCENE); }, 0.5);
    }
}
