// ===== GLOBAL VARIABLES =====
let scene, camera, renderer;
let animationId;
let mouse = { x: 0, y: 0 };
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// 3D Objects
let particles = [];
let floatingObjects = [];
let shootingStars = []; // New array for shooting stars
let ambientLight, directionalLight, pointLight;

// Performance
let clock = new THREE.Clock();
let isLoading = true;

// Custom Cursor
let cursorDot, cursorOutline;
let cursorDotX = 0;
let cursorDotY = 0;
let cursorOutlineX = 0;
let cursorOutlineY = 0;
let cursorTrail = [];
let maxTrailLength = 10;

// Shooting Stars
let starSpawnInterval = 3000; // Every 3 seconds as per specification
let starSpawnTimer = null;

// Timers that need to be tracked for cleanup
let performanceMonitoringTimer = null;

// Sensitivity multipliers for enhanced horizontal movement (reduced sensitivity)
const sensitivity = {
    horizontal: 1.5,  // Reduced horizontal sensitivity from 2.0 to 1.5
    vertical: 1.0,    // Keep vertical sensitivity normal
    particle: 1.2,    // Reduced particle interaction sensitivity from 1.5 to 1.2
    object: 1.4       // Reduced floating object sensitivity from 1.8 to 1.4
};

// ===== ADVANCED SCROLL SYSTEM =====
let scrollController = {
    target: 0,
    current: 0,
    ease: 0.08,
    limit: 0,
    sectionHeights: [],
    sections: [],
    isScrolling: false,
    scrollTimeout: null,
    animationRunning: false // Add this property
};

// Scene parameters
const sceneParams = {
    particleCount: 1000,
    floatingObjectCount: 20,
    mouseInfluence: 0.1,
    cameraSpeed: 0.02,
    rotationSpeed: 0.005
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initLoadingScreen();
    initNavigation();
    initThreeJS();
    initEventListeners();
    initScrollAnimations();
    initContactForm();
    initAdvancedFeatures();
    initAdvancedScrollSystem();
    initCustomCursor(); // Initialize custom cursor
    initShootingStars(); // Initialize shooting stars
    
    // Start loading simulation
    simulateLoading();
});

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
    cursorDot = document.querySelector('.cursor-dot');
    cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursorDot || !cursorOutline) return;
    
    // Set initial position
    cursorDotX = window.innerWidth / 2;
    cursorDotY = window.innerHeight / 2;
    cursorOutlineX = window.innerWidth / 2;
    cursorOutlineY = window.innerHeight / 2;
    
    // Mouse move event
    document.addEventListener('mousemove', (e) => {
        cursorDotX = e.clientX;
        cursorDotY = e.clientY;
        
        // Update dot position immediately
        cursorDot.style.transform = `translate(${cursorDotX - 4}px, ${cursorDotY - 4}px)`;
        
        // Add to trail
        cursorTrail.push({ x: cursorDotX, y: cursorDotY });
        if (cursorTrail.length > maxTrailLength) {
            cursorTrail.shift();
        }
    });
    
    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .nav-link, .cta-button, .skill-item');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.querySelector('.custom-cursor').classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            document.querySelector('.custom-cursor').classList.remove('hover');
        });
    });
    
    // Click effects
    document.addEventListener('mousedown', () => {
        document.querySelector('.custom-cursor').classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
        document.querySelector('.custom-cursor').classList.remove('click');
    });
    
    // Animation loop for smooth cursor movement
    animateCursor();
}

function animateCursor() {
    // Smooth follow effect for outline
    cursorOutlineX += (cursorDotX - cursorOutlineX) / 5;
    cursorOutlineY += (cursorDotY - cursorOutlineY) / 5;
    
    if (cursorOutline) {
        cursorOutline.style.transform = `translate(${cursorOutlineX - 20}px, ${cursorOutlineY - 20}px)`;
    }
    
    requestAnimationFrame(animateCursor);
}

