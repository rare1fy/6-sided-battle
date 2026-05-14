import { _decorator, Component, Label, director, assetManager, AssetManager } from 'cc';
import { ProgressBarView } from '../components/ui/ProgressBarView';

const { ccclass, property } = _decorator;

interface BundleDef {
    name: string;
    priority: number;
    required: boolean;
}

const BUNDLES: BundleDef[] = [
    { name: 'bundle_fonts',    priority: 0, required: true },
    { name: 'bundle_ui',       priority: 1, required: true },
    { name: 'bundle_audio',    priority: 2, required: false },
    { name: 'bundle_chapter1', priority: 2, required: false },
];

const TARGET_SCENE = 'ClassSelect';

@ccclass('LoadingController')
export class LoadingController extends Component {

    @property(ProgressBarView)
    progressBar: ProgressBarView = null!;

    @property(Label)
    hintLabel: Label = null!;

    private _loaded = 0;
    private _failedOptional: string[] = [];

    protected start(): void {
        this._loadAll();
    }

    private async _loadAll(): Promise<void> {
        const total = BUNDLES.length;
        this.progressBar.setProgress(0, total);
        this._updateHint('正在加载资源...');

        const promises = BUNDLES.map((def) => this._loadOneBundle(def, total));
        const results = await Promise.allSettled(promises);

        const failedRequired = BUNDLES.filter((def, i) =>
            def.required && results[i].status === 'rejected'
        );

        if (failedRequired.length > 0) {
            const names = failedRequired.map((d) => d.name).join(', ');
            this._updateHint(`加载失败: ${names}，请检查网络后重试`);
            return;
        }

        this.progressBar.setProgress(total, total);

        if (this._failedOptional.length > 0) {
            this._updateHint(`加载完成（${this._failedOptional.join(',')} 将延迟加载）`);
        } else {
            this._updateHint('加载完成！');
        }

        this._enterGame();
    }

    private _loadOneBundle(def: BundleDef, total: number): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(def.name, (err, bundle) => {
                if (err) {
                    console.error(`Bundle [${def.name}] 加载失败:`, err);
                    if (!def.required) {
                        this._failedOptional.push(def.name);
                        this._loaded++;
                        this.progressBar.setProgress(this._loaded, total);
                        resolve(null!);
                    } else {
                        reject(err);
                    }
                    return;
                }
                this._loaded++;
                this.progressBar.setProgress(this._loaded, total);
                this._updateHint(`加载中... ${def.name} (${this._loaded}/${total})`);
                resolve(bundle);
            });
        });
    }

    private _updateHint(text: string): void {
        if (this.hintLabel) this.hintLabel.string = text;
    }

    private _enterGame(): void {
        this.scheduleOnce(() => { director.loadScene(TARGET_SCENE); }, 0.5);
    }
}
