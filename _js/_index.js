import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";


class Game {
    constructor() {
        // Add clock for proper animation timing
        this.clock = new THREE.Clock();
        // Only keep animation properties we need
        this.currentAnimation = null;
        this.previousAnimation = null;  // Add this to track the previous animation
        this.walkAnimation = null;
        this.animationActions = {};
        this.isRunning = false;  
        this.isWalking = false;
        this.isTiger = false;
        this.isTigerWalking = true;  // Initialize walking state
        this.isTigerRunning = false; // Initialize running state
        this.isHare = false;
        this.isHareRunning = false;
        this.isHareWalking = false
        this.keyState = {
            q: false,
            w: false,
        };  // Initialize key state tracking
        
        
        this.container = document.getElementById('container3D');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.createGround();
       //this.loadTiger();
       this.loadHare();
        
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        window.addEventListener('resize', this.onWindowResize);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Hide address bar on mobile
        window.addEventListener('load', () => {
            // Set a timeout for iOS
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);

            // Lock to landscape orientation
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape')
                    .catch((error) => console.log('Orientation lock failed:', error));
            }
        });
        
        // Handle fullscreen changes
        document.addEventListener('click', () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        });
        
        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
        this.container.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 20, 30);
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        // Ambient light (softer)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Reduced intensity
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 200, 100); // Higher and further away
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;  // Higher resolution shadows
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        
        // Set up shadow camera to cover your scene
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        
        this.scene.add(directionalLight);
        
        // Optional: Add helper to visualize light direction and shadow camera
        // const helper = new THREE.DirectionalLightHelper(directionalLight, 10);
        // this.scene.add(helper);
        // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        // this.scene.add(shadowHelper);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false;
        this.controls.keyRotateSpeed = 10; 
        
        // Prevent looking below the ground and too close to the ground
                // Prevent looking below the ground
       
        this.controls.minPolarAngle = Math.PI / 6; // 30 degrees above horizontal
        this.controls.maxPolarAngle = Math.PI / 2.2; // π/2 radians = straight down
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

   // Enhanced createGround method for the Game class
createGround() {
    // Create an enclosed field with larger dimensions
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7d44,
        roughness: 1,
        metalness: 0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add walls to create the enclosed field
    const wallHeight = 40;
    const wallLength = 800;
    const wallDepth = 3;
    
    const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallDepth);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969,
        roughness: 1,
        metalness: 0
    });

    // Create four walls
    const walls = [
        { position: [0, wallHeight/2, wallLength/2], rotation: [0, 0, 0] },
        { position: [0, wallHeight/2, -wallLength/2], rotation: [0, 0, 0] },
        { position: [wallLength/2, wallHeight/2, 0], rotation: [0, Math.PI/2, 0] },
        { position: [-wallLength/2, wallHeight/2, 0], rotation: [0, Math.PI/2, 0] }
    ];

    walls.forEach(wallConfig => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(...wallConfig.position);
        wall.rotation.set(...wallConfig.rotation);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
    });

    // Add rocks around the walls
    const rockGeometry = new THREE.DodecahedronGeometry(2);
    const rockMaterial = wallMaterial.clone();
    
    for (let i = 0; i < 30; i++) {
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = wallLength/2 - 5 + Math.random() * 10;
        
        rock.position.set(
            Math.cos(angle) * radius,
            Math.random() * 2,
            Math.sin(angle) * radius
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.scale.set(
            0.7 + Math.random(),
            0.5 + Math.random(),
            0.5 + Math.random()
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
    }

    // Add a water feature (lake) in the center
    /*const waterGeometry = new THREE.CircleGeometry(100, 64);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x0077be,
        roughness: 0.1,
        metalness: 0.6,
        transparent: true,
        opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.5; // Slightly above ground to prevent z-fighting
    water.receiveShadow = true;
    this.scene.add(water);*/

    // Add some trees
    this.addTrees(50);

    // Add fog to the scene for atmosphere
    this.scene.fog = new THREE.FogExp2(0xc8e6c9, 0.0018);
}

// New method to add trees to the scene
addTrees(count) {
    // Create a simple tree using cylinders and cones
    for (let i = 0; i < count; i++) {
        // Random position within the enclosure but away from the water
        const angle = Math.random() * Math.PI * 2;
        const minRadius = 120; // Keep away from the central lake
        const maxRadius = 350; // Keep away from walls
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Ground level (assuming y=0 is ground, modify if your ground is different)
        const groundY = 0;
        
        // Calculate trunk height and position values
        const trunkHeight = 10;
        const trunkY = groundY + (trunkHeight / 2); // Position trunk so its bottom is at ground level
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkY, z); // Position the trunk center, cylinder extends down to ground
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        // Foliage heights based on trunk
        const foliageBottomY = groundY + trunkHeight + 2; // 2 units above the trunk
        const foliageMiddleY = foliageBottomY + 4;        // 4 units above the bottom foliage
        const foliageTopY = foliageMiddleY + 3.5;         // 3.5 units above the middle foliage
        
        // Foliage (cones stacked)
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E8B57,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const foliageBottom = new THREE.Mesh(
            new THREE.ConeGeometry(5, 8, 8),
            foliageMaterial
        );
        foliageBottom.position.set(x, foliageBottomY, z);
        foliageBottom.castShadow = true;
        
        const foliageMiddle = new THREE.Mesh(
            new THREE.ConeGeometry(4, 7, 8),
            foliageMaterial
        );
        foliageMiddle.position.set(x, foliageMiddleY, z);
        foliageMiddle.castShadow = true;
        
        const foliageTop = new THREE.Mesh(
            new THREE.ConeGeometry(3, 6, 8),
            foliageMaterial
        );
        foliageTop.position.set(x, foliageTopY, z);
        foliageTop.castShadow = true;
        
        // Group all parts together
        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        treeGroup.add(foliageBottom);
        treeGroup.add(foliageMiddle);
        treeGroup.add(foliageTop);
        
        // Add slight random rotation to make trees look more natural
        const rotationY = Math.random() * 0.2;
        treeGroup.rotation.y = rotationY;
        treeGroup.rotation.x = Math.random() * 0.05;
        treeGroup.rotation.z = Math.random() * 0.05;
        
        // Add a slight random scale variation
        const scale = 0.8 + Math.random() * 0.4;
        treeGroup.scale.set(scale, scale, scale);
        
        this.scene.add(treeGroup);
    }
}



