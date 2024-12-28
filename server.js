const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let walls = [
    { x: 1, y: 1, color: "blue", passable: true },
    { x: 2, y: 2, color: "blue", passable: true  },
    { x: 3, y: 3, color: "blue", passable: true  },
    { x: 4, y: 4, color: "blue", passable: true  },
    { x: 5, y: 5, color: "blue", passable: true  },
    { x: 6, y: 6, color: "blue", passable: true  },
    { x: 7, y: 7, color: "blue", passable: true  },
    { x: 8, y: 8, color: "blue", passable: true  },
    { x: 9, y: 9, color: "blue", passable: true  }
];

const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;

let players = {};

function checkCollision(player) {
    return walls.some(wall => wall.x === player.x && wall.y === player.y);
}

function isInsideMap(x, y) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    players[socket.id] = { x: 0, y: 0 };

    socket.on('request-map', () => {
        socket.emit('mapa', walls);
    });

    socket.on('request-positions', () => {
        socket.emit('square-position', players);
    });

    socket.on('move-square', (directions) => {
        const player = players[socket.id];
        if (!player) return;
    
        directions.forEach(direction => {
            let newX = player.x;
            let newY = player.y;
    
            switch (direction) {
                case 'ArrowUp':
                    newY = player.y - 1;
                    break;
                case 'ArrowDown':
                    newY = player.y + 1;
                    break;
                case 'ArrowLeft':
                    newX = player.x - 1;
                    break;
                case 'ArrowRight':
                    newX = player.x + 1;
                    break;
            }
    
            if (isInsideMap(newX, newY) && !checkCollision({ x: newX, y: newY })) {
                player.x = newX; 
                player.y = newY;
            }
        });
    
        io.emit('square-position', players);

        io.emit('mapa', walls);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('square-position', players);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
