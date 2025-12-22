// Game state
let board = [
    [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]], // Layer 0 (bottom)
    [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]], // Layer 1 (middle)
    [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]]  // Layer 2 (top)
];
let currentPlayer = "X";
let winner = "";
let score = { X: 0, O: 0 };
let gameActive = true;

// Three.js variables
let scene, camera, renderer, controls;
let cubeGroup;
let cellMeshes = []; // 3D array [layer][row][col]
let raycaster, mouse;
let selectedCell = null;
let isSpacePressed = false; // Track if space bar is held down

// DOM elements
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const btnRestart = document.getElementById('btn-restart');
const championOverlay = document.getElementById('champion-overlay');
const championText = document.getElementById('champion-text');
const btnReturn = document.getElementById('btn-return');

// Initialize game
function init() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded!');
        alert('Error: THREE.js library failed to load. Please check your internet connection and refresh the page.');
        return;
    }

    btnRestart.addEventListener('click', restartRound);
    btnReturn.addEventListener('click', resetGame);
    initThreeJS();
}

// Initialize Three.js scene
function initThreeJS() {
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        alert('Error: Game canvas not found. Please refresh the page.');
        return;
    }

    console.log('Initializing Three.js scene...');

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    // Get size from container
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth || 500, 500);
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // OrbitControls for rotation
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 3;  // Allow closer zoom
    controls.maxDistance = 12; // Allow further zoom
    controls.enableZoom = true; // Enable scroll wheel zoom
    controls.zoomSpeed = 1.0;
    controls.enabled = false;  // Start disabled, enable only when space is pressed

    // Raycaster for click detection
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.5; // Increase click tolerance
    raycaster.layers.set(0); // Only raycast objects on layer 0 (visible cells)
    mouse = new THREE.Vector2();

    // Create cube structure
    createCube();

    // Event listeners
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasHover);
    window.addEventListener('resize', handleResize);

    // Space bar controls for rotation
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    console.log('Three.js scene initialized successfully!');
    console.log('Canvas size:', size, 'x', size);
    console.log('Total cells created:', 27);
    console.log('Controls: Hold SPACE to rotate/zoom the cube');
    console.log('Zoom: Scroll wheel to zoom in (hides front layer) or out');

    // Start animation loop
    animate();
}

// Create 3D cube structure
function createCube() {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Initialize cellMeshes array
    cellMeshes = Array(3).fill(null).map(() =>
        Array(3).fill(null).map(() => Array(3).fill(null))
    );

    const cellSize = 0.9;
    const spacing = 1.0;
    const offset = -1.0; // Center the cube at origin

    for (let layer = 0; layer < 3; layer++) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                // Create cell geometry
                const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);

                // Glassmorphic material
                const material = new THREE.MeshPhysicalMaterial({
                    color: 0x8b5cca,
                    transparent: true,
                    opacity: 0.15,
                    metalness: 0.1,
                    roughness: 0.3,
                    transmission: 0.5,
                    thickness: 0.5,
                });

                const mesh = new THREE.Mesh(geometry, material);

                // Position
                mesh.position.set(
                    col * spacing + offset,
                    layer * spacing + offset,
                    row * spacing + offset
                );

                // Store metadata
                mesh.userData = { layer, row, col };

                // Add edge wireframe for better visibility
                const edges = new THREE.EdgesGeometry(geometry);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0x8b5cca,
                    opacity: 0.4,
                    transparent: true
                });
                const wireframe = new THREE.LineSegments(edges, lineMaterial);
                mesh.add(wireframe);

                // Add invisible larger hitbox for easier clicking
                const hitboxGeometry = new THREE.BoxGeometry(cellSize * 1.1, cellSize * 1.1, cellSize * 1.1);
                const hitboxMaterial = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                    visible: false
                });
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
                hitbox.userData = { layer, row, col, isHitbox: true };
                mesh.add(hitbox);

                cubeGroup.add(mesh);
                cellMeshes[layer][row][col] = mesh;
            }
        }
    }
}

