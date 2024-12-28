class Wall {
    constructor(x, y, color = 'blue') {
        this.x = x;  // Współrzędna x ściany
        this.y = y;  // Współrzędna y ściany
        this.color = color;  // Kolor ściany
    }
}

export class GameScreen {
    constructor(canvas, socket) {
        this.canvas = canvas;
        this.socket = socket;
        this.ctx = this.canvas.getContext('2d');
        this.walls = [];  // Zmienna przechowująca ściany
        this.players = {};  // Zmienna przechowująca kwadraty graczy

        // Ustawienie nasłuchiwaczy do odbioru danych
        this.setupSocketListeners();
        
        // Zmienna przechowująca aktualnie naciśnięte klawisze
        this.activeKeys = new Set();  // Set trzyma unikalne klawisze

        this.startGame();
    }

    // Funkcja do rysowania ścian
    drawWalls() {
        this.walls.forEach(wall => {
            this.ctx.fillStyle = 'blue';  // Kolor ściany
            this.ctx.fillRect(wall.x * 50, wall.y * 50, 50, 50);  // Rysowanie prostokąta w odpowiedniej pozycji
        });
    }

    // Funkcja rysująca kwadraty graczy
    drawPlayers() {

        // Rysowanie kwadratów wszystkich graczy
        for (let playerId in this.players) {
            let square = this.players[playerId];
            this.ctx.fillStyle = playerId === this.socket.id ? '#FF0000' : '#00FF00'; // Czerwony dla własnego kwadratu, zielony dla innych
            this.ctx.fillRect(square.x * 50, square.y * 50, 50, 50); // Rysowanie kwadratu
        }
    }

    drawMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);  // Czyść canvas przed każdym rysowaniem
        this.drawWalls();  // Rysowanie ścian
        this.drawPlayers();
    }
    // Nasłuchiwanie na dane o ścianach i kwadratach z serwera
    setupSocketListeners() {
        // Nasłuchiwanie na mapę (ściany) od serwera
        this.socket.on('mapa', (serverWalls) => {
            // Zaktualizowanie ścian na podstawie danych z serwera
            this.walls = serverWalls.map(wallData => new Wall(wallData.x, wallData.y));  // Rekonstrukcja obiektów Wall z danych
            this.drawMap();  // Rysowanie początkowych obiektów
            console.log("Ściany załadowane:", this.walls);
        });

        // Nasłuchiwanie na pozycje kwadratów graczy
        this.socket.on('square-position', (players) => {
            this.players = players;
            this.drawMap();  // Rysowanie wszystkich kwadratów
        });
    }

    // Funkcja nasłuchująca zdarzenie naciśnięcia klawisza
    handleKeyDown(event) {
        console.log("EEEEEEEEE")
        this.activeKeys.add(event.key);  // Dodajemy klawisz do zestawu naciśniętych klawiszy
    }

    // Funkcja nasłuchująca zdarzenie puszczenia klawisza
    handleKeyUp(event) {
        this.activeKeys.delete(event.key);  // Usuwamy klawisz z zestawu po jego puszczeniu
    }

    // Funkcja do wysyłania naciśniętych klawiszy do serwera co 100ms
    sendKeysToServer() {
        if (this.activeKeys.size > 0) {
            // Jeśli mamy jakieś aktywne klawisze, wysyłamy je do serwera
            this.socket.emit('move-square', Array.from(this.activeKeys));
        }
    }

    // Uruchomienie interwału, który co 100ms będzie wysyłał aktywne klawisze do serwera
    startSendingKeys() {
        setInterval(() => this.sendKeysToServer(), 100);
    }

    // Metoda rysująca wszystkie elementy na ekranie
    draw() {
        this.drawMap();  // Rysowanie graczy i ścian
    }

    // Do obsługi zdarzeń
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

    // Funkcja wysyłająca zapytanie o pozycje graczy do serwera
    requestPositions() {
        this.socket.emit('request-positions');
    }

    // Metoda uruchamiająca grę i wysyłająca żądanie mapy i pozycji
    startGame() {
        this.requestMap();
        this.requestPositions();
        this.startSendingKeys();
    }
}
