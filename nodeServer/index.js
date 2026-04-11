const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// MySQL DB connection

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'sampledb'
});


db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files (css, js, images, index.html) from project root
app.use(express.static(path.join(__dirname, '..')));

// Handle GET / — serve index.html manually (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});


// Form submission handler
app.post('/submit', (req, res) => {
  const { name, mobile, email } = req.body;
  const sql = 'INSERT INTO nodeuser (name, mobile, email) VALUES (?, ?, ?)';
  db.query(sql, [name, mobile, email], (err, result) => {
    if (err) throw err;
    console.log('User inserted:', result.insertId);
    res.send('<h2 style="text-align:center;">Thanks for submitting!</h2>');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
