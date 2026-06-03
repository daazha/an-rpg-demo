# 3D RPG Demo - 完全重构版

🎮 一个完全模块化、可扩展的3D RPG游戏演示项目，使用Babylon.js引擎构建。

## ✨ 项目亮点

- **完全模块化架构** - 将代码分离为6个独立模块，便于维护和扩展
- **完善的错误处理** - 所有系统都包含try-catch错误捕获
- **性能优化** - 缓存向量、���少内存泄漏、合理使用资源
- **完整的保存系统** - 支持游戏进度LocalStorage自动保存
- **响应式UI设计** - 在不同分辨率下完美适配
- **实时统计系统** - 追踪玩家数据和游戏统计信息

## 📁 项目结构

```
an-rpg-demo/
├── index.html              # 主HTML入口（包含UI和样式）
├── js/
│   ├── config.js          # 游戏配置（所有常数和参数）
│   ├── game-state.js      # 玩家状态管理和数据持久化
│   ├── ui-system.js       # UI更新和事件管理
│   ├── skill-system.js    # 技能特效和伤害计算
│   ├── scene-manager.js   # 3D场景和物理系统
│   ├── input-system.js    # 键盘输入处理
│   └── main.js            # 主游戏引擎和循环
└── rpg.txt               # 原始版本备份
```

## 🎮 游戏操作

### 基础操作
| 按键 | 功能 |
|------|------|
| W/A/S/D | 移动 |
| 鼠标拖动 | 旋转视角 |
| 鼠标滚轮 | 缩放视角 |
| F | 获取经验值 |
| E | 拾取物品 |
| K | 打开技能树 |
| I | 打开背包 |
| 1-6 | 快速施放技能 |

### 高级操作
| 快捷键 | 功能 |
|--------|------|
| Ctrl+S | 保存游戏进度 |
| Ctrl+R | 重置游戏 |
| Ctrl+Shift+S | 查看游戏统计 |

## 🛠️ 模块说明

### 1. **config.js** - 配置模块
集中管理所有游戏常数，包括：
- 玩家初始数据
- 所有技能配置和参数
- 物品和合成配方
- 场景、灯光、摄像机参数
- UI和键位配置

```javascript
// 使用示例
CONFIG.PLAYER.MOVE_SPEED          // 玩家移速
CONFIG.SKILLS.combat1.cost        // 技能消耗
CONFIG.ITEMS.wood.emissive        // 物品外观
```

### 2. **game-state.js** - 状态管理
完整的游戏状态管理系统：
- **玩家数据**：等级、HP、经验、技能点
- **库存系统**：物品管理、合成功能
- **技能系统**：技能解锁、前置条件检查
- **伤害/治疗**：真实伤害计算
- **保存/读档**：LocalStorage数据持久化

```javascript
// 关键方法
gameState.gainExp(amount)          // 获得经验
gameState.unlockSkill(skillId)     // 解锁技能
gameState.craftItem(recipeName)    // 合成物品
gameState.takeDamage(amount)       // 受伤
gameState.heal(amount)             // 治疗
gameState.saveState()              // 保存进度
gameState.loadState()              // 读档
```

### 3. **ui-system.js** - UI系统
处理所有UI更新和事件：
- **玩家UI**：等级、HP、EXP显示
- **物品UI**：背包显示、合成按钮
- **消息系统**：浮动提示、交互提示
- **面板管理**：技能树、背包的显示/隐藏

```javascript
// 关键方法
uiSystem.updatePlayerUI(playerInfo)    // 更新玩家信息
uiSystem.showMessage(text, duration)   // 显示消息
uiSystem.togglePanel(type, camera)     // 切换面板
```

### 4. **skill-system.js** - 技能系统
完整的技能特效系统：
- **6个独立技能**：各自不同的特效表现
- **伤害计算**：基于难度系数的伤害
- **冷却管理**：防止连续施放
- **资源清理**：防止内存泄漏

```javascript
// 技能列表
combat1    - 重击：前方红色冲击波
combat2    - 旋风斩：绕身旋转刀光
magic1     - 火球术：向前发射火球
magic2     - 陨石：前方落下陨石
survival1  - 强韧：金色护盾+治疗
survival2  - 汲取：绿色粒子+治疗
```

### 5. **scene-manager.js** - 场景管理
完整的3D场景管理：
- **场景创建**：地面、树木、物品系统
- **昼夜循环**：动态天空和光照
- **天气系统**：下雨效果
- **物品管理**：生成、旋转、拾取检测
- **玩家移动**：相机跟随和碰撞

```javascript
// 关键方法
sceneManager.createScene()         // 创建场景
sceneManager.toggleWeather()       // 切换天气
sceneManager.spawnItem(type, pos)  // 生成物品
sceneManager.updateScene(delta, ...) // 每帧更新
```

### 6. **input-system.js** - 输入系统
统一的键盘输入管理：
- **按键追踪**：实时记录所有按键状态
- **事件回调**：统一的事件分发机制
- **快捷键绑定**：易于自定义快捷键

