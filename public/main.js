// main.js
import { StartScreen } from './StartScreen.js';
import { GameScreen } from './GameScreen.js';

const canvas = document.getElementById('gameCanvas');
const socket = io();

let currentScene;

function switchToScene(newScene) {
    if (currentScene) {
        currentScene.detachEventListeners();
    }

    currentScene = newScene;
    currentScene.attachEventListeners();
    drawLoop();
}

function drawLoop() {
    currentScene.draw();
    requestAnimationFrame(drawLoop);
}

const startScreen = new StartScreen(canvas, () => {
    const gameScreen = new GameScreen(canvas, socket);
    switchToScene(gameScreen);
});

switchToScene(startScreen);