// ===== ADVANCED SCROLL SYSTEM =====
function initAdvancedScrollSystem() {
    // Calculate section heights
    calculateSectionHeights();
    
    // Initialize scroll controller
    scrollController.limit = document.documentElement.scrollHeight - window.innerHeight;
    
    // Add scroll event listeners with passive option for better performance
    window.addEventListener('scroll', onScrollAdvanced, { passive: true });
    
    // Initialize scroll progress bar
    initScrollProgressBar();
    
    // Touch events for mobile
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        window.scrollBy(0, deltaY * 0.5);
        touchStartY = touchY;
    }, { passive: true });
    
    // Intersection Observer for performance
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -20% 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Update active navigation
                updateActiveNavigation();
                
                // Trigger section-specific 3D animations
                triggerSectionAnimations(entry.target.id);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Start scroll animation loop only when scrolling
    // animateScroll(); // Removed to optimize performance
}

function initScrollProgressBar() {
    const progressBar = document.getElementById('scroll-progress-bar');
    
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        }, { passive: true });
    }
}

function calculateSectionHeights() {
    scrollController.sections = Array.from(document.querySelectorAll('.section'));
    scrollController.sectionHeights = scrollController.sections.map(section => ({
        element: section,
        offsetTop: section.offsetTop,
        height: section.offsetHeight
    }));
}

function onScrollAdvanced() {
    scrollController.target = window.scrollY;
    scrollController.isScrolling = true;
    
    // Clear previous timeout
    if (scrollController.scrollTimeout) {
        clearTimeout(scrollController.scrollTimeout);
    }
    
    // Set new timeout
    scrollController.scrollTimeout = setTimeout(() => {
        scrollController.isScrolling = false;
    }, 150);
    
    // Update scroll progress
    updateScrollProgress();
    
    // Start animation loop when scrolling begins
    if (!scrollController.animationRunning) {
        scrollController.animationRunning = true;
        animateScroll();
    }
}

function updateScrollProgress() {
    const progressBar = document.getElementById('scroll-progress-bar');
    if (progressBar) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }
}

function animateScroll() {
    // Only continue animation if still scrolling
    if (scrollController.isScrolling) {
        // Smooth scroll interpolation
        scrollController.current += (scrollController.target - scrollController.current) * scrollController.ease;
        
        // Map scroll progress to 0-1 range
        const scrollProgress = scrollController.current / scrollController.limit;
        
        // Update 3D scene based on scroll
        updateSceneOnScroll(scrollProgress);
        
        // Continue animation loop
        requestAnimationFrame(animateScroll);
    } else {
        // Mark animation as stopped
        scrollController.animationRunning = false;
    }
}

function updateSceneOnScroll(progress) {
    // Map progress to camera positions
    const cameraZ = 100 + progress * 50;
    const cameraY = progress * -30;
    const cameraX = Math.sin(progress * Math.PI * 2) * 10;
    
    // Update camera position
    camera.position.x += (cameraX - camera.position.x) * 0.05;
    camera.position.y += (cameraY - camera.position.y) * 0.05;
    camera.position.z = cameraZ;
    
    // Rotate scene based on scroll
    scene.rotation.y = progress * Math.PI * 0.5;
    
    // Update particle system
    if (window.particleSystem) {
        window.particleSystem.rotation.y = progress * Math.PI;
        
        // Animate particle colors based on scroll
        const time = clock.getElapsedTime();
        // Time-based animations are now handled directly in the animation loop
    }
    
    // Update floating objects with scroll-based animations
    floatingObjects.forEach((obj, index) => {
        const objectProgress = (progress + index * 0.05) % 1;
        
        // Position animation
        obj.mesh.position.y = obj.originalPosition.y + 
            Math.sin(objectProgress * Math.PI * 4) * obj.floatAmplitude;
        
        // Rotation animation
        obj.mesh.rotation.x = objectProgress * Math.PI * 2;
        obj.mesh.rotation.y = objectProgress * Math.PI * 3;
        
        // Scale animation
        const scale = 1 + Math.sin(objectProgress * Math.PI * 2) * 0.3;
        obj.mesh.scale.set(scale, scale, scale);
    });
    
    // Update lighting based on scroll
    if (window.dynamicLights) {
        window.dynamicLights[0].position.x = Math.sin(progress * Math.PI * 2) * 50;
        window.dynamicLights[0].position.y = Math.cos(progress * Math.PI * 3) * 50;
        window.dynamicLights[0].intensity = 0.5 + progress * 0.5;
        
        window.dynamicLights[1].position.x = Math.cos(progress * Math.PI * 2) * -50;
        window.dynamicLights[1].position.z = Math.sin(progress * Math.PI * 3) * 50;
        window.dynamicLights[1].intensity = 1 - progress * 0.5;
    }
}