loadTiger() {
    const loader = new GLTFLoader();
    
    loader.load('_models/tiger/scene.gltf', (gltf) => {
        this.tigre = gltf.scene;
        this.tigre.position.set(0, 0, 20);
        this.tigre.scale.set(5, 5, 5);
        this.tigre.rotation.y = -Math.PI / 2; 

        this.tigre.traverse((object) => {
            if (object.isMesh) {
                //console.log('Mesh Name:', object.name);
                //console.log('Material:', object.material);
                //console.log('Position:', object.position); 
                
                // Check for double-sided materials
                if (object.material.transparent && object.material.depthWrite === false) {
                    //console.log('*** Found potential reflection mesh ***');
                    object.material.side = 2;  // Only render back side
                    object.material.depthWrite = true;
                    object.material.blending = THREE.NormalBlending;
                    object.material.color = new THREE.Color(1, 1, 1);
                }
                
                //console.log('-------------------');
            }

                            // Better shadow reception
                            object.castShadow = true;
                            object.receiveShadow = true;
        });

        this.tigre.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeVertexNormals();
            }
        });
        
        this.scene.add(this.tigre);
        
        // Setup animations and show their names
        if (gltf.animations && gltf.animations.length) {
            this.mixer = new THREE.AnimationMixer(this.tigre);
            
            // Get all animation names
            const animationNames = gltf.animations.map(animation => animation.name).join(', ');
            //window.alert('Available animations: ' + animationNames);
            
            
            // Store all available animations
            gltf.animations.forEach((animation) => {
                this.animationActions[animation.name] = this.mixer.clipAction(animation);
            });

            
        }

        this.playAnimation('Walk');
        this.isTiger = true;
        this.isTigerWalking = true;
        this.currentAnimation = this.animationActions['Walk'];
        
    }, 
    undefined,
    (error) => {
        //console.error('An error happened when loading the tiger model:', error);
    });
}



