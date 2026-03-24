# Database Connection Status

## ✅ Connection Status: **CONNECTED**

Last checked: Database connection test passed successfully.

### Connection Details:
- **Host**: localhost
- **Port**: 5432
- **Database**: amealio_db
- **Username**: postgres
- **PostgreSQL Version**: PostgreSQL 18.0

### How to Check Database Connection

#### Method 1: Run Test Script
```bash
cd backend
npm run test:db
```

This will:
- Test the database connection
- Display connection details
- Verify the database exists
- Show PostgreSQL version

#### Method 2: Check Application Logs
When you start the backend server, look for these log messages:
- `✅ Database connection established`
- `✅ Database connection verified`
- `📊 Connected to database: amealio_db`

If you see error messages instead, check the troubleshooting section below.

### Database Configuration

The database connection is configured in:
- **File**: `backend/src/app.module.ts`
- **Environment Variables**: `backend/.env`

Required environment variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=amealio_db
```

### Troubleshooting

#### Connection Refused (ECONNREFUSED)
- PostgreSQL server is not running
- Wrong host or port in .env file
- Firewall blocking the connection

**Solution**: 
1. Start PostgreSQL service
2. Check if PostgreSQL is running: `pg_isready` or check Windows Services
3. Verify host/port in .env file

#### Authentication Failed (28P01)
- Wrong username or password

**Solution**: 
1. Check DB_USERNAME and DB_PASSWORD in .env file
2. Verify PostgreSQL user credentials

#### Database Does Not Exist (3D000)
- Database `amealio_db` doesn't exist

**Solution**:
```sql
CREATE DATABASE amealio_db;
```

#### Connection Test Script
The test script is located at:
- `backend/src/scripts/test-db-connection.ts`

Run it with:
```bash
npm run test:db
```

### Database Service

The `DatabaseService` in `backend/src/common/database/database.service.ts`:
- Automatically initializes on application startup
- Provides connection status checking
- Handles connection errors with detailed logging
- Includes `isConnected()` method for health checks

### Next Steps

1. ✅ Database connection verified
2. Ensure all required tables are created (TypeORM will auto-sync in development)
3. Run migrations if needed: `npm run migration:run`
4. Seed initial data if needed: `npm run seed`

