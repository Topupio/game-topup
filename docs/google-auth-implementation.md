# Google Authentication Implementation Reference

## Overview

Google OAuth login for **users only** (not admins). Users can sign in/sign up with their Google account on `/login` and `/signup` pages. The admin login page (`/admin/login`) is untouched.

---

## How It Works (Flow)

```
1. User clicks "Sign in with Google" button
2. Google popup opens → user picks their Google account
3. Google returns an access_token to the frontend
4. Frontend sends access_token to POST /api/auth/google
5. Backend calls Google's userinfo API to verify the token & get user info
6. Backend finds or creates the user in MongoDB
7. Backend issues JWT access token + refresh token (same as normal login)
8. Frontend receives cookies, fetches /api/auth/me, sets user in context
```

---

## What Changed & Why

### Why we switched from `GoogleLogin` component to `useGoogleLogin` hook

The `@react-oauth/google` library provides two approaches:

| | `GoogleLogin` component | `useGoogleLogin` hook |
|---|---|---|
| **Renders** | Google's own pre-built button (loaded inside an **iframe** by Google Identity Services SDK) | Nothing - you provide your own button |
| **Styling** | Limited to `theme`, `size`, `shape` props. You **cannot** apply custom CSS because the button lives inside Google's iframe, outside your DOM | Full control - it's your own `<button>` element with your own Tailwind classes |
| **Returns** | `credential` (a Google ID Token JWT) | `access_token` (an OAuth access token) |
| **Backend verification** | Verify the JWT locally using `google-auth-library` | Call Google's userinfo API with the access token |

**We chose `useGoogleLogin`** because the default Google iframe button (blue rectangle with white "G") looked out of place against the app's dark theme. With the hook approach, we render a custom `<button>` styled with Tailwind that matches the rest of the UI.

### Backend verification change

Because `useGoogleLogin` returns an `access_token` (not an ID token JWT), the backend verification method changed:

**Before (ID token approach - never shipped to production):**
```js
// Verify JWT locally using Google's public keys
const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
});
const payload = ticket.getPayload();
```

**After (access token approach - current implementation):**
```js
// Call Google's userinfo API to verify token and get user info
const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
});
const payload = await googleRes.json();
```

Both approaches are secure. The access token approach makes one extra HTTP call to Google but gives us full UI control.

---

## Files Modified

### Backend

| File | Change |
|------|--------|
| `backend/models/user.model.js` | Added `authProvider` field (`"local"` or `"google"`), `googleId` field. Made `password` conditionally required (only when `authProvider === "local"`) |
| `backend/controllers/auth.controller.js` | Added `googleLogin` controller - verifies Google access token via userinfo API, finds/creates user, issues JWT pair |
| `backend/routes/auth.routes.js` | Added `POST /api/auth/google` route with rate limiting |
| `backend/.env` | Added `GOOGLE_CLIENT_ID` |
| `backend/.env.example` | Added `GOOGLE_CLIENT_ID` |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/providers/GoogleOAuthWrapper.tsx` | **New file** - Client component wrapping `GoogleOAuthProvider` (needed because root layout is a server component) |
| `frontend/src/app/layout.tsx` | Wrapped app with `GoogleOAuthWrapper` |
| `frontend/src/services/authApi.ts` | Added `googleLogin(accessToken)` API method |
| `frontend/src/context/AuthContext.tsx` | Added `googleLogin` to auth context type and provider |
| `frontend/src/app/login/page.tsx` | Replaced commented-out Google button with custom styled button using `useGoogleLogin` hook + `FcGoogle` icon |
| `frontend/src/app/signup/page.tsx` | Same as login page |
| `frontend/.env.local` | Added `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |

---

## User Model Schema Changes

```js
// New fields added to user.model.js
authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",       // existing users are "local" by default
},
googleId: {
    type: String,
    default: null,           // Google's unique user ID (sub claim)
},
password: {
    required: function() {
        return this.authProvider === "local";  // not required for Google users
    },
}
```

Existing users in the database are unaffected - `authProvider` defaults to `"local"` and `googleId` defaults to `null`.

---

## Conflict Handling

When a user tries Google login with an email that already exists via email/password registration:

- **Response:** `409` error - "This email is already registered with email/password. Please use your password to log in."
- **Reason:** Prevents account takeover. A Google account with the same email shouldn't automatically gain access to a password-protected account.

---

## Dependencies Added

| Package | Where | Purpose |
|---------|-------|---------|
| `@react-oauth/google` | Frontend | Google OAuth provider & `useGoogleLogin` hook |
| `google-auth-library` | Backend | Installed but not currently used (available if you want to switch to ID token verification later) |

---

## Google Cloud Console Setup

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add **Authorized JavaScript origins**: `http://localhost:3000` (+ production URL)
4. Copy the **Client ID** into both `GOOGLE_CLIENT_ID` (backend) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend)
5. **Client Secret is NOT needed** - this is a public client implicit flow
