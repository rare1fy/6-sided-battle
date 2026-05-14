# Dice Hero · 场景施工图

> 本文为 CodeBuddy（接 cocos-mcp-server）或人工搭建场景时的"施工图"。
> 列出每个场景的完整节点树、各节点的位置、尺寸、组件配置、挂载脚本。
> 必须配合 `RESOLUTION_GUIDE.md` 使用，所有坐标基于 720×1280 设计分辨率。

---

## 总览：场景与启动顺序

```
启动 → LoadingScene → ClassSelectScene → BattleScene → SettlementScene → MapScene → 循环
```

| 场景文件                                | 用途              | 所属 Bundle  | 优先级 |
| --------------------------------------- | ----------------- | ------------ | ------ |
| `assets/scenes/Loading.scene`           | 启动加载          | main（主包） | P0 ✅  |
| `assets/scenes/ClassSelect.scene`       | 选职业            | main         | P0 ✅  |
| `assets/scenes/Battle.scene`            | 战斗              | main         | P1     |
| `assets/scenes/Settlement.scene`        | 战斗结算          | main         | P1     |
| `assets/scenes/Map.scene`               | 章节地图          | main         | P2     |

> 主包必须 ≤ 4MB（微信小游戏限制），所有场景脚本+少量小资源放主包，大资源走 bundle。

---

## ★ 公用 Prefab 规范（核心章节）

### 设计原则

**硬性规则**：任何 UI 元素在 ≥ 2 个场景出现，或在同一场景实例化 ≥ 2 次，**必须做成 Prefab**。
禁止在不同场景里复制粘贴相同的节点结构。

### 公用 Prefab 完整索引

| Prefab 名称        | 路径                                       | 使用场景                          | 类型     | 节点体系 |
| ------------------- | ------------------------------------------ | --------------------------------- | -------- | -------- |
| **HeaderBar**       | `assets/prefabs/ui/HeaderBar.prefab`       | ClassSelect / Battle / Map / Settlement | 通用 UI  | UI 节点  |
| **PlayerInfoPanel** | `assets/prefabs/ui/PlayerInfoPanel.prefab` | Battle / Map                      | 通用 UI  | UI 节点  |
| **ActionButton**    | `assets/prefabs/ui/ActionButton.prefab`    | 所有场景的主/次操作按钮           | 通用 UI  | UI 节点  |
| **ProgressBar**     | `assets/prefabs/ui/ProgressBar.prefab`     | Loading / Battle(HP/能量)         | 通用 UI  | UI 节点  |
| **FullScreenBG**    | `assets/prefabs/ui/FullScreenBG.prefab`    | 所有 5 个场景                     | 通用 UI  | UI 节点  |
| **PopupBase**       | `assets/prefabs/ui/PopupBase.prefab`       | 暂停 / 设置 / 确认框 / 奖励选择  | 弹窗容器 | UI 节点  |
| **ToastMessage**    | `assets/prefabs/ui/ToastMessage.prefab`    | 全局提示（加载失败/操作反馈）     | 通用 UI  | UI 节点  |
| **ClassCard**       | `assets/prefabs/game/ClassCard.prefab`     | ClassSelect                       | 业务     | UI 节点  |
| **Enemy**           | `assets/prefabs/game/Enemy.prefab`         | Battle                            | 业务     | ⚠️ **2D 节点** |
| **DiceCard**        | `assets/prefabs/game/DiceCard.prefab`      | Battle / Settlement               | 业务     | UI 节点  |
| **HpBar**           | `assets/prefabs/game/HpBar.prefab`         | Battle (Player+Enemy)             | 业务     | UI 节点  |
| **BuffIcon**        | `assets/prefabs/game/BuffIcon.prefab`      | Battle                            | 业务     | UI 节点  |
| **DamageNumber**    | `assets/prefabs/game/DamageNumber.prefab`  | Battle (飘字)                     | 业务     | ⚠️ **2D 节点** |
| **MapNode**         | `assets/prefabs/game/MapNode.prefab`       | Map                               | 业务     | UI 节点  |