function triggerSectionAnimations(sectionId) {
    switch(sectionId) {
        case 'home':
            // Hero section animations
            animateHeroSection();
            break;
        case 'about':
            // About section animations
            animateAboutSection();
            break;
        case 'skills':
            // Skills section animations
            animateSkillsSection();
            break;
        case 'projects':
            // Projects section animations
            animateProjectsSection();
            break;
        case 'contact':
            // Contact section animations
            animateContactSection();
            break;
    }
}

function animateHeroSection() {
    // Animate hero title
    const titleLines = document.querySelectorAll('.title-line');
    titleLines.forEach((line, index) => {
        line.style.animation = `slideInUp 0.8s ease-out ${index * 0.2}s forwards`;
    });
    
    // Animate stats
    animateStats();
}

function animateAboutSection() {
    // Animate about cards
    const aboutCards = document.querySelectorAll('.about-card, .highlight-item');
    aboutCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }, index * 100);
    });
}

function animateSkillsSection() {
    // Animate skills
    animateSkills();
}

function animateProjectsSection() {
    // Animate project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }, index * 150);
    });
}

function animateContactSection() {
    // Animate contact elements
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'fadeInLeft 0.6s ease-out forwards';
        }, index * 100);
    });
    
    // Animate contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.style.animation = 'fadeInRight 0.6s ease-out forwards';
    }
}

// Scroll to section with smooth animation
function scrollToSection(targetSection) {
    const section = document.getElementById(targetSection);
    if (section) {
        const targetPosition = section.offsetTop - 80; // Account for navbar height
        
        // Use modern smooth scrolling for better performance
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ===== LOADING SCREEN =====
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercentage = document.querySelector('.loading-percentage');
    
    // Animate loading bar
    function updateProgress(progress) {
        loadingBar.style.width = progress + '%';
        loadingPercentage.textContent = Math.round(progress) + '%';
    }
    
    // Simulate loading process
    window.simulateLoading = function() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                    isLoading = false;
                    startMainAnimation();
                }, 500);
            }
            updateProgress(progress);
        }, 200);
    };
}

// ===== NAVIGATION =====
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            if (targetId === 'home') {
                // Scroll to top
                scrollToTop();
            } else {
                // Scroll to section
                scrollToSection(targetId);
            }
            
            // Close mobile menu
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Navbar scroll effect with throttling for better performance
    let ticking = false;
    
    function updateNavigation() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active navigation based on scroll position
        updateActiveNavigation();
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavigation);
            ticking = true;
        }
    }
    
    // Only one scroll listener for navbar effects
    window.addEventListener('scroll', requestTick);
}

function scrollToTop() {
    // Use modern smooth scrolling for better performance
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateActiveNavigation() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}

// ===== THREE.JS INITIALIZATION =====
function initThreeJS() {
    const container = document.getElementById('three-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 1, 1000);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 100);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Initialize lighting
    initLighting();
    
    // Initialize 3D objects
    initParticles();
    initFloatingObjects();
}

// ===== LIGHTING SYSTEM =====
function initLighting() {
    // Ambient light
    ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Directional light
    directionalLight = new THREE.DirectionalLight(0x00f5ff, 1);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Point lights for dynamic effects
    const pointLight1 = new THREE.PointLight(0x8b5cf6, 1, 200);
    pointLight1.position.set(50, 50, 50);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xec4899, 1, 200);
    pointLight2.position.set(-50, -50, 50);
    scene.add(pointLight2);
    
    // Store references for animation
    window.dynamicLights = [pointLight1, pointLight2];
}

