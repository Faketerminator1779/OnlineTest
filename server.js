const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let players = [];
let choices = {};

// Obsługa żądań HTTP (serwowanie plików statycznych)
app.use(express.static('public'));

// Obsługa połączeń WebSocket
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    players.push(socket.id);

    // Jeśli dwóch graczy jest połączonych
    if (players.length === 2) {
        io.emit('start-game', { message: 'Gra się rozpoczęła!' });
    }

    // Gracz wysyła wybór
    socket.on('player-choice', (choice) => {
        choices[socket.id] = choice;

        // Jeśli obaj gracze dokonali wyboru
        if (Object.keys(choices).length === 2) {
            const [player1, player2] = players;
            const result = determineWinner(choices[player1], choices[player2]);

            // Prześlij wyniki do graczy
            io.emit('game-result', { result, choices });
            choices = {}; // Zresetuj wybory na kolejną rundę
        }
    });

    // Gracz rozłącza się
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        players = players.filter((id) => id !== socket.id);
        io.emit('player-left', { message: 'Jeden z graczy opuścił grę.' });
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
