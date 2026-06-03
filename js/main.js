/**
 * 主游戏入口
 * 初始化所有系统并运行游戏循环
 */

class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }

        this.engine = new BABYLON.Engine(this.canvas, true);
        this.isRunning = false;
        this.systems = {};
    }

    // ========== 初始化游戏 ==========
    async initialize() {
        try {
            console.log('🎮 Initializing Game Engine...');

            // 初始化场景管理器
            sceneManager = new SceneManager(this.canvas, this.engine);
            sceneManager.createScene();
            this.systems.scene = sceneManager;

            // 初始化技能系统
            skillSystem = new SkillSystem(sceneManager.scene);
            this.systems.skill = skillSystem;

            // 初始化UI系统回调
            uiSystem.initializeEvents({
                onSkillUnlock: (skillId) => this.handleSkillUnlock(skillId),
                onCraft: (recipeName) => this.handleCraft(recipeName),
                onWeatherToggle: () => this.handleWeatherToggle()
            });

            // 初始化输入系统回调
            inputSystem.initialize({
                onSkillTreeToggle: () => this.toggleSkillTree(),
                onInventoryToggle: () => this.toggleInventory(),
                onGainExp: (amount) => this.gainExp(amount),
                onPickupItem: (item) => this.pickupItem(item),
                onCastSkill: (skillId) => this.castSkill(skillId)
            });

            // 加载保存的游戏状态
            const hasSave = gameState.loadState();
            if (!hasSave) {
                console.log('📝 No save found, starting new game');
            } else {
                console.log('📂 Game state loaded from save');
            }

            // 更新初始UI
            this.updateAllUI();

            // 设置窗口事件
            window.addEventListener('resize', () => this.handleWindowResize());

            console.log('✅ Game Engine initialized successfully');
            this.isRunning = true;

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize game engine:', error);
            return false;
        }
    }

    // ========== 启动游戏循环 ==========
    start() {
        if (!this.isRunning) {
            console.error('Game engine not initialized');
            return;
        }

        console.log('🚀 Starting game loop');

        this.engine.runRenderLoop(() => {
            try {
                const delta = this.engine.getDeltaTime() / 1000;

                // 更新场景
                sceneManager.updateScene(
                    delta,
                    sceneManager.player,
                    inputSystem.keys,
                    CONFIG.PLAYER.MOVE_SPEED
                );

                // 渲染场景
                sceneManager.scene.render();
            } catch (error) {
                console.error('Error in game loop:', error);
            }
        });
    }

    // ========== 技能解锁处理 ==========
    handleSkillUnlock(skillId) {
        try {
            const result = gameState.unlockSkill(skillId);

            if (result.success) {
                uiSystem.showMessage(`✨ 技能已解锁: ${CONFIG.SKILLS[skillId].name}`);
                this.updateAllUI();
            } else {
                uiSystem.showMessage(`❌ ${result.reason}`);
            }
        } catch (error) {
            console.error('Error unlocking skill:', error);
            uiSystem.showMessage('❌ 技能解锁失败');
        }
    }

    // ========== 合成处理 ==========
    handleCraft(recipeName) {
        try {
            const result = gameState.craftItem(recipeName);

            if (result.success) {
                uiSystem.showMessage(
                    `✨ 合成成功: ${CONFIG.RECIPES[recipeName].name}`
                );
                this.updateAllUI();
            } else {
                uiSystem.showMessage(`❌ ${result.reason}`);
            }

            return result;
        } catch (error) {
            console.error('Error crafting item:', error);
            uiSystem.showMessage('❌ 合成失败');
            return { success: false };
        }
    }

    // ========== 天气切换处理 ==========
    handleWeatherToggle() {
        try {
            sceneManager.toggleWeather();
        } catch (error) {
            console.error('Error toggling weather:', error);
        }
    }

    // ========== 获取经验 ==========
    gainExp(amount) {
        try {
            const actualAmount = gameState.gainExp(amount);
            const levelUpResult = gameState.player.exp >= gameState.player.expToLevel;

            if (levelUpResult) {
                uiSystem.showMessage('🎉 升级了!');
            }

            this.updateAllUI();
        } catch (error) {
            console.error('Error gaining exp:', error);
        }
    }

    // ========== 拾取物品 ==========
    pickupItem(item) {
        try {
            if (!item || !item.mesh) {
                console.warn('Invalid item to pickup');
                return;
            }

            const itemName = CONFIG.ITEMS[item.type]?.name || item.type;
            gameState.addItem(item.type);
            uiSystem.showMessage(`📦 获得: ${itemName}`);

            item.mesh.dispose();
            gameState.removeDroppedItem(item);
            gameState.nearestItem = null;
            uiSystem.showInteractHint(false);

            this.updateAllUI();
        } catch (error) {
            console.error('Error picking up item:', error);
        }
    }

    // ========== 施放技能 ==========
    castSkill(skillId) {
        try {
            if (!gameState.player.skills[skillId]) {
                uiSystem.showMessage('❌ 技能未解锁');
                return;
            }

            const success = skillSystem.castSkill(
                skillId,
                sceneManager.player,
                sceneManager.camera
            );

            if (success) {
                uiSystem.showMessage(`⚡ 施放技能: ${CONFIG.SKILLS[skillId].name}`);
            }
        } catch (error) {
            console.error('Error casting skill:', error);
            uiSystem.showMessage('❌ 技能施放失败');
        }
    }

    // ========== 技能树切换 ==========
    toggleSkillTree() {
        try {
            uiSystem.togglePanel('skill', sceneManager.camera);
            this.updateAllUI();
        } catch (error) {
            console.error('Error toggling skill tree:', error);
        }
    }

    // ========== 背包切换 ==========
    toggleInventory() {
        try {
            uiSystem.togglePanel('inventory', sceneManager.camera);
            this.updateAllUI();
        } catch (error) {
            console.error('Error toggling inventory:', error);
        }
    }

    // ========== 更新所有UI ==========
    updateAllUI() {
        try {
            const playerInfo = gameState.getPlayerInfo();
            uiSystem.updatePlayerUI(playerInfo);
            uiSystem.updateInventoryUI(gameState.player.inventory);
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    // ========== 窗口大小改变 ==========
    handleWindowResize() {
        try {
            this.engine.resize();
        } catch (error) {
            console.error('Error handling window resize:', error);
        }
    }

    // ========== 保存游戏 ==========
    saveGame() {
        try {
            gameState.saveState();
            uiSystem.showMessage('💾 游戏已保存');
            console.log('✅ Game saved');
        } catch (error) {
            console.error('Error saving game:', error);
            uiSystem.showMessage('❌ 保存失败');
        }
    }

    // ========== 重置游戏 ==========
    resetGame() {
        try {
            if (confirm('确认要重置游戏吗?')) {
                gameState.resetGame();
                uiSystem.showMessage('🔄 游戏已重置');
                this.updateAllUI();
                console.log('✅ Game reset');
            }
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    }

    // ========== 获取游戏统计 ==========
    getStats() {
        return {
            playerInfo: gameState.getPlayerInfo(),
            gameStats: gameState.getStats(),
            sceneTime: sceneManager.gameTime
        };
    }

    // ========== 销毁游戏 ==========
    destroy() {
        try {
            console.log('🛑 Shutting down game engine...');

            uiSystem.cleanup();
            inputSystem.cleanup();
            skillSystem.dispose();
            sceneManager.dispose();

            this.engine.dispose();
            this.isRunning = false;

            console.log('✅ Game engine shut down');
        } catch (error) {
            console.error('Error destroying game engine:', error);
        }
    }
}

// ========== 游戏启动 ==========
let gameEngine;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🎮 Initializing 3D RPG Demo...');

        // 创建游戏引擎
        gameEngine = new GameEngine('renderCanvas');

        // 初始化
        const initialized = await gameEngine.initialize();

        if (initialized) {
            // 启动游戏循环
            gameEngine.start();
            console.log('🎮 Game started!');

            // 快捷键: 保存 (Ctrl+S)
            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    gameEngine.saveGame();
                }
            });

            // 快捷键: 重置 (Ctrl+R)
            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    gameEngine.resetGame();
                }
            });

            // 快捷键: 统计 (Ctrl+Shift+S)
            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                    e.preventDefault();
                    console.table(gameEngine.getStats());
                }
            });

        } else {
            console.error('Failed to initialize game');
            alert('游戏初始化失败，请检查浏览器控制台');
        }
    } catch (error) {
        console.error('Fatal error:', error);
        alert('发生严重错误: ' + error.message);
    }
});

// ========== 页面卸载清理 ==========
window.addEventListener('beforeunload', () => {
    if (gameEngine) {
        gameEngine.saveGame();
        gameEngine.destroy();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine };
}
