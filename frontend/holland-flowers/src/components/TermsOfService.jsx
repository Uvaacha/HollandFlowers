import React, { useState, useEffect } from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
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
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: January 2025',
      sections: [
        {
          title: '1. Introduction',
          content: `These Terms and Conditions ("Terms") set out the rules under which Holland Flowers ("we", "us", or "our") supplies goods ("Goods") to customers. By placing an order with us, you confirm that you accept and agree to be bound by these Terms. Please ensure you read them carefully before completing your purchase.`
        },
        {
          title: '2. About Us',
          content: `Holland Flowers is registered and operates in Kuwait. You can contact us at: hollandaflowers@gmail.com`
        },
        {
          title: '3. Ordering and Contract Formation',
          content: `The submission of an order constitutes an offer by you to purchase the Goods. Acknowledgment of receipt of the order will be provided by email and does not constitute acceptance. Acceptance of the order and formation of a binding contract shall occur only upon dispatch confirmation by email. We retain the right to reject or cancel orders at our discretion.`
        },
        {
          title: '4. Goods',
          content: `All reasonable care is taken to ensure that images of the Goods shown on our website are accurate; however, variations in appearance may occur due to the natural characteristics of floral products. Packaging shown on the website is for reference only and may differ from the actual product.`
        },
        {
          title: '5. Delivery',
          content: `Applicable delivery charges will be displayed at the time of checkout. Customers are required to select a preferred delivery date during the order process. Orders placed before 9:00 PM on a working day may be eligible for same-day delivery where selected. Orders placed after the stated cut-off time or on non-working days will be delivered within four working days. While reasonable efforts are made to meet the selected delivery date, delays may occur due to events beyond our control, and customers will be notified accordingly. In the absence of a recipient, the Goods may be left with a neighbor or at a secure location at the delivery address. All risk associated with the Goods passes to the customer upon delivery.`
        },
        {
          title: '6. Cancellations and Refunds',
          content: `Due to the perishable nature of floral products, cancellations, returns, and refunds for change of mind are not permitted. Any claims relating to faulty or misdescribed Goods must be reported within two (2) days of delivery and supported with photographic evidence. Refunds approved by us shall be processed within seven (7) working days. Nothing in these Terms affects your statutory rights to terminate the contract where the Goods are defective, misdescribed, or delivery is materially delayed due to events beyond our control.`
        },
        {
          title: '7. Price and Payment',
          content: `Prices applicable to the Goods are those displayed on the website at the time of order placement. All prices are inclusive of applicable taxes unless expressly stated otherwise. Payment must be made using the approved online payment methods available on our website. Dispatch of Goods shall take place only after full payment has been received.`
        },
        {
          title: '8. Our Liability',
          content: `Our liability is limited to losses or damages that are reasonably foreseeable as a result of a breach of these Terms or negligence on our part. We shall not be liable for any losses or damages that are not reasonably foreseeable. Nothing in these Terms shall operate to exclude or restrict liability for death or personal injury caused by our negligence. Goods are supplied solely for private and domestic use, and we shall not be liable for any business, commercial, or professional losses.`
        },
        {
          title: '9. Personal Information',
          content: `Personal information is processed for the purpose of fulfilling orders and providing customer support services. Personal data will be shared with third parties solely where necessary for order fulfillment or as required by applicable law.`
        },
        {
          title: '10. General',
          content: `We reserve the right to transfer or assign our rights and obligations under these Terms to any third party. You may not assign or transfer your rights or obligations without our prior written consent. Any failure or delay by us to enforce any provision of these Terms shall not constitute a waiver of our rights. These Terms shall be governed by and construed in accordance with the laws of Kuwait, and the Kuwait courts shall have exclusive jurisdiction over any disputes arising from them.`
        }
      ]
    },
    ar: {
      title: 'شروط الخدمة',
      lastUpdated: 'آخر تحديث: يناير 2025',
      sections: [
        {
          title: '1. مقدمة',
          content: `تحدد هذه الشروط والأحكام ("الشروط") القواعد التي بموجبها تقوم هولاند فلاورز ("نحن" أو "لنا" أو "خاصتنا") بتوريد البضائع ("البضائع") للعملاء. من خلال تقديم طلب معنا، فإنك تؤكد أنك تقبل وتوافق على الالتزام بهذه الشروط. يرجى التأكد من قراءتها بعناية قبل إتمام عملية الشراء.`
        },
        {
          title: '2. عنا',
          content: `هولاند فلاورز مسجلة وتعمل في الكويت. يمكنك الاتصال بنا على: hollandaflowers@gmail.com`
        },
        {
          title: '3. الطلب وتكوين العقد',
          content: `يشكل تقديم الطلب عرضًا منك لشراء البضائع. سيتم تقديم إقرار باستلام الطلب عبر البريد الإلكتروني ولا يشكل قبولًا. يحدث قبول الطلب وتشكيل عقد ملزم فقط عند تأكيد الإرسال عبر البريد الإلكتروني. نحتفظ بالحق في رفض أو إلغاء الطلبات وفقًا لتقديرنا.`
        },
        {
          title: '4. البضائع',
          content: `يتم بذل كل عناية معقولة لضمان دقة صور البضائع المعروضة على موقعنا الإلكتروني؛ ومع ذلك، قد تحدث اختلافات في المظهر بسبب الخصائص الطبيعية للمنتجات الزهرية. التغليف المعروض على الموقع هو للمرجع فقط وقد يختلف عن المنتج الفعلي.`
        },
        {
          title: '5. التوصيل',
          content: `سيتم عرض رسوم التوصيل المطبقة في وقت الدفع. يُطلب من العملاء اختيار تاريخ التوصيل المفضل أثناء عملية الطلب. الطلبات المقدمة قبل الساعة 9:00 مساءً في يوم عمل قد تكون مؤهلة للتوصيل في نفس اليوم حيثما تم اختيار ذلك. الطلبات المقدمة بعد الوقت المحدد أو في أيام عدم العمل سيتم توصيلها في غضون أربعة أيام عمل. بينما يتم بذل جهود معقولة لتلبية تاريخ التوصيل المحدد، قد تحدث تأخيرات بسبب أحداث خارجة عن سيطرتنا، وسيتم إخطار العملاء وفقًا لذلك. في حالة عدم وجود المستلم، قد يتم ترك البضائع مع جار أو في موقع آمن في عنوان التوصيل. جميع المخاطر المرتبطة بالبضائع تنتقل إلى العميل عند التسليم.`
        },
        {
          title: '6. الإلغاءات والمبالغ المستردة',
          content: `نظرًا للطبيعة القابلة للتلف للمنتجات الزهرية، لا يُسمح بالإلغاءات أو الإرجاعات أو المبالغ المستردة لتغيير الرأي. يجب الإبلاغ عن أي مطالبات تتعلق بالبضائع المعيبة أو الموصوفة بشكل خاطئ في غضون يومين (2) من التسليم ودعمها بأدلة فوتوغرافية. المبالغ المستردة المعتمدة من قبلنا ستتم معالجتها في غضون سبعة (7) أيام عمل. لا شيء في هذه الشروط يؤثر على حقوقك القانونية لإنهاء العقد حيث تكون البضائع معيبة أو موصوفة بشكل خاطئ أو التسليم متأخر بشكل جوهري بسبب أحداث خارجة عن سيطرتنا.`
        },
        {
          title: '7. السعر والدفع',
          content: `الأسعار المطبقة على البضائع هي تلك المعروضة على الموقع الإلكتروني في وقت تقديم الطلب. جميع الأسعار شاملة للضرائب المطبقة ما لم يُنص صراحة على خلاف ذلك. يجب إجراء الدفع باستخدام طرق الدفع عبر الإنترنت المعتمدة المتاحة على موقعنا الإلكتروني. سيتم إرسال البضائع فقط بعد استلام الدفع الكامل.`
        },
        {
          title: '8. مسؤوليتنا',
          content: `مسؤوليتنا محدودة بالخسائر أو الأضرار التي يمكن التنبؤ بها بشكل معقول نتيجة لخرق هذه الشروط أو الإهمال من جانبنا. لن نكون مسؤولين عن أي خسائر أو أضرار لا يمكن التنبؤ بها بشكل معقول. لا شيء في هذه الشروط يعمل على استبعاد أو تقييد المسؤولية عن الوفاة أو الإصابة الشخصية الناجمة عن إهمالنا. يتم توريد البضائع فقط للاستخدام الخاص والمنزلي، ولن نكون مسؤولين عن أي خسائر تجارية أو تجارية أو مهنية.`
        },
        {
          title: '9. المعلومات الشخصية',
          content: `تتم معالجة المعلومات الشخصية لغرض تنفيذ الطلبات وتقديم خدمات دعم العملاء. سيتم مشاركة البيانات الشخصية مع أطراف ثالثة فقط عند الضرورة لتنفيذ الطلب أو كما هو مطلوب بموجب القانون المعمول به.`
        },
        {
          title: '10. عام',
          content: `نحتفظ بالحق في نقل أو تعيين حقوقنا والتزاماتنا بموجب هذه الشروط لأي طرف ثالث. لا يجوز لك تعيين أو نقل حقوقك أو التزاماتك دون موافقتنا الخطية المسبقة. أي فشل أو تأخير من جانبنا في إنفاذ أي حكم من هذه الشروط لا يشكل تنازلاً عن حقوقنا. تخضع هذه الشروط وتُفسر وفقًا لقوانين الكويت، ويكون لمحاكم الكويت الاختصاص الحصري على أي نزاعات تنشأ عنها.`
        }
      ]
    }
  };

  const text = content[currentLang];

  return (
    <div className={`terms-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="terms-hero">
        <div className="container">
          <h1 className="terms-title">{text.title}</h1>
          <p className="terms-subtitle">{text.lastUpdated}</p>
        </div>
      </div>

      <div className="terms-content">
        <div className="container">
          <div className="terms-container">
            {text.sections.map((section, index) => (
              <div key={index} className="terms-section">
                <h2 className="section-title">{section.title}</h2>
                <p className="section-content">{section.content}</p>
              </div>
            ))}

            <div className="terms-contact">
              <h3>
                {currentLang === 'en' ? 'Questions?' : 'أسئلة؟'}
              </h3>
              <p>
                {currentLang === 'en' 
                  ? 'If you have any questions about our Terms of Service, please contact us at:'
                  : 'إذا كان لديك أي أسئلة حول شروط الخدمة الخاصة بنا، يرجى الاتصال بنا على:'}
              </p>
              <a href="mailto:hollandaflowers@gmail.com" className="contact-email">
                hollandaflowers@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;