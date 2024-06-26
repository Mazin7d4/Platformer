const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    jumpHeight: -15,
    gravity: 0.5,
    grounded: false,
    jumps: 0,
    maxJumps: 2
};

let platforms = [];
let gems = [];
let clouds = [];
let score = 0;
let platformSpeed = 2;
let gameRunning = true;



function generateStartingPlatform() {
    const platformWidth = 200;
    const platformHeight = 20;
    const platformX = canvas.width / 2 - platformWidth / 2;
    const platformY = canvas.height - 100;
    platforms.push({ x: platformX, y: platformY, width: platformWidth, height: platformHeight });
    generateGem(platformX, platformY - platformHeight);
}

function generatePlatform() {
    const platformWidth = Math.random() * 100 + 50;
    const platformHeight = 20;
    const platformX = Math.random() * (canvas.width - platformWidth);
    let platformY;

    if (platforms.length === 0) {
        platformY = canvas.height - 100;
    } else {
        platformY = platforms[platforms.length - 1].y - Math.random() * 200 - 100;
    }

    platforms.push({ x: platformX, y: platformY, width: platformWidth, height: platformHeight });
    generateGem(platformX, platformY - platformHeight);
}


function generateGem(x, y) {
    const gemSize = 15;
    gems.push({ x: x + gemSize / 2, y: y - gemSize, size: gemSize });
}

function generateCloud() {
    const cloudWidth = Math.random() * 100 + 50;
    const cloudHeight = 30;
    const cloudX = Math.random() * canvas.width;
    const cloudY = Math.random() * (canvas.height / 2);
    clouds.push({ x: cloudX, y: cloudY, width: cloudWidth, height: cloudHeight });
}

function drawPlayer() {
    ctx.fillStyle = '#6a0572';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    ctx.fillStyle = '#8dc3a7';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawGems() {
    ctx.fillStyle = '#ffd700';
    gems.forEach(gem => {
        ctx.fillRect(gem.x, gem.y, gem.size, gem.size);
    });
}

function drawClouds() {
    ctx.fillStyle = '#fff';
    clouds.forEach(cloud => {
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    if (!gameRunning) return;

    player.dy += player.gravity;
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    if (player.y > canvas.height) {
        gameOver();
        return;
    }

    platforms.forEach(platform => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            if (player.dy > 0 && player.y + player.height - player.dy <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;
                player.jumps = 0;
                score += 1;
            }
        }
    });

    gems.forEach((gem, index) => {
        if (
            player.x < gem.x + gem.size &&
            player.x + player.width > gem.x &&
            player.y < gem.y + gem.size &&
            player.y + player.height > gem.y
        ) {
            gems.splice(index, 1);
            score += 5;
        }
    });

    platforms = platforms.filter(platform => platform.y < canvas.height);
    platforms.forEach(platform => platform.y += platformSpeed);

    gems = gems.filter(gem => gem.y < canvas.height);
    gems.forEach(gem => gem.y += platformSpeed);

    clouds = clouds.filter(cloud => cloud.y < canvas.height);
    clouds.forEach(cloud => cloud.y += platformSpeed / 2);

    if (player.y < canvas.height / 2) {
        platforms.forEach(platform => platform.y += Math.abs(player.dy));
        gems.forEach(gem => gem.y += Math.abs(player.dy));
        clouds.forEach(cloud => cloud.y += Math.abs(player.dy) / 2);
        player.y += Math.abs(player.dy);
    }

    if (Math.random() < 0.02) generatePlatform();
    if (Math.random() < 0.005) generateCloud();
}

function update() {
    if (!gameRunning) return;

    clear();
    drawClouds();
    drawPlayer();
    drawPlatforms();
    drawGems();
    drawScore();
    newPos();
    requestAnimationFrame(update);
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function jump() {
    if (player.jumps < player.maxJumps) {
        player.dy = player.jumpHeight;
        player.grounded = false;
        player.jumps++;
    }
}

function stop() {
    player.dx = 0;
}

function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = 'block';
}

function restart() {
    gameRunning = true;
    score = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.dy = 0;
    player.dx = 0;
    player.grounded = false;
    player.jumps = 0;
    platforms = [];
    gems = [];
    clouds = [];
    generateStartingPlatform();
    generatePlatform();
    gameOverScreen.style.display = 'none';
    update();
}

document.getElementById('leftBtn').addEventListener('touchstart', moveLeft);
document.getElementById('leftBtn').addEventListener('touchend', stop);
document.getElementById('leftBtn').addEventListener('mousedown', moveLeft);
document.getElementById('leftBtn').addEventListener('mouseup', stop);

document.getElementById('rightBtn').addEventListener('touchstart', moveRight);
document.getElementById('rightBtn').addEventListener('touchend', stop);
document.getElementById('rightBtn').addEventListener('mousedown', moveRight);
document.getElementById('rightBtn').addEventListener('mouseup', stop);

document.getElementById('jumpBtn').addEventListener('touchstart', jump);
document.getElementById('jumpBtn').addEventListener('mousedown', jump);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    if (touchX < canvas.width / 2) {
        moveLeft();
    } else {
        moveRight();
    }
    if (touchY < canvas.height / 2) {
        jump();
    }
});

canvas.addEventListener('mousedown', (e) => {
    const clickX = e.clientX;
    const clickY = e.clientY;
    if (clickX < canvas.width / 2) {
        moveLeft();
    } else {
        moveRight();
    }
    if (clickY < canvas.height / 2) {
        jump();
    }
});

canvas.addEventListener('mouseup', stop);

restartBtn.addEventListener('click', restart);

generateStartingPlatform();
generatePlatform();
update();