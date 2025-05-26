const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

// Routes
const authRoutes = require('./routes/authroutes');
const userRoutes = require('./routes/userRoutes');
const mealRoutes = require('./routes/mealroutes'); // ✅ Meal plan routes
const nutritionRoutes = require('./routes/nutritionRoutes'); 
const initPassport = require('./config/passport');
const groceryRoutes = require('./routes/groceryRoutes'); // ✅ Grocery list route

const app = express(); // ✅ MUST be defined before any app.use()

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/nutriplan")
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'nutriplan_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
initPassport(passport);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Static HTML routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'homepage.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));
app.get('/info', (req, res) => res.sendFile(path.join(__dirname, 'views', 'info.html')));
app.get('/nutrition', (req, res) => res.sendFile(path.join(__dirname, 'views', 'nutrition.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/faq', (req, res) => res.sendFile(path.join(__dirname, 'views', 'faq.html')));
app.get('/grocerylist', (req, res) => res.sendFile(path.join(__dirname, 'views', 'grocerylist.html')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meal', mealRoutes); // ✅ Enables /api/meal/generate-plan and /regenerate-plan
app.use('/api/nutrition', nutritionRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
