# QUICK START GUIDE

## ⚡ 5-Minute Quick Start

### Prerequisites Check
```bash
node --version      # Should be v14+
npm --version       # Should be v6+
mysql --version     # Should be v5.7+
```

### System Commands

**1. Database Setup (Copy & Paste)**
```bash
mysql -u root -p bookbridge < database/schema.sql
```

**2. Backend Setup (Copy & Paste)**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set: DB_PASSWORD, JWT_SECRET
npm run dev
```

**3. Frontend Setup (Copy & Paste)**
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## 🌐 Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000/api
- **Database**: localhost:3306

## 📝 First Steps

1. Register with email ending in .edu or .ac.uk
2. Add a book for sale/donation
3. Browse other books
4. Purchase a book
5. Leave a review

## 🆘 Common Problems

| Problem | Solution |
|---------|----------|
| Database error | Check MySQL running: `mysql -u root -p -e "SHOW DATABASES;"` |
| Port 5000 in use | Change PORT in backend/.env |
| Port 3000 in use | Change port by running: `PORT=3001 npm start` |
| API not working | Verify REACT_APP_API_URL matches backend URL |
| Styles not loading | Clear cache: Ctrl+Shift+Delete or Cmd+Shift+Delete |

## 📚 Full Documentation

See `README.md` for complete documentation and API reference.
