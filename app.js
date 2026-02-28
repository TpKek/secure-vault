// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                        SECRETS APP - SUPABASE VERSION                             ║
// ║                   A Secure Vault for Storing Your Secrets                    ║
// ║                                                                                ║
// ║  WHAT THIS APP DOES:                                                          ║
// ║  • Users can register an account (email + password)                          ║
// ║  • Passwords are encrypted (hashed) so no one can read them                  ║
// ║  • Users can submit secrets (only they can see their own)                    ║
// ║  • Uses Supabase as the database                                              ║
// ║  • Uses JWT (JSON Web Tokens) for authentication                             ║
// ║                                                                                ║
// ║  HOW IT WORKS (SUPABASE VERSION):                                                  ║
// ║  1. User signs up → password gets hashed → saved to database                  ║
// ║  2. User logs in → password is checked against the hash                       ║
// ║  3. If correct → user gets a JWT token (like a golden ticket they carry)     ║
// ║  4. User can now access protected pages and submit secrets                    ║
// ║                                                                                ║
// ║  WHY SUPABASE AUTH?                                                 ║
// ║  • Sessions need server memory (doesn't work on serverless/Vercel)           ║
// ║  • JWT is stateless - server just verifies, no memory needed                 ║
// ║  • Perfect for Vercel deployment!                                             ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: IMPORTING ALL THE TOOLS WE NEED
// ═══════════════════════════════════════════════════════════════════════════════

"use strict";

// Express - the web framework (handles all incoming requests like a receptionist)
import express from 'express';

// Body parser - reads form data (what user typed in forms)
import bodyParser from 'body-parser';

// EJS - template engine (lets us mix HTML with JavaScript)
import ejs from 'ejs';

// Dotenv - loads secrets from .env file (keeps passwords out of code)
import dotenv from 'dotenv';

// Path - for resolving file paths
import path from 'path';

// Rate limiter - prevents spam attacks
import rateLimit from 'express-rate-limit';

// Supabase - cloud database and authentication
import { createClient } from '@supabase/supabase-js';


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: SETTING UP THE DATABASE (SUPABASE)
// ═══════════════════════════════════════════════════════════════════════════════

dotenv.config();

// Support both NEXT_PUBLIC_* (Vercel) and regular Supabase env vars
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials!");
  console.error("SUPABASE_URL:", supabaseUrl);
  console.error("SUPABASE_ANON_KEY:", supabaseKey ? "set" : "missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Supabase Auth - persist session in cookies
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    console.log('User signed in:', session?.user?.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: APP SETUP & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const app = express();
const port = process.env.PORT || 3000;


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: SECURITY CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

// Check if Supabase credentials exist
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials missing!");
  console.error("Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file");
  process.exit(1);
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: JWT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// JWT settings - controls how our tokens work
// Now handled by Supabase Auth - kept for reference
/*
const JWT_OPTIONS = {
  // The secret key used to sign tokens (like a wax seal - proves it's real!)
  secret: process.env.JWT_SECRET,

  // How long the token lasts (after this, user must log in again)
  expiresIn: '24h'
};
*/


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: JWT HELPER FUNCTIONS (COMMENTED OUT - NOW USING SUPABASE AUTH)
// ═══════════════════════════════════════════════════════════════════════════════

/*
// Supabase Auth handles token generation automatically!
// These functions are kept for reference but no longer used

/**
 * GENERATE TOKEN - Creates a new JWT token for a user
 *
 * Think of it like: printing a golden ticket for a theme park
 * The ticket has your name on it and a special seal only the park can make
 *
 * @param {Object} user - The user object (we only store id and email)
 * @returns {string} The signed JWT token
 *
function generateToken(user) {
  // We only put essential info in the token (never the password!)
  const payload = {
    id: user.id,
    email: user.email
  };

  // Sign it with our secret and set expiration
  return jwt.sign(payload, JWT_OPTIONS.secret, { expiresIn: JWT_OPTIONS.expiresIn });
}


/**
 * VERIFY TOKEN - Checks if a token is real and not expired
 *
 * Think of it like: checking if a theme park ticket is real
 * 1. Does it have our special seal? (signature check)
 * 2. Is it from today? (expiration check)
 *
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} The decoded payload if valid, null if invalid
 *
function verifyToken(token) {
  try {
    // jwt.verify checks the signature AND expiration
    return jwt.verify(token, JWT_OPTIONS.secret);
  } catch (err) {
    // Token is fake or expired - don't reveal details, just return null
    console.log("Token verification failed:", err.message);
    return null;
  }
}


/**
 * EXTRACT TOKEN - Gets the token from the request header
 *
 * The header looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
 * We extract just the token part after "Bearer "
 *
 * @param {Object} req - Express request object
 * @returns {string|null} The token or null if not found
 *
function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
*/


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════════════════════════════════

// Serve static files (CSS, images)
app.use(express.static(path.join(process.cwd(), "public")));

// Use EJS for templates
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON (for API requests)
app.use(express.json());


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: AUTHENTICATION MIDDLEWARE (NOW USING SUPABASE AUTH)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CHECK AUTHENTICATED - The gatekeeper for protected routes
 *
 * Now uses Supabase session instead of JWT tokens!
 * Supabase handles the session cookie automatically
 */
async function checkAuthenticated(req, res, next) {
  // Get the session from Supabase
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    console.log("No valid session");
    return res.redirect("/login");
  }

  // Add user info to request from Supabase session
  req.user = {
    id: session.user.id,
    email: session.user.email
  };

  console.log("User authenticated:", session.user.email);
  next();
}


/**
 * API VERSION - For AJAX/Fetch requests
 * Same as above but returns JSON instead of redirect
 */
async function checkAuthenticatedAPI(req, res, next) {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return res.status(401).json({ error: "No valid session" });
  }

  req.user = {
    id: session.user.id,
    email: session.user.email
  };

  next();
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

// General limiter - applies to most routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per 15 minutes
  message: "Too many requests! Please try again in 15 minutes",
});

