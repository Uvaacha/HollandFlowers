import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import './Cart.css';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();
  
  const [currentLang, setCurrentLang] = useState('en');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    const savedInstructions = localStorage.getItem('deliveryInstructions');
    if (savedInstructions) {
      setDeliveryInstructions(savedInstructions);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('deliveryInstructions', deliveryInstructions);
  }, [deliveryInstructions]);

  const t = {
    en: {
      title: 'Shopping Cart',
      emptyCart: 'Your cart is empty',
      emptyCartDesc: 'Looks like you haven\'t added any flowers yet.',
      continueShopping: 'Continue Shopping',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      remove: 'Remove',
      clearCart: 'Clear Cart',
      deliveryInstructions: 'Delivery Instructions',
      deliveryInstructionsPlaceholder: 'Add any special instructions for the Holland Flowers delivery team (e.g., gate code, specific delivery time, surprise delivery, etc.)',
      promoCode: 'Promo Code',
      promoPlaceholder: 'Enter promo code',
      apply: 'Apply',
      promoApplied: 'Promo code applied!',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      shippingNote: 'Calculated at checkout',
      discountLabel: 'Discount',
      grandTotal: 'Grand Total',
      checkout: 'Proceed to Checkout',
      kd: 'KD',
      items: 'items',
      item: 'item',
      backToShopping: '← Back to Shopping',
      secureCheckout: '🔒 Secure Checkout',
      // New translations for item details
      deliveryDate: 'Delivery Date',
      deliveryTime: 'Delivery Time',
      cardMessage: 'Card Message',
      senderInfo: 'Sender',
    },
    ar: {
      title: 'سلة التسوق',
      emptyCart: 'سلتك فارغة',
      emptyCartDesc: 'يبدو أنك لم تضف أي زهور بعد.',
      continueShopping: 'متابعة التسوق',
      product: 'المنتج',
      price: 'السعر',
      quantity: 'الكمية',
      total: 'المجموع',
      remove: 'إزالة',
      clearCart: 'إفراغ السلة',
      deliveryInstructions: 'تعليمات التوصيل',
      deliveryInstructionsPlaceholder: 'أضف أي تعليمات خاصة لفريق توصيل هولاند فلاورز (مثل رمز البوابة، وقت توصيل محدد، توصيل مفاجئ، إلخ)',
      promoCode: 'رمز الخصم',
      promoPlaceholder: 'أدخل رمز الخصم',
      apply: 'تطبيق',
      promoApplied: 'تم تطبيق رمز الخصم!',
      orderSummary: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      shippingNote: 'يحسب عند الدفع',
      discountLabel: 'الخصم',
      grandTotal: 'المجموع الكلي',
      checkout: 'متابعة الدفع',
      kd: 'د.ك',
      items: 'عناصر',
      item: 'عنصر',
      backToShopping: 'العودة للتسوق ←',
      secureCheckout: '🔒 دفع آمن',
      // New translations for item details
      deliveryDate: 'تاريخ التوصيل',
      deliveryTime: 'وقت التوصيل',
      cardMessage: 'رسالة البطاقة',
      senderInfo: 'المرسل',
    }
  };

  const text = t[currentLang];
  const subtotal = getCartTotal();
  const grandTotal = subtotal - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'HOLLAND10') {
      setDiscount(subtotal * 0.10);
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === 'FLOWERS15') {
      setDiscount(subtotal * 0.15);
      setPromoApplied(true);
    } else {
      alert(currentLang === 'ar' ? 'رمز الخصم غير صالح' : 'Invalid promo code');
    }
  };

  // Helper: Get the display price (sale price if available)
  const getDisplayPrice = (item) => {
    if (item.salePrice && item.salePrice > 0) return item.salePrice;
    if (item.finalPrice && item.finalPrice > 0) return item.finalPrice;
    return item.price || 0;
  };

  // Helper: Get original price for strikethrough
  const getOriginalPrice = (item) => {
    return item.originalPrice || item.actualPrice || 0;
  };

  // Helper: Check if item has discount
  const hasDiscount = (item) => {
    const original = getOriginalPrice(item);
    const current = getDisplayPrice(item);
    return original > 0 && original > current;
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, selectedVariant, newQty) => {
    if (newQty < 1) return;
    updateQuantity(itemId, selectedVariant, newQty);
  };

  if (cartItems.length === 0) {
    return (
      <div className={`cart-page empty ${currentLang === 'ar' ? 'rtl' : ''}`}>
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>{text.emptyCart}</h2>
            <p>{text.emptyCartDesc}</p>
            <Link to="/" className="continue-shopping-btn">
              {text.continueShopping}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cart-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="container">
        {/* Page Header */}
        <div className="cart-header">
          <Link to="/" className="back-link">{text.backToShopping}</Link>
          <h1>{text.title}</h1>
          <span className="cart-count">
            {getCartCount()} {getCartCount() === 1 ? text.item : text.items}
          </span>
        </div>

        <div className="cart-content">
          {/* Cart Items Section */}
          <div className="cart-items-section">

            {/* Cart Items */}
            <div className="cart-items-list">
              {cartItems.map((item, index) => {
                const displayPrice = getDisplayPrice(item);
                const originalPrice = getOriginalPrice(item);
                const itemHasDiscount = hasDiscount(item);
                const itemTotal = displayPrice * item.quantity;

                return (
                  <div key={`${item.id}-${item.selectedVariant || ''}-${index}`} className="cart-item-card">
                    {/* Remove Button */}
                    <button 
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id, item.selectedVariant)}
                      aria-label={text.remove}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                      </svg>
                    </button>

                    {/* Main Content */}
                    <div className="cart-item-main">
                      {/* Product Image */}
                      <div className="cart-item-image">
                        <img 
                          src={item.image} 
                          alt={currentLang === 'ar' ? item.nameAr : item.nameEn}
                          onError={(e) => { e.target.src = '/images/placeholder.webp'; }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="cart-item-details">
                        <h3 className="cart-item-name">
                          {currentLang === 'ar' ? (item.nameAr || item.nameEn || item.name) : (item.nameEn || item.name)}
                        </h3>
                        
                        {item.selectedVariant && (
                          <span className="cart-item-variant">{item.selectedVariant}</span>
                        )}

                        {/* Price Display */}
                        <div className="cart-item-price">
                          <span className="price-current">{displayPrice.toFixed(3)} {text.kd}</span>
                          {itemHasDiscount && (
                            <span className="price-original">{originalPrice.toFixed(3)} {text.kd}</span>
                          )}
                        </div>

                        {/* Delivery & Card Info */}
                        {(item.deliveryDate || item.deliveryTime || item.cardMessage || item.senderInfo) && (
                          <div className="cart-item-extras">
                            {item.deliveryDate && (
                              <div className="extra-item">
                                <span className="extra-icon">📅</span>
                                <span className="extra-label">{text.deliveryDate}:</span>
                                <span className="extra-value">{item.deliveryDate}</span>
                              </div>
                            )}
                            {item.deliveryTime && (
                              <div className="extra-item">
                                <span className="extra-icon">🕐</span>
                                <span className="extra-label">{text.deliveryTime}:</span>
                                <span className="extra-value">{item.deliveryTime}</span>
                              </div>
                            )}
                            {item.senderInfo && (
                              <div className="extra-item">
                                <span className="extra-icon">👤</span>
                                <span className="extra-label">{text.senderInfo}:</span>
                                <span className="extra-value">{item.senderInfo}</span>
                              </div>
                            )}
                            {item.cardMessage && (
                              <div className="extra-item card-message-item">
                                <span className="extra-icon">💌</span>
                                <span className="extra-label">{text.cardMessage}:</span>
                                <span className="extra-value card-message-text">"{item.cardMessage}"</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="cart-item-actions">
                      {/* Quantity Selector */}
                      <div className="qty-selector">
                        <button 
                          type="button"
                          className="qty-btn qty-minus"
                          onClick={() => handleQuantityChange(item.id, item.selectedVariant, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <span>−</span>
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button 
                          type="button"
                          className="qty-btn qty-plus"
                          onClick={() => handleQuantityChange(item.id, item.selectedVariant, item.quantity + 1)}
                        >
                          <span>+</span>
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="cart-item-total">
                        <span className="total-price">{itemTotal.toFixed(3)} {text.kd}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Instructions */}
            <div className="delivery-section">
              <h3>
                <span>📝</span>
                {text.deliveryInstructions}
              </h3>
              <textarea
                className={deliveryInstructions.length > 80 ? 'input-error' : ''}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder={text.deliveryInstructionsPlaceholder}
                rows="4"
                maxLength={80}
              />
              <div className="char-counter-wrapper">
                <span className={`char-counter ${deliveryInstructions.length > 80 ? 'error' : deliveryInstructions.length >= 70 ? 'warning' : ''}`}>
                  {deliveryInstructions.length}/80
                </span>
                {deliveryInstructions.length > 80 && (
                  <span className="error-message">
                    {currentLang === 'ar' ? 'يجب أن تكون تعليمات التوصيل أقل من 80 حرفًا' : 'Delivery instructions must be less than 80 characters'}
                  </span>
                )}
              </div>
            </div>

            {/* Clear Cart */}
            <button type="button" className="clear-cart-btn" onClick={clearCart}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              {text.clearCart}
            </button>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h2>{text.orderSummary}</h2>

              {/* Promo Code */}
              <div className="promo-section">
                <label>{text.promoCode}</label>
                <div className="promo-input-wrapper">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={text.promoPlaceholder}
                    disabled={promoApplied}
                  />
                  <button 
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                  >
                    {text.apply}
                  </button>
                </div>
                {promoApplied && (
                  <span className="promo-success">✓ {text.promoApplied}</span>
                )}
              </div>

              {/* Summary */}
              <div className="summary-rows">
                <div className="summary-row">
                  <span>{text.subtotal}</span>
                  <span>{subtotal.toFixed(3)} {text.kd}</span>
                </div>
                <div className="summary-row">
                  <span>{text.shipping}</span>
                  <span className="shipping-note">{text.shippingNote}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount-row">
                    <span>{text.discountLabel}</span>
                    <span>-{discount.toFixed(3)} {text.kd}</span>
                  </div>
                )}
                <div className="summary-row total-row">
                  <span>{text.grandTotal}</span>
                  <span>{grandTotal.toFixed(3)} {text.kd}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout" className="checkout-btn">
                {text.secureCheckout}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;