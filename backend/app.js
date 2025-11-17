import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';
import authRouter from './routes/auth.routes.js';
import csurf from 'csurf';
import adminRouter from './routes/admin.routes.js';

// Create and configure the Express app
const app = express();

// Configure CORS options
const corsOptions = {
    origin: ['http://localhost:3000', 'http://rukntravels.com', 'https://rukntravels.com', 'https://www.rukntravels.com'],
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

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

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
app.use(errorHandler);                            // Handle errors using the errorHandler middleware

// Export the configured app
export default app;