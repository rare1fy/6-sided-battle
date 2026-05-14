/**
 * 敌人名 → 图片资源映射（Cocos 分包版）
 *
 * 每个敌人映射到 { bundle, path } 结构：
 * - bundle: Asset Bundle 名称（如 'chapter1'）
 * - path:   Bundle 内的相对路径（不含扩展名）
 *
 * 运行时通过 assetManager.getBundle(bundle).load(path, SpriteFrame, cb) 加载。
 * 有映射的敌人用 PNG 显示，无映射的回退到像素矩阵。
 */

export interface EnemyImageDef {
    bundle: string;
    path: string;
}

// ── 第1章 · 幽暗森林 ──

const CH1 = 'chapter1';
const CH1_BASE = 'enemies/';

export const ENEMY_IMAGE_MAP: Record<string, EnemyImageDef> = {
    '食尸鬼':     { bundle: CH1, path: `${CH1_BASE}forest_407` },
    '剧毒蛛母':   { bundle: CH1, path: `${CH1_BASE}forest_403` },
    '腐化树人':   { bundle: CH1, path: `${CH1_BASE}forest_402` },
    '哀嚎女妖':   { bundle: CH1, path: `${CH1_BASE}forest_408` },
    '月光狼灵':   { bundle: CH1, path: `${CH1_BASE}forest_401` },
    '骸骨狂战':   { bundle: CH1, path: `${CH1_BASE}forest_406` },
    '毒雾林精':   { bundle: CH1, path: `${CH1_BASE}forest_401` },
    '苔岩泥像':   { bundle: CH1, path: `${CH1_BASE}forest_404` },
    '幽冥诅祝':   { bundle: CH1, path: `${CH1_BASE}forest_407` },
    '老槐祭司':   { bundle: CH1, path: `${CH1_BASE}forest_409` },
    '亡灵巫师':   { bundle: CH1, path: `${CH1_BASE}forest_406` },
    '狼人首领':   { bundle: CH1, path: `${CH1_BASE}forest_405` },
    '魅影猎手':   { bundle: CH1, path: `${CH1_BASE}forest_408` },
    '枯骨巫妖':   { bundle: CH1, path: `${CH1_BASE}forest_412` },
    '根须巨像':   { bundle: CH1, path: `${CH1_BASE}forest_410` },
    '魇森巫母':   { bundle: CH1, path: `${CH1_BASE}forest_411` },
    '远古树王':   { bundle: CH1, path: `${CH1_BASE}forest_409` },
};

// ── 后续章节在此追加 ──
// const CH2 = 'chapter2';
// '沙漠蝎王': { bundle: CH2, path: 'enemies/desert_501' },
