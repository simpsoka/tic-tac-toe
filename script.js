const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let player;
let invaders = [];
let bullets = [];
let invaderBullets = [];
let gameOver = false;
let keys = {};
let invaderDirection = 1;
let invaderSpeed = 2;
let invaderDrop = 20;

// Player
class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        const bullet = new Bullet(this.x + this.width / 2 - 2.5, this.y, 5, 10, 'white');
        bullets.push(bullet);
    }
}

// Bullet
class Bullet {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 10;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

// Invader Bullet
class InvaderBullet {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

// Invader
class Invader {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    shoot() {
        const bullet = new InvaderBullet(this.x + this.width / 2 - 2.5, this.y + this.height, 5, 10, 'yellow');
        invaderBullets.push(bullet);
    }
}

// Initialize game
function init() {
    player = new Player(canvas.width / 2 - 25, canvas.height - 60, 50, 20, 'green');

    // Create invaders
    const invaderRows = 5;
    const invaderCols = 10;
    const invaderWidth = 40;
    const invaderHeight = 20;
    const invaderPadding = 10;
    const invaderOffsetTop = 30;
    const invaderOffsetLeft = 30;

    for (let c = 0; c < invaderCols; c++) {
        for (let r = 0; r < invaderRows; r++) {
            const invaderX = (c * (invaderWidth + invaderPadding)) + invaderOffsetLeft;
            const invaderY = (r * (invaderHeight + invaderPadding)) + invaderOffsetTop;
            invaders.push(new Invader(invaderX, invaderY, invaderWidth, invaderHeight, 'red'));
        }
    }
}

// Game loop
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    player.draw();
    player.move();

    // Bullets
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    // Invader Bullets
    invaderBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.y > canvas.height) {
            invaderBullets.splice(index, 1);
        }
    });

    // Invaders
    let edge = false;
    invaders.forEach(invader => {
        if ((invader.x + invader.width > canvas.width && invaderDirection > 0) || (invader.x < 0 && invaderDirection < 0)) {
            edge = true;
        }
    });

    if (edge) {
        invaderDirection *= -1;
        invaders.forEach(invader => {
            invader.move(0, invaderDrop);
        });
    }

    invaders.forEach(invader => {
        invader.move(invaderSpeed * invaderDirection, 0);
        invader.draw();

        // Randomly shoot
        if (Math.random() < 0.001) {
            invader.shoot();
        }
    });

    // Collision detection
    // Bullet and invader
    bullets.forEach((bullet, bIndex) => {
        invaders.forEach((invader, iIndex) => {
            if (
                bullet.x < invader.x + invader.width &&
                bullet.x + bullet.width > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + bullet.height > invader.y
            ) {
                bullets.splice(bIndex, 1);
                invaders.splice(iIndex, 1);
                score += 10;
            }
        });
    });

    // Invader and player
    invaders.forEach(invader => {
        if (
            player.x < invader.x + invader.width &&
            player.x + player.width > invader.x &&
            player.y < invader.y + invader.height &&
            player.y + player.height > invader.y
        ) {
            gameOver = true;
        }
    });

    // Invader bullet and player
    invaderBullets.forEach((bullet, index) => {
        if (
            player.x < bullet.x + bullet.width &&
            player.x + player.width > bullet.x &&
            player.y < bullet.y + bullet.height &&
            player.y + player.height > bullet.y
        ) {
            invaderBullets.splice(index, 1);
            gameOver = true;
        }
    });

    // Win condition
    if (invaders.length === 0) {
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif';
        ctx.fillText('You Win!', canvas.width / 2 - 100, canvas.height / 2);
        gameOver = true;
    }


    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText('Score: ' + score, 10, 20);

    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        player.shoot();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

init();
gameLoop();
