class Wall {
    constructor(x, y, color = 'blue') {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

export class GameScreen {
    constructor(canvas, socket) {
        this.canvas = canvas;
        this.socket = socket;
        this.ctx = this.canvas.getContext('2d');
        this.walls = [];
        this.players = {};

        this.setupSocketListeners();
        
        this.activeKeys = new Set();

        this.startGame();
    }

    drawWalls() {
        this.walls.forEach(wall => {
            this.ctx.fillStyle = 'blue';
            this.ctx.fillRect(wall.x * 50, wall.y * 50, 50, 50);
        });
    }

    drawPlayers() {

        for (let playerId in this.players) {
            let square = this.players[playerId];
            this.ctx.fillStyle = playerId === this.socket.id ? '#FF0000' : '#00FF00';
            this.ctx.fillRect(square.x * 50, square.y * 50, 50, 50);
        }
    }

    drawMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWalls();
        this.drawPlayers();
    }
    setupSocketListeners() {
        this.socket.on('mapa', (serverWalls) => {
            this.walls = serverWalls.map(wallData => new Wall(wallData.x, wallData.y));
            this.drawMap();
        });

        this.socket.on('square-position', (players) => {
            this.players = players;
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
            this.socket.emit('move-square', Array.from(this.activeKeys));
        }
    }

    startSendingKeys() {
        setInterval(() => this.sendKeysToServer(), 100);
    }

    draw() {
        this.drawMap();
    }

    attachEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    detachEventListeners() {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }

    requestMap() {
        this.socket.emit('request-map');
    }

    requestPositions() {
        this.socket.emit('request-positions');
    }

    startGame() {
        this.requestMap();
        this.requestPositions();
        this.startSendingKeys();
    }
}