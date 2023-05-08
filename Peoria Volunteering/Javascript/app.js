const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql');

const app = express();

// Configure MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 's_venson',
  password: 'Adyt8die',
  database: 'emails'
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database!');
  }
});

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

// Set up EJS template engine
app.set('view engine', 'ejs');

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Display email form
app.get('/', (req, res) => {
  res.render('index');
});

// Insert email into database
app.post('/send', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const subject = req.body.subject;
  const body = req.body.body;

  const sql = 'INSERT INTO emails (name, email, subject, body) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, email, subject, body], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error adding email to database');
    } else {
      console.log(result);
      res.redirect('/thanks');
    }
  });

  // Configure Nodemailer email options
  const mailOptions = {
    from: email,
    to: 'mvenson@mail.bradley.edu',
    subject: subject,
    text: 'From: ' + name + '\n' + body
  };

  // Send email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
});

// Display thank you page
app.get('/thanks', (req, res) => {
  res.render('thanks');
});

// Display all emails in database
app.get('/list', (req, res) => {
  const sql = 'SELECT * FROM emails';
  connection.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving emails from database');
    } else {
      console.log(result);
      res.render('list', { emails: result });
    }
  });
});

// Search for email in database
app.get('/search', (req, res) => {
  const email = req.query.email;

  const sql = 'SELECT * FROM emails WHERE email=?';
  connection.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error searching for email in database');
    } else if (result.length === 0) {
      res.status(404).send('Email not found in database');
    } else {
      console.log(result);
      res.render('list', { emails: result });
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
