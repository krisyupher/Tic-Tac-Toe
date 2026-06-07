# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A 2D, **voice-only** Tic-Tac-Toe game where you (player `X`) play against an AI opponent (`O`). All gameplay is driven by speech: you say a cell ("top center", "middle left", "bottom right"), say a difficulty ("easy"/"medium"/"hard"), or say "reset". The board cells are display-only `<div>`s — there is no mouse/keyboard gameplay. The **only** visible control is a single **Reset** button (resets the AI level to default + clears the board, and re-arms voice listening). The AI talks back with a randomized trash-talk message bank and announces its own moves via speech synthesis. Each round is independent (no persistent score); the board auto-resets ~2s after a win or draw. Ships as an installable PWA.

**Tech Stack:** HTML5, CSS3, and vanilla JavaScript (ES6+). No build tools, no dependencies, no framework. The two browser Web Speech APIs (`SpeechRecognition` and `speechSynthesis`) are the only notable runtime APIs.

> **Note:** Both [README.md](README.md) and the live-demo description still describe a *previous* 3D Three.js version of this game (a 3x3x3 cube, 49 win patterns, OrbitControls, best-of-3 champion system). That code no longer exists in the repo — the current game is the 2D voice game described here. Treat README.md as outdated.

## Development Commands

There is no build, lint, or test tooling. Run the game by opening [index.html](index.html) directly, or via a local server (needed for service-worker/PWA testing, which requires `http://` not `file://`):

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

**Deployment:** Pushes to `master` auto-deploy to GitHub Pages (live demo: https://krisyupher.github.io/tres-en-linea/).

## Architecture

Everything lives in three files plus PWA assets. All game logic is in [script.js](script.js) as module-level state and plain functions — no classes, no bundler. `init()` at the bottom wires up DOM listeners, builds the board, and sets up speech recognition.

### Game state (module-level globals)
- `board2D` — 3x3 array, values `"-"`, `"X"`, `"O"` (indexed `board2D[row][col]`)
- `gameActive2D` — blocks moves while a round is over / resetting
- `aiLevel` — `'easy' | 'medium' | 'hard'`, changed by saying a difficulty word (parsed in `parseDifficulty` / `DIFFICULTY_WORDS`); reset to `'medium'` by `fullReset()`
- `aiThinking` — blocks player input during the AI's ~650ms "thinking" delay
- `recognition` / `isListening` / `voiceSupported` — speech-recognition state

### Move flow
`playerMove2D(row, col)` is the single entry point for placing the player's mark. It is reached only via voice (`handleTranscript → playerMove2D`) — cells have no click handler, but the function is kept fully working "in the background" so voice (or a future re-enabling of clicks) can drive it. It places `X`, checks for a result, and if the game continues hands off to the AI via `setTimeout(aiMove2D, 650)`. `aiMove2D()` calls `chooseAIMove()`, places `O`, speaks its move, and re-checks. The `aiThinking` guard prevents input during the delay.

### Voice command routing (`handleTranscript`)
Each finalized speech result is normalized to lowercase tokens and routed by intent priority: **reset** (`RESET_WORDS` = reset/restart/clear, or the phrases "new game"/"start over") → `fullReset()`; **difficulty** (`DIFFICULTY_WORDS` maps easy/initial/beginner/simple → easy, medium/normal/intermediate → medium, hard/high/difficult/expert/impossible → hard) → `setDifficulty()`; otherwise **cell move** → `parseCell()` → `playerMove2D()`. `fullReset()` cancels speech, clears `aiThinking`, resets `aiLevel` to `'medium'`, and clears the board.

### AI levels (`chooseAIMove`, [script.js:183](script.js#L183))
- `easy` → `randomMove` (random empty cell)
- `medium` → `heuristicMove`: win-if-possible → block → center → corner → edge
- `hard` → `minimaxMove` / `minimax`: full minimax where `O` maximizes (`10 - depth` for an O win, `depth - 10` for an X win). Unbeatable.

### Winner detection
`WIN_LINES_2D` is 8 lines (3 rows, 3 cols, 2 diagonals). `winnerOf2D(b)` is a pure helper used by the AI to test hypothetical boards; `checkResult2D()` reads the live `board2D` and returns `{ winner, line }`, `{ draw: true }`, or `null`. On a win, the winning line's cells get the `.win` class for a highlight.

### Voice input (Web Speech API, `en-US`)
`setupSpeechRecognition()` configures continuous recognition with `maxAlternatives = 3`. The `onresult` handler iterates the alternatives and tries `handleTranscript()` on each until one parses. `parseCell(tokens)` maps spoken words to `{row, col}`:
- `ROW_WORDS`: top/up/upper/high/first → 0, bottom/down/lower/low/last → 2
- `COL_WORDS`: left → 0, right → 2
- `CENTER_WORDS` (center/centre/central/middle/mid): fills the first unset axis with 1, so "center" alone → `[1,1]`, "top center" → `[0,1]`, "center left" → `[1,0]`.

`onend` auto-restarts recognition while `isListening` is true (continuous listening). Listening is started automatically in `init()`, and the **Reset** button (`#btn-reset`) also calls `startListening()` so it doubles as the user gesture some browsers require to grant mic access. **Graceful degradation:** if the browser lacks `SpeechRecognition`, a "voice not supported" notice is shown in the status line; since gameplay is voice-only, only Reset remains functional.

### Spoken feedback (`speak`, [script.js:455](script.js#L455))
`speechSynthesis` announces AI moves and round results. The `MESSAGES` object ([script.js:21](script.js#L21)) holds themed banks of one-liners (`aiWins`, `playerWins`, `beforeMatch`, `funny`, `didntUnderstand`); `pick(arr)` selects one at random. This is purely flavor — editing these strings changes the AI's personality without touching game logic.

### CSS ([style.css](style.css))
Design-system driven via CSS custom properties (`:root`). Player colors: `--color-player-x` (#ec4899 pink), `--color-player-o` (#06b6d4 cyan). Glassmorphism via `backdrop-filter: blur()`. Key animations: `gradientShift` (animated body background) and `cellPop` (mark placement). Cells are non-interactive (`cursor: default`, no hover affordance); the only styled control is `.btn-reset`. The board uses CSS Grid; responsive breakpoints at 768px and 480px. Marks render in the "Rock Salt" font; UI in "Inter".

## PWA

The app is installable and offline-capable:
- [manifest.json](manifest.json) — name, icons (in [icons/](icons/)), theme colors. Uses relative `start_url`/`scope` (`.`) so it works at both the domain root and under the GitHub Pages project path.
- [service-worker.js](service-worker.js) — cache-first app shell + runtime caching (including CDN/opaque responses). **Bump `CACHE_VERSION` whenever you change cached assets**, or clients will keep serving stale files.
- [.well-known/assetlinks.json](.well-known/assetlinks.json) — Android Digital Asset Links for the TWA wrapper (`io.github.krisyupher.tictactoe`). Update the SHA-256 fingerprint if the signing key changes.
- [tools/make_icons.py](tools/make_icons.py) — regenerates the PNG icons.

## Notable conventions
- Empty cells are the string `"-"`, not `null` or `""`. AI helpers temporarily mutate the board in place (`b[r][c] = 'O'` … restore to `"-"`) to evaluate moves — always restore after probing.
- `board2D[row][col]` ordering: row first (0=top, 2=bottom), col second (0=left, 2=right).
- All functions for this game share a `2D` suffix, a holdover from when 3D logic coexisted; there is no 3D code anymore.