> **目录规则**：`prefabs/ui/` 放通用 UI 组件，`prefabs/game/` 放业务专用组件。
> **节点体系规则**：大部分 Prefab 是 UI 节点（带 UITransform），但 **Enemy** 和 **DamageNumber** 是 **2D 节点**（不带 UITransform），它们在 BattleScene 的 Scene2D 子树下实例化，不在 Canvas 下。

---

### Prefab 1：HeaderBar（通用顶部栏）

**复用场景**：ClassSelect / Battle / Map / Settlement（4/5 场景）

```
HeaderBar (Node + UITransform: 720×80)
├── BackButton (cc.Button + cc.Sprite)     x=-300, 60×60, "<" 图标
├── TitleLabel (cc.Label)                  x=0, 字号 44, 居中
└── RightButton (cc.Button + cc.Sprite)    x=+300, 60×60, 默认隐藏
```

| 属性 | 类型 | 说明 |
|------|------|------|
| y 坐标 | 固定 | +580（顶部安全区内） |
| BackButton | 可选显示 | Loading 场景不显示 |
| TitleLabel | @property string | 由父场景 Controller 设置 |
| RightButton | 可选显示 | Battle 场景显示设置图标，其他隐藏 |

**挂载脚本**：`scripts/components/ui/HeaderBarView.ts`

```typescript
// 接口设计
interface HeaderBarConfig {
  title: string;
  showBack: boolean;
  rightIcon?: SpriteFrame;    // 不传则隐藏右侧按钮
  onBack?: () => void;
  onRight?: () => void;
}
```

---

### Prefab 2：PlayerInfoPanel（玩家状态栏）

**复用场景**：Battle / Map

```
PlayerInfoPanel (Node + UITransform: 600×60)
├── HpIcon (cc.Sprite)                    x=-250, 32×32, 心形图标
├── HpLabel (cc.Label "80/100")            x=-180, 字号 24
├── GoldIcon (cc.Sprite)                   x=-50, 32×32, 金币图标
├── GoldLabel (cc.Label "150")             x=+20, 字号 24
├── DiceIcon (cc.Sprite)                   x=+130, 32×32, 骰子图标
└── DiceCountLabel (cc.Label "6")          x=+190, 字号 24
```

**挂载脚本**：`scripts/components/ui/PlayerInfoView.ts`

```typescript
// 接口设计
interface PlayerInfoData {
  hp: number;
  maxHp: number;
  gold: number;
  diceCount: number;
}
```

---

### Prefab 3：ActionButton（通用操作按钮）

**复用场景**：所有场景的确认/取消/继续按钮

```
ActionButton (cc.Button + UITransform)
├── BG (cc.Sprite, 像素风按钮底)
├── ButtonLabel (cc.Label)                 字号 32, 居中
└── DisabledOverlay (cc.Sprite, 默认隐藏)  半透明灰色遮罩
```

| 变体 | 尺寸 | 颜色 | 用途 |
|------|------|------|------|
| Primary | 280×80 | #4CAF50 | 确认/开始冒险/继续 |
| Secondary | 200×60 | #666666 | 取消/返回 |
| Danger | 200×60 | #F44336 | 放弃/退出 |

**挂载脚本**：`scripts/components/ui/ActionButtonView.ts`

```typescript
enum ButtonStyle { PRIMARY, SECONDARY, DANGER }
interface ActionButtonConfig {
  label: string;
  style: ButtonStyle;
  enabled: boolean;
  onClick: () => void;
}
```

---

### Prefab 4：ProgressBar（通用进度条）

**复用场景**：Loading（加载进度）/ Battle（HP 条 / 能量条）

```
ProgressBar (Node + UITransform)
├── BarBg (cc.Sprite)                      全宽, color=#333333
├── BarFill (cc.Sprite)                    锚点(0, 0.5), 通过 scaleX 控制
└── ValueLabel (cc.Label, 可选)            字号 20, 居中
```