// Handle canvas click
function handleCanvasClick(event) {
    if (!gameActive || winner || isSpacePressed) return; // Don't allow clicks while rotating

    updateMousePosition(event);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubeGroup.children, true);

    if (intersects.length > 0) {
        // Find the first mesh with userData (could be hitbox or cell)
        let targetMesh = null;
        for (let hit of intersects) {
            if (hit.object.userData && hit.object.userData.layer !== undefined) {
                // If it's a hitbox, get its parent (the cell mesh)
                if (hit.object.userData.isHitbox) {
                    targetMesh = hit.object.parent;
                } else if (hit.object.type === 'Mesh' && !hit.object.userData.isHitbox) {
                    targetMesh = hit.object;
                }
                if (targetMesh) break;
            }
        }

        if (!targetMesh) return;

        const { layer, row, col } = targetMesh.userData;

        if (board[layer][row][col] !== "-") return;

        // Update board state
        board[layer][row][col] = currentPlayer;

        // Visual update
        updateCellVisual(targetMesh, currentPlayer);

        // Check for winner
        checkWinner();

        // Switch player
        if (!winner) {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
        }
    }
}

// Update mouse position
function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// Handle canvas hover
function handleCanvasHover(event) {
    if (!gameActive || winner || isSpacePressed) return; // Don't highlight while rotating

    updateMousePosition(event);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubeGroup.children, true);

    // Reset previous highlight
    if (selectedCell) {
        const { layer, row, col } = selectedCell.userData;
        if (board[layer][row][col] === "-") {
            selectedCell.material.emissive.setHex(0x000000);
        }
    }

    // Highlight hovered cell
    if (intersects.length > 0) {
        // Find the first mesh with userData (could be hitbox or cell)
        let targetMesh = null;
        for (let hit of intersects) {
            if (hit.object.userData && hit.object.userData.layer !== undefined) {
                // If it's a hitbox, get its parent (the cell mesh)
                if (hit.object.userData.isHitbox) {
                    targetMesh = hit.object.parent;
                } else if (hit.object.type === 'Mesh' && !hit.object.userData.isHitbox) {
                    targetMesh = hit.object;
                }
                if (targetMesh) break;
            }
        }

        if (!targetMesh) {
            renderer.domElement.style.cursor = 'default';
            selectedCell = null;
            return;
        }

        const { layer, row, col } = targetMesh.userData;

        if (board[layer][row][col] === "-") {
            targetMesh.material.emissive.setHex(0x333333);
            selectedCell = targetMesh;
            renderer.domElement.style.cursor = 'pointer';
        } else {
            renderer.domElement.style.cursor = 'default';
            selectedCell = null;
        }
    } else {
        renderer.domElement.style.cursor = 'default';
        selectedCell = null;
    }
}

// Handle key down - enable rotation when space is pressed
function handleKeyDown(event) {
    if (event.code === 'Space' && !isSpacePressed) {
        event.preventDefault(); // Prevent page scroll
        isSpacePressed = true;
        controls.enabled = true;
        renderer.domElement.style.cursor = 'grab';
    }
}

// Handle key up - disable rotation when space is released
function handleKeyUp(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        isSpacePressed = false;
        controls.enabled = false;
        renderer.domElement.style.cursor = 'default';

        // Clear any cell highlight when releasing space
        if (selectedCell) {
            selectedCell = null;
        }
    }
}

// Update cell visual
function updateCellVisual(mesh, player) {
    const playerColor = player === 'X' ? 0xec4899 : 0x06b6d4; // Pink or Cyan

    // Update cell material
    mesh.material.color.setHex(playerColor);
    mesh.material.opacity = 0.7;
    mesh.material.emissive.setHex(playerColor);
    mesh.material.emissiveIntensity = 0.3;

    // Create X or O geometry inside the cell
    const symbol = createSymbol(player);
    symbol.position.copy(mesh.position);
    cubeGroup.add(symbol);
    mesh.userData.symbol = symbol;

    // Animation: scale pop-in
    symbol.scale.set(0, 0, 0);
    animateSymbolAppear(symbol);
}

