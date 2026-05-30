// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 8;

const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: 5,
    dy: 5,
    speed: 5
};

// Game state
let gameRunning = false;
let keys = {};

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Event listener for mouse movement
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    player.y = mouseY - paddleHeight / 2;
});

// Button event listeners
document.getElementById('startBtn').addEventListener('click', () => {
    gameRunning = !gameRunning;
    document.getElementById('startBtn').textContent = gameRunning ? 'Pause Game' : 'Resume Game';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    player.score = 0;
    computer.score = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBall();
});

// Update player paddle position with arrow keys
function updatePlayerPaddle() {
    const speed = 6;
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - paddleHeight) {
        player.y += speed;
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const speed = 4;
    const computerCenter = computer.y + paddleHeight / 2;
    
    // Simple AI: follow the ball
    if (computerCenter < ball.y - 35) {
        computer.y += speed;
    } else if (computerCenter > ball.y + 35) {
        computer.y -= speed;
    }
    
    // Keep computer paddle within bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y > canvas.height - paddleHeight) {
        computer.y = canvas.height - paddleHeight;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Paddle collision detection
    checkPaddleCollision(player);
    checkPaddleCollision(computer);
    
    // Score detection
    if (ball.x - ball.radius < 0) {
        computer.score++;
        document.getElementById('computerScore').textContent = computer.score;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        document.getElementById('playerScore').textContent = player.score;
        resetBall();
    }
}

// Check collision between ball and paddle
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    ) {
        // Calculate collision point on paddle
        const collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint = collidePoint / (paddle.height / 2);
        
        const angleRad = (collidePoint * Math.PI) / 4;
        const direction = ball.x < canvas.width / 2 ? 1 : -1;
        
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        
        // Move ball outside paddle to prevent multiple collisions
        ball.x = paddle.x + (direction > 0 ? paddle.width + ball.radius : -ball.radius);
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 6;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
