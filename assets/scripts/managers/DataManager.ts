/**
 * DataManager — 数据加载管理器
 *
 * 职责：
 * 1. 从 resources/data/ 加载 Excel 转换后的 JSON 数据
 * 2. 缓存已加载的数据，避免重复加载
 * 3. 提供类型安全的数据访问接口
 *
 * 数据来源：
 * - 策划在 data_excel/*.xlsx 中维护数据
 * - 运行 `npm run gen-data` 转换为 JSON
 * - Cocos 运行时通过本管理器加载
 */

import { _decorator, Component, resources, JsonAsset, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('DataManager')
export class DataManager extends Component {
    private static _instance: DataManager | null = null;

    public static get instance(): DataManager {
        return DataManager._instance!;
    }

    /** 数据缓存 */
    private _cache: Map<string, unknown> = new Map();

    /** 加载状态 */
    private _loading: Map<string, Promise<unknown>> = new Map();

    // ── 生命周期 ──

    protected onLoad(): void {
        if (DataManager._instance && DataManager._instance !== this) {
            this.node.destroy();
            return;
        }
        DataManager._instance = this;
        director.addPersistRootNode(this.node);
    }

    protected onDestroy(): void {
        if (DataManager._instance === this) {
            DataManager._instance = null;
        }
    }

    // ── 公开接口 ──

    /**
     * 加载单个 JSON 数据文件
     * @param name 文件名（不含 .json 后缀），如 'handTypes'、'dice'
     * @returns 解析后的数据
     */
    public async load<T>(name: string): Promise<T> {
        // 命中缓存
        if (this._cache.has(name)) {
            return this._cache.get(name) as T;
        }

        // 防止重复加载
        if (this._loading.has(name)) {
            return this._loading.get(name) as Promise<T>;
        }

        const promise = new Promise<T>((resolve, reject) => {
            const path = `data/${name}`;
            resources.load(path, JsonAsset, (err, asset) => {
                this._loading.delete(name);
                if (err) {
                    console.error(`[DataManager] Failed to load: ${path}`, err);
                    reject(err);
                    return;
                }
                const data = asset.json as T;
                this._cache.set(name, data);
                resolve(data);
            });
        });

        this._loading.set(name, promise);
        return promise;
    }

    /**
     * 批量预加载多个数据文件
     * @param names 文件名数组
     */
    public async preloadAll(names: string[]): Promise<void> {
        await Promise.all(names.map(name => this.load(name)));
    }

    /**
     * 同步获取已缓存的数据（必须先 load 过）
     * @param name 文件名
     * @returns 缓存的数据，未加载则返回 null
     */
    public get<T>(name: string): T | null {
        return (this._cache.get(name) as T) ?? null;
    }

    /**
     * 清除缓存（用于热更新后重新加载）
     */
    public clearCache(): void {
        this._cache.clear();
    }
}