// ===== PARTICLE SYSTEM =====
function initParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sceneParams.particleCount * 3);
    const colors = new Float32Array(sceneParams.particleCount * 3);
    const sizes = new Float32Array(sceneParams.particleCount);
    
    // Define color palette
    const colorPalette = [
        new THREE.Color(0x00f5ff), // Cyan
        new THREE.Color(0x8b5cf6), // Purple
        new THREE.Color(0xec4899), // Pink
        new THREE.Color(0x39ff14)  // Neon green
    ];
    
    for (let i = 0; i < sceneParams.particleCount; i++) {
        // Positions
        positions[i * 3] = (Math.random() - 0.5) * 1000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
        
        // Colors
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Sizes
        sizes[i] = Math.random() * 2 + 1;
        
        // Store particle data for animation
        particles.push({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ),
            originalPosition: new THREE.Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            ),
            // Add properties for cursor interaction
            distanceToCursor: 0,
            repulsionForce: new THREE.Vector3()
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Use PointsMaterial instead of ShaderMaterial to avoid shader compilation issues
    const material = new THREE.PointsMaterial({
        size: 2, // Fixed size
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    // Store reference for animation
    window.particleSystem = particleSystem;
}

// ===== FLOATING OBJECTS =====
function initFloatingObjects() {
    const geometries = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.ConeGeometry(1, 2, 8),
        new THREE.TorusGeometry(1, 0.3, 16, 100),
        new THREE.OctahedronGeometry(1),
        new THREE.IcosahedronGeometry(1)
    ];
    
    for (let i = 0; i < sceneParams.floatingObjectCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        
        // Create materials with different effects
        let material;
        const materialType = Math.random();
        
        if (materialType < 0.3) {
            // Wireframe material
            material = new THREE.MeshBasicMaterial({ 
                color: 0x00f5ff,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });
        } else if (materialType < 0.6) {
            // Glass-like material
            material = new THREE.MeshPhysicalMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.3,
                roughness: 0,
                metalness: 0,
                clearcoat: 1,
                clearcoatRoughness: 0
            });
        } else {
            // Emissive material
            material = new THREE.MeshStandardMaterial({
                color: 0xec4899,
                emissive: 0xec4899,
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.8
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Random position
        mesh.position.set(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
        
        // Random rotation
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        // Random scale
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        
        scene.add(mesh);
        
        // Store for animation
        floatingObjects.push({
            mesh: mesh,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            originalPosition: mesh.position.clone(),
            floatAmplitude: Math.random() * 5 + 2,
            floatSpeed: Math.random() * 0.02 + 0.01
        });
    }
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Mouse movement
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetSection = button.getAttribute('data-section');
            if (targetSection) {
                e.preventDefault();
                scrollToSection(targetSection);
            }
        });
    });
    
    // Add click event for shooting star bursts
    document.addEventListener('click', (e) => {
        // Create a small cluster of stars on click
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createShootingStar();
            }, i * 100); // Stagger the stars
        }
    });
    
    // Add hover events for interactive elements to spawn more stars
    const interactiveElements = document.querySelectorAll('a, button, .skill-item, .project-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            // Create a few stars when hovering over interactive elements
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createShootingStar();
                }, i * 200);
            }
        });
    });
}

function onMouseMove(event) {
    mouse.x = (event.clientX - windowHalfX) / windowHalfX;
    mouse.y = (event.clientY - windowHalfY) / windowHalfY;
    
    // Update particle system mouse uniform
    // Removed reference to non-existent uniforms since we're using PointsMaterial
    // The mouse position is now used directly in the animation loop
}

function onTouchMove(event) {
    if (event.touches.length === 1) {
        mouse.x = (event.touches[0].clientX - windowHalfX) / windowHalfX;
        mouse.y = (event.touches[0].clientY - windowHalfY) / windowHalfY;
    }
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animate stats
                if (entry.target.classList.contains('hero-section')) {
                    animateStats();
                }
                
                // Animate skill levels
                if (entry.target.classList.contains('skills-section')) {
                    animateSkills();
                }
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
    
    // Observe cards
    document.querySelectorAll('.glass-card, .project-card, .skill-item').forEach(card => {
        observer.observe(card);
    });
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 16);
    });
}

function animateSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate');
            const level = item.querySelector('.skill-level');
            const skillLevel = level.getAttribute('data-level');
            level.style.setProperty('--skill-width', skillLevel + '%');
        }, index * 100);
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    // Check if form exists before adding event listeners
    if (form) {
        form.addEventListener('submit', (e) => {
            // Don't prevent default, let the form submit to Formspree
            // But we'll add visual feedback
            
            const submitButton = form.querySelector('.submit-button');
            const originalText = submitButton.innerHTML;
            
            submitButton.innerHTML = '<span>Sending...</span>';
            submitButton.disabled = true;
            
            // Add success handling
            form.addEventListener('submit', function handleSuccess() {
                // This will be called after successful submission
                setTimeout(() => {
                    submitButton.innerHTML = '<span>Message Sent! ✓</span>';
                    form.reset();
                    
                    setTimeout(() => {
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                    }, 2000);
                }, 1000);
                
                // Remove the event listener to prevent multiple calls
                form.removeEventListener('submit', handleSuccess);
            });
        });
        
        // Add click events for contact links
        const contactLinks = document.querySelectorAll('.contact-link');
        contactLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add visual feedback
                link.classList.add('clicked');
                setTimeout(() => {
                    link.classList.remove('clicked');
                }, 300);
            });
        });
    }
}

// ===== ANIMATION LOOP =====
function startMainAnimation() {
    animate();
}

