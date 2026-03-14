import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import app from './app.js';
import { seedCheckoutTemplates } from './seeds/checkoutTemplates.seed.js';
import { startCronJobs } from './jobs/cronScheduler.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connecting MongoDB then seed defaults and start cron jobs
connectDB().then(() => {
    seedCheckoutTemplates().catch((err) =>
        console.error("Checkout template seed error:", err.message)
    );
    startCronJobs();
});

app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});