loadHare() {
    const loader = new GLTFLoader();
    
    loader.load('_models/hare/scene.gltf', (gltf) => {
        this.hare = gltf.scene;
        this.hare.position.set(0, 0, 20);
        this.hare.scale.set(2.6, 2.6, 2.6);
        this.hare.rotation.y = Math.PI / 1; 

        this.hare.traverse((object) => {
            if (object.isMesh) {
                // Enable casting and receiving shadows for all meshes
                object.castShadow = true;
                object.receiveShadow = true;
                
                // Improve material quality for better shadows
                if (object.material) {
                    // Ensure materials have proper settings for shadows
                    object.material.needsUpdate = true;
                    object.material.shadowSide = THREE.FrontSide;
                    
                    // Improve material quality if needed
                    if (object.material.map) {
                        object.material.map.anisotropy = 16;
                    }
                }
            }
        });
        this.hare.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeVertexNormals();
            }
        });
        this.scene.add(this.hare);
        
        // Setup animations and show their names
        if (gltf.animations && gltf.animations.length) {
            this.mixer = new THREE.AnimationMixer(this.hare);
            
            // Get all animation names
            const animationNames = gltf.animations.map(animation => animation.name).join(', ');
            //window.alert('Available animations: ' + animationNames);
           // console.log('Animations: ', animationNames);
            
            
            // Store all available animations
            gltf.animations.forEach((animation) => {
                this.animationActions[animation.name] = this.mixer.clipAction(animation);
            });

            
        }

        this.playAnimation('Armature|walk');
        this.isHare = true;
        this.isHareRunning = false;
        this.isHareWalking = true;
        this.currentAnimation = this.animationActions['Armature|walk'];
        
        
    }, 
    undefined,
    (error) => {
        //console.error('An error happened when loading the tiger model:', error);
    });
}










   

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        // Update key state
        this.keyState[key] = true;
            
        if (this.keyState['w']) {
            if (this.isTiger && !this.isTigerRunning) {
                const runAnimation = this.animationActions['Run'];
                
                if (this.currentAnimation && runAnimation) {
                    this.previousAnimation = this.currentAnimation;
                    // Stop the current animation properly
                    this.currentAnimation.fadeOut(0.5);
                    // Start the run animation
                    runAnimation.reset();
                    runAnimation.fadeIn(0.5);
                    runAnimation.play();
                    this.currentAnimation = runAnimation;
                    this.isTigerRunning = true;
                    this.isTigerWalking = false;
                }
            }
            
            if (this.isHare && !this.isHareRunning) {
                const runAnimation = this.animationActions['Armature|run '];
                
                if (this.currentAnimation && runAnimation) {
                    this.previousAnimation = this.currentAnimation;
                    
                    this.currentAnimation.crossFadeTo(runAnimation, 0.5, true);
                    runAnimation.reset();
                    runAnimation.setEffectiveWeight(1);
                    runAnimation.enabled = true;
                    runAnimation.paused = false;
                    runAnimation.play();
                        this.currentAnimation = runAnimation;
                        this.isHareWalking = false;
                        this.isHareRunning = true;
                }
            }
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        
        this.keyState[key] = false;
        
        if (key === 'w') {
            if (this.isTiger && this.isTigerRunning) {
                const runAnimation = this.currentAnimation;
                
                if (runAnimation && this.previousAnimation) {
                    runAnimation.fadeOut(0.5);
                    // Fade in the walk animation
                    this.previousAnimation.reset();
                    this.previousAnimation.fadeIn(0.5);
                    this.previousAnimation.play();
                    this.currentAnimation = this.previousAnimation;
                    this.isTigerWalking = true;
                    this.isTigerRunning = false;
                }
            }
            
            if (this.isHare && this.isHareRunning) {
                const runAnimation = this.currentAnimation;
                
                if (runAnimation && this.previousAnimation) {
                    //runAnimation.crossFadeTo(this.previousAnimation, 0.5, true);
                    this.previousAnimation.reset();
                    this.previousAnimation.setEffectiveWeight(1);
                    this.previousAnimation.enabled = true;
                    this.previousAnimation.paused = false;
                    this.previousAnimation.play();
                    this.currentAnimation = this.previousAnimation;
            this.isHareRunning = false;
            this.isHareWalking = true;
                } else {
                    console.log('- ISSUE: Missing animation reference for hare transition');
                }
          }
        }
    }





    stopAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation = null;
        }
    }

 

    playAnimation(name) {
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }
        
        if (this.animationActions[name]) {
            this.currentAnimation = this.animationActions[name];
            const thisAnimation = this.animationActions[name];
            this.currentAnimation.play();
        }
    }


    animate() {
        requestAnimationFrame(this.animate);
        
        // Update animations with proper delta time
        if (this.mixer) {
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}




// Initialize the game
const game = new Game();
//console.log('Wondering what a developer could be doing here');

