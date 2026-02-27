# 🔐 Secrets Vault

A production-ready secure authentication application demonstrating enterprise-grade security practices, full-stack development skills, and modern web development patterns.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.x-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)

## 📋 Overview

**Secrets Vault** is a secure authentication system that allows users to register, login, and store sensitive information securely. This project showcases critical security implementations including password hashing, session management, rate limiting, and SQL injection prevention—essential skills for any full-stack developer working with sensitive user data.

### Key Highlights

- 🔒 **Enterprise-Grade Authentication** - Passport.js with LocalStrategy for secure login
- 🛡️ **Defense in Depth** - Multiple security layers including bcrypt hashing, rate limiting, and input validation
- 📊 **Production Database** - PostgreSQL (Supabase) with connection pooling
- ⚡ **Modern Stack** - Express.js, EJS templating, session-based authentication

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Passport.js + express-session |
| **Security** | bcrypt, express-rate-limit |
| **Templating** | EJS |
| **Deployment** | Vercel |

---

## 🔐 Security Features

This project demonstrates critical security best practices:

### Password Security
- **bcrypt hashing** with 10 salt rounds for irreversible password storage
- **Automatic salting** - identical passwords produce unique hashes
- **Password validation** - length requirements and character validation

### Authentication & Sessions
- **Passport.js LocalStrategy** - industry-standard authentication
- **Secure session management** with express-session
- **Session serialization/deserialization** for persistent login

### Rate Limiting & Protection
- **General API rate limiting** - 100 requests per 15 minutes
- **Strict login protection** - 5 failed attempts per 15 minutes
- **Input validation** - email format and password strength requirements

### Database Security
- **Parameterized queries** - prevents SQL injection attacks
- **Connection pooling** - efficient database resource management

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (local or Supabase)
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

### Database Setup

1. Create a PostgreSQL database named `secrets`
2. Run the schema.sql file to create tables:

```bash
psql -U your_user -d secrets -f schema.sql
```

Or use Supabase:
1. Create a Supabase project
2. Run the SQL from schema.sql in the Supabase SQL editor

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration (Supabase or local PostgreSQL)
DB_USER=your_database_user
DB_HOST=your_database_host
DB_NAME=secrets
DB_PASSWORD=your_database_password
DB_PORT=5432

# Session Security
SESSION_SECRET=your_secure_random_string_min_32_chars
```

### Start the Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
secure-vault/
├── public/
│   └── css/
│       └── styles.css          # Custom styles
├── views/
│   ├── partials/
│   │   ├── header.ejs          # Navigation and meta tags
│   │   └── footer.ejs          # Footer content
│   ├── home.ejs                # Landing page
│   ├── login.ejs              # Login form
│   ├── register.ejs           # Registration form
│   ├── secrets.ejs            # Protected secrets page
│   └── submit.ejs             # Submit secret form
├── .env                       # Environment variables (not committed)
├── .gitignore                 # Git ignore patterns
├── app.js                     # Main application entry point
├── schema.sql                 # Database schema
└── package.json               # Dependencies and scripts
```

---

## 🔧 API Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/` | Home page | No |
| GET | `/login` | Login form | No |
| GET | `/register` | Registration form | No |
| POST | `/register` | Create new user | No |
| POST | `/login` | Authenticate user | No |
| GET | `/secrets` | View secrets | Yes |
| GET | `/logout` | End session | Yes |

---

## 📝 Key Implementation Details

### Authentication Flow

1. **Registration**: User submits email/password → Password hashed with bcrypt (10 rounds) → User stored in PostgreSQL
2. **Login**: User submits credentials → Passport.js verifies against stored hash → Session created
3. **Protected Routes**: Middleware checks `req.isAuthenticated()` → Grants or denies access

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Store bcrypt hash, NOT plaintext
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secrets table
CREATE TABLE secrets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  secret_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
   - `SESSION_SECRET`
3. Deploy automatically on push to main branch

---

## 📚 Learning Outcomes

This project demonstrates understanding of:

- ✅ Secure password storage with hashing algorithms
- ✅ Session-based authentication patterns
- ✅ SQL injection prevention with parameterized queries
- ✅ Rate limiting for brute-force protection
- ✅ Input validation and sanitization
- ✅ Environment variable management
- ✅ PostgreSQL database design
- ✅ RESTful API structure
- ✅ Template rendering with EJS

---

## 👤 Author

**Bertin Dreyer**
- GitHub: [@TpKek](https://github.com/TpKek)

---

## 📄 License

ISC License - See LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
