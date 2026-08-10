# MERN Interview Prep — Game Top-Up Project

Your project, your answers. Every code snippet below is real code from this repo.

---

## PART 0: The 60-Second Project Pitch

Memorize this. It's the answer to "Tell me what you built."

> I built a **game top-up e-commerce platform** — users buy in-game currency
> (like Free Fire diamonds, PUBG UC) for their game accounts.
>
> **Stack:** Next.js 16 with React 19 on the frontend, Express 5 + MongoDB with
> Mongoose on the backend. Tailwind CSS v4 for styling.
>
> It has two sides: a **customer storefront** where users browse games, pick a
> top-up package, enter their player ID, and pay via PayPal or crypto
> (NOWPayments); and an **admin panel** where admins manage games, products,
> orders, banners, blogs, and see a live dashboard.
>
> **What I'm proudest of:** the auth system — JWT access tokens plus rotating
> refresh tokens stored in the DB, httpOnly cookies, email verification, Google
> OAuth, CSRF protection, and rate limiting. And the order fulfilment pipeline,
> which auto-places orders with an external supplier API and handles payment
> webhooks.

**Key numbers to drop:** 13 Mongoose models, 14 route groups, 15 controllers,
~320 files.

---

## PART 1: Project Architecture

### Folder structure — know this cold

```
game-topup/
├── backend/                  Express 5 API (ESM, "type": "module")
│   ├── server.js             Entry: connect DB → seed → start cron → listen
│   ├── app.js                Express app: middleware, CORS, CSRF, routes
│   ├── config/connectDB.js   Mongoose connection
│   ├── models/               13 Mongoose schemas
│   ├── controllers/          15 controllers (business logic)
│   ├── routes/               14 routers (URL → controller mapping)
│   ├── middlewares/          auth, role, error, rateLimit, upload, recaptcha
│   ├── services/             External APIs: PayPal, NOWPayments, GamersWorkshop
│   ├── utils/                token, cloudinary, email, currencyConverter
│   ├── jobs/                 node-cron scheduled jobs
│   ├── constants/            regions, checkoutTemplates
│   └── seeds/                DB seeders
└── frontend/                 Next.js 16 App Router + TypeScript
    └── src/
        ├── app/              Routes: (user) group, /admin, /login, /signup...
        ├── components/       ui/, admin/, user/, form/, providers/
        ├── services/         API client per domain (orders, games, payments...)
        ├── context/          React Context for global state
        ├── hooks/            Custom hooks
        └── lib/              http client, types, seo, utils, constants
```

**Why this structure?** Separation of concerns. Routes only map URLs.
Controllers hold business logic. Models hold data shape + validation.
Services isolate third-party APIs so swapping a payment gateway touches one file.

### Request lifecycle — draw this on a whiteboard if asked

```
Browser (Next.js)
   ↓  axios request with httpOnly cookie
express.json()          parse body
cookieParser()          parse cookies
cors(corsOptions)       origin allowlist check
csrfProtection          verify CSRF token (skipped for webhooks + GET /me)
   ↓
Router  (app.use('/api/orders', orderRouter))
   ↓
protect                 verify JWT from cookie, load user, attach req.user
authorize('admin')      role check
validator               express-validator field checks
   ↓
Controller              business logic, calls Model
   ↓
Mongoose Model  ⇄  MongoDB
   ↓
res.json(...)
   ↓  on any thrown error
asyncHandler → next(err) → errorHandler → JSON error response
```

---
 
## PART 2: MongoDB + Mongoose (the big one)

### 2.1 Connecting

`backend/config/connectDB.js`:

```js
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};
export default connectDB;
```

**Q: Why `process.exit(1)`?**
> No DB means the app can't do anything useful. Better to crash loudly so the
> process manager restarts it than to run and fail every request.

**Q: MongoDB vs SQL — why did you pick MongoDB?**
> Our data is document-shaped and varies by game. A game has `requiredFields`
> (player ID, server, email — different per game), `variants`, and
> `regionPricing` arrays. In SQL that's 3–4 join tables. In MongoDB it's one
> embedded document I fetch in a single read. Also the schema evolved fast during
> development, and Mongoose let me add fields without migrations.

**Q: Downside of MongoDB?**
> No native joins across collections at query time — `$lookup` is slower than a
> SQL join. Multi-document transactions need a replica set. And no schema at the
> DB level, so validation discipline has to live in the app — which is exactly
> what Mongoose gives us.

---

### 2.2 Schema, validation, `timestamps`

From `models/user.model.js`:

```js
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Please enter your name"], trim: true },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: function () { return this.authProvider === "local"; },
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        authProvider: { type: String, enum: ["local", "google"], default: "local" },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        status: { type: String, enum: ["active", "blocked"], default: "active" },
        isVerified: { type: Boolean, default: false },
        // ...token fields
    },
    { timestamps: true }
);
```

Talking points, one per feature:

| Feature | What to say |
|---|---|
| `required: [true, "msg"]` | Custom error message returned to client |
| `required: function() {...}` | **Conditional required** — Google OAuth users have no password |
| `select: false` | Password never returned by default; must opt in with `.select("+password")` |
| `enum` | DB-level allowlist; invalid role throws ValidationError |
| `trim` / `lowercase` | Normalization so `" A@B.com "` and `"a@b.com"` are the same user |
| `unique: true` | Creates a **unique index** — not a validator. Duplicate insert throws E11000, not ValidationError |
| `timestamps: true` | Auto `createdAt` / `updatedAt` |