| 属性 | 类型 | 说明 |
|------|------|------|
| barWidth | number | 进度条总宽度（480 / 160 等） |
| barHeight | number | 进度条高度（24 / 16 等） |
| fillColor | Color | 填充颜色（绿/红/蓝） |
| showLabel | boolean | 是否显示数值文本 |
| labelFormat | string | 格式化模板，如 "{current}/{max}" 或 "{percent}%" |

**挂载脚本**：`scripts/components/ui/ProgressBarView.ts`

```typescript
// 核心方法
setProgress(current: number, max: number): void;
setColor(color: Color): void;
tweenTo(target: number, duration: number): void;  // 平滑动画
```

> **重要**：Battle 场景中的 PlayerHpBar、PlayerEnergyBar、Enemy 内的 HpBar 全部使用此 Prefab 实例化，只是传入不同的 barWidth / fillColor / labelFormat。

---

### Prefab 5：FullScreenBG（全屏背景）

**复用场景**：所有 5 个场景

```
FullScreenBG (cc.Sprite + UITransform: 720×1280 + Widget 全拉伸)
```

| 属性 | 类型 | 说明 |
|------|------|------|
| spriteFrame | SpriteFrame | 背景图（可选，不传则纯色） |
| bgColor | Color | 纯色背景色，默认 #1a1a2e |

**挂载脚本**：`scripts/components/ui/FullScreenBGView.ts`

> Widget 组件设置 top=0, bottom=0, left=0, right=0，自动撑满 Canvas。

---

### Prefab 6：PopupBase（弹窗容器）

**复用场景**：暂停菜单 / 设置面板 / 确认对话框 / 奖励选择

```
PopupBase (Node + UITransform: 720×1280)
├── Mask (cc.Sprite, 全屏半透明黑 #000000 alpha=0.6, 点击关闭可选)
├── Panel (cc.Sprite + UITransform)        居中, 默认 560×400
│   ├── TitleLabel (cc.Label)              y=+160, 字号 36
│   ├── ContentSlot (空 Node)              y=0, 内容区占位
│   ├── ConfirmButton (ActionButton)       y=-140, Primary 样式
│   └── CancelButton (ActionButton)        y=-140, Secondary 样式, 可选
└── (进出动画由脚本控制)
```

**挂载脚本**：`scripts/components/ui/PopupBaseView.ts`

```typescript
interface PopupConfig {
  title: string;
  panelSize?: Size;           // 默认 560×400
  confirmLabel?: string;      // 默认 "确认"
  cancelLabel?: string;       // 不传则不显示取消按钮
  closeOnMask?: boolean;      // 点击遮罩是否关闭
  onConfirm?: () => void;
  onCancel?: () => void;
}

// 进出动画
show(): void;   // scale 0→1 + fade in, 0.2s
hide(): void;   // scale 1→0 + fade out, 0.15s
```

**PopupManager 单例**：`scripts/managers/PopupManager.ts`

```typescript
// 全局弹窗管理
PopupManager.show(prefabPath: string, config: PopupConfig): Promise<Node>;
PopupManager.close(node: Node): void;
PopupManager.closeAll(): void;
```

---

### Prefab 7：ToastMessage（全局提示）

**复用场景**：全局（加载失败 / 操作反馈 / 获得物品提示）

```
ToastMessage (Node + UITransform: 400×60)
├── BG (cc.Sprite, 圆角矩形, #333333 alpha=0.85)
└── MessageLabel (cc.Label)                字号 24, 居中, 白色
```

**挂载脚本**：`scripts/components/ui/ToastView.ts`

```typescript
// 自动消失：从底部弹出 → 停留 1.5s → 淡出
show(message: string, duration?: number): void;
```

---

### Prefab 8：ClassCard（职业卡片）