function animate() {
    if (isLoading) return;
    
    animationId = requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Update particle system with enhanced cursor interaction
    if (window.particleSystem) {
        // Update particle colors based on time
        const colors = window.particleSystem.geometry.attributes.color.array;
        for (let i = 0; i < particles.length; i++) {
            // Animate colors over time for a subtle effect
            const colorIndex = i * 3;
            // This is a simplified color animation - you can enhance this further
        }
        
        // Animate particles with enhanced cursor interaction
        const positions = window.particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            
            // Update position
            positions[i * 3] += particle.velocity.x;
            positions[i * 3 + 1] += particle.velocity.y;
            positions[i * 3 + 2] += particle.velocity.z;
            
            // Enhanced mouse interaction with repulsion effect and reduced horizontal sensitivity
            if (cursorTrail.length > 0) {
                // Use the latest cursor position for stronger interaction
                const latestCursorPos = cursorTrail[cursorTrail.length - 1];
                const normalizedCursorX = (latestCursorPos.x - windowHalfX) / windowHalfX;
                const normalizedCursorY = (latestCursorPos.y - windowHalfY) / windowHalfY;
                
                // Calculate distance to cursor
                const dx = positions[i * 3] - (normalizedCursorX * 100 * sensitivity.horizontal);
                const dy = positions[i * 3 + 1] - (normalizedCursorY * 100 * sensitivity.vertical);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Apply repulsion force when cursor is close with reduced horizontal effect
                if (distance < 50) {
                    const force = (50 - distance) / 50;
                    positions[i * 3] += dx * force * 0.6 * sensitivity.particle;
                    positions[i * 3 + 1] += dy * force * 0.4 * sensitivity.particle;
                }
            }
            
            // Boundary check with wrapping
            if (Math.abs(positions[i * 3]) > 500) {
                positions[i * 3] = particle.originalPosition.x;
            }
            if (Math.abs(positions[i * 3 + 1]) > 500) {
                positions[i * 3 + 1] = particle.originalPosition.y;
            }
            if (Math.abs(positions[i * 3 + 2]) > 500) {
                positions[i * 3 + 2] = particle.originalPosition.z;
            }
        }
        window.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Update floating objects with enhanced cursor interaction and trailing effects
    floatingObjects.forEach((obj, index) => {
        // Rotation with enhanced effect
        obj.mesh.rotation.x += obj.rotationSpeed.x;
        obj.mesh.rotation.y += obj.rotationSpeed.y;
        obj.mesh.rotation.z += obj.rotationSpeed.z;
        
        // Floating motion
        obj.mesh.position.y = obj.originalPosition.y + 
            Math.sin(time * obj.floatSpeed) * obj.floatAmplitude;
        
        // Enhanced mouse interaction with trailing effect and reduced horizontal sensitivity
        if (cursorTrail.length > 0) {
            // Calculate influence based on distance to cursor
            let totalInfluenceX = 0;
            let totalInfluenceY = 0;
            let influenceCount = 0;
            
            // Check multiple points in the cursor trail for trailing effect
            for (let j = 0; j < cursorTrail.length; j++) {
                const trailPoint = cursorTrail[j];
                const normalizedCursorX = (trailPoint.x - windowHalfX) / windowHalfX;
                const normalizedCursorY = (trailPoint.y - windowHalfY) / windowHalfY;
                
                // Calculate distance to this trail point with reduced horizontal sensitivity
                const dx = obj.mesh.position.x - (normalizedCursorX * 100 * sensitivity.horizontal);
                const dy = obj.mesh.position.y - (normalizedCursorY * 100 * sensitivity.vertical);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Apply influence if within range
                if (distance < 100) {
                    const influence = (100 - distance) / 100;
                    totalInfluenceX += dx * influence * 0.025 * (j / cursorTrail.length) * sensitivity.object;
                    totalInfluenceY += dy * influence * 0.018 * (j / cursorTrail.length) * sensitivity.object;
                    influenceCount++;
                }
            }
            
            // Apply accumulated influence with reduced horizontal effect
            if (influenceCount > 0) {
                obj.mesh.position.x -= totalInfluenceX / influenceCount;
                obj.mesh.position.y -= totalInfluenceY / influenceCount;
            }
        }
        
        // Add subtle pulsing effect
        const pulse = Math.sin(time * 2 + index) * 0.05 + 1;
        obj.mesh.scale.set(pulse, pulse, pulse);
    });
    
    // Update shooting stars
    updateShootingStars();
    
    // Update dynamic lights to follow cursor with enhanced effect
    if (window.dynamicLights) {
        // First light follows cursor with smooth interpolation and reduced horizontal sensitivity
        if (cursorTrail.length > 0) {
            const latestCursorPos = cursorTrail[cursorTrail.length - 1];
            const targetX = (latestCursorPos.x - windowHalfX) * 0.6 * sensitivity.horizontal;
            const targetY = (latestCursorPos.y - windowHalfY) * 0.5 * sensitivity.vertical;
            
            window.dynamicLights[0].position.x += (targetX - window.dynamicLights[0].position.x) * 0.06;
            window.dynamicLights[0].position.y += (targetY - window.dynamicLights[0].position.y) * 0.05;
        }
        
        // Second light has opposite movement for contrast
        window.dynamicLights[1].position.x = Math.sin(time * 0.7) * -50;
        window.dynamicLights[1].position.z = Math.cos(time * 0.4) * 50;
        
        // Color animation with enhanced effect
        window.dynamicLights[0].color.setHSL(
            (Math.sin(time * 0.2) + 1) * 0.5,
            1,
            0.5
        );
        window.dynamicLights[1].color.setHSL(
            (Math.sin(time * 0.3 + Math.PI) + 1) * 0.5,
            1,
            0.5
        );
    }
    
    // Camera movement with enhanced cursor tracking and reduced horizontal sensitivity
    if (cursorTrail.length > 0) {
        const latestCursorPos = cursorTrail[cursorTrail.length - 1];
        const targetX = (latestCursorPos.x - windowHalfX) * 0.06 * sensitivity.horizontal;
        const targetY = (latestCursorPos.y - windowHalfY) * 0.05 * sensitivity.vertical;
        
        camera.position.x += (targetX - camera.position.x) * sceneParams.cameraSpeed * 1.3;
        camera.position.y += (-targetY - camera.position.y) * sceneParams.cameraSpeed;
    }
    camera.lookAt(scene.position);
    
    // Render
    renderer.render(scene, camera);
}

// ===== UTILITY FUNCTIONS =====

// ===== ADVANCED 3D FEATURES =====
function initAdvancedFeatures() {
    // Add section-specific 3D effects
    initSectionEffects();
    
    // Add floating text elements
    initFloatingText();
}

function initSectionEffects() {
    // Add particles specific to each section
    const sections = document.querySelectorAll('.section');
    
    sections.forEach((section, index) => {
        const sectionParticles = createSectionParticles(index);
        if (sectionParticles) {
            scene.add(sectionParticles);
        }
    });
}

