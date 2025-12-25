# Flower E-Commerce Backend

Production-ready Java Spring Boot backend for a Flower E-Commerce platform with role-based access control, Supabase integration, JWT authentication, OTP verification, and Hesabe payment gateway.

## 🏗️ Architecture

### Package Structure
```
com.flowerapp
├── config/           # SupabaseConfig, SwaggerConfig
├── security/         # JWT, Authentication Filter, Security Config
├── common/           # Enums, Exceptions, ApiResponse
├── user/             # User entity, auth, profile management
├── admin/            # Admin management, dashboard
├── order/            # Order & OrderItem management
├── product/          # Product management
├── category/         # Category management
├── payment/          # Hesabe payment integration
├── otp/              # OTP generation & verification
├── notification/     # Email service
└── storage/          # Supabase file storage
```

### Role-Based Access Control
| Role | ID | Capabilities |
|------|-----|-------------|
| USER | 1 | Sign up, login, view products/categories, place orders, make payments |
| ADMIN | 2 | Manage products/categories, view all orders/users, update order status |
| SUPER_ADMIN | 3 | All ADMIN permissions + manage admins, change user roles |

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL (Supabase)
- Gmail account (for SMTP)
- Hesabe merchant account

### Environment Variables
Create a `.env` file or set these environment variables:

```bash
# Supabase Database
SUPABASE_DB_URL=jdbc:postgresql://db.your-project.supabase.co:5432/postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your-password

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_STORAGE_BUCKET=flower-images

# JWT
JWT_SECRET=your-256-bit-secret-key-minimum-32-characters

# Email (Gmail SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Hesabe Payment
HESABE_MERCHANT_CODE=your-merchant-code
HESABE_ACCESS_CODE=your-access-code
HESABE_SECRET_KEY=your-secret-key
HESABE_IV_KEY=your-iv-key
HESABE_CALLBACK_URL=https://your-domain.com/api/v1/payments/callback
```

### Build & Run
```bash
# Clone and navigate
cd flower-ecommerce

# Build
mvn clean install

# Run
mvn spring-boot:run

# Or run the JAR
java -jar target/flower-ecommerce-1.0.0.jar
```

### Access
- API Base URL: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`
- API Docs: `http://localhost:8080/api/v1/api-docs`

## 📡 API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | User registration |
| POST | `/auth/login` | Admin/SuperAdmin login (email+password) |
| POST | `/auth/otp/send` | Send OTP for user login |
| POST | `/auth/otp/verify` | Verify OTP and get JWT |

### User Profile (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get current user profile |
| PUT | `/users/profile` | Update profile |
| PUT | `/users/profile/password` | Change password |

### Categories (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all active categories |
| GET | `/categories/{id}` | Get category by ID |

### Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all active products |
| GET | `/products/{id}` | Get product by ID |
| GET | `/products/category/{categoryId}` | Products by category |
| GET | `/products/search?query=...` | Search products |

### Orders (Authenticated - USER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create new order |
| GET | `/orders` | Get user's orders |
| GET | `/orders/{id}` | Get order by ID |
| GET | `/orders/number/{orderNumber}` | Get by order number |
| PUT | `/orders/{id}/cancel` | Cancel pending order |

### Payments (Authenticated - USER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/initiate` | Initiate Hesabe payment |
| POST | `/payments/callback` | Hesabe webhook (public) |
| GET | `/payments/{id}` | Get payment details |
| GET | `/payments/order/{orderId}` | Get payment by order |
| POST | `/payments/{id}/verify` | Verify payment status |

### Admin - Users (ADMIN, SUPER_ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| GET | `/admin/users/{id}` | Get user by ID |
| PUT | `/admin/users/{id}/status` | Enable/disable user |
| PUT | `/admin/users/{id}/role` | Change user role (SUPER_ADMIN only) |

### Admin - Orders (ADMIN, SUPER_ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | List all orders |
| GET | `/admin/orders/{id}` | Get order details |
| PUT | `/admin/orders/{id}/status` | Update order status |
| GET | `/admin/orders/statistics` | Order statistics |

### Admin - Products (ADMIN, SUPER_ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | List all products |
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/{id}` | Update product |
| DELETE | `/admin/products/{id}` | Delete product |
| PUT | `/admin/products/{id}/stock` | Update stock |

### Admin - Categories (ADMIN, SUPER_ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/categories` | List all categories |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/{id}` | Update category |
| DELETE | `/admin/categories/{id}` | Delete category |

### Admin - Admin Management (SUPER_ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/admins` | List all admins |
| POST | `/admin/admins` | Create new admin |
| PUT | `/admin/admins/{id}` | Update admin |
| DELETE | `/admin/admins/{id}` | Disable admin |

### File Upload (ADMIN, SUPER_ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/upload/product-image` | Upload product image |
| POST | `/admin/upload/category-image` | Upload category image |
| DELETE | `/admin/upload?fileUrl=...` | Delete uploaded file |

### Dashboard (ADMIN, SUPER_ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/statistics` | Dashboard statistics |

## 🔐 Security Features

1. **JWT Authentication**: All protected endpoints require Bearer token
2. **BCrypt Password Hashing**: Secure password storage
3. **OTP Verification**: 4-digit OTP with 5-minute expiry for user login
4. **Role-Based Access**: Strict endpoint restrictions by role
5. **Input Validation**: All requests validated with Bean Validation

## 💳 Payment Flow

1. User creates order → Order status: PENDING
2. User initiates payment → Hesabe checkout URL returned
3. User completes payment on Hesabe
4. Hesabe sends callback → Payment verified, Order status: CONFIRMED
5. Admin updates status: PROCESSING → OUT_FOR_DELIVERY → DELIVERED

### Supported Payment Methods
- KNET
- Visa / Mastercard / American Express
- Apple Pay
- Google Pay

## 📦 Order Status Flow
```
PENDING → CONFIRMED → PROCESSING → OUT_FOR_DELIVERY → DELIVERED
    ↓
CANCELLED (only from PENDING)
```

## 🗄️ Database Schema

### Initial Super Admin Setup
Run this SQL in Supabase SQL Editor after first deployment:

```sql
INSERT INTO users (name, email, phone_number, password, role_id, is_active, is_verified, created_at, updated_at)
VALUES (
  'Super Admin',
  'superadmin@yourcompany.com',
  '+96500000000',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.IQnKDGVGbWNFQ.TbVv5YWVJw/GiPO.', -- password: Admin@123
  3,
  true,
  true,
  NOW(),
  NOW()
);
```

### Supabase Storage Setup
1. Create bucket named `flower-images`
2. Set public access policy
3. Configure CORS for your domain

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest
```

## 📝 Environment Profiles

- `application.yml` - Default configuration
- `application-dev.yml` - Development settings (create if needed)
- `application-prod.yml` - Production settings (create if needed)

Run with profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## 🚢 Production Deployment

### Checklist
- [ ] Set all environment variables
- [ ] Configure SSL/TLS
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate`
- [ ] Enable production logging
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure monitoring (health endpoint at `/actuator/health`)

### Docker Deployment
```dockerfile
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY target/flower-ecommerce-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
docker build -t flower-ecommerce .
docker run -p 8080:8080 --env-file .env flower-ecommerce
```

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For technical support, contact your development team.