```
ClassCard (cc.Button + UITransform: 220×320)
├── BG (cc.Sprite, 圆角矩形)
├── Portrait (cc.Sprite)              y=+80,  160×160
├── ClassName (cc.Label)              y=-50,  字号 32
├── ClassTag (cc.Label "近战/法术/敏捷") y=-100, 字号 24
└── SelectedFrame (cc.Sprite, 默认隐藏) 220×320, 高亮边框
```

**挂载脚本**：`scripts/components/game/ClassCardItem.ts`

---

### Prefab 9：Enemy（敌人单位）⚠️ 2D 节点

> **重要**：Enemy 是 2D 世界层节点，不是 UI 节点。根节点为 Node（非 UITransform），在 BattleScene 的 Scene2D 子树下实例化。

```
Enemy (Node, 2D 世界层)
├── BodySprite (cc.Sprite)            敌人立绘, 160×200
├── HpBarAnchor (Node)                y=+110, 血条挂载点
│   └── HpBar (ProgressBar Prefab)    barWidth=160, barHeight=16, fillColor=红
├── IntentIcon (cc.Sprite)            y=+150, 60×60 (攻击意图图标)
├── BuffSlot (Node)                   y=-110, 手动横向排列
│   └── BuffIcon × N (Prefab 实例化)
└── HitEffect (Node, 默认隐藏)        受击特效挂载点
```

**2D 特性**：
- 支持 `tween` 做攻击/受击/死亡动画（位移、缩放、旋转、透明度）
- 支持 Cocos Animation 编辑器做帧动画（idle / attack / hurt / death）
- 受击时可做震动（position 抖动）、闪白（shader）
- 死亡时可做淡出 + 下坠 + 粒子爆散

**挂载脚本**：`scripts/components/game/EnemyView.ts`

---

### Prefab 10：DiceCard（骰子卡牌）

```
DiceCard (cc.Button + UITransform: 100×140)
├── BG (cc.Sprite, 卡牌底)
├── DiceFace (cc.Sprite)                100×100  (骰子面图标)
├── ValueLabel (cc.Label)               y=+30, 字号 36
├── EffectLabel (cc.Label "+5攻")       y=-50, 字号 18
└── SelectedGlow (cc.Sprite, 默认隐藏)
```

**挂载脚本**：`scripts/components/game/DiceCardView.ts`

---

### Prefab 11：BuffIcon（Buff 图标）

```
BuffIcon (UITransform: 40×40)
├── IconSprite (cc.Sprite)              40×40
├── StackLabel (cc.Label)               右下角, 字号 16, 层数
└── DurationLabel (cc.Label)            左下角, 字号 14, 剩余回合
```

**挂载脚本**：`scripts/components/game/BuffIconView.ts`

---

### Prefab 12：DamageNumber（飘字）⚠️ 2D 节点

> **重要**：DamageNumber 在 2D 世界层中生成，跟随敌人/玩家的世界坐标飘出。

```
DamageNumber (Node, 2D 世界层)
└── Label (cc.Label, 字号 36, 描边 2px, 默认红色)
```

**挂载脚本**：`scripts/components/game/DamageNumberView.ts`

```typescript
// 对象池回收，不 destroy
// 在 2D 世界坐标生成，跟随目标位置
show(value: number, worldPos: Vec3, type: 'damage' | 'heal' | 'block'): void;
// 动画：向上飘 80px + 淡出, 0.8s, 完成后回池
// 颜色：damage=红, heal=绿, block=灰
```

---

### Prefab 13：MapNode（地图节点）

```
MapNode (cc.Button + UITransform: 80×80)
├── NodeIcon (cc.Sprite)                 64×64 (战斗/精英/商人/事件/Boss 图标)
├── NodeFrame (cc.Sprite)                80×80, 边框
├── CurrentMarker (cc.Sprite, 默认隐藏)  当前位置标记
└── CompletedOverlay (cc.Sprite, 默认隐藏) 已完成灰色遮罩
```

**挂载脚本**：`scripts/components/game/MapNodeView.ts`

---

## 场景 1：LoadingScene（启动加载）

**用途**：游戏入口、加载分包资源、显示加载进度。

### 节点树

