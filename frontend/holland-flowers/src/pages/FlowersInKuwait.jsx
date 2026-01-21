import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import './FlowersInKuwait.css';

const FlowersInKuwait = () => {
  return (
    <>
      <SEO 
        title="Fresh Flowers in Kuwait | Holland Flowers - Premium Bouquets & Same Day Delivery"
        description="Order fresh flowers in Kuwait from Holland Flowers. Premium roses, tulips, orchids, lilies with same-day delivery across Kuwait City, Salmiya, Hawally. Best florist in Kuwait since 2010. Call +965 6003 8844"
        keywords="flowers Kuwait, fresh flowers Kuwait, flower shop Kuwait, florist Kuwait, buy flowers online Kuwait, premium flowers, flower delivery Kuwait, Holland Flowers, best florist Kuwait, Kuwait flower shop"
        canonical="https://www.flowerskw.com/flowers-in-kuwait"
      />
      
      <div className="keyword-page">
        <div className="keyword-hero">
          <div className="container">
            <h1>Fresh Flowers in Kuwait - Holland Flowers</h1>
            <p className="lead">Kuwait's Premier Florist Since 2010 | Same Day Delivery Across All Areas</p>
            <div className="hero-cta">
              <a href="tel:+96560038844" className="btn btn-primary">Call: +965 6003 8844</a>
              <Link to="/" className="btn btn-success">Order Online Now</Link>
            </div>
          </div>
        </div>

        <div className="container content-section">
          <div className="intro-text">
            <p>
              Looking for the freshest, most beautiful flowers in Kuwait? Holland Flowers is Kuwait's leading florist, 
              offering premium quality flowers and bouquets for every occasion. Since 2010, we've been delivering 
              happiness across Kuwait City, Salmiya, Hawally, Farwaniya, Ahmadi, and all areas of Kuwait with our 
              expertly crafted floral arrangements.
            </p>
            
            <p>
              Our flowers are sourced daily from the best suppliers to ensure maximum freshness and longevity. Whether 
              you need roses for a romantic gesture, tulips for a special celebration, orchids for a corporate event, 
              or mixed bouquets for any occasion, Holland Flowers has the perfect arrangement waiting for you.
            </p>
          </div>

          <section className="content-block">
            <h2>Why Choose Holland Flowers Kuwait?</h2>
            
            <div className="features-grid">
              <div className="feature-item">
                <h3>🌹 Premium Quality Flowers</h3>
                <p>
                  We source only the freshest flowers from trusted suppliers. Each stem is hand-selected by our 
                  expert florists to ensure you receive the highest quality blooms. Our flowers last longer and 
                  look more vibrant than standard bouquets.
                </p>
              </div>

              <div className="feature-item">
                <h3>🚚 Same Day Delivery</h3>
                <p>
                  Need flowers delivered today? Order before 9 PM and receive same-day delivery across Kuwait City, 
                  Salmiya, Hawally, and surrounding areas. We understand that timing matters when expressing your 
                  feelings or celebrating special moments.
                </p>
              </div>

              <div className="feature-item">
                <h3>💐 Expert Florist Team</h3>
                <p>
                  Our skilled florists have years of experience creating stunning arrangements. They understand 
                  color theory, flower compatibility, and design principles to create bouquets that truly impress. 
                  Every arrangement is a work of art.
                </p>
              </div>

              <div className="feature-item">
                <h3>🎁 Perfect for Every Occasion</h3>
                <p>
                  Birthdays, weddings, anniversaries, Valentine's Day, Mother's Day, Eid celebrations, corporate 
                  events, sympathy arrangements - whatever the occasion, we have the perfect flowers to express 
                  your sentiments beautifully.
                </p>
              </div>
            </div>
          </section>

          <section className="content-block">
            <h2>Our Flower Collection in Kuwait</h2>
            
            <p>
              At Holland Flowers, we offer an extensive selection of flowers to suit every taste and occasion:
            </p>

            <div className="flower-types">
              <div className="flower-type">
                <h3>🌹 Roses</h3>
                <p>
                  Our signature collection includes red roses for romance, white roses for purity and elegance, 
                  yellow roses for friendship, pink roses for admiration, and mixed rose bouquets. Available in 
                  various sizes from single stems to grand 100-rose bouquets.
                </p>
              </div>

              <div className="flower-type">
                <h3>🌷 Tulips</h3>
                <p>
                  Fresh tulips in vibrant colors - red, yellow, pink, purple, white, and mixed arrangements. 
                  Perfect for spring celebrations, adding a touch of European elegance to any setting. Seasonal 
                  availability ensures peak freshness.
                </p>
              </div>

              <div className="flower-type">
                <h3>🌺 Orchids</h3>
                <p>
                  Exotic orchid plants and arrangements that last for months. Available in white, purple, pink, 
                  and rare varieties. Ideal for corporate gifts, hotel decorations, and sophisticated home decor. 
                  Our orchids come with care instructions.
                </p>
              </div>

              <div className="flower-type">
                <h3>🌻 Sunflowers</h3>
                <p>
                  Bright, cheerful sunflowers that bring joy to any space. Perfect for birthdays, get-well wishes, 
                  and brightening someone's day. Available in bouquets or combined with other seasonal flowers.
                </p>
              </div>

              <div className="flower-type">
                <h3>💐 Mixed Bouquets</h3>
                <p>
                  Professionally designed mixed arrangements featuring complementary flowers and greenery. Our 
                  florists create unique combinations that showcase seasonal blooms in harmonious color palettes.
                </p>
              </div>

              <div className="flower-type">
                <h3>🌸 Lilies & Baby's Breath</h3>
                <p>
                  Elegant lilies in white, pink, and yellow, plus delicate baby's breath for romantic, dreamy 
                  arrangements. Popular for weddings, anniversaries, and special celebrations.
                </p>
              </div>
            </div>
          </section>

          <section className="content-block">
            <h2>Delivery Areas Across Kuwait</h2>
            
            <p>
              Holland Flowers proudly serves customers throughout Kuwait with reliable, professional delivery service:
            </p>

            <div className="delivery-areas">
              <ul className="area-list">
                <li>Kuwait City - Same day delivery available</li>
                <li>Salmiya - Express delivery in 2-4 hours</li>
                <li>Hawally - Fast, reliable service</li>
                <li>Farwaniya - Daily delivery routes</li>
                <li>Ahmadi - Oil sector corporate deliveries</li>
                <li>Jahra - Extended delivery coverage</li>
                <li>Fahaheel - Same day delivery</li>
                <li>Mangaf - Coastal area coverage</li>
                <li>Fintas - Residential delivery specialist</li>
                <li>Mahboula - Apartment complex delivery</li>
                <li>Sabah Al Salem - Family neighborhood service</li>
                <li>Mubarak Al Kabeer - Growing area coverage</li>
              </ul>
            </div>

            <p>
              Can't find your area? Contact us at <strong>+965 6003 8844</strong> - we deliver to most locations 
              across Kuwait!
            </p>
          </section>

          <section className="content-block">
            <h2>How to Order Flowers in Kuwait</h2>
            
            <div className="ordering-steps">
              <div className="step">
                <span className="step-number">1</span>
                <h3>Choose Your Flowers</h3>
                <p>Browse our online collection or call us for personalized recommendations based on your occasion and budget.</p>
              </div>

              <div className="step">
                <span className="step-number">2</span>
                <h3>Customize Your Order</h3>
                <p>Select size, add chocolates or perfume, and include a personalized message card (free with every order).</p>
              </div>

              <div className="step">
                <span className="step-number">3</span>
                <h3>Schedule Delivery</h3>
                <p>Choose same-day delivery or schedule for a future date. Provide recipient's address and contact number.</p>
              </div>

              <div className="step">
                <span className="step-number">4</span>
                <h3>Secure Payment</h3>
                <p>Pay via KNET, credit card, or cash on delivery. All transactions are secure and encrypted.</p>
              </div>

              <div className="step">
                <span className="step-number">5</span>
                <h3>Track & Delivery</h3>
                <p>Receive confirmation and tracking updates. Our delivery team ensures safe, timely arrival of your flowers.</p>
              </div>
            </div>
          </section>

          <section className="content-block cta-section">
            <h2>Order Fresh Flowers in Kuwait Today</h2>
            
            <p className="cta-text">
              Experience the Holland Flowers difference - premium quality, expert craftsmanship, and reliable 
              delivery across Kuwait. Whether you're celebrating love, expressing sympathy, or brightening 
              someone's day, our flowers speak from the heart.
            </p>

            <div className="contact-options">
              <div className="contact-method">
                <h3>📞 Call to Order</h3>
                <a href="tel:+96560038844" className="contact-link">+965 6003 8844</a>
                <p>Place orders by phone</p>
              </div>

              <div className="contact-method">
                <h3>💬 WhatsApp Queries</h3>
                <a href="https://wa.me/96560038844" className="contact-link">Message for Questions</a>
                <p>Have questions? Ask us!</p>
              </div>

              <div className="contact-method">
                <h3>🌐 Order Online</h3>
                <Link to="/" className="contact-link">Shop Our Catalog</Link>
                <p>Browse and order online</p>
              </div>

              <div className="contact-method">
                <h3>🏪 Visit Us</h3>
                <p className="contact-link">Ghanima Complex, Shop 54</p>
                <p>Kuwait City</p>
              </div>
            </div>

            <div className="opening-hours">
              <h3>Opening Hours</h3>
              <p>Sunday - Thursday: 9:00 AM - 9:00 PM</p>
              <p>Friday: 2:00 PM - 9:00 PM</p>
              <p>Saturday: 9:00 AM - 9:00 PM</p>
            </div>
          </section>

          <section className="content-block">
            <h2>Related Services</h2>
            <div className="related-links">
              <Link to="/flower-delivery-kuwait">Flower Delivery Service →</Link>
              <Link to="/same-day-flower-delivery-kuwait">Same Day Delivery →</Link>
              <Link to="/birthday-flowers-kuwait">Birthday Flowers →</Link>
            </div>
          </section>
        </div>
      </div>

      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Fresh Flowers in Kuwait - Holland Flowers",
          "description": "Order fresh flowers in Kuwait from Holland Flowers. Premium roses, tulips, orchids with same-day delivery.",
          "url": "https://www.flowerskw.com/flowers-in-kuwait",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.flowerskw.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Flowers in Kuwait",
                "item": "https://www.flowerskw.com/flowers-in-kuwait"
              }
            ]
          }
        })}
      </script>
    </>
  );
};

export default FlowersInKuwait;