# 贡献指南

## 🎯 项目愿景

打造一个可扩展、易维护的3D RPG游戏框架，作为学习现代Web游戏开发的参考。

## 🤝 如何贡献

### 报告Bug

如果发现问题，请创建Issue并包含：
- 问题描述
- 重现步骤
- 浏览器版本
- 控制台错误信息

### 建议功能

提交PR前，请先创建Issue讨论：
- 功能描述
- 实现方案
- 相关截图

### 代码提交流程

1. **Fork项目**
```bash
git clone https://github.com/yourusername/an-rpg-demo.git
cd an-rpg-demo
```

2. **创建特性分支**
```bash
git checkout -b feature/your-feature-name
```

3. **遵循代码规范**

#### 命名规范
```javascript
// ✅ 类名：PascalCase
class GameEngine { }

// ✅ 方法名：camelCase
gainExp(amount) { }

// ✅ 常量：UPPER_SNAKE_CASE
CONFIG.PLAYER.MOVE_SPEED

// ✅ 私有方法：_开头
_updateInternal() { }
```

#### 代码风格
```javascript
// ✅ 总是使用try-catch
try {
    // 代码
} catch (error) {
    console.error('操作名:', error);
}

// ✅ 在config.js添加参数
CONFIG.NEW_SYSTEM = { }

// ✅ 完善的注释
function doSomething() {
    // 做什么？为什么这样做
}

// ❌ 避免
var x = 5; // 用const/let
doSomething(); // 可能崩溃
```

4. **编写测试**
```javascript
// 在浏览器控制台测试你的功能
gameState.unlockSkill('combat1');
console.assert(gameState.player.skills.combat1 === true);
```

5. **提交代码**
```bash
git add .
git commit -m "feat: 添加新功能描述"
git push origin feature/your-feature-name
```

6. **创建Pull Request**
   - 清晰的标题
   - 详细的描述
   - 链接相关Issue

## 📋 代码审查检查清单

提交PR前，请确保：

- [ ] 代码格式正确
- [ ] 包含错误处理
- [ ] 添加了注释
- [ ] 在config.js添加配置
- [ ] 所有功能都工作正常
- [ ] 没有内存泄漏
- [ ] 性能没有下降
- [ ] 更新了README（如需要）

## 🎨 模块开发模板

### 创建新系统模板

```javascript
/**
 * 新系统说明
 * 详细描述系统功能
 */

class NewSystem {
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.state = {};
        this.isInitialized = false;
    }

    // ========== 初始化 ==========
    initialize(config) {
        try {
            // 初始化代码
            this.isInitialized = true;
            console.log('✅ NewSystem initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize NewSystem:', error);
            return false;
        }
    }

    // ========== 核心功能 ==========
    doSomething(param) {
        if (!this.isInitialized) {
            console.warn('System not initialized');
            return null;
        }

        try {
            // 功能实现
            return result;
        } catch (error) {
            console.error('Error in doSomething:', error);
            return null;
        }
    }

    // ========== 清理资源 ==========
    cleanup() {
        try {
            // 清理代码
            this.isInitialized = false;
        } catch (error) {
            console.error('Error cleaning up:', error);
        }
    }
}
```

## 📊 性能基准

为了维持游戏性能，请确保：

| 指标 | 要求 | 测试方法 |
|------|------|---------|
| FPS | 55+ | 60秒平均 |
| 内存 | <100MB | Chrome DevTools |
| 启动 | <3s | 测量DOMContentLoaded |
| GC停顿 | <10ms | Performance Tab |

## 🧪 测试指南

### 功能测试
```javascript
// 1. 打开浏览器开发者工具 (F12)
// 2. 在Console中测试

// 测试游戏状态
console.log(gameState.getPlayerInfo())

// 测试技能系统
gameState.unlockSkill('combat1')
skillSystem.castSkill('combat1', sceneManager.player, sceneManager.camera)

// 测试UI
uiSystem.showMessage('测试消息')

// 查看完整统计
console.table(gameEngine.getStats())
```

### 性能测试
```javascript
// 1. 打开Chrome DevTools
// 2. 性能选项卡

// 录制15秒
// 检查指标：
// - FPS > 55
// - 无内存泄漏
// - GC停顿 < 10ms
```

### 兼容性测试

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 60+ | ✅ |
| Firefox | 60+ | ✅ |
| Safari | 12+ | ⚠️ WebGL |
| Edge | 79+ | ✅ |
| IE | - | ❌ |

## 📚 文档规范

### 代码注释
```javascript
/**
 * 函数简要说明
 * 
 * 详细描述（可选）
 * 
 * @param {类型} paramName - 参数说明
 * @return {类型} 返回值说明
 */
function myFunction(paramName) {
    // 单行注释说明代码意图
}
```

### README更新

添加功能后请更新README：
1. 项目结构部分
2. API文档部分
3. 使用示例
4. 常见问题

## 🐛 常见陷阱

### 1. 内存泄漏
```javascript
// ❌ 不好：定时器从不清理
setInterval(() => { /* ... */ }, 16);

// ✅ 好的：记录并统一清理
this.animations.push(animationId);
// 销毁时
this.animations.forEach(id => clearInterval(id));
```

### 2. 全局变量污染
```javascript
// ❌ 不好
window.myData = data;

// ✅ 好的
const myModule = {
    data: data,
    methods: { /* ... */ }
};
```

### 3. 缺少错误处理
```javascript
// ❌ 不好
const value = JSON.parse(userInput);

// ✅ 好的
try {
    const value = JSON.parse(userInput);
} catch (error) {
    console.error('Invalid JSON:', error);
    uiSystem.showMessage('输入格式错误');
}
```

### 4. 性能问题
```javascript
// ❌ 不好：每帧创建新对象
onBeforeRenderObservable.add(() => {
    const newVector = new BABYLON.Vector3(x, y, z);
});

// ✅ 好的：复用对象
const vector = new BABYLON.Vector3(0, 0, 0);
onBeforeRenderObservable.add(() => {
    vector.x = x;
    vector.y = y;
    vector.z = z;
});
```

## 🚀 高优先级需求

### 功能需求
1. [ ] 敌人AI系统
2. [ ] 实时伤害反馈
3. [ ] 任务系统
4. [ ] 装备系统
5. [ ] 音效系统

### 改进需求
1. [ ] 移动端支持
2. [ ] 多语言支持
3. [ ] 性能优化
4. [ ] 更多特效
5. [ ] 更多技能

## 💬 讨论和反馈

- **GitHub Issues** - bug报告和功能请求
- **Discussions** - 技术讨论和建议
- **Pull Requests** - 代码审查和改进

## 📄 许可证

本项目采用MIT许可证。提交代码表示同意许可证条款。

---

**感谢贡献！** 🙏✨