```
LoadingScene (Scene 根)
└── Canvas (Layer:UI_2D)
    ├── FullScreenBG (Prefab 实例)         color=#1a1a2e
    │
    ├── LogoLayer
    │   ├── GameLogo (cc.Sprite)           y=+200, 256×256
    │   └── GameTitle (cc.Label "DICE HERO") y=+50, 字号 56
    │
    ├── ProgressBar (Prefab 实例)          y=-300, barWidth=480, showLabel=true, labelFormat="{percent}%"
    │
    ├── HintLabel (cc.Label "正在加载...")  y=-400, 字号 28
    │
    └── VersionLabel (cc.Label "v0.1.0")   y=-600, 字号 20
```

> **注意**：Loading 场景不使用 HeaderBar（没有返回按钮）。

### 挂载脚本

`LoadingScene` 根节点 → `scripts/scenes/LoadingController.ts`

### 验收 checklist
- [ ] 启动后 3 秒内出现 Logo 和进度条
- [ ] 进度条从 0% 平滑增长到 100%
- [ ] 完成后自动切换到 ClassSelect 场景
- [ ] 加载失败显示 ToastMessage 错误提示

---

## 场景 2：ClassSelectScene（职业选择）

### 节点树

```
ClassSelectScene
└── Canvas
    ├── FullScreenBG (Prefab 实例)         color=#0d0d1a
    │
    ├── HeaderBar (Prefab 实例)            title="选择你的职业", showBack=false
    │
    ├── ClassCardLayer (Layout: HORIZONTAL, spacing=24)
    │   │  y=+100, 自动布局
    │   ├── ClassCard (Prefab 实例) × 3
    │
    ├── DetailLayer
    │   └── DetailPanel                    y=-200, 600×320
    │       ├── ClassNameLabel (cc.Label)   字号 36
    │       ├── ClassDescLabel (cc.Label)   字号 24, 多行
    │       └── StarterDiceList (Layout: HORIZONTAL)
    │           └── DiceCard (Prefab 实例) × 6  缩小版 60×84
    │
    └── ActionButton (Prefab 实例)         y=-540, Primary, "开始冒险", 未选择时 disabled
```

### 挂载脚本

| 节点                   | 脚本                                    |
| ---------------------- | --------------------------------------- |
| ClassSelectScene 根    | `scripts/scenes/ClassSelectController.ts` |

### 验收 checklist
- [ ] 三张职业卡片正确显示（ClassCard Prefab）
- [ ] 点击卡片显示选中边框
- [ ] 详情面板正确显示职业描述和起始骰子（DiceCard Prefab 缩小版）
- [ ] 确认按钮在未选择时禁用（ActionButton disabled 状态）
- [ ] 确认后进入战斗场景

---

## 场景 3：BattleScene（战斗）⚠️ 2D + UI 混合架构

> **核心原则**：战斗场景采用 **2D 世界层 + UI 叠加层** 双层架构。
> - **会动的、有游戏表现的**（敌人、特效、飘字、玩家角色）→ 放 **Scene2D**（Node 子树，2D 世界坐标）
> - **固定位置的 HUD / 按钮 / 信息面板** → 放 **Canvas**（UI 层）
>
> 这样做的好处：
> 1. 敌人可以做位移/缩放/旋转动画，不受 UI Layout 约束
> 2. 可以用 Cocos Animation 编辑器做帧动画（idle / attack / hurt / death）
> 3. 支持镜头震屏、缩放、跟随（通过 Camera 组件）
> 4. 特效/粒子在 2D 层渲染，不受 UI 排序规则限制
> 5. 飘字跟随敌人世界坐标，不会因 UI 重排而跳位

### 节点树