// Create symbol geometry
function createSymbol(player) {
    const group = new THREE.Group();
    const color = player === 'X' ? 0xec4899 : 0x06b6d4;

    if (player === 'X') {
        // Create X using two crossed cylinders
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });

        const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);

        const line1 = new THREE.Mesh(geometry, material);
        line1.rotation.z = Math.PI / 4;

        const line2 = new THREE.Mesh(geometry, material);
        line2.rotation.z = -Math.PI / 4;

        group.add(line1, line2);
    } else {
        // Create O using torus
        const geometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const torus = new THREE.Mesh(geometry, material);
        group.add(torus);
    }

    return group;
}

// Animate symbol appearance
function animateSymbolAppear(symbol) {
    const startTime = Date.now();
    const duration = 300; // ms

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic ease-out with overshoot
        const scale = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        symbol.scale.set(scale, scale, scale);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// Generate all 49 win patterns
function generateWinPatterns() {
    const patterns = [];

    // 1. Horizontal rows (9 patterns: 3 per layer × 3 layers)
    for (let layer = 0; layer < 3; layer++) {
        for (let row = 0; row < 3; row++) {
            patterns.push([
                [layer, row, 0], [layer, row, 1], [layer, row, 2]
            ]);
        }
    }

    // 2. Vertical columns (9 patterns: 3 per layer × 3 layers)
    for (let layer = 0; layer < 3; layer++) {
        for (let col = 0; col < 3; col++) {
            patterns.push([
                [layer, 0, col], [layer, 1, col], [layer, 2, col]
            ]);
        }
    }

    // 3. Face diagonals on each layer (6 patterns: 2 per layer × 3 layers)
    for (let layer = 0; layer < 3; layer++) {
        patterns.push([[layer, 0, 0], [layer, 1, 1], [layer, 2, 2]]); // Main diagonal
        patterns.push([[layer, 0, 2], [layer, 1, 1], [layer, 2, 0]]); // Anti-diagonal
    }

    // 4. Vertical pillars through layers (9 patterns: 3 rows × 3 cols)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            patterns.push([
                [0, row, col], [1, row, col], [2, row, col]
            ]);
        }
    }

    // 5. Vertical face diagonals on XZ planes (6 patterns)
    for (let col = 0; col < 3; col++) {
        patterns.push([[0, 0, col], [1, 1, col], [2, 2, col]]);
        patterns.push([[0, 2, col], [1, 1, col], [2, 0, col]]);
    }

    // 6. Vertical face diagonals on YZ planes (6 patterns)
    for (let row = 0; row < 3; row++) {
        patterns.push([[0, row, 0], [1, row, 1], [2, row, 2]]);
        patterns.push([[0, row, 2], [1, row, 1], [2, row, 0]]);
    }

    // 7. Space diagonals (4 patterns: corner to corner through center)
    patterns.push([[0, 0, 0], [1, 1, 1], [2, 2, 2]]); // Corner to corner
    patterns.push([[0, 0, 2], [1, 1, 1], [2, 2, 0]]);
    patterns.push([[0, 2, 0], [1, 1, 1], [2, 0, 2]]);
    patterns.push([[0, 2, 2], [1, 1, 1], [2, 0, 0]]);

    return patterns; // Total: 9 + 9 + 6 + 9 + 6 + 6 + 4 = 49
}

// Check for winner
function checkWinner() {
    const winPatterns = generateWinPatterns();

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const [l1, r1, c1] = a;
        const [l2, r2, c2] = b;
        const [l3, r3, c3] = c;

        if (board[l1][r1][c1] !== "-" &&
            board[l1][r1][c1] === board[l2][r2][c2] &&
            board[l1][r1][c1] === board[l3][r3][c3]) {
            winner = board[l1][r1][c1];
            gameActive = false;
            drawWinnerLine3D(pattern);
            updateScore();
            return;
        }
    }

    // Check for draw
    const isFull = board.every(layer =>
        layer.every(row =>
            row.every(cell => cell !== "-")
        )
    );

    if (isFull) {
        gameActive = false;
        // Could show draw message here
        setTimeout(() => restartRound(), 1500);
    }
}

