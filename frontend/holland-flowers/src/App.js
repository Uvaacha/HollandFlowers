import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './components/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AdminApp from './admin/AdminApp';
import ImageSlideshow from './components/ImageSlideshow';
import AddOns from './components/AddOns';
import AcrylicToppers from './components/AcrylicToppers';
import HeliumBalloons from './components/HeliumBalloons';
import CrownForHead from './components/CrownForHead';
import PickForYou from './components/PickForYou';
import Offers50 from './components/Offers50';
import Combos from './components/Combos';
import FlowersWithPerfume from './components/FlowersWithPerfume';
import FlowersWithChocolates from './components/FlowersWithChocolates';
import Bouquets from './components/Bouquets';
import HandBouquets from './components/HandBouquets';
import OrchidPlants from './components/OrchidPlants';
import LiliumBouquets from './components/LiliumBouquets';
import BirthdayBouquets from './components/BirthdayBouquets';
import YellowRoseBouquets from './components/YellowRoseBouquets';
import GrandBouquets from './components/GrandBouquets';
import ValentineSpecial from './components/ValentineSpecial';
import MothersDaySpecial from './components/MothersDaySpecial';
import RamadanSpecial from './components/RamadanSpecial';
import EidCollection from './components/EidCollection';
import TulipsArrangement from './components/TulipsArrangement';
import LiliumArrangement from './components/LiliumArrangement';
import HollandSmallArrangements from './components/HollandSmallArrangements';
import VaseArrangement from './components/VaseArrangement';
import BabyRoses from './components/BabyRoses';
import SingleFlower from './components/SingleFlower';
import HollandStyle from './components/HollandStyle';
import RosesPetals from './components/RosesPetals';
import FlowersVase from './components/FlowersVase';
import CylinderVases from './components/CylinderVases';
import FlowersWithMabkhar from './components/FlowersWithMabkhar';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import WhatsAppButton from './components/WhatsAppButton';
import Account from './components/Account';
import productService from './services/productService';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import OrderHistory from './components/OrderHistory';
import OrderDetail from './components/OrderDetail';
import './App.css';

// ============================================
// CUSTOM SVG ICONS COMPONENT
// ============================================
const Icons = {
  DeliveryTruck: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 16H8C6.89543 16 6 16.8954 6 18V40C6 41.1046 6.89543 42 8 42H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M40 24H50L58 32V42H40V24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18" cy="46" r="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="48" cy="46" r="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M23 46H43" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 46H13" stroke="currentColor" strokeWidth="2"/>
      <path d="M53 46H58V42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 28H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 34H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  FreshFlower: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 56V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 32C32 32 24 36 20 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 32C32 32 40 36 44 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="32" cy="22" rx="10" ry="12" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 10C32 10 38 14 38 22C38 22 32 18 32 22C32 18 26 22 26 22C26 14 32 10 32 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M22 22C22 22 26 18 32 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M42 22C42 22 38 18 32 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="20" r="3" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  
  Clock: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2"/>
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      <path d="M32 16V32L42 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="3" fill="currentColor"/>
      <path d="M32 10V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 52V54" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 32H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M52 32H54" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  QualityBadge: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6L38.5 12.5H48V21.5L54.5 28L48 34.5V43.5H38.5L32 50L25.5 43.5H16V34.5L9.5 28L16 21.5V12.5H25.5L32 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="32" cy="28" r="12" stroke="currentColor" strokeWidth="2"/>
      <path d="M26 28L30 32L38 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 50V58" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M26 56L32 58L38 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Bouquet: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 58V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M26 58L32 38L38 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="32" cy="26" rx="8" ry="10" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="22" cy="22" rx="6" ry="8" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="42" cy="22" rx="6" ry="8" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="26" cy="14" rx="5" ry="6" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="38" cy="14" rx="5" ry="6" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 38H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  Rose: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 58V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 34C24 34 18 28 18 20C18 12 24 6 32 6C40 6 46 12 46 20C46 28 40 34 32 34Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 6C32 6 28 10 28 16C28 22 32 26 32 26C32 26 36 22 36 16C36 10 32 6 32 6Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M26 42L20 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38 42L44 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  GiftBox: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="24" width="44" height="32" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="8" y="16" width="48" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 16V56" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 21H56" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 16C32 16 24 16 20 10C16 4 22 2 26 6C30 10 32 16 32 16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M32 16C32 16 40 16 44 10C48 4 42 2 38 6C34 10 32 16 32 16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  
  Balloon: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="26" cy="24" rx="12" ry="16" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="42" cy="22" rx="10" ry="14" stroke="currentColor" strokeWidth="2"/>
      <path d="M26 40L26 48L30 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M42 36L42 48L38 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 52C30 52 32 56 34 56C36 56 38 52 38 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M34 56V60" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  Heart: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 56L14 36C8 30 8 20 14 14C20 8 30 8 32 18C34 8 44 8 50 14C56 20 56 30 50 36L32 56Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  
  Cake: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="32" width="40" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 44H52" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 38C16 36 20 40 24 38C28 36 32 40 36 38C40 36 44 40 48 38C50 37 51 36.5 52 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="18" y="24" width="28" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="26" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="32" cy="14" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="38" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  
  MotherHeart: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 52L16 34C11 29 11 21 16 16C21 11 29 11 32 19C35 11 43 11 48 16C53 21 53 29 48 34L32 52Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="32" cy="32" r="2" fill="currentColor"/>
    </svg>
  ),
  
  Ring: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="38" rx="18" ry="16" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="32" cy="38" rx="12" ry="10" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M26 24L32 10L38 24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="32" cy="10" r="4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  
  Crescent: () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 12C28 12 18 22 18 34C18 46 28 56 40 56C32 56 24 48 24 34C24 20 32 12 40 12Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M46 8L48 14L54 14L50 18L52 24L46 20L40 24L42 18L38 14L44 14L46 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="50" cy="36" r="2" fill="currentColor"/>
      <circle cx="46" cy="46" r="1.5" fill="currentColor"/>
    </svg>
  ),
};


