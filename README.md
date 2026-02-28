# Secrets Vault

A production-ready secure authentication application demonstrating enterprise-grade security practices and full-stack development skills.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/JWT-✓-CB171E?style=flat&logo=JSON%20Web%20Tokens&logoColor=white)](https://jwt.io)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![EJS](https://img.shields.io/badge/EJS-%23B4CA65?style=flat&logoColor=white)](https://ejs.co)

---

## Overview

Secrets Vault is a secure authentication system that allows users to register, login, and store sensitive information securely. This project showcases critical security implementations including password hashing, JWT-based authentication, rate limiting, and input validation—essential skills for any full-stack developer.

### Key Features

- **JWT Authentication** — Stateless token-based auth perfect for serverless deployment
- **Enterprise Security** — bcrypt hashing, rate limiting, input validation
- **Cloud Database** — Supabase (PostgreSQL) or local PostgreSQL
- **Modern Stack** — Express.js, EJS templating, Vercel-ready

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | PostgreSQL (Supabase or local) |
| Authentication | JWT (jsonwebtoken) |
| Security | bcrypt, express-rate-limit |
| Templating | EJS |
| Deployment | Vercel |

---

## Security Features

### Password Security
- **bcrypt hashing** with 10 salt rounds for irreversible password storage
- **Automatic salting** — identical passwords produce unique hashes
- **Password validation** — length requirements and character validation

### Authentication (JWT)
- **Stateless tokens** — no server-side session storage required
- **Secure cookie storage** — httpOnly, secure, sameSite flags
- **Token expiration** — 24-hour token lifetime

### Rate Limiting
- **General API** — 100 requests per 15 minutes
- **Auth endpoints** — 5 failed attempts per 15 minutes (prevents brute force)

### Input Validation
- Email format validation using regex
- Password strength requirements (8-20 characters)
- SQL injection prevention via parameterized queries

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL (local or Supabase)
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

### Option 1: Local PostgreSQL (Recommended for Development)

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Start the PostgreSQL service
3. Create a database:

```bash
psql -U postgres
CREATE DATABASE secrets;
\q
```

4. Create a `.env` file (see below)
5. Run the server - tables will be created automatically

### Option 2: Supabase (Recommended for Production)

1. Create a project at [supabase.com](https://supabase.com)
2. Navigate to the SQL editor in your Supabase dashboard
3. Copy and execute the contents of `schema.sql`
4. Copy your connection details from Supabase settings

---

## Environment Configuration

Create a `.env` file in the root directory:

### For Local PostgreSQL:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Local PostgreSQL)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=secrets
DB_PASSWORD=your_password
DB_PORT=5432

# JWT Security
# Generate a secure random string:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secure-jwt-secret-min-32-characters
```

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

# JWT Security
JWT_SECRET=your-secure-jwt-secret-min-32-characters
```

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
| GET | `/secrets` | View your secrets | Yes (JWT) |
| GET | `/submit` | Submit secret form | Yes (JWT) |
| POST | `/submit` | Save a new secret | Yes (JWT) |
| GET | `/logout` | End session | Yes (JWT) |
| GET | `/api/me` | Get current user | Yes (JWT) |

---

## Authentication Flow (JWT)

### Registration
1. User submits email/password
2. Password hashed with bcrypt (10 rounds)
3. User stored in PostgreSQL

### Login
1. User submits credentials
2. Password verified against stored hash
3. JWT token generated with user ID and email
4. Token sent to browser via httpOnly cookie

### Protected Routes
1. Request includes JWT cookie
2. Middleware verifies token signature and expiration
3. User ID extracted from token payload
4. Access granted or denied

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   - `JWT_SECRET`
   - `SUPABASE_URL` (for Supabase)
   - `SUPABASE_ANON_KEY` (for Supabase)
   - Or local DB variables for local PostgreSQL
4. Deploy automatically on push

The `vercel.json` file handles routing for the Express application.

---

## Learning Outcomes

This project demonstrates understanding of:

- Secure password storage with hashing algorithms
- JWT-based authentication patterns
- Token verification and middleware
- SQL injection prevention
- Rate limiting for brute-force protection
- Input validation and sanitization
- Environment variable management
- PostgreSQL database design
- Serverless deployment patterns
- Defense in depth security principles

---

## Key Concepts Learned

### JWT (JSON Web Tokens)
JWT is a compact, URL-safe token format that securely transmits information between parties as a JSON object. Unlike sessions, JWTs are stateless—the server doesn't need to store user data.

### Why JWT for Serverless?
- No persistent server memory required
- Each request carries its own authentication
- Works across multiple server instances
- Perfect for Vercel's serverless functions

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
  Built with Node.js, Express, and PostgreSQL
</div>
