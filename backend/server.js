import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import app from './app.js';
import { seedCheckoutTemplates } from './seeds/checkoutTemplates.seed.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connecting MongoDB then seed defaults
connectDB().then(() => {
    seedCheckoutTemplates().catch((err) =>
        console.error("Checkout template seed error:", err.message)
    );
});

app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});