// ============================================
// PRODUCT CARD COMPONENT (Separate for Add to Cart)
// ============================================
const ProductCard = ({ 
  product, 
  currentLang, 
  badgeType,
  cardClassName = 'carousel-product-card'
}) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Helper functions
  const getProductName = (product) => {
    if (currentLang === 'ar') {
      return product.productNameAr || product.nameAr || product.productName || product.name || 'Unknown';
    }
    return product.productName || product.nameEn || product.name || 'Unknown';
  };

  // Get category name and format it nicely
  // Converts "FLOWERS & CHOCOLATES" → "Flowers & Chocolates"
  const getCategoryName = (product) => {
    let categoryName = '';
    if (currentLang === 'ar') {
      categoryName = product.categoryNameAr || product.categoryName || '';
    } else {
      categoryName = product.categoryName || '';
    }
    
    // Format: "FLOWERS & CHOCOLATES" → "Flowers & Chocolates"
    if (categoryName) {
      return categoryName
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return '';
  };

  // Get default description based on category
  const getDefaultDescription = (product) => {
    const category = (product.categoryName || '').toLowerCase();
    
    // Define default descriptions for each category
    const descriptions = {
      en: {
        'flowers & chocolates': 'Flower bouquet with Ferrero Rocher chocolates',
        'flowers with perfume': 'Flower bouquet with Supreme Bouquet 50ml perfume',
        'flowers with chocolates': 'Flower bouquet with premium chocolates',
        'bouquets': 'Fresh hand-tied flower bouquet',
        'hand bouquets': 'Elegant hand-tied bouquet',
        'roses': 'Premium fresh roses arrangement',
        'tulips': 'Beautiful tulips arrangement',
        'orchids': 'Exotic orchid arrangement',
        'vase arrangement': 'Stunning vase flower arrangement',
        'gift combos': 'Perfect flower gift combo',
        'birthday': 'Special birthday flower arrangement',
        'valentine': 'Romantic Valentine flowers',
        'wedding': 'Elegant wedding flowers',
        'default': 'Beautiful fresh flower arrangement'
      },
      ar: {
        'flowers & chocolates': 'باقة زهور مع شوكولاتة فيريرو روشيه',
        'flowers with perfume': 'باقة زهور مع عطر سوبريم بوكيه 50 مل',
        'flowers with chocolates': 'باقة زهور مع شوكولاتة فاخرة',
        'bouquets': 'باقة زهور طازجة مربوطة يدوياً',
        'hand bouquets': 'باقة يدوية أنيقة',
        'roses': 'تنسيق ورود طازجة فاخرة',
        'tulips': 'تنسيق توليب جميل',
        'orchids': 'تنسيق أوركيد فاخر',
        'vase arrangement': 'تنسيق زهور في مزهرية رائعة',
        'gift combos': 'كومبو هدايا زهور مثالي',
        'birthday': 'تنسيق زهور لعيد ميلاد مميز',
        'valentine': 'زهور رومانسية لعيد الحب',
        'wedding': 'زهور زفاف أنيقة',
        'default': 'تنسيق زهور طازجة جميلة'
      }
    };

    const lang = currentLang === 'ar' ? 'ar' : 'en';
    
    // Find matching category description
    for (const [key, value] of Object.entries(descriptions[lang])) {
      if (category.includes(key) || key.includes(category)) {
        return value;
      }
    }
    
    return descriptions[lang]['default'];
  };

  const getProductImage = (product) => {
    return product.imageUrl || product.primaryImageUrl || product.image || '/images/placeholder.webp';
  };

  const getFinalPrice = (product) => {
    return product.finalPrice || product.salePrice || product.price || product.actualPrice || 0;
  };

  const getOriginalPrice = (product) => {
    return product.actualPrice || product.originalPrice || product.price || 0;
  };

  const getProductSlug = (product) => {
    return product.productId || product.sku || product.slug || product.id;
  };

  const hasDiscount = (product) => {
    const final = getFinalPrice(product);
    const original = getOriginalPrice(product);
    return original > final && final > 0;
  };

  const getDiscountPercent = (product) => {
    const final = getFinalPrice(product);
    const original = getOriginalPrice(product);
    if (original > final && final > 0) {
      return Math.round((1 - final / original) * 100);
    }
    return 0;
  };

  const productName = getProductName(product);
  const categoryName = getCategoryName(product);
  const productDescription = getDefaultDescription(product);
  const productImage = getProductImage(product);
  const finalPrice = getFinalPrice(product);
  const originalPrice = getOriginalPrice(product);
  const productSlug = getProductSlug(product);
  const showDiscount = hasDiscount(product);
  const discountPercent = getDiscountPercent(product);

  // Handle Add to Cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    addToCart({
      productId: product.productId || product.id,
      name: productName,
      nameAr: product.productNameAr || product.nameAr || productName,
      price: finalPrice,
      image: productImage,
      quantity: 1
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  return (
    <div className={cardClassName}>
      {/* Category Badge - Top Left */}
      {categoryName && (
        <span className="product-category-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          {categoryName}
        </span>
      )}

      {/* Bestseller/New Badge - Top Right (if no discount) */}
      {badgeType === 'bestseller' && !showDiscount && (
        <span className="product-type-badge bestseller-badge-tag">
          {currentLang === 'ar' ? 'الأكثر مبيعاً' : 'BESTSELLER'}
        </span>
      )}
      {badgeType === 'new' && !showDiscount && (
        <span className="product-type-badge new-arrival-badge-tag">
          {currentLang === 'ar' ? 'جديد' : 'NEW'}
        </span>
      )}
      
      {/* Discount Badge - Top Right */}
      {showDiscount && (
        <span className="carousel-discount-badge">
          {discountPercent}% {currentLang === 'ar' ? 'خصم' : 'OFF'}
        </span>
      )}
      
      {/* Product Link - Image Section */}
      <Link to={`/product/${productSlug}`} className="carousel-image-link">
        <div className="carousel-image-wrapper">
          <img 
            src={productImage} 
            alt={productName} 
            className="carousel-product-image"
            onError={(e) => { e.target.src = '/images/placeholder.webp'; }}
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="carousel-product-info">
        <Link to={`/product/${productSlug}`} className="product-info-link">
          <h3 className="carousel-product-name">{productName}</h3>
          <p className="carousel-product-description">{productDescription}</p>
        </Link>

        {/* Price Row with Add to Cart */}
        <div className="carousel-price-row">
          <div className="carousel-price-wrapper">
            {showDiscount && (
              <p className="carousel-original-price">
                {currentLang === 'ar' ? 'د.ك' : 'KD'} {parseFloat(originalPrice).toFixed(3)}
              </p>
            )}
            <p className="carousel-product-price">
              {currentLang === 'ar' ? 'د.ك' : 'KD'} {parseFloat(finalPrice).toFixed(3)}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button 
            className={`carousel-add-to-cart ${isAdding ? 'adding' : ''}`}
            onClick={handleAddToCart}
            aria-label={currentLang === 'ar' ? 'أضف للسلة' : 'Add to cart'}
          >
            {isAdding ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// ============================================
// REUSABLE PRODUCT CAROUSEL COMPONENT
// ============================================
const ProductCarousel = ({ 
  products, 
  loading, 
  currentLang, 
  title, 
  titleAr, 
  subtitle, 
  subtitleAr,
  showTag = false,
  tagText,
  tagTextAr,
  cardClassName = 'carousel-product-card',
  badgeType = null
}) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        carousel.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [products]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="product-carousel-section">
        <div className="container">
          <div className="section-header">
            {showTag && tagText && (
              <span className="section-tag">{currentLang === 'ar' ? tagTextAr : tagText}</span>
            )}
            <h2 className="section-title">{currentLang === 'ar' ? titleAr : title}</h2>
            <div className="section-underline"></div>
            {subtitle && (
              <p className="section-subtitle">{currentLang === 'ar' ? subtitleAr : subtitle}</p>
            )}
          </div>
          <div className="carousel-loading">
            <div className="loading-spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="product-carousel-section">
      {/* Floating Decorations */}
      <div className="carousel-decorations">
        <div className="floating-item floating-flower-1">🌸</div>
        <div className="floating-item floating-flower-2">🌷</div>
        <div className="floating-item floating-flower-3">🌹</div>
        <div className="floating-item floating-flower-4">💐</div>
        <div className="floating-item floating-cake-1">🎂</div>
        <div className="floating-item floating-chocolate-1">🍫</div>
        <div className="floating-item floating-gift-1">🎁</div>
        <div className="floating-item floating-heart-1">💝</div>
        <div className="floating-item floating-flower-5">🌺</div>
        <div className="floating-item floating-cake-2">🧁</div>
      </div>

      <div className="container">
        <div className="section-header">
          {showTag && tagText && (
            <span className="section-tag">{currentLang === 'ar' ? tagTextAr : tagText}</span>
          )}
          <h2 className="section-title">{currentLang === 'ar' ? titleAr : title}</h2>
          <div className="section-underline"></div>
          {subtitle && (
            <p className="section-subtitle">{currentLang === 'ar' ? subtitleAr : subtitle}</p>
          )}
        </div>
        
        <div className="product-carousel-wrapper">
          {canScrollLeft && (
            <button 
              className="carousel-arrow carousel-arrow-left" 
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}

          <div className="product-carousel" ref={carouselRef}>
            {products.map((product) => (
              <ProductCard
                key={product.productId || product.id}
                product={product}
                currentLang={currentLang}
                badgeType={badgeType}
                cardClassName={cardClassName}
              />
            ))}
          </div>

          {canScrollRight && (
            <button 
              className="carousel-arrow carousel-arrow-right" 
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>

        <div className="carousel-scroll-hint">
          <span>{currentLang === 'ar' ? '← اسحب للتصفح →' : '← Swipe to browse →'}</span>
        </div>
      </div>
    </section>
  );
};

// ============================================
// FEATURED PRODUCTS CAROUSEL
// ============================================
const FeaturedProductsCarousel = ({ currentLang }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getFeaturedProducts({ size: 20 });
        
        let productsData = [];
        if (response.success && response.data) {
          productsData = response.data.content || response.data || [];
        }
        
        const activeProducts = productsData.filter(p => p.isActive !== false);
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductCarousel
      products={products}
      loading={loading}
      currentLang={currentLang}
      title="Our Featured Products"
      titleAr="منتجاتنا المميزة"
      badgeType="featured"
    />
  );
};

// ============================================
// BEST SELLERS CAROUSEL
// ============================================
const BestSellersCarousel = ({ currentLang }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getBestSellers({ size: 20 });
        
        let productsData = [];
        if (response.success && response.data) {
          productsData = response.data.content || response.data || [];
        }
        
        const activeProducts = productsData.filter(p => p.isActive !== false);
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductCarousel
      products={products}
      loading={loading}
      currentLang={currentLang}
      title="Best Sellers"
      titleAr="الأكثر مبيعاً"
      subtitle="Customer favorites you'll love"
      subtitleAr="المنتجات المفضلة لدى عملائنا"
      badgeType="bestseller"
    />
  );
};

// ============================================
// NEW ARRIVALS CAROUSEL
// ============================================
const NewArrivalsCarousel = ({ currentLang }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getNewArrivals({ size: 20 });
        
        let productsData = [];
        if (response.success && response.data) {
          productsData = response.data.content || response.data || [];
        }
        
        const activeProducts = productsData.filter(p => p.isActive !== false);
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductCarousel
      products={products}
      loading={loading}
      currentLang={currentLang}
      title="New Arrivals"
      titleAr="الوصولات الجديدة"
      showTag={true}
      tagText="✨ Just Arrived"
      tagTextAr="✨ وصل حديثاً"
      badgeType="new"
    />
  );
};

// ============================================
// HOME PAGE COMPONENT
// ============================================
const HomePage = ({ currentLang }) => {
  const occasions = [
    { 
      id: 1, 
      name: currentLang === 'ar' ? 'عيد الحب' : "Valentine's Day", 
      image: '/images/valentine-special/Love Red Bouquet 50.PNG',
      link: '/valentine-special', 
      color: '#D4A5A5',
      icon: Icons.Heart
    },
    { 
      id: 2, 
      name: currentLang === 'ar' ? 'عيد ميلاد' : 'Birthday', 
      image: '/images/birthday-bouquets/Happy Peach Bouquet.webp',
      link: '/birthday-bouquet', 
      color: '#C9B8D4',
      icon: Icons.Cake
    },
    { 
      id: 3, 
      name: currentLang === 'ar' ? 'عيد الأم' : "Mother's Day", 
      image: '/images/mothers-day/100 Roses With Gift.webp',
      link: '/mothers-day', 
      color: '#E8C9B8',
      icon: Icons.MotherHeart
    },
    { 
      id: 4, 
      name: currentLang === 'ar' ? 'زفاف' : 'Wedding', 
      image: '/images/bouquets/Red Rose Flowers.webp',
      link: '/grand-bouquet', 
      color: '#D4C4A8',
      icon: Icons.Ring
    },
    { 
      id: 5, 
      name: currentLang === 'ar' ? 'العيد' : 'Eid', 
      image: '/images/ramadan/Ramadan 03.webp',
      link: '/eid-collection', 
      color: '#B8D4BE',
      icon: Icons.Crescent
    },
  ];

  const features = [
    { 
      id: 1, 
      Icon: Icons.DeliveryTruck, 
      titleEn: 'Fast Delivery', 
      titleAr: 'توصيل سريع', 
      descEn: 'Delivery across all of Kuwait', 
      descAr: 'توصيل في جميع أنحاء الكويت',
      color: '#D4A5A5'
    },
    { 
      id: 2, 
      Icon: Icons.FreshFlower, 
      titleEn: 'Fresh Flowers', 
      titleAr: 'زهور طازجة', 
      descEn: 'Handpicked fresh flowers daily', 
      descAr: 'زهور طازجة مختارة يدوياً يومياً',
      color: '#B8D4BE'
    },
    { 
      id: 3, 
      Icon: Icons.Clock, 
      titleEn: 'Same Day Delivery', 
      titleAr: 'توصيل في نفس اليوم', 
      descEn: 'Order before 9 PM for same day', 
      descAr: 'اطلب قبل 9 مساءً للتوصيل نفس اليوم',
      color: '#C9B8D4'
    },
    { 
      id: 4, 
      Icon: Icons.QualityBadge, 
      titleEn: 'Quality Guarantee', 
      titleAr: 'ضمان الجودة', 
      descEn: '100% satisfaction guaranteed', 
      descAr: 'ضمان الرضا 100٪',
      color: '#E8C9B8'
    },
  ];

  const categories = [
    { 
      id: 1, 
      Icon: Icons.Bouquet, 
      nameEn: 'Flower Bouquets', 
      nameAr: 'باقات الزهور', 
      link: '/flower-bouquets',
      color: '#D4A5A5'
    },
    { 
      id: 2, 
      Icon: Icons.Rose, 
      nameEn: 'Hand Bouquets', 
      nameAr: 'باقات يدوية', 
      link: '/hand-bouquets',
      color: '#E8C9B8'
    },
    { 
      id: 3, 
      Icon: Icons.GiftBox, 
      nameEn: 'Gift Combos', 
      nameAr: 'كومبو هدايا', 
      link: '/combos',
      color: '#C9B8D4'
    },
    { 
      id: 4, 
      Icon: Icons.Balloon, 
      nameEn: 'Add-Ons', 
      nameAr: 'إضافات', 
      link: '/add-ons',
      color: '#B8D4BE'
    },
  ];

  const testimonials = [
    { id: 1, name: currentLang === 'ar' ? 'سارة أحمد' : 'Sarah Ahmed', text: currentLang === 'ar' ? 'زهور جميلة جداً وتوصيل سريع! أنصح بشدة' : 'Beautiful flowers and fast delivery! Highly recommended', rating: 5, image: '/images/testimonials/user1.jpg' },
    { id: 2, name: currentLang === 'ar' ? 'محمد علي' : 'Mohammed Ali', text: currentLang === 'ar' ? 'أفضل متجر زهور في الكويت. الجودة ممتازة دائماً' : 'Best flower shop in Kuwait. Quality is always excellent', rating: 5, image: '/images/testimonials/user2.jpg' },
    { id: 3, name: currentLang === 'ar' ? 'فاطمة خالد' : 'Fatima Khalid', text: currentLang === 'ar' ? 'طلبت لعيد ميلاد أمي وكانت سعيدة جداً. شكراً هولاند فلاورز' : 'Ordered for my mom\'s birthday and she was so happy. Thank you Holland Flowers', rating: 5, image: '/images/testimonials/user3.jpg' },
  ];

  return (
    <main className="home-page">
      <ImageSlideshow currentLang={currentLang} />
      
      <FeaturedProductsCarousel currentLang={currentLang} />
      <BestSellersCarousel currentLang={currentLang} />

      {/* Shop by Occasion */}
      <section className="occasions-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {currentLang === 'ar' ? 'تسوق حسب المناسبة' : 'Shop by Occasion'}
            </h2>
            <div className="section-underline"></div>
          </div>
          
          <div className="occasions-grid">
            {occasions.map((occasion) => {
              const IconComponent = occasion.icon;
              return (
                <Link 
                  to={occasion.link} 
                  key={occasion.id} 
                  className="occasion-card"
                  style={{ '--occasion-color': occasion.color }}
                >
                  <div className="occasion-image-wrapper">
                    <img 
                      src={occasion.image} 
                      alt={occasion.name}
                      className="occasion-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="occasion-overlay"></div>
                  </div>
                  
                  <div className="occasion-content">
                    <div className="occasion-icon-wrapper">
                      <IconComponent />
                    </div>
                    <h3 className="occasion-name">{occasion.name}</h3>
                    <span className="occasion-shop-btn">
                      {currentLang === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <NewArrivalsCarousel currentLang={currentLang} />

      {/* Why Choose Us */}
      <section className="why-us-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {currentLang === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
            </h2>
            <div className="section-underline"></div>
          </div>
          
          <div className="features-grid">
            {features.map((feature) => {
              const IconComponent = feature.Icon;
              return (
                <div 
                  key={feature.id} 
                  className="feature-card"
                  style={{ '--feature-color': feature.color }}
                >
                  <div className="feature-icon-wrapper">
                    <IconComponent />
                  </div>
                  <h3 className="feature-title">
                    {currentLang === 'ar' ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="feature-desc">
                    {currentLang === 'ar' ? feature.descAr : feature.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {currentLang === 'ar' ? 'تصفح الفئات' : 'Browse Categories'}
            </h2>
            <div className="section-underline"></div>
          </div>
          
          <div className="categories-grid">
            {categories.map((category) => {
              const IconComponent = category.Icon;
              return (
                <Link 
                  to={category.link} 
                  key={category.id} 
                  className="category-card"
                  style={{ '--category-color': category.color }}
                >
                  <div className="category-icon-wrapper">
                    <IconComponent />
                  </div>
                  <h3>{currentLang === 'ar' ? category.nameAr : category.nameEn}</h3>
                  <span className="category-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {currentLang === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
            </h2>
            <div className="section-underline"></div>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-stars">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <span className="testimonial-name">{testimonial.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h2>{currentLang === 'ar' ? 'اشترك في نشرتنا الإخبارية' : 'Subscribe to Our Newsletter'}</h2>
              <p>{currentLang === 'ar' ? 'احصل على أحدث العروض والمنتجات الجديدة مباشرة في بريدك الإلكتروني' : 'Get the latest offers and new products delivered straight to your inbox'}</p>
            </div>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={currentLang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'} 
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">
                {currentLang === 'ar' ? 'اشترك' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

const PlaceholderPage = ({ title, currentLang }) => {
  return (
    <main className="placeholder-page">
      <div className="container">
        <h1>{title}</h1>
        <p>{currentLang === 'ar' ? 'هذه الصفحة قيد الإنشاء' : 'This page is under construction'}</p>
      </div>
    </main>
  );
};

function App() {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);

    const handleLangChange = (e) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            
            <Route path="/*" element={
              <div className={`app ${currentLang === 'ar' ? 'rtl' : 'ltr'}`}>
                <Header />
                
                <Routes>
                  <Route path="/" element={<HomePage currentLang={currentLang} />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/login" element={<Account />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/orders/:orderId" element={<OrderDetail />} />
                  <Route path="/pick-for-you" element={<PickForYou />} />
                  <Route path="/offers" element={<Offers50 />} />
                  <Route path="/flowers" element={<PlaceholderPage title="Flowers" currentLang={currentLang} />} />
                  <Route path="/bouquets" element={<Bouquets />} />
                  <Route path="/combos" element={<Combos />} />
                  <Route path="/combos/flowers-perfume" element={<FlowersWithPerfume />} />
                  <Route path="/combos/flowers-chocolates" element={<FlowersWithChocolates />} />
                  <Route path="/add-ons" element={<AddOns />} />
                  <Route path="/add-ons/acrylic-toppers" element={<AcrylicToppers />} />
                  <Route path="/add-ons/helium-balloons" element={<HeliumBalloons />} />
                  <Route path="/add-ons/crown-for-head" element={<CrownForHead />} />
                  <Route path="/valentine" element={<PlaceholderPage title="Valentine's Day Special" currentLang={currentLang} />} />
                  <Route path="/ramadan" element={<RamadanSpecial />} />
                  <Route path="/eid-collection" element={<EidCollection />} />
                  <Route path="/tulips" element={<TulipsArrangement />} />
                  <Route path="/lilium-arrangement" element={<LiliumArrangement />} />
                  <Route path="/holland-small" element={<HollandSmallArrangements />} />
                  <Route path="/vase-arrangement" element={<VaseArrangement />} />
                  <Route path="/baby-roses" element={<BabyRoses />} />
                  <Route path="/single-flower" element={<SingleFlower />} />
                  <Route path="/holland-style" element={<HollandStyle />} />
                  <Route path="/roses-petals" element={<RosesPetals />} />
                  <Route path="/flowers-vase-10-25" element={<FlowersVase />} />
                  <Route path="/cylinder-vases" element={<CylinderVases />} />
                  <Route path="/flowers-mabkhar" element={<FlowersWithMabkhar />} />
                  <Route path="/flowers-perfume" element={<FlowersWithPerfume />} />
                  <Route path="/flower-bouquets" element={<Bouquets />} />
                  <Route path="/hand-bouquets" element={<HandBouquets />} />
                  <Route path="/orchid-plants" element={<OrchidPlants />} />
                  <Route path="/lilium-bouquets" element={<LiliumBouquets />} />
                  <Route path="/birthday-bouquet" element={<BirthdayBouquets />} />
                  <Route path="/yellow-rose-bouquet" element={<YellowRoseBouquets />} />
                  <Route path="/grand-bouquet" element={<GrandBouquets />} />
                  <Route path="/valentine-special" element={<ValentineSpecial />} />
                  <Route path="/mothers-day" element={<MothersDaySpecial />} />
                  <Route path="/anniversary" element={<PlaceholderPage title="Anniversary Collection" currentLang={currentLang} />} />
                  <Route path="/birthday" element={<BirthdayBouquets />} />
                  <Route path="*" element={<PlaceholderPage title="Page Not Found" currentLang={currentLang} />} />
                </Routes>
                
                <Footer />
                <WhatsAppButton />
              </div>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;