```
BattleScene
│
├── Scene2D (Node)                          ← 2D 世界层（游戏内容）
│   │
│   ├── BattleBG (cc.Sprite)               ← 战斗背景图, 全屏
│   │
│   ├── EnemyLayer (Node)                  ← 敌人容器
│   │   ├── EnemySlot1 (Node)              pos=(-200, 200)
│   │   ├── EnemySlot2 (Node)              pos=(0, 200)
│   │   └── EnemySlot3 (Node)              pos=(200, 200)
│   │       └── (运行时 instantiate Enemy Prefab, 2D 节点)
│   │
│   ├── PlayerCharacter (Node)             ← 玩家角色立绘/动画
│   │   └── PlayerSprite (cc.Sprite)       pos=(0, -100), 玩家形象
│   │
│   ├── EffectLayer (Node)                 ← 技能特效 / 粒子
│   │
│   └── DamageNumberLayer (Node)           ← 飘字对象池（2D 世界坐标）
│       └── (运行时从对象池取 DamageNumber Prefab)
│
├── MainCamera (cc.Camera)                 ← 2D 相机（震屏/缩放用）
│   └── 默认 orthoHeight 适配 720×1280
│   └── 震屏：tween position 抖动 ±5px, 0.15s
│   └── 缩放：tween orthoHeight, 用于 Boss 登场等
│
└── Canvas (UI_2D)                         ← UI 叠加层（HUD）
    │
    ├── HeaderBar (Prefab 实例)            title="第1章-第1关", showBack=false, rightIcon=设置
    │
    ├── PlayerHUD (Node)                   ← 玩家状态 HUD
    │   ├── PlayerInfoPanel (Prefab 实例)  y=-220
    │   ├── PlayerHpBar (ProgressBar Prefab) y=-280, barWidth=480, fillColor=绿
    │   ├── PlayerEnergyBar (ProgressBar Prefab) y=-340, barWidth=480, barHeight=16, fillColor=蓝
    │   └── BuffIconList (Layout: HORIZONTAL) y=-380
    │       └── BuffIcon (Prefab 实例) × N
    │
    ├── DiceLayer (Node)                   ← 骰子手牌（UI 交互）
    │   └── DiceContainer (Layout: HORIZONTAL, spacing=16)
    │       │  y=-440
    │       └── DiceCard (Prefab 实例) × N  ← 骰子是 UI 节点（需要点击交互）
    │
    └── ActionLayer (Node)                 ← 操作按钮
        ├── ActionButton (Prefab 实例)     y=-580, x=-180, Primary, "投骰"
        └── ActionButton (Prefab 实例)     y=-580, x=+180, Secondary, "回合结束"
```

### 2D 层 vs UI 层 职责划分

| 元素 | 所在层 | 原因 |
|------|--------|------|
| 敌人（Enemy Prefab） | **Scene2D** | 需要攻击/受击/死亡动画，位移自由 |
| 玩家角色立绘 | **Scene2D** | 需要攻击动画、受击震动 |
| 飘字（DamageNumber） | **Scene2D** | 跟随敌人世界坐标飘出 |
| 技能特效/粒子 | **Scene2D** | 粒子系统在 2D 层渲染更自然 |
| 战斗背景 | **Scene2D** | 震屏时背景跟着动 |
| 血条/能量条 | **Canvas** | 固定屏幕位置，不跟随震屏 |
| 骰子手牌 | **Canvas** | 需要 UI 点击交互 + Layout 自动排列 |
| 操作按钮 | **Canvas** | 固定屏幕底部 |
| HeaderBar | **Canvas** | 固定屏幕顶部 |

### 相机震屏配置

```typescript
// BattleController.ts 中的震屏方法
shakeCamera(intensity: number = 5, duration: number = 0.15): void {
  const camera = this.mainCamera;
  tween(camera.node)
    .to(0.03, { position: new Vec3(intensity, -intensity, 0) })
    .to(0.03, { position: new Vec3(-intensity, intensity, 0) })
    .to(0.03, { position: new Vec3(intensity, 0, 0) })
    .to(0.03, { position: new Vec3(0, -intensity, 0) })
    .to(0.03, { position: new Vec3(0, 0, 0) })
    .start();
}
```

### 挂载脚本