**Gotcha they love to ask: `unique` is not validation.**
> `unique: true` builds a unique index in MongoDB. It's enforced by the database
> on write, not by Mongoose before the write. So the error is a MongoServerError
> with code 11000, not a Mongoose ValidationError. You have to handle it
> separately — in my app I check `findOne({ email })` first for a clean 409
> response.

**Custom validator** — from `product.model.js`:

```js
discountedPrice: {
    type: Number, required: true, min: 0,
    validate: {
        validator: function (value) { return value <= this.price; },
        message: "discountedPrice cannot be greater than price",
    },
},
```
> Cross-field validation. `this` is the document, so I can compare two fields.

---

### 2.3 Middleware (hooks) — `pre('save')`

```js
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
```

**Q: Why the `isModified` guard?**
> Without it, every `user.save()` — updating `lastLoginAt`, verifying email —
> would re-hash the already-hashed password, and login would break forever. The
> guard makes the hook idempotent.

**Q: Why `function` and not an arrow function?**
> Arrow functions don't bind `this`. Mongoose hooks and methods rely on `this`
> being the document, so they must be regular functions.

**Q: What is bcrypt's `10`?**
> Salt rounds — the cost factor. 2^10 iterations. Higher = slower = harder to
> brute-force. bcrypt also auto-generates a per-user salt, so two users with the
> same password get different hashes.

**Q: Why hash in a hook instead of the controller?**
> Single choke point. Register, password reset, admin-created users, seeds —
> every write path goes through `save()`, so it's impossible to accidentally
> store a plaintext password.

---

### 2.4 Instance methods

```js
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    this.verificationToken = crypto
        .createHash("sha256").update(verificationToken).digest("hex");
    this.verificationTokenExpires = Date.now() + 15 * 60 * 1000;
    return verificationToken;              // plaintext → email
};
```

**This is a great answer to "tell me something security-conscious you did":**
> I treat email-verification and password-reset tokens like passwords. I generate
> a random token, email the **plaintext** version to the user, but store only the
> **SHA-256 hash** in MongoDB. If someone dumps the database they can't use those
> tokens. On verification I hash the incoming token and look up by the hash.

Lookup side, `auth.controller.js`:

```js
const hashed = crypto.createHash("sha256").update(token).digest("hex");
const user = await User.findOne({
    verificationToken: hashed,
    verificationTokenExpires: { $gt: Date.now() }   // expiry check in the query
});
```

**Q: Why SHA-256 here but bcrypt for passwords?**
> Passwords are low-entropy and human-chosen, so they need a slow hash to resist
> brute force. These tokens are 32 random bytes — brute-forcing them is
> infeasible regardless — and they're checked on every verification request, so a
> fast hash is the right trade-off.

**`methods` vs `statics`:**
> `schema.methods` = on a document instance (`user.comparePassword()`).
> `schema.statics` = on the model (`User.findByEmail()`). Methods need a document;
> statics don't.

---

### 2.5 Relationships: `ref` + `populate`

`order.model.js`:

```js
user:    { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
game:    { type: mongoose.Schema.Types.ObjectId, ref: "Game",    required: true },
product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
```

Populating, `dashboard.controller.js`:

```js
Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("orderId amount unitPrice quantity orderStatus paymentStatus createdAt user product game")
    .populate("user", "name email")
    .populate("product", "name")
    .populate("game", "name")
    .lean(),
```

**Q: What does `populate` actually do?**
> It's not a join. Mongoose runs the main query, collects the ObjectIds, then
> fires a **second query** per populated path with `$in` on those ids, and stitches
> the results in memory. So `.populate()` × 3 = 4 round trips.

**Q: Why the second argument `"name email"`?**
> Projection. Only pull the fields I need instead of the whole user document —
> less network, less memory, and I don't accidentally leak fields.

**Q: What's `.lean()`?**
> Returns plain JS objects instead of Mongoose documents. It skips hydration, so
> it's noticeably faster and lighter. Safe here because it's a read-only response
> — but you lose virtuals, getters, and `.save()`.

**Q: Embed vs reference — how did you decide?**
> I referenced Users/Games/Products from Orders because they're large, shared, and
> updated independently. I **embedded** `userInputs`, `tracking`, `delivery`, and
> `productSnapshot` inside the order because they belong only to that order and
> are always read with it.

**The snapshot pattern — a strong answer:**
```js
productSnapshot: {
    name: String, price: Number, discountedPrice: Number,
    deliveryTime: String, qty: Number, totalAmount: Number,
},
```
> An order must record what the customer actually bought at that moment. If an
> admin later changes the product price, old orders must not change. So I
> denormalize a snapshot into the order. This is deliberate duplication —
> historical accuracy beats normalization for financial records.

---

### 2.6 Indexes

```js
// user.model.js
userSchema.index({ email: 1 });

// order.model.js
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "externalOrder.externalOrderId": 1 });
```

**Q: Why index these specific fields?**
> Each index matches a real query. `{ user: 1, createdAt: -1 }` serves "my orders,
> newest first" on the account page. `{ orderStatus: 1, createdAt: -1 }` serves
> the admin order list filtered by status. `paymentStatus` serves the dashboard
> counters. `externalOrder.externalOrderId` serves the supplier webhook, which
> looks orders up by the supplier's id.

