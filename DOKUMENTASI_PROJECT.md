# DOKUMENTASI LENGKAP PROJECT PWS - MYKULLINER

## 📋 OVERVIEW PROJECT
MyKulliner adalah aplikasi web untuk mencari dan menyimpan resep makanan dengan sistem API key untuk keamanan.

## 🏗️ ARSITEKTUR PROJECT

### Folder Structure:
```
Project PWS/
├── index.js              # Entry point server
├── package.json          # Dependencies
├── .env                  # Environment variables
├── config/
│   └── config.js         # Database configuration
├── models/
│   ├── index.js          # Database connection
│   ├── user.js           # User model
│   ├── recipe.js         # Recipe model
│   └── favorite.js      # Favorite model
├── controllers/
│   ├── authController.js # Authentication logic
│   ├── recipeController.js # Recipe logic
│   ├── favoriteController.js # Favorite logic
│   └── adminController.js # Admin logic
├── middlewares/
│   ├── authMiddleware.js # JWT validation
│   └── adminMiddleware.js # Admin role validation
├── routes/
│   └── api.js            # API routes
├── migrations/           # Database migrations
└── public/              # Frontend files
    ├── index.html       # Dashboard user
    ├── login.html       # Login page
    ├── register.html    # Registration page
    ├── admin.html       # Admin panel
    ├── style.css        # Global styles
    ├── script.js        # Frontend logic
    └── navbar.js        # Navbar component
```

## 🔧 BACKEND EXPLANATION

### 1. index.js - Server Entry Point
**Fungsi:** Memulai server Express.js
**Logika:**
- Load environment variables
- Connect ke database Sequelize
- Setup middleware (CORS, JSON parsing)
- Mount API routes
- Start server pada port yang ditentukan
**Kenapa:** Entry point yang mengatur semua konfigurasi server

### 2. Database Models (models/)

#### user.js
**Fungsi:** Model data user dengan authentication
**Fields:** username, password (hashed), role, apiKey
**Logika API Key:** Generate random key 'mykulliner_' + 32 hex chars
**Kenapa:** API key sebagai additional security layer

#### recipe.js
**Fungsi:** Model data resep yang di-import admin
**Fields:** idMeal, strMeal, strThumb, strCategory, strInstructions
**Kenapa:** Cache resep dari TheMealDB untuk rekomendasi

#### favorite.js
**Fungsi:** Model data favorit user
**Fields:** idMeal, strMeal, strThumb, userId
**Kenapa:** Many-to-many relationship user-recipe

### 3. Controllers (controllers/)

#### authController.js
**Fungsi:** Handle authentication logic
**Methods:**
- register: Buat user baru + generate API key
- login: Validasi username, password, API key (3 faktor)
- regenerateKey: Generate API key baru
- recoverKey: Recovery API key yang lupa
**Logika 3 Faktor:** Username + Password + API Key
**Kenapa:** Security berlapis, API key seperti password kedua

#### recipeController.js
**Fungsi:** Handle recipe operations
**Methods:**
- searchRecipes: Query TheMealDB API
- getRecipeDetail: Detail resep spesifik
**Kenapa:** Bridge ke external API dengan caching

#### adminController.js
**Fungsi:** Handle admin operations
**Methods:**
- getAllUsers: List semua user (termasuk API key)
- importRecipe: Import dari TheMealDB ke local DB
- getRecommendations: List rekomendasi dari local DB
- deleteRecipe/deleteUser: CRUD operations
**Kenapa:** Admin control untuk content management

#### favoriteController.js
**Fungsi:** Handle user favorites
**Methods:**
- addFavorite: Tambah ke favorit user
- getFavorites: List favorit user
**Kenapa:** Personalization untuk user

### 4. Middlewares

#### authMiddleware.js
**Fungsi:** Validate JWT token
**Logika:** Extract token dari header, verify signature
**Kenapa:** Protect routes yang butuh authentication

#### adminMiddleware.js
**Fungsi:** Validate admin role
**Logika:** Check user.role === 'admin'
**Kenapa:** Protect admin-only operations

