const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Tworzymy aplikację Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Ścieżka do plików statycznych (HTML, CSS, JS)
app.use(express.static('public'));

// Wbudowane dane o ścianach
let walls = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
    { x: 5, y: 5 },
    { x: 6, y: 6 },
    { x: 7, y: 7 },
    { x: 8, y: 8 },
    { x: 9, y: 9 }
];

const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;

// Inicjalizacja danych graczy
let players = {};  // Przechowujemy dane graczy (pozycje kwadratów)

// Funkcja do sprawdzania, czy gracz nie wchodzi w ścianę
function checkCollision(player) {
    return walls.some(wall => wall.x === player.x && wall.y === player.y);
}

function isInsideMap(x, y) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;
}

// Obsługa połączeń przez Socket.IO
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Tworzymy domyślny kwadrat dla nowego gracza
    players[socket.id] = { x: 0, y: 0 };

    // Wysyłanie danych o ścianach i kwadratach do nowego klienta
    socket.emit('mapa', walls);
    socket.emit('square-position', players);

    // Odbieranie ruchów od klienta
    socket.on('move-square', (directions) => {
        const player = players[socket.id];
        if (!player) return; // Jeśli gracz nie istnieje, nic nie rób
    
        // Iterujemy po każdym kierunku i aktualizujemy pozycję gracza
        directions.forEach(direction => {
            let newX = player.x;
            let newY = player.y;
    
            // Oblicz nową pozycję gracza w zależności od kierunku
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
    
            // Sprawdzamy, czy pozycja po ruchu koliduje ze ścianą
            if (isInsideMap(newX, newY) && !checkCollision({ x: newX, y: newY })) {
                player.x = newX;  // Zaktualizuj pozycję, jeśli nie ma kolizji i gracz nie wychodzi poza mapę
                player.y = newY;
            }
        });
    
        // Wysyłanie zaktualizowanej pozycji kwadratów do wszystkich klientów
        io.emit('square-position', players);
    });

    // Obsługa rozłączenia klienta
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id]; // Usuwamy gracza z listy po rozłączeniu
        io.emit('square-position', players); // Informujemy pozostałych graczy o zmianach
    });
});

// Uruchomienie serwera
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});