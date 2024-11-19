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

// Zmienna przechowująca aktualnie naciśnięte klawisze
const activeKeys = new Set();  // Set trzyma unikalne klawisze

// Funkcja do kontrolowania ruchu kwadratu
function movePlayer(direction) {
    socket.emit('move-square', direction);
}

// Funkcja nasłuchująca zdarzenie naciśnięcia klawisza
function handleKeyDown(event) {
    activeKeys.add(event.key);  // Dodajemy klawisz do zestawu naciśniętych klawiszy
}

// Funkcja nasłuchująca zdarzenie puszczenia klawisza
function handleKeyUp(event) {
    activeKeys.delete(event.key);  // Usuwamy klawisz z zestawu po jego puszczeniu
}

// Funkcja do wysyłania naciśniętych klawiszy do serwera co 100ms
function sendKeysToServer() {
    if (activeKeys.size > 0) {
        // Jeśli mamy jakieś aktywne klawisze, wysyłamy je do serwera
        socket.emit('move-square', Array.from(activeKeys));
    }
}

// Uruchomienie interwału, który co 100ms będzie wysyłał aktywne klawisze do serwera
setInterval(sendKeysToServer, 100);

// Nasłuchiwanie na naciśnięcie klawiszy (strzałki)
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Użycie requestAnimationFrame do płynniejszego rysowania
function gameLoop() {
    drawSquares();
    requestAnimationFrame(gameLoop);  // Kontynuowanie rysowania w każdej klatce
}

// Rozpocznij główną pętlę gry
gameLoop();
