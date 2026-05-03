const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const authRoute = require('./routes/auth');
const propertyRoute = require('./routes/properties');
const adminRoute = require('./routes/admin');
const logsRoute = require('./routes/logs');
const usersRoute = require('./routes/users');
const aiRoute = require('./routes/ai');
const geoRoute = require('./routes/geo');

app.use('/api/auth', authRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/admin', adminRoute);
app.use('/api/logs', logsRoute);
app.use('/api/users', usersRoute);
app.use('/api/ai', aiRoute);
app.use('/api/geo', geoRoute);

app.get('/', (req, res) => {
    res.send('Real Estate Marketplace API is running');
});

// Database Connection
// Supabase client is initialized in routes directly via config
// MongoDB connection removed

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET?.trim())) {
        console.warn(
            '[server] JWT_SECRET is unset in NODE_ENV=production — set a strong secret before exposing this API publicly.'
        );
    }
});