**Q: What is a compound index and why does field order matter?**
> A compound index is sorted by the first field, then the second within it.
> MongoDB can use a **prefix** of the index — so `{user:1, createdAt:-1}` serves
> a query on `user` alone, and on `user` + sort by `createdAt`. But it can't
> efficiently serve a query on `createdAt` alone. Most-selective / most-filtered
> field goes first — this is the ESR rule: **Equality, Sort, Range**.

**Q: Cost of indexes?**
> Every write must update every index, so writes get slower and storage grows.
> You index for your actual query patterns, not for every field.

**Q: How would you find a slow query?**
> `.explain("executionStats")`. I'd check `stage` — `IXSCAN` means it used an
> index, `COLLSCAN` means a full collection scan — and compare
> `totalDocsExamined` to `nReturned`. If it examined 100k docs to return 10,
> there's a missing index.

**Honest point that scores well:**
> One thing I'd fix: `email` has both `unique: true` in the field definition and
> `userSchema.index({ email: 1 })`. The `unique` already creates the index, so
> that's a redundant duplicate index. Same for `orderId`.

---

### 2.7 Aggregation Framework

This is where you separate yourself. You have real pipelines.

**A. `$facet` — many aggregations in one pass** (`dashboard.controller.js`):

```js
Payment.aggregate([
    { $match: { status: "success" } },
    {
        $facet: {
            total: [{ $group: { _id: null, value: { $sum: "$amount" } } }],
            today: [
                { $match: { createdAt: { $gte: todayStart } } },
                { $group: { _id: null, value: { $sum: "$amount" } } }
            ],
            week: [
                { $match: { createdAt: { $gte: weekStart } } },
                { $group: { _id: null, value: { $sum: "$amount" } } }
            ]
        }
    }
])
```

> I needed total, today's, and this week's revenue. Instead of three separate
> queries scanning the payments collection three times, `$facet` runs three
> sub-pipelines over **one** input stream. One DB round trip, one scan.
> Note `$match` comes first so the facet only sees successful payments — filter
> as early as possible so later stages process fewer documents.

**B. `$setWindowFields` + `$rank` — top-N-per-group** (`game.controller.js`):

```js
Game.aggregate([
    {
        $setWindowFields: {
            partitionBy: "$category",
            sortBy: { status: 1, createdAt: -1 },
            output: { rank: { $rank: {} } }
        }
    },
    { $match: { rank: { $lte: 6 } } },
    { $group: { _id: "$category", games: { $push: "$$ROOT" } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, category: "$_id", games: 1 } }
])
```

> The homepage shows game categories, each with up to 6 games. This is the classic
> "top N per group" problem. `$setWindowFields` partitions by category — like SQL
> `PARTITION BY` — ranks games inside each partition, then I filter to rank ≤ 6
> and group them back into arrays. Doing this in JS would mean fetching every game
> and slicing in memory; this does it in the database.

**Know these terms:** `$$ROOT` = the whole current document. `$project` with
`_id: 0` reshapes output and drops the group key in favour of a readable
`category` field.

**C. `$group` for averages and distribution** (`review.controller.js`):

```js
GameReview.aggregate([
    { $match: { game: gameObjectId } },
    { $group: { _id: "$game", averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
]),
GameReview.aggregate([
    { $match: { game: gameObjectId } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
]),
```

> Average rating and a 5→1 star distribution, computed in the DB.

**CRITICAL gotcha — they will test this:**

```js
const gameObjectId = new mongoose.Types.ObjectId(gameId);
```

> In `find()`, Mongoose casts a string id to ObjectId automatically because it
> knows the schema. **Aggregation bypasses schema casting** — the pipeline is sent
> raw to MongoDB. So `$match: { game: "68f2..." }` matches nothing, silently, with
> no error. You must construct the ObjectId manually. I hit this and it's the
> #1 aggregation bug.

**Q: `find()` vs `aggregate()`?**
> `find()` for straightforward filtering, sorting, pagination. `aggregate()` when
> I need to transform, group, or compute — sums, averages, ranking, reshaping,
> or multi-collection joins via `$lookup`.

**Common stages cheat sheet:**

| Stage | Purpose |
|---|---|
| `$match` | Filter. Put first — uses indexes |
| `$group` | Group + accumulate (`$sum`, `$avg`, `$push`, `$max`) |
| `$project` | Reshape / pick fields |
| `$sort` / `$skip` / `$limit` | Order and paginate |
| `$lookup` | Join another collection |
| `$unwind` | Array → one doc per element |
| `$facet` | Multiple sub-pipelines over one input |
| `$setWindowFields` | Ranking / running totals within partitions |
| `$addFields` | Add computed fields, keep the rest |

---

### 2.8 Pagination

`game.controller.js`:

```js
const pageNum  = parseInt(page) || 1;
const limitNum = parseInt(limit) || 12;
const skip = (pageNum - 1) * limitNum;

const games = await Game.find(query).sort(sortQuery).skip(skip).limit(limitNum);
const total = await Game.countDocuments(query);

return res.status(200).json({
    success: true, total, page: pageNum, limit: limitNum,
    totalPages: Math.ceil(total / limitNum), count: games.length, data: games
});
```

**Q: Problem with skip/limit?**
> `skip(100000)` still walks and discards 100,000 documents — it degrades
> linearly. For large datasets you use **cursor / keyset pagination**: instead of
> a page number, pass the last seen value —
> `find({ createdAt: { $lt: lastCreatedAt } }).limit(12)`. That's index-backed
> and constant-time. Skip/limit is fine here because admin lists are small and
> need jump-to-page.