### 5. Routes (routes/api.js)
**Fungsi:** Define API endpoints
**Structure:**
- Authentication: /auth/* (no middleware)
- Recipes: /recipes/* (authenticate)
- Favorites: /favorites/* (authenticate)
- Admin: /admin/* (authenticate + verifyAdmin)
**Kenapa:** RESTful API dengan proper security layers

## 🎨 FRONTEND EXPLANATION

### 1. HTML Pages

#### index.html
**Fungsi:** Dashboard user utama
**Features:** Search recipes, API key display, recommendations
**Kenapa:** Central hub untuk user experience

#### login.html
**Fungsi:** Authentication page
**Features:** 3-factor login form, forgot API key modal
**Kenapa:** Secure entry point dengan recovery option

#### register.html
**Fungsi:** User registration
**Features:** Registration form, API key display on success
**Kenapa:** Onboarding flow yang user-friendly

#### admin.html
**Fungsi:** Admin control panel
**Features:** User management, recipe import, statistics dashboard
**Kenapa:** Admin interface untuk content management

### 2. CSS (style.css)
**Fungsi:** Global styling system
**Features:**
- CSS variables untuk consistency
- Poppins font untuk modern look
- Responsive design dengan Bootstrap 5
- Custom animations dan hover effects
**Kenapa:** Consistent design system yang maintainable

### 3. JavaScript Files

#### script.js
**Fungsi:** Core frontend logic
**Features:**
- Authentication handling
- API communication
- UI interactions
- Admin panel functionality
- API key recovery
**Kenapa:** Single file untuk maintainability

#### navbar.js
**Fungsi:** Dynamic navbar component
**Features:**
- Conditional admin menu
- Smart back button (hanya di favorites)
- Role-based rendering
**Kenapa:** Reusable component dengan conditional logic

## 🔐 SECURITY IMPLEMENTATION

### 1. Multi-Factor Authentication
**Logika:** Username + Password + API Key
**Kenapa:** 3 layers of security, API key seperti password kedua

### 2. JWT Token System
**Logika:** Stateless authentication dengan expiration
**Kenapa:** Scalable dan secure session management

### 3. Password Hashing
**Logika:** bcrypt dengan salt rounds
**Kenapa:** Protection against rainbow table attacks

### 4. API Key System
**Logika:** Random 32-char hex string dengan prefix
**Kenapa:** Additional security layer, easy to regenerate

### 5. Role-Based Access Control
**Logika:** Middleware untuk validate roles
**Kenapa:** Principle of least privilege

## 📊 DATABASE DESIGN

### Relationships:
- User (1) -> (n) Favorite (n) <- (1) Recipe
- User (1) -> (n) Recipe (admin imports)

### Why Sequelize:
- ORM untuk type safety
- Migration support
- Easy relationships
- Cross-database compatibility

## 🚀 API DESIGN PATTERNS

### RESTful Principles:
- GET untuk read operations
- POST untuk create
- PUT untuk update
- DELETE untuk remove

### Error Handling:
- Consistent JSON responses
- Proper HTTP status codes
- User-friendly error messages

### Validation:
- Input validation di controller level
- Parameter validation
- Type checking

## 🎯 BUSINESS LOGIC

### User Flow:
1. Register → Get API Key
2. Login → 3-factor validation
3. Search recipes → External API
4. Save favorites → Local database
5. Admin can import recipes → Cache system

### Admin Flow:
1. Import recipes from TheMealDB
2. Manage users
3. View statistics
4. Content moderation

## 🔧 TECHNICAL DECISIONS

### Why Express.js:
- Minimalist framework
- Large ecosystem
- Easy middleware integration
- Good for APIs

### Why Sequelize:
- Type safety
- Migration support
- Easy relationships
- Cross-platform

### Why Bootstrap 5:
- Responsive design
- Component-based
- Customizable
- Good documentation

### Why JWT:
- Stateless
- Secure
- Standard practice
- Easy implementation

## 📈 PERFORMANCE CONSIDERATIONS

### Caching Strategy:
- Local database untuk rekomendasi
- External API calls hanya saat search
- Static assets di CDN

### Database Optimization:
- Proper indexing
- Efficient queries
- Connection pooling

### Frontend Optimization:
- Lazy loading images
- Debounced search
- Efficient DOM manipulation

## 🔄 MAINTENANCE & SCALABILITY

### Code Organization:
- Separation of concerns
- Modular structure
- Clear naming conventions
- Comprehensive documentation

### Scalability:
- Stateless authentication
- Database connection pooling
- API rate limiting ready
- Easy horizontal scaling

## 🎨 UX DESIGN PRINCIPLES

### User Experience:
- Intuitive navigation
- Clear error messages
- Consistent design language
- Mobile-responsive

### Admin Experience:
- Comprehensive dashboard
- Bulk operations
- Real-time statistics
- Efficient workflows

## 📝 CONCLUSION

Project MyKulliner mengimplementasikan:
- **Security berlapis** dengan 3-factor authentication
- **Scalable architecture** dengan RESTful API
- **User-friendly interface** dengan modern design
- **Admin control system** untuk content management
- **Maintainable codebase** dengan proper separation of concerns

**Total Files:** ~20+ files dengan ~2000+ lines of code
**Technologies:** Node.js, Express, Sequelize, Bootstrap 5, JWT, bcrypt
**Security Level:** High dengan multi-factor authentication
**Scalability:** Medium-High dengan stateless design
