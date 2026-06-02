/**
 * 游戏状态管理系统
 * 处理玩家数据、库存、技能等状态
 */

class GameState {
    constructor() {
        this.initializePlayerState();
        this.droppedItems = [];
        this.nearestItem = null;
        this.activeEffects = [];
    }

    // ========== 玩家状态初始化 ==========
    initializePlayerState() {
        this.player = {
            level: CONFIG.PLAYER.INITIAL_LEVEL,
            hp: CONFIG.PLAYER.INITIAL_HP,
            maxHp: CONFIG.PLAYER.INITIAL_HP,
            exp: CONFIG.PLAYER.INITIAL_EXP,
            expToLevel: CONFIG.PLAYER.EXP_TO_LEVEL,
            skillPoints: CONFIG.PLAYER.INITIAL_SKILL_POINTS,
            skills: {},
            inventory: {},
            stats: {
                totalDamageDealt: 0,
                totalHealing: 0,
                enemiesDefeated: 0,
                skillsCast: 0
            }
        };

        // 初始化技能状态
        Object.keys(CONFIG.SKILLS).forEach(skillId => {
            this.player.skills[skillId] = false;
        });

        // 初始化物品库存
        Object.keys(CONFIG.ITEMS).forEach(itemId => {
            this.player.inventory[itemId] = 0;
        });
        this.player.inventory.sword = 0;
    }

    // ========== 经验和升级 ==========
    gainExp(amount) {
        const actualAmount = Math.floor(amount * CONFIG.DIFFICULTY.EXP_MULTIPLIER);
        this.player.exp += actualAmount;

        if (this.player.exp >= this.player.expToLevel) {
            this.levelUp();
        }

        return actualAmount;
    }

    levelUp() {
        this.player.exp -= this.player.expToLevel;
        this.player.level++;
        this.player.skillPoints += CONFIG.PLAYER.SKILL_POINTS_PER_LEVEL;
        this.player.expToLevel = Math.floor(
            this.player.expToLevel * CONFIG.PLAYER.EXP_MULTIPLIER
        );
        this.player.maxHp += CONFIG.PLAYER.HP_PER_LEVEL;
        this.player.hp = this.player.maxHp;

        return {
            leveledUp: true,
            newLevel: this.player.level,
            newSkillPoints: this.player.skillPoints
        };
    }

    // ========== 技能解锁 ==========
    unlockSkill(skillId) {
        if (!CONFIG.SKILLS[skillId]) {
            console.error(`Skill not found: ${skillId}`);
            return { success: false, reason: 'Skill not found' };
        }

        const skillConfig = CONFIG.SKILLS[skillId];

        // 检查是否已解锁
        if (this.player.skills[skillId]) {
            return { success: false, reason: 'Skill already unlocked' };
        }

        // 检查技能点
        if (this.player.skillPoints < skillConfig.cost) {
            return { success: false, reason: 'Not enough skill points' };
        }

        // 检查前置条件
        if (skillConfig.requires && !this.player.skills[skillConfig.requires]) {
            return { success: false, reason: 'Prerequisite skill not unlocked' };
        }

        // 解锁技能
        this.player.skillPoints -= skillConfig.cost;
        this.player.skills[skillId] = true;

        // 应用技能奖励
        if (skillConfig.bonus) {
            if (skillConfig.bonus.hp) {
                this.player.maxHp += skillConfig.bonus.hp;
                this.player.hp += skillConfig.bonus.hp;
            }
        }

        return { success: true, newSkillPoints: this.player.skillPoints };
    }

    // ========== 物品管理 ==========
    addItem(itemId, quantity = 1) {
        if (!CONFIG.ITEMS[itemId] && itemId !== 'sword') {
            console.error(`Item not found: ${itemId}`);
            return false;
        }

        if (!this.player.inventory[itemId]) {
            this.player.inventory[itemId] = 0;
        }

        this.player.inventory[itemId] += quantity;
        return true;
    }

    removeItem(itemId, quantity = 1) {
        if (!this.player.inventory[itemId] || this.player.inventory[itemId] < quantity) {
            return false;
        }

        this.player.inventory[itemId] -= quantity;
        return true;
    }

