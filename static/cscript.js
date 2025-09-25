const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'ptjportal',
  password: 'password',
  port: 5432,
});

client.connect();

// Define a route to render the contact form
app.get('/contact', (req, res) => {
  res.render('contact'); // Replace with the actual name of your Pug template
});

// Define a route to handle form submission
app.post('/contact', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  // Insert the data into the "contact" table
  const query = 'INSERT INTO contact_info (name, email, message) VALUES ($1, $2, $3)';
  const values = [name, email, message];

  client.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('An error occurred while inserting data.');
    } else {
      res.redirect('/success'); // Redirect to a success page
    }
  });
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
