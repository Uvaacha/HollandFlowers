import React, { useState, useEffect } from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
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
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: December 29, 2025',
      sections: [
        {
          title: 'Introduction',
          content: 'FlowersKW ("Company", "we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy will explain how we handle your information when you visit or use our website https://www.flowerskw.com (the "Website"), regardless of where you access it from. It also explains your rights and how the law protects you.',
          subsections: [
            {
              subtitle: 'This Privacy Policy aims to inform you how we collect and process your personal data when you:',
              list: [
                'Browse or interact with our website',
                'Place an order or use our services',
                'Contact us for customer support'
              ]
            }
          ],
          note: 'Our website is not aimed at children and we do not knowingly collect data from individuals under 18 years old. This Privacy Policy supplements other notices we may provide and is not intended to override them.'
        },
        {
          title: 'Contact Us',
          content: 'If you have questions regarding this policy or wish to exercise your privacy rights, contact us:',
          email: 'hollandaflowers@gmail.com'
        },
        {
          title: 'Changes to This Policy',
          content: 'This version was last updated on 29 Dec 2025. We may update this notice occasionally; updated versions will be posted on this page. It is important that the personal data we hold is accurate. Please notify us of any changes.'
        },
        {
          title: 'Third-Party Links',
          content: 'Our website may include links to third-party sites or services (for example: payment gateways, WhatsApp links, social media, or delivery partners). We do not control these websites and are not responsible for their privacy policies. Please review their policies before providing your data.'
        },
        {
          title: 'The Data We Collect',
          subtitle: 'Personal Data We Collect',
          content: 'We may collect the following categories of personal information:',
          table: [
            { category: 'Identity Data', examples: 'First name, last name, username' },
            { category: 'Contact Data', examples: 'Email address, phone number, billing and delivery address' },
            { category: 'Technical Data', examples: 'IP address, browser type, device details, login location' },
            { category: 'Transaction Data', examples: 'Order details, payment reference numbers' },
            { category: 'Profile Data', examples: 'Saved products, wishlist, preferences' },
            { category: 'Usage Data', examples: 'Website navigation, session duration, clicks & interaction' },
            { category: 'Marketing Data', examples: 'Newsletter consent & preferences' }
          ],
          note: 'We do not collect sensitive or special category data such as religion, race, health information, or biometric data.'
        },
        {
          title: 'How We Collect Data',
          content: 'We collect data in the following ways:',
          methods: [
            {
              method: '1. Directly from you',
              items: ['When you place an order', 'When you contact customer service', 'When you subscribe or create an account']
            },
            {
              method: '2. Automatically',
              items: ['We use cookies and analytics tools to collect data including IP address, browsing behavior, device information, etc.']
            },
            {
              method: '3. Third Parties',
              items: ['Payment gateways (e.g., Hesabe)', 'Delivery and courier partners', 'Email service providers (SMTP)', 'Analytics services (e.g., Google Analytics)']
            }
          ]
        },
        {
          title: 'How We Use Your Data',
          content: 'We only use your information when legally permitted. Most commonly, we use your data for:',
          usageTable: [
            { purpose: 'To process and complete orders', basis: 'Performance of a contract' },
            { purpose: 'To manage payment and fraud prevention', basis: 'Legitimate interest / Legal requirement' },
            { purpose: 'To deliver items to recipients specified by you', basis: 'Performance of a contract' },
            { purpose: 'To communicate about orders, delays, or delivery updates', basis: 'Legitimate interest' },
            { purpose: 'To improve the website and customer experience', basis: 'Legitimate interest' },
            { purpose: 'To send marketing only if you consent', basis: 'Consent-based' }
          ],
          note: 'We do not sell your data.'
        },
        {
          title: 'Cookies',
          content: 'We use cookies to:',
          list: [
            'Remember your cart and session',
            'Analyze performance and traffic',
            'Support functionality such as currency selection'
          ],
          note: 'You can disable cookies in browser settings, but some features may not function.'
        },
        {
          title: 'Data Sharing',
          content: 'We may share data with the following, only when necessary:',
          sharingTable: [
            { category: 'Payment Providers (Hesabe)', purpose: 'Process transactions securely' },
            { category: 'Delivery Partners', purpose: 'To complete orders' },
            { category: 'Email Providers', purpose: 'Order notifications & receipts' },
            { category: 'Professional Advisors', purpose: 'Legal, compliance, banking (if necessary)' },
            { category: 'Government Authorities', purpose: 'Where required by Kuwait law' }
          ],
          note: 'We require all partners to protect your data and not use it for unrelated purposes.'
        },
        {
          title: 'International Transfers',
          content: 'Some third-party providers may store data outside Kuwait. In such cases, we ensure adequate protection through:',
          list: [
            'Secure encrypted transmission',
            'Contracts & agreements ensuring compliance',
            'Using providers certified in global security standards'
          ]
        },
        {
          title: 'Data Security',
          content: 'We use technical and organizational measures to safeguard your data, including:',
          securityList: [
            '🔐 HTTPS encryption',
            '🔐 Secure payment redirection (no card data stored by us)',
            '🔐 Access control and staff confidentiality',
            '🔐 System monitoring and threat prevention'
          ]
        },
        {
          title: 'Your Legal Rights',
          content: 'You have the right to:',
          rightsList: [
            '✔️ Access your data',
            '✔️ Correct inaccurate information',
            '✔️ Request deletion (where applicable)',
            '✔️ Object to marketing',
            '✔️ Restrict processing',
            '✔️ Withdraw consent anytime'
          ],
          note: 'To exercise any rights: hollandaflowers@gmail.com'
        },
        {
          title: 'Glossary',
          definitions: [
            { term: 'Legitimate Interest', definition: 'Our operational need to run and improve the business' },
            { term: 'Performance of Contract', definition: 'Necessary to fulfill order/service' },
            { term: 'Consent', definition: 'You agree for specific usage' }
          ]
        },
        {
          title: 'Currency Conversion Notice',
          content: 'By using our website, you agree that third-party tools may process your IP address to detect location and display relevant currency. A session cookie may temporarily store the selected currency.'
        }
      ]
    },
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: 29 ديسمبر 2025',
      sections: [
        {
          title: 'مقدمة',
          content: 'تحترم FlowersKW ("الشركة"، "نحن"، "لنا") خصوصيتك وتلتزم بحماية بياناتك الشخصية. ستوضح سياسة الخصوصية هذه كيفية تعاملنا مع معلوماتك عند زيارتك أو استخدامك لموقعنا https://www.flowerskw.com ("الموقع")، بغض النظر عن المكان الذي تصل منه إليه. كما توضح حقوقك وكيف يحميك القانون.',
          note: 'موقعنا ليس موجهًا للأطفال ولا نجمع عن علم بيانات من أفراد تقل أعمارهم عن 18 عامًا.'
        },
        {
          title: 'اتصل بنا',
          content: 'إذا كانت لديك أسئلة بخصوص هذه السياسة أو ترغب في ممارسة حقوق الخصوصية الخاصة بك، اتصل بنا:',
          email: 'hollandaflowers@gmail.com'
        },
        {
          title: 'التغييرات على هذه السياسة',
          content: 'تم تحديث هذا الإصدار آخر مرة في 29 ديسمبر 2025. قد نقوم بتحديث هذا الإشعار من حين لآخر؛ سيتم نشر الإصدارات المحدثة على هذه الصفحة.'
        },
        {
          title: 'روابط الطرف الثالث',
          content: 'قد يتضمن موقعنا روابط لمواقع أو خدمات تابعة لجهات خارجية (على سبيل المثال: بوابات الدفع، روابط واتساب، وسائل التواصل الاجتماعي، أو شركاء التوصيل). نحن لا نتحكم في هذه المواقع ولسنا مسؤولين عن سياسات الخصوصية الخاصة بها.'
        },
        {
          title: 'البيانات التي نجمعها',
          content: 'قد نجمع الفئات التالية من المعلومات الشخصية:',
          note: 'نحن لا نجمع بيانات حساسة أو فئة خاصة مثل الدين أو العرق أو المعلومات الصحية أو البيانات البيومترية.'
        },
        {
          title: 'كيف نستخدم بياناتك',
          content: 'نستخدم معلوماتك فقط عندما يكون ذلك مسموحًا قانونيًا.',
          note: 'نحن لا نبيع بياناتك.'
        },
        {
          title: 'ملفات تعريف الارتباط',
          content: 'نستخدم ملفات تعريف الارتباط لتذكر سلة التسوق والجلسة وتحليل الأداء وحركة المرور ودعم الوظائف مثل اختيار العملة.',
          note: 'يمكنك تعطيل ملفات تعريف الارتباط في إعدادات المتصفح، لكن بعض الميزات قد لا تعمل.'
        },
        {
          title: 'مشاركة البيانات',
          content: 'قد نشارك البيانات مع مزودي الدفع وشركاء التوصيل ومزودي البريد الإلكتروني والمستشارين المحترفين والسلطات الحكومية عند الضرورة فقط.',
          note: 'نطلب من جميع الشركاء حماية بياناتك وعدم استخدامها لأغراض غير ذات صلة.'
        },
        {
          title: 'أمن البيانات',
          content: 'نستخدم تدابير تقنية وتنظيمية لحماية بياناتك، بما في ذلك تشفير HTTPS وإعادة توجيه الدفع الآمن والتحكم في الوصول ومراقبة النظام.'
        },
        {
          title: 'حقوقك القانونية',
          content: 'لديك الحق في الوصول إلى بياناتك وتصحيح المعلومات غير الدقيقة وطلب الحذف والاعتراض على التسويق وتقييد المعالجة وسحب الموافقة في أي وقت.',
          note: 'لممارسة أي حقوق: hollandaflowers@gmail.com'
        },
        {
          title: 'إشعار تحويل العملات',
          content: 'باستخدام موقعنا، فإنك توافق على أن أدوات الطرف الثالث قد تعالج عنوان IP الخاص بك لاكتشاف الموقع وعرض العملة ذات الصلة.'
        }
      ]
    }
  };

  const text = content[currentLang] || content.en;

  return (
    <div className="privacy-policy-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="policy-container">
        <div className="policy-header">
          <h1>{text.title}</h1>
          <p className="last-updated">{text.lastUpdated}</p>
        </div>

        <div className="policy-content">
          {text.sections.map((section, index) => (
            <div key={index} className="policy-section">
              <h2>{section.title}</h2>
              {section.subtitle && <h3 className="section-subtitle">{section.subtitle}</h3>}
              {section.content && <p>{section.content}</p>}
              
              {section.subsections && section.subsections.map((sub, subIndex) => (
                <div key={subIndex} className="subsection">
                  {sub.subtitle && <p className="subsection-title">{sub.subtitle}</p>}
                  {sub.list && (
                    <ul className="bullet-list">
                      {sub.list.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}

              {section.email && (
                <p className="contact-email">
                  <span>📧</span>
                  <a href={`mailto:${section.email}`}>{section.email}</a>
                </p>
              )}

              {section.table && (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Examples</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.map((row, i) => (
                        <tr key={i}>
                          <td><strong>{row.category}</strong></td>
                          <td>{row.examples}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.methods && (
                <div className="methods-list">
                  {section.methods.map((method, i) => (
                    <div key={i} className="method-item">
                      <h4>{method.method}</h4>
                      <ul>
                        {method.items.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {section.usageTable && (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Purpose</th>
                        <th>Legal Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.usageTable.map((row, i) => (
                        <tr key={i}>
                          <td>{row.purpose}</td>
                          <td>{row.basis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.sharingTable && (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.sharingTable.map((row, i) => (
                        <tr key={i}>
                          <td><strong>{row.category}</strong></td>
                          <td>{row.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.list && (
                <ul className="bullet-list">
                  {section.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}

              {section.securityList && (
                <ul className="icon-list">
                  {section.securityList.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}

              {section.rightsList && (
                <ul className="icon-list rights-list">
                  {section.rightsList.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}

              {section.definitions && (
                <div className="definitions-list">
                  {section.definitions.map((def, i) => (
                    <p key={i}><strong>{def.term}:</strong> {def.definition}</p>
                  ))}
                </div>
              )}

              {section.note && <p className="section-note">{section.note}</p>}
            </div>
          ))}

          <div className="policy-footer">
            <p>End of Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;