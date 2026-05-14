// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballSize,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle
function updatePlayer() {
    // Mouse control
    if (mouseY > 0 && mouseY < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
    
    // Arrow key control
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - paddleHeight) {
        player.y += player.speed;
    }
    
    // Boundary check
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - paddleHeight) {
        player.y = canvas.height - paddleHeight;
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }
    
    // Boundary check
    if (computer.y < 0) computer.y = 0;
    if (computer.y > canvas.height - paddleHeight) {
        computer.y = canvas.height - paddleHeight;
    }
}

// Update ball
function updateBall() {
    if (!gameRunning) return;
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const deltaY = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += deltaY * 3;
        
        // Increase speed slightly
        const currentSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        if (currentSpeed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }
    
    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const deltaY = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += deltaY * 3;
        
        // Increase speed slightly
        const currentSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        if (currentSpeed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }
    
    // Left side (player scores)
    if (ball.x + ball.radius < 0) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
    
    // Right side (computer scores)
    if (ball.x - ball.radius > canvas.width) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() * 4 - 2);
    gameRunning = false;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameStatus() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Press SPACE to start', canvas.width / 2, 30);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawCenterLine();
    
    // Update
    updatePlayer();
    updateComputer();
    updateBall();
    
    // Draw
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    drawGameStatus();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
