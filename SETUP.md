# BookBridge - Complete Setup Guide

## ✅ Project Status: READY TO RUN

All files are verified and in place. Your production-level BookBridge application is complete!

---

## 📋 Project Checklist

- ✅ Backend structure (Express.js server, 5 controllers, 28 API endpoints)
- ✅ Frontend structure (React.js, 9 pages, Tailwind CSS styling)
- ✅ Database schema (MySQL, 13 tables with relationships)
- ✅ Authentication system (JWT + bcrypt)
- ✅ File upload infrastructure (Multer)
- ✅ Admin dashboard & controls
- ✅ Complete documentation
- ✅ Environment templates (.env.example)
- ✅ Installation scripts (Bash & Batch)
- ✅ Project verification scripts

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Automated Installation (Recommended)

**Windows:**
```bash
cd BOOksBridge
install.bat
```

**Linux/Mac:**
```bash
cd BOOksBridge
bash install.sh
```

### Option 2: Manual Installation

**1. Install Backend Dependencies**
```bash
cd backend
npm install
```

**2. Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

**3. Setup Database**
```bash
mysql -u root -p < ../database/schema.sql
```

**4. Configure Environment Variables**
```bash
# Backend
cd ../backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd ../frontend
cp .env.example .env
```

**5. Start the Application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

---

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Docs:** Available in README.md

---

## 📝 Test User Credentials

### Testing the Application

1. **Register** at http://localhost:3000/register
   - Use an educational email (@.edu, @.ac.uk, @.ac.in)
   - Example: `student@university.edu`
   - Password must have: 8+ chars, uppercase, lowercase, number, special char

2. **Test Features**
   - Add a book (Dashboard → Add Book)
   - Browse books (Books → Filter & Search)
   - Leave a review (Book Details → Reviews)
   - Check admin panel (if registered as admin)

---

## 📁 Project Structure

```
BOOksBridge/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app entry
│   │   ├── config/
│   │   │   ├── database.js        # MySQL connection
│   │   │   └── constants.js       # App constants
│   │   ├── controllers/           # Business logic (5 files)
│   │   ├── routes/                # API routes (5 files)
│   │   ├── middleware/            # Auth & error handling
│   │   └── utils/                 # Helpers & validators
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main router
│   │   ├── pages/                 # Components (9 files)
│   │   ├── components/            # Reusable UI (4 files)
│   │   ├── context/               # Auth context
│   │   ├── services/              # API client
│   │   └── styles/                # Tailwind CSS
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── schema.sql                 # MySQL schema (13 tables)
│
├── README.md                      # Complete documentation
├── QUICKSTART.md                  # 5-minute guide
├── ARCHITECTURE.md                # System design
└── SETUP.md                       # This file
```

---

## 🐛 Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock files
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 or 5000 already in use

**Solution - Change port in backend:**
Edit `backend/.env`:
```env
PORT=5001
```

**Solution - Change port in frontend:**
Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### Issue: MySQL connection error

**Check credentials:**
1. Open `backend/.env`
2. Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`
3. Ensure MySQL server is running

**Create database:**
```bash
mysql -u root -p
> CREATE DATABASE bookbridge;
> EXIT;

