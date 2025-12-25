-- =====================================================
-- FLOWER E-COMMERCE DATABASE SETUP SCRIPT
-- Run this in Supabase SQL Editor after first deployment
-- =====================================================

-- Note: Tables are auto-created by Hibernate (ddl-auto: update)
-- This script is for initial data seeding

-- =====================================================
-- 1. CREATE INITIAL SUPER ADMIN
-- Password: Admin@123 (BCrypt encoded)
-- =====================================================
INSERT INTO users (
    name, 
    email, 
    phone_number, 
    password, 
    role_id, 
    is_active, 
    is_verified, 
    created_at, 
    updated_at
) VALUES (
    'Super Admin',
    'superadmin@flowerapp.com',
    '+96500000000',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IQnKDGVGbWNFQ.TbVv5YWVJw/GiPO.', -- Admin@123
    3, -- SUPER_ADMIN role
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 2. SAMPLE CATEGORIES
-- =====================================================
INSERT INTO categories (category_name, description, image_url, is_active, display_order, created_at, updated_at) VALUES
('Birthday Flowers', 'Beautiful bouquets perfect for birthday celebrations', NULL, true, 1, NOW(), NOW()),
('Anniversary', 'Romantic arrangements for anniversaries', NULL, true, 2, NOW(), NOW()),
('Wedding', 'Elegant floral arrangements for weddings', NULL, true, 3, NOW(), NOW()),
('Sympathy', 'Thoughtful arrangements to express condolences', NULL, true, 4, NOW(), NOW()),
('Get Well Soon', 'Cheerful flowers to brighten recovery', NULL, true, 5, NOW(), NOW()),
('Thank You', 'Express gratitude with beautiful blooms', NULL, true, 6, NOW(), NOW()),
('Just Because', 'Surprise someone special for no reason', NULL, true, 7, NOW(), NOW()),
('Seasonal', 'Special seasonal arrangements', NULL, true, 8, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. SAMPLE PRODUCTS
-- =====================================================
INSERT INTO products (
    category_id, 
    sku, 
    product_name, 
    description, 
    image_url, 
    actual_price, 
    offer_percentage, 
    final_price, 
    stock_quantity, 
    is_active, 
    is_featured, 
    created_at, 
    updated_at
) 
SELECT 
    c.category_id,
    'FLW-001',
    'Classic Red Roses',
    'A stunning bouquet of 12 premium red roses, symbolizing love and passion. Perfect for any romantic occasion.',
    NULL,
    25.000,
    10.00,
    22.500,
    50,
    true,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.category_name = 'Anniversary'
ON CONFLICT DO NOTHING;

INSERT INTO products (
    category_id, 
    sku, 
    product_name, 
    description, 
    image_url, 
    actual_price, 
    offer_percentage, 
    final_price, 
    stock_quantity, 
    is_active, 
    is_featured, 
    created_at, 
    updated_at
) 
SELECT 
    c.category_id,
    'FLW-002',
    'Birthday Celebration Bouquet',
    'Colorful mixed flowers including gerberas, lilies, and carnations arranged in a festive style.',
    NULL,
    35.000,
    15.00,
    29.750,
    30,
    true,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.category_name = 'Birthday Flowers'
ON CONFLICT DO NOTHING;

INSERT INTO products (
    category_id, 
    sku, 
    product_name, 
    description, 
    image_url, 
    actual_price, 
    offer_percentage, 
    final_price, 
    stock_quantity, 
    is_active, 
    is_featured, 
    created_at, 
    updated_at
) 
SELECT 
    c.category_id,
    'FLW-003',
    'Elegant White Orchids',
    'Luxurious white phalaenopsis orchid plant in a decorative pot. A sophisticated gift that lasts.',
    NULL,
    45.000,
    0.00,
    45.000,
    20,
    true,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.category_name = 'Thank You'
ON CONFLICT DO NOTHING;

INSERT INTO products (
    category_id, 
    sku, 
    product_name, 
    description, 
    image_url, 
    actual_price, 
    offer_percentage, 
    final_price, 
    stock_quantity, 
    is_active, 
    is_featured, 
    created_at, 
    updated_at
) 
SELECT 
    c.category_id,
    'FLW-004',
    'Sunshine Sunflowers',
    'Bright and cheerful sunflower arrangement to bring warmth and happiness.',
    NULL,
    28.000,
    5.00,
    26.600,
    40,
    true,
    false,
    NOW(),
    NOW()
FROM categories c WHERE c.category_name = 'Get Well Soon'
ON CONFLICT DO NOTHING;

INSERT INTO products (
    category_id, 
    sku, 
    product_name, 
    description, 
    image_url, 
    actual_price, 
    offer_percentage, 
    final_price, 
    stock_quantity, 
    is_active, 
    is_featured, 
    created_at, 
    updated_at
) 
SELECT 
    c.category_id,
    'FLW-005',
    'Bridal White Cascade',
    'Elegant cascading bouquet with white roses, calla lilies, and baby breath. Perfect for the bride.',
    NULL,
    85.000,
    0.00,
    85.000,
    15,
    true,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.category_name = 'Wedding'
ON CONFLICT DO NOTHING;

INSERT INTO products (
    category_id, 
    sku, 
    product_name, 
    description, 
    image_url, 
    actual_price, 
    offer_percentage, 
    final_price, 
    stock_quantity, 
    is_active, 
    is_featured, 
    created_at, 
    updated_at
) 
SELECT 
    c.category_id,
    'FLW-006',
    'Peaceful Lily Arrangement',
    'Serene white lily arrangement conveying sympathy and respect.',
    NULL,
    40.000,
    0.00,
    40.000,
    25,
    true,
    false,
    NOW(),
    NOW()
FROM categories c WHERE c.category_name = 'Sympathy'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. USEFUL QUERIES FOR ADMIN
-- =====================================================

-- View all users by role
-- SELECT * FROM users ORDER BY role_id DESC, created_at DESC;

-- View order statistics
-- SELECT 
--     order_status, 
--     COUNT(*) as count, 
--     SUM(total_amount) as total_revenue 
-- FROM orders 
-- GROUP BY order_status;

-- View low stock products (less than 10)
-- SELECT product_name, stock_quantity FROM products WHERE stock_quantity < 10 AND is_active = true;

-- View today's orders
-- SELECT * FROM orders WHERE DATE(created_at) = CURRENT_DATE;

-- =====================================================
-- 5. MAINTENANCE QUERIES
-- =====================================================

-- Clean up expired OTPs (run periodically)
-- DELETE FROM otps WHERE expiry_time < NOW() OR is_used = true;

-- Archive old orders (example - orders older than 1 year)
-- UPDATE orders SET archived = true WHERE created_at < NOW() - INTERVAL '1 year';

-- =====================================================
-- NOTES:
-- 1. Change superadmin password after first login
-- 2. Update sample product images via admin panel
-- 3. Configure Supabase RLS policies if needed
-- 4. Set up database backups in Supabase dashboard
-- =====================================================
