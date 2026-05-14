/**
 * excel2json.ts — Excel → JSON 数据转换工具
 *
 * 读取 data_excel/ 下的 .xlsx 文件，按 Sheet 名转换为 JSON，
 * 输出到 assets/resources/data/ 供 Cocos Creator 运行时加载。
 *
 * 用法：
 *   npx tsx tools/excel2json.ts                    # 转换所有
 *   npx tsx tools/excel2json.ts --file GameData.xlsx  # 只转换指定文件
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// ── 路径配置 ──

const ROOT = path.resolve(__dirname, '..');
const EXCEL_DIR = path.join(ROOT, 'data_excel');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'resources', 'data');

// ── Sheet 名 → 输出文件名映射 ──

const SHEET_MAP: Record<string, string> = {
  '职业定义': 'classes',
  '骰子定义': 'dice',
  '牌型定义': 'handTypes',
  '状态定义': 'statusInfo',
  '玩家初始配置': 'playerConfig',
  '层级难度曲线': 'depthScaling',
  '敌人攻击修正': 'enemyAttackMult',
  '世界配置': 'worldConfig',
  '普通敌人': 'enemyNormal',
  '精英敌人': 'enemyElite',
  'Boss': 'enemyBoss',
  '遗物注册表': 'relics',
  '战斗事件': 'eventsCombat',
  '祭坛事件': 'eventsShrine',
  '交易事件': 'eventsTrade',
  'Boss嘲讽': 'bossDeathMock',
  'Boss派遣台词': 'bossTauntDispatch',
};

// ── 类型转换规则 ──

/** 第二行标注类型：int / float / string / bool / int[] / string[] */
type FieldType = 'int' | 'float' | 'string' | 'bool' | 'int[]' | 'float[]' | 'string[]';

function castValue(raw: unknown, type: FieldType): unknown {
  if (raw === undefined || raw === null || raw === '') {
    switch (type) {
      case 'int': case 'float': return 0;
      case 'string': return '';
      case 'bool': return false;
      case 'int[]': case 'float[]': case 'string[]': return [];
    }
  }

  switch (type) {
    case 'int':
      return Math.round(Number(raw));
    case 'float':
      return Number(raw);
    case 'string':
      return String(raw);
    case 'bool':
      return raw === true || raw === 1 || String(raw).toLowerCase() === 'true';
    case 'int[]':
      return String(raw).split(',').map(s => Math.round(Number(s.trim())));
    case 'float[]':
      return String(raw).split(',').map(s => Number(s.trim()));
    case 'string[]':
      return String(raw).split(',').map(s => s.trim());
    default:
      return raw;
  }
}

// ── 核心转换逻辑 ──

interface SheetResult {
  sheetName: string;
  outputName: string;
  rows: number;
  data: Record<string, unknown>[];
}

function parseSheet(worksheet: XLSX.WorkSheet, sheetName: string): SheetResult | null {
  const outputName = SHEET_MAP[sheetName];
  if (!outputName) {
    console.warn(`  ⚠️ Sheet "${sheetName}" 未在 SHEET_MAP 中注册，跳过`);
    return null;
  }

  // 读取为二维数组
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (rawRows.length < 3) {
    console.warn(`  ⚠️ Sheet "${sheetName}" 行数不足（需要至少3行：字段名/类型/数据），跳过`);
    return null;
  }

  // 第1行：字段名（英文 key）
  const keys = (rawRows[0] as string[]).map(k => String(k || '').trim());
  // 第2行：类型标注
  const types = (rawRows[1] as string[]).map(t => String(t || 'string').trim() as FieldType);
  // 第3行起：数据
  const dataRows = rawRows.slice(2);

  const data: Record<string, unknown>[] = [];

  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r] as unknown[];
    // 跳过空行（第一列为空）
    if (!row || !row[0] || String(row[0]).trim() === '') continue;

    const obj: Record<string, unknown> = {};
    for (let c = 0; c < keys.length; c++) {
      const key = keys[c];
      if (!key || key.startsWith('#')) continue; // # 开头的列为注释列
      obj[key] = castValue(row[c], types[c]);
    }
    data.push(obj);
  }

  return { sheetName, outputName, rows: data.length, data };
}

function processExcelFile(filePath: string): void {
  const fileName = path.basename(filePath);
  console.log(`\n📊 处理: ${fileName}`);

  const workbook = XLSX.readFile(filePath);

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const result = parseSheet(worksheet, sheetName);
    if (!result) continue;

    const outputPath = path.join(OUTPUT_DIR, `${result.outputName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2), 'utf-8');
    console.log(`  ✅ ${result.sheetName} → ${result.outputName}.json (${result.rows} rows)`);
  }
}

// ── 主流程 ──

function main(): void {
  console.log('🔄 Excel → JSON 数据转换');
  console.log(`   Excel 目录: ${EXCEL_DIR}`);
  console.log(`   输出目录:   ${OUTPUT_DIR}`);

  // 确保输出目录存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 解析命令行参数
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf('--file');
  const targetFile = fileArgIdx >= 0 ? args[fileArgIdx + 1] : null;

  // 获取 Excel 文件列表
  const excelFiles = fs.readdirSync(EXCEL_DIR)
    .filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
    .filter(f => !targetFile || f === targetFile);

  if (excelFiles.length === 0) {
    console.log('\n⚠️ 未找到 Excel 文件。请在 data_excel/ 目录下放置 .xlsx 文件。');
    console.log('   参考 docs/DATA_PIPELINE.md 了解 Excel 格式要求。');
    return;
  }

  for (const file of excelFiles) {
    processExcelFile(path.join(EXCEL_DIR, file));
  }

  console.log('\n✅ 转换完成！');
}

main();
