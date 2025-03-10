import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { Lighting } from '../environment/Lighting.js';

export class Scene {
    constructor(containerId) {
        // Core ThreeJS setup
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Initialize components
        this.setupRenderer();
        this.setupCamera();
        this.setupControls();
        
        // Add lighting
        this.lighting = new Lighting(this.scene);
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
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

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // Getter for adding objects to scene
    getScene() {
        return this.scene;
    }
} 