**Q: Improvement you'd make?**
> Run the two queries in parallel with `Promise.all` instead of sequentially —
> they're independent, so it halves the latency.

**Dynamic filter building — worth explaining:**
```js
const query = {};
const conditions = [];

if (search) {
    conditions.push({ $or: [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
    ]});
}
if (status && ["active", "inactive"].includes(status)) query.status = status;
if (conditions.length > 0) query.$and = conditions;
```
> Only add a clause when the param is present, so one endpoint handles every
> filter combination. I whitelist `status` against a known array rather than
> trusting input. `$options: "i"` is case-insensitive.

**Q: Downside of `$regex` search?**
> An unanchored regex can't use an index — it's a collection scan. At scale I'd
> add a MongoDB **text index** with `$text: { $search: ... }`, or Atlas Search.

---

### 2.9 Query operators you used — know them

| Operator | Where you used it |
|---|---|
| `$gt` / `$gte` / `$lt` | Token expiry, date ranges, stuck-order threshold |
| `$in` / `$ne` | Category filter, `paymentCategory: { $ne: "" }` |
| `$or` / `$and` | Search across name+description; combining filters |
| `$regex` | Case-insensitive search |
| `$set` / `$push` | Updates; appending to `tracking` array |
| `$sum` / `$avg` | Aggregation accumulators |

---

### 2.10 Transactions — be honest and informed

Truth: this project has **no** multi-document transactions. That's a fine answer
if framed correctly.

> I didn't use transactions. Each of my critical writes is a single document —
> when a payment succeeds I update one order document, and single-document
> operations in MongoDB are atomic by default. If I added a feature spanning
> collections, like debiting a wallet **and** creating an order, I'd need
> `session.withTransaction()`. That requires a replica set — transactions don't
> work on a standalone mongod.

If pushed for the syntax:
```js
const session = await mongoose.startSession();
try {
    await session.withTransaction(async () => {
        await Wallet.updateOne({ user: id }, { $inc: { balance: -amount } }, { session });
        await Order.create([{ ... }], { session });
    });
} finally {
    session.endSession();
}
```
> Every operation must be passed the `session`, or it runs outside the transaction.

**Idempotency instead** — the real answer for payments:
> For webhooks I rely on idempotency rather than transactions. The order has a
> unique `orderId` and `paymentInfo.transactionId` is indexed, so a duplicate
> webhook delivery — which gateways do send — finds the order already marked paid
> and becomes a no-op instead of double-crediting.

---

## PART 3: Authentication & Security (your strongest area)

### 3.1 JWT + rotating refresh tokens

Two-token design in `utils/token.js`:

```js
export const generateAccessToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "15m",
    });
};

export const generateRefreshTokenValue = () => crypto.randomBytes(48).toString("hex");
```

**Q: Explain your auth flow.**
> On login I issue two tokens. The **access token** is a JWT with a 15-minute
> expiry carrying the user id and role — stateless, so verifying it needs no DB
> hit. The **refresh token** is 48 random bytes stored in a `RefreshToken`
> collection with expiry, IP, and revocation fields — stateful, so it can be
> revoked. Both go in httpOnly cookies. When the access token expires the client
> calls `/api/auth/refresh`, which rotates the refresh token and issues a new
> access token.

**Q: Why short-lived access + long-lived refresh?**
> A stolen JWT can't be revoked — it's valid until it expires. Keeping it at 15
> minutes caps the damage. The refresh token lives 7 days for convenience but is
> stored in the DB, so I *can* revoke it instantly.

**Rotation** — this is the part interviewers like:

```js
export const rotateRefreshToken = async (currentTokenValue, ip) => {
    const existing = await RefreshToken.findOne({ token: currentTokenValue });
    if (!existing || !existing.isActive) return null;
    existing.revoked = new Date();
    existing.revokedByIp = ip;
    const { value: newValue, doc: newDoc } = await createRefreshToken(existing.user, ip);
    existing.replacedByToken = newValue;
    await existing.save();
    return { newValue, newDoc, userId: existing.user };
};
```

> Each refresh token is single-use. Using it revokes it and issues a new one, and
> I record `replacedByToken` so there's a chain. That means if a token is stolen
> and replayed, one of the two parties hits an already-revoked token — which is a
> detectable signal of theft. I store `createdByIp` / `revokedByIp` for audit.

**Virtuals on `refreshToken.model.js`:**
```js
refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expires.getTime();
});
refreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});
```
> Virtuals are computed, not stored. `isActive` derives from `revoked` and
> `expires`, so there's no denormalized boolean to fall out of sync.
> Caveat: virtuals don't exist on `.lean()` results and aren't queryable.

---

### 3.2 Cookies

```js
res.cookie("token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: accessMaxAge,
});
```

**Q: Why cookies instead of localStorage?**
> `httpOnly` means JavaScript cannot read the cookie, so an XSS payload can't
> exfiltrate the token. localStorage is readable by any script on the page. The
> cost is CSRF exposure, since cookies are sent automatically — which is why I
> added CSRF tokens.

**Each flag:**
- `httpOnly` — no JS access → XSS can't steal it
- `secure: isProd` — HTTPS only in production, HTTP allowed locally for dev
- `sameSite: 'lax'` — not sent on cross-site POSTs → blocks basic CSRF
- `maxAge` — browser expires it automatically

