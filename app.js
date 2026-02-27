//jshint esversion:6

// Express - the web framework that handles routes and requests
import express from 'express';

// Body parser - lets us read form data (username, password) from the request
import bodyParser from 'body-parser';

// EJS - template engine to render HTML pages
import ejs from 'ejs';

// Dotenv - loads secrets from .env file (keeps passwords out of code)
import dotenv from 'dotenv';

// PG - PostgreSQL library to talk to our database
import pg from 'pg';

import rateLimit from 'express-rate-limit';

// Bcrypt - THE MOST IMPORTANT PART!
// This turns passwords into unreadable scrambled text
// We do this so even if hackers steal our database, they can't read anyone's passwords
// Think of it like: "password123" → "Xy9#bL$2kM..."
import bcrypt from 'bcrypt';

import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// Load environment variables from .env file
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION - How we connect to PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════

const { Pool } = pg;

// Create a connection pool to the database
// This is like opening multiple phone lines so many people can call at once
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ═══════════════════════════════════════════════════════════════════════════
// APP SETUP - Configure Express
// ═══════════════════════════════════════════════════════════════════════════

const app = express();
const port = 3000;

// SESSION & PASSPORT SETUP - Must come AFTER app is created!
if(!process.env.SESSION_SECRET) {
  console.error('✗ SESSION_SECRET is not set in .env file');
  process.exit(1);
}

//check rest of environment variables
if(!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD || !process.env.DB_PORT) {
  console.error('Env variables not set right or are missing');
  process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// PASSPORT LOCAL STRATEGY - Tells Passport how to verify passwords
// This is like having a security guard check IDs at the door
passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      // Step 1: Find user in database by email
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [
        email,
      ]);

      // Step 2: No user found?
      if (result.rows.length === 0) {
        return done(null, false, { message: 'No user found with that email' });
      }

      // Step 3: Check the password!
      // We use bcrypt.compare to see if the typed password matches
      const match = await bcrypt.compare(password, result.rows[0].password);

      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }

      // Step 4: Success! Return the user
      return done(null, result.rows[0]);
    } catch (err) {
      return done(err);
    }
  })
);

// SERIALIZE - Save user's ID to the session cookie
// This is like giving them a VIP wristband when they enter
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// DESERIALIZE - Look up user by ID from the session cookie
// This is like scanning their VIP wristband to who they are
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Serve static files (CSS, images) from the public folder
app.use(express.static('public'));

// Use EJS as our template engine - lets us embed JS in HTML
app.set('view engine', 'ejs');

// Parse form data - WITHOUT this, req.body.username would be undefined!
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limit

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});

// Strict limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per window
  skipSuccessfulRequests: true, // only count failed attempts
  message: 'Too many login attempts, please try again later',
});

// Apply limiters
app.use(generalLimiter);
app.use('/login', loginLimiter);
app.use('/register', loginLimiter);


// ═══════════════════════════════════════════════════════════════════════════
// SECURITY SETUP - Bcrypt configuration
// ═══════════════════════════════════════════════════════════════════════════

// saltRounds = how many times we "cook" the password hash
// More rounds = more secure but slower
// 10 is the standard - good balance for most apps
//
// Analogy: Making hash is like cooking soup
// 1 round = just mix ingredients together (weak)
// 10 rounds = simmer for hours (very secure)
// 20 rounds = simmer for days (overkill, too slow)
const saltRounds = 10;

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES - The different pages visitors can access
// ═══════════════════════════════════════════════════════════════════════════

// HOME PAGE - The main landing page
app.get('/', function (req, res) {
  res.render('home');
});

// LOGIN PAGE - Form where users enter credentials
app.get('/login', function (req, res) {
  res.render('login');
});

// REGISTER PAGE - Form where new users sign up
app.get('/register', function (req, res) {
  res.render('register');
});

// Middleware to check if user is logged in
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// SECRETS PAGE - Only for logged-in users (protected)
app.get('/secrets', checkAuthenticated, function (req, res) {
  res.render('secrets');
});

