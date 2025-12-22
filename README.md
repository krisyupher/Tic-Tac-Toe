# 3D Tic-Tac-Toe - Score 3 🎮

A modern, beautifully designed 3D Tic-Tac-Toe game built with HTML, CSS, JavaScript, and Three.js. Play in a stunning 3x3x3 cube with 49 possible winning patterns. First player to win 3 rounds becomes the champion!

**Live Demo:** [https://krisyupher.github.io/tres-en-linea/](https://krisyupher.github.io/tres-en-linea/)

![Tic-Tac-Toe Game](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)

## ✨ Features

- **🎨 Modern UI/UX Design**
  - Glassmorphism effects with backdrop blur
  - Animated gradient backgrounds
  - Smooth transitions and micro-animations
  - Player-specific colors (Pink for X, Cyan for O)
  - Interactive 3D cube visualization

- **🎯 Game Features**
  - 3D Tic-Tac-Toe gameplay in a 3x3x3 cube
  - 49 possible winning patterns (rows, columns, diagonals, and space diagonals)
  - Best of 3 scoring system
  - Animated 3D winner line drawing
  - Rotate and explore the cube with mouse/touch
  - Champion celebration overlay
  - Score tracking with visual feedback

- **📱 Responsive Design**
  - Mobile-first approach
  - Works on all screen sizes
  - Touch-friendly interface
  - Optimized for desktop, tablet, and mobile

- **⚡ Performance**
  - Three.js for hardware-accelerated 3D rendering
  - WebGL-powered graphics
  - Smooth 60fps animations
  - Optimized raycasting for click detection

## 🚀 Getting Started

### Prerequisites

- Any modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- No installation or build process required!

### Running the Game

Simply open `index.html` in your web browser:

```bash
# Option 1: Double-click index.html

# Option 2: Use a local server (optional)
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📁 Project Structure

```
tres-en-linea/
├── index.html      # Main HTML file with Three.js integration
├── style.css       # All styles and animations
├── script.js       # 3D game logic, Three.js scene, and interactions
├── CLAUDE.md       # Development guide for Claude Code
└── README.md       # This file
```

## 🎮 How to Play

1. **Rotate the Cube:** Drag to rotate and view all sides of the 3D cube
2. **Start Playing:** Click any visible cell to place your mark (X starts first)
3. **Win a Round:** Get three in a row in any direction (horizontal, vertical, diagonal, or through space)
4. **Score Points:** Each round win adds to your score
5. **Become Champion:** First player to win 3 rounds wins the game!
6. **Restart:** Click "Restart" to start a new round
7. **New Game:** Click "Return" on the champion screen to reset everything

## 🎨 Design Highlights

### Color Palette
- **Background:** Deep space gradient (#0a0e27 → #2d1b4e)
- **Player X:** Hot Pink (#ec4899)
- **Player O:** Cyan (#06b6d4)
- **Accents:** Indigo (#6366f1), Purple (#8b5cf6)

### Animations
- Cell pop-in effect when placing marks
- Smooth winner line drawing with glow
- Score mark entrance animations
- Button ripple effects on hover
- Champion overlay celebration

### Typography
- **UI Text:** Inter (clean, modern sans-serif)
- **Game Marks:** Rock Salt (playful, handwritten style)

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with custom properties and glassmorphism
- **JavaScript (ES6+)** - Game logic and 3D interactions
- **Three.js** - 3D rendering, scene management, and animations
- **WebGL** - Hardware-accelerated graphics

### Key Features
- CSS Custom Properties for theming
- CSS Grid and Flexbox for UI layouts
- Three.js Scene, Camera, and Renderer setup
- OrbitControls for intuitive 3D navigation
- Raycasting for precise 3D click detection
- 49 winning pattern algorithm
- RequestAnimationFrame for 60fps rendering
- Responsive design with media queries

### Browser Support
- Chrome/Edge (latest) - Full WebGL support
- Firefox (latest) - Full WebGL support
- Safari (latest) - Full WebGL support
- Mobile browsers with WebGL (iOS Safari, Chrome Mobile)

## 📝 Code Highlights

### CSS Variables
```css
:root {
  --color-player-x: #ec4899;
  --color-player-o: #06b6d4;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --transition-normal: 300ms ease-in-out;
}
```

### 3D Board Structure
```javascript
let board = [
  [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]], // Layer 0
  [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]], // Layer 1
  [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]]  // Layer 2
];
```

### 49 Win Patterns Generation
```javascript
// Generates all possible winning patterns:
// - 9 horizontal rows + 9 vertical columns + 6 face diagonals (per layer)
// - 9 vertical pillars (through layers)
// - 12 vertical face diagonals (XZ and YZ planes)
// - 4 space diagonals (corner to corner)
function generateWinPatterns() {
  // Returns array of 49 patterns
  // Format: [[layer, row, col], [layer, row, col], [layer, row, col]]
}
```

### 3D Click Detection
```javascript
// Raycasting for precise 3D interaction
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(cubeGroup.children, true);
const { layer, row, col } = mesh.userData;
```

## 🎯 Future Enhancements

- [ ] AI opponent with difficulty levels (3D strategy)
- [ ] Sound effects and background music
- [ ] Customizable themes and cube colors
- [ ] Multiplayer over network
- [ ] Game statistics and history
- [ ] Keyboard navigation for 3D cube
- [ ] VR support for immersive gameplay
- [ ] Different cube sizes (4x4x4, 5x5x5)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Krisyupher**
- GitHub: [@krisyupher](https://github.com/krisyupher)
- Project Link: [https://github.com/krisyupher/tres-en-linea](https://github.com/krisyupher/tres-en-linea)

## 🙏 Acknowledgments

- Inspired by classic Tic-Tac-Toe gameplay
- Modern design trends: Glassmorphism, gradient backgrounds
- Google Fonts for Inter and Rock Salt typefaces

---

**Enjoy the game! 🎉**

If you like this project, please give it a ⭐ on GitHub!
