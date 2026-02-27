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

// Bcrypt - THE MOST IMPORTANT PART!
// This turns passwords into unreadable scrambled text
// We do this so even if hackers steal our database, they can't read anyone's passwords
// Think of it like: "password123" → "Xy9#bL$2kM..."
import bcrypt from 'bcrypt';

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

// Serve static files (CSS, images) from the public folder
app.use(express.static('public'));

// Use EJS as our template engine - lets us embed JS in HTML
app.set('view engine', 'ejs');

// Parse form data - WITHOUT this, req.body.username would be undefined!
app.use(bodyParser.urlencoded({ extended: true }));

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

// SECRETS PAGE - Only for logged-in users (protected)
app.get('/secrets', function (req, res) {
  res.render('secrets');
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
  // Step 1: Get what they typed in the form
  const username = req.body.username;
  const password = req.body.password;

  // Step 2: Hash the password!
  // bcrypt.hashSync takes the plain password and scrambles it
  // Example: "mypassword123" → "$2b$10$vI8aWB3W3gBtXcM6..."
  //
  // The 2nd parameter (saltRounds=10) is how many times we re-scramble
  // This makes it MUCH harder for hackers to crack
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

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
// ═══════════════════════════════════════════════════════════════════════════

/*
   WHAT HAPPENS WHEN SOMEONE LOGS IN:

   1. User types email + password
   2. We look up the user by email in database
   3. We take the password they typed and HASH it
   4. We compare the NEW hash with the STORED hash
   5. If they match → they get in!
   6. If they don't match → access denied

   WHY THIS WORKS:
   The password "mypassword123" ALWAYS hashes to the same thing
   So we can hash what they type now and compare it to what we stored!
*/

app.post('/login', async function (req, res) {
  // Step 1: Get what they typed
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Step 2: Find user in database by email
    // We only query by email - password checking happens in JavaScript
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      username,
    ]);

    // Step 3: Did we find anyone with that email?
    if (result.rows.length === 0) {
      // No user with that email
      console.log('✗ Login failed: no user found');
      return res.status(401).send('Invalid username or password');
    }

    // Step 4: Get the stored (hashed) password from database
    const storedPassword = result.rows[0].password;

    // Step 5: Hash what they just typed
    // We can't "un-hash" the stored password, so we hash what they typed
    // and see if the two hashes match!
    const match = bcrypt.compareSync(password, storedPassword);

    // Step 6: Did the hashes match?
    if (!match) {
      // Wrong password (but we don't say which one - security!)
      console.log('✗ Login failed: wrong password');
      return res.status(401).send('Invalid username or password');
    }

    // Step 7: Success! They're who they say they are
    console.log('✓ User logged in successfully');
    res.redirect('/secrets');
  } catch (err) {
    // Database error
    console.error('✗ Error logging in:', err.message);
    res.status(500).send('Error logging in');
  }
});

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
