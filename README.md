# Tic-Tac-Toe - Score 3 🎮

A modern, beautifully designed Tic-Tac-Toe game built with vanilla HTML, CSS, and JavaScript. First player to win 3 rounds becomes the champion!

**Live Demo:** [https://krisyupher.github.io/tres-en-linea/](https://krisyupher.github.io/tres-en-linea/)

![Tic-Tac-Toe Game](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **🎨 Modern UI/UX Design**
  - Glassmorphism effects with backdrop blur
  - Animated gradient backgrounds
  - Smooth transitions and micro-animations
  - Player-specific colors (Pink for X, Cyan for O)

- **🎯 Game Features**
  - Classic Tic-Tac-Toe gameplay
  - Best of 3 scoring system
  - Animated winner line drawing
  - Champion celebration overlay
  - Score tracking with visual feedback

- **📱 Responsive Design**
  - Mobile-first approach
  - Works on all screen sizes
  - Touch-friendly interface
  - Optimized for desktop, tablet, and mobile

- **⚡ Performance**
  - No dependencies required
  - Instant loading
  - Smooth 60fps animations
  - Lightweight (~20KB total)

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
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
├── index.html      # Main HTML file
├── style.css       # All styles and animations
├── script.js       # Game logic and interactions
└── README.md       # This file
```

## 🎮 How to Play

1. **Start Playing:** Click any cell to place your mark (X starts first)
2. **Win a Round:** Get three in a row (horizontal, vertical, or diagonal)
3. **Score Points:** Each round win adds to your score
4. **Become Champion:** First player to win 3 rounds wins the game!
5. **Restart:** Click "Reiniciar" to start a new round
6. **New Game:** Click "Return" on the champion screen to reset everything

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
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Game logic and DOM manipulation
- **Canvas API** - Winner line animation

### Key Features
- CSS Custom Properties for theming
- CSS Grid and Flexbox for layouts
- RequestAnimationFrame for smooth animations
- Event delegation for efficient event handling
- Responsive design with media queries

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

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

### Winner Detection
```javascript
const winPatterns = [
  [[0,0], [0,1], [0,2]], // Rows
  [[0,0], [1,0], [2,0]], // Columns
  [[0,0], [1,1], [2,2]], // Diagonals
];
```

### Animated Winner Line
```javascript
// Smooth canvas animation using requestAnimationFrame
const animate = () => {
  ctx.lineTo(currentX, currentY);
  ctx.shadowBlur = 20;
  ctx.stroke();
  requestAnimationFrame(animate);
};
```

## 🎯 Future Enhancements

- [ ] AI opponent with difficulty levels
- [ ] Sound effects and background music
- [ ] Customizable themes
- [ ] Multiplayer over network
- [ ] Game statistics and history
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

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