---

### 3.3 `protect` and `authorize`

```js
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) { res.status(401); throw new Error("Not authorized"); }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) { res.status(401); throw new Error("Not authorized"); }

    if (user.status === "blocked") {
      return res.status(403).json({ success: false, message: "Your account has been suspended" });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) { next(err); }
};
```

**Q: The JWT already has the role — why hit the DB?**
> Because a JWT is a snapshot from login time. If an admin blocks a user, their
> existing token is still cryptographically valid for up to 15 minutes. The DB
> lookup lets me reject blocked users immediately, and picks up role changes.
> It's a deliberate trade of statelessness for revocation — one indexed
> `findById` per request.

```js
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            return next(new Error('Forbidden'));
        }
        next();
    };
};
```
> A **middleware factory** — a closure returning middleware, so I can write
> `authorize('admin')` or `authorize('admin','user')`. It must run after
> `protect` because it depends on `req.user`.

**Q: 401 vs 403?**
> 401 Unauthorized = "I don't know who you are" (missing/invalid token).
> 403 Forbidden = "I know who you are, and you're not allowed" (wrong role,
> blocked account).

---

### 3.4 Registration & email verification

Flow to describe:
1. `POST /register` → create user with `isVerified: false`
2. Generate token, store SHA-256 hash, email plaintext link
3. User clicks → `verifyEmail` hashes the token, finds an unexpired match
4. Set `isVerified: true`, clear token fields
5. Login blocks unverified users and auto-resends the email

**Resend throttling — good detail:**
```js
if (exists.lastVerificationSentAt &&
    now - exists.lastVerificationSentAt < 2 * 60 * 1000) {
    res.status(429).json({ success: false,
        message: "Verification email already sent. Please wait before requesting another." });
    return;
}
```
> A 2-minute cooldown tracked with `lastVerificationSentAt`, returning **429 Too
> Many Requests**. Stops someone from using my signup form to spam another
> person's inbox — and protects my email quota.

**Registering an existing-but-unverified email resends instead of erroring:**
> If someone signed up but never clicked the link, erroring "email already in use"
> traps them permanently. So that path resends the verification instead. Real UX
> thinking.

**Login is deliberately vague:**
```js
const user = await User.findOne({ email }).select("+password");
if (!user) { res.status(401); throw new Error("Invalid credentials"); }
...
if (!isMatch) { res.status(401); throw new Error("Invalid credentials"); }
```
> Same message for wrong email and wrong password — otherwise the endpoint
> becomes a **user-enumeration oracle** telling an attacker which emails are
> registered.

**`.select("+password")`** — the schema has `select: false`, so the password must
be explicitly requested here.

**`user.save({ validateBeforeSave: false })`** on `lastLoginAt`:
> Skips full-document validation for a trivial timestamp write. It's a
> micro-optimization — and it avoids failures if an old document doesn't satisfy
> a validator added later.

**Cleanup cron** — `cleanupUnverifiedUsers` runs daily at 3 AM so abandoned
signups don't hold email addresses hostage forever.

---

### 3.5 CSRF

```js
const csrfProtection = csurf({
    cookie: { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd }
});

app.use((req, res, next) => {
    if (req.method === 'GET' && req.path === '/api/auth/me') return next();
    if (req.method === 'POST' && req.path === '/api/payments/paypal/webhook') return next();
    if (req.method === 'POST' && req.path === '/api/payments/nowpayments/webhook') return next();
    if (req.method === 'POST' && req.path === '/api/webhooks/gamers-workshop') return next();
    csrfProtection(req, res, next);
});
```

**Q: What is CSRF?**
> Cross-Site Request Forgery. Because cookies are attached automatically, a
> malicious site can make your browser POST to my API with your session cookie. A
> CSRF token defeats it: the server sends a token the attacker's site can't read
> (same-origin policy), and requires it echoed back in a header on every mutating
> request.

**Q: Why skip it for webhooks?**
> PayPal and NOWPayments are servers, not browsers — they have no CSRF token and
> no cookie. They're authenticated differently: **PayPal by signature
> verification, NOWPayments by HMAC-SHA512 over the raw request body.** So the
> protection is equivalent, not absent. That's why the skip list is narrow and
> matches exact method+path rather than a broad prefix.

**Q: `sameSite: 'none'` in prod — why?**
> Frontend and API are on different domains in production, so the cookie must be
> allowed cross-site. `none` requires `secure: true`, which is why they're paired.

---

### 3.6 Raw body for webhooks — subtle and impressive

```js
app.use('/api/payments/paypal/webhook', express.raw({ type: 'application/json' }));
app.use('/api/payments/nowpayments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
```

> Signature verification hashes the **exact bytes** the gateway sent. If
> `express.json()` parses first, the original string is gone and re-stringifying
> can reorder keys or change whitespace — the signature then fails. So I mount
> `express.raw()` on the webhook paths **before** `express.json()`. Express
> middleware runs in registration order, and the path-specific handler claims
> those routes first.

---

### 3.7 Other security layers

Installed and configured: `helmet` (security headers), `express-rate-limit`,
`express-mongo-sanitize` (strips `$`/`.` to stop operator injection),
`xss-clean`, `express-validator`, Google reCAPTCHA middleware, `csurf`.