| 节点                   | 脚本                                    |
| ---------------------- | --------------------------------------- |
| BattleScene 根         | `scripts/scenes/BattleController.ts`    |

### 战斗循环（与逻辑层对接）

```
BattleController.startBattle()
  ↓
GameLogic.initBattle(playerClass, enemies)   ← 现有逻辑层
  ↓
回合开始 → 投骰 → 选择骰子 → 释放技能 → 敌人行动 → 回合结束
  ↓
监听逻辑层事件，分层更新：

  【Scene2D 层更新】
  - onEnemyDamage → Enemy.playHurtAnim() + DamageNumberLayer.spawn(worldPos)
  - onEnemyDeath → Enemy.playDeathAnim() → 动画完成后 destroy
  - onPlayerAttack → PlayerCharacter.playAttackAnim()
  - onSkillEffect → EffectLayer.playEffect(skillType, targetPos)
  - onBigHit → shakeCamera()

  【Canvas UI 层更新】
  - onPlayerHpChange → PlayerHpBar.setProgress()
  - onBuffChange → BuffIconList 增删 BuffIcon Prefab
  - onTurnEnd → ActionButton.setEnabled()
  - onDiceRoll → DiceContainer 实例化 DiceCard Prefab
  ↓
胜利/失败 → PopupManager.show(结算弹窗) 或 进入 Settlement 场景
```

### 验收 checklist（最低可玩 MVP）
- [ ] 进入战斗后 Scene2D 层显示 1-3 个 Enemy（2D Prefab）
- [ ] Canvas 层显示 PlayerHpBar（ProgressBar Prefab）
- [ ] 点击"投骰"（ActionButton Prefab）出现 DiceCard（UI Prefab）× 6
- [ ] 点击骰子能选中（高亮）
- [ ] 选中骰子后 Scene2D 层敌人播放受击动画 + 飘字（DamageNumber）
- [ ] 敌人血量减少（Enemy 内 ProgressBar 更新）
- [ ] 大伤害触发相机震屏
- [ ] 敌人死亡播放死亡动画后移除
- [ ] 全部敌人死亡触发胜利

---

## 场景 4：SettlementScene（结算）

### 节点树

```
SettlementScene
└── Canvas
    ├── FullScreenBG (Prefab 实例)         半透明遮罩
    │
    ├── HeaderBar (Prefab 实例)            title="战斗结算", showBack=false
    │
    ├── ResultLayer
    │   └── ResultLabel (cc.Label)         y=+400, 字号 56, "胜利！"/"失败..."
    │
    ├── RewardLayer
    │   ├── GoldRewardLabel (cc.Label)     y=+200, 字号 36
    │   ├── ExpRewardLabel (cc.Label)      y=+140, 字号 32
    │   └── DiceRewardList (Layout: HORIZONTAL) y=0
    │       └── DiceCard (Prefab 实例) × 3   可选 1 个
    │
    └── ActionButton (Prefab 实例)         y=-540, Primary, "继续"
```

### 挂载脚本

`SettlementScene` 根 → `scripts/scenes/SettlementController.ts`

### 验收 checklist
- [ ] 胜利/失败状态正确显示
- [ ] 金币、经验奖励数值正确
- [ ] 三选一新骰子奖励（DiceCard Prefab）
- [ ] 继续按钮（ActionButton Prefab）跳转回地图场景

---

## 场景 5：MapScene（章节地图）

### 节点树

```
MapScene
└── Canvas
    ├── FullScreenBG (Prefab 实例)         地图背景
    │
    ├── HeaderBar (Prefab 实例)            title="第1章", rightIcon=null
    │   └── (HeaderBar 内嵌 PlayerInfoPanel Prefab 实例, y=-40)
    │
    ├── ScrollView (cc.ScrollView)
    │   └── Content (UITransform: 720×3000)
    │       ├── NodeLayer
    │       │   └── MapNode (Prefab 实例) × N
    │       └── PathLayer
    │           └── Path (Graphics 绘制连接线)
    │
    └── (无底部按钮，点击 MapNode 直接进入对应场景)
```

