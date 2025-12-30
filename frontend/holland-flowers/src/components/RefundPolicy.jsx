import React, { useState, useEffect } from 'react';
import './RefundPolicy.css';

const RefundPolicy = () => {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const content = {
    en: {
      title: 'Refund Policy',
      lastUpdated: 'Last Updated: December 29, 2025',
      sections: [
        {
          title: 'Our Commitment',
          content: 'At FlowersKW, we take great care in preparing each order and aim to deliver fresh, beautiful flowers every time. If there is an issue with your order such as damaged flowers, incorrect items or anything that does not meet your expectations, please contact us within 24 hours of delivery.'
        },
        {
          title: 'How to Report an Issue',
          content: 'Contact us at hollandaflowers@gmail.com or via WhatsApp with your order number and clear photos of the product received. Our team will review the case and respond within 24 hours.'
        },
        {
          title: 'No Returns Policy',
          content: 'Due to the perishable nature of flowers and Kuwait\'s weather conditions, we do not accept returns once the order has been delivered. If the flowers arrive in poor condition or wilted, we may provide a replacement, store credit or in some cases a partial or full refund depending on the condition shown in the images. Refunds are not guaranteed and will only be issued after review and approval.'
        },
        {
          title: 'Non-Refundable Situations',
          list: [
            'Cancellations after the order has been processed or dispatched',
            'All confirmed orders are final',
            'Change of mind',
            'Incorrect delivery information provided by the customer',
            'Failure to accept delivery',
            'Missed discounts or promotional codes not applied at checkout'
          ]
        },
        {
          title: 'Product Substitutions',
          content: 'Due to seasonal and stock availability, we may substitute flowers or products with similar items of equal or higher value to maintain the design, theme, and quality of the arrangement. Such substitutions do not qualify for refunds.'
        },
        {
          title: 'Refund Processing',
          content: 'Any approved refunds will be issued to the original payment method and may take 3–7 business days depending on your bank or payment provider.'
        },
        {
          title: 'Agreement',
          content: 'By placing an order with FlowersKW, you agree to the terms above and understand that refunds, replacements, or credits are provided at our discretion based on the evidence and circumstances of the case.'
        }
      ],
      contact: {
        title: 'Contact Us',
        email: 'hollandaflowers@gmail.com',
        whatsapp: '+965 6003 8844'
      }
    },
    ar: {
      title: 'سياسة الاسترداد',
      lastUpdated: 'آخر تحديث: 29 ديسمبر 2025',
      sections: [
        {
          title: 'التزامنا',
          content: 'في FlowersKW، نحرص على إعداد كل طلب بعناية فائقة ونهدف إلى توصيل زهور طازجة وجميلة في كل مرة. إذا كانت هناك مشكلة في طلبك مثل الزهور التالفة أو العناصر غير الصحيحة أو أي شيء لا يلبي توقعاتك، يرجى الاتصال بنا خلال 24 ساعة من التسليم.'
        },
        {
          title: 'كيفية الإبلاغ عن مشكلة',
          content: 'تواصل معنا على hollandaflowers@gmail.com أو عبر واتساب مع رقم طلبك وصور واضحة للمنتج المستلم. سيقوم فريقنا بمراجعة الحالة والرد خلال 24 ساعة.'
        },
        {
          title: 'سياسة عدم الإرجاع',
          content: 'نظرًا للطبيعة القابلة للتلف للزهور وظروف الطقس في الكويت، لا نقبل الإرجاع بمجرد تسليم الطلب. إذا وصلت الزهور في حالة سيئة أو ذابلة، فقد نقدم بديلاً أو رصيدًا في المتجر أو في بعض الحالات استردادًا جزئيًا أو كاملًا حسب الحالة الموضحة في الصور. لا يتم ضمان الاسترداد ولن يتم إصداره إلا بعد المراجعة والموافقة.'
        },
        {
          title: 'الحالات غير القابلة للاسترداد',
          list: [
            'الإلغاءات بعد معالجة الطلب أو إرساله',
            'جميع الطلبات المؤكدة نهائية',
            'تغيير الرأي',
            'معلومات التوصيل غير الصحيحة المقدمة من العميل',
            'عدم قبول التسليم',
            'الخصومات الفائتة أو الرموز الترويجية التي لم يتم تطبيقها عند الدفع'
          ]
        },
        {
          title: 'استبدال المنتجات',
          content: 'نظرًا للتوافر الموسمي والمخزون، قد نستبدل الزهور أو المنتجات بعناصر مماثلة ذات قيمة متساوية أو أعلى للحفاظ على التصميم والموضوع والجودة. هذه البدائل لا تؤهل للاسترداد.'
        },
        {
          title: 'معالجة الاسترداد',
          content: 'سيتم إصدار أي مبالغ مستردة معتمدة إلى طريقة الدفع الأصلية وقد تستغرق 3-7 أيام عمل حسب البنك أو مزود الدفع الخاص بك.'
        },
        {
          title: 'الموافقة',
          content: 'بتقديم طلب مع FlowersKW، فإنك توافق على الشروط المذكورة أعلاه وتفهم أن المبالغ المستردة أو البدائل أو الأرصدة يتم تقديمها وفقًا لتقديرنا بناءً على الأدلة وظروف الحالة.'
        }
      ],
      contact: {
        title: 'تواصل معنا',
        email: 'hollandaflowers@gmail.com',
        whatsapp: '+965 6003 8844'
      }
    }
  };

  const text = content[currentLang] || content.en;

  return (
    <div className="refund-policy-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="policy-container">
        <div className="policy-header">
          <h1>{text.title}</h1>
          <p className="last-updated">{text.lastUpdated}</p>
        </div>

        <div className="policy-content">
          {text.sections.map((section, index) => (
            <div key={index} className="policy-section">
              <h2>{section.title}</h2>
              {section.content && <p>{section.content}</p>}
              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="policy-section contact-section">
            <h2>{text.contact.title}</h2>
            <div className="contact-info">
              <p>
                <span className="contact-icon">📧</span>
                <a href={`mailto:${text.contact.email}`}>{text.contact.email}</a>
              </p>
              <p>
                <span className="contact-icon">📱</span>
                <a href={`https://wa.me/96560038844`}>{text.contact.whatsapp}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;