```javascript
// 关键方法
inputSystem.initialize(callbacks)  // 初始化
inputSystem.isKeyPressed(key)      // 检查按键
inputSystem.areKeysPressed(...keys) // 检查多键
```

### 7. **main.js** - 主引擎
游戏核心逻辑和循环：
- **系统初始化**：按顺序初始化所有模块
- **游戏循环**：每帧更新逻辑
- **事件处理**：统一处理所有游戏事件
- **生命周期**：启动、暂停、销毁

```javascript
// 关键方法
gameEngine.initialize()            // 初始化
gameEngine.start()                 // 启动游戏
gameEngine.saveGame()              // 保存游戏
gameEngine.resetGame()             // 重置游戏
```

## 🔧 配置调整

### 修改游戏难度
```javascript
// config.js
DIFFICULTY: {
    DAMAGE_MULTIPLIER: 1.0,   // 伤害倍数 (0-2)
    EXP_MULTIPLIER: 1.0,      // 经验倍数
    ENEMY_SPAWN_RATE: 1.0     // 敌人生成率
}
```

### 调整玩家参��
```javascript
PLAYER: {
    INITIAL_HP: 100,          // 初始血量
    EXP_TO_LEVEL: 100,        // 升级需要经验
    MOVE_SPEED: 15            // 移动速度
}
```

### 自定义技能伤害
```javascript
SKILL_EFFECTS: {
    combat1: {
        damage: 10,           // 修改伤害值
        ...
    }
}
```

## 📊 错误处理

所有系统都包含完善的错误处理：

```javascript
// 示例：技能施放
try {
    skillSystem.castSkill(skillId, playerMesh, camera);
} catch (error) {
    console.error('Error casting skill:', error);
    uiSystem.showMessage('❌ 技能施放失败');
}
```

## 💾 数据持久化

游戏自动保存到浏览器LocalStorage：

```javascript
// 自动保存（Ctrl+S）
gameState.saveState()      // 保存格式: { player, timestamp }

// 自动读取
gameState.loadState()      // 页面加载时自动恢复

// 清空保存
gameState.clearSave()      // 删除所有保存数据
```

## 🚀 扩展指南

### 添加新技能

1. **在config.js中添加配置**：
```javascript
SKILLS: {
    new_skill: {
        id: 'new_skill',
        name: '新技能',
        cost: 1,
        requires: 'combat1'
    }
}
```

2. **在skill-system.js中添加特效**：
```javascript
castNewSkill(playerMesh, camera, onComplete) {
    // 创建特效代码
}
```

3. **在main.js的castSkill中添加case**：
```javascript
case 'new_skill':
    skillSystem.castNewSkill(...);
    break;
```

### 添加新物品类型

1. **在config.js中配置**：
```javascript
ITEMS: {
    new_item: {
        id: 'new_item',
        name: '新物品',
        color: '#FF00FF',
        emissive: { r: 1, g: 0, b: 1 }
    }
}
```

2. **初始化时自动支持**（无需其他改动）

### 添加新敌人AI

创建新文件 `js/enemy-system.js`：
```javascript
class EnemySystem {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
    }
    
    spawnEnemy(type, position) {
        // 敌人生成逻辑
    }
    
    updateEnemies(delta) {
        // 敌人AI更新
    }
}
```

## 📈 性能优化建议

1. **减少粒子系统**：
   - 修改 `RAIN_PARTICLE_COUNT` 和 `emitRate`

2. **优化树木数量**：
   - 修改 `SCENE.TREE_COUNT` (默认80)

3. **物品数量**：
   - 修改 `SCENE.ITEM_SPAWN_COUNT` (默认15)

4. **阴影启用**：
   ```javascript
   this.lights.directional.shadowMinZ = 0;
   this.lights.directional.shadowMaxZ = 200;
   ```

## 🐛 调试技巧

### 在浏览器控制台查看统计数据
```javascript
console.table(gameEngine.getStats())
// 或按 Ctrl+Shift+S
```

### 查看当前游戏状态
```javascript
console.log(gameState.getPlayerInfo())
console.log(gameState.getStats())
```

### 快速测试技能
```javascript
gameState.unlockSkill('combat1')
gameState.player.skillPoints = 10
gameEngine.castSkill('combat1')
```

## 🎯 下一步开发计划

- [ ] 敌人AI系统
- [ ] 真实战斗系统（伤害、受击反馈）
- [ ] 任务系统
- [ ] 装备系统
- [ ] 多人联网
- [ ] 移动端支持
- [ ] 音效系统
- [ ] 粒子系统增强

## 📝 版本历史

### v2.0 (当前版本) - 完全重构
- ✅ 完全模块化架构
- ✅ 错误处理系统
- ✅ 保存/读档功能
- ✅ 配置集中管理
- ✅ UI系统优化
- ✅ 代码注释完善

### v1.0 - 原始版本
- 单文件设计
- 基础游戏功能
- 技能系统
- 物品系统

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**祝你玩得开心！** 🎮✨
一个3D 开放世界 RPG游戏demo，这是一个具有广阔开放世界、任务和角色成长的奇幻 RPG。
