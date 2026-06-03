/**
 * 场景管理器
 * 处理3D场景创建、物理碰撞、物品系统等
 */

class SceneManager {
    constructor(canvas, engine) {
        this.canvas = canvas;
        this.engine = engine;
        this.scene = null;
        this.player = null;
        this.camera = null;
        this.lights = {};
        this.materials = {};
        this.gameTime = 720;
        this.timeSpeed = CONFIG.WEATHER.TIME_SPEED;
        this.isRaining = false;
        this.rain = null;
    }

    // ========== 创建场景 ==========
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.5, 0.7, 1.0, 1.0);
        this.scene.collisionsEnabled = true;

        this.setupLighting();
        this.createGround();
        this.createTrees();
        this.createPlayer();
        this.setupCamera();
        this.setupWeather();
        this.spawnInitialItems();

        return this.scene;
    }

    // ========== 灯光设置 ==========
    setupLighting() {
        const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
        glowLayer.intensity = CONFIG.LIGHTS.GLOW_LAYER_INTENSITY;

        this.lights.ambient = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        this.lights.ambient.intensity = CONFIG.LIGHTS.AMBIENT.intensity;

        this.lights.directional = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        this.lights.directional.position = new BABYLON.Vector3(
            CONFIG.LIGHTS.DIRECTIONAL.distance,
            CONFIG.LIGHTS.DIRECTIONAL.distance,
            CONFIG.LIGHTS.DIRECTIONAL.distance
        );
        this.lights.directional.intensity = CONFIG.LIGHTS.DIRECTIONAL.intensity;
    }

    // ========== 创建地面 ==========
    createGround() {
        try {
            const ground = BABYLON.MeshBuilder.CreateGround("ground", {
                width: CONFIG.SCENE.GROUND_SIZE,
                height: CONFIG.SCENE.GROUND_SIZE
            }, this.scene);

            const grassTexture = new BABYLON.DynamicTexture(
                "grassTexture",
                CONFIG.SCENE.GRASS_TEXTURE_SIZE,
                this.scene
            );
            const ctx = grassTexture.getContext();
            ctx.fillStyle = "#2d5a1e";
            ctx.fillRect(0, 0, CONFIG.SCENE.GRASS_TEXTURE_SIZE, CONFIG.SCENE.GRASS_TEXTURE_SIZE);

            for (let i = 0; i < 10000; i++) {
                ctx.fillStyle = Math.random() > 0.5 ? "#3a7a2a" : "#1f4a12";
                ctx.fillRect(
                    Math.random() * CONFIG.SCENE.GRASS_TEXTURE_SIZE,
                    Math.random() * CONFIG.SCENE.GRASS_TEXTURE_SIZE,
                    2,
                    6
                );
            }
            grassTexture.update();

            const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
            groundMat.diffuseTexture = grassTexture;
            groundMat.diffuseTexture.uScale = 50;
            groundMat.diffuseTexture.vScale = 50;

            ground.material = groundMat;
            ground.checkCollisions = true;
        } catch (e) {
            console.error('Error creating ground:', e);
        }
    }

    // ========== 创建树木 ==========
    createTrees() {
        try {
            const trunkMat = new BABYLON.StandardMaterial("trunkMat", this.scene);
            trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);

            const leavesMat = new BABYLON.StandardMaterial("leavesMat", this.scene);
            leavesMat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);

            for (let i = 0; i < CONFIG.SCENE.TREE_COUNT; i++) {
                const x = (Math.random() - 0.5) * (CONFIG.SCENE.GROUND_SIZE * 0.8);
                const z = (Math.random() - 0.5) * (CONFIG.SCENE.GROUND_SIZE * 0.8);

                const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk" + i, {
                    height: 4,
                    diameter: 1
                }, this.scene);
                trunk.position = new BABYLON.Vector3(x, 2, z);
                trunk.material = trunkMat;
                trunk.checkCollisions = true;

                const leaves = BABYLON.MeshBuilder.CreateCylinder("leaves" + i, {
                    height: 6,
                    diameterTop: 0,
                    diameterBottom: 4,
                    tessellation: 8
                }, this.scene);
                leaves.position = new BABYLON.Vector3(x, 7, z);
                leaves.material = leavesMat;
            }
        } catch (e) {
            console.error('Error creating trees:', e);
        }
    }

    // ========== 创建玩家 ==========
    createPlayer() {
        try {
            this.player = BABYLON.MeshBuilder.CreateBox("player", {
                width: CONFIG.PLAYER.SIZE.width,
                height: CONFIG.PLAYER.SIZE.height,
                depth: CONFIG.PLAYER.SIZE.depth
            }, this.scene);

            this.player.position.y = 1;
            this.player.checkCollisions = true;

            const playerMat = new BABYLON.StandardMaterial("playerMat", this.scene);
            playerMat.diffuseColor = new BABYLON.Color3(
                CONFIG.PLAYER.COLOR.r,
                CONFIG.PLAYER.COLOR.g,
                CONFIG.PLAYER.COLOR.b
            );
            this.player.material = playerMat;
        } catch (e) {
            console.error('Error creating player:', e);
        }
    }

    // ========== 设置摄像机 ==========
    setupCamera() {
        try {
            this.camera = new BABYLON.ArcRotateCamera(
                "camera",
                CONFIG.CAMERA.INITIAL_ALPHA,
                CONFIG.CAMERA.INITIAL_BETA,
                CONFIG.CAMERA.INITIAL_RADIUS,
                this.player.position,
                this.scene
            );

            this.camera.attachControl(this.canvas, true);
            this.camera.lowerBetaLimit = CONFIG.CAMERA.BETA_MIN;
            this.camera.upperBetaLimit = CONFIG.CAMERA.BETA_MAX;
            this.camera.lowerRadiusLimit = CONFIG.CAMERA.MIN_RADIUS;
            this.camera.upperRadiusLimit = CONFIG.CAMERA.MAX_RADIUS;
            this.camera.checkCollisions = true;
        } catch (e) {
            console.error('Error setting up camera:', e);
        }
    }

    // ========== 设置天气系统 ==========
    setupWeather() {
        try {
            const rainTexture = new BABYLON.DynamicTexture("rainTexture", 64, this.scene);
            const rctx = rainTexture.getContext();
            rctx.fillStyle = "rgba(0,0,0,0)";
            rctx.fillRect(0, 0, 64, 64);
            rctx.fillStyle = "#ffffff";
            rctx.fillRect(30, 0, 4, 64);
            rainTexture.update();

            this.rain = new BABYLON.ParticleSystem("rain", CONFIG.WEATHER.RAIN_PARTICLE_COUNT, this.scene);
            this.rain.particleTexture = rainTexture;
            this.rain.emitter = this.player;
            this.rain.minEmitBox = new BABYLON.Vector3(-40, 30, -40);
            this.rain.maxEmitBox = new BABYLON.Vector3(40, 30, 40);
            this.rain.direction1 = new BABYLON.Vector3(-1, -15, -1);
            this.rain.direction2 = new BABYLON.Vector3(1, -15, 1);
            this.rain.minLifeTime = 0.5;
            this.rain.maxLifeTime = 1.0;
            this.rain.emitRate = 0;
            this.rain.minSize = 0.1;
            this.rain.maxSize = 0.2;
            this.rain.start();
        } catch (e) {
            console.error('Error setting up weather:', e);
        }
    }

    // ========== 切换天气 ==========
    toggleWeather() {
        this.isRaining = !this.isRaining;
        if (this.rain) {
            this.rain.emitRate = this.isRaining ? CONFIG.WEATHER.RAIN_EMIT_RATE : 0;
        }
        uiSystem.updateWeatherButton(this.isRaining);
    }

    // ========== 生成初始物品 ==========
    spawnInitialItems() {
        try {
            this.createItemMaterials();
            for (let i = 0; i < CONFIG.SCENE.ITEM_SPAWN_COUNT; i++) {
                const itemTypes = Object.keys(CONFIG.ITEMS);
                const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                const pos = new BABYLON.Vector3(
                    (Math.random() - 0.5) * CONFIG.SCENE.ITEM_SPAWN_RADIUS,
                    0,
                    (Math.random() - 0.5) * CONFIG.SCENE.ITEM_SPAWN_RADIUS
                );
                this.spawnItem(randomType, pos);
            }
        } catch (e) {
            console.error('Error spawning initial items:', e);
        }
    }

    // ========== 创建物品材质 ==========
    createItemMaterials() {
        Object.entries(CONFIG.ITEMS).forEach(([itemId, config]) => {
            const mat = new BABYLON.StandardMaterial(`${itemId}Mat`, this.scene);
            mat.diffuseColor = new BABYLON.Color3(
                parseInt(config.color.substring(1, 3), 16) / 255,
                parseInt(config.color.substring(3, 5), 16) / 255,
                parseInt(config.color.substring(5, 7), 16) / 255
            );
            mat.emissiveColor = new BABYLON.Color3(
                config.emissive.r,
                config.emissive.g,
                config.emissive.b
            );
            this.materials[itemId] = mat;
        });
    }

    // ========== 生成物品 ==========
    spawnItem(type, pos) {
        try {
            if (!CONFIG.ITEMS[type] && !this.materials[type]) {
                console.error(`Invalid item type: ${type}`);
                return null;
            }

            const box = BABYLON.MeshBuilder.CreateBox(`${type}_${Date.now()}`, {
                size: CONFIG.SCENE.ITEM_SIZE
            }, this.scene);

            box.position = pos;
            box.position.y = 0.5;
            box.material = this.materials[type];
            box.rotation.y = Math.random() * Math.PI;

            gameState.addDroppedItem(box, type);
            return box;
        } catch (e) {
            console.error('Error spawning item:', e);
            return null;
        }
    }

    // ========== 更新场景循环 ==========
    updateScene(delta, playerMesh, keys, moveSpeed, onItemPickup, onSkillCast) {
        try {
            this.updateDayNightCycle(delta);
            this.updatePlayerMovement(playerMesh, keys, moveSpeed);
            this.updateItemPickup(playerMesh, onItemPickup);
        } catch (e) {
            console.error('Error in scene update:', e);
        }
    }

    // ========== 昼夜更新 ==========
    updateDayNightCycle(delta) {
        this.gameTime += delta * this.timeSpeed;
        if (this.gameTime >= CONFIG.WEATHER.DAY_DURATION) {
            this.gameTime -= CONFIG.WEATHER.DAY_DURATION;
        }

        const sunAngle = ((this.gameTime - 360) / CONFIG.WEATHER.DAY_DURATION) * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle);

        let skyR, skyG, skyB, lightInt, ambInt;

        if (sunHeight > 0.1) {
            skyR = 0.5;
            skyG = 0.7;
            skyB = 1.0;
            lightInt = Math.max(0.1, 0.8 * sunHeight);
            ambInt = 0.5;
        } else if (sunHeight > -0.1) {
            const t = (sunHeight + 0.1) / 0.2;
            skyR = 0.8 - t * 0.3;
            skyG = 0.4 + t * 0.3;
            skyB = 0.2 + t * 0.8;
            lightInt = 0.3;
            ambInt = 0.3;
        } else {
            skyR = 0.05;
            skyG = 0.05;
            skyB = 0.15;
            lightInt = 0.02;
            ambInt = 0.15;
        }

        if (this.isRaining) {
            const d = CONFIG.WEATHER.RAIN_ALPHA_CHANGE;
            skyR *= d;
            skyG *= d;
            skyB *= d;
            lightInt *= CONFIG.WEATHER.LIGHT_MULTIPLIER;
            ambInt *= CONFIG.WEATHER.AMBIENT_MULTIPLIER;
        }

        this.scene.clearColor = new BABYLON.Color4(skyR, skyG, skyB, 1);
        this.lights.directional.intensity = lightInt;
        this.lights.ambient.intensity = ambInt;

        uiSystem.updateTimeDisplay(this.gameTime);
    }

    // ========== 玩家移动 ==========
    updatePlayerMovement(playerMesh, keys, moveSpeed) {
        if (uiSystem.isPanelActive()) return;

        const forward = this.camera.getForwardRay().direction;
        const forwardVec = new BABYLON.Vector3(forward.x, 0, forward.z).normalize();
        const rightVec = BABYLON.Vector3.Cross(forwardVec, BABYLON.Axis.Y).normalize();

        let moveDir = BABYLON.Vector3.Zero();

        if (keys[CONFIG.KEYS.FORWARD]) moveDir.addInPlace(forwardVec);
        if (keys[CONFIG.KEYS.BACKWARD]) moveDir.subtractInPlace(forwardVec);
        if (keys[CONFIG.KEYS.RIGHT]) moveDir.addInPlace(rightVec);
        if (keys[CONFIG.KEYS.LEFT]) moveDir.subtractInPlace(rightVec);

        if (moveDir.length() > 0) {
            moveDir.normalize();
            playerMesh.position.addInPlace(moveDir.scale(moveSpeed * (this.engine.getDeltaTime() / 1000)));
            playerMesh.rotation.y = BABYLON.Scalar.LerpAngle(
                playerMesh.rotation.y,
                Math.atan2(moveDir.x, moveDir.z),
                0.2
            );
        }
    }

    // ========== 物品拾取检测 ==========
    updateItemPickup(playerMesh, onItemPickup) {
        gameState.nearestItem = null;

        gameState.droppedItems.forEach(item => {
            item.mesh.rotation.y += this.engine.getDeltaTime() / 1000;

            const distance = BABYLON.Vector3.Distance(playerMesh.position, item.mesh.position);
            if (distance < CONFIG.SCENE.ITEM_PICKUP_DISTANCE) {
                gameState.nearestItem = item;
            }
        });

        uiSystem.showInteractHint(gameState.nearestItem !== null);
    }

    // ========== 清理资源 ==========
    dispose() {
        try {
            if (this.rain) {
                this.rain.dispose();
            }
            if (this.scene) {
                this.scene.dispose();
            }
        } catch (e) {
            console.error('Error disposing scene manager:', e);
        }
    }
}

// 创建全局场景管理器实例（稍后初始化）
let sceneManager;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SceneManager };
}