// Draw winner line in 3D
function drawWinnerLine3D(pattern) {
    const [start, , end] = pattern;

    // Get world positions of cells
    const startPos = cellMeshes[start[0]][start[1]][start[2]].position;
    const endPos = cellMeshes[end[0]][end[1]][end[2]].position;

    // Create line using tube geometry for visibility
    const lineColor = winner === 'X' ? 0xec4899 : 0x06b6d4;

    const curve = new THREE.LineCurve3(
        new THREE.Vector3(startPos.x, startPos.y, startPos.z),
        new THREE.Vector3(endPos.x, endPos.y, endPos.z)
    );

    const tubeGeometry = new THREE.TubeGeometry(curve, 1, 0.08, 8, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0
    });

    const winnerLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(winnerLine);

    // Animate opacity
    const startTime = Date.now();
    const duration = 500;

    function animateLine() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        tubeMaterial.opacity = progress * 0.9;

        if (progress < 1) {
            requestAnimationFrame(animateLine);
        }
    }

    animateLine();

    // Store reference for cleanup
    scene.userData.winnerLine = winnerLine;
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
    // Reset board state
    board = Array(3).fill(null).map(() =>
        Array(3).fill(null).map(() => Array(3).fill(null).map(() => "-"))
    );

    currentPlayer = "X";
    winner = "";
    gameActive = true;

    // Clear visual elements
    const childrenToRemove = [];
    cubeGroup.children.forEach(child => {
        if (child.userData.symbol) {
            childrenToRemove.push(child.userData.symbol);
            delete child.userData.symbol;
        }

        // Reset cell material
        if (child.type === 'Mesh' && child.userData.layer !== undefined) {
            child.material.color.setHex(0x8b5cca);
            child.material.opacity = 0.15;
            child.material.emissive.setHex(0x000000);
            child.material.emissiveIntensity = 0;
        }
    });

    // Remove symbols from scene
    childrenToRemove.forEach(symbol => cubeGroup.remove(symbol));

    // Remove winner line
    if (scene.userData.winnerLine) {
        scene.remove(scene.userData.winnerLine);
        scene.userData.winnerLine = null;
    }
}

// Reset entire game
function resetGame() {
    score = { X: 0, O: 0 };
    scoreX.innerHTML = '';
    scoreO.innerHTML = '';
    championOverlay.classList.remove('show');
    restartRound();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Update layer visibility based on camera distance
    updateLayerVisibility();

    // Update symbols to face camera
    updateSymbolRotations();

    // Render scene
    renderer.render(scene, camera);
}

// Update all symbols to face the camera (billboarding effect)
function updateSymbolRotations() {
    for (let layer = 0; layer < 3; layer++) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = cellMeshes[layer][row][col];
                if (cell.userData.symbol) {
                    // Make symbol always face the camera
                    cell.userData.symbol.lookAt(camera.position);
                }
            }
        }
    }
}

// Track last visibility state to avoid console spam
let lastVisibilityState = 'far';

