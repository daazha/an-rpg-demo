/**
 * UI 系统管理
 * 处理所有UI更新、面板显示、消息提示等
 */

class UISystem {
    constructor() {
        this.pickupMsg = document.getElementById('pickup-msg');
        this.interactHint = document.getElementById('interact-hint');
        this.skillPanel = document.getElementById('skill-panel');
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.isPanelOpen = false;
        this.messageTimeouts = [];
    }

    // ========== 初始化UI事件 ==========
    initializeEvents(callbacks) {
        this.callbacks = callbacks;
        this.initializeSkillTree();
        this.initializeCraftButton();
        this.initializeWeatherButton();
    }

    // ========== 技能树事件 ==========
    initializeSkillTree() {
        document.querySelectorAll('.skill-node').forEach(node => {
            node.addEventListener('click', () => {
                const skillId = node.getAttribute('data-skill');
                if (this.callbacks.onSkillUnlock) {
                    this.callbacks.onSkillUnlock(skillId);
                    this.updateSkillNode(skillId);
                }
            });
        });
    }

    // ========== 合成按钮 ==========
    initializeCraftButton() {
        const craftBtn = document.getElementById('craft-btn');
        craftBtn.addEventListener('click', () => {
            if (this.callbacks.onCraft) {
                const result = this.callbacks.onCraft('sword');
                if (result.success) {
                    this.showMessage(`合成成功: ${result.result}!`);
                }
            }
        });
    }

    // ========== 天气按钮 ==========
    initializeWeatherButton() {
        const weatherBtn = document.getElementById('weather-btn');
        weatherBtn.addEventListener('click', () => {
            if (this.callbacks.onWeatherToggle) {
                this.callbacks.onWeatherToggle();
            }
        });
    }

    // ========== 更新玩家UI ==========
    updatePlayerUI(playerInfo) {
        try {
            document.getElementById('ui-level').innerText = playerInfo.level;
            document.getElementById('ui-hp-text').innerText = 
                `${playerInfo.hp}/${playerInfo.maxHp}`;
            document.getElementById('ui-hp-bar').style.width = 
                `${playerInfo.healthPercentage}%`;
            
            document.getElementById('ui-exp-text').innerText = 
                `${playerInfo.exp}/${playerInfo.expToLevel}`;
            document.getElementById('ui-exp-bar').style.width = 
                `${playerInfo.expPercentage}%`;
            
            document.getElementById('ui-sp').innerText = playerInfo.skillPoints;
        } catch (e) {
            console.error('Failed to update player UI:', e);
        }
    }

    // ========== 更新物品UI ==========
    updateInventoryUI(inventory) {
        try {
            document.getElementById('inv-wood').innerText = inventory.wood || 0;
            document.getElementById('inv-stone').innerText = inventory.stone || 0;
            document.getElementById('inv-crystal').innerText = inventory.crystal || 0;
            document.getElementById('inv-sword').innerText = inventory.sword || 0;

            // 更新合成按钮状态
            const craftBtn = document.getElementById('craft-btn');
            const canCraft = inventory.wood >= 2 && inventory.stone >= 1;
            craftBtn.disabled = !canCraft;
        } catch (e) {
            console.error('Failed to update inventory UI:', e);
        }
    }

    // ========== 更新技能节点 ==========
    updateSkillNode(skillId) {
        try {
            const node = document.querySelector(`[data-skill="${skillId}"]`);
            if (node) {
                node.classList.remove('locked');
                node.classList.add('active');

                // 解锁后续技能
                document.querySelectorAll(`[data-requires="${skillId}"]`).forEach(n => {
                    n.classList.remove('locked');
                });
            }
        } catch (e) {
            console.error('Failed to update skill node:', e);
        }
    }

    // ========== 消息提示系统 ==========
    showMessage(text, duration = CONFIG.UI.MESSAGE_DURATION) {
        try {
            this.pickupMsg.innerText = text;
            this.pickupMsg.style.opacity = 1;

            // 清除之前的超时
            this.messageTimeouts.forEach(timeout => clearTimeout(timeout));
            this.messageTimeouts = [];

            // 设置消息消失
            const timeout = setTimeout(() => {
                this.pickupMsg.style.opacity = 0;
            }, duration);

            this.messageTimeouts.push(timeout);
        } catch (e) {
            console.error('Failed to show message:', e);
        }
    }

    // ========== 交互提示 ==========
    showInteractHint(show = true) {
        try {
            this.interactHint.style.display = show ? 'block' : 'none';
        } catch (e) {
            console.error('Failed to toggle interact hint:', e);
        }
    }

    // ========== 面板管理 ==========
    togglePanel(panelType, camera) {
        try {
            const panel = panelType === 'skill' ? this.skillPanel : this.inventoryPanel;
            const otherPanel = panelType === 'skill' ? this.inventoryPanel : this.skillPanel;

            if (panel.style.display === 'block') {
                panel.style.display = 'none';
                this.isPanelOpen = false;
                if (camera) camera.attachControl(canvas, true);
            } else {
                panel.style.display = 'block';
                otherPanel.style.display = 'none';
                this.isPanelOpen = true;
                if (camera) camera.detachControl();
            }
        } catch (e) {
            console.error('Failed to toggle panel:', e);
        }
    }

    closeAllPanels(camera) {
        try {
            this.skillPanel.style.display = 'none';
            this.inventoryPanel.style.display = 'none';
            this.isPanelOpen = false;
            if (camera) camera.attachControl(canvas, true);
        } catch (e) {
            console.error('Failed to close panels:', e);
        }
    }

    isPanelActive() {
        return this.isPanelOpen;
    }

    // ========== 时间显示更新 ==========
    updateTimeDisplay(gameTime) {
        try {
            const hours = Math.floor(gameTime / 60).toString().padStart(2, '0');
            const minutes = Math.floor(gameTime % 60).toString().padStart(2, '0');
            document.getElementById('time-display').innerText = `${hours}:${minutes}`;
        } catch (e) {
            console.error('Failed to update time display:', e);
        }
    }

    // ========== 天气按钮文本更新 ==========
    updateWeatherButton(isRaining) {
        try {
            const weatherBtn = document.getElementById('weather-btn');
            weatherBtn.innerText = `切换天气: ${isRaining ? '下雨' : '晴天'}`;
        } catch (e) {
            console.error('Failed to update weather button:', e);
        }
    }

    // ========== 清理资源 ==========
    cleanup() {
        this.messageTimeouts.forEach(timeout => clearTimeout(timeout));
        this.messageTimeouts = [];
    }
}

// 创建全局UI系统实例
const uiSystem = new UISystem();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UISystem, uiSystem };
}
