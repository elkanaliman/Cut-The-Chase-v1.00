import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

class Game {
    constructor() {
        this.container = document.getElementById('container3D');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.createGround();
        this.loadTiger();
        
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);
        
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
        this.container.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 20, 30);
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Prevent looking below the ground and too close to the ground
                // Prevent looking below the ground
       
        this.controls.minPolarAngle = Math.PI / 6; // 30 degrees above horizontal
        this.controls.maxPolarAngle = Math.PI / 2.2; // π/2 radians = straight down
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
    this.addTrees(30);

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
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 10, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
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
        foliageBottom.position.set(x, 12, z);
        foliageBottom.castShadow = true;
        
        const foliageMiddle = new THREE.Mesh(
            new THREE.ConeGeometry(4, 7, 8),
            foliageMaterial
        );
        foliageMiddle.position.set(x, 16, z);
        foliageMiddle.castShadow = true;
        
        const foliageTop = new THREE.Mesh(
            new THREE.ConeGeometry(3, 6, 8),
            foliageMaterial
        );
        foliageTop.position.set(x, 20, z);
        foliageTop.castShadow = true;
        
        // Add slight random rotation to make trees look more natural
        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        treeGroup.add(foliageBottom);
        treeGroup.add(foliageMiddle);
        treeGroup.add(foliageTop);
        
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
    
    // Load tiger model
    loader.load('_models/tiger/scene.gltf', (gltf) => {
        this.tigre = gltf.scene;
    
        // Position the tiger somewhere in your scene
        this.tigre.position.set(0, 0, 20);
        
        // You might need to scale the model depending on its original size
        this.tigre.scale.set(5, 5, 5);
        this.tigre.rotation.set(0, 30, 0);

        this.tigre.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeVertexNormals(); // Recalculate normals
            }
        });
        
        // Add the tiger to your scene
        this.scene.add(this.tigre);
        
        // If the model has animations, you can set them up here
        if (gltf.animations && gltf.animations.length) {
            this.mixer = new THREE.AnimationMixer(this.tigre);
            this.animations = gltf.animations;
            // Play the first animation
            this.mixer.clipAction(this.animations[3]).play();
        }
        
    }, 
    // Progress callback
    (xhr) => {
    },
    // Error callback
    (error) => {
        console.error('An error happened when loading the tiger model:', error);
    });
    
}








    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        if (this.mixer) {
            this.mixer.update(0.016); // Update with approximate time delta (16ms)
        }
    }






}




// Initialize the game
const game = new Game();
