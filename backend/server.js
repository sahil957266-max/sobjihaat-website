const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['https://sabjihaat.in', 'http://localhost:3000'],
  credentials: true
}));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ritadolly9798_db_user:mZr9KYiKB5QJzHcg@cluster0.auzasml.mongodb.net/sobjihaat?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Database Models
const Product = require('./models/Product');
const Order = require('./models/Order');
const Setting = require('./models/Setting');
const Admin = require('./models/Admin');

// Auth middleware
const authenticateToken = require('./middleware/auth');

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pincodes', require('./routes/pincodes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sobji Haat API is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize default data
const initializeData = async () => {
  try {
    // Check if admin exists
    const adminExists = await Admin.findOne();
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'purelocksabji2025', 10);
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'gautamadmins',
        password: hashedPassword
      });
      console.log('✅ Default admin created');
    }

    // Check if settings exist
    const settingsExist = await Setting.findOne();
    if (!settingsExist) {
      await Setting.create({
        deliveryFee: 20,
        freeDeliveryMin: 999,
        servicePincodes: ["700047", "700045", "700075", "700094", "700084", "700092", "700040", "700068", "700095", "700032", "700031"],
        pincodeCharges: {
          "700047": 20, "700045": 25, "700075": 30, "700094": 20, "700084": 25,
          "700092": 30, "700040": 20, "700068": 25, "700031": 30, "700095": 30, "700032": 20
        }
      });
      console.log('✅ Default settings created');
    }

    // Check if products exist
    const productsExist = await Product.findOne();
    if (!productsExist) {
      const defaultProducts = [
        {
          name: "Lemon",
          price: 5,
          category: "indian",
          unit: "piece",
          stock: 50,
          image: "https://images.unsplash.com/photo-1642372849451-18113b4c5cd2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdyZWVuJTIwbGVtb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"
        },
        {
          name: "Tomato",
          price: 40,
          category: "indian",
          unit: "kg",
          stock: 100,
          image: "https://images.unsplash.com/photo-1546470427-e212b7d31055?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9tYXRvfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"
        },
        {
          name: "Potato",
          price: 30,
          category: "indian",
          unit: "kg",
          stock: 80,
          image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG90YXRvfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"
        },
        {
          name: "Onion",
          price: 35,
          category: "indian",
          unit: "kg",
          stock: 60,
          image: "https://images.unsplash.com/photo-1580201092673-3c4d4c457d17?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b25pb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"
        },
        {
          name: "Broccoli",
          price: 80,
          category: "exotic",
          unit: "piece",
          stock: 20,
          image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJvY2NvbGl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"
        },
        {
          name: "Spinach",
          price: 25,
          category: "leafy",
          unit: "bunch",
          stock: 30,
          image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }
      ];
      
      await Product.insertMany(defaultProducts);
      console.log('✅ Default products created');
    }
  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initializeData();
});
