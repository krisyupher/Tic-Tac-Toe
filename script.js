// 2D Voice Mode Game State
let board2D = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
let gameActive2D = true;
let aiLevel = 'medium';
let aiThinking = false;

// Voice state
let recognition = null;
let isListening = false;
let voiceSupported = false;

// DOM elements
const board2DEl = document.getElementById('board-2d');
const voiceStatus = document.getElementById('voice-status');
const btnVoice = document.getElementById('btn-voice');

const ROW_NAMES = ['top', 'middle', 'bottom'];
const COL_NAMES = ['left', 'center', 'right'];

// Initialize game
function init() {
    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            aiLevel = btn.dataset.level;
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    buildBoard2D();
    setupSpeechRecognition();
    btnVoice.addEventListener('click', toggleListening);
}

// Build the 9 cell elements once
function buildBoard2D() {
    board2DEl.innerHTML = '';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = document.createElement('button');
            cell.className = 'cell-2d';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.setAttribute('aria-label', `${ROW_NAMES[row]} ${COL_NAMES[col]}`);
            cell.addEventListener('click', () => playerMove2D(row, col));
            board2DEl.appendChild(cell);
        }
    }
}

function getCellEl(row, col) {
    return board2DEl.querySelector(`.cell-2d[data-row="${row}"][data-col="${col}"]`);
}

// The player (X) makes a move via click or voice
function playerMove2D(row, col) {
    if (!gameActive2D || aiThinking) return false;
    if (board2D[row][col] !== "-") {
        setVoiceStatus(`${ROW_NAMES[row]} ${COL_NAMES[col]} is taken — try another cell.`);
        return false;
    }

    placeMark2D(row, col, 'X');

    const result = checkResult2D();
    if (result) {
        endRound2D(result);
        return true;
    }

    // Hand over to the AI
    aiThinking = true;
    setVoiceStatus('Thinking…');
    setTimeout(aiMove2D, 650);
    return true;
}

// Render a mark on the board
function placeMark2D(row, col, player) {
    board2D[row][col] = player;
    const cell = getCellEl(row, col);
    cell.textContent = player === 'X' ? '✕' : '◯';
    cell.classList.add('filled', player === 'X' ? 'player-x' : 'player-o');
}

// AI move
function aiMove2D() {
    if (!gameActive2D) {
        aiThinking = false;
        return;
    }

    const move = chooseAIMove(board2D, aiLevel);
    if (!move) {
        aiThinking = false;
        return;
    }

    const [row, col] = move;
    placeMark2D(row, col, 'O');
    speak(`I'll take ${ROW_NAMES[row]} ${COL_NAMES[col]}.`);

    const result = checkResult2D();
    if (result) {
        endRound2D(result);
    } else {
        setVoiceStatus('Your turn — say a cell.');
    }
    aiThinking = false;
}

/* ---------- AI difficulty levels ---------- */

function emptyCells2D(b) {
    const cells = [];
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
            if (b[r][c] === "-") cells.push([r, c]);
    return cells;
}

function chooseAIMove(b, level) {
    if (level === 'easy') return randomMove(b);
    if (level === 'hard') return minimaxMove(b);
    return heuristicMove(b); // medium
}

function randomMove(b) {
    const cells = emptyCells2D(b);
    if (!cells.length) return null;
    return cells[Math.floor(Math.random() * cells.length)];
}

// Win if possible, block if needed, else center > corners > edges
function heuristicMove(b) {
    const cells = emptyCells2D(b);
    if (!cells.length) return null;

    // 1. Win
    for (const [r, c] of cells) {
        b[r][c] = 'O';
        if (winnerOf2D(b) === 'O') { b[r][c] = "-"; return [r, c]; }
        b[r][c] = "-";
    }
    // 2. Block
    for (const [r, c] of cells) {
        b[r][c] = 'X';
        if (winnerOf2D(b) === 'X') { b[r][c] = "-"; return [r, c]; }
        b[r][c] = "-";
    }
    // 3. Center
    if (b[1][1] === "-") return [1, 1];
    // 4. Corners
    const corners = [[0, 0], [0, 2], [2, 0], [2, 2]].filter(([r, c]) => b[r][c] === "-");
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Edges
    return cells[Math.floor(Math.random() * cells.length)];
}

// Optimal play via minimax (O maximizes)
function minimaxMove(b) {
    let bestScore = -Infinity;
    let bestMove = null;
    for (const [r, c] of emptyCells2D(b)) {
        b[r][c] = 'O';
        const sc = minimax(b, 0, false);
        b[r][c] = "-";
        if (sc > bestScore) {
            bestScore = sc;
            bestMove = [r, c];
        }
    }
    return bestMove;
}

function minimax(b, depth, isMaximizing) {
    const w = winnerOf2D(b);
    if (w === 'O') return 10 - depth;
    if (w === 'X') return depth - 10;
    const cells = emptyCells2D(b);
    if (!cells.length) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (const [r, c] of cells) {
            b[r][c] = 'O';
            best = Math.max(best, minimax(b, depth + 1, false));
            b[r][c] = "-";
        }
        return best;
    } else {
        let best = Infinity;
        for (const [r, c] of cells) {
            b[r][c] = 'X';
            best = Math.min(best, minimax(b, depth + 1, true));
            b[r][c] = "-";
        }
        return best;
    }
}

