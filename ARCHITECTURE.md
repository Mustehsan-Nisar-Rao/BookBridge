# BookBridge Architecture & Database Design

## System Architecture

```
User (Browser)
    ↓
React Frontend (PORT 3000)
    ↓
API Requests (Axios)
    ↓
Express.js Backend (PORT 5000)
    ↓
MySQL Database
```

## Database Relationships

```
Users (1) ──────── (Many) Books
  ├─ is_verified
  ├─ is_active
  └─ role: student|bookstore|admin

Users (1) ──────── (Many) Transactions
  ├─ Seller
  └─ Buyer

Users (1) ──────── (Many) Reviews
  └─ Reviewer

Bookstores (1) ── (Many) Books
  └─ Premium Seller

Books (1) ──────── (Many) Transactions
  ├─ Purchase
  ├─ Donation
  └─ Exchange

Transactions (1) ── (Many) Reviews
  └─ Transaction Reference

Admin_Logs (Tracks) Admin Actions
  └─ User Verification
  └─ Bookstore Approval
  └─ Book Removal
```

## API Flow Diagram

```
Authentication
├─ POST /auth/register → User Created → JWT Token
├─ POST /auth/login → User Found → JWT Token
├─ GET /auth/me → Token Verified → User Data
└─ PUT /auth/profile → Profile Updated

Books Management
├─ POST /books → Book Listed
├─ GET /books?filters → Books Filtered
├─ GET /books/:id → Details + Reviews
├─ PUT /books/:id → Book Updated
└─ DELETE /books/:id → Book Deleted

Transactions
├─ POST /transactions → Transaction Created (Pending)
├─ GET /transactions → User's Transactions
├─ PUT /transactions/:id → Status Updated (Completed/Cancelled)
└─ GET /transactions/stats → Dashboard Stats

Reviews
├─ POST /reviews → Review Created
├─ GET /reviews/seller/:id → Seller Reviews
└─ PUT /reviews/:id → Review Updated

Admin
├─ GET /admin/users → All Users
├─ PUT /admin/users/:id/verify → User Verified
├─ GET /admin/statistics → Platform Stats
└─ GET /admin/logs → Admin Actions Log
```

## User Roles & Permissions

### Student
- ✓ Add/Edit/Delete own books
- ✓ Buy books from others
- ✓ Donate books
- ✓ Leave reviews
- ✓ Manage profile
- ✗ Approve others
- ✗ Access admin panel

### Bookstore (Premium)
- ✓ All student permissions
- ✓ Premium seller badge
- ✓ Higher listing limits
- ✓ Store customization
- ✗ Admin access

### Admin
- ✓ Verify users
- ✓ Approve bookstores
- ✓ Remove inappropriate books
- ✓ Suspend users
- ✓ View platform statistics
- ✓ View admin logs
- ✓ Manage ads

## Security Implementation

### Password Security
```
User Input → Validation (8+ chars, mixed case, number, special)
          → Hashing (bcrypt, salt rounds: 10)
          → Database Storage
```

### Email Validation
```
User Input → Format Check (valid email)
          → Domain Check (.edu, .ac.uk, .ac.in)
          → Database Check (unique)
```

### JWT Token Flow
```
Login Success → Generate JWT
             → Token Expiry: 7 days
             → Stored in localStorage
             → Sent in Authorization header
             → Verified on protected routes
```

### Data Protection
- SQL Injection: Parameterized queries
- XSS: Input sanitization
- CSRF: CORS configuration
- File Upload: Type & size validation

## Scalability Considerations

### Current Capacity
- Single MySQL instance: ~100K concurrent users
- Connection pooling: 10 connections
- Frontend: Static build optimization

### Future Scaling
- Database replication for read operations
- Redis caching for books & reviews
- CDN for image delivery
- Load balancer for multiple backend instances
- Message queue for transactions

## Performance Optimization

### Database Optimization
- Indexes on frequently searched columns
- Foreign key constraints
- Query optimization with LIMIT/OFFSET

### Frontend Optimization
- Code splitting with React.lazy
- Image optimization
- Tailwind CSS purging
- Webpack optimization

### Backend Optimization
- Connection pooling
- Response caching headers
- Gzip compression
- Request validation (bail early)

## Deployment Architecture

### Production Stack
```
Domain (bookbridge.com)
    ↓
CloudFlare (CDN + SSL)
    ↓
Load Balancer (for multiple servers)
    ├─ Frontend Server (Vercel/Netlify)
    └─ Backend Servers (2-4 instances on AWS/Heroku)
    ↓
MySQL Database (AWS RDS)
    ↓
S3 (Image storage)
```

## Error Handling

### Backend Error Codes
- 400: Bad Request (validation failed)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permission)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate entry)
- 500: Server Error (internal issue)

### Frontend Error Handling
- Network errors → Retry or show offline message
- Auth errors → Redirect to login
- Validation errors → Show field errors
- Server errors → Generic error message + logs

## Monitoring & Logging

### Backend Logging
- Request/response logging
- Error stack traces
- Database query logs
- Admin action logs

### Frontend Monitoring
- Error boundary
- Console error logging
- Performance metrics
- User session tracking
