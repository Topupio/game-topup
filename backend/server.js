import { startGwFulfillment } from "./services/gwUltimate.service.js";
import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import app from './app.js';
import { seedCheckoutTemplates } from './seeds/checkoutTemplates.seed.js';
import { startCronJobs } from './jobs/cronScheduler.js';
import { runStartupChecks } from './utils/startupChecks.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connecting MongoDB then seed defaults and start cron jobs
connectDB().then(() => {
    seedCheckoutTemplates().catch((err) =>
        console.error("Checkout template seed error:", err.message)
    );
    runStartupChecks().catch((err) =>
        console.error("Startup checks error:", err.message)
    );
    startCronJobs();
  startGwFulfillment();
});

// Bind to localhost only: production traffic must come through nginx, never straight to this port
app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});