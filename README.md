# BookBridge - Student Book Exchange & Donation Platform

A complete, production-level web application for students to buy, sell, and donate academic books with real-time availability updates, verified users, and integrated rating system.

## 🌟 Features

### Core Features
- ✅ **User Authentication** - Register/Login with email validation
- ✅ **Role-Based Access** - Student, Bookstore (Premium), Admin
- ✅ **Book Management** - Add, edit, delete books with images
- ✅ **Search & Filters** - By subject, class, price, university
- ✅ **Real-Time Updates** - Instant availability changes after purchase
- ✅ **Reviews & Ratings** - Rate sellers (1-5 stars)
- ✅ **Transaction Management** - Sale, Donation, Exchange
- ✅ **Seller Dashboard** - View stats, sales, inventory
- ✅ **Admin Panel** - User verification, bookstore approval, logs
- ✅ **Wishlist** - Save favorite books

### Security
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Educational email validation
- ✅ Input validation & sanitization
- ✅ CORS protection

### Monetization
- ✅ Commission system on sales
- ✅ Premium bookstore subscriptions
- ✅ Admin fee tracking

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: express-validator

### Frontend
- **Library**: React.js with Hooks
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **API Client**: Axios
- **Icons**: React Icons

## 📁 Project Structure

```
BookBridge/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth & error handling
│   │   ├── config/            # Database & constants
│   │   ├── utils/             # Helpers & validators
│   │   └── server.js          # Main server
│   ├── uploads/               # User uploads
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API calls
│   │   ├── context/           # Auth context
│   │   ├── styles/            # CSS
│   │   ├── App.js             # Main component
│   │   └── index.js           # Entry point
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── .env.example
│   └── .gitignore
│
└── database/
    └── schema.sql             # MySQL schema
```

## 📋 Prerequisites

- **Node.js** v14.0 or higher
- **npm** v6.0 or higher
- **MySQL** v5.7 or higher
- **Git**

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd BookBridge
```

### Step 2: Database Setup

1. Open MySQL and create the database:

```sql
CREATE DATABASE IF NOT EXISTS bookbridge;
USE bookbridge;
```

2. Import the schema:

```bash
mysql -u root -p bookbridge < database/schema.sql
```

3. Verify tables created:

```sql
SHOW TABLES;
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Important variables:
# - DB_HOST=localhost
# - DB_USER=root
# - DB_PASSWORD=your_password
# - DB_NAME=bookbridge
# - PORT=5000
# - JWT_SECRET=your_super_secret_key

# Start the server
npm run dev
```

**Expected Output:**
```
✓ Database connected successfully
╔════════════════════════════════════════╗
║   BookBridge API Server Started        ║
║   Port: 5000                            ║
║   Environment: development              ║
║   URL: http://localhost:5000/api        ║
╚════════════════════════════════════════╝
```

### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (default should work if backend is on localhost:5000)
# REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view bookbridge-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://x.x.x.x:3000
```

## 📖 API Documentation

### Authentication Endpoints

```bash
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
GET    /api/auth/me                # Get current user
PUT    /api/auth/profile           # Update profile
POST   /api/auth/change-password   # Change password
```

### Book Endpoints

```bash
POST   /api/books                  # Add new book
GET    /api/books                  # Get all books (with filters)
GET    /api/books/:bookId          # Get book details
PUT    /api/books/:bookId          # Update book
DELETE /api/books/:bookId          # Delete book
GET    /api/books/seller/:sellerId # Get seller's books
```

### Review Endpoints

```bash
POST   /api/reviews                      # Create review
GET    /api/reviews/seller/:sellerId     # Get seller reviews
PUT    /api/reviews/:reviewId            # Update review
DELETE /api/reviews/:reviewId            # Delete review
```

### Transaction Endpoints

```bash
POST   /api/transactions           # Create transaction
GET    /api/transactions           # Get user transactions
GET    /api/transactions/:txnId    # Get transaction details
PUT    /api/transactions/:txnId    # Update transaction status
GET    /api/transactions/stats/dashboard  # Get sales stats
```

### Admin Endpoints

```bash
GET    /api/admin/users            # Get all users
PUT    /api/admin/users/:id/verify # Verify user
PUT    /api/admin/users/:id/suspend # Suspend user
GET    /api/admin/bookstores       # Get bookstore requests
PUT    /api/admin/bookstores/:id/approve # Approve bookstore
DELETE /api/admin/books/:id        # Remove book
GET    /api/admin/statistics       # Get platform stats
GET    /api/admin/logs             # Get admin logs
```

