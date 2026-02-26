//jshint esversion:6

import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import dotenv from 'dotenv';
import { pool, query } from './db.js';

dotenv.config();

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
