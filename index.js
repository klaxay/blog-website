const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Blog = require('./models/blog');

require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/techblog')
    .then(() => console.log("Connection Successful"))
    .catch(err => console.log(err));

// Initialize the app
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true })); // To parse form data
app.use(session({
    secret: 'yourSecretKey', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', async (req, res) => {
    const blogs = await Blog.find({});
    res.render('home', { user: req.session.username, blogs: blogs });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.render('signup', { error: "Username is taken" }); // Render with an error message
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    req.session.username = username; // Store username in session
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && bcrypt.compareSync(password, user.password)) { // Correct field name
        req.session.username = username; // Store username in session
        res.redirect('/');
    } else {
        return res.render('login', { error: 'Invalid username or password' }); // Render with an error message
    }
});

app.get('/add', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.render('addBlog'); // Adjusted to the correct view
});

app.post('/add', async (req, res) => {
    const { title, content } = req.body;
    const user = req.session.username;
    const blog = new Blog({ title, content, author:user });

    try {
        await blog.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving blog post');
    }
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
