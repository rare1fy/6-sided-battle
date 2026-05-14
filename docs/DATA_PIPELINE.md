# 数据层 Excel 化方案

> 目标：策划用 Excel 维护数据 → 脚本自动转换为 TS/JSON → Cocos 运行时加载

## 一、数据分类

### ✅ 适合 Excel 化（纯数据表，无逻辑）

| 文件 | Excel Sheet 名 | 字段 | 优先级 |
|------|----------------|------|--------|
| `config/balance/player.ts` | 玩家初始配置 | hp/maxHp/armor/drawCount... | ⭐⭐⭐ |
| `config/balance/enemy.ts` | 敌人攻击修正 | 近战/远程/法术倍率 | ⭐⭐⭐ |
| `config/balance/world.ts` | 世界配置 | 商店/营火/地图参数 | ⭐⭐⭐ |
| `config/gameBalance.ts` | 全局平衡 | 难度曲线/缩放系数 | ⭐⭐⭐ |
| `data/handTypes.ts` | 牌型定义 | id/name/displayName/base/mult/desc | ⭐⭐⭐ |
| `data/dice.ts` | 骰子定义 | id/name/element/faces/rarity/desc | ⭐⭐⭐ |
| `data/classes.ts` (基础属性) | 职业定义 | id/name/hp/drawCount/maxPlays... | ⭐⭐⭐ |
| `data/statusInfo.ts` | 状态定义 | type/name/icon/color/desc | ⭐⭐ |
| `config/enemyNormal.ts` | 普通敌人 | id/name/hp/atk/intent/quotes | ⭐⭐ |
| `config/enemyEliteBoss.ts` | 精英/Boss | id/name/hp/phases/quotes | ⭐⭐ |
| `config/events/*.ts` | 事件配置 | id/name/desc/choices/effects | ⭐⭐ |
| `data/relicsV05.ts` | 遗物注册表 | id/name/rarity/desc/effect | ⭐⭐ |
| `data/bossDeathMock.ts` | Boss嘲讽 | chapter/bossName/lines[] | ⭐ |
| `data/bossTauntDispatch.ts` | Boss台词 | bossId/lines[] | ⭐ |
| `config/balance/player.ts` DEPTH_SCALING | 层级难度曲线 | depth/hpMult/dmgMult | ⭐⭐⭐ |

### ❌ 不适合 Excel 化（含逻辑/代码/像素数据）

| 文件 | 原因 |
|------|------|
| `data/relicEffectsV05.ts` | 包含 effect 函数（JS 逻辑） |
| `data/relics.ts` / `relicsCore.ts` / `relicsAugmented.ts` / `relicsSpecial.ts` | 包含 effect 函数 |
| `data/enemySprites.ts` | 像素矩阵数据，Excel 无法维护 |
| `data/pixelIconData.ts` | 像素矩阵数据 |
| `data/relicPixelData.ts` | 像素矩阵数据 |
| `data/diceBag.ts` | 包含抽牌逻辑 |
| `data/enemies.ts` | 聚合导出，无实际数据 |
| `data/soundEffects.ts` | 音效生成代码 |
| `data/skillModules.ts` | 逻辑代码 |

## 二、Excel 文件结构

```
DiceHeroCocos/
├── data_excel/
│   ├── GameData.xlsx          ← 策划主表
│   │   ├── Sheet: 职业定义
│   │   ├── Sheet: 骰子定义
│   │   ├── Sheet: 牌型定义
│   │   ├── Sheet: 状态定义
│   │   ├── Sheet: 玩家初始配置
│   │   ├── Sheet: 层级难度曲线
│   │   ├── Sheet: 敌人攻击修正
│   │   └── Sheet: 世界配置
│   ├── Enemies.xlsx           ← 敌人数据表
│   │   ├── Sheet: 普通敌人
│   │   ├── Sheet: 精英敌人
│   │   └── Sheet: Boss
│   ├── Relics.xlsx            ← 遗物数据表
│   │   └── Sheet: 遗物注册表
│   ├── Events.xlsx            ← 事件数据表
│   │   ├── Sheet: 战斗事件
│   │   ├── Sheet: 祭坛事件
│   │   └── Sheet: 交易事件
│   └── Dialogues.xlsx         ← 台词数据表
│       ├── Sheet: Boss嘲讽
│       └── Sheet: Boss派遣台词
├── tools/
│   └── excel2ts.ts            ← Excel → TS/JSON 转换脚本
└── assets/
    └── resources/
        └── data/              ← 转换后的 JSON（Cocos 运行时加载）
```

## 三、工作流

```
策划修改 Excel → 运行 npm run gen-data → 生成 JSON 到 resources/data/ → Cocos 运行时 resources.load()
```

### 命令

```bash
# 从 Excel 生成 JSON 数据文件
npm run gen-data

# 只生成某个表
npm run gen-data -- --file GameData.xlsx --sheet 骰子定义
```

## 四、Cocos 运行时加载

```typescript
// DataManager.ts
import { resources, JsonAsset } from 'cc';

export class DataManager {
    private static _cache: Map<string, unknown> = new Map();

    static async load<T>(path: string): Promise<T> {
        if (this._cache.has(path)) return this._cache.get(path) as T;
        return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, (err, asset) => {
                if (err) { reject(err); return; }
                this._cache.set(path, asset.json);
                resolve(asset.json as T);
            });
        });
    }
}

// 使用
const handTypes = await DataManager.load<HandTypeDef[]>('data/handTypes');
const classes = await DataManager.load<ClassDef[]>('data/classes');
```

## 五、注意事项

1. **Excel 是唯一数据源**：修改数据只改 Excel，不要手动改生成的 JSON
2. **版本控制**：Excel 文件和生成的 JSON 都提交到 Git
3. **类型安全**：转换脚本会校验数据类型，不合法的数据会报错
4. **向后兼容**：新增字段给默认值，删除字段先标记废弃