## 🔐 Test Credentials

Create test accounts:

1. **Student Account**
   - Email: studenttest@university.edu
   - Password: Student@123

2. **Bookstore Account**
   - Email: bookstore@college.edu
   - Password: Bookstore@123

3. **Admin Account** (Create via database)
   ```sql
   INSERT INTO users 
   (full_name, email, password, role, is_verified)
   VALUES 
   ('Admin User', 'admin@bookbridge.test', 
    '$2b$10$YOUR_HASHED_PASSWORD', 'admin', TRUE);
   ```

## 🌐 Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with features |
| `/login` | Login | User login |
| `/register` | Register | New user registration |
| `/books` | Browse | Search & filter books |
| `/book/:id` | Details | Book details & reviews |
| `/add-book` | Sell | Add book for sale/donation |
| `/dashboard` | Dashboard | Seller dashboard & stats |
| `/profile` | Profile | User profile & settings |
| `/admin` | Admin | Admin panel (admin only) |

## 🔒 Security Features

✅ Password Validation
- Min 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character

✅ Email Validation
- Educational domains only (.edu, .ac.uk, .ac.in)
- Email format validation

✅ JWT Protection
- Token expiration (7 days default)
- Bearer token authentication
- Automatic logout on token expiration

✅ Input Validation
- XSS protection through input sanitization
- SQL injection prevention via parameterized queries
- File upload validation

## 💾 Database Schema Highlights

### Key Tables
- **users** - User accounts with roles
- **books** - Book listings with metadata
- **transactions** - Purchase/donation records
- **reviews** - Seller ratings and reviews
- **bookstores** - Premium seller information
- **admin_logs** - Admin action tracking

### Relationships
- Users → Books (One-to-Many)
- Users → Transactions (One-to-Many)
- Users → Reviews (One-to-Many)
- Books → Transactions (One-to-Many)
- Bookstores → Users (One-to-One)

## 🚀 Deployment

### Backend Deployment (Heroku/AWS)

```bash
# Create Heroku app
heroku create bookbridge-api

# Set environment variables
heroku config:set DB_HOST=your_db_host
heroku config:set DB_USER=your_db_user
heroku config:set DB_PASSWORD=your_db_password
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

```bash
# Build production version
npm run build

# Deploy to Vercel
vercel

# OR deploy to Netlify
# Drag and drop 'build' folder
```

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed**
```
Error: ECONNREFUSED
✓ Check MySQL is running
✓ Verify DB credentials in .env
✓ Ensure database exists
```

**Port Already in Use**
```
Change PORT in .env or kill process on port 5000
```

### Frontend Issues

**API URL Not Working**
```
✓ Ensure backend is running on port 5000
✓ Check REACT_APP_API_URL in .env
✓ Check browser console for CORS errors
```

**Styles Not Loading**
```
✓ Clear browser cache: Ctrl+Shift+Delete
✓ Restart dev server: npm start
```

## 📝 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=bookbridge
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
COMMISSION_RATE=0.10
ALLOWED_DOMAINS=edu,ac.uk,ac.in
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

## 📚 Features Implementation Details

### Authentication Flow
1. User registers with educational email
2. System validates email domain
3. Password is hashed using bcrypt
4. JWT token generated on login
5. Token stored in localStorage
6. Protected routes check token validity

### Book Listing Flow
1. User adds book with image upload
2. Image stored in `backend/uploads/`
3. Book indexed by subject, class, university
4. Real-time availability updates
5. View count incremented per visit

### Transaction Flow
1. Buyer initiates purchase/donation
2. Transaction created with pending status
3. Seller can accept/reject
4. On completion, book marked as sold
5. Commission calculated and recorded

### Review System
1. Buyers can rate sellers (1-5 stars)
2. Reviews stored with transaction reference
3. Average rating calculated automatically
4. Displayed on seller profile

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For issues and support:
- Create GitHub issue
- Contact: support@bookbridge.com
- Documentation: https://docs.bookbridge.com

## 🎯 Future Enhancements

- [ ] Real-time notifications (Socket.io)
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Message/Chat system
- [ ] Book recommendations AI
- [ ] QR code integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

**Made with ❤️ by BookBridge Team**

*Building a sustainable future for student education, one book at a time.*
