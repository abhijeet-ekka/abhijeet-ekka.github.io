# 🚀 Abhijeet Ekka - 3D Interactive Portfolio

A cutting-edge, interactive 3D portfolio website built with HTML, CSS, JavaScript, and Three.js. This modern portfolio showcases advanced web development skills through immersive 3D experiences and sophisticated visual design.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 🎨 Visual Excellence
- **Dark Theme Design** with neon accent colors (cyan, purple, pink)
- **Glassmorphism Effects** on all UI components
- **Dynamic Color-Changing Lighting** system
- **Gradient Text Effects** and modern typography
- **Responsive Design** for all device sizes

### 🌟 3D Interactive Elements
- **Interactive 3D Scene** as main background
- **1000+ Animated Particles** responding to mouse movement
- **20+ Floating Geometric Objects** (cubes, spheres, toruses, etc.)
- **Dynamic Camera Movement** with smooth parallax effects
- **3D Text Sprites** floating in the scene
- **Section-Specific Particle Systems**

### 🎭 Advanced Animations
- **Custom Cursor Effects** with trailing animation
- **Smooth Scroll Transformations** between sections
- **Loading Animation** with 3D cube
- **Typing Effect** for hero subtitle
- **Counter Animations** for statistics
- **Skill Level Animations** with progress bars
- **Hover Effects** on all interactive elements

### 📱 User Experience
- **Smooth Navigation** with active section highlighting
- **Mobile-Friendly** touch controls
- **Performance Optimized** with FPS monitoring
- **Accessibility Features** (reduced motion support)
- **Contact Form** with validation and animations

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics**: Three.js r128
- **Fonts**: Google Fonts (Orbitron, Inter)
- **Design**: Glassmorphism, Dark Theme, Neon Accents
- **Performance**: Optimized rendering, WebGL

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Local development server (Live Server extension recommended)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Avyjt/3d-portfolio.git
   cd 3d-portfolio
   ```

2. **Start a local server**:
   
   **Option A: Using Live Server (VS Code)**
   - Install Live Server extension
   - Right-click on `index.html`
   - Select "Open with Live Server"
   
   **Option B: Using Python**
   ```bash
   python -m http.server 8000
   ```
   
   **Option C: Using Node.js**
   ```bash
   npx serve .
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000` (or the port shown by your server)

## 📁 Project Structure

```
3d-portfolio/
├── index.html          # Main HTML structure
├── style.css           # Complete styling and animations
├── script.js           # Three.js logic and interactions
└── README.md           # Project documentation
```

## 🎯 Key Sections

### 🏠 Hero Section
- Animated name with gradient text effects
- Interactive particle background
- Statistics counter animation
- Call-to-action buttons with glow effects

### 👨‍💻 About Section
- Personal story and highlights
- Glassmorphism cards with hover effects
- Floating 3D elements in background

### 🛠️ Skills Section
- Interactive skill items with progress bars
- Animated icons and hover effects
- Technology stack visualization

### 💼 Projects Section
- 3D project cards with hover animations
- Technology tags and live demo links
- Rotating border effects

### 📧 Contact Section
- Animated contact form
- Interactive input fields with glow
- Social media links and information

## ⚡ Performance Features

- **FPS Monitoring**: Automatic quality adjustment based on performance
- **Optimized Rendering**: Efficient particle systems and object management
- **Memory Management**: Proper cleanup and disposal of 3D resources
- **Mobile Optimization**: Reduced particle count on mobile devices
- **WebGL Context Recovery**: Handles context loss gracefully

## 🎨 Customization

### Changing Colors
Edit the CSS custom properties in `style.css`:

```css
:root {
  --primary-cyan: #00f5ff;
  --primary-purple: #8b5cf6;
  --primary-pink: #ec4899;
  --neon-green: #39ff14;
}
```

### Adjusting 3D Scene
Modify scene parameters in `script.js`:

```javascript
const sceneParams = {
  particleCount: 1000,
  floatingObjectCount: 20,
  mouseInfluence: 0.1,
  cameraSpeed: 0.02,
  rotationSpeed: 0.005
};
```

### Personal Information
Update content in `index.html`:
- Name and title in hero section
- About section content
- Skills and technologies
- Project information
- Contact details

## 🌟 Browser Support

- **Chrome**: 60+ ✅
- **Firefox**: 55+ ✅
- **Safari**: 12+ ✅
- **Edge**: 79+ ✅
- **Mobile Safari**: iOS 12+ ✅
- **Chrome Mobile**: Android 60+ ✅

## 📱 Mobile Features

- Touch-optimized controls
- Reduced particle count for performance
- Responsive typography and layouts
- Mobile-friendly navigation
- Touch gesture support

## 🔧 Development Tips

1. **Performance**: Monitor FPS in browser dev tools
2. **Testing**: Test on various devices and screen sizes
3. **Debugging**: Use Three.js inspector browser extensions
4. **Optimization**: Adjust particle counts based on target devices

## 🚀 Deployment

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (main/master)

### Netlify
1. Connect GitHub repository
2. Build command: (none needed for static site)
3. Publish directory: `/`

### Vercel
1. Import GitHub repository
2. Framework preset: Other
3. Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Abhijeet Ekka**
- GitHub: [@Avyjt](https://github.com/Avyjt)
- LinkedIn: [Abhijeet Ekka](https://linkedin.com/in/abhijeet-ekka)
- Email: abhijeet.ekka@email.com

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for the amazing 3D library
- [Google Fonts](https://fonts.google.com/) for typography
- [CSS Glassmorphism](https://glassmorphism.com/) for design inspiration
- The web development community for continuous inspiration

## 📈 Future Enhancements

- [ ] WebXR/VR support
- [ ] Advanced shader effects
- [ ] Physics simulation with Cannon.js
- [ ] Audio visualization integration
- [ ] AI-powered animations
- [ ] Progressive Web App features

---

**⭐ If you found this project helpful, please give it a star!**

*Built with ❤️ and cutting-edge web technologies*