    getItemCount(itemId) {
        return this.player.inventory[itemId] || 0;
    }

    // ========== 合成系统 ==========
    craftItem(recipeName) {
        if (!CONFIG.RECIPES[recipeName]) {
            console.error(`Recipe not found: ${recipeName}`);
            return { success: false, reason: 'Recipe not found' };
        }

        const recipe = CONFIG.RECIPES[recipeName];
        const ingredients = recipe.ingredients;

        // 检查材料是否充足
        for (const [itemId, required] of Object.entries(ingredients)) {
            if (this.getItemCount(itemId) < required) {
                return { success: false, reason: `Not enough ${itemId}` };
            }
        }

        // 消耗材料
        for (const [itemId, required] of Object.entries(ingredients)) {
            this.removeItem(itemId, required);
        }

        // 获得产物
        for (let i = 0; i < recipe.resultCount; i++) {
            this.addItem(recipe.result);
        }

        return { success: true, result: recipe.result, resultCount: recipe.resultCount };
    }

    // ========== 伤害和治疗 ==========
    takeDamage(amount) {
        const actualDamage = Math.floor(amount * CONFIG.DIFFICULTY.DAMAGE_MULTIPLIER);
        this.player.hp = Math.max(0, this.player.hp - actualDamage);
        return {
            actualDamage,
            isDead: this.player.hp === 0,
            remainingHp: this.player.hp
        };
    }

    heal(amount) {
        const oldHp = this.player.hp;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
        const actualHealing = this.player.hp - oldHp;
        this.player.stats.totalHealing += actualHealing;
        return actualHealing;
    }

    // ========== 技能使用统计 ==========
    recordSkillCast(skillId) {
        this.player.stats.skillsCast++;
        if (CONFIG.SKILL_EFFECTS[skillId]) {
            const skillDamage = CONFIG.SKILL_EFFECTS[skillId].damage || 0;
            if (skillDamage > 0) {
                this.player.stats.totalDamageDealt += skillDamage;
            }
        }
    }

    // ========== 掉落物管理 ==========
    addDroppedItem(mesh, itemType) {
        this.droppedItems.push({ mesh, type: itemType });
    }

    removeDroppedItem(item) {
        const index = this.droppedItems.indexOf(item);
        if (index > -1) {
            this.droppedItems.splice(index, 1);
        }
    }

    clearDroppedItems() {
        this.droppedItems.forEach(item => {
            if (item.mesh) {
                item.mesh.dispose();
            }
        });
        this.droppedItems = [];
    }

    // ========== 效果管理 ==========
    addActiveEffect(effectId, duration) {
        this.activeEffects.push({
            id: effectId,
            duration,
            startTime: Date.now()
        });
    }

    removeActiveEffect(effectId) {
        this.activeEffects = this.activeEffects.filter(e => e.id !== effectId);
    }

    clearActiveEffects() {
        this.activeEffects = [];
    }

    // ========== 数据导出和导入 ==========
    saveState() {
        const state = {
            player: this.player,
            timestamp: Date.now()
        };
        localStorage.setItem('rpg_game_state', JSON.stringify(state));
        return state;
    }

    loadState() {
        const saved = localStorage.getItem('rpg_game_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.player = state.player;
                return true;
            } catch (e) {
                console.error('Failed to load game state:', e);
                return false;
            }
        }
        return false;
    }

    clearSave() {
        localStorage.removeItem('rpg_game_state');
    }

    // ========== 重置游戏 ==========
    resetGame() {
        this.initializePlayerState();
        this.clearDroppedItems();
        this.clearActiveEffects();
    }

    // ========== 获取完整玩家信息 ==========
    getPlayerInfo() {
        return {
            ...this.player,
            healthPercentage: (this.player.hp / this.player.maxHp) * 100,
            expPercentage: (this.player.exp / this.player.expToLevel) * 100,
            unlockedSkills: Object.entries(this.player.skills)
                .filter(([_, unlocked]) => unlocked)
                .map(([skillId, _]) => skillId)
        };
    }

    // ========== 获取统计数据 ==========
    getStats() {
        return this.player.stats;
    }
}

// 创建全局游戏状态实例
const gameState = new GameState();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameState, gameState };
}
