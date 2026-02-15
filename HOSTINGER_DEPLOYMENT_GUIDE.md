# Hostinger VPS Deployment Guide — Game Top-Up Platform

## Tech Stack Overview

| Component | Stack |
|---|---|
| **Frontend** | Next.js 16 (React 19, TypeScript, Tailwind v4) |
| **Backend** | Express.js 5 (Node.js, ES modules) |
| **Database** | MongoDB Atlas (cloud) |
| **File Storage** | Cloudinary |
| **Email** | Resend + Nodemailer |

---

## Recommended Plan

**Hostinger VPS KVM 1** (~$5–7/mo)

- 1 vCPU, 4 GB RAM
- Full root SSH access
- Ubuntu 22.04
- Enough for both frontend and backend on one server

---

## Architecture

```
                    ┌─────────────────────────┐
   Internet ──────► │        Nginx            │
                    │   (reverse proxy + SSL) │
                    └────┬──────────┬─────────┘
                         │          │
                    port 3000   port 3001
                         │          │
                    ┌────▼───┐ ┌────▼────┐
                    │Next.js │ │Express  │
                    │Frontend│ │Backend  │
                    └────────┘ └─────────┘
                                    │
                              MongoDB Atlas
                              (cloud, free)
```

- **Nginx** — reverse proxy, routes traffic to Next.js and Express
- **PM2** — process manager, keeps both apps alive
- **Let's Encrypt** — free SSL via Certbot

---

## External Services (No Change Needed)

| Service | Hosted On | Free Tier |
|---|---|---|
| MongoDB Atlas | Cloud | 512 MB storage |
| Cloudinary | Cloud | 25 GB storage |
| Resend | Cloud | 100 emails/day |

These are API-based services your backend already calls. They work from any server.

---

## Step-by-Step Deployment

### 1. Purchase & Setup VPS

- Go to [hostinger.com](https://www.hostinger.com) → VPS Hosting → KVM 1
- Pick a server region close to your target users
- Select **Ubuntu 22.04** as the OS
- Set a root password and note your server IP

### 2. SSH Into the Server

```bash
ssh root@YOUR_SERVER_IP
```

### 3. Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

### 4. Clone Your Repository

```bash
mkdir -p /var/www
cd /var/www
git clone YOUR_REPO_URL game-topup
```

### 5. Setup Backend (Express)

```bash
cd /var/www/game-topup/backend
npm install
```

Create the environment file:

```bash
nano .env
```

Add your environment variables:

```env
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://YOUR_ATLAS_CONNECTION_STRING
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
REFRESH_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_key
ALLOWED_ORIGINS=https://yourdomain.com
```

Start with PM2:

```bash
pm2 start npm --name "backend" -- start
```

### 6. Setup Frontend (Next.js)

```bash
cd /var/www/game-topup/frontend
npm install
```

Create the environment file:

```bash
nano .env.local
```

```env
NEXT_PUBLIC_API_BASE=https://yourdomain.com
```

Build and start:

```bash
npm run build
pm2 start npm --name "frontend" -- start
```

### 7. Configure PM2 to Auto-Start on Reboot

```bash
pm2 save
pm2 startup
```

### 8. Configure Nginx

Create the Nginx config:

```bash
nano /etc/nginx/sites-available/game-topup
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (Next.js on port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Express on port 3001)
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the config:

```bash
ln -s /etc/nginx/sites-available/game-topup /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 9. Setup SSL (HTTPS)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot auto-renews. Verify with:

```bash
certbot renew --dry-run
```

### 10. Point Your Domain

In your domain registrar (or Hostinger DNS):

| Type | Name | Value |
|---|---|---|
| A | @ | YOUR_SERVER_IP |
| A | www | YOUR_SERVER_IP |

---

## Useful PM2 Commands

```bash
pm2 list                # See running processes
pm2 logs                # View logs for all apps
pm2 logs backend        # View backend logs only
pm2 restart all         # Restart all apps
pm2 restart frontend    # Restart frontend only
pm2 monit               # Real-time monitoring
```

---

## Redeployment (After Code Changes)

```bash
cd /var/www/game-topup
git pull

# Backend
cd backend
npm install
pm2 restart backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart frontend
```

---

## Cost Breakdown

| Item | Monthly Cost |
|---|---|
| Hostinger VPS KVM 1 | ~$5–7 |
| MongoDB Atlas (free tier) | $0 |
| Cloudinary (free tier) | $0 |
| Resend (free tier) | $0 |
| SSL (Let's Encrypt) | $0 |
| **Total** | **~$5–7/mo** |

---

## VPS vs Vercel Comparison

| | Vercel | Hostinger VPS |
|---|---|---|
| **Frontend** | Auto-deployed | Manual (PM2 + Nginx) |
| **Backend** | Cannot host Express | Runs natively |
| **Cost** | Free tier limits, then $20/mo | ~$5–7/mo for everything |
| **SSL** | Automatic | Certbot (one-time setup) |
| **Scaling** | Auto | Upgrade VPS plan |
| **DevOps effort** | Zero | Moderate (initial setup) |
| **CI/CD** | Git push auto-deploy | Manual or webhooks |

---

## Hybrid Option

Keep **frontend on Vercel** (free) and only host the **backend on Hostinger VPS**. This gives you:

- Zero-config frontend deploys via git push
- Cheap backend hosting with full control
- Best of both worlds

---

## CI/CD Auto-Deploy (GitHub Actions)

A GitHub Actions workflow is set up at `.github/workflows/deploy.yml` that auto-deploys on every push to `main`.

### Required GitHub Secrets

Go to **Settings → Secrets → Actions** in your GitHub repo and add:

| Secret Name | Value |
|---|---|
| `VPS_HOST` | Your server IP |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | SSH private key (generated on VPS) |

### Generate SSH Key on VPS

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions   # ← copy this as VPS_SSH_KEY secret
```

### Workflow

On every `git push origin main`, GitHub Actions will:

1. SSH into VPS
2. `git pull` latest code
3. Install dependencies
4. Build frontend
5. Restart backend & frontend via PM2

Monitor deployments at: `https://github.com/ajmal1722/game-topup/actions`