// Update layer visibility based on zoom level and camera angle
function updateLayerVisibility() {
    const distance = camera.position.distanceTo(controls.target);

    // Define zoom thresholds
    const CLOSE_THRESHOLD = 5.5;  // When zoomed in close
    const MEDIUM_THRESHOLD = 7.5; // Medium distance

    // Determine current state
    let currentState = 'far';
    if (distance < CLOSE_THRESHOLD) {
        currentState = 'close';
    } else if (distance < MEDIUM_THRESHOLD) {
        currentState = 'medium';
    }

    // Get camera direction (which way camera is looking)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // Calculate which axis is most dominant in camera view
    const absX = Math.abs(cameraDirection.x);
    const absY = Math.abs(cameraDirection.y);
    const absZ = Math.abs(cameraDirection.z);

    // Determine which layer to hide based on camera angle
    // Calculate this for all states (needed for medium state dimming too)
    let hideLayer = null;
    let hideAxis = null;
    let hideValue = null;

    if (absY > absX && absY > absZ) {
        // Looking mostly along Y axis (vertical)
        // Camera looks FROM its position TOWARD the origin
        // If camera direction is positive Y, camera is above looking down, so hide TOP layer (closest to camera)
        hideAxis = 'y';
        hideLayer = cameraDirection.y < 0 ? 2 : 0; // Inverted: negative direction = looking down = hide top (2)
        hideValue = hideLayer;
    } else if (absX > absZ) {
        // Looking mostly along X axis (horizontal left-right)
        // If camera direction is positive X, camera is on right looking left, so hide RIGHT column (closest)
        hideAxis = 'x';
        hideLayer = cameraDirection.x < 0 ? 2 : 0; // Inverted: negative direction = looking right = hide right (2)
        hideValue = hideLayer;
    } else {
        // Looking mostly along Z axis (horizontal front-back)
        // If camera direction is positive Z, camera is in front looking back, so hide FRONT row (closest)
        hideAxis = 'z';
        hideLayer = cameraDirection.z < 0 ? 2 : 0; // Inverted: negative direction = looking forward = hide front (2)
        hideValue = hideLayer;
    }

    // Log state changes
    if (currentState !== lastVisibilityState) {
        console.log(`Zoom level changed: ${currentState} (distance: ${distance.toFixed(2)})`);
        if (currentState === 'close' && hideAxis) {
            console.log(`→ Hiding closest layer: ${hideAxis} = ${hideValue}`);
        } else if (currentState === 'medium') {
            console.log(`→ Front layer dimmed: ${hideAxis} = ${hideValue}`);
        } else {
            console.log('→ All layers visible');
        }
        lastVisibilityState = currentState;
    }

    // Update cell visibility and opacity
    for (let layer = 0; layer < 3; layer++) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = cellMeshes[layer][row][col];
                let shouldHide = false;

                if (currentState === 'close' && hideAxis) {
                    // Hide cells based on camera direction
                    if (hideAxis === 'y' && layer === hideLayer) {
                        shouldHide = true;
                    } else if (hideAxis === 'x' && col === hideLayer) {
                        shouldHide = true;
                    } else if (hideAxis === 'z' && row === hideLayer) {
                        shouldHide = true;
                    }
                }

                if (shouldHide) {
                    cell.visible = false;
                    // Make cell non-interactive by removing from raycasting
                    cell.layers.set(1); // Move to layer 1 (not raycasted)
                } else {
                    cell.visible = true;
                    cell.layers.set(0); // Back to layer 0 (raycasted)

                    // Set opacity based on distance and position
                    if (currentState === 'medium') {
                        // Dim the layer that would be hidden if closer
                        let shouldDim = false;
                        if (hideAxis === 'y' && layer === hideLayer) shouldDim = true;
                        else if (hideAxis === 'x' && col === hideLayer) shouldDim = true;
                        else if (hideAxis === 'z' && row === hideLayer) shouldDim = true;

                        cell.material.opacity = shouldDim ? 0.2 : (board[layer][row][col] !== "-" ? 0.7 : 0.15);
                    } else {
                        cell.material.opacity = board[layer][row][col] !== "-" ? 0.7 : 0.15;
                    }
                }

                // Update symbol visibility
                if (cell.userData.symbol) {
                    cell.userData.symbol.visible = cell.visible;
                }

                // Update hitbox layer too
                cell.children.forEach(child => {
                    if (child.userData.isHitbox) {
                        child.layers.set(shouldHide ? 1 : 0);
                    }
                });
            }
        }
    }
}

// Handle resize
function handleResize() {
    const container = renderer.domElement.parentElement;
    const size = Math.min(container.clientWidth, 500);

    camera.aspect = 1;
    camera.updateProjectionMatrix();

    renderer.setSize(size, size);
}

// Start game
init();
