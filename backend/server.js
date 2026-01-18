import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connecting MongoDB
connectDB();

app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});