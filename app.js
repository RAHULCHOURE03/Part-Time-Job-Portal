const express = require("express");
const session = require('express-session');
const path = require("path");
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

const app = express();
const port = 8000;

const { Client } = require('pg');
const Job = require('./static/jobmodel'); // Import the Job model
const sequelize = require('./static/sequelize'); 


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'ptjportal',
    password: 'password',
    port: 5432,
  });

  client.connect();


// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static')) // For serving static files
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



// Use express.urlencoded() for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// PUG SPECIFIC STUFF
app.set('view engine', 'pug') // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')) // Set the views directory


// Define the LocalStrategy for authentication
passport.use(new LocalStrategy((username, password, done) => {
    // Fetch the user from the database by username
    client.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
        if (err) {
            return done(err);
        }

        if (result.rows.length === 0) {
            return done(null, false, { message: 'User not found' });
        }

        const user = result.rows[0];

        // Compare passwords (you should hash and compare in a real app)
        if (user.password === password) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password' });
        }
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    client.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        if (err) {
            return done(err);
        }

        if (result.rows.length === 0) {
            return done(null, false, { message: 'User not found' });
        }

        const user = result.rows[0];
        done(null, user);
    });
});


// ENDPOINTS
app.get('/', (req, res) => {
    // Query the database to get recent job names
    Job.findAll({
        order: [['deadline', 'DESC']],
        limit: 5, // Adjust the limit as needed
    }).then((jobs) => {
        const params = {
            recentJobs: jobs,
        };
        res.status(200).render('home.pug', params);
    });
});

app.get("/contact", (req, res)=>{ 
    // console.log("a request is received successfully")
    const params = { }
    res.status(200).render('contact.pug', params);
});
app.post("/contact", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    // Insert the data into the "contact_info" table
    const query = 'INSERT INTO contact_info (name, email, message) VALUES ($1, $2, $3)';
    const values = [name, email, message];

    client.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('An error occurred while inserting data.');
        } else {
            res.redirect('/'); // Redirect to a success page
        }
    });
});

app.get("/about", (req, res)=>{ 
    // console.log("a request is received successfully")
    const params = { }
    res.status(200).render('about.pug', params);
});
app.get("/blog", (req, res)=>{ 
    // console.log("a request is received successfully")
    const params = { }
    res.status(200).render('blog.pug', params);
});
app.get("/login", (req, res)=>{ 
    // console.log("a request is received successfully")
    const params = { }
    res.status(200).render('login.pug', params);
});
// Define routes for login, registration, and a protected route
app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        const user = req.user;

        // Check the user's role and redirect accordingly
        if (user.role === 'admin') {
            res.redirect('/admin-dashboard');
        } else if (user.role === 'employer') {
            res.redirect('/employer-dashboard');
        } else {
            // Handle other roles or cases as needed
            res.redirect('/dashboard');
        }
    }
);


app.get('/dashboard', (req, res) => {
    Job.findAll()
        .then((jobs) => {
            const params = {
                jobList: jobs,
            };
            res.status(200).render('dashboard.pug', params);
        })
        .catch((error) => {
            console.error('Error fetching job data:', error);
            res.status(500).send('An error occurred while fetching job data.');
        });
});

app.get('/admin-dashboard', (req, res) => {
     // console.log("a request is received successfully")
     const params = { }
     res.status(200).render('admin-dashboard.pug', params);
});
app.get('/employer-dashboard', (req, res) => {
     // console.log("a request is received successfully")
     const params = { }
     res.status(200).render('employer-dashboard.pug', params);
});

app.post('/logout', (req, res)=>{
    // const params = { }
    res.redirect('/');
});
app.get("/signup", (req, res)=>{ 
    // console.log("a request is received successfully")
    const params = { }
    res.status(200).render('signup.pug', params);
});
app.post("/signup", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    // Insert the data into the "contact_info" table
    const query = 'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)';
    const values = [username, email, password, role];

    client.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('An error occurred while inserting data.');
        } else {
            res.redirect('/login'); // Redirect to a success page
        }
    });
});
app.get("/job", (req, res)=>{ 
    // console.log("a request is received successfully")
    const params = { }
    res.status(200).render('job.pug', params);
});
app.post("/post_job", (req, res) => {
    const job_id = req.body.job_id;
    const job_title = req.body.job_title;
    const email = req.body.email;
    const type = req.body.type;
    const application_form = req.body.application_form;
    const deadline = req.body.deadline;

    // Insert the data into the "contact_info" table
    const query = 'INSERT INTO jobs (job_id, job_title, email, type, application_form, deadline) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [job_id, job_title, email, type, application_form, deadline ];

    client.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('An error occurred while inserting data.');
        } else {
            res.redirect('/employer-dashboard'); // Redirect to a success page
        }
    });
});


app.get('/job/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    // Query the database to get the job details by ID
    Job.findByPk(jobId).then((job) => {
        if (!job) {
            // Handle job not found
            res.status(404).send('Job not found');
            return;
        }
        const params = {
            jobDetails: job,
        };
        res.status(200).render('login.pug', params);
    });
});


// START THE SERVER
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});
