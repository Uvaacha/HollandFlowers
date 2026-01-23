import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './components/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminApp from './admin/AdminApp';

import ImageSlideshow from './components/ImageSlideshow';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Account from './components/Account';
import OAuthCallback from './components/OAuthCallback';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import OrderHistory from './components/OrderHistory';
import OrderDetail from './components/OrderDetail';

import Bouquets from './components/Bouquets';
import HandBouquets from './components/HandBouquets';
import OrchidPlants from './components/OrchidPlants';
import BirthdayBouquets from './components/BirthdayBouquets';
import GrandBouquets from './components/GrandBouquets';
import ValentineSpecial from './components/ValentineSpecial';
import MothersDaySpecial from './components/MothersDaySpecial';
import EidCollection from './components/EidCollection';

import productService from './services/productService';
import AddToCartModal from './components/AddToCartModal';

import './App.css';

/* ===========================
   SCROLL TO TOP
=========================== */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/* ===========================
   PRODUCT CARD
=========================== */
const ProductCard = ({ product, currentLang, onAddToCart }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({
      productId: product.productId,
      name: product.productName,
      price: product.finalPrice,
      image: product.imageUrl,
      quantity: 1
    });
    onAddToCart && onAddToCart(product);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.productId}`}>
        <img src={product.imageUrl} alt={product.productName} />
        <h3>{product.productName}</h3>
      </Link>
      <p>KD {product.finalPrice}</p>
      <button onClick={handleAdd}>Add to Cart</button>
    </div>
  );
};

/* ===========================
   HOME PAGE
=========================== */
const HomePage = ({ currentLang }) => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    productService.getFeaturedProducts({ size: 12 }).then(res => {
      if (res?.data?.content) setProducts(res.data.content);
    });
  }, []);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <main className="home-page">
      <ImageSlideshow currentLang={currentLang} />

      {/* PRODUCTS */}
      <section className="container">
        <h2>{currentLang === 'ar' ? 'منتجات مميزة' : 'Featured Flowers'}</h2>
        <div className="product-grid">
          {products.map(p => (
            <ProductCard
              key={p.productId}
              product={p}
              currentLang={currentLang}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* ✅ SEO CONTENT BLOCK (CORRECT PLACE) */}
      <section style={{ padding: "40px", background: "#fff" }}>
        <h2>Holland Flowers Kuwait – Flower Delivery in Kuwait</h2>

        <p>
          Holland Flowers Kuwait is a trusted flower shop in Kuwait offering fresh
          flowers and same day flower delivery across all areas.
        </p>

        <p>
          Order birthday flowers Kuwait, wedding flowers Kuwait, roses Kuwait,
          online flowers Kuwait, fresh flowers Kuwait and Valentine’s Day best
          flowers with fast delivery.
        </p>

        <p>
          We deliver flowers to Kuwait City, Salmiya, Hawally, Farwaniya, Ahmadi
          and all locations in Kuwait.
        </p>

        <p>
          هولاند فلاورز الكويت هو أفضل محل ورد في الكويت مع توصيل ورد في نفس اليوم.
          نوفر باقات ورد عيد ميلاد، ورد زفاف، ورد فالنتاين، وورود طازجة.
        </p>
      </section>

      {showModal && selectedProduct && (
        <AddToCartModal
          isOpen={showModal}
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          currentLang={currentLang}
        />
      )}
    </main>
  );
};

/* ===========================
   APP CONTENT
=========================== */
const AppContent = ({ currentLang }) => (
  <div className={currentLang === 'ar' ? 'rtl' : 'ltr'}>
    <ScrollToTop />
    <Header />

    <Routes>
      <Route path="/" element={<HomePage currentLang={currentLang} />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />

      <Route path="/bouquets" element={<Bouquets />} />
      <Route path="/hand-bouquets" element={<HandBouquets />} />
      <Route path="/orchid-plants" element={<OrchidPlants />} />
      <Route path="/birthday-bouquet" element={<BirthdayBouquets />} />
      <Route path="/grand-bouquet" element={<GrandBouquets />} />
      <Route path="/valentine-special" element={<ValentineSpecial />} />
      <Route path="/mothers-day" element={<MothersDaySpecial />} />
      <Route path="/eid-collection" element={<EidCollection />} />

      <Route path="*" element={<HomePage currentLang={currentLang} />} />
    </Routes>

    <Footer />
    <WhatsAppButton />
  </div>
);

/* ===========================
   MAIN APP
=========================== */
function App() {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    setCurrentLang(localStorage.getItem('preferredLanguage') || 'en');
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/*" element={<AppContent currentLang={currentLang} />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