**Q: NoSQL injection — what is it?**
> If I pass `req.body` straight into a query, a client can send
> `{ "email": { "$gt": "" } }` and the operator matches any user. Defences:
> `express-mongo-sanitize` strips `$`-prefixed keys, and Mongoose casting rejects
> an object where the schema expects a String.

**CORS allowlist:**
```js
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
```
> A function origin checked against an env-driven allowlist, not `origin: '*'` —
> which is required anyway, because wildcard origin is incompatible with
> `credentials: true`.

`app.set('trust proxy', 1)`:
> Behind a host like Render, `req.ip` would be the proxy's IP. This tells Express
> to read the real client IP from `X-Forwarded-For` — essential for rate limiting
> and IP audit fields to mean anything.

---

## PART 4: Express & Node

### 4.1 `asyncHandler` — a favourite question

```js
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
```

**Q: Explain this in detail.**
> A higher-order function that wraps an async route handler. Express 4 doesn't
> catch rejected promises — an async handler that throws would hang the request
> forever. Wrapping in `Promise.resolve().catch(next)` forwards any rejection to
> Express's error middleware, so I don't need try/catch in 15 controllers.

**Q: Express 5 catches async errors natively — is this obsolete?**
> Express 5 does auto-forward rejections from async handlers, so strictly it's now
> redundant. I keep it because it's explicit and keeps controllers portable — but
> you're right that it's no longer load-bearing.

### 4.2 Error middleware

```js
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
```

**Q: How does Express know this is an error handler?**
> **Four parameters** — `(err, req, res, next)`. Express inspects arity. Drop
> `next` and it becomes a normal middleware and never receives errors.

**Q: The `res.statusCode === 200` line?**
> Controllers set the intended status before throwing (`res.status(409); throw
> new Error(...)`). If it's still 200, nobody set one, so it's an unexpected error
> → 500.

**Q: Why hide the stack in production?**
> Stack traces leak file paths, dependency versions, and internal structure —
> reconnaissance for an attacker. Dev gets the stack, prod gets the message.

**Q: Improvement?**
> Map known error types explicitly: Mongoose `ValidationError` → 400,
> `CastError` → 400 "invalid id", Mongo code 11000 → 409 duplicate. Right now
> those all fall through to 500 with a raw Mongo message.

### 4.3 Middleware order in `app.js`

**Q: Why does order matter?**
> Middleware is a sequential pipeline; each decides whether to call `next()`. So:
> raw body before `express.json()` (or the raw bytes are lost); `cookieParser`
> before CSRF and auth (both read cookies); routes before the 404 handler (or
> everything 404s); `errorHandler` last (it only receives errors passed down the
> chain).

### 4.4 `server.js` / `app.js` split

```js
connectDB().then(() => {
    seedCheckoutTemplates().catch((err) =>
        console.error("Checkout template seed error:", err.message)
    );
    startCronJobs();
});
app.listen(PORT, ...);
```

**Q: Why separate the files?**
> `app.js` builds a configured Express app and exports it; `server.js` handles
> the environment — DB, seeds, cron, listening. That makes `app` importable in
> tests with Supertest without opening a port or starting cron.

**Q: Why seed and cron **after** connectDB?**
> Both touch the database. Running them before the connection resolves would
> fail or silently buffer.

**Q: Why does the seed `.catch()` instead of crashing?**
> A failed default-template seed shouldn't stop the API from serving traffic. But
> a failed DB connection should — hence `process.exit(1)` there. Deliberate
> difference in failure severity.

### 4.5 `Promise.all` for parallel queries

`dashboard.controller.js` fires ~16 independent queries at once:

```js
const [ totalOrders, pendingOrders, /* ... */ ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "pending" }),
    // ...
]);
```

> These queries don't depend on each other, so awaiting them one by one would sum
> the latency. `Promise.all` issues them concurrently — total time is the slowest
> one, not the sum. With array destructuring the results stay readable.

**Q: `Promise.all` vs `Promise.allSettled`?**
> `Promise.all` rejects immediately if any promise rejects — right here, because a
> broken dashboard should error rather than render half the numbers.
> `Promise.allSettled` always resolves with per-item status, better when partial
> results are acceptable.

**Q: Downside?**
> 16 simultaneous queries consume 16 connections from the pool. Fine at this
> scale; at high traffic I'd cache the dashboard payload for 30–60 seconds since
> it doesn't need to be real-time.

### 4.6 Cron jobs

```js
cron.schedule("0 3 * * *", async () => { await cleanupUnverifiedUsers(); });
cron.schedule("*/30 * * * *", async () => { const result = await expirePendingOrders(); });
```

**Read cron syntax:** `minute hour day-of-month month day-of-week`.
`0 3 * * *` = 3:00 AM daily. `*/30 * * * *` = every 30 minutes.

```js
export const expirePendingOrders = async () => {
    const cutoff = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const staleOrders = await Order.find({
        orderStatus: "pending", paymentStatus: "pending",
        createdAt: { $lt: cutoff },
    });
    for (const order of staleOrders) {
        order.orderStatus = "expired";
        order.tracking.push({ status: "expired",
            message: "Order expired automatically after 5 hours without payment" });
        await order.save();
    }
    return { expired: staleOrders.length };
};
```

**Q: Why not one `updateMany`?**
> `updateMany` would be one round trip instead of N — but I need to `$push` a
> tracking entry per order and keep the audit trail, and looping keeps schema
> validation and hooks in play. If volume grew I'd switch to `bulkWrite`, which
> batches the updates in a single command.

