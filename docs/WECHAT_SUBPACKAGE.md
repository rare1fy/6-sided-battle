# 微信小游戏分包架构设计

> 适用于 Cocos Creator 3.x + 微信小游戏平台
> 版本：v1.0 · 2026-05-14

---

## 一、微信小游戏包体硬限制

| 项目 | 限制 |
|------|------|
| **主包** | ≤ **4 MB** |
| **单个分包** | 不限制大小 |
| **所有分包总计** | ≤ **20 MB**（开通虚拟支付后 ≤ 30 MB） |

**核心原则：主包只放启动必需的最小集，其余全部走分包或远程 CDN。**

---

## 二、当前资源体量分析

```
assets/
├── resources/           3.84 MB  (27 files)
│   ├── audio/           2.52 MB  ← 3首BGM，最大头
│   ├── fonts/           1.17 MB  ← 2个像素字体
│   ├── images/enemies/  0.02 MB  ← 12张敌人精灵
│   ├── images/ui/       0.18 MB  ← 5张UI图
│   ├── data/            0.01 MB  ← 5个JSON配置
│   └── textures/        ~0 MB
├── scripts/             0.86 MB  (118 files)
└── TOTAL                4.70 MB
```

**结论：当前 4.70 MB 已超过主包 4 MB 限制，必须分包。**

但好消息是：总量远低于 20 MB 上限，不需要 CDN，纯分包即可解决。

---

## 三、分包策略

### 3.1 分包划分

| 包名 | 类型 | 内容 | 预估大小 |
|------|------|------|---------|
| **主包 (main)** | 主包 | 引擎代码 + 启动场景 + Loading UI + 核心脚本 | ≤ 3.5 MB |
| **bundle_audio** | 分包 | 所有 BGM + SFX 音频文件 | ~2.5 MB |
| **bundle_chapter1** | 分包 | 第1章敌人精灵 + 章节数据 | ~0.1 MB |
| **bundle_fonts** | 分包 | 像素字体文件 | ~1.2 MB |

### 3.2 主包内容（严格控制 ≤ 4 MB）

```
主包只包含：
├── 引擎核心代码（裁剪后 ~1.5-2 MB）
├── 启动场景 (Loading / Splash)
├── 核心逻辑脚本 (logic/ + data/JSON)
├── 最小 UI 资源（启动页背景 1 张）
└── 分包加载管理器 (BundleLoader)
```

**主包不放的东西：**
- ❌ BGM / SFX 音频文件
- ❌ 字体文件（用系统字体做 Loading，像素字体分包加载后替换）
- ❌ 敌人精灵图（进入战斗前加载）
- ❌ 非首屏 UI 图片

### 3.3 加载时序

```
┌─────────────────────────────────────────────────┐
│ 1. 微信下载主包（≤4MB）                          │
│    → 显示 Loading 场景（系统字体 + 纯色背景）      │
├─────────────────────────────────────────────────┤
│ 2. 并行预加载分包                                 │
│    ├── bundle_fonts  （字体就绪后替换 Loading 文字）│
│    ├── bundle_audio  （BGM 就绪后播放）            │
│    └── bundle_chapter1（敌人图就绪）               │
├─────────────────────────────────────────────────┤
│ 3. 全部就绪 → 进入开始界面                         │
│    （此时所有资源已在内存，后续无加载等待）           │
└─────────────────────────────────────────────────┘
```

---

## 四、Cocos Creator 实现方式

### 4.1 目录结构调整

