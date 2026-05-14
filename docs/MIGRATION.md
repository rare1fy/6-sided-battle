# Dice Hero — Cocos Creator 迁移版

> 从 PixiJS 版本迁移而来，目标平台：微信小游戏 / 抖音小游戏

## 项目结构

```
DiceHeroCocos/
├── assets/
│   ├── scripts/
│   │   ├── logic/           ✅ 已迁移（纯 TS 逻辑，零引擎依赖）
│   │   │   ├── diceOnPlay/  ✅ 已迁移
│   │   │   └── settlement/  ✅ 已迁移
│   │   ├── data/            ✅ 已迁移（职业/骰子/敌人/遗物/音效数据）
│   │   │   └── sounds/      ✅ 已迁移
│   │   ├── config/          ✅ 已迁移（敌人配置/平衡数值/事件）
│   │   │   ├── balance/     ✅ 已迁移
│   │   │   └── events/      ✅ 已迁移
│   │   ├── types/           ✅ 已迁移（类型定义，已去除 React 依赖）
│   │   ├── engine/          ✅ 已迁移（遗物引擎，纯逻辑）
│   │   ├── utils/           ✅ 已迁移（地图生成/手牌评估等纯逻辑工具）
│   │   ├── components/      🔲 待开发（Cocos 组件脚本）
│   │   └── managers/        🔲 待开发（全局管理器）
│   ├── scenes/              🔲 待开发（Cocos 场景文件）
│   ├── prefabs/             🔲 待开发（UI 预制体）
│   │   ├── ui/
│   │   ├── battle/
│   │   └── common/
│   ├── resources/           🔲 待填充（动态加载资源）
│   ├── textures/            🔲 待填充（静态贴图/图集）
│   ├── audio/               🔲 待填充（BGM/SFX）
│   ├── fonts/               🔲 待填充（BMFont 像素字体）
│   └── animations/          🔲 待开发
├── docs/
│   ├── ART_SPEC.md          ✅ 美术规范（从 PixiJS 版继承）
│   ├── COCOS_RULE.md        ✅ Cocos 开发规范
│   └── MIGRATION.md         ✅ 本文件
└── tsconfig.json            ✅ TypeScript 配置
```

## 迁移状态

### ✅ 已完成：纯逻辑层直接复制（零改动）

| 目录 | 文件数 | 说明 |
|------|--------|------|
| `logic/` | 55 | 战斗/骰子/技能/AI/结算/遗物效果 |
| `data/` | 26 | 职业/骰子/敌人/遗物/音效数据定义 |
| `config/` | 11 | 敌人配置/平衡数值/事件系统 |
| `types/` | 4 | 核心类型定义（dice/entities/game/relics） |
| `engine/` | 3 | 遗物上下文/查询/更新 |
| `utils/` | 5 | 地图生成/手牌评估/秒杀挑战 |

### 🔲 需要在 Cocos 中重新开发

| 模块 | PixiJS 原文件 | Cocos 替代方案 |
|------|-------------|---------------|
| 场景管理 | `SceneManager.ts` | `director.loadScene()` |
| UI 组件 | `UIComponents.ts` / `UIFactory.ts` | Cocos UI 组件 + 预制体 |
| 像素贴图生成 | `PixelTextures.ts` | 编辑器导入 .png / Graphics 组件 |
| 战斗控制器 | `BattleController.ts` | Cocos 组件脚本 |
| 骰子渲染 | `PixelDice.ts` | Cocos Sprite + 动画 |
| 敌人舞台 | `EnemyStage.ts` | Cocos 预制体 |
| 各场景 UI | `*Scene.ts` (11个) | Cocos 场景 + 预制体 |
| 音频播放 | `soundPlayer.ts` | Cocos AudioSource |
| Debug GUI | `DebugGUI.ts` | Cocos Inspector（原生替代） |
| Tween 动画 | `Tween.ts` | Cocos `tween()` API |
| 粒子效果 | `Particles.ts` | Cocos CPUParticles2D |

### ⚠️ 需要适配的文件

| 文件 | 问题 | 处理方式 |
|------|------|---------|
| `global.d.ts` | 依赖 React 类型 | 已跳过，Cocos 不需要 |
| `skillModules.tsx` | 扩展名为 .tsx 但无 React 依赖 | 已改为 .ts 复制 |
| `highlightRelic.tsx` | 依赖 React | 跳过，需用 Cocos RichText 重写 |
| `renderFloatText.tsx` | 依赖 React | 跳过，需用 Cocos Label + Tween 重写 |
| `richText.tsx` | 依赖 React | 跳过，需用 Cocos RichText 重写 |
| `uiHelpers.tsx` | 依赖 React | 跳过，需用 Cocos 组件重写 |
| `soundPlayer.ts` | 依赖 Vite asset import | 跳过，需用 Cocos AudioSource 重写 |

## Import 路径说明

迁移的代码中 import 路径使用相对路径（如 `../types/game`），在 Cocos Creator 中：
- Cocos 的 TS 编译器支持相对路径 import
- 目录结构已保持与原项目一致，大部分 import 无需修改
- 如果 import 跨层级（如 logic → types），路径关系已保持不变

## 下一步开发计划

1. **用 Cocos Creator 打开项目** → 创建初始场景
2. **创建 GameManager 单例** → 管理全局游戏状态
3. **搭建职业选择场景** → 用编辑器拖拽 UI + 组件脚本绑定数据
4. **搭建战斗场景** → 预制体 + BattleController 组件
5. **接入音频系统** → AudioSource + 音频管理器
6. **微信小游戏适配** → 构建面板选择微信平台
