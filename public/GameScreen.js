import { spriteConfig } from './spriteConfig.js';

export class GameScreen {
    constructor(canvas, socket) {
        this.scale = window.gameScale.scale
        this.canvas = canvas;
        this.socket = socket;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.imagePaths = {
            player: './img/player.png',
            wall: './img/wall.png',
        };

        this.images = {};
        this.spriteConfig = spriteConfig;
        
        this.map = Array.from({ length: 21 }, () => Array(25).fill(null));

        this.players = {};

        this.setupSocketListeners();
        
        this.activeKeys = new Set();

        this.loadImages().then(() => {
            this.startGame();
        });
    }

    loadImages() {
        const promises = [];
        for (const key in this.imagePaths) {
            promises.push(new Promise((resolve, reject) => {
                const img = new Image();
                img.src = this.imagePaths[key];
                img.onload = () => {
                    this.images[key] = img;
                    resolve();
                };
                img.onerror = reject;
            }));
        }
        return Promise.all(promises);
    }

    drawMap(timeElapsed) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < 25; i++) {
            for (let j = 0; j < 21; j++) {
                if (this.map[j] && this.map[j][i] !== undefined) {
                    const cell = this.map[j][i];
                    if (cell && cell.image && this.images[cell.image]) {
                        const spriteData = this.spriteConfig[cell.image][cell.state];
                        if (spriteData) {
                            const frameWidth = 32;
                            const frameHeight = 32;

                            const maxFrame = spriteData.frames;
                            const currentFrame = Math.floor((timeElapsed / spriteData.speed) % maxFrame);

                            const sx = currentFrame * frameWidth;
                            const sy = spriteData.row * frameHeight;

                            this.ctx.drawImage(
                                this.images[cell.image],
                                sx, sy, frameWidth, frameHeight,
                                (((j - 10) * ((32 + Math.abs(j - 10) * (i * 0.1)) - 1)) - 16) * this.scale + this.canvas.width / 2, 
                                (((i - 12) * (16 + i * 0.25)) - 16) * this.scale + this.canvas.height / 2,
                                frameWidth * this.scale,
                                frameHeight * this.scale
                            );
                        }
                    }
                }
            }
        }
    }

    setupSocketListeners() {
        this.socket.on('map', (map) => {
            this.map = map
            this.drawMap();
        });
    }

    handleKeyDown(event) {
        this.activeKeys.add(event.key);
    }

    handleKeyUp(event) {
        this.activeKeys.delete(event.key);
    }

    sendKeysToServer() {
        if (this.activeKeys.size > 0) {
            this.socket.emit('move-player', Array.from(this.activeKeys));
        } else {
            this.socket.emit('stop-player');
        }
    }

    startSendingKeys() {
        setInterval(() => this.sendKeysToServer(), 100);
    }

    draw(timeElapsed) {
        this.drawMap(timeElapsed);
    }

    attachEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    detachEventListeners() {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }

    createPlayer() {
        this.socket.emit('request-create-player');
    }

    requestMap() {
        this.socket.emit('request-map');
    }

    startGame() {
        this.createPlayer();
        this.requestMap();
        this.startSendingKeys();
    }
}
