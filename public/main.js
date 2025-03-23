// main.js
import { StartScreen } from './StartScreen.js';
import { GameScreen } from './GameScreen.js';

const canvas = document.getElementById('gameCanvas');
const socket = io();

const BASE_WIDTH = 640;
const BASE_HEIGHT = 360;

function resizeCanvas() {
    const scaleX = (window.innerWidth * 0.9) / BASE_WIDTH;
    const scaleY = (window.innerHeight * 0.99) / BASE_HEIGHT;
    
    //const scale = 1
    const scale = Math.floor(scaleY);

    canvas.width = BASE_WIDTH * scale;
    canvas.height = BASE_HEIGHT * scale;

    window.gameScale = { scale: scale };
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let currentScene;
let timeElapsed = 0;
let lastTime = 0;

function switchToScene(newScene) {
    if (currentScene) {
        currentScene.detachEventListeners();
    }

    currentScene = newScene;
    currentScene.attachEventListeners();
    requestAnimationFrame(drawLoop);
}


function drawLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    timeElapsed += deltaTime * 0.05;
    currentScene.draw(timeElapsed);
    
    requestAnimationFrame(drawLoop);
}

const startScreen = new StartScreen(canvas, () => {
    const gameScreen = new GameScreen(canvas, socket);
    switchToScene(gameScreen);
});

switchToScene(startScreen);
