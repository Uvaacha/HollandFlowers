import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentService from './PaymentService';
import './Checkout.css';

// Move governorates outside component - static data
const governorates = [
  { 
    id: 'al-ahmadi', 
    name: 'Al Ahmadi', 
    nameAr: 'الأحمدي',
    shippingOptions: [
      { id: 'standard', name: 'Standard', nameAr: 'عادي', price: 1.000 },
      { id: 'outer1', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Ali Sabah al Salem, Umm al Hayman', areasAr: 'علي صباح السالم، أم الهيمان', price: 5.000 },
      { id: 'outer2', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Khiran, Sabah Al Ahmad, Wafra, Umm al Hayman, Abdaly, Mutla', areasAr: 'الخيران، صباح الأحمد، الوفرة، أم الهيمان، العبدلي، المطلاع', price: 9.000 }
    ]
  },
  { 
    id: 'al-asimah', 
    name: 'Al Asimah', 
    nameAr: 'العاصمة',
    shippingOptions: [
      { id: 'standard', name: 'Standard', nameAr: 'عادي', price: 1.000 },
      { id: 'outer1', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Ali Sabah al Salem, Umm al Hayman', areasAr: 'علي صباح السالم، أم الهيمان', price: 5.000 },
      { id: 'outer2', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Khiran, Sabah Al Ahmad, Wafra, Umm al Hayman, Abdaly, Mutla', areasAr: 'الخيران، صباح الأحمد، الوفرة، أم الهيمان، العبدلي، المطلاع', price: 9.000 }
    ]
  },
  { 
    id: 'al-farwaniyah', 
    name: 'Al Farwaniyah', 
    nameAr: 'الفروانية',
    shippingOptions: [
      { id: 'standard', name: 'Standard', nameAr: 'عادي', price: 1.000 },
      { id: 'outer1', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Ali Sabah al Salem, Umm al Hayman', areasAr: 'علي صباح السالم، أم الهيمان', price: 5.000 },
      { id: 'outer2', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Khiran, Sabah Al Ahmad, Wafra, Umm al Hayman, Abdaly, Mutla', areasAr: 'الخيران، صباح الأحمد، الوفرة، أم الهيمان، العبدلي، المطلاع', price: 9.000 }
    ]
  },
  { 
    id: 'al-jahra', 
    name: 'Al Jahra', 
    nameAr: 'الجهراء',
    shippingOptions: [
      { id: 'delivery', name: 'Delivery Charge', nameAr: 'رسوم التوصيل', price: 3.000 }
    ]
  },
  { 
    id: 'hawalli', 
    name: 'Hawalli', 
    nameAr: 'حولي',
    shippingOptions: [
      { id: 'standard', name: 'Standard', nameAr: 'عادي', price: 1.000 },
      { id: 'outer1', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Ali Sabah al Salem, Umm al Hayman', areasAr: 'علي صباح السالم، أم الهيمان', price: 5.000 },
      { id: 'outer2', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Khiran, Sabah Al Ahmad, Wafra, Umm al Hayman, Abdaly, Mutla', areasAr: 'الخيران، صباح الأحمد، الوفرة، أم الهيمان، العبدلي، المطلاع', price: 9.000 }
    ]
  },
  { 
    id: 'mubarak-al-kabeer', 
    name: 'Mubarak Al-Kabeer', 
    nameAr: 'مبارك الكبير',
    shippingOptions: [
      { id: 'standard', name: 'Standard', nameAr: 'عادي', price: 1.000 },
      { id: 'outer1', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Ali Sabah al Salem, Umm al Hayman', areasAr: 'علي صباح السالم، أم الهيمان', price: 5.000 },
      { id: 'outer2', name: 'Outer City Delivery', nameAr: 'توصيل خارج المدينة', areas: 'Khiran, Sabah Al Ahmad, Wafra, Umm al Hayman, Abdaly, Mutla', areasAr: 'الخيران، صباح الأحمد، الوفرة، أم الهيمان، العبدلي، المطلاع', price: 9.000 }
    ]
  }
];

// Countries list for billing address
const countries = [
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: 'IN', name: 'India', nameAr: 'الهند', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { code: 'OM', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲' },
  { code: 'EG', name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
  { code: 'JO', name: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
  { code: 'US', name: 'United States', nameAr: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', nameAr: 'المملكة المتحدة', flag: '🇬🇧' },
];

const Checkout = () => {
  // eslint-disable-next-line no-unused-vars
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [contact, setContact] = useState({
    emailOrPhone: '',
    emailOffers: true,
    textOffers: false
  });
  
  const [delivery, setDelivery] = useState({
    country: 'Kuwait',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    postalCode: '',
    city: '',
    governorate: '',
    phone: ''
  });
  
  const [selectedShipping, setSelectedShipping] = useState('');
  const [billingAddress, setBillingAddress] = useState('same');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  
  // Billing address state (for different billing address)
  const [billingDetails, setBillingDetails] = useState({
    country: 'KW',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });

  // Language effect
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Load delivery instructions from cart
  useEffect(() => {
    const savedInstructions = localStorage.getItem('deliveryInstructions');
    if (savedInstructions) {
      setDeliveryInstructions(savedInstructions);
    }
  }, []);

  // Get current governorate data
  const getCurrentGovernorate = useCallback(() => {
    return governorates.find(g => g.id === delivery.governorate);
  }, [delivery.governorate]);

  // Get shipping options for selected governorate
  const getShippingOptions = useCallback(() => {
    const gov = getCurrentGovernorate();
    return gov ? gov.shippingOptions : [];
  }, [getCurrentGovernorate]);

  // Get shipping cost
  const getShippingCost = useCallback(() => {
    const options = getShippingOptions();
    const selected = options.find(o => o.id === selectedShipping);
    return selected ? selected.price : 0;
  }, [getShippingOptions, selectedShipping]);

  // Reset shipping when governorate changes
  useEffect(() => {
    const options = getShippingOptions();
    if (options.length > 0) {
      setSelectedShipping(options[0].id);
    } else {
      setSelectedShipping('');
    }
  }, [delivery.governorate, getShippingOptions]);

  // Calculate totals
  const subtotal = getCartTotal();
  const shippingCost = getShippingCost();
  const total = subtotal + shippingCost;

  // Handle form changes
  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContact(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDelivery(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle billing details change
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get selected country flag
  const getSelectedCountryFlag = () => {
    const country = countries.find(c => c.code === billingDetails.country);
    return country ? country.flag : '🌍';
  };

  // Handle form submission - Create order and redirect to Hesabe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!delivery.governorate) {
      setError(currentLang === 'ar' ? 'يرجى اختيار المحافظة' : 'Please select a governorate');
      return;
    }

    // Validate billing address if different
    if (billingAddress === 'different') {
      if (!billingDetails.lastName || !billingDetails.address || !billingDetails.city) {
        setError(currentLang === 'ar' 
          ? 'يرجى ملء جميع حقول عنوان الفاتورة المطلوبة' 
          : 'Please fill in all required billing address fields'
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      // Prepare checkout data
      const checkoutData = {
        contact,
        delivery,
        billingAddress,
        billingDetails,
        deliveryInstructions,
        selectedShipping,
        shippingCost,
        cartItems: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          giftMessage: item.giftMessage || ''
        })),
        subtotal,
        total
      };

      // Check if user is logged in
      const authToken = localStorage.getItem('accessToken') || localStorage.getItem('adminToken');
      
      let orderResponse;
      
      if (authToken) {
        // Logged in user - Create order first
        const orderData = {
          items: cartItems,
          firstName: delivery.firstName,
          lastName: delivery.lastName,
          phone: delivery.phone,
          address: delivery.address,
          apartment: delivery.apartment,
          city: delivery.city,
          governorate: delivery.governorate,
          deliveryInstructions
        };
        
        orderResponse = await PaymentService.createOrder(orderData);
        
        console.log('Order API Response:', JSON.stringify(orderResponse, null, 2));
        
        const orderId = orderResponse?.data?.orderId || 
                        orderResponse?.data?.id || 
                        orderResponse?.orderId || 
                        orderResponse?.id ||
                        orderResponse?.data?.orderNumber;
        
        if (!orderId) {
          console.error('Order response structure:', orderResponse);
          throw new Error('Failed to get order ID from response');
        }
        
        console.log('Extracted orderId:', orderId);
        
        // Then initiate payment
        const paymentResponse = await PaymentService.initiatePayment({
          orderId: orderId,
          paymentMethod: 'KNET',
          email: contact.emailOrPhone,
          phone: delivery.phone,
          customerName: `${delivery.firstName || ''} ${delivery.lastName}`.trim(),
          deviceType: 'WEB'
        });

        if (paymentResponse.success && paymentResponse.checkoutUrl) {
          localStorage.setItem('pendingOrder', JSON.stringify({
            orderId: orderId,
            paymentReference: paymentResponse.paymentReference,
            total,
            items: cartItems.length
          }));
          
          window.location.href = paymentResponse.checkoutUrl;
        } else {
          throw new Error(paymentResponse.message || 'Failed to initiate payment');
        }
      } else {
        // Guest checkout
        orderResponse = await PaymentService.guestCheckout(checkoutData);
        
        if (orderResponse.success && orderResponse.checkoutUrl) {
          localStorage.setItem('pendingOrder', JSON.stringify({
            orderId: orderResponse.orderId,
            paymentReference: orderResponse.paymentReference,
            total,
            items: cartItems.length
          }));
          
          window.location.href = orderResponse.checkoutUrl;
        } else if (orderResponse.data && orderResponse.data.checkoutUrl) {
          localStorage.setItem('pendingOrder', JSON.stringify({
            orderId: orderResponse.data.orderId,
            paymentReference: orderResponse.data.paymentReference,
            total,
            items: cartItems.length
          }));
          
          window.location.href = orderResponse.data.checkoutUrl;
        } else {
          throw new Error(orderResponse.message || 'Failed to process checkout');
        }
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || (currentLang === 'ar' 
        ? 'حدث خطأ أثناء معالجة الطلب' 
        : 'An error occurred while processing your order'));
      setIsLoading(false);
    }
  };

  // Translations
  const t = {
    en: {
      checkout: 'Checkout',
      contact: 'Contact',
      signIn: 'Sign in',
      emailOrPhone: 'Sender Email or Phone Number',
      emailOffers: 'Email me with news and offers',
      delivery: 'Delivery',
      countryRegion: 'Country/Region',
      firstName: 'Recipient First Name (Optional)',
      lastName: 'Recipient Last Name',
      address: 'Recipient Address: Area, Block, Street, Jeddah, House No...',
      apartment: 'Apartment, suite, etc. (optional)',
      postalCode: 'Postal code (optional)',
      pinCode: 'PIN code',
      city: 'City',
      state: 'State',
      governorate: 'Governorate',
      selectGovernorate: 'Select Governorate',
      phone: 'Recipient Phone Number',
      phoneOptional: 'Phone (optional)',
      textOffers: 'Text me with news and offers',
      shippingMethod: 'Shipping method',
      selectGovFirst: 'Enter your shipping address to view available shipping methods.',
      payment: 'Payment',
      paymentSecure: 'All transactions are secure and encrypted.',
      hesabeGateway: 'HESABE PAYMENT GATEWAY',
      hesabeDesc: 'After clicking "Pay now", you will be redirected to HESABE PAYMENT GATEWAY to complete your purchase securely.',
      billingAddress: 'Billing address',
      sameAsShipping: 'Same as shipping address',
      differentBilling: 'Use a different billing address',
      payNow: 'Pay now',
      processing: 'Processing...',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      backToCart: '← Back to cart',
      deliveryInstructions: 'Delivery Instructions',
      kwd: 'KWD',
      billingFirstName: 'Recipient First Name (Optional)',
      billingLastName: 'Recipient Last Name',
      billingAddress2: 'Recipient Address: Area, Block, Street, Jeddah, House No...',
      selectCountry: 'Select Country',
      error: 'Error',
      deliveryDate: 'Delivery Date',
      deliveryTime: 'Delivery Time',
      cardMessage: 'Card Message',
      senderInfo: 'Sender',
      discountCode: 'Discount code',
      apply: 'Apply',
      saveInfo: 'Save this information for next time'
    },
    ar: {
      checkout: 'الدفع',
      contact: 'معلومات الاتصال',
      signIn: 'تسجيل الدخول',
      emailOrPhone: 'البريد الإلكتروني أو رقم هاتف المرسل',
      emailOffers: 'أرسل لي العروض والأخبار عبر البريد',
      delivery: 'التوصيل',
      countryRegion: 'الدولة/المنطقة',
      firstName: 'الاسم الأول للمستلم (اختياري)',
      lastName: 'اسم العائلة للمستلم',
      address: 'عنوان المستلم: المنطقة، القطعة، الشارع، الجادة، رقم المنزل...',
      apartment: 'شقة، جناح، إلخ (اختياري)',
      postalCode: 'الرمز البريدي (اختياري)',
      pinCode: 'الرمز البريدي',
      city: 'المدينة',
      state: 'الولاية',
      governorate: 'المحافظة',
      selectGovernorate: 'اختر المحافظة',
      phone: 'رقم هاتف المستلم',
      phoneOptional: 'الهاتف (اختياري)',
      textOffers: 'أرسل لي العروض والأخبار عبر الرسائل',
      shippingMethod: 'طريقة الشحن',
      selectGovFirst: 'أدخل عنوان الشحن لعرض طرق الشحن المتاحة.',
      payment: 'الدفع',
      paymentSecure: 'جميع المعاملات آمنة ومشفرة.',
      hesabeGateway: 'بوابة الدفع حسابي',
      hesabeDesc: 'بعد النقر على "ادفع الآن"، ستتم إعادة توجيهك إلى بوابة الدفع حسابي لإتمام عملية الشراء بأمان.',
      billingAddress: 'عنوان الفاتورة',
      sameAsShipping: 'نفس عنوان الشحن',
      differentBilling: 'استخدم عنوان فوترة مختلف',
      payNow: 'ادفع الآن',
      processing: 'جاري المعالجة...',
      orderSummary: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      total: 'الإجمالي',
      backToCart: 'العودة إلى السلة →',
      deliveryInstructions: 'تعليمات التوصيل',
      kwd: 'د.ك',
      billingFirstName: 'الاسم الأول للمستلم (اختياري)',
      billingLastName: 'اسم العائلة للمستلم',
      billingAddress2: 'عنوان المستلم: المنطقة، القطعة، الشارع، الجادة، رقم المنزل...',
      selectCountry: 'اختر الدولة',
      error: 'خطأ',
      deliveryDate: 'تاريخ التوصيل',
      deliveryTime: 'وقت التوصيل',
      cardMessage: 'رسالة البطاقة',
      senderInfo: 'المرسل',
      discountCode: 'كود الخصم',
      apply: 'تطبيق',
      saveInfo: 'احفظ هذه المعلومات للمرة القادمة'
    }
  };

  const text = t[currentLang];

  // Empty cart redirect
  if (cartItems.length === 0) {
    return (
      <div className={`checkout-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
        <div className="checkout-empty">
          <div className="empty-icon">🛒</div>
          <h2>{currentLang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</h2>
          <p>{currentLang === 'ar' ? 'أضف بعض الزهور الجميلة إلى سلتك' : 'Add some beautiful flowers to your cart'}</p>
          <Link to="/" className="continue-shopping-btn">
            {currentLang === 'ar' ? 'تسوق الآن' : 'Continue Shopping'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`checkout-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="checkout-container">
        {/* Left Column - Form */}
        <div className="checkout-form-column">
          <div className="checkout-header">
            <div className="checkout-logo">
              <Link to="/">
                <img src="/Holland Logo.png" alt="Holland Flowers" />
              </Link>
            </div>
            <Link to="/cart" className="back-to-cart-link">
              {text.backToCart}
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="checkout-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="error-close">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Contact Section */}
            <section className="checkout-section">
              <div className="section-header-row">
                <h2>{text.contact}</h2>
                {!isAuthenticated && (
                  <Link to="/account" className="sign-in-link">{text.signIn}</Link>
                )}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="emailOrPhone"
                  value={contact.emailOrPhone}
                  onChange={handleContactChange}
                  placeholder={text.emailOrPhone}
                  required
                  className="checkout-input"
                />
              </div>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="emailOffers"
                  checked={contact.emailOffers}
                  onChange={handleContactChange}
                />
                <span>{text.emailOffers}</span>
              </label>
            </section>

            {/* Delivery Section */}
            <section className="checkout-section">
              <h2>{text.delivery}</h2>
              
              <div className="form-group">
                <label className="input-label">{text.countryRegion}</label>
                <div className="country-select-wrapper">
                  <span className="country-code">KW</span>
                  <select 
                    className="checkout-select country-select"
                    value={delivery.country}
                    disabled
                  >
                    <option value="Kuwait">Kuwait</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    value={delivery.firstName}
                    onChange={handleDeliveryChange}
                    placeholder={text.firstName}
                    className="checkout-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    value={delivery.lastName}
                    onChange={handleDeliveryChange}
                    placeholder={text.lastName}
                    required
                    className="checkout-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="address"
                  value={delivery.address}
                  onChange={handleDeliveryChange}
                  placeholder={text.address}
                  required
                  className="checkout-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="apartment"
                  value={delivery.apartment}
                  onChange={handleDeliveryChange}
                  placeholder={text.apartment}
                  className="checkout-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="postalCode"
                    value={delivery.postalCode}
                    onChange={handleDeliveryChange}
                    placeholder={text.postalCode}
                    className="checkout-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="city"
                    value={delivery.city}
                    onChange={handleDeliveryChange}
                    placeholder={text.city}
                    className="checkout-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <select
                  name="governorate"
                  value={delivery.governorate}
                  onChange={handleDeliveryChange}
                  required
                  className="checkout-select governorate-select"
                >
                  <option value="">{text.governorate}</option>
                  {governorates.map(gov => (
                    <option key={gov.id} value={gov.id}>
                      {currentLang === 'ar' ? gov.nameAr : gov.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group phone-group">
                <div className="phone-input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    value={delivery.phone}
                    onChange={handleDeliveryChange}
                    placeholder={text.phone}
                    required
                    className="checkout-input phone-input"
                  />
                  <span className="phone-help" title="Phone number for delivery updates">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                </div>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="saveInfo"
                />
                <span>{text.saveInfo}</span>
              </label>
            </section>

            {/* Shipping Method Section */}
            <section className="checkout-section">
              <h2>{text.shippingMethod}</h2>
              
              {delivery.governorate ? (
                <div className="shipping-options">
                  {getShippingOptions().map((option) => (
                    <label 
                      key={option.id} 
                      className={`shipping-option ${selectedShipping === option.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping === option.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                      />
                      <div className="shipping-option-content">
                        <div className="shipping-option-info">
                          <span className="shipping-name">
                            {currentLang === 'ar' ? option.nameAr : option.name}
                          </span>
                          {option.areas && (
                            <span className="shipping-areas">
                              {currentLang === 'ar' ? option.areasAr : option.areas}
                            </span>
                          )}
                        </div>
                        <span className="shipping-price">{text.kwd} {option.price.toFixed(3)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="shipping-placeholder">
                  <p>{text.selectGovFirst}</p>
                </div>
              )}
            </section>

            {/* Delivery Instructions Section */}
            {deliveryInstructions && (
              <section className="checkout-section delivery-instructions-section">
                <h2>{text.deliveryInstructions}</h2>
                <div className="delivery-instructions-box">
                  <span className="instructions-icon">📝</span>
                  <p>{deliveryInstructions}</p>
                </div>
              </section>
            )}

            {/* Payment Section */}
            <section className="checkout-section payment-section">
              <h2>{text.payment}</h2>
              <div className="payment-secure-row">
                <p className="payment-secure-text">{text.paymentSecure}</p>
              </div>
              
              <div className="payment-box">
                <div className="payment-header">
                  <span className="payment-name">{text.hesabeGateway}</span>
                  <div className="payment-icons">
                    <span className="payment-icon">
                      <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                        <rect width="34" height="22" rx="3" fill="#1A1F71"/>
                        <path d="M13.5 15.5L15 6.5H17.5L16 15.5H13.5Z" fill="white"/>
                        <path d="M22 6.5L20 12.5L19.5 6.5H17L18.5 15.5H21L25 6.5H22Z" fill="white"/>
                        <path d="M12 6.5L9.5 12.5L9.25 11.25C8.75 10 7.5 8.5 6 7.5L8 15.5H10.5L14.5 6.5H12Z" fill="white"/>
                        <path d="M7.5 6.5H4L4 6.75C7 7.5 9 9.5 9.5 11.25L8.75 7.25C8.625 6.75 8.25 6.5 7.5 6.5Z" fill="#F9A533"/>
                      </svg>
                    </span>
                    <span className="payment-icon">
                      <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                        <rect width="34" height="22" rx="3" fill="#000"/>
                        <circle cx="13" cy="11" r="7" fill="#EB001B"/>
                        <circle cx="21" cy="11" r="7" fill="#F79E1B"/>
                        <path d="M17 5.5C18.5 6.75 19.5 8.75 19.5 11C19.5 13.25 18.5 15.25 17 16.5C15.5 15.25 14.5 13.25 14.5 11C14.5 8.75 15.5 6.75 17 5.5Z" fill="#FF5F00"/>
                      </svg>
                    </span>
                    <span className="more-payment">+4</span>
                  </div>
                </div>
                <div className="payment-body">
                  <div className="payment-redirect-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <p className="payment-desc">{text.hesabeDesc}</p>
                </div>
              </div>
            </section>

            {/* Billing Address Section */}
            <section className="checkout-section">
              <h2>{text.billingAddress}</h2>
              
              <div className="billing-options">
                <label className={`billing-option ${billingAddress === 'same' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="billingAddress"
                    value="same"
                    checked={billingAddress === 'same'}
                    onChange={() => setBillingAddress('same')}
                  />
                  <span>{text.sameAsShipping}</span>
                </label>
                
                <label className={`billing-option ${billingAddress === 'different' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="billingAddress"
                    value="different"
                    checked={billingAddress === 'different'}
                    onChange={() => setBillingAddress('different')}
                  />
                  <span>{text.differentBilling}</span>
                </label>
              </div>

              {billingAddress === 'different' && (
                <div className="billing-form">
                  <div className="form-group">
                    <select
                      name="country"
                      value={billingDetails.country}
                      onChange={handleBillingChange}
                      className="checkout-select"
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {currentLang === 'ar' ? country.nameAr : country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        name="firstName"
                        value={billingDetails.firstName}
                        onChange={handleBillingChange}
                        placeholder={text.billingFirstName}
                        className="checkout-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="lastName"
                        value={billingDetails.lastName}
                        onChange={handleBillingChange}
                        placeholder={text.billingLastName}
                        required
                        className="checkout-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="address"
                      value={billingDetails.address}
                      onChange={handleBillingChange}
                      placeholder={text.billingAddress2}
                      required
                      className="checkout-input"
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="apartment"
                      value={billingDetails.apartment}
                      onChange={handleBillingChange}
                      placeholder={text.apartment}
                      className="checkout-input"
                    />
                  </div>

                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <input
                        type="text"
                        name="city"
                        value={billingDetails.city}
                        onChange={handleBillingChange}
                        placeholder={text.city}
                        required
                        className="checkout-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="state"
                        value={billingDetails.state}
                        onChange={handleBillingChange}
                        placeholder={text.state}
                        className="checkout-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="postalCode"
                        value={billingDetails.postalCode}
                        onChange={handleBillingChange}
                        placeholder={text.pinCode}
                        className="checkout-input"
                      />
                    </div>
                  </div>

                  <div className="form-group phone-group">
                    <div className="phone-input-wrapper">
                      <div className="country-flag-box">
                        <span className="flag">{getSelectedCountryFlag()}</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={billingDetails.phone}
                        onChange={handleBillingChange}
                        placeholder={text.phoneOptional}
                        className="checkout-input phone-input"
                      />
                      <span className="phone-help" title="Phone number for billing">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Pay Button */}
            <button 
              type="submit" 
              className={`pay-now-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {text.processing}
                </>
              ) : (
                text.payNow
              )}
            </button>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="checkout-summary-column">
          <div className="order-summary">
            
            {/* Product Items */}
            <div className="summary-items">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="summary-product">
                  <div className="product-image-wrap">
                    <img src={item.image} alt={currentLang === 'ar' ? item.nameAr : item.nameEn} />
                    <span className="product-qty-badge">{item.quantity}</span>
                  </div>
                  <div className="product-info">
                    <span className="product-name">
                      {currentLang === 'ar' ? item.nameAr : item.nameEn}
                    </span>
                    {item.deliveryDate && (
                      <span className="product-delivery-info">
                        {text.deliveryDate} :: {item.deliveryDate}
                      </span>
                    )}
                    {item.deliveryTime && (
                      <span className="product-delivery-info">
                        {text.deliveryTime} :: {item.deliveryTime}
                      </span>
                    )}
                    {item.cardMessage && (
                      <div className="product-card-message">
                        <span className="message-icon">💌</span>
                        <span className="message-label">{text.cardMessage}:</span>
                        <span className="message-text">"{item.cardMessage}"</span>
                      </div>
                    )}
                  </div>
                  <div className="product-price-col">
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="price-original">{text.kwd} {(item.originalPrice * item.quantity).toFixed(3)}</span>
                    )}
                    <span className="price-current">{text.kwd} {(item.price * item.quantity).toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="discount-code-section">
              <input 
                type="text" 
                placeholder={text.discountCode}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="discount-input"
              />
              <button type="button" className="discount-apply-btn">
                {text.apply}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
