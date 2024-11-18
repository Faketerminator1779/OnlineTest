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

// Inicjalizacja danych graczy i ich kwadratów
let players = {};  // Przechowujemy dane graczy (pozycje kwadratów, itp.)

// Obsługa połączeń przez Socket.IO
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Tworzymy domyślny kwadrat dla nowego gracza
    players[socket.id] = {
        x: 150,  // Początkowa pozycja X
        y: 150,  // Początkowa pozycja Y
        size: 50, // Wielkość kwadratu
        speed: 5   // Prędkość ruchu
    };

    // Wysyłanie aktualnej pozycji kwadratu do nowego klienta
    socket.emit('square-position', players);

    // Odbieranie ruchów strzałkami od klienta
    socket.on('move-square', (direction) => {
        let player = players[socket.id];
        switch (direction) {
            case 'up':
                player.y -= player.speed;
                break;
            case 'down':
                player.y += player.speed;
                break;
            case 'left':
                player.x -= player.speed;
                break;
            case 'right':
                player.x += player.speed;
                break;
        }

        // Zapewniamy, że kwadrat nie wyjdzie poza canvas
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.size > 500) player.x = 500 - player.size;
        if (player.y + player.size > 500) player.y = 500 - player.size;

        // Wysyłanie zaktualizowanej pozycji kwadratów do wszystkich klientów
        io.emit('square-position', players);
    });

    // Obsługa rozłączenia klienta
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id]; // Usuwamy gracza z listy po rozłączeniu
    });
});

// Uruchomienie serwera
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
