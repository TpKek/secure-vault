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

app.listen(port, async function () {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`Server started on port ${port}`);
    console.log('Database connected:', result.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
});
