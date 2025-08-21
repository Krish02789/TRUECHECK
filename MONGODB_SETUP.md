# MongoDB Setup Guide

## Overview
This project now includes MongoDB integration for persistent data storage. The setup includes user management and verification tracking.

## Prerequisites

### 1. Install MongoDB
- **Windows**: Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

### 2. Install MongoDB Compass (Optional but Recommended)
- Download from [MongoDB Compass](https://www.mongodb.com/try/download/compass)
- Provides a GUI for database management

## Configuration

### Environment Variables
The `.env` file contains MongoDB configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/portfolio_db
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
```

### Local MongoDB Setup
1. Start MongoDB service:
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # macOS/Linux
   brew services start mongodb-community
   ```

2. Create database:
   ```bash
   mongosh
   use portfolio_db
   ```

## Project Structure

```
admin-login/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   ├── User.js             # User model schema
│   └── Verification.js     # Verification model schema
├── routes/
│   └── users.js            # User API routes
├── utils/
│   └── dbUtils.js          # Database utility functions
├── server.js               # Main Express server
└── test-db.js              # Database connection test
```

## Database Models

### User Model
- **Fields**: name, email, phone, aadhaar, role, isVerified, verificationData
- **Indexes**: email, aadhaar, role
- **Validation**: Aadhaar must be 12 digits

### Verification Model
- **Fields**: txnId, type, target, otp, isUsed, isVerified, expiresAt, attempts
- **Indexes**: txnId, target, expiresAt, userId
- **Methods**: isExpired(), hasMaxAttempts(), incrementAttempts()

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/role/:role` - Get users by role

### Health Check
- `GET /api/health` - Server and database health status

## Testing

### Test Database Connection
```bash
npm run test:db
```

### Start Development Server
```bash
# Start only the backend server
npm run dev:server

# Start both frontend and backend
npm run dev:all
```

## Usage Examples

### Creating a User
```javascript
const userData = {
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  aadhaar: "123456789012",
  role: "candidate"
};

const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});
```

### Verifying Aadhaar
```javascript
const verificationData = {
  txnId: "TXN-123456",
  type: "aadhaar",
  target: "123456789012",
  otp: "123456",
  expiresAt: new Date(Date.now() + 5 * 60 * 1000)
};
```

## MongoDB Atlas (Cloud Database)

### Setup MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI_PROD` in `.env`

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/portfolio_db?retryWrites=true&w=majority
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MongoDB service is running
   - Check if port 27017 is available

2. **Authentication Failed**
   - Verify username/password in connection string
   - Check IP whitelist in MongoDB Atlas

3. **Database Not Found**
   - MongoDB creates databases automatically
   - Check connection string database name

### Debug Commands
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# List databases
mongosh --eval "show dbs"

# Check collections
mongosh portfolio_db --eval "show collections"
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Connection String**: Use strong passwords
3. **Network Access**: Restrict IP access in production
4. **Data Validation**: Always validate input data
5. **Indexes**: Create appropriate indexes for performance

## Performance Optimization

1. **Indexes**: Created on frequently queried fields
2. **Connection Pooling**: Configured in database.js
3. **Data Cleanup**: Automatic cleanup of expired verifications
4. **Query Optimization**: Use projection to limit returned fields

## Next Steps

1. Add authentication middleware
2. Implement user sessions
3. Add data encryption
4. Set up database backups
5. Add monitoring and logging