function createSectionParticles(sectionIndex) {
    const colors = [
        0x00f5ff, // Cyan for hero
        0x8b5cf6, // Purple for about
        0xec4899, // Pink for skills
        0x39ff14, // Green for projects
        0xff6b6b  // Red for contact
    ];
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(100 * 3);
    
    for (let i = 0; i < 100; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200 + (sectionIndex * 100);
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: colors[sectionIndex % colors.length],
        size: 2,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
}

function initFloatingText() {
    // Create 3D text elements for key words
    const loader = new THREE.FontLoader();
    
    // Since we can't load external fonts, we'll create simple text sprites
    createTextSprite('Code', new THREE.Vector3(-50, 20, -20), 0x00f5ff);
    createTextSprite('Create', new THREE.Vector3(50, 10, -30), 0x8b5cf6);
    createTextSprite('Innovate', new THREE.Vector3(-30, -20, -25), 0xec4899);
}

function createTextSprite(text, position, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = 'Bold 24px Arial';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.8
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(20, 5, 1);
    
    scene.add(sprite);
    
    // Add to floating objects for animation
    floatingObjects.push({
        mesh: sprite,
        rotationSpeed: { x: 0, y: 0.01, z: 0 },
        originalPosition: position.clone(),
        floatAmplitude: 3,
        floatSpeed: 0.02
    });
}

// ===== SHOOTING STARS SYSTEM =====
function initShootingStars() {
    // Start continuous shooting star spawning after 1 second
    setTimeout(() => {
        starSpawnTimer = setInterval(() => {
            createShootingStar();
        }, starSpawnInterval); // Spawn every 3 seconds as per specification
    }, 1000); // Start after 1 second
}

function createShootingStar() {
    // Create a group to hold the star and its trail
    const starGroup = new THREE.Group();
    
    // Define color palette for stars (matching portfolio theme)
    const colors = [
        new THREE.Color(0x00f5ff), // Cyan from portfolio
        new THREE.Color(0x8b5cf6), // Purple from portfolio
        new THREE.Color(0xec4899), // Pink from portfolio
        new THREE.Color(0x39ff14)  // Neon green from portfolio
    ];
    
    // Random color from portfolio palette
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Create the main star (bright core)
    const starGeometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
    });
    
    const star = new THREE.Mesh(starGeometry, starMaterial);
    
    // Position the star deep in the Z-axis (behind the scene)
    star.position.set(
        (Math.random() - 0.5) * 200,  // Random X position
        (Math.random() - 0.5) * 200,  // Random Y position
        -300 - Math.random() * 200    // Deep in Z-axis
    );
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.scale.set(1.5, 1.5, 1.5);
    
    // Add to group
    starGroup.add(star);
    starGroup.add(glow);
    
    // Create trail particles
    const trailParticles = [];
    const trailCount = Math.floor(Math.random() * 10) + 5; // 5-15 trail particles
    
    for (let i = 0; i < trailCount; i++) {
        const trailGeometry = new THREE.SphereGeometry(Math.random() * 0.1 + 0.05, 8, 8);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7 - (i / trailCount) * 0.5, // Fade out along the trail
            blending: THREE.AdditiveBlending
        });
        
        const trailParticle = new THREE.Mesh(trailGeometry, trailMaterial);
        
        // Position trail particles behind the star
        trailParticle.position.z = -i * 5;
        
        starGroup.add(trailParticle);
        trailParticles.push(trailParticle);
    }
    
    // Add to scene
    scene.add(starGroup);
    
    // Store star data for animation
    const starData = {
        group: starGroup,
        star: star,
        glow: glow,
        trailParticles: trailParticles,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,  // Random X velocity
            (Math.random() - 0.5) * 0.5,  // Random Y velocity
            Math.random() * 0.8 + 0.4     // Forward Z velocity (toward camera)
        ),
        rotation: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        ),
        startTime: clock.getElapsedTime(),
        lifespan: 2, // 2 seconds as per specification
        initialPosition: starGroup.position.clone()
    };
    
    shootingStars.push(starData);
}

