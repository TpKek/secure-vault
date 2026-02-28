# Secrets Vault

A production-ready secure authentication application demonstrating enterprise-grade security practices and full-stack development skills.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![EJS](https://img.shields.io/badge/EJS-%23B4CA65?style=flat&logoColor=white)](https://ejs.co)

---

## Overview

Secrets Vault is a secure authentication system that allows users to register, login, and store sensitive information securely. This project showcases critical security implementations including password hashing, Supabase Auth authentication, rate limiting, and input validation—essential skills for any full-stack developer.

### Key Features

- **Supabase Auth** — Managed authentication service with built-in security
- **Enterprise Security** — bcrypt hashing (optional), rate limiting, input validation
- **Cloud Database** — Supabase (PostgreSQL) with Row Level Security (RLS)
- **Modern Stack** — Express.js, EJS templating, Vercel-ready

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| Security | express-rate-limit |
| Templating | EJS |
| Deployment | Vercel |

---

## Authentication Options

This project supports **two authentication modes**:

### Option 1: Supabase Auth (Recommended - Current)

Uses Supabase's built-in authentication service which handles:
- User registration and login
- JWT token management
- Session persistence
- Password reset flows
- Email confirmation

**Benefits:**
- Less code to maintain
- Built-in security features
- Automatic JWT handling
- Works seamlessly with Supabase RLS

### Option 2: Custom JWT (Legacy)

The original implementation using custom JWT tokens with bcrypt password hashing. This code is commented out in `app.js` for reference.

---

## Security Features

### Password Security
- **Supabase Auth handles password hashing** — securely stored and managed by Supabase
- **Password validation** — length requirements and character validation

### Authentication (Supabase Auth)
- **Managed tokens** — Supabase handles JWT generation and verification
- **Secure session storage** — httpOnly cookies with automatic refresh
- **Built-in security** — brute force protection, email confirmation

### Rate Limiting
- **General API** — 100 requests per 15 minutes
- **Auth endpoints** — 5 failed attempts per 15 minutes (prevents brute force)

### Input Validation
- Email format validation using regex
- Password strength requirements (8-20 characters)
- SQL injection prevention via parameterized queries (Supabase handles this)

### Row Level Security (RLS)
- Database-level security policies
- Users can only access their own data
- Enforced at the database level

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Supabase account (recommended) or local PostgreSQL
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TpKek/secure-vault.git

# Navigate to project directory
cd secure-vault

# Install dependencies
npm install
```

---

## Database Setup

### Supabase (Recommended for Production)

1. Create a project at [supabase.com](https://supabase.com)
2. Navigate to the SQL editor in your Supabase dashboard
3. Copy and execute the contents of `schema.sql`
4. Copy your connection details from Supabase settings

### Database Schema

The schema uses Supabase's built-in authentication:

```sql
-- Create secrets table using UUID for user_id
CREATE TABLE IF NOT EXISTS secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own secrets
CREATE POLICY "Users can only see their own secrets"
  ON secrets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own secrets
CREATE POLICY "Users can insert their own secrets"
  ON secrets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own secrets
CREATE POLICY "Users can update their own secrets"
  ON secrets FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own secrets
CREATE POLICY "Users can delete their own secrets"
  ON secrets FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Environment Configuration

Create a `.env` file in the root directory:

### For Supabase:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
# Get these from your Supabase project:
# Project Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note:** When using Supabase Auth, you don't need JWT_SECRET - Supabase manages authentication automatically!

> **Note:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

---

## Running the Application

### Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Test the App

1. Open browser to `http://localhost:3000`
2. Click "Create Account" to register
3. Login with your credentials
4. Submit some secrets
5. Visit `/secrets` to see them

---

## Project Structure

```
secrets-vault/
├── public/
│   └── css/
│       └── styles.css          # Custom fintech-styled CSS
├── views/
│   ├── partials/
│   │   ├── header.ejs         # Navigation and meta tags
│   │   └── footer.ejs         # Footer content
│   ├── home.ejs               # Landing page
│   ├── login.ejs              # Login form
│   ├── register.ejs           # Registration form
│   ├── secrets.ejs            # Protected secrets page
│   └── submit.ejs             # Submit secret form
├── .env                       # Environment variables (not committed)
├── .gitignore                 # Git ignore patterns
├── app.js                     # Main application entry point
├── vercel.json                # Vercel deployment config
├── schema.sql                 # Database schema
└── package.json               # Dependencies and scripts
```

---

## API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Home page | No |
| GET | `/login` | Login form | No |
| GET | `/register` | Registration form | No |
| POST | `/register` | Create new user | No |
| POST | `/login` | Authenticate user | No |
| GET | `/secrets` | View your secrets | Yes (Supabase) |
| GET | `/submit` | Submit secret form | Yes (Supabase) |
| POST | `/submit` | Save a new secret | Yes (Supabase) |
| GET | `/logout` | End session | Yes (Supabase) |
| GET | `/api/me` | Get current user | Yes (Supabase) |

---

## Authentication Flow (Supabase Auth)

### Registration
1. User submits email/password
2. Supabase Auth creates the user account
3. Password is securely hashed by Supabase

### Login
1. User submits credentials
2. Supabase verifies the password
3. Supabase creates a session with JWT token
4. Session is managed via secure cookies

### Protected Routes
1. Request includes session cookie
2. Middleware verifies session with Supabase
3. User ID extracted from Supabase session
4. Access granted or denied

### How Supabase Auth Works (Under the Hood)

Supabase Auth uses JWT tokens internally:
- When a user signs in, Supabase generates a JWT
- The JWT contains the user's ID and metadata
- The JWT is stored in a secure, httpOnly cookie
- Each request, Supabase validates the JWT automatically
- You don't need to write any JWT code - Supabase handles it all!

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Connect Supabase integration (recommended):
   - Go to Supabase Dashboard → your project → Settings → Integrations → Vercel
   - Click "Install Supabase" and follow the prompts
4. The following environment variables will be auto-added:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `POSTGRES_URL` and other database variables
5. Deploy automatically on push

The `vercel.json` file handles routing for the Express application.

### Important: Database Migration

If upgrading from the old JWT version, you'll need to update your database schema:

```sql
-- Run this in Supabase SQL Editor to migrate:
DROP TABLE IF EXISTS secrets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run the new schema from schema.sql
```

---

## Learning Outcomes

This project demonstrates understanding of:

- Secure authentication with managed services
- Supabase Auth integration patterns
- JWT token management (handled by Supabase)
- Row Level Security (RLS) in PostgreSQL
- SQL injection prevention
- Rate limiting for brute-force protection
- Input validation and sanitization
- Environment variable management
- PostgreSQL database design
- Serverless deployment patterns
- Defense in depth security principles

---

## Key Concepts Learned

### Supabase Auth

Supabase Auth is a complete authentication service that handles:
- User registration and login
- Password hashing and security
- JWT token generation and refresh
- Session management
- OAuth providers (Google, GitHub, etc.)
- Email confirmation and password reset

### Why Supabase Auth?

- **Less code** — Don't write authentication from scratch
- **More secure** — Battle-tested by millions of developers
- **Integrated** — Works seamlessly with Supabase database
- **RLS Support** — Database policies based on authenticated users

### Custom JWT vs Supabase Auth

| Feature | Custom JWT | Supabase Auth |
|---------|------------|---------------|
| Code needed | More | Less |
| Security | You implement it | Built-in |
| Password handling | bcrypt | Managed |
| Token refresh | Manual | Automatic |
| RLS integration | Manual | Built-in |
| Maintenance | You | Supabase |

---

## Author

**Bertin Dreyer**
- GitHub: [@TpKek](https://github.com/TpKek)
- LinkedIn: [Bertin Dreyer](https://linkedin.com/in/bertin-dreyer)

---

## License

ISC License — See LICENSE file for details

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  Built with Node.js, Express, Supabase, and PostgreSQL
</div>