// Strict limiter - for login/register (prevents hackers from guessing passwords)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                      // Only 5 tries!
  skipSuccessfulRequests: true,  // Don't count successful logins
  message: "Too many failed login attempts! Please try again in 15 minutes",
});

app.use(generalLimiter);
app.use("/login", loginLimiter);
app.use("/register", loginLimiter);


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: SECURITY CONFIG - BCRYPT
// ═══════════════════════════════════════════════════════════════════════════════

// Salt rounds - how many times we mix the password
// 10 is the sweet spot: secure but not too slow
const saltRounds = 10;


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: DATABASE HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Find user by their email
async function findUserByEmail(email) {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);

  if (error || !users || users.length === 0) {
    return null;
  }

  return users[0];
}

// Find user by their ID
async function findUserById(id) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return user;
}

// Verify password against the hash
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES - Anyone can visit these
// ═══════════════════════════════════════════════════════════════════════════════

// Home page - welcome screen
app.get("/", (req, res) => {
  res.render("home");
});

// Demo page - interactive showcase of features
app.get("/demo", (req, res) => {
  res.render("demo");
});

// Login page - form for existing users
app.get("/login", (req, res) => {
  res.render("login");
});

// Register page - form for new users
app.get("/register", (req, res) => {
  res.render("register");
});


// ═══════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES - Must be logged in (have valid token)
// ═══════════════════════════════════════════════════════════════════════════════

// Secrets page - shows user's secrets
// The "checkAuthenticated" middleware runs first
app.get("/secrets", checkAuthenticated, async (req, res) => {
  try {
    // Fetch ONLY this user's secrets from database
    const { data: secrets, error } = await supabase
      .from("secrets")
      .select("*")
      .eq("user_id", req.user.id)  // req.user.id comes from the token!
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Send to the page
    res.render("secrets", { secrets: secrets });
  } catch (error) {
    console.error("Error fetching secrets:", error);
    res.redirect("/");
  }
});

// Submit page - form to add new secret
app.get("/submit", checkAuthenticated, (req, res) => {
  res.render("submit");
});

// Logout - sign out from Supabase
app.get("/logout", async (req, res) => {
  await supabase.auth.signOut();
  res.redirect("/");
});


// ═══════════════════════════════════════════════════════════════════════════════
// POST ROUTES - Forms that send data
// ═══════════════════════════════════════════════════════════════════════════════

// Register - create new account using Supabase Auth
app.post("/register", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password?.trim();

  if (!username || !password) {
    return res.status(400).send("Please fill in all fields");
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!emailRegex.test(username)) {
    return res.status(400).send("Please enter a valid email address");
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).send("Password must be at least 8 characters long");
  }

  if (password.length > 20) {
    return res.status(400).send("Password must be no more than 20 characters long");
  }

  // Register with Supabase Auth
  try {
    const { data, error } = await supabase.auth.signUp({
      email: username,
      password: password
    });

    if (error) {
      console.error("Registration error:", error.message);
      return res.status(400).send("Error registering user: " + error.message);
    }

    console.log("User registered successfully!", username);
    res.redirect("/login");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Error registering user.");
  }
});


// LOGIN - Using Supabase Auth!
/**
 * LOGIN PROCESS - What happens when user clicks "Login":
 *
 * 1. User types email + password
 * 2. Supabase verifies the credentials
 * 3. If correct → Supabase creates a session (handles JWT automatically!)
 * 4. Session is stored in a secure cookie
 * 5. Browser automatically sends cookie with every future request
 *
 * Supabase handles all the JWT magic behind the scenes!
 */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password
    });

    if (error) {
      console.error("Login error:", error.message);
      return res.status(401).render("login", {
        error: error.message
      });
    }

    console.log("User logged in:", username);

    // Supabase handles session cookie automatically!
    // Redirect to protected page
    res.redirect("/secrets");

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("login", { error: "Server error during login" });
  }
});