### 挂载脚本

`MapScene` 根 → `scripts/scenes/MapController.ts`

### 验收 checklist
- [ ] 地图节点正确生成（MapNode Prefab）
- [ ] 节点之间路径连线正确
- [ ] 玩家位置高亮（MapNode.CurrentMarker）
- [ ] 只有可达节点可点击
- [ ] 点击节点进入对应场景

---

## Prefab 目录结构

```
assets/prefabs/
├── ui/                          ← 通用 UI 组件（跨场景复用）
│   ├── HeaderBar.prefab
│   ├── PlayerInfoPanel.prefab
│   ├── ActionButton.prefab
│   ├── ProgressBar.prefab
│   ├── FullScreenBG.prefab
│   ├── PopupBase.prefab
│   └── ToastMessage.prefab
│
└── game/                        ← 业务组件（游戏逻辑专用）
    ├── ClassCard.prefab
    ├── Enemy.prefab
    ├── DiceCard.prefab
    ├── BuffIcon.prefab
    ├── DamageNumber.prefab
    └── MapNode.prefab
```

## 脚本目录结构

```
assets/scripts/components/
├── ui/                          ← 通用 UI 组件脚本
│   ├── HeaderBarView.ts
│   ├── PlayerInfoView.ts
│   ├── ActionButtonView.ts
│   ├── ProgressBarView.ts
│   ├── FullScreenBGView.ts
│   ├── PopupBaseView.ts
│   └── ToastView.ts
│
└── game/                        ← 业务组件脚本
    ├── ClassCardItem.ts
    ├── EnemyView.ts
    ├── DiceCardView.ts
    ├── BuffIconView.ts
    ├── DamageNumberView.ts
    └── MapNodeView.ts
```

---

## Prefab 嵌套规则

**允许的嵌套**（最多 2 层）：

```
Enemy (Prefab)
└── ProgressBar (Prefab)     ← 1 层嵌套，OK

PopupBase (Prefab)
└── ActionButton (Prefab)    ← 1 层嵌套，OK
```

**禁止的嵌套**（≥ 3 层）：

```
❌ Scene → PopupBase → Enemy → ProgressBar → BuffIcon
```

> 如果出现 3 层嵌套需求，说明设计有问题，需要拆分或扁平化。

---

## CodeBuddy 操作指南

### 创建 Prefab 的工作流

```
1. 先创建一个临时空场景用于编辑 Prefab
2. 按照本文档的 Prefab 结构创建节点树
3. 设置所有节点的尺寸、坐标、颜色
4. 挂载对应的脚本
5. 将根节点拖入 assets/prefabs/ui/ 或 assets/prefabs/game/ 生成 .prefab 文件
6. 删除临时场景中的节点
```

### 创建场景的工作流

```
1. 创建场景文件
2. 先实例化通用 Prefab（FullScreenBG → HeaderBar → ActionButton）
3. 再添加场景专属节点
4. 实例化业务 Prefab（ClassCard / Enemy / DiceCard 等）
5. 挂载场景 Controller 脚本
6. 保存场景
```

### 提示词模板（给 CodeBuddy）

```
按照 docs/SCENE_BUILD_GUIDE.md 的规范：
1. 先创建所有 prefabs/ui/ 下的 7 个通用 Prefab
2. 再创建 prefabs/game/ 下的 6 个业务 Prefab
3. 最后按场景施工图创建 5 个场景，场景中必须使用 Prefab 实例化，禁止手写重复节点

参考文档：
- docs/RESOLUTION_GUIDE.md（坐标和尺寸基准）
- docs/COCOS_RULE.md（脚本编写规范）
```

---

**本施工图与 `RESOLUTION_GUIDE.md`、`COCOS_RULE.md`、`ART_SPEC.md` 共同构成完整的场景搭建规范。**
**任何与这三份文档冲突的搭建必须返工。**
**任何跨场景重复的节点结构未使用 Prefab 的搭建必须返工。**
