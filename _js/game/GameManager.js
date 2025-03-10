import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { Animal } from './Animal.js';

export class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.players = new Map();
        this.animals = {
            'tiger': {
                model: './_models/tiger/scene.gltf',
                speed: 10,
                abilities: ['roar', 'sprint']
            }
        };
    }

    update() {
        // Update all players
        this.players.forEach(animal => animal.update());
    }

    spawnAnimal(playerId, animalType) {
        const animalConfig = this.animals[animalType];
        const animal = new Animal(this.scene.getScene(), animalConfig);
        this.players.set(playerId, animal);
    }
} 