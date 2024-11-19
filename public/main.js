// Klasa Wall - Definicja w tym samym pliku
class Wall {
    constructor(x, y) {
        this.x = x;  // Pozycja X
        this.y = y;  // Pozycja Y
    }

    // Funkcja do rysowania ściany na canvasie
    draw(ctx) {
        ctx.fillStyle = 'blue';  // Kolor ściany
        ctx.fillRect(this.x * 50, this.y * 50, 50, 50);  // Rysowanie prostokąta w odpowiedniej pozycji
    }
}

// Inicjalizacja canvasu i jego kontekstu
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keysPressed = new Map();
// Tablica ścian
let walls = [];
let squares = {}; // Przechowujemy pozycje wszystkich graczy

// Funkcja do rysowania ścian
function drawWalls() {
    walls.forEach(wall => {
        wall.draw(ctx);  // Rysowanie każdej ściany
    });
}

// Funkcja rysująca kwadraty graczy
function drawSquares() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Czyść canvas przed każdym rysowaniem
    drawWalls();  // Rysowanie ścian

    // Rysowanie kwadratów wszystkich graczy
    for (let playerId in squares) {
        let square = squares[playerId];
        ctx.fillStyle = playerId === socket.id ? '#FF0000' : '#00FF00'; // Czerwony dla własnego kwadratu, zielony dla innych
        ctx.fillRect(square.x * 50, square.y * 50, 50, 50); // Rysowanie kwadratu
    }
}

// Połączenie z serwerem
const socket = io();

// Nasłuchiwanie na dane o ścianach i kwadratach
socket.on('mapa', (serverWalls) => {
    walls = serverWalls.map(wallData => new Wall(wallData.x, wallData.y));  // Rekonstrukcja obiektów Wall z danych
    drawSquares();  // Rysowanie początkowych obiektów
});

socket.on('square-position', (players) => {
    squares = players;
    drawSquares();  // Rysowanie wszystkich kwadratów
});

// Funkcja do kontrolowania ruchu kwadratu
function movePlayer(event) {
    switch (event.key) {
        case 'ArrowUp':
            socket.emit('move-square', 'up');
            break;
        case 'ArrowDown':
            socket.emit('move-square', 'down');
            break;
        case 'ArrowLeft':
            socket.emit('move-square', 'left');
            break;
        case 'ArrowRight':
            socket.emit('move-square', 'right');
            break;
    }
}
function handleKeyDown(event) {
    if (!keysPressed.has(event.key)) {
        movePlayer(event.key);
        const intervalId = setInterval(() => movePlayer(event), 100);
        keysPressed.set(event.key, intervalId);
    }
}

function handleKeyUp(event) {
    if (keysPressed.has(event.key)) {
        clearInterval(keysPressed.get(event.key));
        keysPressed.delete(event.key);
    }
}
// Nasłuchiwanie na naciśnięcie klawiszy (strzałki)
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
drawSquares();  // Rysowanie wszystkich kwadratów