// Submit - save a new secret
app.post("/submit", checkAuthenticated, async (req, res) => {
  const submittedSecret = req.body.secret;

  console.log("New secret submitted by user ID:", req.user.id);

  try {
    const { data, error } = await supabase
      .from("secrets")
      .insert([{ secret_text: submittedSecret, user_id: req.user.id }]);

    if (error) {
      console.error("Error saving secret:", error);
      return res.status(500).send("Error saving your secret");
    }

    res.redirect("/secrets");
  } catch (err) {
    console.error("Error saving secret:", err);
    res.status(500).send("Error saving your secret");
  }
});


// API route - for JavaScript to get current user info
app.get("/api/me", checkAuthenticatedAPI, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: START THE SERVER
// ═══════════════════════════════════════════════════════════════════════════════

app.listen(port, async () => {
  const { data, error } = await supabase.from("users").select("id").limit(1);

  if (error) {
    console.error("Failed to connect to Supabase!");
    console.error("Error:", error.message);
  } else {
    console.log("==================================================");
    console.log("SERVER STARTED SUCCESSFULLY!");
    console.log("==================================================");
    console.log("Running on: http://localhost:" + port);
    console.log("Connected to Supabase");
    console.log("Authentication: Supabase Auth (managed)");
    console.log("EJS Templates: Enabled");
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
//                       OLD SESSION CODE (KEPT FOR REFERENCE)
// ═══════════════════════════════════════════════════════════════════════════════

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                    FORMER SESSION-BASED AUTH CODE                             ║
║                    (Kept here for reference/learning)                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

SESSION VS JWT - THE KEY DIFFERENCE:
────────────────────────────────────

OLD WAY (Sessions) - Like a Coat Check:
• You hand your coat → they give you a numbered ticket
• When you leave, you show the ticket
• The attendant looks up #42 → "Oh, that's Bertin's coat!"
• PROBLEM: The attendant must remember everyone!

NEW WAY (JWT) - Like a Signed Letter:
• You get a letter with your name and a special seal
• You carry it with you
• When you enter, you show the letter
• They check: "Is the seal real? Is it not expired?"
• No need to remember you - the letter proves who you are!
• PRO: Works perfectly even without a persistent server


WHY THIS MATTERS FOR VERCEL:
────────────────────────────
• Vercel functions are "serverless" - they don't stay running
• Each request might hit a different server
• Old sessions won't work because Server A doesn't know about Server B's sessions
• JWT solves this - every request brings its own identity!

────────────────────────────────────────────────────────────────────────────────

// OLD IMPORTS (commented out):
// import session from 'express-session';
// import passport from 'passport';
// import { Strategy as LocalStrategy } from 'passport-local';

// OLD SESSION MIDDLEWARE (commented out):
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// OLD PASSPORT SETUP (commented out):
// app.use(passport.initialize());
// app.use(passport.session());

// OLD PASSPORT STRATEGY (commented out):
// passport.use(
//   new LocalStrategy(
//     async (email, password, done) => {
//       const user = await findUserByEmail(email);
//       if (!user) return done(null, false, { message: "No user found" });
//       const isValid = await verifyPassword(password, user.password);
//       if (!isValid) return done(null, false, { message: "Incorrect password" });
//       return done(null, user);
//     }
//   )
// );

// OLD SERIALIZE/DESERIALIZE (commented out):
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   const user = await findUserById(id);
//   done(null, user);
// });

// OLD CHECK AUTHENTICATED (commented out):
// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect("/login");
// }

// OLD LOGOUT (commented out):
// app.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) return next(err);
//     res.redirect("/");
//   });
// });

*/


// ═══════════════════════════════════════════════════════════════════════════════
//                              END OF APP.JS
// ═══════════════════════════════════════════════════════════════════════════════

/*
   LEARNING SUMMARY:

   1. EXPRESS - Web framework for handling routes and requests
   2. BCRYPT - Password security (NEVER store plain text passwords!)
   3. JWT (JSON Web Tokens) - Stateless authentication
      • Token contains user info + secret signature
      • Server doesn't need to remember anyone
      • Perfect for serverless/Vercel!
   4. SUPABASE - Cloud database (PostgreSQL)
   5. EJS - Template engine for dynamic HTML
   6. RATE LIMITING - Protecting against spam and brute force attacks
   7. ENVIRONMENT VARIABLES - Keeping secrets safe (never commit .env!)
   8. COOKIES - Storing tokens securely (httpOnly for security)

   SECURITY REMINDERS:
   • Always hash passwords (bcrypt)
   • Never commit secrets to GitHub (add .env to .gitignore!)
   • Use HTTPS in production
   • Validate all user input
   • Use rate limiting on auth routes
   • Store JWT in httpOnly cookies, not localStorage
   • Keep your JWT_SECRET really secret!
*/

