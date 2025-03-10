import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

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
        
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);
        
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
    }

    createGround() {
        // Create an enclosed field with larger dimensions
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a7d44,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add walls to create the enclosed field
        const wallHeight = 40;  // Increased height
        const wallLength = 800; // Increased length for larger enclosure
        const wallDepth = 3;    // Thicker walls
        
        const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallDepth);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x696969, // Darker gray for more natural rock look
            roughness: 1,    // Maximum roughness
            metalness: 0     // No metallic properties
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
    }
}

// Initialize the game
const game = new Game();