```
assets/
├── main/                          ← 主包（不标记为 Bundle）
│   ├── scenes/
│   │   └── Loading.scene          ← 启动场景
│   ├── scripts/                   ← 核心逻辑（自动进主包）
│   │   ├── logic/
│   │   ├── data/
│   │   ├── types/
│   │   ├── config/
│   │   ├── managers/
│   │   └── utils/
│   └── textures/
│       └── loading_bg.png         ← 唯一的主包图片
│
├── bundle_audio/                  ← 标记为 Asset Bundle
│   ├── bgm/
│   │   ├── DiceBattle-Normal.mp3
│   │   ├── DiceBattle-Outside.mp3
│   │   └── DiceBattle-Start.mp3
│   └── sfx/                      ← 后续音效文件
│
├── bundle_fonts/                  ← 标记为 Asset Bundle
│   ├── fusion-pixel-12px-monospaced-latin.woff2
│   └── fusion-pixel-12px-monospaced-zh_hans.woff2
│
├── bundle_chapter1/               ← 标记为 Asset Bundle
│   ├── enemies/
│   │   ├── forest_401.png ~ forest_412.png
│   └── data/
│       └── chapter1_enemies.json
│
├── bundle_ui/                     ← 标记为 Asset Bundle
│   ├── start-page.png
│   ├── img_btn_start_normal.png
│   ├── img_btn_start_pressed.png
│   ├── img_btn_soulshop_normal.png
│   └── img_btn_soulshop_pressed.png
│
└── resources/                     ← 保留给运行时动态加载的小资源
    └── data/
        ├── classes.json
        ├── dice.json
        ├── handTypes.json
        ├── playerConfig.json
        └── depthScaling.json
```

### 4.2 在 Cocos 编辑器中配置 Bundle

对每个 `bundle_*` 文件夹：
1. 在 **资源管理器** 中选中文件夹
2. 在 **属性检查器** 中勾选 **Is Bundle**
3. 设置 **Bundle Name**（如 `audio`、`fonts`、`chapter1`、`ui`）
4. **Target Platform** 选 `微信小游戏`
5. **Compression Type** 选 `小游戏分包`（关键！这样构建时会自动生成微信的 subpackages 配置）

### 4.3 分包加载管理器

```typescript
// BundleLoader.ts — 挂在 Loading 场景根节点上

import { _decorator, Component, assetManager, Label, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

/** 需要预加载的 Bundle 列表 */
const BUNDLES = ['fonts', 'audio', 'chapter1', 'ui'];

@ccclass('BundleLoader')
export class BundleLoader extends Component {

    @property(Label)
    tipLabel: Label = null!;

    @property(ProgressBar)
    progressBar: ProgressBar = null!;

    private _loaded = 0;

    start(): void {
        this._loadAllBundles();
    }

    private async _loadAllBundles(): Promise<void> {
        const total = BUNDLES.length;

        // 并行加载所有分包
        const promises = BUNDLES.map((name) =>
            new Promise<void>((resolve, reject) => {
                assetManager.loadBundle(name, (err, bundle) => {
                    if (err) {
                        console.error(`Bundle [${name}] 加载失败:`, err);
                        reject(err);
                        return;
                    }
                    this._loaded++;
                    this._updateProgress(this._loaded / total);
                    this.tipLabel.string = `加载中... ${name} (${this._loaded}/${total})`;
                    resolve();
                });
            })
        );

        try {
            await Promise.all(promises);
            this.tipLabel.string = '加载完成！';
            // 全部就绪，切换到开始场景
            this._enterGame();
        } catch (e) {
            this.tipLabel.string = '加载失败，请重试';
        }
    }

    private _updateProgress(ratio: number): void {
        if (this.progressBar) {
            this.progressBar.progress = ratio;
        }
    }

    private _enterGame(): void {
        // 延迟 0.3s 让玩家看到"加载完成"
        this.scheduleOnce(() => {
            // 从 ui bundle 加载开始场景
            const uiBundle = assetManager.getBundle('ui');
            if (uiBundle) {
                // 切换到主菜单场景
                // director.loadScene('StartScene');
            }
        }, 0.3);
    }
}
```

### 4.4 运行时从 Bundle 加载资源