function updateShootingStars() {
    const time = clock.getElapsedTime();
    
    // Update each shooting star
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        const age = time - star.startTime;
        const progress = age / star.lifespan;
        
        // Remove stars that have exceeded their lifespan
        if (progress >= 1) {
            scene.remove(star.group);
            shootingStars.splice(i, 1);
            continue;
        }
        
        // Update position with curved trajectory
        star.group.position.x += star.velocity.x;
        star.group.position.y += star.velocity.y;
        star.group.position.z += star.velocity.z;
        
        // Add gentle arcing motion
        star.group.position.x += Math.sin(age * 2) * 0.05;
        star.group.position.y += Math.cos(age * 1.5) * 0.03;
        
        // Rotate the star group
        star.group.rotation.x += star.rotation.x;
        star.group.rotation.y += star.rotation.y;
        star.group.rotation.z += star.rotation.z;
        
        // Update opacity for fade in/out effect
        let opacity;
        if (progress < 0.2) {
            // Fade in (first 20% of lifespan)
            opacity = progress / 0.2;
        } else if (progress > 0.8) {
            // Fade out (last 20% of lifespan)
            opacity = 1 - ((progress - 0.8) / 0.2);
        } else {
            // Full opacity in middle
            opacity = 1;
        }
        
        // Apply opacity to all elements
        star.star.material.opacity = opacity;
        star.glow.material.opacity = opacity * 0.4;
        
        // Update trail particles
        for (let j = 0; j < star.trailParticles.length; j++) {
            const trailParticle = star.trailParticles[j];
            // Fade trail particles
            trailParticle.material.opacity = opacity * (0.7 - (j / star.trailParticles.length) * 0.5);
            
            // Position trail particles relative to star movement
            trailParticle.position.x = -j * star.velocity.x * 0.5;
            trailParticle.position.y = -j * star.velocity.y * 0.5;
            trailParticle.position.z = -j * 5;
        }
        
        // Mouse influence - subtle attraction/repulsion
        if (cursorTrail.length > 0) {
            const latestCursorPos = cursorTrail[cursorTrail.length - 1];
            const normalizedCursorX = (latestCursorPos.x - windowHalfX) / windowHalfX;
            const normalizedCursorY = (latestCursorPos.y - windowHalfY) / windowHalfY;
            
            // Calculate distance to cursor
            const dx = star.group.position.x - (normalizedCursorX * 50);
            const dy = star.group.position.y - (normalizedCursorY * 50);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply subtle influence when cursor is close
            if (distance < 100) {
                const influence = (100 - distance) / 100 * 0.02;
                star.group.position.x += dx * influence;
                star.group.position.y += dy * influence;
            }
        }
    }
}

// ===== PERFORMANCE MONITORING =====
function initPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function checkPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
            
            // Adjust quality based on performance
            if (fps < 30) {
                // Reduce particle count
                sceneParams.particleCount = Math.max(500, sceneParams.particleCount * 0.8);
                sceneParams.floatingObjectCount = Math.max(10, sceneParams.floatingObjectCount * 0.8);
            }
        }
        
        performanceMonitoringTimer = requestAnimationFrame(checkPerformance);
    }
    
    performanceMonitoringTimer = requestAnimationFrame(checkPerformance);
}

// Initialize performance monitoring
setTimeout(() => {
    initPerformanceMonitoring();
}, 3000);

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', e.error);
});

// Handle WebGL context loss
if (renderer) {
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        console.warn('WebGL context lost. Attempting to restore...');
        cancelAnimationFrame(animationId);
    });
    
    renderer.domElement.addEventListener('webglcontextrestored', () => {
        console.log('WebGL context restored.');
        initThreeJS();
        startMainAnimation();
    });
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Clear all timeouts and intervals
    if (scrollController.scrollTimeout) {
        clearTimeout(scrollController.scrollTimeout);
    }
    
    if (starSpawnTimer) {
        clearInterval(starSpawnTimer);
    }
    
    // Clear performance monitoring timer
    if (performanceMonitoringTimer) {
        cancelAnimationFrame(performanceMonitoringTimer);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    // Dispose geometries and materials
    scene.traverse((object) => {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    });
    
    // Remove event listeners to prevent memory leaks
    // Note: For a more comprehensive solution, we would store references to all event listeners
    // and remove them explicitly. For now, we rely on the browser's garbage collection
    // when the page is unloaded.
});
