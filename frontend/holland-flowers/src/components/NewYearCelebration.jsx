import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewYearCelebration.css';

const NewYearCelebration = () => {
  const [showFireworks, setShowFireworks] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if celebration was already shown in this session
    const celebrationShown = sessionStorage.getItem('newYearCelebrationShown');
    
    if (!celebrationShown) {
      // Start fireworks immediately
      setShowFireworks(true);
      document.body.style.overflow = 'hidden';
      
      // After 4 seconds, hide fireworks and show popup
      const timer = setTimeout(() => {
        setShowFireworks(false);
        setShowPopup(true);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Fireworks Animation
  useEffect(() => {
    if (!showFireworks || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Firework particles
    const particles = [];
    const fireworks = [];
    
    // Brand colors for fireworks
    const colors = [
      '#c08b8b', // Pink
      '#d4a5a5', // Light pink
      '#FFD700', // Gold
      '#FFA500', // Orange
      '#FF69B4', // Hot pink
      '#ffffff', // White
      '#f8e8e8', // Soft pink
    ];

    class Particle {
      constructor(x, y, color, velocity, size = 2) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.size = size;
        this.gravity = 0.02;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }

      update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
      }
    }

    class Firework {
      constructor(x, targetY) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = targetY;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.velocity = { x: 0, y: -8 - Math.random() * 4 };
        this.trail = [];
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          ctx.beginPath();
          ctx.arc(t.x, t.y, 2 * (i / this.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = i / this.trail.length * 0.5;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        
        this.velocity.y += 0.05;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      }

      shouldExplode() {
        return this.velocity.y >= 0 || this.y <= this.targetY;
      }
    }

    const createExplosion = (x, y, color) => {
      const particleCount = 80 + Math.floor(Math.random() * 40);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 4 + 2;
        particles.push(new Particle(
          x, y, color,
          {
            x: Math.cos(angle) * speed + (Math.random() - 0.5),
            y: Math.sin(angle) * speed + (Math.random() - 0.5)
          },
          Math.random() * 2 + 1
        ));
      }
      
      // Add sparkles
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 3;
        particles.push(new Particle(
          x, y, '#ffffff',
          {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          },
          1
        ));
      }
    };

    let frameCount = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Launch new fireworks
      frameCount++;
      if (frameCount % 30 === 0) {
        const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        const targetY = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
        fireworks.push(new Firework(x, targetY));
      }

      // Update and draw fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].draw();
        fireworks[i].update();
        
        if (fireworks[i].shouldExplode()) {
          createExplosion(fireworks[i].x, fireworks[i].y, fireworks[i].color);
          fireworks.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        particles[i].update();
        
        if (particles[i].alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showFireworks]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
      document.body.style.overflow = '';
      sessionStorage.setItem('newYearCelebrationShown', 'true');
    }, 300);
  };

  const handleViewCollection = () => {
    sessionStorage.setItem('newYearCelebrationShown', 'true');
    document.body.style.overflow = '';
    setShowPopup(false);
    navigate('/bouquets');
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('newyear-popup-overlay')) {
      handleClose();
    }
  };

  // Don't render anything if neither fireworks nor popup should show
  if (!showFireworks && !showPopup) return null;

  return (
    <>
      {/* Fireworks Screen */}
      {showFireworks && (
        <div className="fireworks-container">
          <canvas ref={canvasRef} className="fireworks-canvas" />
          <div className="fireworks-text">
            <div className="fireworks-sparkle">✨</div>
            <h1 className="fireworks-title">Happy New Year</h1>
            <div className="fireworks-year">2026</div>
            <div className="fireworks-brand">
              <img src="/Holland Logo.png" alt="Holland Flowers" className="fireworks-logo" />
            </div>
            <div className="fireworks-sparkle">✨</div>
          </div>
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div 
          className={`newyear-popup-overlay ${isClosing ? 'closing' : ''}`}
          onClick={handleOverlayClick}
        >
          <div className={`newyear-popup-container ${isClosing ? 'closing' : ''}`}>
            {/* Close Button */}
            <button className="newyear-popup-close" onClick={handleClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Hero Image */}
            <div className="newyear-popup-hero">
              <img 
                src="/new year logo.png" 
                alt="Happy New Year 2026" 
                className="newyear-hero-image"
              />
              <div className="newyear-hero-overlay"></div>
            </div>

            {/* Content */}
            <div className="newyear-popup-content">
              <span className="newyear-popup-badge">✦ New Year Special ✦</span>
              
              <h2 className="newyear-popup-title">Welcome 2026</h2>
              
              <p className="newyear-popup-subtitle">
                Start the year with beautiful blooms. Explore our exclusive New Year flower collection.
              </p>

              {/* Features */}
              <div className="newyear-popup-features">
                <div className="newyear-feature">
                  <span className="newyear-feature-icon">🌸</span>
                  <span className="newyear-feature-text">Flowers</span>
                </div>
                <div className="newyear-feature">
                  <span className="newyear-feature-icon">💐</span>
                  <span className="newyear-feature-text">Bouquets</span>
                </div>
                <div className="newyear-feature">
                  <span className="newyear-feature-icon">🌺</span>
                  <span className="newyear-feature-text">Arrangements</span>
                </div>
              </div>

              <div className="newyear-popup-buttons">
                <button className="newyear-btn-primary" onClick={handleViewCollection}>
                  View Collection
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                
                <button className="newyear-btn-secondary" onClick={handleClose}>
                  Continue Shopping
                </button>
              </div>

              {/* Footer */}
              <div className="newyear-popup-footer">
                <span>✨ Happy New Year from Holland Flowers ✨</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewYearCelebration;