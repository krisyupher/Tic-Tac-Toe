// Game state
let board = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
let currentPlayer = "X";
let winner = "";
let score = { X: 0, O: 0 };
let gameActive = true;

// DOM elements
const cells = document.querySelectorAll('.cell');
const canvas = document.getElementById('line-winner');
const ctx = canvas.getContext('2d');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const btnRestart = document.getElementById('btn-restart');
const championOverlay = document.getElementById('champion-overlay');
const championText = document.getElementById('champion-text');
const btnReturn = document.getElementById('btn-return');

// Initialize game
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    btnRestart.addEventListener('click', restartRound);
    btnReturn.addEventListener('click', resetGame);
    drawGrid();
}

// Handle cell click
function handleCellClick(e) {
    if (!gameActive || winner) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (board[row][col] !== "-") return;

    // Update board
    board[row][col] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(`player-${currentPlayer.toLowerCase()}`);

    // Check for winner
    checkWinner();

    // Switch player
    if (!winner) {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
}

// Check for winner
function checkWinner() {
    const winPatterns = [
        // Rows
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // Columns
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // Diagonals
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a[0]][a[1]] !== "-" &&
            board[a[0]][a[1]] === board[b[0]][b[1]] &&
            board[a[0]][a[1]] === board[c[0]][c[1]]) {
            winner = board[a[0]][a[1]];
            gameActive = false;
            drawWinnerLine(pattern);
            updateScore();
            return;
        }
    }
}

// Draw winner line
function drawWinnerLine(pattern) {
    const cellSize = canvas.width / 3;
    const [[r1, c1], [r2, c2]] = [pattern[0], pattern[2]];

    const x1 = c1 * cellSize + cellSize / 2;
    const y1 = r1 * cellSize + cellSize / 2;
    const x2 = c2 * cellSize + cellSize / 2;
    const y2 = r2 * cellSize + cellSize / 2;

    let progress = 0;
    const animate = () => {
        if (progress >= 1) return;

        progress += 0.02;
        const currentX = x1 + (x2 - x1) * progress;
        const currentY = y1 + (y2 - y1) * progress;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = winner === 'X' ? '#ec4899' : '#06b6d4';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 20;
        ctx.shadowColor = winner === 'X' ? 'rgba(236, 72, 153, 0.8)' : 'rgba(6, 182, 212, 0.8)';
        ctx.stroke();

        requestAnimationFrame(animate);
    };

    animate();
}

// Update score
function updateScore() {
    score[winner]++;

    const scoreContainer = winner === 'X' ? scoreX : scoreO;
    const mark = document.createElement('div');
    mark.className = `score-mark player-${winner.toLowerCase()}`;
    mark.textContent = winner;
    scoreContainer.appendChild(mark);

    // Check for champion
    if (score[winner] === 3) {
        setTimeout(() => {
            championText.textContent = `Champions ${winner}`;
            championOverlay.classList.add('show');
        }, 1000);
    }
}

// Restart round
function restartRound() {
    board = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
    currentPlayer = "X";
    winner = "";
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('player-x', 'player-o');
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

// Reset entire game
function resetGame() {
    score = { X: 0, O: 0 };
    scoreX.innerHTML = '';
    scoreO.innerHTML = '';
    championOverlay.classList.remove('show');
    restartRound();
}

// Draw grid lines
function drawGrid() {
    const cellSize = canvas.width / 3;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(cellSize, 0);
    ctx.lineTo(cellSize, canvas.height);
    ctx.moveTo(cellSize * 2, 0);
    ctx.lineTo(cellSize * 2, canvas.height);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, cellSize);
    ctx.lineTo(canvas.width, cellSize);
    ctx.moveTo(0, cellSize * 2);
    ctx.lineTo(canvas.width, cellSize * 2);
    ctx.stroke();
}

// Start game
init();
