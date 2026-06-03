/**
 * 技能系统管理
 * 处理技能特效、伤害计算、冷却时间等
 */

class SkillSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeSkills = new Map();
        this.skillCooldowns = new Map();
        this.skillAnimations = [];
    }

    // ========== 施放技能 ==========
    castSkill(skillId, playerMesh, camera, onComplete = null) {
        if (!gameState.player.skills[skillId]) {
            console.warn(`Skill not unlocked: ${skillId}`);
            return false;
        }

        if (!CONFIG.SKILLS[skillId]) {
            console.error(`Skill config not found: ${skillId}`);
            return false;
        }

        try {
            gameState.recordSkillCast(skillId);
            
            switch (skillId) {
                case 'combat1':
                    this.castCombat1(playerMesh, camera, onComplete);
                    break;
                case 'combat2':
                    this.castCombat2(playerMesh, camera, onComplete);
                    break;
                case 'magic1':
                    this.castMagic1(playerMesh, camera, onComplete);
                    break;
                case 'magic2':
                    this.castMagic2(playerMesh, camera, onComplete);
                    break;
                case 'survival1':
                    this.castSurvival1(playerMesh, onComplete);
                    break;
                case 'survival2':
                    this.castSurvival2(playerMesh, onComplete);
                    break;
                default:
                    console.error(`Unknown skill: ${skillId}`);
                    return false;
            }

            return true;
        } catch (e) {
            console.error(`Error casting skill ${skillId}:`, e);
            return false;
        }
    }

    // ========== 技能1：重击 ==========
    castCombat1(playerMesh, camera, onComplete) {
        const config = CONFIG.SKILL_EFFECTS.combat1;
        const wave = BABYLON.MeshBuilder.CreateTorus("wave", {
            diameter: 2,
            thickness: 0.2,
            tessellation: 16
        }, this.scene);

        wave.position = playerMesh.position.clone();
        wave.position.y = 1;
        wave.rotation.x = Math.PI / 2;
        wave.rotation.y = playerMesh.rotation.y;

        const waveMat = new BABYLON.StandardMaterial("waveMat" + Date.now(), this.scene);
        waveMat.emissiveColor = new BABYLON.Color3(config.color.r, config.color.g, config.color.b);
        waveMat.disableLighting = true;
        waveMat.alpha = 1;
        wave.material = waveMat;

        let scale = 1;
        const animationId = setInterval(() => {
            scale += config.scale;
            wave.scaling = new BABYLON.Vector3(scale, scale, scale);
            waveMat.alpha -= 0.1;

            if (waveMat.alpha <= 0) {
                clearInterval(animationId);
                wave.dispose();
                if (onComplete) onComplete();
            }
        }, 16);

        this.skillAnimations.push(animationId);
    }

    // ========== 技能2：旋风斩 ==========
    castCombat2(playerMesh, camera, onComplete) {
        const config = CONFIG.SKILL_EFFECTS.combat2;
        let completedBlades = 0;

        for (let i = 0; i < config.bladeCount; i++) {
            const blade = BABYLON.MeshBuilder.CreateBox("blade" + Date.now() + i, {
                width: 3,
                height: 0.5,
                depth: 0.2
            }, this.scene);

            blade.position = playerMesh.position.clone();
            blade.position.y = 1.5;

            const bMat = new BABYLON.StandardMaterial("bMat" + Date.now() + i, this.scene);
            bMat.emissiveColor = new BABYLON.Color3(config.color.r, config.color.g, config.color.b);
            bMat.alpha = 0.7;
            blade.material = bMat;

            const angle = (Math.PI * 2 / config.bladeCount) * i;
            const anim = new BABYLON.Animation(
                "rot" + i,
                "rotation.y",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            anim.setKeys([
                { frame: 0, value: angle },
                { frame: 30, value: angle + Math.PI * 2 }
            ]);

            blade.animations.push(anim);
            this.scene.beginAnimation(blade, 0, 30, false, 1, () => {
                blade.dispose();
                completedBlades++;
                if (completedBlades === config.bladeCount && onComplete) {
                    onComplete();
                }
            });
        }
    }

    // ========== 技能3：火球术 ==========
    castMagic1(playerMesh, camera, onComplete) {
        const config = CONFIG.SKILL_EFFECTS.magic1;
        const fireball = BABYLON.MeshBuilder.CreateSphere("fireball" + Date.now(), {
            diameter: 1
        }, this.scene);

        const fMat = new BABYLON.StandardMaterial("fMat" + Date.now(), this.scene);
        fMat.emissiveColor = new BABYLON.Color3(config.color.r, config.color.g, config.color.b);
        fireball.material = fMat;

        const forward = camera.getForwardRay().direction;
        fireball.position = playerMesh.position.clone();
        fireball.position.y = 1;

        let t = 0;
        const animationId = setInterval(() => {
            fireball.position.addInPlace(forward.scale(config.speed));
            t++;

            if (t > config.duration) {
                clearInterval(animationId);
                fireball.dispose();
                if (onComplete) onComplete();
            }
        }, 16);

        this.skillAnimations.push(animationId);
    }

    // ========== 技能4：陨石 ==========
    castMagic2(playerMesh, camera, onComplete) {
        const config = CONFIG.SKILL_EFFECTS.magic2;
        const rock = BABYLON.MeshBuilder.CreateSphere("meteor" + Date.now(), {
            diameter: 3
        }, this.scene);

        const rMat = new BABYLON.StandardMaterial("rMat" + Date.now(), this.scene);
        rMat.emissiveColor = new BABYLON.Color3(config.color.r, config.color.g, config.color.b);
        rock.material = rMat;

        const targetPos = playerMesh.position.clone();
        targetPos.addInPlace(camera.getForwardRay().direction.scale(10));
        targetPos.y = 1;

        rock.position = targetPos.clone();
        rock.position.y = 30;

        let t = 0;
        const animationId = setInterval(() => {
            rock.position.y -= config.fallSpeed;
            t++;

            if (rock.position.y <= 1) {
                clearInterval(animationId);
                rock.dispose();
                if (onComplete) onComplete();
            }
        }, 16);

        this.skillAnimations.push(animationId);
    }

    // ========== 技能5：强韧 ==========
    castSurvival1(playerMesh, onComplete) {
        const config = CONFIG.SKILL_EFFECTS.survival1;
        const healing = config.healing || 0;

        if (healing > 0) {
            gameState.heal(healing);
            uiSystem.showMessage(`治疗: +${healing} HP`);
        }

        const shield = BABYLON.MeshBuilder.CreateSphere("shield" + Date.now(), {
            diameter: 3
        }, this.scene);

        const sMat = new BABYLON.StandardMaterial("sMat" + Date.now(), this.scene);
        sMat.emissiveColor = new BABYLON.Color3(config.color.r, config.color.g, config.color.b);
        sMat.alpha = 0.4;
        sMat.wireframe = true;
        shield.material = sMat;

        shield.position = playerMesh.position.clone();
        shield.position.y = 1;

        let t = 0;
        const animationId = setInterval(() => {
            shield.position = playerMesh.position.clone();
            shield.position.y = 1;
            sMat.alpha -= 0.02;
            t++;

            if (t > config.duration) {
                clearInterval(animationId);
                shield.dispose();
                if (onComplete) onComplete();
            }
        }, 16);

        this.skillAnimations.push(animationId);
    }

    // ========== 技能6：汲取 ==========
    castSurvival2(playerMesh, onComplete) {
        const config = CONFIG.SKILL_EFFECTS.survival2;
        const healing = config.healing || 0;

        if (healing > 0) {
            gameState.heal(healing);
            uiSystem.showMessage(`汲取: +${healing} HP`);
        }

        const ps = new BABYLON.ParticleSystem("particles" + Date.now(), 200, this.scene);
        const rainTexture = new BABYLON.DynamicTexture("rainTexture" + Date.now(), 64, this.scene);
        const rctx = rainTexture.getContext();
        rctx.fillStyle = "rgba(0,0,0,0)";
        rctx.fillRect(0, 0, 64, 64);
        rctx.fillStyle = "#ffffff";
        rctx.fillRect(30, 0, 4, 64);
        rainTexture.update();

        ps.particleTexture = rainTexture;
        ps.emitter = playerMesh;
        ps.minEmitBox = new BABYLON.Vector3(-3, 1, -3);
        ps.maxEmitBox = new BABYLON.Vector3(3, 3, 3);
        ps.direction1 = new BABYLON.Vector3(-1, -1, -1);
        ps.direction2 = new BABYLON.Vector3(1, -1, 1);
        ps.minLifeTime = 0.5;
        ps.maxLifeTime = 1;
        ps.emitRate = 500;
        ps.color1 = new BABYLON.Color4(config.color.r, config.color.g, config.color.b, 1);
        ps.color2 = new BABYLON.Color4(config.color.r, config.color.g, config.color.b, 1);
        ps.colorDead = new BABYLON.Color4(config.color.r, config.color.g, config.color.b, 0);
        ps.minSize = 0.1;
        ps.maxSize = 0.2;
        ps.gravity = new BABYLON.Vector3(0, -5, 0);
        ps.start();

        setTimeout(() => {
            ps.stop();
            setTimeout(() => {
                ps.dispose();
                rainTexture.dispose();
                if (onComplete) onComplete();
            }, 1000);
        }, 1000);
    }

    // ========== 清理技能 ==========
    clearAllSkills() {
        this.skillAnimations.forEach(animationId => {
            try {
                clearInterval(animationId);
            } catch (e) {
                console.warn('Error clearing skill animation:', e);
            }
        });
        this.skillAnimations = [];
    }

    // ========== 资源清理 ==========
    dispose() {
        this.clearAllSkills();
        this.activeSkills.clear();
        this.skillCooldowns.clear();
    }
}

// 创建全局技能系统实例（稍后初始化）
let skillSystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkillSystem };
}
