/**
 * 输入系统管理
 * 处理键盘输入、事件绑定等
 */

class InputSystem {
    constructor() {
        this.keys = {};
        this.keyBindings = {};
        this.callbacks = {};
    }

    // ========== 初始化输入系统 ==========
    initialize(callbacks) {
        this.callbacks = callbacks;
        this.setupKeyBindings();
        this.setupEventListeners();
    }

    // ========== 设置键位绑定 ==========
    setupKeyBindings() {
        this.keyBindings = {
            movement: [CONFIG.KEYS.FORWARD, CONFIG.KEYS.BACKWARD, CONFIG.KEYS.LEFT, CONFIG.KEYS.RIGHT],
            actions: [CONFIG.KEYS.GAIN_EXP, CONFIG.KEYS.PICKUP, CONFIG.KEYS.SKILL_TREE, CONFIG.KEYS.INVENTORY],
            skills: CONFIG.KEYS.SKILLS
        };
    }

    // ========== 设置事件监听器 ==========
    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    // ========== 按键按下 ==========
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = true;

        try {
            // 面板切换
            if (key === CONFIG.KEYS.SKILL_TREE) {
                if (this.callbacks.onSkillTreeToggle) {
                    this.callbacks.onSkillTreeToggle();
                }
            }

            if (key === CONFIG.KEYS.INVENTORY) {
                if (this.callbacks.onInventoryToggle) {
                    this.callbacks.onInventoryToggle();
                }
            }

            // 非面板状态下的操作
            if (!uiSystem.isPanelActive()) {
                // 获取经验
                if (key === CONFIG.KEYS.GAIN_EXP) {
                    if (this.callbacks.onGainExp) {
                        this.callbacks.onGainExp(25);
                    }
                }

                // 拾取物品
                if (key === CONFIG.KEYS.PICKUP && gameState.nearestItem) {
                    if (this.callbacks.onPickupItem) {
                        this.callbacks.onPickupItem(gameState.nearestItem);
                    }
                }

                // 技能快捷键
                if (CONFIG.KEYS.SKILLS.includes(key)) {
                    const skillIndex = CONFIG.KEYS.SKILLS.indexOf(key);
                    const skillMap = [
                        'combat1', 'combat2', 'magic1', 'magic2', 'survival1', 'survival2'
                    ];
                    if (this.callbacks.onCastSkill) {
                        this.callbacks.onCastSkill(skillMap[skillIndex]);
                    }
                }
            }
        } catch (e) {
            console.error('Error handling key down:', e);
        }
    }

    // ========== 按键释放 ==========
    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
    }

    // ========== 检查键是否按下 ==========
    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    // ========== 检查多个键是否按下 ==========
    areKeysPressed(...keys) {
        return keys.every(key => this.keys[key]);
    }

    // ========== 清理 ==========
    cleanup() {
        this.keys = {};
        window.removeEventListener('keydown', (e) => this.handleKeyDown(e));
        window.removeEventListener('keyup', (e) => this.handleKeyUp(e));
    }
}

// 创建全局输入系统实例
const inputSystem = new InputSystem();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InputSystem, inputSystem };
}
