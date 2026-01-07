import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [openFaq, setOpenFaq] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Handle link click - instant scroll to top (no smooth scrolling)
  const handleLinkClick = (path) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    navigate(path);
  };

  const t = {
    en: {
      logo: 'HOLLAND FLOWERS',
      tagline: 'Rooted in Dutch floral tradition, Holland Flowers Kuwait curates exquisite blooms known for their beauty and freshness.',
      quickLinks: 'Quick Links',
      home: 'Home',
      bouquets: 'Bouquets',
      flowers: 'Flowers',
      combos: 'Gift Combos',
      addOns: 'Add-Ons',
      offers: 'Offers',
      contactUs: 'Contact Us',
      address: 'Ghanima Complex, Shop No. 54',
      location: 'Kuwait',
      phone: '+965 6003 8844',
      email: 'hollandaflowers@gmail.com',
      deliveryHours: 'Delivery Hours',
      satToThu: 'Sat - Thu: 8:30 AM - 9:00 PM',
      friday: 'Friday: 1:30 PM - 10:00 PM',
      lastOrder: 'Last Order: 9:00 PM',
      faq: 'Frequently Asked Questions',
      followUs: 'Follow Us',
      copyright: '© 2024 Holland Flowers Kuwait. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      refund: 'Refund Policy',
      shipping: 'Shipping Policy',
      viewMap: 'View on Map',
    },
    ar: {
      logo: 'هولاند فلاورز',
      tagline: 'متجذرون في تقاليد الزهور الهولندية، هولاند فلاورز الكويت تقدم زهورًا رائعة معروفة بجمالها ونضارتها.',
      quickLinks: 'روابط سريعة',
      home: 'الرئيسية',
      bouquets: 'الباقات',
      flowers: 'الزهور',
      combos: 'هدايا كومبو',
      addOns: 'الإضافات',
      offers: 'العروض',
      contactUs: 'تواصل معنا',
      address: 'مجمع غنيمة، محل رقم 54',
      location: 'الكويت',
      phone: '+965 6003 8844',
      email: 'hollandaflowers@gmail.com',
      deliveryHours: 'أوقات التوصيل',
      satToThu: 'السبت - الخميس: 8:30 ص - 9:00 م',
      friday: 'الجمعة: 1:30 م - 10:00 م',
      lastOrder: 'آخر طلب: 9:00 م',
      faq: 'الأسئلة الشائعة',
      followUs: 'تابعنا',
      copyright: '© 2024 هولاند فلاورز الكويت. جميع الحقوق محفوظة.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      refund: 'سياسة الاسترداد',
      shipping: 'سياسة الشحن',
      viewMap: 'عرض على الخريطة',
    }
  };

  const faqs = {
    en: [
      {
        question: 'Do you extend same-day flower delivery services within Kuwait?',
        answer: 'Yes. Holland Flowers is pleased to offer reliable same-day delivery across Kuwait. Simply place your order before 9 PM, and our team will ensure your flowers are delivered on the very same day.'
      },
      {
        question: 'By what means do you preserve the freshness and quality of your flowers?',
        answer: 'We select only premium-grade blooms and maintain them in optimal, climate-controlled conditions. Each arrangement is handcrafted shortly before dispatch to ensure maximum freshness, vibrancy, and longevity.'
      },
      {
        question: 'Which floral varieties are offered for delivery?',
        answer: 'Our collection features an extensive selection of blooms, including roses, lilies, tulips, orchids, sunflowers, and seasonal varieties—each available for delivery throughout Kuwait.'
      },
      {
        question: 'Am I able to place an order from abroad?',
        answer: 'Yes. International customers may conveniently place orders using Visa or MasterCard. We will arrange delivery to any location within Kuwait.'
      },
      {
        question: 'Which regions of Kuwait fall within your delivery network?',
        answer: 'We provide delivery to all major areas, including Kuwait City, Salmiya, Hawally, Fahaheel, Farwaniya, Mangaf, and additional surrounding regions. Delivery availability can be confirmed during checkout.'
      },
      {
        question: 'May I include balloons or other complementary gifts with my floral order?',
        answer: 'Certainly. You may enhance your gift by pairing flowers with balloons, chocolates, or teddy bears, creating a refined and memorable presentation.'
      },
      {
        question: 'Can a flower delivery be scheduled for a later or specific date?',
        answer: 'Yes. You may select a preferred delivery date at checkout—ideal for birthdays, anniversaries, and other special occasions requiring advance planning.'
      },
      {
        question: 'Are delivery services available on weekends and national holidays?',
        answer: 'Yes. Holland Flowers operates seven days a week, including major public holidays such as Valentine\'s Day, Eid, and Mother\'s Day.'
      }
    ],
    ar: [
      {
        question: 'هل تقدمون خدمة توصيل الزهور في نفس اليوم داخل الكويت؟',
        answer: 'نعم. يسر هولاند فلاورز تقديم خدمة توصيل موثوقة في نفس اليوم في جميع أنحاء الكويت. ما عليك سوى تقديم طلبك قبل الساعة 9 مساءً، وسيضمن فريقنا توصيل زهورك في نفس اليوم.'
      },
      {
        question: 'كيف تحافظون على نضارة وجودة الزهور؟',
        answer: 'نختار فقط الزهور الممتازة ونحافظ عليها في ظروف مثالية ومتحكم فيها. يتم تصميم كل ترتيب يدويًا قبل الإرسال بوقت قصير لضمان أقصى درجات النضارة والحيوية والعمر الطويل.'
      },
      {
        question: 'ما أنواع الزهور المتاحة للتوصيل؟',
        answer: 'تتضمن مجموعتنا تشكيلة واسعة من الزهور، بما في ذلك الورود والزنابق والتوليب والأوركيد وعباد الشمس والأصناف الموسمية - كل منها متاح للتوصيل في جميع أنحاء الكويت.'
      },
      {
        question: 'هل يمكنني تقديم طلب من خارج الكويت؟',
        answer: 'نعم. يمكن للعملاء الدوليين تقديم الطلبات بسهولة باستخدام فيزا أو ماستركارد. سنقوم بترتيب التوصيل إلى أي موقع داخل الكويت.'
      },
      {
        question: 'ما هي مناطق الكويت التي تقع ضمن شبكة التوصيل الخاصة بكم؟',
        answer: 'نقدم خدمة التوصيل إلى جميع المناطق الرئيسية، بما في ذلك مدينة الكويت والسالمية وحولي والفحيحيل والفروانية والمنقف والمناطق المحيطة الإضافية. يمكن تأكيد توفر التوصيل عند إتمام الطلب.'
      },
      {
        question: 'هل يمكنني إضافة بالونات أو هدايا تكميلية أخرى مع طلب الزهور؟',
        answer: 'بالتأكيد. يمكنك تعزيز هديتك من خلال إقران الزهور مع البالونات أو الشوكولاتة أو الدببة، مما يخلق تقديمًا راقيًا ولا يُنسى.'
      },
      {
        question: 'هل يمكن جدولة توصيل الزهور لتاريخ لاحق أو محدد؟',
        answer: 'نعم. يمكنك اختيار تاريخ التوصيل المفضل عند إتمام الطلب - مثالي لأعياد الميلاد والذكرى السنوية والمناسبات الخاصة الأخرى التي تتطلب تخطيطًا مسبقًا.'
      },
      {
        question: 'هل خدمات التوصيل متاحة في عطلات نهاية الأسبوع والعطلات الرسمية؟',
        answer: 'نعم. يعمل هولاند فلاورز سبعة أيام في الأسبوع، بما في ذلك العطلات الرسمية الكبرى مثل عيد الحب والعيد وعيد الأم.'
      }
    ]
  };

  const text = t[currentLang];
  const faqList = faqs[currentLang];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Elegant SVG Icons
  const icons = {
    location: (
      <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
    phone: (
      <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    email: (
      <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    clock: (
      <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    moon: (
      <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    ),
    bell: (
      <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    )
  };

  return (
    <footer className={`site-footer ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Floral Background Image */}
      <div 
        className="footer-bg-image" 
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/footer-flowers-bg.png)` }}
      ></div>

      {/* FAQ Section */}
      <div className="footer-faq-section">
        <div className="container">
          <h3 className="faq-title">{text.faq}</h3>
          <div className="faq-grid">
            {faqList.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <svg 
                    className="faq-icon" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d={openFaq === index ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                  </svg>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-column brand-column">
              <span onClick={() => handleLinkClick('/')} className="footer-logo">
                <img 
                  src="/Holland Logo.png" 
                  alt={currentLang === 'ar' ? 'هولاند فلاورز' : 'Holland Flowers'} 
                  className="footer-logo-image"
                />
                <span className="logo-text">{text.logo}</span>
              </span>
              <p className="footer-tagline">{text.tagline}</p>
              
              {/* Social Links */}
              <div className="social-links">
                <span className="social-label">{text.followUs}</span>
                <div className="social-icons">
                  <a href="https://www.instagram.com/hollandflowerkw?igsh=MW91ZzgxZXl2ZDZ5ZA==" target="_blank" rel="noopener noreferrer" className="social-icon instagram" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/96560038844" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" aria-label="WhatsApp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links - Collapsible on Mobile */}
            <div className={`footer-column footer-accordion ${openSection === 'quicklinks' ? 'open' : ''}`}>
              <h4 
                className="footer-heading footer-accordion-header"
                onClick={() => toggleSection('quicklinks')}
              >
                {text.quickLinks}
                <span className="accordion-icon">+</span>
              </h4>
              <div className="footer-accordion-content">
                <ul className="footer-links">
                  <li><span onClick={() => handleLinkClick('/')}>{text.home}</span></li>
                  <li><span onClick={() => handleLinkClick('/flower-bouquets')}>{text.bouquets}</span></li>
                  <li><span onClick={() => handleLinkClick('/tulips')}>{text.flowers}</span></li>
                  <li><span onClick={() => handleLinkClick('/combos')}>{text.combos}</span></li>
                  <li><span onClick={() => handleLinkClick('/add-ons')}>{text.addOns}</span></li>
                  <li><span onClick={() => handleLinkClick('/offers')}>{text.offers}</span></li>
                </ul>
              </div>
            </div>

            {/* Contact Info - Collapsible on Mobile */}
            <div className={`footer-column footer-accordion ${openSection === 'contact' ? 'open' : ''}`}>
              <h4 
                className="footer-heading footer-accordion-header"
                onClick={() => toggleSection('contact')}
              >
                {text.contactUs}
                <span className="accordion-icon">+</span>
              </h4>
              <div className="footer-accordion-content">
                <ul className="contact-info">
                  <li>
                    <span className="contact-icon">{icons.location}</span>
                    <div className="contact-text">
                      <span>{text.address}</span>
                      <span>{text.location}</span>
                      <a 
                        href="https://maps.app.goo.gl/zbBZHFzPFXEg7Hk29?g_st=aw" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="map-link"
                      >
                        {text.viewMap} →
                      </a>
                    </div>
                  </li>
                  <li>
                    <span className="contact-icon">{icons.phone}</span>
                    <a href="https://wa.me/96560038844">{text.phone}</a>
                  </li>
                  <li>
                    <span className="contact-icon">{icons.email}</span>
                    <a href="mailto:hollandaflowers@gmail.com">{text.email}</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Delivery Hours - Collapsible on Mobile */}
            <div className={`footer-column footer-accordion ${openSection === 'hours' ? 'open' : ''}`}>
              <h4 
                className="footer-heading footer-accordion-header"
                onClick={() => toggleSection('hours')}
              >
                {text.deliveryHours}
                <span className="accordion-icon">+</span>
              </h4>
              <div className="footer-accordion-content">
                <ul className="delivery-hours">
                  <li>
                    <span className="day-icon">{icons.clock}</span>
                    <span>{text.satToThu}</span>
                  </li>
                  <li>
                    <span className="day-icon">{icons.moon}</span>
                    <span>{text.friday}</span>
                  </li>
                  <li className="last-order">
                    <span className="day-icon">{icons.bell}</span>
                    <span>{text.lastOrder}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2025 Holland Flowers Kuwait, Developed By{' '}
              <a 
                href="https://www.uvaacha.co.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="developer-link"
              >
                Uvaacha
              </a>
            </p>
            <div className="footer-legal">
              <span onClick={() => handleLinkClick('/privacy')}>{text.privacy}</span>
              <span className="divider">|</span>
              <span onClick={() => handleLinkClick('/refund-policy')}>{text.refund}</span>
              <span className="divider">|</span>
              <span onClick={() => handleLinkClick('/shipping-policy')}>{text.shipping}</span>
              <span className="divider">|</span>
              <span onClick={() => handleLinkClick('/terms')}>{text.terms}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;