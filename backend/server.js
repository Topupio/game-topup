import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import connectDB from './config/connectDB.js'; // Import the database connection function
// import adminRouter from './routers/adminRouter.js'; // Import the admin router
// import userRouter from './routers/userRouter.js'; // Import the user router
// import blogRouter from './routers/blogsRouter.js'; // Import the blog router
// import carouselRouter from './routers/carouselRouter.js'; // Import the carousel router
// import destinationRouter from './routers/destinationRouter.js'; // Import the destination router
// import settingsRouter from './routers/settingRouter.js'; // Import the settings router
// import inquiryRouter from './routers/inquiryRouter.js'; // Import the inquiry router
// import airportRouter from './routers/airportRouter.js'; // Import the airport router

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; 

// Connecting MongoDB
// connectDB();

// CORS options to allow requests from specific origin
const corsOptions = {
    origin: ['http://localhost:5173', 'http://rukntravels.com', 'https://rukntravels.com', 'https://www.rukntravels.com',], // Allow requests from this frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Include cookies in requests
};

// Middleware setup
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies from incoming requests
app.use(morgan('tiny')); // Log HTTP requests using morgan's 'tiny' format
app.use(cors(corsOptions)); // Enable CORS using the specified options

// Routes setup
// app.use('/api/admin', adminRouter); // Use the admin router for routes starting with /api/admin
// app.use('/api/user', userRouter); // Use the user router for routes starting with /api/user
// app.use('/api/blogs', blogRouter); // Use the blog router for routes starting with /api/blogs
// app.use('/api/carousel', carouselRouter); // Use the carousel router for routes starting with /api/carousel
// app.use('/api/destination', destinationRouter); // Use the destination router for routes starting with /api/destination
// app.use('/api/settings', settingsRouter); // Use the settings router for routes starting with /api/settings
// app.use('/api/inquiry', inquiryRouter); // Use the inquiry router for routes starting with /api/inquiry
// app.use('/api/airports', airportRouter);

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});

export default app;