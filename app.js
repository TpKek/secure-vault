//jshint esversion:6

import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.get('/secrets', function (req, res) {
  res.render('secrets');
});

app.post('/register', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2)',
    [username, password],
    function (err, result) {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
      } else {
        console.log('User registered successfully');
        res.status(200).redirect('/login');
      }
    }
  );
});

app.post('/login', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  pool.query(
    'SELECT * FROM users WHERE email = $1 AND password = $2',
    [username, password],
    function (err, result) {
      if (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
      } else if (result.rows.length === 0) {
        res.status(401).send('Invalid username or password');
      } else {
        console.log('User logged in successfully');
        res.status(200).redirect('/secrets');
      }
    }
  );
});

app.listen(port, async function () {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`Server started on port ${port}`);
    console.log('Database connected:', result.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
});
