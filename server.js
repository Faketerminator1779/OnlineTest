const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let walls = [
    { x: 1, y: 1, image: "wall", passable: false, state: "idle" },
    { x: 2, y: 2, image: "wall", passable: false, state: "idle" },
    { x: 3, y: 3, image: "wall", passable: false, state: "idle" },
    { x: 4, y: 4, image: "wall", passable: false, state: "idle" },
    { x: 5, y: 5, image: "wall", passable: false, state: "idle" },
    { x: 6, y: 6, image: "wall", passable: false, state: "idle"},
    { x: 7, y: 7, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 9, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 10, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 11, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 12, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 13, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 14, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 15, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 16, y: 8, image: "wall", passable: false, state: "idle" },
    { x: 17, y: 8, image: "wall", passable: false, state: "idle" },

    { x: 8, y: 10, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 11, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 12, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 13, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 14, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 15, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 16, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 17, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 18, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 19, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 20, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 21, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 22, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 23, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 24, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 25, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 26, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 27, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 28, image: "wall", passable: false, state: "idle" },
    { x: 8, y: 29, image: "wall", passable: false, state: "idle" },

    { x: 51, y: 51, image: "wall", passable: false, state: "idle" },
];

for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 50; j++) {
        walls.push({x: i+50, y: j+50, image: "wall", passable: true, state: "idle"})
    }
}


const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;

let map = Array.from({ length: MAP_WIDTH }, () => Array(MAP_HEIGHT).fill(null));

walls.forEach(wall => {
    const { x, y, image, passable, state } = wall;
    map[x][y] = { image, passable, state };
});



let players = {};

function checkCollision(x, y) {
    return map[x][y] && map[x][y].passable === false;
}

function isInsideMap(x, y) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;
}

function updateMap() {
    Object.keys(players).forEach(playerId => {
        const playerSocket = io.sockets.sockets.get(playerId);
        if (playerSocket) {
            const player = players[playerId];

            let customMap = Array.from({ length: 21 }, () => Array(25).fill(null));

            for (let offsetY = -12; offsetY <= 12; offsetY++) {
                for (let offsetX = -10; offsetX <= 10; offsetX++) {
                    let mapX = player.x + offsetX;
                    let mapY = player.y + offsetY;

                    if (isInsideMap(mapX, mapY)) {
                        if (map[mapX][mapY]) {
                            customMap[offsetX + 10][offsetY + 12] = {image: map[mapX][mapY].image, state: map[mapX][mapY].state};
                        }
                    }
                    
                    Object.values(players).forEach(p => {
                        if (p.x == mapX && p.y == mapY) {
                            customMap[offsetX + 10][offsetY + 12] = {image: "player", state: p.state};
                        }
                    });
                }
            }
            playerSocket.emit('map',customMap);
        }
    });
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    const MOVE_DELAY_X = 50;
    const MOVE_DELAY_Y = 50;

    socket.on('request-create-player', () => {
        players[socket.id] = { 
            x: 50, 
            y: 50, 
            state: "idle", 
            lastMoveX: 0,
            lastMoveY: 0
        };
        updateMap();
    });

    socket.on('request-map', () => {
        updateMap()
    });

    socket.on('move-player', (directions) => {
        const player = players[socket.id];
        if (!player) return;
    
        if (!player.activeKeys) {
            player.activeKeys = new Set();
        }
    
        player.activeKeys = new Set(directions);
        const now = Date.now();
        let moved = false;
    
        directions.forEach(direction => {
            let newX = player.x;
            let newY = player.y;
    
            if ((direction === 'ArrowLeft' || direction === 'ArrowRight') && now - player.lastMoveX < MOVE_DELAY_X) return;
            if ((direction === 'ArrowUp' || direction === 'ArrowDown') && now - player.lastMoveY < MOVE_DELAY_Y) return;
    
            switch (direction) {
                case 'ArrowUp':
                    newY = player.y - 1;
                    player.lastMoveY = now;
                    break;
                case 'ArrowDown':
                    newY = player.y + 1;
                    player.lastMoveY = now;
                    break;
                case 'ArrowLeft':
                    newX = player.x - 1;
                    player.lastMoveX = now;
                    break;
                case 'ArrowRight':
                    newX = player.x + 1;
                    player.lastMoveX = now;
                    break;
            }
    
            if (isInsideMap(newX, newY) && !checkCollision(newX, newY)) {
                player.x = newX;
                player.y = newY;
                moved = true;
            }
        });
    
        if (moved) {
            player.state = "walk";
            player.lastMoveTime = now;
        }
    
        updateMap();
    });
    
    socket.on('stop-player', () => {
        const player = players[socket.id];
        if (!player) return;
    
        if (player.state !== "idle") {
            player.state = "idle";
            updateMap();
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id];
        updateMap()
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

setInterval(() => {
    const now = Date.now();
    Object.values(players).forEach(player => {
        if (player.activeKeys && player.activeKeys.size === 0) {
            if (now - player.lastMoveTime > 200) {
                if (player.state !== "idle") {
                    player.state = "idle";
                    updateMap();
                }
            }
        }
    });
}, 100);
