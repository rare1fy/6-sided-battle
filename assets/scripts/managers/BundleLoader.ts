/**
 * BundleLoader — 分包加载管理器
 *
 * 挂在 Loading 场景根节点上，启动时并行加载所有分包，
 * 全部就绪后切换到主菜单场景。
 *
 * 微信小游戏分包策略：
 * - 主包 ≤ 4MB：引擎 + 脚本 + Loading 场景
 * - bundle_fonts：像素字体
 * - bundle_audio：BGM + SFX
 * - bundle_chapter1：第1章敌人精灵
 * - bundle_ui：UI 图片资源
 */

import { _decorator, Component, assetManager, Label, ProgressBar, director, AssetManager } from 'cc';

const { ccclass, property } = _decorator;

/** 分包定义：name = Bundle 名，priority = 加载优先级（越小越先） */
interface BundleDef {
    name: string;
    priority: number;
    required: boolean;
}

/** 需要预加载的 Bundle 列表 */
const BUNDLES: BundleDef[] = [
    { name: 'fonts',    priority: 0, required: true },
    { name: 'ui',       priority: 1, required: true },
    { name: 'audio',    priority: 2, required: false },  // 音频加载失败不阻塞
    { name: 'chapter1', priority: 2, required: false },  // 章节资源可延迟
];

/** 进入游戏的目标场景名 */
const TARGET_SCENE = 'StartScene';

@ccclass('BundleLoader')
export class BundleLoader extends Component {

    @property(Label)
    tipLabel: Label = null!;

    @property(ProgressBar)
    progressBar: ProgressBar = null!;

    /** 加载完成的 Bundle 数量 */
    private _loaded = 0;

    /** 加载失败的非必需 Bundle */
    private _failedOptional: string[] = [];

    start(): void {
        this._loadAllBundles();
    }

    // ── 核心加载流程 ──

    private async _loadAllBundles(): Promise<void> {
        const total = BUNDLES.length;
        this._updateTip('正在加载资源...');
        this._updateProgress(0);

        const promises = BUNDLES.map((def) => this._loadOneBundle(def, total));

        const results = await Promise.allSettled(promises);

        // 检查必需 Bundle 是否全部成功
        const failedRequired = BUNDLES.filter((def, i) =>
            def.required && results[i].status === 'rejected'
        );

        if (failedRequired.length > 0) {
            const names = failedRequired.map((d) => d.name).join(', ');
            this._updateTip(`加载失败: ${names}，请检查网络后重试`);
            return;
        }

        // 全部就绪（或非必需的失败了但不阻塞）
        this._updateProgress(1);

        if (this._failedOptional.length > 0) {
            this._updateTip(`加载完成（${this._failedOptional.join(',')} 将延迟加载）`);
        } else {
            this._updateTip('加载完成！');
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
                        this._updateProgress(this._loaded / total);
                        resolve(null!); // 非必需，不阻塞
                    } else {
                        reject(err);
                    }
                    return;
                }

                this._loaded++;
                this._updateProgress(this._loaded / total);
                this._updateTip(`加载中... ${def.name} (${this._loaded}/${total})`);
                resolve(bundle);
            });
        });
    }

    // ── UI 更新 ──

    private _updateTip(text: string): void {
        if (this.tipLabel) {
            this.tipLabel.string = text;
        }
    }

    private _updateProgress(ratio: number): void {
        if (this.progressBar) {
            this.progressBar.progress = Math.min(ratio, 1);
        }
    }

    // ── 进入游戏 ──

    private _enterGame(): void {
        this.scheduleOnce(() => {
            director.loadScene(TARGET_SCENE);
        }, 0.5);
    }
}
