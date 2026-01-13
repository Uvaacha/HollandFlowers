import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hollandflowers.onrender.com/api/v1';

const Header = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [productResults, setProductResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const userDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { getCartCount, isCartOpen } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // Toggle mobile submenu
  const toggleMobileSubmenu = (menuName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  // Rotating banner messages
  const bannerMessages = {
    en: [
      '⭐ 4.9/5 Stars - See What Our Customers Say',
      '⭐ Trusted by 1,000+ Happy Customers in Kuwait',
      'The Simplest Way to Send "LOVE" in Kuwait 💐',
    ],
    ar: [
      '⭐ 4.9/5 نجوم - شاهد ما يقوله عملاؤنا',
      '⭐ موثوق من قبل أكثر من 1000 عميل سعيد في الكويت',
      'أبسط طريقة لإرسال "الحب" في الكويت 💐',
    ]
  };

  // Fetch all products on component mount for search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products?size=500`);
        if (response.ok) {
          const data = await response.json();
          // Handle different API response structures
          const products = data.data?.content || data.content || data.data || data || [];
          setAllProducts(Array.isArray(products) ? products : []);
        }
      } catch (error) {
        console.error('Error fetching products for search:', error);
      }
    };
    fetchProducts();
  }, []);

  // Rotate banner every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % 3);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown]);

  const translations = {
    en: {
      banner: 'Send Love in Kuwait 💐',
      logo: 'FLORA KUWAIT',
      home: 'Home',
      pickForYou: 'Pick For You',
      offers: 'Offers',
      offer50: '50% Discount',
      flowers: 'Flowers',
      bouquet: 'Bouquet',
      addOns: "Add On's",
      combos: 'Combos',
      occasions: 'Occasions',
      valentineDay: 'Valentine Day Special',
      mothersDay: "Mother's Day Specials",
      ramadan: 'Blessed Month of Ramadan',
      eidCollection: 'Eid Collection',
      tulips: 'Tulips',
      liliumArrangements: 'Lilium Arrangements',
      hollandSmall: 'Holland Small Arrangements',
      vaseArrangement: 'Vase Arrangement',
      babyRoses: 'Baby Roses',
      singleFlower: 'Single Flower',
      hollandStyle: 'Holland Style',
      rosesPetals: 'Roses Petals',
      flowersVase10to25: 'Flowers Vase 10 To 25',
      cylinderVases: 'Cylinder Vases 10 To 20',
      flowersWithMabkhar: 'Flowers With Mabkhar',
      flowersWithPerfume: 'Flowers With Perfume',
      flowerBouquets: 'Flower Bouquets',
      handBouquets: 'Hand Bouquets',
      orchidPlants: 'Orchid Plants',
      liliumBouquets: 'Lilium Bouquets',
      birthdayBouquet: 'Birthday Bouquet',
      yellowRoseBouquet: 'Yellow Rose Bouquet',
      grandBouquet: 'Grand Bouquet',
      heliumBalloons: 'Helium Balloons',
      crownForHead: 'Crown for Head',
      acrylicToppers: 'Acrylic Celebration Toppers',
      searchPlaceholder: 'Search for flowers, bouquets, gifts...',
      noResults: 'No results found',
      searchResultsTitle: 'Search Results',
      login: 'Log in',
      logout: 'Logout',
      myAccount: 'My Account',
      myOrders: 'My Orders',
      profile: 'Profile',
      welcome: 'Welcome',
      language: 'English',
      categories: 'Categories',
      products: 'Products',
      searching: 'Searching...',
      viewAll: 'View All Results',
    },
    ar: {
      banner: 'أرسل الحب في الكويت 💐',
      logo: 'فلورا كويت',
      home: 'الرئيسية',
      pickForYou: 'اختيارنا لك',
      offers: 'العروض',
      offer50: 'خصم 50٪',
      flowers: 'الزهور',
      bouquet: 'الباقات',
      addOns: 'الإضافات',
      combos: 'الباقات المميزة',
      occasions: 'المناسبات',
      valentineDay: 'عيد الحب الخاص',
      mothersDay: 'عروض عيد الأم',
      ramadan: 'شهر رمضان المبارك',
      eidCollection: 'مجموعة العيد',
      tulips: 'التوليب',
      liliumArrangements: 'ترتيبات الزنبق',
      hollandSmall: 'ترتيبات هولندا الصغيرة',
      vaseArrangement: 'ترتيب المزهريات',
      babyRoses: 'ورود صغيرة',
      singleFlower: 'زهرة واحدة',
      hollandStyle: 'أسلوب هولندا',
      rosesPetals: 'بتلات الورد',
      flowersVase10to25: 'مزهرية الزهور من 10 إلى 25',
      cylinderVases: 'المزهريات الأسطوانية من 10 إلى 20',
      flowersWithMabkhar: 'زهور مع مبخرة',
      flowersWithPerfume: 'زهور مع عطر',
      flowerBouquets: 'باقات الزهور',
      handBouquets: 'باقات يدوية',
      orchidPlants: 'نباتات الأوركيد',
      liliumBouquets: 'باقات الزنبق',
      birthdayBouquet: 'باقة عيد الميلاد',
      yellowRoseBouquet: 'باقة الورد الأصفر',
      grandBouquet: 'الباقة الكبرى',
      heliumBalloons: 'بالونات الهيليوم',
      crownForHead: 'تاج للرأس',
      acrylicToppers: 'توبر احتفال أكريليك',
      searchPlaceholder: 'ابحث عن الزهور، الباقات، الهدايا...',
      noResults: 'لا توجد نتائج',
      searchResultsTitle: 'نتائج البحث',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      myAccount: 'حسابي',
      myOrders: 'طلباتي',
      profile: 'الملف الشخصي',
      welcome: 'مرحباً',
      language: 'عربي',
      categories: 'الفئات',
      products: 'المنتجات',
      searching: 'جاري البحث...',
      viewAll: 'عرض جميع النتائج',
    }
  };

  const t = translations[currentLang];

  // All searchable categories/pages with their routes and keywords
  const searchableItems = [
    // Occasions
    { nameEn: 'Valentine Day Special', nameAr: 'عيد الحب الخاص', path: '/valentine-special', category: 'Occasions', categoryAr: 'المناسبات', icon: '❤️', keywords: ['valentine', 'love', 'romantic', 'heart', 'red roses', 'حب', 'فالنتاين', 'رومانسي'] },
    { nameEn: "Mother's Day Specials", nameAr: 'عروض عيد الأم', path: '/mothers-day', category: 'Occasions', categoryAr: 'المناسبات', icon: '💐', keywords: ['mother', 'mom', 'mum', 'mama', 'أم', 'ماما', 'عيد الأم'] },
    { nameEn: 'Blessed Month of Ramadan', nameAr: 'شهر رمضان المبارك', path: '/ramadan', category: 'Occasions', categoryAr: 'المناسبات', icon: '🌙', keywords: ['ramadan', 'رمضان', 'iftar', 'إفطار', 'islamic'] },
    { nameEn: 'Eid Collection', nameAr: 'مجموعة العيد', path: '/eid-collection', category: 'Occasions', categoryAr: 'المناسبات', icon: '🎉', keywords: ['eid', 'عيد', 'celebration', 'احتفال', 'fitr', 'adha'] },
    { nameEn: 'Birthday Flowers', nameAr: 'زهور عيد الميلاد', path: '/birthday-bouquet', category: 'Occasions', categoryAr: 'المناسبات', icon: '🎂', keywords: ['birthday', 'عيد ميلاد', 'celebration', 'party', 'حفلة'] },
    { nameEn: 'Anniversary Flowers', nameAr: 'زهور الذكرى السنوية', path: '/grand-bouquet', category: 'Occasions', categoryAr: 'المناسبات', icon: '💕', keywords: ['anniversary', 'ذكرى', 'wedding anniversary', 'زواج'] },
    { nameEn: 'Congratulations', nameAr: 'تهنئة', path: '/bouquets', category: 'Occasions', categoryAr: 'المناسبات', icon: '🎊', keywords: ['congratulations', 'congrats', 'تهنئة', 'مبروك'] },
    { nameEn: 'Get Well Soon', nameAr: 'سلامات', path: '/bouquets', category: 'Occasions', categoryAr: 'المناسبات', icon: '💚', keywords: ['get well', 'recovery', 'سلامات', 'شفاء'] },
    { nameEn: 'Sympathy Flowers', nameAr: 'زهور التعزية', path: '/bouquets', category: 'Occasions', categoryAr: 'المناسبات', icon: '🤍', keywords: ['sympathy', 'condolence', 'تعزية', 'عزاء'] },
    { nameEn: 'Graduation', nameAr: 'تخرج', path: '/bouquets', category: 'Occasions', categoryAr: 'المناسبات', icon: '🎓', keywords: ['graduation', 'تخرج', 'graduate', 'diploma'] },
    
    // Flowers - Types
    { nameEn: 'Tulips', nameAr: 'التوليب', path: '/tulips', category: 'Flowers', categoryAr: 'الزهور', icon: '🌷', keywords: ['tulip', 'tulips', 'توليب', 'spring flowers'] },
    { nameEn: 'Roses', nameAr: 'ورد', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🌹', keywords: ['rose', 'roses', 'ورد', 'وردة', 'red rose', 'white rose', 'pink rose', 'ورد أحمر', 'ورد أبيض', 'ورد وردي'] },
    { nameEn: 'Red Roses', nameAr: 'ورد أحمر', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🌹', keywords: ['red rose', 'red roses', 'ورد أحمر', 'romantic', 'love'] },
    { nameEn: 'White Roses', nameAr: 'ورد أبيض', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🤍', keywords: ['white rose', 'white roses', 'ورد أبيض', 'pure', 'wedding'] },
    { nameEn: 'Pink Roses', nameAr: 'ورد وردي', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🌸', keywords: ['pink rose', 'pink roses', 'ورد وردي', 'romantic'] },
    { nameEn: 'Yellow Rose Bouquet', nameAr: 'باقة الورد الأصفر', path: '/yellow-rose-bouquet', category: 'Flowers', categoryAr: 'الزهور', icon: '🌻', keywords: ['yellow rose', 'yellow roses', 'ورد أصفر', 'friendship', 'صداقة'] },
    { nameEn: 'Orchids', nameAr: 'أوركيد', path: '/orchid-plants', category: 'Flowers', categoryAr: 'الزهور', icon: '🌺', keywords: ['orchid', 'orchids', 'أوركيد', 'exotic', 'elegant'] },
    { nameEn: 'Lilies', nameAr: 'زنبق', path: '/lilium-bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🌸', keywords: ['lily', 'lilies', 'lilium', 'زنبق', 'ليليوم'] },
    { nameEn: 'Sunflowers', nameAr: 'عباد الشمس', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🌻', keywords: ['sunflower', 'sunflowers', 'عباد الشمس', 'دوار الشمس', 'yellow', 'bright'] },
    { nameEn: 'Carnations', nameAr: 'قرنفل', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🌸', keywords: ['carnation', 'carnations', 'قرنفل'] },
    { nameEn: 'Gerbera', nameAr: 'جربيرا', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '🌼', keywords: ['gerbera', 'daisy', 'جربيرا'] },
    { nameEn: 'Mixed Flowers', nameAr: 'زهور مشكلة', path: '/bouquets', category: 'Flowers', categoryAr: 'الزهور', icon: '💐', keywords: ['mixed', 'assorted', 'مشكل', 'متنوع'] },
    { nameEn: 'Lilium Arrangements', nameAr: 'ترتيبات الزنبق', path: '/lilium-arrangement', category: 'Flowers', categoryAr: 'الزهور', icon: '🌸', keywords: ['lilium', 'lily arrangement', 'ترتيب زنبق'] },
    { nameEn: 'Holland Small Arrangements', nameAr: 'ترتيبات هولندا الصغيرة', path: '/holland-small', category: 'Flowers', categoryAr: 'الزهور', icon: '🌺', keywords: ['small', 'mini', 'صغير', 'holland'] },
    { nameEn: 'Vase Arrangement', nameAr: 'ترتيب المزهريات', path: '/vase-arrangement', category: 'Flowers', categoryAr: 'الزهور', icon: '🏺', keywords: ['vase', 'مزهرية', 'arrangement'] },
    { nameEn: 'Baby Roses', nameAr: 'ورود صغيرة', path: '/baby-roses', category: 'Flowers', categoryAr: 'الزهور', icon: '🌹', keywords: ['baby rose', 'mini rose', 'small rose', 'ورد صغير'] },
    { nameEn: 'Single Flower', nameAr: 'زهرة واحدة', path: '/single-flower', category: 'Flowers', categoryAr: 'الزهور', icon: '🌼', keywords: ['single', 'one flower', 'زهرة واحدة'] },
    { nameEn: 'Holland Style', nameAr: 'أسلوب هولندا', path: '/holland-style', category: 'Flowers', categoryAr: 'الزهور', icon: '🇳🇱', keywords: ['holland', 'dutch', 'هولندي'] },
    { nameEn: 'Roses Petals', nameAr: 'بتلات الورد', path: '/roses-petals', category: 'Flowers', categoryAr: 'الزهور', icon: '🌹', keywords: ['petals', 'rose petals', 'بتلات'] },
    { nameEn: 'Flowers Vase 10 To 25', nameAr: 'مزهرية الزهور من 10 إلى 25', path: '/flowers-vase-10-25', category: 'Flowers', categoryAr: 'الزهور', icon: '🏺', keywords: ['vase', 'مزهرية'] },
    { nameEn: 'Cylinder Vases 10 To 20', nameAr: 'المزهريات الأسطوانية من 10 إلى 20', path: '/cylinder-vases', category: 'Flowers', categoryAr: 'الزهور', icon: '🏺', keywords: ['cylinder', 'vase', 'أسطوانة', 'مزهرية'] },
    { nameEn: 'Flowers With Mabkhar', nameAr: 'زهور مع مبخرة', path: '/flowers-mabkhar', category: 'Flowers', categoryAr: 'الزهور', icon: '🪔', keywords: ['mabkhar', 'incense', 'مبخرة', 'بخور'] },
    { nameEn: 'Flowers With Perfume', nameAr: 'زهور مع عطر', path: '/combos/flowers-perfume', category: 'Flowers', categoryAr: 'الزهور', icon: '🌸', keywords: ['perfume', 'عطر', 'fragrance'] },
    
    // Bouquets
    { nameEn: 'Flower Bouquets', nameAr: 'باقات الزهور', path: '/bouquets', category: 'Bouquets', categoryAr: 'الباقات', icon: '💐', keywords: ['bouquet', 'باقة', 'bunch', 'flowers'] },
    { nameEn: 'Hand Bouquets', nameAr: 'باقات يدوية', path: '/hand-bouquets', category: 'Bouquets', categoryAr: 'الباقات', icon: '💐', keywords: ['hand bouquet', 'باقة يدوية', 'hand tied'] },
    { nameEn: 'Orchid Plants', nameAr: 'نباتات الأوركيد', path: '/orchid-plants', category: 'Bouquets', categoryAr: 'الباقات', icon: '🌺', keywords: ['orchid', 'plant', 'أوركيد', 'نبات'] },
    { nameEn: 'Lilium Bouquets', nameAr: 'باقات الزنبق', path: '/lilium-bouquets', category: 'Bouquets', categoryAr: 'الباقات', icon: '🌸', keywords: ['lilium', 'lily', 'زنبق', 'ليليوم'] },
    { nameEn: 'Birthday Bouquet', nameAr: 'باقة عيد الميلاد', path: '/birthday-bouquet', category: 'Bouquets', categoryAr: 'الباقات', icon: '🎂', keywords: ['birthday', 'عيد ميلاد', 'celebration'] },
    { nameEn: 'Grand Bouquet', nameAr: 'الباقة الكبرى', path: '/grand-bouquet', category: 'Bouquets', categoryAr: 'الباقات', icon: '👑', keywords: ['grand', 'large', 'luxury', 'فاخر', 'كبير'] },
    { nameEn: 'Luxury Bouquets', nameAr: 'باقات فاخرة', path: '/grand-bouquet', category: 'Bouquets', categoryAr: 'الباقات', icon: '💎', keywords: ['luxury', 'premium', 'فاخر', 'premium', 'expensive'] },
    { nameEn: 'Wedding Bouquets', nameAr: 'باقات الزفاف', path: '/grand-bouquet', category: 'Bouquets', categoryAr: 'الباقات', icon: '💒', keywords: ['wedding', 'bridal', 'زفاف', 'عروس', 'bride'] },
    
    // Add-Ons
    { nameEn: 'Helium Balloons', nameAr: 'بالونات الهيليوم', path: '/add-ons/helium-balloons', category: 'Add-Ons', categoryAr: 'الإضافات', icon: '🎈', keywords: ['balloon', 'balloons', 'helium', 'بالون', 'بالونات', 'هيليوم'] },
    { nameEn: 'Crown for Head', nameAr: 'تاج للرأس', path: '/add-ons/crown-for-head', category: 'Add-Ons', categoryAr: 'الإضافات', icon: '👑', keywords: ['crown', 'tiara', 'تاج', 'princess'] },
    { nameEn: 'Acrylic Celebration Toppers', nameAr: 'توبر احتفال أكريليك', path: '/add-ons/acrylic-toppers', category: 'Add-Ons', categoryAr: 'الإضافات', icon: '🎉', keywords: ['topper', 'acrylic', 'توبر', 'أكريليك', 'cake topper'] },
    { nameEn: 'Teddy Bear', nameAr: 'دبدوب', path: '/add-ons', category: 'Add-Ons', categoryAr: 'الإضافات', icon: '🧸', keywords: ['teddy', 'bear', 'دبدوب', 'دب', 'stuffed'] },
    
    // Combos & Gifts
    { nameEn: 'Gift Combos', nameAr: 'الباقات المميزة', path: '/combos', category: 'Combos', categoryAr: 'كومبو', icon: '🎁', keywords: ['gift', 'combo', 'هدية', 'كومبو', 'set'] },
    { nameEn: 'Flowers With Chocolates', nameAr: 'زهور مع شوكولاتة', path: '/combos/flowers-chocolates', category: 'Combos', categoryAr: 'كومبو', icon: '🍫', keywords: ['chocolate', 'chocolates', 'شوكولاتة', 'شوكولا', 'candy'] },
    { nameEn: 'Flowers With Perfume', nameAr: 'زهور مع عطر', path: '/combos/flowers-perfume', category: 'Combos', categoryAr: 'كومبو', icon: '✨', keywords: ['perfume', 'fragrance', 'عطر'] },
    { nameEn: 'Flowers With Cake', nameAr: 'زهور مع كيك', path: '/combos', category: 'Combos', categoryAr: 'كومبو', icon: '🎂', keywords: ['cake', 'كيك', 'birthday cake'] },
    
    // Other Pages
    { nameEn: 'Pick For You', nameAr: 'اختيارنا لك', path: '/pick-for-you', category: 'Featured', categoryAr: 'مميز', icon: '⭐', keywords: ['recommended', 'best', 'popular', 'مميز', 'أفضل'] },
    { nameEn: '50% Discount Offers', nameAr: 'خصم 50٪', path: '/offers', category: 'Offers', categoryAr: 'العروض', icon: '🏷️', keywords: ['discount', 'sale', 'offer', 'خصم', 'عرض', 'تخفيض', 'cheap', 'رخيص'] },
    { nameEn: 'Same Day Delivery', nameAr: 'توصيل في نفس اليوم', path: '/bouquets', category: 'Services', categoryAr: 'الخدمات', icon: '🚚', keywords: ['same day', 'delivery', 'fast', 'توصيل', 'سريع', 'نفس اليوم'] },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    if (savedLang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, []);

  const switchLanguage = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
    if (lang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setExpandedMenu(null);
    setShowUserDropdown(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setExpandedMenu(null);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  // Enhanced search functionality with products and keywords
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setProductResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      const searchTerm = query.toLowerCase().trim();
      const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);

      // Search categories/pages with keywords
      const filteredCategories = searchableItems.filter(item => {
        const nameMatch = item.nameEn.toLowerCase().includes(searchTerm) ||
                         item.nameAr.includes(query) ||
                         item.category.toLowerCase().includes(searchTerm) ||
                         item.categoryAr.includes(query);
        
        // Search in keywords
        const keywordMatch = item.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm) ||
          searchTerms.some(term => keyword.toLowerCase().includes(term))
        );

        return nameMatch || keywordMatch;
      });

      setSearchResults(filteredCategories);

      // Search actual products
      const filteredProducts = allProducts.filter(product => {
        if (!product || !product.productName) return false;
        
        const productName = (product.productName || '').toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        const categoryName = (product.categoryName || product.category?.categoryName || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();

        // Check if any search term matches
        return searchTerms.some(term => 
          productName.includes(term) ||
          productDesc.includes(term) ||
          categoryName.includes(term) ||
          sku.includes(term)
        ) || 
        productName.includes(searchTerm) ||
        productDesc.includes(searchTerm);
      }).slice(0, 8); // Limit to 8 products

      setProductResults(filteredProducts);
      setIsSearching(false);
    }, 300);
  }, [allProducts]);

  const handleSearchResultClick = (path) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setProductResults([]);
    navigate(path);
  };

  const handleProductClick = (product) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setProductResults([]);
    // Navigate to product detail page or category
    const categorySlug = product.categoryName?.toLowerCase().replace(/\s+/g, '-') || 'bouquets';
    navigate(`/product/${product.productId || product.id}`);
  };

  const handleViewAllResults = () => {
    const query = searchQuery;
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setProductResults([]);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setProductResults([]);
  };

  // Group search results by category
  const groupedResults = searchResults.reduce((acc, item) => {
    const category = currentLang === 'ar' ? item.categoryAr : item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Get first name for display
  const getFirstName = () => {
    if (!user?.name) return '';
    return user.name.split(' ')[0];
  };

  // Format price
  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(3)} KWD`;
  };

  return (
    <>
      <div className="top-banner">
        <span key={bannerIndex} className="banner-text">
          {bannerMessages[currentLang][bannerIndex]}
        </span>
      </div>

      <header className="main-header">
        <div className="header-container">
          {/* Mobile Menu Button - Left Side */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <Link to="/" className="logo" onClick={handleLinkClick}>
            <img 
              src="/Holland-logo.png" 
              alt={currentLang === 'ar' ? 'فلورا كويت' : 'Flora Kuwait'} 
              className="logo-image"
            />
            <span className="logo-text">
              {currentLang === 'ar' ? 'هولاند فلاورز' : 'Holland Flowers'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-menu">
              <li><Link to="/">{t.home}</Link></li>
              <li><Link to="/pick-for-you">{t.pickForYou}</Link></li>
              
              {/* Offers */}
              <li className="dropdown">
                <Link to="/offers">{t.offers}</Link>
                <div className="dropdown-content">
                  <Link to="/offers">{t.offer50}</Link>
                </div>
              </li>
              
              {/* Flowers */}
              <li className="dropdown mega-menu">
                <span className="dropdown-trigger">{t.flowers}</span>
                <div className="dropdown-content mega-dropdown">
                  <div className="mega-column">
                    <Link to="/tulips">{t.tulips}</Link>
                    <Link to="/lilium-arrangement">{t.liliumArrangements}</Link>
                    <Link to="/holland-small">{t.hollandSmall}</Link>
                    <Link to="/vase-arrangement">{t.vaseArrangement}</Link>
                    <Link to="/baby-roses">{t.babyRoses}</Link>
                    <Link to="/single-flower">{t.singleFlower}</Link>
                  </div>
                  <div className="mega-column">
                    <Link to="/holland-style">{t.hollandStyle}</Link>
                    <Link to="/roses-petals">{t.rosesPetals}</Link>
                    <Link to="/flowers-vase-10-25">{t.flowersVase10to25}</Link>
                    <Link to="/cylinder-vases">{t.cylinderVases}</Link>
                    <Link to="/flowers-mabkhar">{t.flowersWithMabkhar}</Link>
                    <Link to="/combos/flowers-perfume">{t.flowersWithPerfume}</Link>
                  </div>
                </div>
              </li>

              {/* Occasions - Separate Menu */}
              <li className="dropdown">
                <span className="dropdown-trigger">{t.occasions}</span>
                <div className="dropdown-content">
                  <Link to="/valentine-special">{t.valentineDay}</Link>
                  <Link to="/mothers-day">{t.mothersDay}</Link>
                  <Link to="/ramadan">{t.ramadan}</Link>
                  <Link to="/eid-collection">{t.eidCollection}</Link>
                </div>
              </li>

              {/* Bouquets */}
              <li className="dropdown mega-menu">
                <Link to="/bouquets">{t.bouquet}</Link>
                <div className="dropdown-content mega-dropdown">
                  <div className="mega-column">
                    <Link to="/bouquets">{t.flowerBouquets}</Link>
                    <Link to="/hand-bouquets">{t.handBouquets}</Link>
                    <Link to="/orchid-plants">{t.orchidPlants}</Link>
                    <Link to="/lilium-bouquets">{t.liliumBouquets}</Link>
                  </div>
                  <div className="mega-column">
                    <Link to="/birthday-bouquet">{t.birthdayBouquet}</Link>
                    <Link to="/yellow-rose-bouquet">{t.yellowRoseBouquet}</Link>
                    <Link to="/grand-bouquet">{t.grandBouquet}</Link>
                  </div>
                </div>
              </li>

              {/* Add-Ons */}
              <li className="dropdown mega-menu">
                <Link to="/add-ons">{t.addOns}</Link>
                <div className="dropdown-content mega-dropdown">
                  <div className="mega-column">
                    <Link to="/add-ons/helium-balloons">{t.heliumBalloons}</Link>
                    <Link to="/add-ons/crown-for-head">{t.crownForHead}</Link>
                    <Link to="/add-ons/acrylic-toppers">{t.acrylicToppers}</Link>
                  </div>
                </div>
              </li>

              {/* Combos */}
              <li className="dropdown">
                <Link to="/combos">{t.combos}</Link>
                <div className="dropdown-content">
                  <Link to="/combos">{currentLang === 'ar' ? 'جميع الكومبو' : 'All Combos'}</Link>
                  <Link to="/combos/flowers-perfume">{t.flowersWithPerfume}</Link>
                  <Link to="/combos/flowers-chocolates">{currentLang === 'ar' ? 'زهور مع شوكولاتة' : 'Flowers & Chocolates'}</Link>
                </div>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className="language-switcher desktop-only">
              <span 
                className={`lang-option ${currentLang === 'en' ? 'active' : ''}`}
                onClick={() => switchLanguage('en')}
              >
                English
              </span>
              <span className="lang-separator">|</span>
              <span 
                className={`lang-option ${currentLang === 'ar' ? 'active' : ''}`}
                onClick={() => switchLanguage('ar')}
              >
                عربي
              </span>
            </div>

            <button className="icon-button" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            {/* User Account Section - Desktop */}
            {isAuthenticated ? (
              <div className="user-menu-wrapper desktop-only" ref={userDropdownRef}>
                <button 
                  className="user-menu-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.name} />
                    ) : (
                      <span>{getUserInitials()}</span>
                    )}
                  </div>
                  <span className="user-name-display">{getFirstName()}</span>
                  <svg 
                    className={`dropdown-arrow ${showUserDropdown ? 'open' : ''}`} 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar large">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt={user.name} />
                        ) : (
                          <span>{getUserInitials()}</span>
                        )}
                      </div>
                      <div className="user-dropdown-info">
                        <span className="user-dropdown-name">{user?.name}</span>
                        <span className="user-dropdown-email">{user?.email}</span>
                      </div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link to="/orders" className="user-dropdown-item" onClick={handleLinkClick}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      <span>{t.myOrders}</span>
                    </Link>
                    <button className="user-dropdown-item logout-btn" onClick={handleLogout}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/account" className="icon-button desktop-only" aria-label="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            )}

            <Link to="/cart" className="icon-button cart-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className={`cart-badge ${getCartCount() > 0 ? 'has-items' : ''}`}>
                {getCartCount()}
              </span>
            </Link>
          </div>
        </div>

        {isSearchOpen && (
          <div className="search-bar-inline">
            <div className="search-bar-container">
              <svg className="search-icon-inline" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input-inline"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
              <button className="search-close-inline" onClick={handleSearchClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Search Results Dropdown */}
            {searchQuery.trim() !== '' && (
              <div className="search-results-dropdown">
                <div className="search-results-container">
                  {isSearching ? (
                    <div className="search-loading">
                      <span className="search-loading-spinner"></span>
                      <span>{t.searching}</span>
                    </div>
                  ) : (
                    <>
                      {/* Product Results */}
                      {productResults.length > 0 && (
                        <div className="search-category-group">
                          <div className="search-category-title">
                            {t.products} ({productResults.length})
                          </div>
                          {productResults.map((product, index) => (
                            <div 
                              key={`product-${product.productId || index}`} 
                              className="search-result-item search-product-item"
                              onClick={() => handleProductClick(product)}
                            >
                              <div className="search-product-image">
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.productName} />
                                ) : (
                                  <span className="search-result-icon">🌸</span>
                                )}
                              </div>
                              <div className="search-product-info">
                                <span className="search-product-name">{product.productName}</span>
                                <span className="search-product-price">{formatPrice(product.finalPrice || product.actualPrice)}</span>
                              </div>
                              <svg className="search-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6"/>
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Category Results */}
                      {Object.entries(groupedResults).length > 0 && (
                        <>
                          {Object.entries(groupedResults).map(([category, items]) => (
                            <div key={category} className="search-category-group">
                              <div className="search-category-title">{category}</div>
                              {items.slice(0, 5).map((item, index) => (
                                <div 
                                  key={index} 
                                  className="search-result-item"
                                  onClick={() => handleSearchResultClick(item.path)}
                                >
                                  <span className="search-result-icon">{item.icon}</span>
                                  <span className="search-result-name">
                                    {currentLang === 'ar' ? item.nameAr : item.nameEn}
                                  </span>
                                  <svg className="search-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6"/>
                                  </svg>
                                </div>
                              ))}
                            </div>
                          ))}
                        </>
                      )}

                      {/* No Results */}
                      {searchResults.length === 0 && productResults.length === 0 && (
                        <div className="search-no-results">
                          <span className="no-results-icon">🔍</span>
                          <span>{t.noResults}</span>
                        </div>
                      )}

                      {/* View All Results Button */}
                      {(searchResults.length > 0 || productResults.length > 0) && (
                        <div className="search-view-all" onClick={handleViewAllResults}>
                          <span>{t.viewAll}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <ul className="mobile-nav-list">
            <li>
              <Link to="/" onClick={handleLinkClick}>{t.home}</Link>
            </li>
            <li>
              <Link to="/pick-for-you" onClick={handleLinkClick}>{t.pickForYou}</Link>
            </li>
            
            {/* Offers */}
            <li className={`mobile-dropdown ${expandedMenu === 'offers' ? 'expanded' : ''}`}>
              <div className="mobile-menu-item" onClick={(e) => toggleMobileSubmenu('offers', e)}>
                <span>{t.offers}</span>
                <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <ul className="mobile-submenu">
                <li><Link to="/offers" onClick={handleLinkClick}>{t.offer50}</Link></li>
              </ul>
            </li>
            
            {/* Flowers */}
            <li className={`mobile-dropdown ${expandedMenu === 'flowers' ? 'expanded' : ''}`}>
              <div className="mobile-menu-item" onClick={(e) => toggleMobileSubmenu('flowers', e)}>
                <span>{t.flowers}</span>
                <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <ul className="mobile-submenu">
                <li><Link to="/tulips" onClick={handleLinkClick}>{t.tulips}</Link></li>
                <li><Link to="/lilium-arrangement" onClick={handleLinkClick}>{t.liliumArrangements}</Link></li>
                <li><Link to="/holland-small" onClick={handleLinkClick}>{t.hollandSmall}</Link></li>
                <li><Link to="/vase-arrangement" onClick={handleLinkClick}>{t.vaseArrangement}</Link></li>
                <li><Link to="/baby-roses" onClick={handleLinkClick}>{t.babyRoses}</Link></li>
                <li><Link to="/single-flower" onClick={handleLinkClick}>{t.singleFlower}</Link></li>
                <li><Link to="/holland-style" onClick={handleLinkClick}>{t.hollandStyle}</Link></li>
                <li><Link to="/roses-petals" onClick={handleLinkClick}>{t.rosesPetals}</Link></li>
                <li><Link to="/flowers-vase-10-25" onClick={handleLinkClick}>{t.flowersVase10to25}</Link></li>
                <li><Link to="/cylinder-vases" onClick={handleLinkClick}>{t.cylinderVases}</Link></li>
                <li><Link to="/flowers-mabkhar" onClick={handleLinkClick}>{t.flowersWithMabkhar}</Link></li>
                <li><Link to="/combos/flowers-perfume" onClick={handleLinkClick}>{t.flowersWithPerfume}</Link></li>
              </ul>
            </li>

            {/* Occasions - Separate Menu */}
            <li className={`mobile-dropdown ${expandedMenu === 'occasions' ? 'expanded' : ''}`}>
              <div className="mobile-menu-item" onClick={(e) => toggleMobileSubmenu('occasions', e)}>
                <span>{t.occasions}</span>
                <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <ul className="mobile-submenu">
                <li><Link to="/valentine-special" onClick={handleLinkClick}>{t.valentineDay}</Link></li>
                <li><Link to="/mothers-day" onClick={handleLinkClick}>{t.mothersDay}</Link></li>
                <li><Link to="/ramadan" onClick={handleLinkClick}>{t.ramadan}</Link></li>
                <li><Link to="/eid-collection" onClick={handleLinkClick}>{t.eidCollection}</Link></li>
              </ul>
            </li>

            {/* Bouquet */}
            <li className={`mobile-dropdown ${expandedMenu === 'bouquets' ? 'expanded' : ''}`}>
              <div className="mobile-menu-item" onClick={(e) => toggleMobileSubmenu('bouquets', e)}>
                <span>{t.bouquet}</span>
                <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <ul className="mobile-submenu">
                <li><Link to="/bouquets" onClick={handleLinkClick}>{t.flowerBouquets}</Link></li>
                <li><Link to="/hand-bouquets" onClick={handleLinkClick}>{t.handBouquets}</Link></li>
                <li><Link to="/orchid-plants" onClick={handleLinkClick}>{t.orchidPlants}</Link></li>
                <li><Link to="/lilium-bouquets" onClick={handleLinkClick}>{t.liliumBouquets}</Link></li>
                <li><Link to="/birthday-bouquet" onClick={handleLinkClick}>{t.birthdayBouquet}</Link></li>
                <li><Link to="/yellow-rose-bouquet" onClick={handleLinkClick}>{t.yellowRoseBouquet}</Link></li>
                <li><Link to="/grand-bouquet" onClick={handleLinkClick}>{t.grandBouquet}</Link></li>
              </ul>
            </li>

            {/* Add-Ons */}
            <li className={`mobile-dropdown ${expandedMenu === 'addons' ? 'expanded' : ''}`}>
              <div className="mobile-menu-item" onClick={(e) => toggleMobileSubmenu('addons', e)}>
                <span>{t.addOns}</span>
                <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <ul className="mobile-submenu">
                <li><Link to="/add-ons/helium-balloons" onClick={handleLinkClick}>{t.heliumBalloons}</Link></li>
                <li><Link to="/add-ons/crown-for-head" onClick={handleLinkClick}>{t.crownForHead}</Link></li>
                <li><Link to="/add-ons/acrylic-toppers" onClick={handleLinkClick}>{t.acrylicToppers}</Link></li>
              </ul>
            </li>

            {/* Combos */}
            <li className={`mobile-dropdown ${expandedMenu === 'combos' ? 'expanded' : ''}`}>
              <div className="mobile-menu-item" onClick={(e) => toggleMobileSubmenu('combos', e)}>
                <span>{t.combos}</span>
                <svg className="menu-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <ul className="mobile-submenu">
                <li><Link to="/combos" onClick={handleLinkClick}>{currentLang === 'ar' ? 'جميع الكومبو' : 'All Combos'}</Link></li>
                <li><Link to="/combos/flowers-perfume" onClick={handleLinkClick}>{t.flowersWithPerfume}</Link></li>
                <li><Link to="/combos/flowers-chocolates" onClick={handleLinkClick}>{currentLang === 'ar' ? 'زهور مع شوكولاتة' : 'Flowers & Chocolates'}</Link></li>
              </ul>
            </li>

            {/* My Orders - Only show if logged in */}
            {isAuthenticated && (
              <li>
                <Link to="/orders" onClick={handleLinkClick}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  {t.myOrders}
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile Menu Footer */}
          <div className="mobile-menu-footer">
            {isAuthenticated && (
              <div className="mobile-user-info-footer">
                <div className="user-avatar">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.name} />
                  ) : (
                    <span>{getUserInitials()}</span>
                  )}
                </div>
                <div className="mobile-user-details">
                  <span className="mobile-user-name">{user?.name}</span>
                  <span className="mobile-user-email">{user?.email}</span>
                </div>
              </div>
            )}
            {isAuthenticated ? (
              <button className="mobile-logout-btn" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>{t.logout}</span>
              </button>
            ) : (
              <Link to="/account" className="mobile-login" onClick={handleLinkClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>{t.login}</span>
              </Link>
            )}
            
            <div className="mobile-language-switcher">
              <span 
                className={`mobile-lang-option ${currentLang === 'en' ? 'active' : ''}`}
                onClick={() => switchLanguage('en')}
              >
                English
              </span>
              <span className="mobile-lang-separator">|</span>
              <span 
                className={`mobile-lang-option ${currentLang === 'ar' ? 'active' : ''}`}
                onClick={() => switchLanguage('ar')}
              >
                عربي
              </span>
            </div>

            <div className="mobile-social-links">
              <a href="https://wa.me/96560038844" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="https://instagram.com/hollandflowerskw" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Added Notification */}
      {isCartOpen && getCartCount() > 0 && (
        <div className="cart-notification">
          <span className="cart-notification-icon">✓</span>
          <span>{currentLang === 'ar' ? 'تمت الإضافة إلى السلة!' : 'Added to cart!'}</span>
        </div>
      )}
    </>
  );
};

export default Header;