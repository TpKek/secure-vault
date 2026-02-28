# 🔐 Secrets Vault

A production-ready secure authentication application demonstrating enterprise-grade security practices and full-stack development skills.

---

## 🎯 Quick Navigation

| I want to... | Go to... |
|--------------|----------|
| Use the current Supabase version | [Getting Started](#-getting-started-supabase) |
| Understand the old JWT version | [Custom JWT Version](#-custom-jwt-version-legacy) |
| Learn about the migration | [Migration Journey](#-migration-journey) |
| Deploy to Vercel | [Deployment](#-deployment) |
| Learn key concepts | [Key Concepts](#-key-concepts-learned) |

---

## 📊 Two Versions Overview

This project has **three authentication versions**:

| Version | Status | Auth Method | Best For |
|---------|--------|-------------|----------|
| **Passport.js** | ❌ Removed | Sessions + bcrypt | Learning purposes |
| **Custom JWT** | 🔒 Legacy | Your own JWT + bcrypt | Learning JWT |
| **Supabase Auth** | ✅ Current | Managed by Supabase | Production apps |

---

## 🚀 Getting Started (Supabase)

### Prerequisites

- Node.js 18+
- Supabase account
- npm or yarn

### Installation

```bash
# Clone
git clone https://github.com/TpKek/secure-vault.git
cd secure-vault

# Install
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

> **No JWT_SECRET needed!** Supabase handles authentication.

### Run Locally

```bash
npm start
# Visit http://localhost:3000
```

---

## 🗄️ Database Setup (Supabase)

### Option 1: New Supabase Project

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Run this schema:

```sql
-- Drop old tables if upgrading
DROP TABLE IF EXISTS secrets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create secrets table with UUID
CREATE TABLE IF NOT EXISTS secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only see their own secrets"
  ON secrets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own secrets"
  ON secrets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secrets"
  ON secrets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secrets"
  ON secrets FOR DELETE USING (auth.uid() = user_id);
```

### Option 2: Vercel Integration (Recommended)

1. Supabase Dashboard → **Settings** → **Integrations** → **Vercel**
2. Click "Install Supabase"
3. Variables auto-added:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `POSTGRES_URL`

---

## 🔒 Custom JWT Version (Legacy)

This is the **original implementation** - great for learning JWT!

### Key Differences

| Feature | Custom JWT | Supabase Auth |
|---------|------------|---------------|
| **Code** | ~400 lines | ~100 lines |
| **Password hashing** | You do it (bcrypt) | Supabase handles |
| **JWT tokens** | You generate/verify | Automatic |
| **Session management** | Manual cookies | Built-in |
| **Security** | You implement | Battle-tested |

### How Custom JWT Worked

```
Registration:
  User → bcrypt(hash password) → Save to DB

Login:
  User + Password → bcrypt(compare) → Generate JWT → Cookie

Protected Route:
  Request + Cookie → Verify JWT → Get User ID → Allow/Deny
```

### Code Location

The JWT code is **commented out** in `app.js`:

```javascript
// JWT helper functions - COMMENTED OUT (legacy)
/*
function generateToken(user) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
*/
```

---

## 📈 Migration Journey

### Auth Methods Evolution

This project went through **3 authentication methods**:

```
Passport.js (sessions) → Custom JWT → Supabase Auth
```

| Version | Method | Status |
|---------|--------|--------|
| 1 | Passport.js + Sessions | ❌ Removed |
| 2 | Custom JWT + bcrypt | 🔒 Legacy |
| 3 | Supabase Auth | ✅ Current |

### Passport.js (Original - Removed)

The **first version** used Passport.js with local sessions:

```javascript
// OLD passport setup
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

passport.use(new LocalStrategy(async (email, password, done) => {
  // Find user and verify password
}));

app.use(passport.session());
```

**Why removed?**
- Sessions don't work well with serverless (Vercel)
- Each request might hit a different server
- No shared session storage

### Why Migrate?

1. **Less code to maintain** - Supabase handles auth
2. **Better security** - Built-in protection
3. **Easier deployment** - No JWT_SECRET needed
4. **RLS support** - Database-level security

### Problems We Solved

| Problem | Solution |
|---------|----------|
| Views folder not found on Vercel | Added explicit path: `path.join(process.cwd(), "views")` |
| Static files not loading | Added explicit path: `path.join(process.cwd(), "public")` |
| Environment variables not loading | Removed env mapping (Supabase integration auto-provides) |
| JWT_SECRET required | Removed check (Supabase handles auth) |
| Old database schema (integer user_id) | Migrated to UUID + RLS |

### Code Changes Summary

```javascript
// BEFORE (Custom JWT)
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

// AFTER (Supabase Auth)
import { createClient } from '@supabase/supabase-js';
// No JWT_SECRET needed!
```

---

## 🛠️ Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git add . && git commit -m "Ready to deploy" && git push

# Vercel automatically deploys!
```

### Troubleshooting

| Error | Fix |
|-------|-----|
| Views not found | Use `path.join(process.cwd(), "views")` |
| CSS not loading | Use `path.join(process.cwd(), "public")` |
| Invalid supabaseUrl | Check env vars are set in Vercel |
| Login loops back | Check email confirmed in Supabase |
| No secrets table | Run schema.sql in Supabase SQL Editor |

---

## 📚 Key Concepts Learned

### 🔑 JWT (JSON Web Tokens)

```
JWT = Header.Payload.Signature

Header:     {"alg": "HS256", "typ": "JWT"}
Payload:    {"id": 1, "email": "user@test.com"}
Signature:  HMACSHA256(header + payload, secret)
```

**Why JWT?**
- Stateless - no server memory needed
- Works across multiple servers
- Perfect for serverless (Vercel)

### 🔐 Bcrypt

- **Purpose:** Hash passwords (one-way encryption)
- **Salt rounds:** 10 (balance of security + speed)
- **Why?** If hackers get the database, they can't read passwords!

```javascript
// Hash
const hash = await bcrypt.hash(password, 10);

// Verify
const match = await bcrypt.compare(password, hash);
```

### 🛡️ Row Level Security (RLS)

Database-level security that filters data automatically:

```sql
-- Only show user's own rows
CREATE POLICY "my_policy" ON secrets
  FOR SELECT USING (auth.uid() = user_id);
```

### ☁️ Serverless (Vercel)

- Functions run on-demand
- No persistent server
- Must handle: file paths, environment variables
- Stateless = use JWT or sessions

### 🔗 Supabase Auth

Managed authentication that handles:
- User registration/login
- Password hashing
- JWT generation/refresh
- Email confirmation
- OAuth (Google, GitHub, etc.)

---

## 📁 Project Structure

```
secrets-vault/
├── public/css/
│   └── styles.css          # Styling
├── views/
│   ├── partials/
│   │   ├── header.ejs     # Nav + meta
│   │   └── footer.ejs     # Footer
│   ├── home.ejs            # Landing
│   ├── login.ejs           # Login
│   ├── register.ejs        # Register
│   ├── secrets.ejs         # Protected
│   └── submit.ejs          # Add secret
├── .env                    # Local vars
├── app.js                  # Main app
├── vercel.json             # Vercel config
├── schema.sql              # DB schema
└── package.json            # Dependencies
```

---

## 🔌 API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Home | ❌ |
| GET | `/login` | Login form | ❌ |
| GET | `/register` | Register form | ❌ |
| POST | `/login` | Login | ❌ |
| POST | `/register` | Register | ❌ |
| GET | `/secrets` | View secrets | ✅ |
| GET | `/submit` | Submit form | ✅ |
| POST | `/submit` | Save secret | ✅ |
| GET | `/logout` | Logout | ✅ |

---

## 🎓 Learning Outcomes

This project taught me:

1. **Authentication** - JWT, sessions, cookies, bcrypt
2. **Database Security** - RLS, parameterized queries
3. **Deployment** - Vercel, environment variables
4. **API Design** - REST routes, middleware
5. **Problem Solving** - Debugging deployment issues

---

## 👤 Author

**Bertin Dreyer**
- GitHub: [@TpKek](https://github.com/TpKek)
- LinkedIn: [Bertin Dreyer](https://linkedin.com/in/bertin-dreyer)

---

## 📜 License

ISC License

---

<div align="center">

### Built with Node.js, Express, Supabase & PostgreSQL

</div>
