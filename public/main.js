// main.js
import { StartScreen } from './StartScreen.js';
import { GameScreen } from './GameScreen.js';

const canvas = document.getElementById('gameCanvas');
const socket = io();

let currentScene;

function switchToScene(newScene) {
    if (currentScene) {
        currentScene.detachEventListeners();  // Usuń nasłuchiwacze z poprzedniej sceny
    }

    console.log(`Switching to scene: ${newScene.constructor.name}`);
    currentScene = newScene;
    currentScene.attachEventListeners();  // Przypisz nasłuchiwacze do nowej sceny
    drawLoop();
}

function drawLoop() {
    currentScene.draw();
    requestAnimationFrame(drawLoop);
}

// Inicjalizacja ekranu startowego
const startScreen = new StartScreen(canvas, () => {
    const gameScreen = new GameScreen(canvas, socket);
    switchToScene(gameScreen);
});

switchToScene(startScreen);
