# TicketFlow - Backend

Express + MongoDB backend for TicketFlow ticket management system.

## Quick Start

1. Install dependencies:

```bash
cd ticketflow-backend
npm install
```

2. Create `.env` file and configure:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ticketflow
JWT_SECRET=your-secret-key-change-in-production
ADMIN_SECRET_KEY=your-admin-secret-key
FRONTEND_URL=http://localhost:8080
```

3. Start server:

```bash
npm run dev
```

## Authentication & Authorization

### User Registration

**Regular Registration** - Always creates `client` role:
- `POST /api/auth/register`
- Body: `{ name, email, password }`
- ⚠️ **Security**: Role parameter is ignored - all regular registrations create `client` accounts

**Admin Registration** - Requires `ADMIN_SECRET_KEY`:
- `POST /api/auth/register-admin`
- Body: `{ name, email, password, adminSecret }`
- Requires `ADMIN_SECRET_KEY` environment variable to be set
- Only users with the correct secret key can create admin accounts

### Example: Creating an Admin Account

Using curl:
```bash
curl -X POST http://localhost:5001/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "securepassword123",
    "adminSecret": "your-admin-secret-key"
  }'
```

Or using the helper script:
```bash
npm run create-admin "Admin Name" "admin@example.com" "securepassword"
```

Or using the seed script (for development):
```bash
npm run seed
# Creates admin@example.com with password: adminpass
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new client user
- `POST /api/auth/register-admin` - Register new admin (requires secret key)
- `POST /api/auth/login` - Login user

### Client Routes (requires `client` role)
- `GET /api/client/tickets` - Get client's tickets
- `POST /api/client/tickets` - Create new ticket
- `PUT /api/client/tickets/:id/reply` - Reply to ticket

### Admin Routes (requires `admin` role)
- `GET /api/admin/tickets` - Get all tickets
- `PUT /api/admin/tickets/:id/assign` - Assign ticket (supports status/priority updates)
- `PUT /api/admin/tickets/:id/reply` - Reply to ticket as admin
- `GET /api/admin/analytics` - Get analytics data

### Ticket Routes (general)
- `POST /api/tickets` - Create ticket (requires auth)
- `GET /api/tickets/:id` - Get ticket by ID (creator or admin)
- `GET /api/tickets/user/:userId` - Get user's tickets

### AI Routes
- `POST /api/ai/suggest-response` - Get AI-suggested response

## Security Features

1. **Role-Based Access Control (RBAC)**: Routes protected by role middleware
2. **JWT Authentication**: Tokens contain user ID and role
3. **Secure Admin Creation**: Requires `ADMIN_SECRET_KEY` environment variable
4. **Password Hashing**: Uses bcryptjs with salt rounds
5. **CORS Protection**: Configured for specific frontend origin
