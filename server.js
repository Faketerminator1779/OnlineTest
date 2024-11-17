const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let rooms = {}; // Informacje o pokojach, ich graczach i ich wyborach

// Obsługa żądań HTTP (serwowanie plików statycznych)
app.use(express.static('public'));

// Obsługa połączeń WebSocket
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Dołączanie do pokoju
    socket.on('join-room', (roomName) => {
        socket.join(roomName); // Dołącz do pokoju
        if (!rooms[roomName]) {
            rooms[roomName] = { players: [], choices: {}, names: {} };
        }
        rooms[roomName].players.push(socket.id);
        console.log(`User ${socket.id} joined room: ${roomName}`);
    });

    // Ustawianie nazwy gracza
    socket.on('set-name', ({ playerName, roomName }) => {
        if (rooms[roomName]) {
            rooms[roomName].names[socket.id] = playerName;
            console.log(`Player ${socket.id} in room ${roomName} set name: ${playerName}`);

            // Sprawdź, czy można rozpocząć grę
            if (rooms[roomName].players.length === 2) {
                io.to(roomName).emit('start-game', { message: 'Gra się rozpoczęła!' });
            }
        }
    });

    // Otrzymywanie wyboru gracza
    socket.on('player-choice', ({ choice, roomName }) => {
        const room = rooms[roomName];
        if (room) {
            room.choices[socket.id] = choice;

            // Jeśli obaj gracze dokonali wyboru
            if (Object.keys(room.choices).length === 2) {
                const [player1, player2] = room.players;
                const result = determineWinner(room.choices[player1], room.choices[player2]);

                // Wyślij wyniki
                io.to(roomName).emit('game-result', {
                    result,
                    choices: [room.choices[player1], room.choices[player2]],
                    player1Name: room.names[player1],
                    player2Name: room.names[player2],
                });

                // Zresetuj wybory
                room.choices = {};
            }
        }
    });

    // Obsługa rozłączenia gracza
    socket.on('disconnect', () => {
        for (const roomName in rooms) {
            const room = rooms[roomName];
            room.players = room.players.filter((id) => id !== socket.id);
            if (room.players.length === 0) {
                delete rooms[roomName]; // Usuń pusty pokój
            } else {
                io.to(roomName).emit('player-left', { message: 'Jeden z graczy opuścił grę.' });
            }
        }
    });
});

// Logika gry
function determineWinner(choice1, choice2) {
    if (choice1 === choice2) return 'Remis!';
    if (
        (choice1 === 'kamień' && choice2 === 'nożyce') ||
        (choice1 === 'papier' && choice2 === 'kamień') ||
        (choice1 === 'nożyce' && choice2 === 'papier')
    ) {
        return 'Gracz 1 wygrywa!';
    }
    return 'Gracz 2 wygrywa!';
}

// Uruchom serwer
server.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