```typescript
// 示例：从 audio bundle 加载 BGM
import { assetManager, AudioClip } from 'cc';

function loadBGM(clipName: string, callback: (clip: AudioClip) => void): void {
    const audioBundle = assetManager.getBundle('audio');
    if (!audioBundle) {
        console.error('audio bundle 未加载');
        return;
    }
    audioBundle.load(`bgm/${clipName}`, AudioClip, (err, clip) => {
        if (err) {
            console.error(`BGM [${clipName}] 加载失败:`, err);
            return;
        }
        callback(clip!);
    });
}

// 示例：从 chapter1 bundle 加载敌人精灵
import { SpriteFrame } from 'cc';

function loadEnemySprite(spriteName: string, callback: (sf: SpriteFrame) => void): void {
    const ch1Bundle = assetManager.getBundle('chapter1');
    if (!ch1Bundle) {
        console.error('chapter1 bundle 未加载');
        return;
    }
    ch1Bundle.load(`enemies/${spriteName}/spriteFrame`, SpriteFrame, (err, sf) => {
        if (err) {
            console.error(`敌人精灵 [${spriteName}] 加载失败:`, err);
            return;
        }
        callback(sf!);
    });
}
```

---

## 五、引擎裁剪（压缩主包）

在 Cocos Creator 中：**项目 → 项目设置 → 功能裁剪**

关闭以下不需要的模块：

| 模块 | 是否需要 | 说明 |
|------|---------|------|
| 3D 相关（Mesh / Skinning / Morph） | ❌ 关闭 | 纯 2D 游戏 |
| 物理（Physics / Bullet） | ❌ 关闭 | 不需要物理引擎 |
| 粒子系统 | ⚠️ 按需 | 如果不用粒子特效可关 |
| 地形（Terrain） | ❌ 关闭 | 不需要 |
| Spine / DragonBones | ❌ 关闭 | 除非用骨骼动画 |
| Video Player | ❌ 关闭 | 不需要 |
| WebView | ❌ 关闭 | 不需要 |
| Tween | ✅ 保留 | UI 动画需要 |
| 2D 渲染 | ✅ 保留 | 核心需求 |
| UI 系统 | ✅ 保留 | 核心需求 |
| Audio | ✅ 保留 | 核心需求 |

裁剪后引擎代码预计从 ~3.5 MB 降至 ~1.5 MB。

---

## 六、构建配置

在 **构建发布** 面板中：

| 配置项 | 值 |
|--------|-----|
| 发布平台 | 微信小游戏 |
| 主包压缩类型 | 小游戏分包 |
| 初始场景 | Loading |
| WASM 分离 | ✅ 开启（将 .wasm 文件分离到分包） |
| 引擎裁剪 | ✅ 开启 |
| 压缩纹理 | ✅ 开启（ETC2 / ASTC） |
| Source Maps | ❌ 关闭（减小包体） |

---

## 七、后续章节扩展

当游戏增加新章节时：

```
assets/
├── bundle_chapter2/     ← 新增 Bundle
│   ├── enemies/
│   └── data/
├── bundle_chapter3/
│   ├── enemies/
│   └── data/
...
```

每个章节独立分包，进入该章节前加载，离开后可释放：

```typescript
// 释放不再需要的章节资源
assetManager.getBundle('chapter1')?.releaseAll();
assetManager.removeBundle(assetManager.getBundle('chapter1')!);
```

---

## 八、包体预算表

| 包 | 当前大小 | 预算上限 | 备注 |
|----|---------|---------|------|
| 主包 | ~2.5 MB（裁剪后） | 4 MB | 引擎 + 脚本 + Loading 场景 |
| bundle_audio | 2.52 MB | 5 MB | BGM + 后续 SFX |
| bundle_fonts | 1.17 MB | 2 MB | 像素字体 |
| bundle_chapter1 | 0.02 MB | 2 MB | 敌人精灵 + 章节数据 |
| bundle_ui | 0.18 MB | 2 MB | UI 图片 |
| **总计** | **~6.4 MB** | **20 MB** | 余量充足 |

---

## 九、Checklist

- [ ] 在 Cocos 编辑器中将 4 个 bundle 文件夹标记为 Asset Bundle
- [ ] 创建 Loading 场景 + BundleLoader 组件
- [ ] 引擎功能裁剪（关闭 3D / 物理 / Spine 等）
- [ ] 构建微信小游戏并用微信开发者工具验证包体大小
- [ ] 真机测试分包加载速度（目标：4G 网络 ≤ 3s）
- [ ] AudioManager 改为从 audio bundle 加载 AudioClip
- [ ] enemyImageMap 改为从 chapter bundle 加载 SpriteFrame