/* ---------- 2D winner detection ---------- */

const WIN_LINES_2D = [
    [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], // rows
    [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], // cols
    [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]                            // diagonals
];

// Returns "X" or "O" if there's a winner, else null
function winnerOf2D(b) {
    for (const line of WIN_LINES_2D) {
        const [a, c1, c2] = line;
        const v = b[a[0]][a[1]];
        if (v !== "-" && v === b[c1[0]][c1[1]] && v === b[c2[0]][c2[1]]) {
            return v;
        }
    }
    return null;
}

// Returns { winner, line } | { draw: true } | null
function checkResult2D() {
    for (const line of WIN_LINES_2D) {
        const [a, c1, c2] = line;
        const v = board2D[a[0]][a[1]];
        if (v !== "-" && v === board2D[c1[0]][c1[1]] && v === board2D[c2[0]][c2[1]]) {
            return { winner: v, line };
        }
    }
    if (emptyCells2D(board2D).length === 0) return { draw: true };
    return null;
}

/* ---------- Round end ---------- */

function endRound2D(result) {
    gameActive2D = false;

    if (result.draw) {
        setVoiceStatus("It's a draw!");
        speak(pick(["It's a draw!", "A tie! Nobody wins this one."]));
        setTimeout(resetBoard2D, 2000);
        return;
    }

    // Highlight winning line
    result.line.forEach(([r, c]) => getCellEl(r, c).classList.add('win'));

    const w = result.winner;
    if (w === 'X') {
        setVoiceStatus('You win this round! 🎉');
        speak(pick(["You're so good, you won!", "Nice one! That round is yours.", "Impressive! You win this round."]));
    } else {
        setVoiceStatus('The AI wins this round.');
        speak(pick(["Better luck next time!", "I win that round. Try again.", "Too easy for me!"]));
    }

    setTimeout(resetBoard2D, 2000);
}

// Clear the board for a new round
function resetBoard2D() {
    board2D = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
    gameActive2D = true;
    aiThinking = false;
    board2DEl.querySelectorAll('.cell-2d').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell-2d';
    });
    setVoiceStatus('Say a cell like "top center", "middle left", "bottom right".');
}

/* ---------- Voice recognition (Web Speech API) ---------- */

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceSupported = false;
        btnVoice.disabled = true;
        btnVoice.textContent = '🎤 Voice not supported';
        return;
    }

    voiceSupported = true;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (!result.isFinal) continue;
            let handled = false;
            for (let a = 0; a < result.length; a++) {
                if (handleTranscript(result[a].transcript)) { handled = true; break; }
            }
            if (!handled) {
                setVoiceStatus(`Heard "${result[0].transcript.trim()}" — say e.g. "top center".`);
            }
        }
    };

    recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setVoiceStatus('Microphone access denied. Enable it to play by voice.');
            stopListening();
        } else if (event.error === 'no-speech') {
            setVoiceStatus("Didn't catch that — try again.");
        }
    };

    recognition.onend = () => {
        if (isListening) {
            try { recognition.start(); } catch (e) { /* already starting */ }
        }
    };
}

function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    if (!voiceSupported || isListening) return;
    isListening = true;
    btnVoice.classList.add('listening');
    btnVoice.textContent = '🛑 Stop listening';
    setVoiceStatus('Listening… say a cell.');
    try { recognition.start(); } catch (e) { /* already started */ }
}

function stopListening() {
    if (!isListening) return;
    isListening = false;
    btnVoice.classList.remove('listening');
    btnVoice.textContent = '🎤 Speak your move';
    if (recognition) {
        try { recognition.stop(); } catch (e) { /* ignore */ }
    }
}

// Parse a spoken phrase into a move. Returns true if it produced an action.
function handleTranscript(transcript) {
    const text = transcript.toLowerCase().trim();
    const tokens = text.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);

    const cell = parseCell(tokens);
    if (!cell) return false;

    setVoiceStatus(`Heard: ${ROW_NAMES[cell.row]} ${COL_NAMES[cell.col]}`);
    return playerMove2D(cell.row, cell.col);
}

// Map spoken words to a { row, col }
const ROW_WORDS = { top: 0, up: 0, upper: 0, high: 0, first: 0, bottom: 2, down: 2, lower: 2, low: 2, last: 2 };
const COL_WORDS = { left: 0, right: 2 };
const CENTER_WORDS = new Set(['center', 'centre', 'central', 'middle', 'mid']);

function parseCell(tokens) {
    let row = null, col = null;
    let centers = 0;

    for (const t of tokens) {
        if (row === null && t in ROW_WORDS) row = ROW_WORDS[t];
        else if (col === null && t in COL_WORDS) col = COL_WORDS[t];
        else if (CENTER_WORDS.has(t)) centers++;
    }

    while (centers > 0 && (row === null || col === null)) {
        if (row === null) row = 1;
        else if (col === null) col = 1;
        centers--;
    }

    if (row === null || col === null) return null;
    return { row, col };
}

function setVoiceStatus(msg) {
    if (voiceStatus) voiceStatus.textContent = msg;
}

/* ---------- Speech synthesis ---------- */

function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1.05;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
}

function cancelSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Start game
init();