app.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION - Creating a new account
// ═══════════════════════════════════════════════════════════════════════════

/*
   WHAT HAPPENS WHEN SOMEONE REGISTERS:

   1. User fills out form with email + password
   2. We grab those values from the form
   3. We "hash" (scramble) the password using bcrypt
   4. We save the email + SCRAMBLED password to database
   5. Send them to login page

   WHY WE DO THIS:
   We NEVER store the real password! If a hacker steals our database,
   all they see is gibberish like "$2b$10$Xy9..."
   They can't "un-scramble" it - it's mathematically impossible!
*/

app.post('/register', async function (req, res) {
  // Step 1.0: Get what they typed in the form
  const username = req.body.username?.trim();
  const password = req.body.password?.trim();

  // Step 1.1 Check duplicate email
  const emailExists = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [username]
  );
  if (emailExists.rows.length > 0) {
    return res.status(400).send('Email already exists');
  }

  // Password Strength Check
  if (password.length < 8) {
    return res.status(400).send('Password must be at least 8 characters long');
  }

  if (password.length > 20) {
    return res.status(400).send('Password must be at most 20 characters long');
  }

  if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
    return res
      .status(400)
      .send('Password must only contain letters and numbers');
  }

  // Email Regex Check
  if (
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      username
    )
  ) {
    return res.status(400).send('Invalid email format');
  }

  if (!username || !password) {
    return res.status(400).send('Missing username or password');
  }

  // Step 2: Hash the password!
  // bcrypt.hash takes the plain password and scrambles it asynchronously
  // Example: "mypassword123" → "$2b$10$vI8aWB3W3gBtXcM6..."
  //
  // The 2nd parameter (saltRounds=10) is how many times we re-scramble
  // This makes it MUCH harder for hackers to crack
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Step 3: Try to save to database
  try {
    // Run the INSERT query - save email + HASHED password
    // We DO NOT save the real password!
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [
      username,
      hashedPassword,
    ]);

    // Success! Let them know and send to login
    console.log('✓ User registered successfully');
    res.redirect('/login');
  } catch (err) {
    // Something went wrong (maybe user already exists?)
    console.error('✗ Error registering user:', err.message);
    res
      .status(500)
      .send('Error registering user - maybe that email already exists?');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN - Signing into an existing account
// Now handled by Passport! No more manual bcrypt logic needed
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/secrets',
    failureRedirect: '/login',
  })
);

/*
// ═══════════════════════════════════════════════════════════════════════════
// ORIGINAL LOGIN CODE (before Passport) - kept for reference
// ═══════════════════════════════════════════════════════════════════════════

// WHAT HAPPENS WHEN SOMEONE LOGS IN:
// 1. User types email + password
// 2. We look up the user by email in database
// 3. We take the password they typed and HASH it
// 4. We compare the NEW hash with the STORED hash
// 5. If they match → they get in!
// 6. If they don't match → access denied

app.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      username,
    ]);

    if (result.rows.length === 0) {
      console.log('✗ Login failed: no user found');
      return res.status(401).send('Invalid username or password');
    }

    const storedPassword = result.rows[0].password;
    const match = await bcrypt.compare(password, storedPassword);

    if (!match) {
      console.log('✗ Login failed: wrong password');
      return res.status(401).send('Invalid username or password');
    }

    console.log('✓ User logged in successfully');
    res.redirect('/secrets');
  } catch (err) {
    console.error('✗ Error logging in:', err.message);
    res.status(500).send('Error logging in');
  }
});

*/

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER - Fire up the app!
// ═══════════════════════════════════════════════════════════════════════════

app.listen(port, async function () {
  try {
    // Test the database connection
    const result = await pool.query('SELECT NOW()');
    console.log(`✓ Server started on port ${port}`);
    console.log('✓ Database connected:', result.rows[0]);
  } catch (err) {
    console.error('✗ Database connection error:', err.message);
  }
});
