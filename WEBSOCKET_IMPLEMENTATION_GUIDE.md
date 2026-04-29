# WebSocket Implementation Guide — Admin Order Alerts

## Goal

Replace polling-based admin order alerts with realtime events.

When an order is created or changes into an actionable queue, the backend should emit an event to connected admin dashboards. The frontend can then show the small ping dot on the relevant tab and optionally refetch the active table.

## Recommended Library

Use Socket.IO:

- Backend: `socket.io`
- Frontend: `socket.io-client`

Socket.IO is a good fit here because it supports WebSocket with fallback transports and works cleanly behind Nginx.

## Production Setup Context

Current Hostinger deployment:

- Frontend: Next.js on `localhost:3000`
- Backend: Express on `localhost:3001`
- Nginx public domain: `https://topupio.com`
- `/api/` proxies to backend
- `/` proxies to frontend

Important: Socket.IO defaults to `/socket.io/`. Without a dedicated Nginx route, that path will go to Next.js instead of Express.

## Nginx Change

Add this block before `location /` in `/etc/nginx/sites-available/game-topup`:

```nginx
# Socket.IO / WebSocket
location /socket.io/ {
    proxy_pass http://localhost:3001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

Then run:

```bash
nginx -t
systemctl restart nginx
```

No extra firewall port is needed if Socket.IO runs on the existing backend port `3001`.

## Environment Variables

Backend already has:

```env
ALLOWED_ORIGINS=https://topupio.com
```

That is enough for same-domain production.

Optional frontend env if you want explicit socket URL:

```env
NEXT_PUBLIC_SOCKET_URL=https://topupio.com
```

For local development, this may be:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Backend Setup

Install:

```bash
cd backend
npm install socket.io
```

Update `backend/server.js` from `app.listen(...)` to an HTTP server:

```js
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/connectDB.js";
import app from "./app.js";
import { seedCheckoutTemplates } from "./seeds/checkoutTemplates.seed.js";
import { startCronJobs } from "./jobs/cronScheduler.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) || [];

const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

io.on("connection", (socket) => {
    socket.on("admin:join", () => {
        socket.join("admin");
    });
});

connectDB().then(() => {
    seedCheckoutTemplates().catch((err) =>
        console.error("Checkout template seed error:", err.message)
    );
    startCronJobs();
});

httpServer.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});
```

Later, admin socket authentication should be added before joining the `admin` room. The simple version above is enough to prove the realtime flow.

## Shared Emit Helper

Create `backend/utils/orderRealtime.js`:

```js
import { io } from "../server.js";

export function getAdminOrderQueue(order) {
    if (
        order.paymentMethod === "upi"
        && order.paymentStatus === "pending"
        && order.orderStatus === "pending"
    ) {
        return "upi_review";
    }

    return order.orderStatus;
}

export function emitAdminOrderChanged(order, reason) {
    io.to("admin").emit("order:changed", {
        orderId: order._id.toString(),
        publicOrderId: order.orderId,
        queue: getAdminOrderQueue(order),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        reason,
    });
}
```

## Backend Emit Points

Call `emitAdminOrderChanged(order, reason)` after the order is saved in these places:

- New order created in `backend/controllers/order.controller.js`
  - reason: `"created"`
- UPI QR generated in `backend/controllers/paymentSettings.controller.js`
  - reason: `"upi_qr_generated"`
- UPI UTR submitted in `backend/controllers/paymentSettings.controller.js`
  - reason: `"upi_utr_submitted"`
- PayPal payment captured in `backend/controllers/payment.controller.js`
  - reason: `"payment_paid"`
- PayPal webhook confirms payment in `backend/controllers/payment.controller.js`
  - reason: `"payment_paid"`
- NOWPayments webhook confirms payment in `backend/controllers/payment.controller.js`
  - reason: `"payment_paid"`
- Admin updates an order in `backend/controllers/order.controller.js`
  - reason: `"admin_updated"`

Do not emit alerts for `completed` and `processing` on the frontend if they should not pulse.

## Frontend Setup

Install:

```bash
cd frontend
npm install socket.io-client
```

Create a client helper, for example `frontend/src/lib/socket/adminSocket.ts`:

```ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getAdminSocket() {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || undefined, {
            path: "/socket.io/",
            withCredentials: true,
        });
    }

    return socket;
}
```

Use it in `AdminOrderPage`:

```ts
useEffect(() => {
    const socket = getAdminSocket();

    socket.emit("admin:join");

    socket.on("order:changed", ({ queue }) => {
        if (queue === "completed" || queue === "processing") return;
        setPulsingQueue(queue);

        window.setTimeout(() => {
            setPulsingQueue(null);
        }, 7000);
    });

    return () => {
        socket.off("order:changed");
    };
}, []);
```

If the active tab matches the event queue, also refetch the table:

```ts
if (queue === activeQueue) {
    fetchData(undefined, { silent: true });
}
```

## PM2 Notes

The current guide runs one backend process:

```bash
pm2 start npm --name "backend" -- start
```

This is fine for Socket.IO.

If you later run multiple backend instances or PM2 cluster mode, Socket.IO needs sticky sessions or a Redis adapter.

## Deployment Checklist

1. Install `socket.io` in backend.
2. Install `socket.io-client` in frontend.
3. Convert backend `app.listen` to HTTP server + Socket.IO.
4. Add the Nginx `/socket.io/` proxy block.
5. Add emit helper and emit calls in order/payment/UPI update paths.
6. Add frontend socket listener in admin orders page.
7. Test locally.
8. Deploy, run `npm install`, rebuild frontend, restart PM2.
9. Run `nginx -t` and restart Nginx after config change.

## Testing

Local:

1. Start backend and frontend.
2. Open admin orders page.
3. Create a new order.
4. Generate UPI QR.
5. Submit UTR.
6. Confirm payment via mock/dev flow if available.

Expected result:

- `UPI Review` pulses when UPI QR is generated.
- `UPI Review` pulses when UTR is submitted.
- `Paid` pulses when payment is confirmed.
- `Completed` and `Processing` do not pulse.