**Q: Problem with in-process cron?**
> If I scale to multiple instances, **every instance runs every job** — duplicate
> work. The fix is a distributed lock, or moving to an external scheduler /
> queue like BullMQ with Redis. Worth naming this proactively; it shows you think
> about deployment.

---

## PART 5: Frontend (Next.js 16 / React 19)

### Concepts to be ready for

**Q: Why Next.js over plain React?**
> Server-side rendering and metadata for SEO — this is an e-commerce site that
> needs to rank for game names. Plus file-based routing, API-adjacent server
> code, image optimization, and code splitting out of the box.

**Q: App Router — Server vs Client Components?**
> In the App Router everything is a **Server Component** by default: it renders on
> the server, ships no JS for itself, and can fetch data directly. `"use client"`
> opts a component into the browser for state, effects, and event handlers. The
> pattern is to keep pages as Server Components and push interactivity down into
> small client leaves.

**Q: Route groups — what's `(user)`?**
> Parentheses create a **route group**: it organizes files and allows a shared
> layout without adding a URL segment. So `app/(user)/orders` is `/orders`, not
> `/user/orders`.

**Your frontend structure to describe:**
- `src/services/*` — one API module per domain (orders, games, payments, users…),
  so components never build URLs themselves
- `src/lib/http` — configured axios instance: base URL, `withCredentials` for
  cookies, CSRF header, interceptors
- `src/context` — React Context for auth/global state
- `src/hooks` — reusable logic
- `src/lib/seo` — metadata helpers
- Tiptap rich-text editor for blog authoring; DOMPurify to sanitize HTML before
  rendering; Recharts for dashboard charts; Embla/Swiper for carousels;
  Framer Motion for animation

**Q: Why DOMPurify?**
> Blog content is admin-authored HTML from Tiptap. Rendering it with
> `dangerouslySetInnerHTML` without sanitizing is a stored-XSS hole, so I run it
> through DOMPurify (isomorphic, so it works during SSR too) to strip scripts and
> event handlers.

**Q: How does the frontend authenticate?**
> It doesn't handle tokens at all — they're httpOnly cookies. Axios is configured
> with `withCredentials: true` so the browser attaches them. For mutations the
> client sends the CSRF token as a header. `GET /api/auth/me` resolves the
> current user, which is why it's exempted from CSRF: Next.js middleware calls it
> to gate routes.

---

## PART 6: Features You Built — the checklist

Interviewers ask "what did *you* do?" Have these ready.

**Auth & users**
- Email/password register with email verification (hashed tokens, 15-min expiry)
- Google OAuth login (`google-auth-library`, `@react-oauth/google`)
- JWT access + DB-backed rotating refresh tokens, httpOnly cookies
- Forgot/reset password with hashed, expiring tokens
- Resend-verification with a 2-minute throttle → 429
- Role-based access control (admin / user)
- Block/unblock users; blocked users rejected mid-session and sessions revoked
- `lastLoginAt` tracking; daily cleanup of unverified accounts

**Catalog**
- Games with categories, `paymentCategory`, popular flag, active/inactive status
- Per-game dynamic `requiredFields` (text/number/email/password/dropdown/tel) —
  drives the checkout form per game
- Region-based pricing (`regionPricing`: region, currency, symbol, price,
  discounted price) with `REGION_KEYS` enum
- Product variants
- Slugs via `slugify` for SEO URLs
- Search, multi-filter, sort, pagination
- Homepage top-6-per-category via `$setWindowFields` + `$rank`

**Orders & fulfilment**
- Order creation with product snapshot, embedded `userInputs`, `tracking` timeline
- Status machines: `orderStatus` (pending→paid→processing→completed/cancelled/
  failed/expired) and `paymentStatus` (pending/paid/failed/refunded)
- Structured delivery payload: credentials or redeem code, with `secret` flags for
  mask/reveal in the UI, steps, notice, `validUntil`
- Admin notes with read/cleared timestamps; completion proof upload
- External supplier integration (Gamers Workshop) — auto-place order, store
  external id/status, handle its webhook
- Auto-expire orders unpaid after 5 hours (cron)

**Payments**
- PayPal via `@paypal/paypal-server-sdk` + `@paypal/react-paypal-js`, with fee
  breakdown (`paymentBreakdown.paypal`: subtotal, processing fee, rate,
  min order)
- NOWPayments crypto, webhook verified with HMAC-SHA512
- UPI/UTR manual flow (`utrNumber`, `utrSubmittedAt`)
- Exchange rates + currency conversion; configurable payment settings

**Admin**
- Dashboard: order/user/revenue stats, `$facet` revenue rollups, recent orders,
  admin activity log, "action required" panel (stuck orders, pending payments,
  unverified users, failed payments), system health incl. `db.admin().ping()`
- Admin activity audit log (who did what, when, which module)
- Banner management, blog CMS with Tiptap, review moderation
- Checkout template management + seeding

**Media & infra**
- Cloudinary uploads via multer + streamifier (memory → stream, no disk writes)
- Image crop before upload (`react-easy-crop`)
- QR code generation
- Reviews with average rating and star distribution via aggregation
- SEO: sitemap, robots.txt, Google + Yandex site verification, metadata helpers

---

## PART 7: Rapid-Fire Q&A

