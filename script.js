const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Sprites
const pixelSize = 5;

const playerSprite = [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
];

const invaderSprite = [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 0]
];


// Player
const player = {
    x: canvas.width / 2 - (playerSprite[0].length * pixelSize) / 2,
    y: canvas.height - (playerSprite.length * pixelSize) - 20,
    width: playerSprite[0].length * pixelSize,
    height: playerSprite.length * pixelSize,
    color: '#00ff00', // Green
    speed: 5,
    dx: 0
};

// Invaders
const invaders = [];
const invaderInfo = {
    width: invaderSprite[0].length * pixelSize,
    height: invaderSprite.length * pixelSize,
    color: '#ff7f00', // Orange
    speed: 2,
    rows: 4,
    cols: 8,
    padding: 20,
    offsetTop: 50,
    offsetLeft: (canvas.width - (8 * (invaderSprite[0].length * pixelSize)) - (7 * 20)) / 2
};

// Bullets
const bullets = [];
const bulletInfo = {
    width: 5,
    height: 10,
    color: 'white',
    speed: 7
};

// Game state
let score = 0;
let gameIsOver = false;

// Create invaders
function createInvaders() {
    for (let c = 0; c < invaderInfo.cols; c++) {
        for (let r = 0; r < invaderInfo.rows; r++) {
            invaders.push({
                x: c * (invaderInfo.width + invaderInfo.padding) + invaderInfo.offsetLeft,
                y: r * (invaderInfo.height + invaderInfo.padding) + invaderInfo.offsetTop,
                width: invaderInfo.width,
                height: invaderInfo.height,
                color: invaderInfo.color,
                speed: invaderInfo.speed
            });
        }
    }
}

createInvaders();

// Draw a sprite
function drawSprite(sprite, x, y, color) {
    ctx.fillStyle = color;
    for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
            if (sprite[r][c] === 1) {
                ctx.fillRect(x + c * pixelSize, y + r * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}

// Draw player
function drawPlayer() {
    drawSprite(playerSprite, player.x, player.y, player.color);
}

// Draw invaders
function drawInvaders() {
    invaders.forEach(invader => {
        drawSprite(invaderSprite, invader.x, invader.y, invaderInfo.color);
    });
}

// Draw ground
function drawGround() {
    ctx.fillStyle = '#00aa00'; // Darker green
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
}

// Draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bulletInfo.color;
        ctx.fillRect(bullet.x, bullet.y, bulletInfo.width, bulletInfo.height);
    });
}

// Draw score
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 10, 25);
}

// Move player
function movePlayer() {
    player.x += player.dx;

    // Wall detection
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    if (player.x < 0) {
        player.x = 0;
    }
}

// Move invaders
function moveInvaders() {
    let edge = false;
    invaders.forEach(invader => {
        invader.x += invader.speed;
        if (invader.x + invader.width > canvas.width || invader.x < 0) {
            edge = true;
        }
    });

    if (edge) {
        invaders.forEach(invader => {
            invader.speed *= -1;
            invader.y += invader.height;
        });
    }
}

// Move bullets
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });
}

// Keydown event
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        shoot();
    }
}

// Keyup event
function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        player.dx = 0;
    }
}

// Shoot
function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - bulletInfo.width / 2,
        y: player.y,
        width: bulletInfo.width,
        height: bulletInfo.height,
        speed: bulletInfo.speed
    });
}

// Collision detection
function collisionDetection() {
    // Iterate backwards to safely remove items
    for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
        for (let iIndex = invaders.length - 1; iIndex >= 0; iIndex--) {
            const bullet = bullets[bIndex];
            const invader = invaders[iIndex];

            if (
                bullet && invader &&
                bullet.x < invader.x + invader.width &&
                bullet.x + bullet.width > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + bullet.height > invader.y
            ) {
                invaders.splice(iIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;

                // Since the bullet is gone, no need to check other invaders
                break;
            }
        }
    }

    // Check for win condition
    if (invaders.length === 0) {
        gameWon();
        return;
    }

    // Check for player collision with invaders
    invaders.forEach(invader => {
        if (
            player.x < invader.x + invader.width &&
            player.x + player.width > invader.x &&
            player.y < invader.y + invader.height &&
            player.y + player.height > invader.y
        ) {
            gameOver();
        }
    });
}

// Game over
function gameOver() {
    if (gameIsOver) return;
    gameIsOver = true;
    alert('Game Over');
    document.location.reload();
}

// Game won
function gameWon() {
    if (gameIsOver) return;
    gameIsOver = true;
    alert('You Win!');
    document.location.reload();
}

// Update game objects
function update() {
    if (gameIsOver) {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawScore();
    drawPlayer();
    drawInvaders();
    drawBullets();

    movePlayer();
    moveInvaders();
    moveBullets();

    collisionDetection();

    requestAnimationFrame(update);
}

// Start game
update();

// Event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
