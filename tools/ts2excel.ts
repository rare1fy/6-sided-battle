/**
 * ts2excel.ts — 从现有 TS 数据文件反向生成初始 Excel
 *
 * 一次性工具：把当前 TS 硬编码的数据导出为 Excel，
 * 之后策划就在 Excel 上维护，不再改 TS。
 *
 * 用法：npx tsx tools/ts2excel.ts
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'data_excel');

// ── 工具函数 ──

function createSheet(headers: string[], types: string[], rows: unknown[][]): XLSX.WorkSheet {
  const data = [headers, types, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // 设置列宽
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length * 2, 12) }));

  return ws;
}

// ── GameData.xlsx ──

function buildGameData(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Sheet: 牌型定义
  {
    const headers = ['id', 'name', 'displayName', 'icon', 'base', 'mult', 'description'];
    const types = ['string', 'string', 'string', 'string', 'int', 'float', 'string'];
    const rows = [
      ['high_card', '普通攻击', '普通攻击', 'zap', 0, 1.0, '任意单颗骰子。伤害 = 点数和'],
      ['pair', '对子', '对称打击', 'pair', 0, 1.8, '2颗点数相同。伤害 = 点数和 +80%'],
      ['straight_3', '顺子', '三连刺击', 'arrow-right', 0, 1.5, '3颗点数连续。伤害 = 点数和 +50%，AOE全体'],
      ['two_pair', '连对', '对称阵列', 'layers', 0, 2.4, '2组对子。伤害 = 点数和 +140%'],
      ['straight_4', '4顺', '四连裂空', 'arrow-right', 0, 2.0, '4颗点数连续。伤害 = 点数和 +100%，AOE全体'],
      ['three_of_a_kind', '三条', '三星魔咒', 'triangle', 0, 2.8, '3颗点数相同。伤害 = 点数和 +180%'],
      ['straight_5', '5顺', '五连裂斩', 'arrow-right', 0, 2.6, '5颗点数连续。伤害 = 点数和 +160%，AOE全体'],
      ['three_pair', '三连对', '三重阵列', 'layers', 0, 3.4, '3组对子。伤害 = 点数和 +240%'],
      ['straight_6', '6顺', '天启裂斩', 'arrow-right', 0, 3.5, '6颗点数连续(1-6)。伤害 = 点数和 +250%，AOE全体'],
      ['full_house', '葫芦', '圣裁之印', 'house', 0, 3.8, '3+2组合(5颗)。伤害 = 点数和 +280%，无视嘲讽 + 真伤'],
      ['four_of_a_kind', '四条', '四星血祭', 'square', 0, 4.5, '4颗点数相同。伤害 = 点数和 +350%'],
      ['full_house_big', '大葫芦', '王葬', 'house', 0, 5.8, '3+3或4+2组合(6颗)。伤害 = 点数和 +480%，无视嘲讽 + 真伤'],
      ['five_of_a_kind', '五条', '五星裁决', 'star', 0, 6.5, '5颗点数相同。伤害 = 点数和 +550%'],
      ['six_of_a_kind', '六条', '六星灭世', 'trophy', 0, 10.0, '6颗点数相同。伤害 = 点数和 +900%'],
    ];
    XLSX.utils.book_append_sheet(wb, createSheet(headers, types, rows), '牌型定义');
  }

  // Sheet: 骰子定义
  {
    const headers = ['id', 'name', 'element', 'faces', 'description', 'rarity', 'isElemental', '#备注'];
    const types = ['string', 'string', 'string', 'int[]', 'string', 'string', 'bool', 'string'];
    const rows = [
      ['standard', '普通骰子', 'normal', '1,2,3,4,5,6', '标准六面骰，点数1到6均匀分布', 'common', false, ''],
      ['heavy', '灌铅骰子', 'normal', '4,4,5,5,6,6', '只会掷出4、5、6，稳定的高点数骰子', 'uncommon', false, ''],
      ['elemental', '元素骰子', 'normal', '1,2,3,4,5,6', '每回合随机变为火/冰/雷/毒/圣元素之一', 'rare', true, ''],
      ['blade', '锋刃骰子', 'normal', '1,2,3,4,5,6', '+20基础伤害', 'rare', false, ''],
      ['multiplier', '倍增骰子', 'normal', '1,2,3,4,5,6', '+50%倍率', 'rare', false, ''],
      ['joker', '小丑骰子', 'normal', '1,2,3,4,5,6,7,8,9', '1-9随机', 'rare', false, '9面骰'],
      ['chaos', '混沌骰子', 'normal', '1,1,1,6,6,6', '只能掷出1和6，极端分布', 'uncommon', false, ''],
      ['split', '分裂骰子', 'normal', '1,2,3,4,5,6', '出牌时复制自身加入结算', 'epic', false, ''],
      ['cursed', '诅咒骰子', 'normal', '0,0,0,0,0,0', '0点，重Roll代价翻倍', 'cursed', false, '负面骰子'],
      ['cracked', '碎裂骰子', 'normal', '1,1,1,2,2,2', '固定1-2点，反噬伤害', 'cursed', false, '负面骰子'],
    ];
    XLSX.utils.book_append_sheet(wb, createSheet(headers, types, rows), '骰子定义');
  }

  // Sheet: 职业定义
  {
    const headers = ['id', 'name', 'title', 'description', 'color', 'colorLight', 'colorDark',
      'drawCount', 'maxPlays', 'freeRerolls', 'canBloodReroll', 'keepUnplayed',
      'hp', 'maxHp', 'initialDice', 'passiveDesc', 'normalAttackMultiSelect'];
    const types = ['string', 'string', 'string', 'string', 'string', 'string', 'string',
      'int', 'int', 'int', 'bool', 'bool',
      'int', 'int', 'string[]', 'string', 'bool'];
    const rows = [
      ['warrior', '嗜血狂战', '铁血征服者', '以血换伤，一击致命。嗜血越多，越凶。',
        '#c04040', '#ff6060', '#601010',
        3, 1, 1, true, false,
        120, 120, 'standard,standard,standard,standard,w_bloodthirst,w_fury',
        '【嗜血战意】战斗本能多颗散打；搏命 HP×2^n% 重投；伤痕：自伤+层，普攻追加基础伤害=当前层数', true],
      ['mage', '星界魔导', '星界禁咒师', '耐心吟唱2-3回合，攒齐完美手牌一波超载。',
        '#7040c0', '#a070ff', '#301060',
        4, 2, 0, false, true,
        80, 80, 'standard,standard,standard,standard,m_arcane,m_focus',
        '【星界超载】保留未出牌骰子；每回合抽4出2；蓄力越久倍率越高', false],
      ['rogue', '影锋刺客', '暗影行者', '快攻连击，偷取资源，以速度碾压。',
        '#40a040', '#60ff60', '#104010',
        5, 3, 2, false, false,
        90, 90, 'standard,standard,standard,standard,r_shadow,r_swift',
        '【影锋连击】每回合抽5出3；2次免费重投；连击越多伤害越高', false],
    ];
    XLSX.utils.book_append_sheet(wb, createSheet(headers, types, rows), '职业定义');
  }

  // Sheet: 玩家初始配置
  {
    const headers = ['key', 'value', '#说明'];
    const types = ['string', 'float', 'string'];
    const rows = [
      ['hp', 100, '初始血量'],
      ['maxHp', 100, '最大血量'],
      ['armor', 0, '初始护甲'],
      ['freeRerollsPerTurn', 1, '每回合免费重投次数'],
      ['globalRerolls', 0, '全局额外重投'],
      ['playsPerTurn', 1, '每回合出牌次数'],
      ['souls', 0, '初始灵魂（货币）'],
      ['relicSlots', 5, '遗物槽位数'],
      ['drawCount', 3, '初始抽骰数'],
      ['maxDrawCount', 6, '最大抽骰数'],
    ];
    XLSX.utils.book_append_sheet(wb, createSheet(headers, types, rows), '玩家初始配置');
  }

  // Sheet: 层级难度曲线
  {
    const headers = ['depth', 'hpMult', 'dmgMult', '#说明'];
    const types = ['int', 'float', 'float', 'string'];
    const rows = [
      [0, 0.90, 0.40, '教学关，轻松过'],
      [1, 1.10, 0.50, '稍有肉感'],
      [2, 1.25, 0.60, '开始有压力'],
      [3, 1.50, 0.75, '精英层'],
      [4, 1.20, 0.65, '精英后休息'],
      [5, 1.40, 0.80, '热身完毕'],
      [6, 1.20, 0.70, '营火前缓冲'],
      [7, 1.80, 1.00, '中期Boss'],
      [8, 1.10, 0.60, 'Boss后恢复期'],
      [9, 1.40, 0.80, '重新热身'],
      [10, 1.60, 0.90, '后期开始'],
      [11, 1.80, 1.00, '后期巅峰'],
      [12, 2.00, 1.10, 'pre-boss精英层'],
      [13, 1.30, 0.80, '营火前缓冲'],
      [14, 2.50, 1.30, '最终Boss'],
    ];
    XLSX.utils.book_append_sheet(wb, createSheet(headers, types, rows), '层级难度曲线');
  }

  return wb;
}

// ── 主流程 ──

function main(): void {
  console.log('🔄 从现有 TS 数据生成初始 Excel 文件...\n');

  // GameData.xlsx
  const gameDataWb = buildGameData();
  const gameDataPath = path.join(OUTPUT_DIR, 'GameData.xlsx');
  XLSX.writeFile(gameDataWb, gameDataPath);
  console.log(`✅ ${gameDataPath}`);
  console.log(`   Sheets: ${gameDataWb.SheetNames.join(', ')}`);

  console.log('\n✅ 初始 Excel 生成完成！');
  console.log('   后续修改数据请直接编辑 Excel，然后运行 npm run gen-data 生成 JSON。');
}

main();
