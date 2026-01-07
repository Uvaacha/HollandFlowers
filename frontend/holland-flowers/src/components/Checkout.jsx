import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Checkout.css';

// Move governorates outside component - static data with areas/cities
const governorates = [
  { 
    id: 'al-ahmadi', 
    name: 'Al Ahmadi', 
    nameAr: 'الأحمدي',
    // Areas/cities in Al Ahmadi governorate
    areas: ['ahmadi', 'fahaheel', 'mangaf', 'mahboula', 'abu halifa', 'fintas', 'egaila', 'sabahiya', 'riqqa', 'hadiya', 'jaber al ali', 'ali sabah al salem', 'fahad al ahmad', 'sabah al ahmad', 'khiran', 'wafra', 'mina abdullah', 'shuaiba', 'zour', 'bneidar', 'julaia', 'nuwaiseeb'],
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
    // Areas/cities in Capital governorate
    areas: ['kuwait city', 'sharq', 'mirqab', 'qibla', 'dasman', 'salhiya', 'sawaber', 'bneid al qar', 'kaifan', 'mansouriya', 'abdullah al salem', 'nuzha', 'faiha', 'shamiya', 'rawda', 'adailiya', 'khaldiya', 'qadsiya', 'yarmouk', 'shuwaikh', 'sulaibikhat', 'doha', 'granada', 'north west sulaibikhat'],
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
    // Areas/cities in Farwaniyah governorate
    areas: ['farwaniyah', 'khaitan', 'jleeb al shuyoukh', 'ardiya', 'rai', 'andalous', 'riggae', 'omariya', 'rabiya', 'rehab', 'sabah al nasser', 'ishbiliya', 'firdous', 'abbasiya', 'airport', 'ardhiya industrial', 'farwaniyah industrial'],
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
    // Areas/cities in Jahra governorate
    areas: ['jahra', 'waha', 'qasr', 'naseem', 'taima', 'saad al abdullah', 'abdali', 'mutla', 'sulaibiya', 'sulaibiya industrial', 'amghara', 'naeem', 'qayrawan', 'jaber al ahmad', 'south saad al abdullah', 'silk'],
    shippingOptions: [
      { id: 'delivery', name: 'Delivery Charge', nameAr: 'رسوم التوصيل', price: 3.000 }
    ]
  },
  { 
    id: 'hawalli', 
    name: 'Hawalli', 
    nameAr: 'حولي',
    // Areas/cities in Hawalli governorate
    areas: ['hawalli', 'salmiya', 'salwa', 'rumaithiya', 'bayan', 'mishref', 'jabriya', 'shaab', 'maidan hawalli', 'hitteen', 'zahra', 'shuhada', 'mubarak al abdullah', 'south surra', 'nigra'],
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
    // Areas/cities in Mubarak Al-Kabeer governorate
    areas: ['mubarak al kabeer', 'qurain', 'adan', 'qusour', 'sabah al salem', 'messila', 'abu fatira', 'abu al hasaniya', 'fnaitees', 'al qusor', 'south wista', 'west abu fatira', 'mubarak al kabir'],
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

// ============ VALIDATION HELPERS ============
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  // Remove spaces, dashes, and plus sign for validation
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  // Check if it's only digits and has proper length (8-15 digits)
  const phoneRegex = /^\d{8,15}$/;
  return phoneRegex.test(cleanPhone);
};

const validateEmailOrPhone = (value) => {
  if (!value || value.trim() === '') {
    return { valid: false, type: null, message: 'Please enter email or phone number' };
  }

  const trimmedValue = value.trim();

  // Check if it looks like an email (contains @)
  if (trimmedValue.includes('@')) {
    if (isValidEmail(trimmedValue)) {
      return { valid: true, type: 'email', message: null };
    } else {
      return { valid: false, type: 'email', message: 'Please enter a valid email address' };
    }
  } else {
    // Treat as phone number
    if (isValidPhone(trimmedValue)) {
      return { valid: true, type: 'phone', message: null };
    } else {
      return { valid: false, type: 'phone', message: 'Please enter a valid phone number (8-15 digits) or email address' };
    }
  }
};

// ============ FIND GOVERNORATE BY CITY/AREA NAME ============
const findGovernorateByCity = (cityName) => {
  if (!cityName || cityName.trim().length < 2) return null;
  
  const searchTerm = cityName.toLowerCase().trim();
  
  for (const gov of governorates) {
    // Check if any area matches the search term
    const matchedArea = gov.areas.find(area => 
      area.toLowerCase().includes(searchTerm) || 
      searchTerm.includes(area.toLowerCase())
    );
    
    if (matchedArea) {
      return gov.id;
    }
  }
  
  return null;
};

const Checkout = () => {
  // eslint-disable-next-line no-unused-vars
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contactError, setContactError] = useState(null); // Separate error for contact field
  
  // Form states
  const [contact, setContact] = useState({
    emailOrPhone: '',
    emailOffers: false,
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
  
  // Save info checkbox state
  const [saveInfo, setSaveInfo] = useState(false);
  
  const [showMorePayments, setShowMorePayments] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('');
  const [billingAddress, setBillingAddress] = useState('same');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  
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

  // Load saved data from localStorage on mount
  useEffect(() => {
    // Load saved contact info
    const savedContact = localStorage.getItem('checkoutContact');
    if (savedContact) {
      try {
        const parsedContact = JSON.parse(savedContact);
        setContact(prev => ({
          ...prev,
          emailOrPhone: parsedContact.emailOrPhone || '',
          emailOffers: parsedContact.emailOffers || false
        }));
      } catch (e) {
        console.log('Error loading saved contact');
      }
    }

    // Load saved delivery info
    const savedDelivery = localStorage.getItem('checkoutDelivery');
    if (savedDelivery) {
      try {
        const parsedDelivery = JSON.parse(savedDelivery);
        setDelivery(prev => ({
          ...prev,
          ...parsedDelivery
        }));
        setSaveInfo(true); // If there's saved data, check the box
      } catch (e) {
        console.log('Error loading saved delivery');
      }
    }

    // Load delivery instructions from cart
    const savedInstructions = localStorage.getItem('deliveryInstructions');
    if (savedInstructions) {
      setDeliveryInstructions(savedInstructions);
    }
  }, []);

  // Save contact info when emailOffers changes
  useEffect(() => {
    if (contact.emailOffers && contact.emailOrPhone) {
      localStorage.setItem('checkoutContact', JSON.stringify({
        emailOrPhone: contact.emailOrPhone,
        emailOffers: contact.emailOffers
      }));
    } else if (!contact.emailOffers) {
      localStorage.removeItem('checkoutContact');
    }
  }, [contact.emailOffers, contact.emailOrPhone]);

  // Save delivery info when saveInfo is checked
  useEffect(() => {
    if (saveInfo) {
      const deliveryData = {
        firstName: delivery.firstName,
        lastName: delivery.lastName,
        address: delivery.address,
        apartment: delivery.apartment,
        postalCode: delivery.postalCode,
        city: delivery.city,
        governorate: delivery.governorate,
        phone: delivery.phone
      };
      localStorage.setItem('checkoutDelivery', JSON.stringify(deliveryData));
    } else {
      // If unchecked, remove saved delivery data
      localStorage.removeItem('checkoutDelivery');
    }
  }, [saveInfo, delivery]);

  // ============ AUTO-FILL GOVERNORATE BASED ON CITY ============
  useEffect(() => {
    if (delivery.city && delivery.city.length >= 2) {
      const matchedGovernorate = findGovernorateByCity(delivery.city);
      if (matchedGovernorate && matchedGovernorate !== delivery.governorate) {
        setDelivery(prev => ({
          ...prev,
          governorate: matchedGovernorate
        }));
      }
    }
  }, [delivery.city, delivery.governorate]);

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
    
    // ============ REAL-TIME VALIDATION FOR EMAIL/PHONE ============
    if (name === 'emailOrPhone') {
      // Only validate if user has typed something
      if (value.trim().length > 0) {
        const validation = validateEmailOrPhone(value);
        if (!validation.valid) {
          setContactError(validation.message);
        } else {
          setContactError(null);
        }
      } else {
        setContactError(null);
      }
    }
  };

  // Validate contact on blur
  const handleContactBlur = () => {
    if (contact.emailOrPhone.trim()) {
      const validation = validateEmailOrPhone(contact.emailOrPhone);
      if (!validation.valid) {
        setContactError(validation.message);
      } else {
        setContactError(null);
      }
    }
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDelivery(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save info checkbox change
  const handleSaveInfoChange = (e) => {
    setSaveInfo(e.target.checked);
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

  // ============ GUEST CHECKOUT ENABLED - Create order and redirect to Hesabe ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setContactError(null);
    
    // ============ VALIDATE EMAIL OR PHONE ============
    const contactValidation = validateEmailOrPhone(contact.emailOrPhone);
    if (!contactValidation.valid) {
      setContactError(contactValidation.message);
      return;
    }

    if (!delivery.governorate) {
      setError(currentLang === 'ar' ? 'يرجى اختيار المحافظة' : 'Please select a governorate');
      return;
    }

    if (!delivery.address) {
      setError(currentLang === 'ar' ? 'يرجى إدخال العنوان' : 'Please enter delivery address');
      return;
    }

    if (!delivery.phone) {
      setError(currentLang === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number');
      return;
    }

    // Validate recipient phone
    if (!isValidPhone(delivery.phone)) {
      setError(currentLang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح للمستلم' : 'Please enter a valid recipient phone number');
      return;
    }

    if (!delivery.lastName) {
      setError(currentLang === 'ar' ? 'يرجى إدخال اسم المستلم' : 'Please enter recipient name');
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

    // Save contact info if emailOffers is checked
    if (contact.emailOffers && contact.emailOrPhone) {
      localStorage.setItem('checkoutContact', JSON.stringify({
        emailOrPhone: contact.emailOrPhone,
        emailOffers: contact.emailOffers
      }));
    }

    // Save delivery info if saveInfo is checked
    if (saveInfo) {
      const deliveryData = {
        firstName: delivery.firstName,
        lastName: delivery.lastName,
        address: delivery.address,
        apartment: delivery.apartment,
        postalCode: delivery.postalCode,
        city: delivery.city,
        governorate: delivery.governorate,
        phone: delivery.phone
      };
      localStorage.setItem('checkoutDelivery', JSON.stringify(deliveryData));
    }

    try {
      // ============ TRANSFORM CART ITEMS FOR BACKEND ============
      // Extract sender info from first item (sender is same for all items in cart)
      const firstItemWithSender = cartItems.find(item => item.senderInfo);
      let senderName = '';
      let senderPhone = '';
      
      if (firstItemWithSender && firstItemWithSender.senderInfo) {
        // senderInfo format: "tunga and 7836733333"
        const senderParts = firstItemWithSender.senderInfo.split(' and ');
        if (senderParts.length === 2) {
          senderName = senderParts[0].trim();
          senderPhone = senderParts[1].trim();
        } else {
          senderName = firstItemWithSender.senderInfo;
        }
      }

      // Transform cart items to backend format
      const transformedItems = cartItems.map(item => {
        // Get the product UUID - try multiple possible field names
        const productId = item.productId || item.id || item.product_id;
        
        console.log('Cart item:', item);
        console.log('Product ID found:', productId);
        
        return {
          productId: productId,
          quantity: item.quantity || 1,
          cardMessage: item.cardMessage || '',
          deliveryDate: item.deliveryDate || '',
          deliveryTimeSlot: item.deliveryTime || '',
          specialInstructions: item.specialInstructions || ''
        };
      });

      // Get governorate display name
      const selectedGov = governorates.find(g => g.id === delivery.governorate);
      const governorateName = selectedGov ? (currentLang === 'ar' ? selectedGov.nameAr : selectedGov.name) : delivery.governorate;

      // Build full address
      const fullAddress = delivery.address + (delivery.apartment ? ', ' + delivery.apartment : '');

      // Determine if contact is email or phone
      const isEmail = contactValidation.type === 'email';

      // Build order payload matching backend OrderDto.CreateOrderRequest
      // Works for both logged-in users and guests
      const orderPayload = {
        items: transformedItems,
        senderName: senderName || `${delivery.firstName || ''} ${delivery.lastName}`.trim() || 'Customer',
        senderPhone: senderPhone || delivery.phone,
        recipientName: `${delivery.firstName || ''} ${delivery.lastName}`.trim() || 'Recipient',
        recipientPhone: delivery.phone,
        deliveryAddress: fullAddress,
        deliveryArea: delivery.city || governorateName,
        deliveryCity: governorateName,
        instructionMessage: deliveryInstructions || '',
        deliveryNotes: delivery.apartment || '',
        cardMessage: cartItems[0]?.cardMessage || '',
        deliveryFee: shippingCost,
        // Guest checkout fields - properly parsed
        guestEmail: isEmail ? contact.emailOrPhone.trim() : null,
        guestPhone: !isEmail ? contact.emailOrPhone.trim() : delivery.phone,
        isGuestOrder: !isAuthenticated
      };
      
      console.log('========== ORDER PAYLOAD BEING SENT ==========');
      console.log(JSON.stringify(orderPayload, null, 2));
      console.log('Is Guest Order:', !isAuthenticated);
      console.log('Contact Type:', contactValidation.type);
      console.log('===============================================');
      
      // Create order using api service
      // The backend should handle both authenticated and guest orders
      const orderResponse = await api.post('/orders/guest', orderPayload);
      
      console.log('Order API Response:', orderResponse);
      
      // Extract order ID from response - handle different response structures
      let orderId = null;
      if (orderResponse?.data?.data?.orderId) {
        orderId = orderResponse.data.data.orderId;
      } else if (orderResponse?.data?.orderId) {
        orderId = orderResponse.data.orderId;
      } else if (orderResponse?.data?.id) {
        orderId = orderResponse.data.id;
      } else if (orderResponse?.orderId) {
        orderId = orderResponse.orderId;
      } else if (orderResponse?.id) {
        orderId = orderResponse.id;
      } else if (orderResponse?.data?.orderNumber) {
        orderId = orderResponse.data.orderNumber;
      }
      
      if (!orderId) {
        console.error('Order response structure:', orderResponse);
        throw new Error('Failed to get order ID from response');
      }
      
      console.log('Extracted orderId:', orderId);
      
      // ============ INITIATE PAYMENT WITH HESABE ============
      const paymentPayload = {
        orderId: orderId,
        showAllPaymentMethods: true, // Show all payment options (KNET, Visa, Mastercard, Apple Pay, Google Pay, etc.)
        customerEmail: isEmail ? contact.emailOrPhone.trim() : null,
        customerPhone: delivery.phone,
        customerName: `${delivery.firstName || ''} ${delivery.lastName}`.trim(),
        deviceType: 'WEB'
      };
      
      console.log('========== PAYMENT PAYLOAD BEING SENT ==========');
      console.log(JSON.stringify(paymentPayload, null, 2));
      console.log('=================================================');
      
      // Initiate payment - works for both guest and authenticated users
      const paymentResponse = await api.post('/payments/guest/initiate', paymentPayload);
      
      console.log('Payment API Response:', paymentResponse);

      // Extract checkout URL from response - handle different response structures
      let checkoutUrl = null;
      let paymentReference = null;
      
      // Try different response structures
      if (paymentResponse?.data?.checkoutUrl) {
        checkoutUrl = paymentResponse.data.checkoutUrl;
        paymentReference = paymentResponse.data.paymentReference;
      } else if (paymentResponse?.checkoutUrl) {
        checkoutUrl = paymentResponse.checkoutUrl;
        paymentReference = paymentResponse.paymentReference;
      } else if (paymentResponse?.data?.data?.checkoutUrl) {
        checkoutUrl = paymentResponse.data.data.checkoutUrl;
        paymentReference = paymentResponse.data.data.paymentReference;
      }
      
      // Check if payment was successful
      const isSuccess = paymentResponse?.success || 
                        paymentResponse?.data?.success || 
                        checkoutUrl !== null;

      if (isSuccess && checkoutUrl) {
        // Store pending order info for verification after payment
        localStorage.setItem('pendingOrder', JSON.stringify({
          orderId: orderId,
          paymentReference: paymentReference,
          total: total,
          items: cartItems.length,
          timestamp: new Date().toISOString(),
          isGuestOrder: !isAuthenticated,
          guestEmail: isEmail ? contact.emailOrPhone.trim() : null
        }));
        
        console.log('Redirecting to Hesabe checkout:', checkoutUrl);
        
        // Redirect to Hesabe payment page
        window.location.href = checkoutUrl;
      } else {
        // Payment initiation failed
        const errorMessage = paymentResponse?.message || 
                             paymentResponse?.data?.message || 
                             paymentResponse?.errorMessage ||
                             paymentResponse?.data?.errorMessage ||
                             'Failed to initiate payment';
        throw new Error(errorMessage);
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      
      // Parse error message
      let errorMessage = err.message;
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage || (currentLang === 'ar' 
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
      emailOrPhone: 'Email or Phone Number',
      emailOffers: 'Email me with news and offers',
      delivery: 'Delivery',
      countryRegion: 'Country/Region',
      firstName: 'Recipient First Name (Optional)',
      lastName: 'Recipient Last Name',
      address: 'Recipient Address: Area, Block, Street, Jeddah, House No...',
      apartment: 'Apartment, suite, etc. (optional)',
      postalCode: 'Postal code (optional)',
      pinCode: 'PIN code',
      city: 'City / Area',
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
      saveInfo: 'Save this information for next time',
      enterShipping: 'Enter shipping address',
      guestCheckout: 'Continue as Guest',
      or: 'or',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
    },
    ar: {
      checkout: 'الدفع',
      contact: 'معلومات الاتصال',
      signIn: 'تسجيل الدخول',
      emailOrPhone: 'البريد الإلكتروني أو رقم الهاتف',
      emailOffers: 'أرسل لي العروض والأخبار عبر البريد',
      delivery: 'التوصيل',
      countryRegion: 'الدولة/المنطقة',
      firstName: 'الاسم الأول للمستلم (اختياري)',
      lastName: 'اسم العائلة للمستلم',
      address: 'عنوان المستلم: المنطقة، القطعة، الشارع، الجادة، رقم المنزل...',
      apartment: 'شقة، جناح، إلخ (اختياري)',
      postalCode: 'الرمز البريدي (اختياري)',
      pinCode: 'الرمز البريدي',
      city: 'المدينة / المنطقة',
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
      saveInfo: 'احفظ هذه المعلومات للمرة القادمة',
      enterShipping: 'أدخل عنوان الشحن',
      guestCheckout: 'المتابعة كضيف',
      or: 'أو',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      invalidPhone: 'يرجى إدخال رقم هاتف صحيح',
      cityHint: 'اكتب اسم المنطقة لاختيار المحافظة تلقائياً'
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
                  <Link to="/account?redirect=checkout" className="sign-in-link">{text.signIn}</Link>
                )}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="emailOrPhone"
                  value={contact.emailOrPhone}
                  onChange={handleContactChange}
                  onBlur={handleContactBlur}
                  placeholder={text.emailOrPhone}
                  required
                  className={`checkout-input ${contactError ? 'input-error' : ''}`}
                />
                {/* Contact field error message - Shows validation error */}
                {contactError && (
                  <span className="field-error">{contactError}</span>
                )}
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
                    title={text.cityHint}
                  />
                  {/* City hint for auto-fill */}
                  <span className="field-hint">{text.cityHint}</span>
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
                  checked={saveInfo}
                  onChange={handleSaveInfoChange}
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

            {/* Payment Section - Matching exact Hesabe payment methods */}
            <section className="checkout-section payment-section">
              <h2>{text.payment}</h2>
              <div className="payment-secure-row">
                <p className="payment-secure-text">{text.paymentSecure}</p>
              </div>
              
              <div className="payment-box">
                <div className="payment-header">
                  <span className="payment-name">{text.hesabeGateway}</span>
                  <div className="payment-icons">
                    {/* Apple Pay */}
                    <span className="payment-icon">
                      <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                        <rect width="34" height="22" rx="3" fill="#000"/>
                        <path d="M8.5 7.2C8.8 6.8 9 6.3 8.9 5.8C8.5 5.8 8 6.1 7.7 6.5C7.4 6.8 7.2 7.4 7.3 7.9C7.7 7.9 8.2 7.6 8.5 7.2Z" fill="white"/>
                        <path d="M8.9 8C8.2 8 7.6 8.4 7.3 8.4C6.9 8.4 6.4 8 5.8 8C4.9 8 4.1 8.5 3.7 9.3C2.8 10.9 3.5 13.3 4.4 14.6C4.8 15.3 5.3 16 6 16C6.6 16 6.8 15.6 7.5 15.6C8.2 15.6 8.4 16 9 16C9.7 16 10.1 15.3 10.5 14.6C11 13.8 11.2 13 11.2 12.9C11.2 12.9 10 12.4 10 11C10 9.8 11 9.2 11 9.2C11 9.2 10.3 8 8.9 8Z" fill="white"/>
                        <text x="12" y="14" fill="white" fontSize="7" fontWeight="500" fontFamily="Arial">Pay</text>
                      </svg>
                    </span>
                    {/* Visa/Mastercard */}
                    <span className="payment-icon">
                      <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                        <rect width="34" height="22" rx="3" fill="#1A1F71"/>
                        <circle cx="12" cy="11" r="5" fill="#EB001B" opacity="0.9"/>
                        <circle cx="18" cy="11" r="5" fill="#F79E1B" opacity="0.9"/>
                        <text x="24" y="14" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">V</text>
                      </svg>
                    </span>
                    {/* Google Pay */}
                    <span className="payment-icon">
                      <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                        <rect width="34" height="22" rx="3" fill="#ffffff" stroke="#E0E0E0" strokeWidth="0.5"/>
                        <path d="M12.5 10.7C12.5 10.5 12.5 10.2 12.4 10H9.3V11.3H11.1C11 11.8 10.8 12.1 10.4 12.4V13.3H11.5C12.1 12.7 12.5 11.8 12.5 10.7Z" fill="#4285F4"/>
                        <path d="M9.3 14.2C10.4 14.2 11.3 13.8 11.5 13.3L10.4 12.4C10.1 12.6 9.7 12.8 9.3 12.8C8.2 12.8 7.4 12 7.2 11H6V11.9C6.5 13.2 7.8 14.2 9.3 14.2Z" fill="#34A853"/>
                        <path d="M7.2 11C7.1 10.8 7.1 10.5 7.1 10.2C7.1 9.9 7.1 9.7 7.2 9.4V8.5H6C5.7 9.1 5.6 9.6 5.6 10.2C5.6 10.8 5.7 11.4 6 12L7.2 11Z" fill="#FBBC04"/>
                        <path d="M9.3 7.7C9.8 7.7 10.3 7.9 10.6 8.2L11.5 7.3C10.9 6.8 10.2 6.4 9.3 6.4C7.8 6.4 6.5 7.3 6 8.6L7.2 9.5C7.4 8.5 8.2 7.7 9.3 7.7Z" fill="#EA4335"/>
                        <text x="14" y="13" fill="#5F6368" fontSize="6" fontWeight="500" fontFamily="Arial">Pay</text>
                      </svg>
                    </span>
                    {/* AMEX */}
                    <span className="payment-icon">
                      <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                        <rect width="34" height="22" rx="3" fill="#006FCF"/>
                        <text x="4" y="14" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="Arial">AMEX</text>
                      </svg>
                    </span>
                    
                    {/* Show Apple Pay (Knet) and KNET when +2 is clicked */}
                    {showMorePayments && (
                      <>
                        {/* Apple Pay (Knet) */}
                        <span className="payment-icon">
                          <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                            <rect width="34" height="22" rx="3" fill="#000"/>
                            <path d="M5.5 5.2C5.8 4.8 6 4.3 5.9 3.8C5.5 3.8 5 4.1 4.7 4.5C4.4 4.8 4.2 5.4 4.3 5.9C4.7 5.9 5.2 5.6 5.5 5.2Z" fill="white"/>
                            <path d="M5.9 6C5.2 6 4.6 6.4 4.3 6.4C3.9 6.4 3.4 6 2.8 6C1.9 6 1.1 6.5 0.7 7.3C-0.2 8.9 0.5 11.3 1.4 12.6C1.8 13.3 2.3 14 3 14C3.6 14 3.8 13.6 4.5 13.6C5.2 13.6 5.4 14 6 14C6.7 14 7.1 13.3 7.5 12.6C8 11.8 8.2 11 8.2 10.9C8.2 10.9 7 10.4 7 9C7 7.8 8 7.2 8 7.2C8 7.2 7.3 6 5.9 6Z" fill="white"/>
                            <text x="9" y="7" fill="white" fontSize="4" fontFamily="Arial">Pay</text>
                            <rect x="9" y="9" width="24" height="10" rx="2" fill="#00205B"/>
                            <text x="12" y="16" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="Arial">KNET</text>
                          </svg>
                        </span>
                        {/* KNET */}
                        <span className="payment-icon">
                          <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                            <rect width="34" height="22" rx="3" fill="#00205B"/>
                            <text x="6" y="9" fill="#fff" fontSize="4" fontFamily="Arial">شبكة</text>
                            <text x="5" y="16" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="Arial">KNET</text>
                          </svg>
                        </span>
                      </>
                    )}
                    
                    {/* +2 Button - Click to show/hide Apple Pay (Knet) & KNET */}
                    <button 
                      type="button"
                      className={`more-payment-btn ${showMorePayments ? 'active' : ''}`}
                      onClick={() => setShowMorePayments(!showMorePayments)}
                      aria-label="Show more payment methods"
                    >
                      {showMorePayments ? '−2' : '+2'}
                    </button>
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
                  <div className="product-details">
                    <span className="product-name">
                      {currentLang === 'ar' ? item.nameAr : item.nameEn}
                    </span>
                    <span className="product-price-inline">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="price-original">{text.kwd} {(item.originalPrice * item.quantity).toFixed(3)}</span>
                      )}
                      <span className="price-current">{text.kwd} {(item.price * item.quantity).toFixed(3)}</span>
                    </span>
                    {item.deliveryDate && (
                      <span className="product-meta-info">
                        <span className="meta-label">{text.deliveryDate}:</span>
                        <span className="meta-value">{item.deliveryDate}</span>
                      </span>
                    )}
                    {item.deliveryTime && (
                      <span className="product-meta-info">
                        <span className="meta-label">{text.deliveryTime}:</span>
                        <span className="meta-value">{item.deliveryTime}</span>
                      </span>
                    )}
                    {item.cardMessage && (
                      <div className="product-card-message">
                        <span className="card-icon">💌</span>
                        <div className="card-content">
                          <span className="card-label">{text.cardMessage}:</span>
                          <span className="card-text">"{item.cardMessage}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="order-totals">
              <div className="totals-row">
                <span className="totals-label">{text.subtotal}</span>
                <span className="totals-value">{text.kwd} {subtotal.toFixed(3)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">{text.shipping}</span>
                <span className="totals-value totals-muted">
                  {delivery.governorate 
                    ? `${text.kwd} ${shippingCost.toFixed(3)}` 
                    : text.enterShipping
                  }
                </span>
              </div>
              <div className="totals-row total-final">
                <span className="totals-label">{text.total}</span>
                <span className="totals-value">{text.kwd} {total.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;