**Q: What does MERN stand for?**
> MongoDB, Express, React, Node. Mine is MongoDB + Express + Next.js/React + Node.

**Q: Node is single-threaded — how does it handle concurrency?**
> One JS thread with an **event loop**. I/O — DB queries, HTTP calls, file reads —
> is delegated to the OS or libuv's thread pool, and callbacks are queued back
> when it completes. So thousands of concurrent I/O-bound requests are fine.
> CPU-bound work blocks the loop, which is why you offload it to a worker thread
> or a separate service.

**Q: `require` vs `import`?**
> CommonJS vs ES Modules. My backend is ESM (`"type": "module"` in package.json),
> so `import`/`export`. ESM is statically analysable and supports top-level await;
> CommonJS is dynamic and synchronous.

**Q: What's middleware?**
> A function `(req, res, next)` in the request pipeline. It can inspect or mutate
> the request, end the response, or call `next()` to continue. Mine: auth, role
> check, validation, rate limit, error handling.

**Q: PUT vs PATCH?**
> PUT replaces the whole resource; PATCH updates specified fields.

**Q: Status codes you use?**
> 200 OK, 201 Created, 400 bad input, 401 unauthenticated, 403 forbidden,
> 404 not found, 409 conflict (duplicate email), 429 too many requests,
> 500 server error.

**Q: How do you keep secrets out of the repo?**
> `dotenv` with a gitignored `.env` — Mongo URI, `JWT_SECRET`, PayPal creds,
> Cloudinary keys, `ALLOWED_ORIGINS`. Only env var *names* are in code.

**Q: `findOne` vs `findById`?**
> `findById(id)` is sugar for `findOne({ _id: id })`.

**Q: What's an ObjectId?**
> MongoDB's 12-byte default `_id`: 4-byte timestamp, 5-byte random per-process
> value, 3-byte counter. Roughly monotonic, so it sorts by creation time and is
> generated client-side without coordination.

**Q: `save()` vs `updateOne()`?**
> `save()` loads a document, mutates it, writes it back — runs validators and
> `pre('save')` hooks, so it's what I use for passwords and tracking pushes.
> `updateOne()` sends an update operation directly — one round trip, but it skips
> `save` hooks and by default skips validators.

**Q: Biggest challenge in this project?**
> Payment webhooks. Gateways retry, deliver out of order, and require signature
> verification over the exact raw body. I had to mount `express.raw()` before
> `express.json()` on just those paths, exempt them from CSRF while authenticating
> them by signature instead, and make handlers idempotent so a duplicate delivery
> doesn't double-process an order.

**Q: What would you improve?**
> Four things. (1) **Tests** — there are none; I'd add Jest + Supertest for auth
> and orders first. (2) **Error mapping** in `errorHandler` — Mongoose
> ValidationError/CastError/E11000 currently fall through to 500. (3) **Caching**
> — Redis for the dashboard and homepage, which are read-heavy and recomputed
> every request. (4) **Cron** — move to a queue so it survives multi-instance
> scaling.

---

## PART 8: Weak Spots — Prepare These Honestly

Don't get caught. Rehearse each.

**No tests.** `"test": "echo \"Error: no test specified\" && exit 1"`.
> Say: "No automated tests — that's the top gap. I tested manually. I'd start with
> Supertest integration tests on auth and order creation, since those carry the
> most risk."

**No transactions.** See §2.10. Frame as "single-doc atomicity + idempotency was
sufficient; here's when I'd need them."

**Only one validator file.** `middlewares/validators/` has just
`auth.validators.js`.
> Say: "Auth is validated with express-validator; other controllers validate
> inline plus Mongoose schema validation. Consolidating into a validator per
> route group is on my list."

**Duplicate indexes.** `unique: true` plus an explicit `.index()` on the same
field. Volunteer it — self-awareness reads as senior.

**No pagination on some list endpoints.** e.g. `getPopularGames` uses a hard
`.limit(20)`.

**`Promise.all` missing in a few places.** `getGames` awaits `find` then
`countDocuments` sequentially.

---

## PART 9: Study Plan

**Day 1 — Own the pitch and the map.** Recite Part 0 out loud until fluent. Draw
the folder structure and the request lifecycle from memory.

**Day 2 — MongoDB.** Read Part 2 top to bottom. Then open `models/user.model.js`
and `models/order.model.js` and explain every field aloud. Drill: indexes, ESR
rule, embed vs reference, `populate` = N+1 queries, `.lean()`.

**Day 3 — Aggregation.** Rewrite the three pipelines from memory. Be able to
explain `$facet`, `$setWindowFields`, `$$ROOT`, and the ObjectId casting gotcha
without notes.

**Day 4 — Auth.** Whiteboard the two-token flow and rotation. Explain every
cookie flag, CSRF, and why webhooks are exempt.

**Day 5 — Express/Node + weak spots.** `asyncHandler`, error middleware arity,
middleware order, event loop. Then rehearse Part 8 so no gap surprises you.

**Every day:** pick one random file, open it, explain it out loud as if to the
interviewer. Fluency beats recall.

---

## The Two Rules

1. **Never say "I don't know" alone.** Say what you *do* know, then "I haven't
   used X, but my understanding is…" Reasoning beats memorized facts.

2. **Every answer ends in your code.** Don't define JWT abstractly — say "in my
   project, `utils/token.js` signs a 15-minute access token with the user id and
   role, and…". That's what separates someone who built it from someone who read
   about it.
