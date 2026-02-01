import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';
import authRouter from './routes/auth.routes.js';
import csurf from 'csurf';
import dashboardRouter from './routes/dashboard.routes.js';
import adminRouter from './routes/admin.routes.js';
import gameRouter from './routes/game.routes.js';
import productRouter from './routes/product.routes.js';
import internalRouter from './routes/internal.routes.js';
import bannerRouter from './routes/banner.routes.js';
import blogRouter from './routes/blog.routes.js';
import orderRouter from './routes/order.routes.js';

// Create and configure the Express app
const app = express();

// Trust proxy - required for Render, Heroku, etc. to get correct client IP
app.set('trust proxy', 1);

// Configure CORS options
const allowedOrigins = [
    'http://localhost:3000',
    'https://game-topup-opal.vercel.app',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow if origin is in allowedOrigins or ends with .vercel.app
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

// Middleware Setup
app.use(express.json());                            // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));    // Parse URL-encoded data
app.use(cookieParser());                            // Parse cookies from incoming requests
app.use(morgan('tiny'));                            // Log HTTP requests using morgan's 'tiny' format
app.use(cors(corsOptions));                         // Enable CORS using the specified options

const isProd = process.env.NODE_ENV === 'production';
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
    }
});

app.use(csrfProtection);

app.use('/api/internal', internalRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/games', gameRouter);
app.use('/api/products', productRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/orders', orderRouter);

// Root route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404);
    next(new Error('Not Found'));
});

// CSRF error handler
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }
    next(err);
});

// Error handling middleware
app.use(errorHandler); // Handle errors using the errorHandler middleware

// Export the configured app
export default app;