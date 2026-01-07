import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PolicyPages.css';

const ShippingPolicy = () => {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = {
    en: {
      title: 'Shipping & Customer Care Policy',
      subtitle: 'Holland Flowers Kuwait',
      intro: 'At Holland Flowers Kuwait, we carefully prepare every bouquet to ensure it reaches you fresh, stunning, and on time — just the way you expect.',
      
      deliveryTitle: 'Delivery Details',
      deliveryText: 'We offer Same-Day Delivery across Kuwait for all orders placed before 9:00 PM (Kuwait Local Time).',
      
      chargesTitle: 'Delivery Charges',
      chargesText: 'A standard delivery fee of 1.000 KD applies to all orders within Kuwait, including Same-Day Delivery.',
      
      supportTitle: 'Customer Support',
      supportText: "If anything isn't perfect, our customer care team is here to help. We'll do our best to resolve the issue quickly and professionally.",
      supportContact: 'For assistance, please contact:',
      
      issuesTitle: 'Issues With Your Order',
      issuesIntro: 'If your flowers arrive damaged, incorrect, or not up to our quality standards:',
      issueStep1: 'Email us within 2 days of receiving your order.',
      issueStep2: 'Include your order number and a photo of the bouquet.',
      issuesResponse: 'Our team will review and respond within 24 hours.',
      issuesRefund: 'If a refund is approved, please allow up to 7 working days for processing and reflection in your account.',
      
      freshnessTitle: 'Time Sensitivity & Freshness',
      freshnessText: 'Flowers are perishable products, and Kuwait weather can be tough — especially during summer. For this reason, concerns must be reported within 48 hours of delivery so we can assist effectively.',
      
      returnsTitle: 'Returns & Cancellations',
      returnsIntro: 'Because our products are fresh and made to order:',
      returnsPoint1: 'We do not accept returns',
      returnsPoint2: 'All sales are final',
      returnsPoint3: 'Orders cannot be cancelled once confirmed',
      
      substitutionsTitle: 'Flower Substitutions',
      substitutionsText: 'On rare occasions, substitutions may be required due to seasonal or stock availability. We will always choose equal or higher quality flowers to maintain the premium presentation of your bouquet. If a significant substitution is needed, we will notify you in advance.',
      
      discountTitle: 'Discount Codes',
      discountText: 'Please ensure discount codes are applied before completing checkout. Holland Flowers Kuwait is not responsible for refunding missed or unused discount codes after a purchase is made.',
      
      backHome: '← Back to Home'
    },
    ar: {
      title: 'سياسة الشحن وخدمة العملاء',
      subtitle: 'هولاند فلاورز الكويت',
      intro: 'في هولاند فلاورز الكويت، نحرص على تجهيز كل باقة بعناية لضمان وصولها إليك طازجة ومذهلة وفي الوقت المحدد — تماماً كما تتوقع.',
      
      deliveryTitle: 'تفاصيل التوصيل',
      deliveryText: 'نقدم خدمة التوصيل في نفس اليوم في جميع أنحاء الكويت لجميع الطلبات المقدمة قبل الساعة 9:00 مساءً (بتوقيت الكويت المحلي).',
      
      chargesTitle: 'رسوم التوصيل',
      chargesText: 'تُطبق رسوم توصيل قياسية قدرها 1.000 د.ك على جميع الطلبات داخل الكويت، بما في ذلك التوصيل في نفس اليوم.',
      
      supportTitle: 'دعم العملاء',
      supportText: 'إذا لم يكن أي شيء مثالياً، فإن فريق خدمة العملاء لدينا هنا للمساعدة. سنبذل قصارى جهدنا لحل المشكلة بسرعة واحترافية.',
      supportContact: 'للمساعدة، يرجى التواصل:',
      
      issuesTitle: 'مشاكل مع طلبك',
      issuesIntro: 'إذا وصلت الزهور تالفة أو غير صحيحة أو لا تتوافق مع معايير الجودة لدينا:',
      issueStep1: 'راسلنا عبر البريد الإلكتروني خلال يومين من استلام طلبك.',
      issueStep2: 'أرفق رقم الطلب وصورة للباقة.',
      issuesResponse: 'سيقوم فريقنا بالمراجعة والرد خلال 24 ساعة.',
      issuesRefund: 'في حالة الموافقة على الاسترداد، يرجى الانتظار حتى 7 أيام عمل للمعالجة والظهور في حسابك.',
      
      freshnessTitle: 'حساسية الوقت والطزاجة',
      freshnessText: 'الزهور منتجات قابلة للتلف، وطقس الكويت قد يكون قاسياً — خاصة خلال الصيف. لهذا السبب، يجب الإبلاغ عن أي مخاوف خلال 48 ساعة من التوصيل حتى نتمكن من المساعدة بفعالية.',
      
      returnsTitle: 'الإرجاع والإلغاء',
      returnsIntro: 'نظراً لأن منتجاتنا طازجة ومصنوعة حسب الطلب:',
      returnsPoint1: 'لا نقبل الإرجاع',
      returnsPoint2: 'جميع المبيعات نهائية',
      returnsPoint3: 'لا يمكن إلغاء الطلبات بمجرد تأكيدها',
      
      substitutionsTitle: 'استبدال الزهور',
      substitutionsText: 'في حالات نادرة، قد يكون الاستبدال مطلوباً بسبب التوفر الموسمي أو المخزون. سنختار دائماً زهوراً بجودة مساوية أو أعلى للحفاظ على العرض المميز لباقتك. إذا كان هناك حاجة لاستبدال كبير، سنقوم بإخطارك مسبقاً.',
      
      discountTitle: 'أكواد الخصم',
      discountText: 'يرجى التأكد من تطبيق أكواد الخصم قبل إتمام الطلب. هولاند فلاورز الكويت غير مسؤولة عن استرداد أكواد الخصم المفقودة أو غير المستخدمة بعد إتمام الشراء.',
      
      backHome: 'العودة للرئيسية →'
    }
  };

  const t = content[currentLang];

  return (
    <div className={`policy-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="policy-container">
        <Link to="/" className="back-link">{t.backHome}</Link>
        
        <div className="policy-header">
          <h1>{t.title}</h1>
          <p className="policy-subtitle">{t.subtitle}</p>
        </div>

        <div className="policy-content">
          <p className="policy-intro">{t.intro}</p>

          {/* Delivery Details */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">🚚</span>
              {t.deliveryTitle}
            </h2>
            <p>{t.deliveryText}</p>
          </section>

          {/* Delivery Charges */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">💰</span>
              {t.chargesTitle}
            </h2>
            <p>{t.chargesText}</p>
          </section>

          {/* Customer Support */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">💬</span>
              {t.supportTitle}
            </h2>
            <p>{t.supportText}</p>
            <p className="contact-info">
              {t.supportContact}<br />
              <a href="mailto:hollandaflowers@gmail.com" className="email-link">
                📧 hollandaflowers@gmail.com
              </a>
            </p>
          </section>

          {/* Issues With Your Order */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">⚠️</span>
              {t.issuesTitle}
            </h2>
            <p>{t.issuesIntro}</p>
            <ol className="policy-steps">
              <li>{t.issueStep1}</li>
              <li>{t.issueStep2}</li>
            </ol>
            <p>{t.issuesResponse}</p>
            <p className="highlight-box">{t.issuesRefund}</p>
          </section>

          {/* Time Sensitivity & Freshness */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">⏰</span>
              {t.freshnessTitle}
            </h2>
            <p>{t.freshnessText}</p>
          </section>

          {/* Returns & Cancellations */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">🔄</span>
              {t.returnsTitle}
            </h2>
            <p>{t.returnsIntro}</p>
            <ul className="policy-list">
              <li>{t.returnsPoint1}</li>
              <li>{t.returnsPoint2}</li>
              <li>{t.returnsPoint3}</li>
            </ul>
          </section>

          {/* Flower Substitutions */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">🌸</span>
              {t.substitutionsTitle}
            </h2>
            <p>{t.substitutionsText}</p>
          </section>

          {/* Discount Codes */}
          <section className="policy-section">
            <h2>
              <span className="section-icon">🏷️</span>
              {t.discountTitle}
            </h2>
            <p>{t.discountText}</p>
          </section>
        </div>

        <div className="policy-footer">
          <Link to="/" className="back-home-btn">{t.backHome}</Link>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;