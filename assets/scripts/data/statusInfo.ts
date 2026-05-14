import { StatusType } from '../types/game';

/**
 * STATUS_INFO — 所有状态的视觉定义（Cocos 版）
 *
 * color 字段改为十六进制色值（替代 Tailwind CSS 类名），
 * UI 层直接用 new Color().fromHEX(color) 即可。
 */
export const STATUS_INFO: Record<StatusType, {
  icon: string;
  color: string;
  colorRgb: string;
  bgColor: string;
  borderColor: string;
  label: string;
  description: string;
  kind: 'buff' | 'debuff';
}> = {
  poison:     { icon: 'poison',        color: '#c084fc', colorRgb: 'rgb(192,132,252)', bgColor: 'rgba(160,80,255,0.15)', borderColor: 'rgba(160,80,255,0.5)', label: '中毒',   description: '每回合结束时受到 X 点伤害，随后层数减 1。', kind: 'debuff' },
  burn:       { icon: 'flame',         color: '#fb923c', colorRgb: 'rgb(251,146,60)',  bgColor: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.5)',  label: '灼烧',   description: '回合结束时受到 X 点火焰伤害，随后灼烧消失。', kind: 'debuff' },
  dodge:      { icon: 'wind',          color: '#93c5fd', colorRgb: 'rgb(147,197,253)', bgColor: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.5)',  label: '闪避',   description: '下次受到攻击时，有概率完全回避。', kind: 'buff' },
  vulnerable: { icon: 'cracked-heart', color: '#fb923c', colorRgb: 'rgb(251,146,60)', bgColor: 'rgba(251,146,60,0.18)', borderColor: 'rgba(251,146,60,0.55)', label: '易伤', description: '受到的伤害翻倍（×2）。每回合结束 -1 层，层数归零时消失。可被净化。', kind: 'debuff' },
  strength:   { icon: 'arrow-up',      color: '#fb923c', colorRgb: 'rgb(251,146,60)', bgColor: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.5)',  label: '力量',   description: '造成的伤害增加 X 点。', kind: 'buff' },
  weak:       { icon: 'arrow-down',    color: '#a1a1aa', colorRgb: 'rgb(161,161,170)', bgColor: 'rgba(161,161,170,0.15)', borderColor: 'rgba(161,161,170,0.5)', label: '虚弱', description: '造成的伤害减少 25%。', kind: 'debuff' },
  armor:      { icon: 'shield',        color: '#60a5fa', colorRgb: 'rgb(96,165,250)',  bgColor: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.5)',  label: '护甲',   description: '抵挡即将到来的伤害。', kind: 'buff' },
  freeze:     { icon: 'wind',          color: '#93c5fd', colorRgb: 'rgb(147,197,253)', bgColor: 'rgba(147,197,253,0.15)', borderColor: 'rgba(147,197,253,0.5)', label: '冻结', description: '完全无法行动。', kind: 'debuff' },
  stun:       { icon: 'wind',          color: '#facc15', colorRgb: 'rgb(250,204,21)',  bgColor: 'rgba(250,204,21,0.15)',  borderColor: 'rgba(250,204,21,0.5)',  label: '眩晕', description: '无法行动，持续 X 回合。', kind: 'debuff' },
  silence:    { icon: 'wind',          color: '#f472b6', colorRgb: 'rgb(244,114,182)', bgColor: 'rgba(244,114,182,0.15)', borderColor: 'rgba(244,114,182,0.5)', label: '沉默', description: '无法使用技能，只能普攻。', kind: 'debuff' },
};
