/**
 * RPG 游戏配置文件
 * 集中管理所有魔法数字和配置常量
 */

const CONFIG = {
    // ========== 玩家配置 ==========
    PLAYER: {
        INITIAL_HP: 100,
        INITIAL_LEVEL: 1,
        INITIAL_EXP: 0,
        EXP_TO_LEVEL: 100,
        EXP_MULTIPLIER: 1.5,
        HP_PER_LEVEL: 20,
        INITIAL_SKILL_POINTS: 0,
        SKILL_POINTS_PER_LEVEL: 2,
        MOVE_SPEED: 15,
        SIZE: { width: 1, height: 2, depth: 1 },
        COLOR: { r: 0.2, g: 0.4, b: 0.8 }
    },

    // ========== 技能配置 ==========
    SKILLS: {
        combat1: {
            id: 'combat1',
            name: '重击',
            key: '1',
            cost: 1,
            requires: null,
            type: 'combat'
        },
        combat2: {
            id: 'combat2',
            name: '旋风斩',
            key: '2',
            cost: 1,
            requires: 'combat1',
            type: 'combat'
        },
        magic1: {
            id: 'magic1',
            name: '火球术',
            key: '3',
            cost: 1,
            requires: null,
            type: 'magic'
        },
        magic2: {
            id: 'magic2',
            name: '陨石',
            key: '4',
            cost: 2,
            requires: 'magic1',
            type: 'magic'
        },
        survival1: {
            id: 'survival1',
            name: '强韧',
            key: '5',
            cost: 1,
            requires: null,
            type: 'survival',
            bonus: { hp: 50 }
        },
        survival2: {
            id: 'survival2',
            name: '汲取',
            key: '6',
            cost: 2,
            requires: 'survival1',
            type: 'survival',
            bonus: { hp: 50 }
        }
    },

    // ========== 技能特效配置 ==========
    SKILL_EFFECTS: {
        combat1: {
            duration: 30,
            scale: 0.2,
            color: { r: 1, g: 0, b: 0 },
            damage: 10
        },
        combat2: {
            duration: 30,
            bladeCount: 3,
            color: { r: 0, g: 1, b: 1 },
            damage: 15
        },
        magic1: {
            duration: 60,
            speed: 0.5,
            color: { r: 1, g: 0.5, b: 0 },
            damage: 12
        },
        magic2: {
            duration: 60,
            fallSpeed: 0.5,
            color: { r: 1, g: 0.2, b: 0 },
            damage: 25
        },
        survival1: {
            duration: 30,
            color: { r: 1, g: 0.8, b: 0 },
            healing: 30
        },
        survival2: {
            duration: 30,
            color: { r: 0, g: 1, b: 0 },
            healing: 50
        }
    },

    // ========== 物品配置 ==========
    ITEMS: {
        wood: {
            id: 'wood',
            name: '木材',
            color: '#8B4513',
            emissive: { r: 0.3, g: 0.1, b: 0 }
        },
        stone: {
            id: 'stone',
            name: '石头',
            color: '#808080',
            emissive: { r: 0.2, g: 0.2, b: 0.2 }
        },
        crystal: {
            id: 'crystal',
            name: '魔法水晶',
            color: '#9400D3',
            emissive: { r: 0.6, g: 0, b: 1 }
        }
    },

    // ========== 合成配方 ==========
    RECIPES: {
        sword: {
            name: '铁剑',
            ingredients: { wood: 2, stone: 1 },
            result: 'sword',
            resultCount: 1
        }
    },

    // ========== 场景配置 ==========
    SCENE: {
        GROUND_SIZE: 500,
        GRASS_TEXTURE_SIZE: 512,
        TREE_COUNT: 80,
        ITEM_SPAWN_COUNT: 15,
        ITEM_SPAWN_RADIUS: 100,
        ITEM_SIZE: 0.8
    },

    // ========== 摄像机配置 ==========
    CAMERA: {
        TYPE: 'ArcRotate',
        INITIAL_ALPHA: -Math.PI / 2,
        INITIAL_BETA: Math.PI / 3,
        INITIAL_RADIUS: 10,
        MIN_RADIUS: 3,
        MAX_RADIUS: 30,
        BETA_MIN: 0.3,
        BETA_MAX: Math.PI / 2.1
    },

    // ========== 灯光配置 ==========
    LIGHTS: {
        AMBIENT: {
            intensity: 0.5
        },
        DIRECTIONAL: {
            intensity: 0.8,
            distance: 100
        },
        GLOW_LAYER_INTENSITY: 0.8
    },

    // ========== 天气配置 ==========
    WEATHER: {
        TIME_SPEED: 5,
        RAIN_EMIT_RATE: 3000,
        RAIN_PARTICLE_COUNT: 5000,
        DAY_DURATION: 1440,
        RAIN_ALPHA_CHANGE: 0.3,
        LIGHT_MULTIPLIER: 0.4,
        AMBIENT_MULTIPLIER: 0.6
    },

    // ========== UI 配置 ==========
    UI: {
        MESSAGE_DURATION: 2000,
        PANEL_WIDTH: {
            skill: 600,
            inventory: 450
        },
        COLORS: {
            primary: '#00ff88',
            secondary: '#ffd700',
            info: '#4dc3ff',
            danger: '#ff4d4d'
        }
    },

    // ========== 键位配置 ==========
    KEYS: {
        FORWARD: 'w',
        BACKWARD: 's',
        RIGHT: 'd',
        LEFT: 'a',
        GAIN_EXP: 'f',
        PICKUP: 'e',
        SKILL_TREE: 'k',
        INVENTORY: 'i',
        SKILLS: ['1', '2', '3', '4', '5', '6']
    },

    // ========== 难度配置 ==========
    DIFFICULTY: {
        DAMAGE_MULTIPLIER: 1.0,
        EXP_MULTIPLIER: 1.0,
        ENEMY_SPAWN_RATE: 1.0
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
