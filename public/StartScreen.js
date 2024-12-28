// StartScreen.js
export class StartScreen {
    constructor(canvas, onStartCallback) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.onStartCallback = onStartCallback;
        this.startButton = { x: 150, y: 200, width: 200, height: 50, text: 'Start' };

        this.boundClickHandler = this.clickHandler.bind(this);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(this.startButton.x, this.startButton.y, this.startButton.width, this.startButton.height);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.startButton.text, this.startButton.x + this.startButton.width / 2, this.startButton.y + this.startButton.height / 2);
    }

    attachEventListeners() {
        this.canvas.addEventListener('click', this.boundClickHandler);
    }

    detachEventListeners() {
        this.canvas.removeEventListener('click', this.boundClickHandler);
    }

    clickHandler(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (mouseX >= this.startButton.x && mouseX <= this.startButton.x + this.startButton.width &&
            mouseY >= this.startButton.y && mouseY <= this.startButton.y + this.startButton.height) {
            this.onStartCallback();
        }
    }
}