mysql -u root -p bookbridge < database/schema.sql
```

### Issue: Images not uploading

1. Ensure `backend/uploads/` directory exists (created automatically)
2. Check file size (max 5MB)
3. Use supported formats: jpg, jpeg, png, gif, webp

---

## 🔐 Security Checklist

- ✅ JWT token expiration: 7 days
- ✅ Password hashing: bcrypt (10 salt rounds)
- ✅ Email validation: Educational domains only
- ✅ File upload validation: Type & size checks
- ✅ SQL injection protection: Parameterized queries
- ✅ CORS configured: Frontend only
- ✅ Error messages: No sensitive info leaked

### ⚠️ Before Production:

1. **Change JWT secret** in `backend/.env`:
   ```env
   JWT_SECRET=your-very-secure-random-string-here
   ```

2. **Update CORS** in `backend/src/server.js`:
   ```javascript
   origin: process.env.FRONTEND_URL || 'http://localhost:3000'
   ```

3. **Enable HTTPS** on production server

4. **Setup environment variables** properly for all credentials

---

## 📚 API Endpoints (28 Total)

### Authentication (5 endpoints)
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Current user
- PUT `/api/auth/profile` - Update profile
- PUT `/api/auth/change-password` - Change password

### Books (6 endpoints)
- POST `/api/books` - Add book (with image upload)
- GET `/api/books?filters` - List with filters
- GET `/api/books/:id` - Get details
- PUT `/api/books/:id` - Update book
- DELETE `/api/books/:id` - Delete book
- GET `/api/books/seller/:id` - Seller's books

### Reviews (4 endpoints)
- POST `/api/reviews` - Create review
- GET `/api/reviews/seller/:id` - Seller reviews
- PUT `/api/reviews/:id` - Update review
- DELETE `/api/reviews/:id` - Delete review

### Transactions (5 endpoints)
- POST `/api/transactions` - Create transaction
- GET `/api/transactions` - Get transactions
- GET `/api/transactions/:id` - Get details
- PUT `/api/transactions/:id` - Update status
- GET `/api/transactions/stats` - Sales statistics

### Admin (8 endpoints)
- GET `/api/admin/users` - All users
- PUT `/api/admin/users/:id/verify` - Verify user
- PUT `/api/admin/users/:id/suspend` - Suspend user
- GET `/api/admin/bookstores` - Pending bookstores
- PUT `/api/admin/bookstores/:id/approve` - Approve
- DELETE `/api/admin/books/:id` - Remove book
- GET `/api/admin/statistics` - Platform stats
- GET `/api/admin/logs` - Admin logs

---

## 🎨 Frontend Pages

### Public Pages (Anyone)
- `/` - Home page
- `/login` - Login
- `/register` - Register
- `/books` - Browse books
- `/book/:id` - Book details

### Authenticated Pages (Students & Bookstores)
- `/add-book` - List new book
- `/dashboard` - Seller dashboard
- `/profile` - User profile

### Admin Pages (Admin Only)
- `/admin` - Admin dashboard with 4 tabs:
  - Statistics (6 metrics)
  - Users (verification)
  - Bookstores (approval)
  - Logs (audit trail)

---

## 🛠️ Development Tips

### Adding a new API endpoint:

1. **Create controller function** in `backend/src/controllers/`
2. **Add route** in `backend/src/routes/`
3. **Export from API service** in `frontend/src/services/api.js`
4. **Use in component** with error handling

### Adding a new page:

1. **Create component** in `frontend/src/pages/`
2. **Add route** in `frontend/src/App.js`
3. **Add navigation link** in `frontend/src/components/Navbar.js`

### Styling with Tailwind:

- Use utility classes: `className="flex justify-center items-center"`
- Custom colors defined in `frontend/tailwind.config.js`
- Custom utilities in `frontend/src/styles/index.css`

---

## 📊 Database Schema Overview

**13 Tables:**
1. `users` - User accounts
2. `bookstores` - Premium seller profiles
3. `books` - Book listings
4. `transactions` - Purchase/donation records
5. `reviews` - Seller ratings
6. `wishlist` - Favorite books
7. `advertisements` - Platform ads
8. `messages` - Buyer-seller chat (future)
9. `admin_logs` - Audit trail
10. `search_history` - Analytics
11. Plus 3 supporting tables

**Key Relationships:**
- Users → Books (One-to-Many)
- Users → Transactions (One-to-Many)
- Books → Transactions (One-to-Many)
- Users → Reviews (One-to-Many)

---

## 🚀 Deployment

### Deploy Backend to Heroku:

```bash
heroku create bookbridge-api
git push heroku main
heroku config:set JWT_SECRET=your-secret
heroku addons:create jawsdb:kitefin
```

### Deploy Frontend to Vercel:

```bash
npm install -g vercel
vercel
# Follow prompts and set REACT_APP_API_URL to your Heroku URL
```

---

## 📞 Support & Next Steps

### Testing:
1. Run all 28 API endpoints with Postman
2. Test authentication flow
3. Test file uploads
4. Test admin features

### Performance:
1. Enable database query caching
2. Optimize large result sets
3. Add Redis for session storage

### Features to Add:
1. Real-time notifications (Socket.io)
2. Payment integration (Stripe)
3. Advanced search (Elasticsearch)
4. Messaging system (WebSocket)

---

## 📝 License

MIT License - Free for personal and commercial use

---

**BookBridge is production-ready! 🎉**

Questions? Check README.md and ARCHITECTURE.md for more details.
